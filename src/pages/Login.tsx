import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Lock, Mail, Music, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type LoginMode = 'user' | 'admin';

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [mode, setMode] = useState<LoginMode>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = mode === 'admin';

  const handleModeChange = (nextMode: LoginMode) => {
    setMode(nextMode);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }

      // The selected login mode must match the account role returned by the API.
      if (isAdmin && data.role !== 'admin') {
        throw new Error('บัญชีนี้เป็นบัญชีผู้ใช้งานทั่วไป กรุณาเลือก “ผู้ใช้งาน”');
      }

      if (!isAdmin && data.role === 'admin') {
        throw new Error('บัญชีนี้เป็นบัญชีแอดมิน กรุณาเลือก “แอดมิน”');
      }

      setUser(data);
      navigate(isAdmin ? '/admin' : '/studios');
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full py-10">
      <div className="bg-card p-7 sm:p-8 rounded-2xl border border-border shadow-xl">
        <div className="flex flex-col items-center text-center mb-7">
          <div className="bg-violet-600 p-3 rounded-2xl shadow-lg shadow-violet-900/30 mb-4">
            <Music className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">เข้าสู่ระบบ</h1>
          <p className="text-muted-foreground text-sm">
            เลือกประเภทบัญชีที่ต้องการเข้าสู่ระบบ
          </p>
        </div>

        {/* One login page for both users and admins */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-muted rounded-xl mb-6">
          <button
            type="button"
            onClick={() => handleModeChange('user')}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              !isAdmin
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserRound className="w-4 h-4" />
            ผู้ใช้งาน
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('admin')}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              isAdmin
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            แอดมิน
          </button>
        </div>

        {isAdmin && (
          <div className="flex items-start gap-3 bg-violet-500/10 border border-violet-500/20 text-violet-300 p-3 rounded-xl text-sm mb-6">
            <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-violet-200">เข้าสู่ระบบสำหรับแอดมิน</p>
              <p className="text-violet-300/80 mt-0.5">บัญชีแอดมินจะเข้าสู่ระบบจัดการหลังบ้านโดยอัตโนมัติ</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">อีเมล</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={isAdmin ? 'admin@musicstudio.local' : 'example@email.com'}
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">รหัสผ่าน</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border border-border rounded-lg pl-10 pr-11 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(value => !value)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-violet-600"
              />
              จดจำฉัน
            </label>
            <button type="button" className="text-primary hover:underline">
              ลืมรหัสผ่าน?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-medium py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors mt-2"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : isAdmin ? 'เข้าสู่ระบบ Admin' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        {!isAdmin && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            ยังไม่มีบัญชี?{' '}
            <Link to="/register" className="text-primary hover:underline">สมัครใช้งาน</Link>
          </div>
        )}
      </div>
    </div>
  );
}
