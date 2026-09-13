import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, CreditCard, ArrowRight, X } from 'lucide-react';

type Studio = {
  id: number;
  name: string;
  description: string;
  price_per_hour: number;
  equipment: string;
};

export default function StudioList() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Booking Modal State
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1 = Details/Time, 2 = Payment, 3 = Success
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingError, setBookingError] = useState('');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/studios')
      .then(res => res.json())
      .then(data => {
        setStudios(data);
        setLoading(false);
      });
  }, []);

  const calculatePrice = () => {
    if (!startTime || !endTime || !selectedStudio) return 0;
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (diffHours <= 0) return 0;
    return diffHours * selectedStudio.price_per_hour;
  };

  useEffect(() => {
    setTotalPrice(calculatePrice());
  }, [startTime, endTime, selectedStudio]);

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (totalPrice <= 0) {
      setBookingError('เวลาเช็คเอ้าท์ต้องมากกว่าเวลาเช็คอิน');
      return;
    }
    
    setStep(2);
  };

  const handlePayment = async () => {
    if (!selectedBank) {
      setBookingError('กรุณาเลือกธนาคารเพื่อชำระเงิน');
      return;
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studio_id: selectedStudio!.id,
          date,
          start_time: startTime,
          end_time: endTime,
          total_price: totalPrice
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const paymentRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: data.id, method: selectedBank })
      });
      const paymentData = await paymentRes.json();
      if (!paymentRes.ok) throw new Error(paymentData.error || 'ไม่สามารถสร้างรายการชำระเงินได้');
      
      setStep(3);
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);
    } catch (err: any) {
      setBookingError(err.message);
    }
  };

  const filteredStudios = studios.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetModal = () => {
    setSelectedStudio(null);
    setStep(1);
    setDate('');
    setStartTime('');
    setEndTime('');
    setBookingError('');
    setSelectedBank(null);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold mb-4">ค้นหาสตูดิโอ</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">เลือกห้องซ้อมดนตรีที่เหมาะกับคุณ ดูรายละเอียด และจองเวลาได้ทันที</p>
        </div>
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="ค้นหาชื่อห้อง หรือ อุปกรณ์..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredStudios.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <p className="text-xl text-muted-foreground">ไม่พบสตูดิโอที่ค้นหา</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudios.map(studio => (
            <div key={studio.id} className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
              <div className="aspect-video bg-muted flex items-center justify-center relative">
                 <span className="text-5xl opacity-50">🎵</span>
                 <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold border border-border text-primary">
                   ฿{studio.price_per_hour}/ชม.
                 </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold mb-2">{studio.name}</h3>
                <p className="text-muted-foreground mb-4 text-sm flex-1">{studio.description}</p>
                <div className="mb-6 bg-background rounded-lg p-4 border border-border/50">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">อุปกรณ์ในห้อง</span>
                  <p className="text-sm text-foreground/90">{studio.equipment}</p>
                </div>
                <button 
                  onClick={() => setSelectedStudio(studio)}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex justify-center items-center gap-2"
                >
                  จองห้องนี้ <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {selectedStudio && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {step !== 3 && (
              <button onClick={resetModal} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            )}
            
            {step === 1 && (
              <>
                <h2 className="text-2xl font-bold mb-2">จอง {selectedStudio.name}</h2>
                <p className="text-muted-foreground mb-6 text-sm">ราคา ฿{selectedStudio.price_per_hour} / ชั่วโมง</p>
                
                {bookingError && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm mb-6 border border-red-500/20">{bookingError}</div>}
                
                <form onSubmit={handleProceedToPayment} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1">วันที่ต้องการจอง</label>
                    <input 
                      type="date" 
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">เวลาเช็คอิน</label>
                      <input 
                        type="time" 
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">เวลาเช็คเอ้าท์</label>
                      <input 
                        type="time" 
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">ราคารวมทั้งหมด:</span>
                    <span className="text-2xl font-bold font-display text-primary">฿{totalPrice > 0 ? totalPrice : 0}</span>
                  </div>

                  <button type="submit" className="w-full bg-primary text-primary-foreground font-medium py-3.5 rounded-lg hover:bg-primary/90 transition-colors mt-4 text-lg">
                    ดำเนินการชำระเงิน
                  </button>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-2xl font-bold mb-2">ชำระเงิน</h2>
                <p className="text-muted-foreground mb-6 text-sm">ยอดชำระสำหรับ {selectedStudio.name}</p>
                
                {bookingError && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm mb-6 border border-red-500/20">{bookingError}</div>}
                
                <div className="bg-background rounded-xl p-6 border border-border mb-6 flex flex-col items-center">
                  <span className="text-sm text-muted-foreground mb-1">ยอดที่ต้องชำระ</span>
                  <span className="text-4xl font-bold font-display text-primary mb-6">฿{totalPrice}</span>
                  
                  <div className="w-48 h-48 bg-white rounded-lg p-2 flex items-center justify-center mb-4">
                    {/* Placeholder for QR Code */}
                    <div className="w-full h-full border-4 border-black border-dashed flex items-center justify-center relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-b-4 border-r-4 border-black"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-b-4 border-l-4 border-black"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-t-4 border-r-4 border-black"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-t-4 border-l-4 border-black"></div>
                      <span className="text-black font-bold text-center leading-tight">SCAN<br/>TO PAY</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">สแกน QR Code ผ่านแอปพลิเคชันธนาคาร</p>
                </div>

                <div className="space-y-3 mb-6">
                  <label className="block text-sm font-medium mb-2">เลือกธนาคารที่ต้องการชำระ</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => setSelectedBank('kbank')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${selectedBank === 'kbank' ? 'border-[#00A950] bg-[#00A950]/10' : 'border-border hover:bg-muted'}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#00A950]"></div>
                      <span className="text-xs font-medium">กสิกรไทย</span>
                    </button>
                    <button 
                      onClick={() => setSelectedBank('scb')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${selectedBank === 'scb' ? 'border-[#4E2A84] bg-[#4E2A84]/10' : 'border-border hover:bg-muted'}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#4E2A84]"></div>
                      <span className="text-xs font-medium">ไทยพาณิชย์</span>
                    </button>
                    <button 
                      onClick={() => setSelectedBank('ktb')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${selectedBank === 'ktb' ? 'border-[#1BA5E1] bg-[#1BA5E1]/10' : 'border-border hover:bg-muted'}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#1BA5E1]"></div>
                      <span className="text-xs font-medium">กรุงไทย</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 bg-secondary text-secondary-foreground font-medium py-3.5 rounded-lg hover:bg-secondary/80 transition-colors">
                    ย้อนกลับ
                  </button>
                  <button onClick={handlePayment} className="flex-1 bg-primary text-primary-foreground font-medium py-3.5 rounded-lg hover:bg-primary/90 transition-colors flex justify-center items-center gap-2">
                    <CreditCard className="w-5 h-5" /> ยืนยันการชำระเงิน
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-green-500">ชำระเงินสำเร็จ!</h2>
                <p className="text-muted-foreground text-lg mb-8">การจองของคุณได้รับการยืนยันแล้ว กำลังพาท่านไปยังหน้าประวัติการจอง...</p>
                <div className="animate-pulse flex justify-center">
                   <div className="h-2 w-24 bg-primary/50 rounded"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}