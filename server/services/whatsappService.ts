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
import { db } from '../database/firebaseAdmin';
import path from 'path';
import fs from 'fs/promises';
import QRCode from 'qrcode';
const logger = pino({ level: 'silent' });
const sessions = new Map<string, any>();
const qrCodes = new Map<string, string>();
const messageQueues = new Map<string, { toNumber: string; message: string; messageId: string }[]>();
const processingQueues = new Map<string, boolean>();

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
        return socket;
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
          
          const snapshot = await db.collection('whatsapp_accounts').where('companyId', '==', companyId).get();
          for (const doc of snapshot.docs) {
            await doc.ref.update({ status: 'disconnected' });
          }
          
          await fs.rm(sessionPath, { recursive: true, force: true });
        }
      } else if (connection === 'open') {
        console.log(`WhatsApp connected for company: ${companyId}`);
        qrCodes.delete(companyId);
        
        const snapshot = await db.collection('whatsapp_accounts').where('companyId', '==', companyId).get();
        if (snapshot.empty) {
          await db.collection('whatsapp_accounts').add({ companyId, status: 'connected', createdAt: new Date().toISOString() });
        } else {
          await snapshot.docs[0].ref.update({ status: 'connected' });
        }
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
    
    const snapshot = await db.collection('whatsapp_accounts').where('companyId', '==', companyId).get();
    const row = snapshot.empty ? null : snapshot.docs[0].data();
    return { status: row?.status || 'disconnected' };
  }

  static async disconnect(companyId: string) {
    const socket = sessions.get(companyId);
    if (socket) {
      try {
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
    
    const snapshot = await db.collection('whatsapp_accounts').where('companyId', '==', companyId).get();
    for (const doc of snapshot.docs) {
      await doc.ref.update({ status: 'disconnected' });
    }
  }

  static async sendMessage(companyId: string, toNumber: string, message: string) {
    // Log message to DB first
    const docRef = await db.collection('whatsapp_messages').add({
      companyId,
      toNumber,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    const messageId = docRef.id;

    // Add to queue
    if (!messageQueues.has(companyId)) {
      messageQueues.set(companyId, []);
    }
    messageQueues.get(companyId)!.push({ toNumber, message, messageId });

    // Start processing if not already
    this.processQueue(companyId);

    return { success: true, messageId, status: 'queued' };
  }

  private static async processQueue(companyId: string) {
    if (processingQueues.get(companyId)) return;
    processingQueues.set(companyId, true);

    while (messageQueues.get(companyId) && messageQueues.get(companyId)!.length > 0) {
      const item = messageQueues.get(companyId)!.shift()!;
      const { toNumber, message, messageId } = item;

      try {
        let socket = sessions.get(companyId);
        
        if (!socket || !socket.user) {
          console.log(`[Queue] Reconnecting for ${companyId}...`);
          socket = await this.connect(companyId, () => {}, () => {});
          let retries = 0;
          while (!socket.user && retries < 15) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries++;
          }
        }

        if (!socket || !socket.user) {
          throw new Error('WhatsApp not connected');
        }

        let cleanNumber = toNumber.replace(/\D/g, '');
        if (!cleanNumber) throw new Error('Invalid phone number');
        const formattedNumber = cleanNumber + '@s.whatsapp.net';

        // Anti-ban delay between messages in queue (2-5 seconds)
        const delay = Math.floor(Math.random() * 3000) + 2000;
        await new Promise(resolve => setTimeout(resolve, delay));

        console.log(`[Queue] Sending to ${formattedNumber}...`);
        await socket.sendMessage(formattedNumber, { text: message });
        
        await db.collection('whatsapp_messages').doc(messageId).update({
          status: 'sent',
          responseLog: 'Success'
        });
      } catch (error: any) {
        console.error(`[Queue] Failed for ${toNumber}:`, error.message);
        await db.collection('whatsapp_messages').doc(messageId).update({
          status: 'failed',
          responseLog: error.message
        });
      }
    }

    processingQueues.set(companyId, false);
  }
}
