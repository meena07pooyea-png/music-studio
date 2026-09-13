import express from 'express';
import db from '../db.js';
const router=express.Router();
const addNotification = (type,title,message) => db.prepare('INSERT INTO notifications(type,title,message) VALUES(?,?,?)').run(type,title,message);
const auth=(req,res,next)=>{if(!req.session.userId)return res.status(401).json({error:'กรุณาเข้าสู่ระบบ'});next();};
const admin=(req,res,next)=>{if(req.session.role!=='admin')return res.status(403).json({error:'Forbidden'});next();};
router.get('/me',auth,(req,res)=>res.json(db.prepare(`SELECT p.*,b.date,b.start_time,b.end_time,s.name studio_name FROM payments p JOIN bookings b ON b.id=p.booking_id JOIN studios s ON s.id=b.studio_id WHERE b.user_id=? ORDER BY p.created_at DESC`).all(req.session.userId)));
router.post('/',auth,(req,res)=>{
 const booking=db.prepare('SELECT * FROM bookings WHERE id=? AND user_id=?').get(req.body.booking_id,req.session.userId);
 if(!booking)return res.status(404).json({error:'ไม่พบการจอง'});
 if(booking.status==='cancelled')return res.status(400).json({error:'การจองถูกยกเลิกแล้ว'});
 const method=String(req.body.method||'bank_transfer');
 const existing=db.prepare('SELECT id FROM payments WHERE booking_id=?').get(booking.id);
 if(existing)return res.status(409).json({error:'มีรายการชำระเงินสำหรับการจองนี้แล้ว'});
 const r=db.prepare('INSERT INTO payments(booking_id,method,amount,status,proof_url,note) VALUES(?,?,?,?,?,?)').run(booking.id,method,booking.total_price,'pending',req.body.proof_url||'',req.body.note||'');
 addNotification('payment','มีการชำระเงินใหม่',`การจอง #${booking.id} มียอดชำระ ฿${booking.total_price} รอตรวจสอบ`);
 res.status(201).json(db.prepare('SELECT * FROM payments WHERE id=?').get(r.lastInsertRowid));
});
router.get('/all',auth,admin,(req,res)=>res.json(db.prepare(`SELECT p.*,b.date,b.start_time,b.end_time,b.status booking_status,u.name user_name,u.email user_email,s.name studio_name FROM payments p JOIN bookings b ON b.id=p.booking_id JOIN users u ON u.id=b.user_id JOIN studios s ON s.id=b.studio_id ORDER BY p.created_at DESC`).all()));
router.patch('/:id/status',auth,admin,(req,res)=>{
 const status=String(req.body.status); if(!['pending','paid','rejected'].includes(status))return res.status(400).json({error:'สถานะไม่ถูกต้อง'});
 const p=db.prepare('SELECT * FROM payments WHERE id=?').get(req.params.id); if(!p)return res.status(404).json({error:'ไม่พบรายการ'});
 const tx=db.transaction(()=>{db.prepare("UPDATE payments SET status=?,paid_at=CASE WHEN ?='paid' THEN CURRENT_TIMESTAMP ELSE paid_at END WHERE id=?").run(status,status,p.id); if(status==='paid'){db.prepare("UPDATE bookings SET status='confirmed' WHERE id=? AND status='pending'").run(p.booking_id); addNotification('confirm','ยืนยันการชำระเงิน',`ยืนยันการชำระเงินของการจอง #${p.booking_id} สำเร็จ`);} if(status==='rejected'){db.prepare("UPDATE bookings SET status='cancelled' WHERE id=? AND status='pending'").run(p.booking_id); addNotification('cancel','ปฏิเสธการชำระเงิน',`รายการชำระเงินของการจอง #${p.booking_id} ถูกปฏิเสธ`);}});
 tx(); res.json({message:'อัปเดตการชำระเงินสำเร็จ'});
});
export default router;
