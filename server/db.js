import Database from 'better-sqlite3';
import { join, dirname, isAbsolute } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultDbPath = join(__dirname, 'data', 'musicstudio.sqlite');
const dbPath = process.env.DB_PATH ? (isAbsolute(process.env.DB_PATH) ? process.env.DB_PATH : join(process.cwd(), process.env.DB_PATH)) : defaultDbPath;
const dbDir = dirname(dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL,
 email TEXT UNIQUE NOT NULL,
 password TEXT NOT NULL,
 role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','admin')),
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS studios (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL,
 description TEXT,
 price_per_hour REAL NOT NULL,
 image_url TEXT,
 equipment TEXT,
 status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available','maintenance')),
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS bookings (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER NOT NULL,
 studio_id INTEGER NOT NULL,
 date TEXT NOT NULL,
 start_time TEXT NOT NULL,
 end_time TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','completed','cancelled')),
 total_price REAL NOT NULL,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(studio_id) REFERENCES studios(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS settings (
 key TEXT PRIMARY KEY,
 value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS notifications (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 type TEXT NOT NULL DEFAULT 'alert',
 title TEXT NOT NULL,
 message TEXT NOT NULL,
 read INTEGER NOT NULL DEFAULT 0,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS payments (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 booking_id INTEGER NOT NULL UNIQUE,
 method TEXT NOT NULL,
 amount REAL NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','rejected')),
 proof_url TEXT,
 note TEXT,
 paid_at DATETIME,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);
`);

const cols = db.prepare('PRAGMA table_info(studios)').all().map(c => c.name);
if (!cols.includes('status')) db.exec("ALTER TABLE studios ADD COLUMN status TEXT NOT NULL DEFAULT 'available'");
const userCols = db.prepare('PRAGMA table_info(users)').all().map(c => c.name);
if (!userCols.includes('created_at')) db.exec("ALTER TABLE users ADD COLUMN created_at TEXT");

const notificationCount = db.prepare('SELECT COUNT(*) count FROM notifications').get().count;
if (!notificationCount) {
  const add = db.prepare('INSERT INTO notifications(type,title,message,read) VALUES(?,?,?,?)');
  add.run('alert','ระบบพร้อมใช้งาน','Music Studio พร้อมรับการจองและจัดการจาก Admin',0);
}

export default db;
