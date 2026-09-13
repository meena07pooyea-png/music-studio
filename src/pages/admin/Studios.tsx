import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, DoorOpen, Loader2, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';

type Studio = {
  id: number;
  name: string;
  description: string;
  price_per_hour: number;
  equipment: string;
  status: string;
  image_url?: string;
};

type StudioForm = Omit<Studio, 'id'>;

const empty: StudioForm = {
  name: '',
  description: '',
  price_per_hour: 300,
  equipment: '',
  status: 'available',
  image_url: '',
};

async function readJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || `เกิดข้อผิดพลาด (${res.status})`);
  return data;
}

export default function AdminStudios() {
  const [rows, setRows] = useState<Studio[]>([]);
  const [form, setForm] = useState<StudioForm>(empty);
  const [editing, setEditing] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/studios', { credentials: 'include' });
      const data = await readJson(res);
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || 'ไม่สามารถโหลดข้อมูลห้องซ้อมได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name.trim() || Number(form.price_per_hour) <= 0) {
      setError('กรุณากรอกชื่อห้องและราคาที่มากกว่า 0');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const url = editing ? `/api/studios/${editing}` : '/api/studios';
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      await readJson(res);
      setForm(empty);
      setEditing(null);
      setMessage(editing ? 'บันทึกการแก้ไขห้องสำเร็จ' : 'เพิ่มห้องซ้อมสำเร็จ');
      await load();
    } catch (e: any) {
      setError(e.message || 'บันทึกข้อมูลไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: number) => {
    if (!window.confirm('ลบห้องนี้หรือไม่?')) return;
    setError('');
    setMessage('');
    try {
      const res = await fetch(`/api/studios/${id}`, { method: 'DELETE', credentials: 'include' });
      await readJson(res);
      setMessage('ลบห้องซ้อมสำเร็จ');
      await load();
    } catch (e: any) {
      setError(e.message || 'ไม่สามารถลบห้องได้');
    }
  };

  const startEdit = (studio: Studio) => {
    setEditing(studio.id);
    setForm({
      name: studio.name || '',
      description: studio.description || '',
      price_per_hour: Number(studio.price_per_hour) || 0,
      equipment: studio.equipment || '',
      status: studio.status || 'available',
      image_url: studio.image_url || '',
    });
    setError('');
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(empty);
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">จัดการห้องซ้อม</h1>
          <p className="text-zinc-500 text-sm mt-1">เพิ่ม แก้ไข ลบ และจัดการสถานะห้องจากฐานข้อมูลจริง</p>
        </div>
        <button onClick={load} disabled={loading} className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 rounded-lg text-zinc-300 hover:bg-white/5 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> รีเฟรช
        </button>
      </div>

      {error && <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
      {message && <div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300"><CheckCircle2 className="w-4 h-4 shrink-0" />{message}</div>}

      <div className="bg-[#111114] border border-white/6 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4 text-white font-semibold">
          {editing ? <Pencil className="w-4 h-4 text-violet-400" /> : <Plus className="w-4 h-4 text-violet-400" />}
          {editing ? 'แก้ไขห้องซ้อม' : 'เพิ่มห้องซ้อมใหม่'}
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <input placeholder="ชื่อห้อง" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-violet-500" />
          <input type="number" min="1" placeholder="ราคา/ชั่วโมง" value={form.price_per_hour} onChange={e => setForm({ ...form, price_per_hour: Number(e.target.value) })} className="bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-violet-500" />
          <input placeholder="รายละเอียด" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-violet-500" />
          <input placeholder="อุปกรณ์ เช่น กลอง, แอมป์, ไมค์" value={form.equipment} onChange={e => setForm({ ...form, equipment: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-violet-500" />
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="bg-[#1b1b20] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-violet-500">
            <option value="available">พร้อมให้บริการ</option>
            <option value="maintenance">ปิดปรับปรุง</option>
          </select>
          <input placeholder="URL รูปภาพ (ถ้ามี)" value={form.image_url || ''} onChange={e => setForm({ ...form, image_url: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-violet-500" />
          <div className="md:col-span-2 flex gap-2">
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 px-5 py-2.5 rounded-lg text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {saving ? 'กำลังบันทึก...' : editing ? 'บันทึกการแก้ไข' : 'เพิ่มห้อง'}
            </button>
            {editing && <button onClick={cancelEdit} className="inline-flex items-center gap-2 border border-white/10 px-5 rounded-lg text-zinc-300 hover:bg-white/5"><X className="w-4 h-4" />ยกเลิก</button>}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400"><Loader2 className="w-6 h-6 animate-spin mr-2" />กำลังโหลดห้องซ้อม...</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 bg-[#111114] border border-white/6 rounded-xl text-zinc-500"><DoorOpen className="w-10 h-10 mx-auto mb-3 text-zinc-600" /><p>ยังไม่มีข้อมูลห้องซ้อม</p></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map(s => (
            <div key={s.id} className="bg-[#111114] border border-white/6 rounded-xl p-5">
              {s.image_url && <img src={s.image_url} alt={s.name} className="w-full h-36 object-cover rounded-lg mb-4" />}
              <div className="flex justify-between gap-3">
                <h3 className="text-white font-semibold">{s.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${s.status === 'maintenance' ? 'bg-orange-500/10 text-orange-400' : 'bg-green-500/10 text-green-400'}`}>{s.status === 'maintenance' ? 'ปิดปรับปรุง' : 'พร้อมให้บริการ'}</span>
              </div>
              <p className="text-zinc-500 text-sm mt-2 min-h-10">{s.description || 'ไม่มีรายละเอียด'}</p>
              <p className="text-violet-400 mt-3 font-semibold">฿{Number(s.price_per_hour).toLocaleString()}/ชม.</p>
              <p className="text-zinc-400 text-xs mt-2">{s.equipment || 'ไม่ได้ระบุอุปกรณ์'}</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => startEdit(s)} className="flex-1 inline-flex items-center justify-center gap-2 border border-white/10 rounded-lg py-2 text-zinc-300 hover:bg-white/5"><Pencil className="w-4 h-4" />แก้ไข</button>
                <button onClick={() => del(s.id)} className="inline-flex items-center gap-2 border border-red-500/20 text-red-400 rounded-lg px-4 hover:bg-red-500/10"><Trash2 className="w-4 h-4" />ลบ</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
