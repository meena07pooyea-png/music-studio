# Music Studio — Supabase + Render Free

เวอร์ชันนี้ไม่ใช้ SQLite และไม่ใช้ Persistent Disk ของ Render แล้ว
ข้อมูลผู้ใช้ ห้อง การจอง การชำระเงิน และการแจ้งเตือนเก็บใน Supabase PostgreSQL
รูปห้องที่เลือกจากเครื่องถูกเก็บเป็น data URL ในฐานข้อมูล PostgreSQL เพื่อให้ยังอยู่หลัง Render restart/deploy

## 1) สร้าง Supabase
1. เข้า https://supabase.com/dashboard
2. สร้าง New project
3. ตั้ง Database Password และเก็บไว้
4. รอให้โปรเจกต์พร้อม

## 2) สร้างตาราง
เปิด SQL Editor > New query แล้วคัดลอกไฟล์ `supabase_schema.sql` ทั้งไฟล์ไป Run
หมายเหตุ: server ก็สร้างตารางให้อัตโนมัติได้ แต่การรัน SQL ก่อนจะตรวจสอบโครงสร้างได้ง่ายกว่า

## 3) เอา DATABASE_URL
ใน Supabase กด Connect แล้วเลือก Session pooler (port 5432) สำหรับ Render Free/IPv4
คัดลอก connection string แล้วแทนที่รหัสผ่านจริง
ตัวอย่างรูปแบบ:
`postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[POOLER-HOST]:5432/postgres`
อย่าใช้ตัวอย่างนี้ตรง ๆ ให้คัดลอกจากปุ่ม Connect ของโปรเจกต์คุณ

## 4) ตั้ง Environment Variables ใน Render
ไปที่ Music Studio > Environment แล้วเพิ่ม:

NODE_ENV=production
SESSION_SECRET=สร้างข้อความลับยาว ๆ
ADMIN_EMAIL=อีเมลแอดมิน
ADMIN_PASSWORD=รหัสผ่านแอดมิน
DATABASE_URL=connection string จาก Supabase

ไม่ต้องมี DB_PATH และไม่ต้องเพิ่ม Persistent Disk

## 5) Deploy
Deploy > Manual Deploy > Deploy latest commit
ตรวจ `/api/health` ต้องตอบ JSON ที่มี `ok: true`

## 6) สิ่งที่เก็บถาวร
- สมัครสมาชิก: users
- ห้องซ้อม: studios
- การจอง: bookings
- การแจ้งเตือน: notifications
- การชำระเงิน: payments
- การตั้งค่า Admin: settings
- รูปห้องที่อัปโหลดจากหน้า Admin: studios.image_url

## 7) การอัปโหลดรูป
หน้า Admin > จัดการห้องซ้อม > เลือกรูปจากเครื่อง
- รองรับไฟล์รูป
- จำกัด 1.5 MB ต่อรูป
- รูปจะถูกแปลงเป็น data URL แล้วเก็บใน Supabase PostgreSQL
- เมื่อแก้ไขห้องและเลือกรูปใหม่ รูปใหม่จะถูกบันทึกและผู้ใช้งานจะเห็นรูปใหม่

## 8) หมายเหตุเรื่อง Render Free
Render Free ไม่มี Persistent Disk สำหรับเก็บ SQLite/ไฟล์อัปโหลดถาวร ดังนั้นเวอร์ชันนี้จึงไม่เขียน `/var/data` อีกต่อไป
Render อาจ sleep เมื่อไม่มีการใช้งาน แต่ข้อมูลหลักอยู่ใน Supabase
