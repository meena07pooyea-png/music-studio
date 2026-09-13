import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';

const router = express.Router();
const guard = (req, res, next) => {
  if (req.session.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
};
router.use(guard);

const getSetting = (key, fallback = '') => {
  const row = db.prepare('SELECT value FROM settings WHERE key=?').get(key);
  return row ? row.value : fallback;
};
const setSetting = (key, value) => {
  db.prepare(`INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run(key, String(value));
};

router.get('/customers', (_req, res) => {
  res.json(db.prepare(`
    SELECT u.id,u.name,u.email,u.created_at,
      COUNT(b.id) booking_count,
      COALESCE(SUM(CASE WHEN b.status IN ('confirmed','completed') THEN b.total_price ELSE 0 END),0) total_spent
    FROM users u
    LEFT JOIN bookings b ON b.user_id=u.id
    WHERE u.role='user'
    GROUP BY u.id ORDER BY u.created_at DESC
  `).all());
});

router.get('/dashboard', (_req, res) => {
  const users = db.prepare("SELECT COUNT(*) count FROM users WHERE role='user'").get().count;
  const studios = db.prepare('SELECT COUNT(*) count FROM studios').get().count;
  const bookings = db.prepare('SELECT COUNT(*) count FROM bookings').get().count;
  const pending = db.prepare("SELECT COUNT(*) count FROM bookings WHERE status='pending'").get().count;
  const pendingPayments = db.prepare("SELECT COUNT(*) count FROM payments WHERE status='pending'").get().count;
  const confirmed = db.prepare("SELECT COUNT(*) count FROM bookings WHERE status IN ('confirmed','completed')").get().count;
  const revenue = db.prepare("SELECT COALESCE(SUM(amount),0) total FROM payments WHERE status='paid'").get().total;
  const availableRooms = db.prepare("SELECT COUNT(*) count FROM studios WHERE status='available'").get().count;
  const recentBookings = db.prepare(`
    SELECT b.id,b.date,b.start_time,b.end_time,b.total_price,b.status,
      u.name user_name,s.name studio_name,
      COALESCE(p.status,'unpaid') payment_status
    FROM bookings b
    JOIN users u ON u.id=b.user_id
    JOIN studios s ON s.id=b.studio_id
    LEFT JOIN payments p ON p.booking_id=b.id
    ORDER BY b.created_at DESC LIMIT 8
  `).all();
  const monthly = db.prepare(`
    SELECT substr(date,1,7) month,
      COUNT(*) bookings,
      COALESCE(SUM(CASE WHEN status IN ('confirmed','completed') THEN total_price ELSE 0 END),0) revenue
    FROM bookings GROUP BY substr(date,1,7) ORDER BY month DESC LIMIT 6
  `).all().reverse();
  res.json({ users, studios, bookings, pending, pendingPayments, confirmed, revenue, availableRooms, recentBookings, monthly });
});

router.get('/calendar', (_req, res) => res.json(db.prepare(`
  SELECT b.*,s.name studio_name,u.name user_name,u.email user_email
  FROM bookings b JOIN studios s ON s.id=b.studio_id JOIN users u ON u.id=b.user_id
  WHERE b.status!='cancelled' ORDER BY b.date,b.start_time
`).all()));

router.get('/reports', (_req, res) => res.json(db.prepare(`
  SELECT date,COUNT(*) bookings,
    COALESCE(SUM(CASE WHEN status IN ('confirmed','completed') THEN total_price ELSE 0 END),0) revenue
  FROM bookings GROUP BY date ORDER BY date DESC LIMIT 31
`).all()));

router.get('/notifications', (_req, res) => {
  res.json(db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50').all());
});

router.patch('/notifications/:id/read', (req, res) => {
  const result = db.prepare('UPDATE notifications SET read=1 WHERE id=?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'ไม่พบการแจ้งเตือน' });
  res.json({ message: 'อ่านแล้ว' });
});

router.patch('/notifications/read-all', (_req, res) => {
  db.prepare('UPDATE notifications SET read=1').run();
  res.json({ message: 'อ่านทั้งหมดแล้ว' });
});

router.delete('/notifications/:id', (req, res) => {
  const result = db.prepare('DELETE FROM notifications WHERE id=?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'ไม่พบการแจ้งเตือน' });
  res.json({ message: 'ลบการแจ้งเตือนแล้ว' });
});

router.get('/settings', (_req, res) => {
  res.json({
    profile: {
      name: getSetting('admin_name', 'Music Studio Admin'),
      email: getSetting('admin_email', 'admin@musicstudio.local'),
      phone: getSetting('admin_phone', ''),
    },
    studio: {
      name: getSetting('studio_name', 'Music Studio'),
      address: getSetting('studio_address', ''),
      phone: getSetting('studio_phone', ''),
      email: getSetting('studio_email', ''),
      openTime: getSetting('studio_open_time', '08:00'),
      closeTime: getSetting('studio_close_time', '23:00'),
      description: getSetting('studio_description', ''),
    },
    pricing: {
      basePrice: Number(getSetting('pricing_base', '300')),
      weekendMarkup: Number(getSetting('pricing_weekend_markup', '20')),
      depositPercent: Number(getSetting('pricing_deposit', '30')),
      minHours: Number(getSetting('pricing_min_hours', '1')),
      maxHours: Number(getSetting('pricing_max_hours', '8')),
    },
    payments: {
      scb: getSetting('payment_scb', 'true') === 'true',
      kbank: getSetting('payment_kbank', 'true') === 'true',
      bbl: getSetting('payment_bbl', 'false') === 'true',
      ttb: getSetting('payment_ttb', 'false') === 'true',
      promptpay: getSetting('payment_promptpay', 'true') === 'true',
      accountName: getSetting('payment_account_name', ''),
      accountNumber: getSetting('payment_account_number', ''),
    },
  });
});

router.put('/settings', (req, res) => {
  const { profile = {}, studio = {}, pricing = {}, payments = {} } = req.body || {};
  const values = {
    admin_name: profile.name, admin_email: profile.email, admin_phone: profile.phone,
    studio_name: studio.name, studio_address: studio.address, studio_phone: studio.phone,
    studio_email: studio.email, studio_open_time: studio.openTime, studio_close_time: studio.closeTime,
    studio_description: studio.description, pricing_base: pricing.basePrice,
    pricing_weekend_markup: pricing.weekendMarkup, pricing_deposit: pricing.depositPercent,
    pricing_min_hours: pricing.minHours, pricing_max_hours: pricing.maxHours,
    payment_scb: payments.scb, payment_kbank: payments.kbank, payment_bbl: payments.bbl,
    payment_ttb: payments.ttb, payment_promptpay: payments.promptpay,
    payment_account_name: payments.accountName, payment_account_number: payments.accountNumber,
  };
  const tx = db.transaction(() => Object.entries(values).forEach(([key, value]) => setSetting(key, value ?? '')));
  tx();
  res.json({ message: 'บันทึกการตั้งค่าสำเร็จ' });
});

router.put('/profile', async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body || {};
  const admin = db.prepare('SELECT * FROM users WHERE id=? AND role=\'admin\'').get(req.session.userId);
  if (!admin) return res.status(404).json({ error: 'ไม่พบ Admin' });
  if (!String(name || '').trim() || !/^\S+@\S+\.\S+$/.test(String(email || '').trim())) {
    return res.status(400).json({ error: 'ชื่อหรืออีเมลไม่ถูกต้อง' });
  }
  const duplicate = db.prepare('SELECT id FROM users WHERE email=? AND id<>?').get(String(email).trim().toLowerCase(), admin.id);
  if (duplicate) return res.status(409).json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' });
  let password = admin.password;
  if (newPassword) {
    if (!currentPassword || !(await bcrypt.compare(String(currentPassword), admin.password))) {
      return res.status(400).json({ error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
    }
    if (String(newPassword).length < 6) return res.status(400).json({ error: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' });
    password = await bcrypt.hash(String(newPassword), 12);
  }
  db.prepare('UPDATE users SET name=?,email=?,password=? WHERE id=?').run(String(name).trim(), String(email).trim().toLowerCase(), password, admin.id);
  setSetting('admin_name', String(name).trim());
  setSetting('admin_email', String(email).trim().toLowerCase());
  res.json({ id: admin.id, name: String(name).trim(), email: String(email).trim().toLowerCase(), role: 'admin' });
});

export default router;
