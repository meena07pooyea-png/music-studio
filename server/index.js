import express from 'express';
import session from 'express-session';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db from './db.js';
import authRoutes from './routes/auth.js';
import studioRoutes from './routes/studios.js';
import bookingRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT || process.env.API_PORT || 3001);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '';

if (isProduction && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is required in production.');
}
if (isProduction && !process.env.ADMIN_PASSWORD) {
  throw new Error('ADMIN_PASSWORD is required in production.');
}

app.set('trust proxy', isProduction ? 1 : 0);

if (CLIENT_ORIGIN) {
  const allowedOrigins = CLIENT_ORIGIN.split(',').map(v => v.trim()).filter(Boolean);
  app.use(cors({ origin: allowedOrigins, credentials: true }));
}

app.use(express.json({ limit: '2mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'local-only-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  },
}));

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@musicstudio.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';

async function setup() {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(ADMIN_EMAIL);
  if (!existing) {
    const password = await bcrypt.hash(ADMIN_PASSWORD, 12);
    db.prepare('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)')
      .run('Music Studio Admin', ADMIN_EMAIL, password, 'admin');
    console.log(`Admin created: ${ADMIN_EMAIL}`);
  }

  const count = db.prepare('SELECT COUNT(*) count FROM studios').get().count;
  if (!count) {
    const insert = db.prepare('INSERT INTO studios (name,description,price_per_hour,equipment) VALUES (?,?,?,?)');
    insert.run('Rock Room', 'ห้องขนาดใหญ่สำหรับวงดนตรีร็อค', 300, 'กลองชุด, แอมป์กีตาร์ 2, แอมป์เบส, ไมค์ 3');
    insert.run('Jazz Room', 'ห้องบรรยากาศอบอุ่นสำหรับแจ๊สและวงขนาดเล็ก', 250, 'เปียโนไฟฟ้า, แอมป์กีตาร์, แอมป์เบส, ไมค์ 2');
    insert.run('Acoustic Room', 'ห้องสำหรับอะคูสติกและงานร้องเพลง', 200, 'แอมป์อะคูสติก, ไมค์ 2, คาฮอง');
  }
}

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'Music Studio API' }));
app.use('/api/auth', authRoutes);
app.use('/api/studios', studioRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// In production, serve the Vite build from the same Express service.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../dist');
if (isProduction) {
  app.use(express.static(distPath));
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

setup().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Music Studio listening on 0.0.0.0:${PORT}`);
  });
}).catch((error) => {
  console.error('Startup failed:', error);
  process.exit(1);
});
