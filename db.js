import pg from 'pg';
const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Add your Supabase PostgreSQL connection string in Render.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
});

export async function query(text, params = []) {
  return pool.query(text, params);
}
export async function one(text, params = []) {
  const { rows } = await query(text, params);
  return rows[0] || null;
}
export async function many(text, params = []) {
  const { rows } = await query(text, params);
  return rows;
}
export async function run(text, params = []) {
  return query(text, params);
}
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

const studioSeed = [
  ['Rock Room','ห้องซ้อมขนาดใหญ่สำหรับวงร็อค เสียงแน่น พื้นที่กว้าง',300,'กลองชุด, แอมป์กีตาร์ 2, แอมป์เบส, ไมค์ 3','/studios/rock-room.svg'],
  ['Jazz Room','ห้องซ้อมบรรยากาศอบอุ่น เหมาะกับแจ๊สและวงขนาดเล็ก',250,'เปียโนไฟฟ้า, แอมป์กีตาร์, แอมป์เบส, ไมค์ 2','/studios/jazz-room.svg'],
  ['Acoustic Room','ห้องสำหรับอะคูสติก เสียงนุ่มและควบคุมเสียงสะท้อนได้ดี',200,'แอมป์อะคูสติก, ไมค์ 2, คาฮอง, ขาตั้งไมค์','/studios/acoustic-room.svg'],
  ['Pro Studio A','ห้องมาตรฐานโปรสำหรับวงเต็มรูปแบบ พร้อมมอนิเตอร์เสียงคุณภาพสูง',450,'กลองชุดโปร, แอมป์กีตาร์ 2, แอมป์เบส, PA, ไมค์ 4','/studios/pro-studio-a.svg'],
  ['Pro Studio B','พื้นที่กว้างสำหรับวงใหญ่ ซ้อมคอนเสิร์ตหรือเตรียมขึ้นเวที',500,'กลองชุดโปร, แอมป์ 3, คีย์บอร์ด, PA, ไมค์ 5','/studios/pro-studio-b.svg'],
  ['Vocal Room','ห้องซ้อมร้องและฝึกเสียงส่วนตัว เก็บเสียงดีและเป็นส่วนตัว',180,'ไมค์คอนเดนเซอร์, ไมค์ไดนามิก, มอนิเตอร์, มิกเซอร์','/studios/vocal-room.svg'],
  ['Band Room 01','ห้องซ้อมสำหรับวงทั่วไป ราคาประหยัด พร้อมอุปกรณ์พื้นฐานครบ',220,'กลองชุด, แอมป์กีตาร์, แอมป์เบส, ไมค์ 2','/studios/band-room-01.svg'],
  ['Band Room 02','ห้องขนาดกลาง เหมาะสำหรับวง 3–5 คนและการซ้อมประจำ',230,'กลองชุด, แอมป์กีตาร์, แอมป์เบส, คีย์บอร์ด, ไมค์ 2','/studios/band-room-02.svg'],
  ['Live Room','ห้องบรรยากาศเหมือนเวทีจริง สำหรับซ้อมโชว์และเตรียมคอนเสิร์ต',380,'กลองชุด, แอมป์ 3, PA, ไฟเวที, ไมค์ 4','/studios/live-room.svg'],
  ['Recording Room','ห้องสำหรับซ้อมพร้อมบันทึกเสียงและเช็กเสียงหลังการซ้อม',550,'Audio Interface, มอนิเตอร์สตูดิโอ, ไมค์, หูฟัง 4','/studios/recording-room.svg'],
  ['Keyboard Room','ห้องสำหรับนักดนตรีสายคีย์บอร์ดและโปรดิวเซอร์',260,'คีย์บอร์ด 2 ตัว, MIDI Controller, มอนิเตอร์, หูฟัง','/studios/keyboard-room.svg'],
  ['Premium Room','ห้องพรีเมียมสำหรับวงที่ต้องการพื้นที่และอุปกรณ์ครบที่สุด',650,'กลองชุดโปร, แอมป์กีตาร์ 2, แอมป์เบส, คีย์บอร์ด, PA, ไมค์ 5','/studios/premium-room.svg']
];

export async function initDb({ adminEmail, adminPassword, bcrypt }) {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','admin')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS studios (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price_per_hour NUMERIC(10,2) NOT NULL,
      image_url TEXT,
      equipment TEXT,
      status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available','maintenance')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS bookings (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      studio_id BIGINT NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','completed','cancelled')),
      total_price NUMERIC(10,2) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS notifications (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL DEFAULT 'alert',
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS payments (
      id BIGSERIAL PRIMARY KEY,
      booking_id BIGINT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
      method TEXT NOT NULL,
      amount NUMERIC(10,2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','rejected')),
      proof_url TEXT,
      note TEXT,
      paid_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const admin = await one('SELECT id FROM users WHERE email=$1', [adminEmail]);
  if (!admin) {
    const hash = await bcrypt.hash(adminPassword, 12);
    await query('INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4)', ['Music Studio Admin', adminEmail, hash, 'admin']);
  }

  for (const [name, description, price, equipment, image] of studioSeed) {
    await query(`INSERT INTO studios(name,description,price_per_hour,equipment,image_url,status)
      VALUES($1,$2,$3,$4,$5,'available')
      ON CONFLICT DO NOTHING`, [name, description, price, equipment, image]);
  }
  const notice = await one('SELECT id FROM notifications WHERE user_id IS NULL LIMIT 1');
  if (!notice) await query('INSERT INTO notifications(type,title,message,read) VALUES($1,$2,$3,false)', ['alert','ระบบพร้อมใช้งาน','Music Studio พร้อมรับการจองและจัดการจาก Admin']);
}

export default { query, one, many, run, withTransaction };
