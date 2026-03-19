import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import { User, Employee, AuditLog, TimeTracking, GenericEntity } from './src/server/models.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware to verify JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // If no token, we might still allow some routes or check for Firebase token
    // For now, let's just pass through if we're in development or if we want to allow initial setup
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

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
      const token = jwt.sign({ uid: body.uid, email: body.email }, JWT_SECRET, { expiresIn: '7d' });
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
      const token = jwt.sign({ uid: updatedData.uid, email: updatedData.email }, JWT_SECRET, { expiresIn: '7d' });
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
