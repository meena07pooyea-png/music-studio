import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Music, LogOut, User as UserIcon, Calendar, Menu, X, Settings, Home, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'admin';

  const navLinks = [
    { name: 'หน้าแรก', path: '/', icon: Home, show: true },
    { name: 'ค้นหาสตูดิโอ', path: '/studios', icon: Music, show: true },
    { name: 'ประวัติการจอง', path: '/my-bookings', icon: Calendar, show: !isAdmin },
    { name: 'Dashboard', path: '/admin', icon: Settings, show: isAdmin },
    { name: 'จัดการการจอง', path: '/admin/bookings', icon: Calendar, show: isAdmin },
    { name: 'จัดการสตูดิโอ', path: '/admin/studios', icon: Music, show: isAdmin },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Music className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Music Studio</span>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.filter(l => l.show).map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link 
                  key={link.path} 
                  to={link.path}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 text-sm font-medium hover:bg-muted px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-border"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <span>{user.name}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl overflow-hidden py-1">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      {isAdmin && <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-violet-400 hover:bg-violet-500/10 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        แผงควบคุม Admin
                      </Link>}
                      <Link 
                        to="/profile" 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-muted-foreground" />
                        โปรไฟล์ส่วนตัว
                      </Link>
                      <Link 
                        to="/profile?tab=settings" 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        การตั้งค่า
                      </Link>
                    </div>
                    <div className="border-t border-border py-1">
                      <button 
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        ออกจากระบบ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">เข้าสู่ระบบ</Link>
                <Link to="/register" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">สมัครสมาชิก</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-4">
          <nav className="flex flex-col gap-4">
            {navLinks.filter(l => l.show).map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link 
                  key={link.path} 
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 text-base font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <Icon className="w-5 h-5" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
          <div className="pt-4 border-t border-border">
            {user ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Link 
                  to="/profile" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-muted-foreground font-medium px-2 hover:text-foreground"
                >
                  <UserIcon className="w-5 h-5" />
                  โปรไฟล์และการตั้งค่า
                </Link>
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 font-medium text-red-500 px-2 hover:bg-red-500/10 py-2 rounded-lg"
                >
                  <LogOut className="w-5 h-5" />
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="font-medium text-center border border-border py-2 rounded-lg">เข้าสู่ระบบ</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="font-medium text-center bg-primary text-primary-foreground py-2 rounded-lg">สมัครสมาชิก</Link>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border py-8 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-muted-foreground" />
            <span className="font-display font-bold text-muted-foreground">Music Studio</span>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Music Studio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}