import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import whatsappRoutes from './server/routes/whatsappRoutes';
import attendanceAlertRoutes from './server/routes/attendanceAlertRoutes';
import idleAlertRoutes from './server/routes/idleAlertRoutes';
import welcomeMessageRoutes from './server/routes/welcomeMessageRoutes';
import candidateRoutes from './server/routes/candidateRoutes';
import { db } from './server/database/firebaseAdmin';
import { WhatsAppService } from './server/services/whatsappService';
import { AttendanceAlertService } from './server/services/attendanceAlertService';
import { IdleAlertService } from './server/services/idleAlertService';

async function startServer() {
  console.log('[Server] Starting server...');
  const app = express();
  const PORT = 3000;
  console.log('[Server] Port:', PORT);

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
    
    // Auto-reconnect existing sessions after startup
    (async () => {
      try {
        const snapshot = await db.collection('whatsapp_accounts').where('status', '==', 'connected').get();
        for (const doc of snapshot.docs) {
          const account = doc.data();
          console.log(`Auto-reconnecting WhatsApp for company: ${account.companyId}`);
          WhatsAppService.connect(account.companyId, () => {}, () => {}).catch(err => {
            console.error(`Failed to auto-reconnect for ${account.companyId}:`, err);
          });
        }
      } catch (err) {
        console.error('Failed to initialize auto-reconnection:', err);
      }
    })();
  });
}

startServer().catch(console.error);
