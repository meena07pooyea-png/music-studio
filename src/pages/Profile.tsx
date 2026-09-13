import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Settings, Key, Bell, Shield } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'general';

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);

  const tabs = [
    { id: 'general', label: 'ข้อมูลทั่วไป', icon: UserIcon },
    { id: 'settings', label: 'การตั้งค่าระบบ', icon: Settings },
    { id: 'security', label: 'รหัสผ่านและความปลอดภัย', icon: Shield },
    { id: 'notifications', label: 'การแจ้งเตือน', icon: Bell },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API to update the profile
    alert('บันทึกข้อมูลเรียบร้อยแล้ว');
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold mb-2">โปรไฟล์ของฉัน</h1>
        <p className="text-muted-foreground text-lg">จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชีของคุณ</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-card border border-border rounded-2xl p-6 md:p-8">
          {activeTab === 'general' && (
            <div className="space-y-8">
              <div className="flex items-center gap-6 pb-8 border-b border-border">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-4xl border-4 border-background shadow-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-muted-foreground mb-3">{user.email}</p>
                  <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full uppercase tracking-wider">
                    {user.role === 'admin' ? 'Administrator' : 'Member'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5 max-w-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">ข้อมูลส่วนตัว</h3>
                  {!isEditing && (
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(true)}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      แก้ไขข้อมูล
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">ชื่อ-นามสกุล</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    disabled={!isEditing}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">อีเมล</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={!isEditing}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                    >
                      ยกเลิก
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      บันทึกการเปลี่ยนแปลง
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold mb-6">การตั้งค่าระบบ</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                  <div>
                    <p className="font-medium">ธีมสีเข้ม (Dark Mode)</p>
                    <p className="text-sm text-muted-foreground">ใช้ธีมสีเข้มเป็นค่าเริ่มต้นเสมอ</p>
                  </div>
                  <div className="w-12 h-6 bg-primary rounded-full relative cursor-not-allowed opacity-80">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                  <div>
                    <p className="font-medium">ภาษา (Language)</p>
                    <p className="text-sm text-muted-foreground">ภาษาที่ใช้แสดงผลในระบบ</p>
                  </div>
                  <select className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm outline-none">
                    <option>ภาษาไทย</option>
                    <option>English</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 max-w-lg">
              <h3 className="text-xl font-bold mb-6">เปลี่ยนรหัสผ่าน</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">รหัสผ่านปัจจุบัน</label>
                  <input 
                    type="password" 
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">รหัสผ่านใหม่</label>
                  <input 
                    type="password" 
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">ยืนยันรหัสผ่านใหม่</label>
                  <input 
                    type="password" 
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="pt-2">
                  <button type="button" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <Key className="w-4 h-4" /> อัปเดตรหัสผ่าน
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold mb-6">การแจ้งเตือน</h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-xl gap-4">
                  <div>
                    <p className="font-medium">อีเมลแจ้งเตือนการจอง</p>
                    <p className="text-sm text-muted-foreground">รับอีเมลเมื่อการจองของคุณได้รับการยืนยันหรือยกเลิก</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-xl gap-4">
                  <div>
                    <p className="font-medium">ข่าวสารและโปรโมชั่น</p>
                    <p className="text-sm text-muted-foreground">รับข้อมูลข่าวสาร โปรโมชั่นและส่วนลดพิเศษ</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}