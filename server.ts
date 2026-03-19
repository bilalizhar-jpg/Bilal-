import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { OAuth2Client } from 'google-auth-library';
import { User, Employee, AuditLog, TimeTracking, GenericEntity } from './src/server/models.js';
import candidateRoutes from './server/routes/candidateRoutes';
import welcomeMessageRoutes from './server/routes/welcomeMessageRoutes';
import attendanceAlertRoutes from './server/routes/attendanceAlertRoutes';
import idleAlertRoutes from './server/routes/idleAlertRoutes';
import whatsappRoutes from './server/routes/whatsappRoutes';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}_${(file.originalname || 'file').replace(/[^a-zA-Z0-9.-]/g, '_')}`),
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(uploadsDir));

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware to verify JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// File upload (e.g. CV, screenshots) – token optional so public Apply page can upload
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

// Candidate CV upload + AI parse (PDF/DOCX → candidates collection)
app.use('/api/candidates', candidateRoutes);
// Alerts & messaging (use Mongoose via firebaseAdmin adapter)
app.use('/api/welcome-messages', welcomeMessageRoutes);
app.use('/api/attendance-alerts', attendanceAlertRoutes);
app.use('/api/idle-alerts', idleAlertRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Google Sign-In: verify id_token and return JWT + user
app.post('/api/auth/google', express.json(), async (req, res) => {
  const { idToken } = req.body || {};
  if (!idToken || !GOOGLE_CLIENT_ID) {
    return res.status(400).json({ message: 'Missing idToken or GOOGLE_CLIENT_ID not configured' });
  }
  try {
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload || !payload.sub) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }
    const uid = payload.sub;
    const email = payload.email || '';
    const name = payload.name || payload.email || 'User';
    const picture = payload.picture;
    const role = email === 'bilal.izhar@algorepublic.com' ? 'superadmin' : 'admin';
    const userData = {
      id: uid,
      name,
      email,
      role,
      avatar: picture,
      lastLogin: new Date().toISOString(),
    };
    const updated = await User.findOneAndUpdate(
      { id: uid },
      userData,
      { new: true, upsert: true }
    ).exec();
    const token = jwt.sign({ uid: updated.id, email: updated.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      ...updated.toObject(),
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(401).json({ message: 'Invalid or expired Google token' });
  }
});

// Generic CRUD Routes
const getModel = (collectionName: string) => {
  switch (collectionName) {
    case 'users': return User;
    case 'employees': return Employee;
    case 'auditLogs': return AuditLog;
    case 'timeTracking': return TimeTracking;
    default: 
      return GenericEntity;
  }
};

app.get('/api/:collection', authenticateToken, async (req: any, res) => {
  const { collection } = req.params;
  const { companyId, ...filters } = req.query;
  const Model = getModel(collection) as any;

  try {
    const query: any = { ...filters };
    if (companyId) query.companyId = companyId;
    if (Model === GenericEntity) query.collectionName = collection;
    
    const data = await Model.find(query).exec();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/:collection/:id', authenticateToken, async (req: any, res) => {
  const { collection, id } = req.params;
  const Model = getModel(collection) as any;

  try {
    const data = await Model.findOne({ id }).exec();
    if (!data) return res.status(404).json({ message: 'Not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/:collection', authenticateToken, async (req: any, res) => {
  const { collection } = req.params;
  const Model = getModel(collection) as any;
  try {
    const body = { ...req.body };
    if (Model === GenericEntity) body.collectionName = collection;
    
    if (!body.id && body._id) body.id = body._id;

    const newData = new Model(body);
    await newData.save();
    
    let responseData: any = newData.toObject();
    if (collection === 'users') {
      const token = jwt.sign({ uid: (body.id ?? body.uid), email: body.email }, JWT_SECRET, { expiresIn: '7d' });
      responseData.token = token;
    }
    
    res.status(201).json(responseData);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/api/:collection/:id', authenticateToken, async (req: any, res) => {
  const { collection, id } = req.params;
  const Model = getModel(collection) as any;
  try {
    const updatedData = await Model.findOneAndUpdate({ id }, req.body, { new: true, upsert: true }).exec();
    let responseData: any = updatedData.toObject();
    
    if (collection === 'users') {
      const token = jwt.sign({ uid: updatedData.id || updatedData.uid, email: updatedData.email }, JWT_SECRET, { expiresIn: '7d' });
      responseData.token = token;
    }
    
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete('/api/:collection/:id', authenticateToken, async (req: any, res) => {
  const { collection, id } = req.params;
  const Model = getModel(collection) as any;
  try {
    await Model.findOneAndDelete({ id }).exec();
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Vite middleware for development
async function startServer() {
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

startServer();
