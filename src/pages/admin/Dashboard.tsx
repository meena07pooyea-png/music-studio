import { useEffect, useState } from 'react';
import { Activity, CalendarDays, CheckCircle2, Clock3, CreditCard, DoorOpen, RefreshCw, Users, Wallet } from 'lucide-react';

type DashboardData = {
  users: number; studios: number; bookings: number; pending: number; pendingPayments: number;
  confirmed: number; revenue: number; availableRooms: number;
  recentBookings: { id:number; date:string; start_time:string; end_time:string; total_price:number; status:string; user_name:string; studio_name:string; payment_status:string }[];
  monthly: { month:string; bookings:number; revenue:number }[];
};

const money = (n:number) => `฿${Number(n || 0).toLocaleString('th-TH')}`;
const statusLabel:Record<string,string> = { pending:'รอยืนยัน', confirmed:'ยืนยันแล้ว', completed:'เสร็จสิ้น', cancelled:'ยกเลิก' };

export default function Dashboard(){
  const [d,setD]=useState<DashboardData|null>(null); const [error,setError]=useState(''); const [loading,setLoading]=useState(true);
  const load=async()=>{setLoading(true);setError('');try{const r=await fetch('/api/admin/dashboard');const x=await r.json();if(!r.ok)throw new Error(x.error||'โหลดข้อมูลไม่สำเร็จ');setD(x)}catch(e:any){setError(e.message)}finally{setLoading(false)}};
  useEffect(()=>{load()},[]);
  if(loading)return <div className="flex items-center justify-center h-64 text-zinc-400">กำลังโหลด Dashboard...</div>;
  if(error)return <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 text-red-300 flex items-center justify-between">{error}<button onClick={load} className="px-3 py-2 rounded-lg bg-white/5">ลองใหม่</button></div>;
  if(!d)return null;
  const cards=[
    ['ลูกค้าทั้งหมด',d.users,Users,'text-blue-400'],['ห้องซ้อม',d.studios,DoorOpen,'text-violet-400'],['การจองทั้งหมด',d.bookings,CalendarDays,'text-amber-400'],
    ['รอยืนยัน',d.pending,Clock3,'text-orange-400'],['รอชำระเงิน',d.pendingPayments,CreditCard,'text-pink-400'],['รายได้ที่ชำระแล้ว',money(d.revenue),Wallet,'text-emerald-400']
  ] as const;
  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display text-2xl font-bold text-white">Dashboard</h1><p className="text-zinc-500 text-sm mt-1">ภาพรวมการดำเนินงานของ Music Studio</p></div><button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-zinc-300 hover:bg-white/5"><RefreshCw className="w-4 h-4"/>รีเฟรช</button></div>
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">{cards.map(([label,value,Icon,iconClass])=><div key={label} className="bg-[#111114] border border-white/6 rounded-2xl p-4"><div className="flex items-center justify-between"><span className="text-xs text-zinc-500">{label}</span><Icon className={`w-4 h-4 ${iconClass}`}/></div><p className="text-2xl font-bold text-white mt-3">{value}</p></div>)}</div>
    <div className="grid xl:grid-cols-[1.4fr_1fr] gap-4">
      <div className="bg-[#111114] border border-white/6 rounded-2xl overflow-hidden"><div className="p-5 border-b border-white/6 flex items-center justify-between"><div><h2 className="text-white font-semibold">การจองล่าสุด</h2><p className="text-xs text-zinc-500 mt-1">รายการล่าสุดจากฐานข้อมูล</p></div><Activity className="w-5 h-5 text-violet-400"/></div><div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="text-zinc-500 border-b border-white/6"><th className="p-4 text-left">ลูกค้า</th><th className="p-4 text-left">ห้อง</th><th className="p-4 text-left">วัน/เวลา</th><th className="p-4 text-left">ยอด</th><th className="p-4 text-left">สถานะ</th></tr></thead><tbody>{d.recentBookings.length?d.recentBookings.map(b=><tr key={b.id} className="border-b border-white/4"><td className="p-4 text-white">{b.user_name}</td><td className="p-4 text-zinc-300">{b.studio_name}</td><td className="p-4 text-zinc-400">{b.date}<br/>{b.start_time}–{b.end_time}</td><td className="p-4 text-white">{money(b.total_price)}</td><td className="p-4"><span className="px-2 py-1 rounded-full bg-white/5 text-zinc-300">{statusLabel[b.status]||b.status}</span></td></tr>):<tr><td colSpan={5} className="p-8 text-center text-zinc-500">ยังไม่มีรายการจอง</td></tr>}</tbody></table></div></div>
      <div className="bg-[#111114] border border-white/6 rounded-2xl p-5"><h2 className="text-white font-semibold">สรุป 6 เดือนล่าสุด</h2><div className="space-y-4 mt-5">{d.monthly.map(m=><div key={m.month}><div className="flex justify-between text-xs mb-1"><span className="text-zinc-400">{m.month}</span><span className="text-zinc-300">{m.bookings} การจอง · {money(m.revenue)}</span></div><div className="h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-violet-600 rounded-full" style={{width:`${Math.min(100,Math.max(4,(m.bookings/Math.max(...d.monthly.map(x=>x.bookings),1))*100))}%`}}/></div></div>)}{!d.monthly.length&&<p className="text-zinc-500 text-sm">ยังไม่มีข้อมูล</p>}</div><div className="mt-6 pt-5 border-t border-white/6 flex justify-between text-sm"><span className="text-zinc-500">ห้องพร้อมให้บริการ</span><span className="text-emerald-400 font-semibold">{d.availableRooms} / {d.studios}</span></div></div>
    </div>
  </div>
}
