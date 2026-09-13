import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
const router = express.Router();
const normalizeEmail = e => String(e || '').trim().toLowerCase();

router.post('/register', async (req,res) => {
  const name = String(req.body.name || '').trim();
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');
  if (name.length < 2 || !email || password.length < 6) return res.status(400).json({error:'กรุณากรอกชื่อ อีเมล และรหัสผ่านอย่างน้อย 6 ตัวอักษร'});
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({error:'รูปแบบอีเมลไม่ถูกต้อง'});
  if (db.prepare('SELECT id FROM users WHERE email=?').get(email)) return res.status(409).json({error:'อีเมลนี้มีบัญชีแล้ว'});
  const hash = await bcrypt.hash(password,12);
  const result = db.prepare('INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)').run(name,email,hash,'user');
  req.session.userId = Number(result.lastInsertRowid);
  req.session.role = 'user';
  res.status(201).json({id:Number(result.lastInsertRowid),name,email,role:'user'});
});

router.post('/login', async (req,res) => {
  const email = normalizeEmail(req.body.email); const password = String(req.body.password || '');
  if (!email || !password) return res.status(400).json({error:'กรุณากรอกอีเมลและรหัสผ่าน'});
  const user = db.prepare('SELECT * FROM users WHERE email=?').get(email);
  if (!user || !(await bcrypt.compare(password,user.password))) return res.status(401).json({error:'อีเมลหรือรหัสผ่านไม่ถูกต้อง'});
  req.session.userId = user.id; req.session.role = user.role;
  req.session.cookie.maxAge = req.body.remember ? 30*24*60*60*1000 : 8*60*60*1000;
  res.json({id:user.id,name:user.name,email:user.email,role:user.role});
});
router.post('/logout',(req,res)=>req.session.destroy(()=>{res.clearCookie('connect.sid');res.json({message:'Logged out'});}));
router.get('/me',(req,res)=>{
  if(!req.session.userId) return res.status(401).json({error:'Not authenticated'});
  const user=db.prepare('SELECT id,name,email,role FROM users WHERE id=?').get(req.session.userId);
  if(!user) return req.session.destroy(()=>res.status(401).json({error:'User not found'}));
  res.json(user);
});
export default router;
