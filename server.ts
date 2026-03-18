import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import whatsappRoutes from './server/routes/whatsappRoutes';
import attendanceAlertRoutes from './server/routes/attendanceAlertRoutes';
import idleAlertRoutes from './server/routes/idleAlertRoutes';
import welcomeMessageRoutes from './server/routes/welcomeMessageRoutes';
import candidateRoutes from './server/routes/candidateRoutes';
import db from './server/database/db';
import { WhatsAppService } from './server/services/whatsappService';
import { AttendanceAlertService } from './server/services/attendanceAlertService';
import { IdleAlertService } from './server/services/idleAlertService';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use('/api/whatsapp', whatsappRoutes);
  app.use('/api/attendance-alerts', attendanceAlertRoutes);
  app.use('/api/idle-alerts', idleAlertRoutes);
  app.use('/api/welcome-messages', welcomeMessageRoutes);
  app.use('/api/candidates', candidateRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    console.log('[API] Health check requested');
    res.json({ status: 'ok', database: 'connected' });
  });

  // Test route
  app.get('/api/test', (req, res) => {
    console.log('[API] Test route requested');
    res.json({ message: 'API is working' });
  });

  // Initialize Services
  AttendanceAlertService.init();
  IdleAlertService.init();

  // Auto-reconnect existing sessions on startup
  try {
    const activeAccounts = db.prepare("SELECT company_id FROM whatsapp_accounts WHERE status = 'connected'").all() as any[];
    for (const account of activeAccounts) {
      console.log(`Auto-reconnecting WhatsApp for company: ${account.company_id}`);
      WhatsAppService.connect(account.company_id, () => {}, () => {}).catch(err => {
        console.error(`Failed to auto-reconnect for ${account.company_id}:`, err);
      });
    }
  } catch (err) {
    console.error('Failed to initialize auto-reconnection:', err);
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
