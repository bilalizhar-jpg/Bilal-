import makeWASocket, { 
  useMultiFileAuthState, 
  DisconnectReason, 
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  AuthenticationState,
  Browsers
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import db from '../database/db';
import path from 'path';
import fs from 'fs/promises';
import QRCode from 'qrcode';

const logger = pino({ level: 'silent' });
const sessions = new Map<string, any>();
const qrCodes = new Map<string, string>();

export class WhatsAppService {
  static async getSessionPath(companyId: string) {
    const sessionDir = path.resolve(process.cwd(), 'sessions', companyId);
    await fs.mkdir(sessionDir, { recursive: true });
    return sessionDir;
  }

  static async connect(companyId: string, onQR: (qr: string) => void, onConnected: () => void) {
    if (sessions.has(companyId)) {
      const socket = sessions.get(companyId);
      if (socket.user) {
        onConnected();
        return;
      }
    }

    const sessionPath = await this.getSessionPath(companyId);
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      logger,
      browser: Browsers.ubuntu('Chrome'),
    });

    sessions.set(companyId, sock);

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        const qrBase64 = await QRCode.toDataURL(qr);
        qrCodes.set(companyId, qrBase64);
        onQR(qrBase64);
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log(`Connection closed for ${companyId}. Reconnecting: ${shouldReconnect}`);
        
        if (shouldReconnect) {
          this.connect(companyId, onQR, onConnected);
        } else {
          sessions.delete(companyId);
          qrCodes.delete(companyId);
          db.prepare('UPDATE whatsapp_accounts SET status = ? WHERE company_id = ?').run('disconnected', companyId);
          await fs.rm(sessionPath, { recursive: true, force: true });
        }
      } else if (connection === 'open') {
        console.log(`WhatsApp connected for company: ${companyId}`);
        qrCodes.delete(companyId);
        db.prepare('INSERT OR REPLACE INTO whatsapp_accounts (company_id, status) VALUES (?, ?)').run(companyId, 'connected');
        onConnected();
      }
    });

    return sock;
  }

  static async getStatus(companyId: string) {
    const socket = sessions.get(companyId);
    const qr = qrCodes.get(companyId);
    
    if (socket?.user) return { status: 'connected' };
    if (qr) return { status: 'qr_ready', qr };
    
    const row = db.prepare('SELECT status FROM whatsapp_accounts WHERE company_id = ?').get(companyId) as any;
    return { status: row?.status || 'disconnected' };
  }

  static async disconnect(companyId: string) {
    const socket = sessions.get(companyId);
    if (socket) {
      try {
        // Try to end the session gracefully
        await socket.end(undefined);
      } catch (e) {
        console.error('Socket end error:', e);
      }
      sessions.delete(companyId);
      qrCodes.delete(companyId);
    }
    
    try {
      const sessionPath = await this.getSessionPath(companyId);
      await fs.rm(sessionPath, { recursive: true, force: true });
    } catch (e) {
      console.error('Session path removal error:', e);
    }
    
    db.prepare('UPDATE whatsapp_accounts SET status = ? WHERE company_id = ?').run('disconnected', companyId);
  }

  static async sendMessage(companyId: string, toNumber: string, message: string) {
    let socket = sessions.get(companyId);
    
    // If socket doesn't exist or isn't connected, try to reconnect if session exists
    if (!socket || !socket.user) {
      console.log(`Socket not ready for ${companyId}, attempting quick reconnect...`);
      socket = await this.connect(companyId, () => {}, () => {});
      
      // Wait a bit for connection to open
      let retries = 0;
      while (!socket.user && retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        retries++;
      }
    }

    if (!socket || !socket.user) {
      throw new Error('WhatsApp not connected. Please scan the QR code again.');
    }

    // Format number: remove non-digits, ensure it doesn't have @s.whatsapp.net already
    let cleanNumber = toNumber.replace(/\D/g, '');
    if (!cleanNumber) throw new Error('Invalid phone number');
    
    const formattedNumber = cleanNumber + '@s.whatsapp.net';
    
    // Log message to DB
    const stmt = db.prepare('INSERT INTO whatsapp_messages (company_id, to_number, message, status) VALUES (?, ?, ?, ?)');
    const info = stmt.run(companyId, toNumber, message, 'pending');
    const messageId = info.lastInsertRowid;

    try {
      // Delay system (1-3 sec for test/immediate feel, but keeping some delay)
      const delay = Math.floor(Math.random() * 2000) + 1000;
      await new Promise(resolve => setTimeout(resolve, delay));

      console.log(`Sending message to ${formattedNumber}...`);
      await socket.sendMessage(formattedNumber, { text: message });
      
      db.prepare('UPDATE whatsapp_messages SET status = ?, response_log = ? WHERE id = ?')
        .run('sent', 'Success', messageId);
      
      return { success: true, messageId };
    } catch (error: any) {
      console.error('Send message error:', error);
      db.prepare('UPDATE whatsapp_messages SET status = ?, response_log = ? WHERE id = ?')
        .run('failed', error.message, messageId);
      throw error;
    }
  }
}
