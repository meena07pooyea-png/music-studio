# Music Studio — คู่มือ Deploy Production

## โครงสร้าง Production

เวอร์ชันนี้รวม Vite frontend และ Express API ไว้ใน Web Service เดียวกัน เพื่อให้ใช้ session/cookie และ `/api/*` ได้ง่าย และเปิดเว็บผ่าน URL เดียว

## ก่อน Deploy

1. เปลี่ยน `ADMIN_EMAIL` และ `ADMIN_PASSWORD` ใน Environment Variables ของผู้ให้บริการ
2. ตั้ง `SESSION_SECRET` เป็นค่าสุ่มยาว ๆ และไม่ commit ลง Git
3. ตั้ง `DB_PATH=/var/data/musicstudio.sqlite`
4. ใช้ persistent disk ที่ `/var/data` หากใช้ SQLite เพราะ filesystem ของ Render ปกติเป็น ephemeral
5. ตรวจ `npm run build` ให้ผ่านก่อน deploy

## Render

- Runtime: Node
- Root Directory: `msinspect` (ถ้า repository มีโฟลเดอร์นี้)
- Build Command: `npm ci && npm run build`
- Start Command: `npm start`
- Health Check: `/api/health`
- Persistent Disk: `/var/data`

หลัง deploy สำเร็จ เว็บจะเปิดผ่าน URL ของ Render ก่อน จากนั้นค่อยเพิ่ม `musicstudio.com` ใน Custom Domains และตั้ง DNS ตามค่าที่ Render แสดง

## Local production test

```bash
npm install
npm run build
NODE_ENV=production SESSION_SECRET="change-me" ADMIN_PASSWORD="change-me" DB_PATH="./server/data/musicstudio-prod.sqlite" PORT=3001 npm start
```

Windows PowerShell:

```powershell
$env:NODE_ENV="production"
$env:SESSION_SECRET="change-me"
$env:ADMIN_PASSWORD="change-me"
$env:DB_PATH="./server/data/musicstudio-prod.sqlite"
$env:PORT="3001"
npm run build
npm start
```

เปิด `http://localhost:3001/`

## หมายเหตุสำคัญ

- อย่าใช้รหัสผ่าน `Admin123!` ใน Production
- อย่าอัปโหลด `.env` จริงขึ้น GitHub
- SQLite เหมาะกับระบบขนาดเล็ก/โปรเจกต์นักศึกษาและ single-instance มากกว่า หากระบบโตขึ้นควรย้ายไป PostgreSQL
