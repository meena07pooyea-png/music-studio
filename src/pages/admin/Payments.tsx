import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, CreditCard, Loader2, RefreshCw, XCircle } from 'lucide-react';

type Payment = {
  id: number;
  booking_id: number;
  user_name: string;
  user_email?: string;
  studio_name: string;
  date: string;
  start_time?: string;
  end_time?: string;
  amount: number;
  method: string;
  status: string;
  proof_url?: string;
};

async function readJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || `เกิดข้อผิดพลาด (${res.status})`);
  return data;
}

const statusText: Record<string, string> = { pending: 'รอตรวจสอบ', paid: 'ชำระแล้ว', rejected: 'ปฏิเสธ' };

export default function AdminPayments() {
  const [rows, setRows] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/payments/all', { credentials: 'include' });
      const data = await readJson(res);
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || 'ไม่สามารถโหลดรายการชำระเงินได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const update = async (id: number, status: 'paid' | 'rejected') => {
    setUpdating(id);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`/api/payments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      await readJson(res);
      setMessage(status === 'paid' ? 'อนุมัติการชำระเงินแล้ว' : 'ปฏิเสธการชำระเงินแล้ว');
      await load();
    } catch (e: any) {
      setError(e.message || 'ไม่สามารถอัปเดตสถานะการชำระเงินได้');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">การชำระเงิน</h1>
          <p className="text-zinc-500 text-sm mt-1">ตรวจสอบ อนุมัติ หรือปฏิเสธรายการชำระเงินของลูกค้า</p>
        </div>
        <button onClick={load} disabled={loading} className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 rounded-lg text-zinc-300 hover:bg-white/5 disabled:opacity-50"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> รีเฟรช</button>
      </div>

      {error && <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
      {message && <div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300"><CheckCircle2 className="w-4 h-4 shrink-0" />{message}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#111114] border border-white/6 rounded-xl p-4"><p className="text-zinc-500 text-xs">ทั้งหมด</p><p className="text-2xl font-bold text-white mt-1">{rows.length}</p></div>
        <div className="bg-[#111114] border border-white/6 rounded-xl p-4"><p className="text-zinc-500 text-xs">รอตรวจสอบ</p><p className="text-2xl font-bold text-amber-400 mt-1">{rows.filter(p => p.status === 'pending').length}</p></div>
        <div className="bg-[#111114] border border-white/6 rounded-xl p-4"><p className="text-zinc-500 text-xs">ชำระแล้ว</p><p className="text-2xl font-bold text-green-400 mt-1">{rows.filter(p => p.status === 'paid').length}</p></div>
        <div className="bg-[#111114] border border-white/6 rounded-xl p-4"><p className="text-zinc-500 text-xs">ยอดที่ชำระแล้ว</p><p className="text-2xl font-bold text-violet-400 mt-1">฿{rows.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString()}</p></div>
      </div>

      <div className="bg-[#111114] border border-white/6 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-zinc-400"><Loader2 className="w-6 h-6 animate-spin mr-2" />กำลังโหลดรายการชำระเงิน...</div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 text-zinc-500"><CreditCard className="w-10 h-10 mx-auto mb-3 text-zinc-600" /><p>ยังไม่มีรายการชำระเงิน</p><p className="text-xs mt-1">เมื่อมีลูกค้าชำระเงิน รายการจะแสดงที่หน้านี้</p></div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead><tr className="text-zinc-500 border-b border-white/6"><th className="p-4 text-left">ลูกค้า</th><th className="p-4 text-left">ห้อง / วันเวลา</th><th className="p-4 text-left">ยอด</th><th className="p-4 text-left">วิธี</th><th className="p-4 text-left">สถานะ</th><th className="p-4 text-right">จัดการ</th></tr></thead>
              <tbody>
                {rows.map(p => (
                  <tr key={p.id} className="border-b border-white/4 hover:bg-white/[0.02]">
                    <td className="p-4 text-white"><div className="font-medium">{p.user_name}</div><div className="text-xs text-zinc-500">{p.user_email || ''}</div></td>
                    <td className="p-4 text-zinc-300"><div>{p.studio_name}</div><div className="text-xs text-zinc-500">{p.date} {p.start_time && `• ${p.start_time}-${p.end_time || ''}`}</div></td>
                    <td className="p-4 text-white font-semibold">฿{Number(p.amount).toLocaleString()}</td>
                    <td className="p-4 text-zinc-400">{p.method}</td>
                    <td className="p-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs ${p.status === 'paid' ? 'bg-green-500/10 text-green-400' : p.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>{statusText[p.status] || p.status}</span></td>
                    <td className="p-4 text-right">
                      {p.status === 'pending' ? <div className="flex justify-end gap-2">
                        <button disabled={updating === p.id} onClick={() => update(p.id, 'paid')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 disabled:opacity-50"><CheckCircle2 className="w-4 h-4" />อนุมัติ</button>
                        <button disabled={updating === p.id} onClick={() => update(p.id, 'rejected')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50"><XCircle className="w-4 h-4" />ปฏิเสธ</button>
                      </div> : <span className="text-zinc-600 text-xs">ดำเนินการแล้ว</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
