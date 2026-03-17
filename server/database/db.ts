import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'whatsapp.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS whatsapp_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT UNIQUE,
    session_data TEXT,
    status TEXT DEFAULT 'disconnected',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT,
    to_number TEXT,
    message TEXT,
    status TEXT DEFAULT 'pending',
    response_log TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;
