import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, XCircle, CheckCircle, Clock3, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

type Booking = {
  id: number;
  studio_name: string;
  date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
};

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    fetch('/api/bookings/me')
      .then(res => res.json())
      .then(data => {
        setBookings(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchBookings();
  }, [user]);

  const handleCancel = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้?')) return;
    
    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (res.ok) {
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="space-y-12">
        <div>
          <h1 className="text-4xl font-display font-bold mb-4">ประวัติการจองของฉัน</h1>
          <p className="text-muted-foreground text-lg">ตรวจสอบสถานะการจอง ปัจจุบันและประวัติการใช้บริการห้องซ้อมดนตรีของคุณ</p>
        </div>

        <div className="bg-card border border-border border-dashed rounded-2xl p-12 text-center max-w-2xl mx-auto mt-12 shadow-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-3">กรุณาเข้าสู่ระบบ</h3>
          <p className="text-muted-foreground mb-8 text-balance">
            คุณจำเป็นต้องเข้าสู่ระบบเพื่อดูข้อมูลและประวัติการจองห้องซ้อมดนตรีของคุณ หากยังไม่มีบัญชีสามารถสมัครสมาชิกได้ฟรี
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-primary text-primary-foreground font-medium py-3 px-8 rounded-lg hover:bg-primary/90 transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
            <Link 
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-secondary text-secondary-foreground font-medium py-3 px-8 rounded-lg hover:bg-secondary/80 transition-colors"
            >
              สมัครสมาชิก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date);
    return bookingDate >= today && b.status !== 'cancelled';
  });

  const pastBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date);
    return bookingDate < today || b.status === 'cancelled';
  });

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Clock3 className="w-3.5 h-3.5" /> รอการยืนยัน
          </span>
        );
      case 'approved':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="w-3.5 h-3.5" /> ยืนยันแล้ว
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="w-3.5 h-3.5" /> ยกเลิกแล้ว
          </span>
        );
      default:
        return null;
    }
  };

  const BookingCard = ({ booking, isPast }: { booking: Booking, isPast: boolean }) => (
    <div className={`bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-primary/30 ${isPast ? 'opacity-70' : ''}`}>
      <div className="space-y-4 flex-1">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPast ? 'bg-muted' : 'bg-primary/10'}`}>
            <span className="text-2xl">🎵</span>
          </div>
          <div>
            <h3 className="text-xl font-bold">{booking.studio_name}</h3>
            <div className="mt-1">
              <StatusBadge status={booking.status} />
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-5 text-sm text-muted-foreground pt-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-foreground/70" />
            {new Date(booking.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-foreground/70" />
            {booking.start_time} - {booking.end_time}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-foreground/70" />
            Bangkok Branch
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 min-w-[200px] justify-between md:justify-end">
        <div>
          <span className="text-xs text-muted-foreground block mb-1">ยอดชำระ</span>
          <span className="text-2xl font-bold font-display text-primary">฿{booking.total_price}</span>
        </div>
        {!isPast && booking.status !== 'cancelled' && (
          <button 
            onClick={() => handleCancel(booking.id)}
            className="flex items-center gap-2 text-sm font-medium text-red-500 hover:bg-red-500/10 px-4 py-2.5 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
          >
            <XCircle className="w-4 h-4" />
            ยกเลิก
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-display font-bold mb-4">ประวัติการจองของฉัน</h1>
        <p className="text-muted-foreground text-lg">ตรวจสอบสถานะการจอง ปัจจุบันและประวัติการใช้บริการห้องซ้อมดนตรีของคุณ</p>
      </div>

      {/* Upcoming Bookings Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary animate-pulse"></span>
          การจองที่กำลังจะมาถึง
        </h2>
        {upcomingBookings.length === 0 ? (
          <div className="bg-card border border-border border-dashed rounded-2xl p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">ไม่มีการจองในขณะนี้</h3>
            <p className="text-muted-foreground">คุณยังไม่มีการจองห้องซ้อม ไปที่หน้าสตูดิโอเพื่อทำการจองใหม่ได้เลย</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {upcomingBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} isPast={false} />
            ))}
          </div>
        )}
      </section>

      {/* Past Bookings Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-muted-foreground">
          ประวัติการใช้งาน
        </h2>
        {pastBookings.length === 0 ? (
          <p className="text-muted-foreground italic">ยังไม่มีประวัติการจองที่ผ่านมา</p>
        ) : (
          <div className="grid gap-4">
            {pastBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} isPast={true} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}