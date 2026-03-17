import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import whatsappRoutes from './server/routes/whatsappRoutes';
import db from './server/database/db';
import { WhatsAppService } from './server/services/whatsappService';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use('/api/whatsapp', whatsappRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'connected' });
  });

  // Auto-reconnect existing sessions on startup
  const activeAccounts = db.prepare("SELECT company_id FROM whatsapp_accounts WHERE status = 'connected'").all() as any[];
  for (const account of activeAccounts) {
    console.log(`Auto-reconnecting WhatsApp for company: ${account.company_id}`);
    WhatsAppService.connect(account.company_id, () => {}, () => {});
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
