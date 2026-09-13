# Music Studio — ระบบ Login + Database

เวอร์ชันนี้เปลี่ยน Authentication จาก `localStorage` เป็น Backend จริง โดยใช้ Node.js + Express + SQLite และ bcrypt สำหรับ hash รหัสผ่าน

## วิธีรัน

1. ติดตั้ง Node.js 20+
2. เปิด Terminal ในโฟลเดอร์โปรเจกต์
3. รัน `npm install`
4. รัน `npm run dev`
5. เปิดเว็บที่ URL ที่ Vite แสดง (ปกติ `http://localhost:5173`)

Backend จะทำงานที่ `http://localhost:3001` และฐานข้อมูลจะถูกสร้างอัตโนมัติที่ `server/data/musicstudio.sqlite`

## บัญชี Admin เริ่มต้น

- Email: `admin@musicstudio.local`
- Password: `Admin123!`

ตั้งค่าใหม่ก่อนใช้งานจริงผ่าน environment:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`

## สิ่งที่ทำให้แล้ว

- สมัครสมาชิก → บันทึกลง SQLite
- รหัสผ่านไม่เก็บเป็น plain text → ใช้ bcrypt hash
- Login → ตรวจสอบกับ Database
- Session แบบ HttpOnly cookie
- Remember me → session 30 วัน / ไม่เลือก 8 ชั่วโมง
- Logout → ทำลาย session
- `/api/auth/me` → ตรวจสอบ session
- Role user/admin
- Admin API มี middleware ตรวจสิทธิ์
- ไม่มีการเก็บ password ไว้ใน localStorage
- Vite proxy `/api` ไป backend ตอนพัฒนา

> ระบบนี้ทำให้ Login/Register ใช้งานจริงได้แล้ว ส่วนข้อมูล Booking/Studio/Payment ในหน้าปัจจุบันยังเป็นข้อมูล UI จำลองและสามารถเชื่อม Database ต่อในขั้นถัดไปได้
