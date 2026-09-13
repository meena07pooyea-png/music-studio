import { Link } from 'react-router-dom';
import { ArrowRight, Music, Mic, Speaker } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col gap-24 py-12">
      {/* Hero */}
      <section className="text-center max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          เปิดรับจองคิวแล้วในกรุงเทพฯ
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance leading-tight">
          ที่ที่สร้างสรรค์ <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">เสียงที่ดีที่สุดของคุณ</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
          ห้องซ้อมดนตรีระดับมืออาชีพ พร้อมอุปกรณ์มาตรฐานสากล จองคิวซ้อมครั้งต่อไปของคุณได้ง่ายๆ ภายในไม่กี่วินาที
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/studios" className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center">
            ดูห้องซ้อมทั้งหมด <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/register" className="bg-secondary text-secondary-foreground px-8 py-4 rounded-lg font-medium hover:bg-secondary/80 transition-colors w-full sm:w-auto justify-center flex">
            สมัครสมาชิก
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-colors">
          <div className="bg-primary/10 w-12 h-12 flex items-center justify-center rounded-xl mb-6">
            <Music className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-3">ระบบเสียงพรีเมียม</h3>
          <p className="text-muted-foreground">ทุกห้องได้รับการปรับแต่งอคูสติกอย่างดี เพื่อป้องกันเสียงเล็ดลอดและให้การได้ยินที่สมบูรณ์แบบ</p>
        </div>
        <div className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-colors">
          <div className="bg-accent/10 w-12 h-12 flex items-center justify-center rounded-xl mb-6">
            <Speaker className="w-6 h-6 text-accent" />
          </div>
          <h3 className="text-xl font-bold mb-3">อุปกรณ์ระดับโปร</h3>
          <p className="text-muted-foreground">Marshall, Fender, Ampeg, Pearl เราจัดเตรียมเฉพาะอุปกรณ์แบรนด์ชั้นนำที่ดีที่สุดไว้ในทุกห้อง</p>
        </div>
        <div className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-colors">
          <div className="bg-green-500/10 w-12 h-12 flex items-center justify-center rounded-xl mb-6">
            <Mic className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-xl font-bold mb-3">ห้องบันทึกเสียงแยก</h3>
          <p className="text-muted-foreground">มีห้องบันทึกเสียงแยกส่วนเฉพาะ เพื่อการอัดเสียงที่ไร้ที่ติและได้คุณภาพเสียงที่คมชัดที่สุด</p>
        </div>
      </section>
    </div>
  );
}