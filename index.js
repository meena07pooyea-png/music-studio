import express from 'express';
import session from 'express-session';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDb } from './db.js';
import authRoutes from './routes/auth.js';
import studioRoutes from './routes/studios.js';
import bookingRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';

const app=express();
const isProduction=process.env.NODE_ENV==='production';
const PORT=Number(process.env.PORT||process.env.API_PORT||3001);
const CLIENT_ORIGIN=process.env.CLIENT_ORIGIN||'';
if(isProduction&&!process.env.SESSION_SECRET)throw new Error('SESSION_SECRET is required in production.');
if(isProduction&&!process.env.ADMIN_PASSWORD)throw new Error('ADMIN_PASSWORD is required in production.');
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required. Add your Supabase PostgreSQL connection string in Render.');
app.set('trust proxy',isProduction?1:0);
if(CLIENT_ORIGIN){const allowedOrigins=CLIENT_ORIGIN.split(',').map(v=>v.trim()).filter(Boolean);app.use(cors({origin:allowedOrigins,credentials:true}));}
app.use(express.json({limit:'8mb'}));
app.use(session({secret:process.env.SESSION_SECRET||'local-only-change-me',resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',secure:isProduction,maxAge:30*24*60*60*1000}}));
const ADMIN_EMAIL=process.env.ADMIN_EMAIL||'admin@musicstudio.local';
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||'Admin123!';
app.get('/api/health',(_req,res)=>res.json({ok:true,service:'Music Studio API',database:'supabase'}));
app.use('/api/auth',authRoutes);app.use('/api/studios',studioRoutes);app.use('/api/bookings',bookingRoutes);app.use('/api/payments',paymentRoutes);app.use('/api/admin',adminRoutes);app.use('/api/notifications',notificationRoutes);
const __dirname=path.dirname(fileURLToPath(import.meta.url));const distPath=path.resolve(__dirname,'../dist');
if(isProduction){app.use(express.static(distPath));app.get(/.*/,(req,res,next)=>{if(req.path.startsWith('/api/'))return next();res.sendFile(path.join(distPath,'index.html'));});}
initDb({adminEmail:ADMIN_EMAIL,adminPassword:ADMIN_PASSWORD,bcrypt}).then(()=>app.listen(PORT,'0.0.0.0',()=>console.log(`Music Studio listening on 0.0.0.0:${PORT}`))).catch(error=>{console.error('Startup failed:',error);process.exit(1);});
