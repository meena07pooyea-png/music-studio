import express from 'express';
import db from '../db.js';
const router=express.Router();
const admin=(req,res,next)=>{if(req.session.role!=='admin')return res.status(403).json({error:'Forbidden'});next();};
router.get('/',(req,res)=>{
 const q=String(req.query.q||'').trim();
 const rows=q?db.prepare("SELECT * FROM studios WHERE name LIKE ? OR description LIKE ? OR equipment LIKE ? ORDER BY id DESC").all(`%${q}%`,`%${q}%`,`%${q}%`):db.prepare('SELECT * FROM studios ORDER BY id DESC').all();
 res.json(rows);
});
router.post('/',admin,(req,res)=>{
 const {name,description='',price_per_hour,equipment='',image_url='',status='available'}=req.body;
 if(!name||Number(price_per_hour)<=0)return res.status(400).json({error:'ข้อมูลห้องไม่ครบ'});
 const r=db.prepare('INSERT INTO studios(name,description,price_per_hour,equipment,image_url,status) VALUES(?,?,?,?,?,?)').run(name,description,Number(price_per_hour),equipment,image_url,status);
 res.status(201).json(db.prepare('SELECT * FROM studios WHERE id=?').get(r.lastInsertRowid));
});
router.put('/:id',admin,(req,res)=>{
 const {name,description='',price_per_hour,equipment='',image_url='',status='available'}=req.body;
 const r=db.prepare('UPDATE studios SET name=?,description=?,price_per_hour=?,equipment=?,image_url=?,status=? WHERE id=?').run(name,description,Number(price_per_hour),equipment,image_url,status,req.params.id);
 if(!r.changes)return res.status(404).json({error:'ไม่พบห้อง'});
 res.json(db.prepare('SELECT * FROM studios WHERE id=?').get(req.params.id));
});
router.delete('/:id',admin,(req,res)=>{
 try { const r=db.prepare('DELETE FROM studios WHERE id=?').run(req.params.id); if(!r.changes)return res.status(404).json({error:'ไม่พบห้อง'}); res.json({message:'ลบห้องสำเร็จ'}); }
 catch(e){res.status(400).json({error:'ไม่สามารถลบห้องที่มีประวัติการจองได้'});}
});
export default router;
