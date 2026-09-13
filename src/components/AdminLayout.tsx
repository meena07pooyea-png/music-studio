import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Music, LayoutDashboard, CalendarDays, CreditCard, Users, BarChart3,
  Bell, Settings, LogOut, ChevronLeft, ChevronRight, DoorOpen, BookOpen,
  Clock, Menu, X, User as UserIcon
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/studios', label: 'จัดการห้องซ้อม', icon: DoorOpen },
  { path: '/admin/room-status', label: 'สถานะห้อง', icon: Clock },
  { path: '/admin/bookings', label: 'รายการจอง', icon: BookOpen },
  { path: '/admin/calendar', label: 'ปฏิทินการจอง', icon: CalendarDays },
  { path: '/admin/payments', label: 'การชำระเงิน', icon: CreditCard },
  { path: '/admin/customers', label: 'ลูกค้า', icon: Users },
  { path: '/admin/reports', label: 'รายงาน', icon: BarChart3 },
  { path: '/admin/notifications', label: 'การแจ้งเตือน', icon: Bell, badge: 3 },
  { path: '/admin/settings', label: 'ตั้งค่าระบบ', icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path) && (path !== '/admin' || location.pathname === '/admin');

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/8 ${collapsed ? 'justify-center' : ''}`}>
        <div className="shrink-0 bg-violet-600 p-2 rounded-xl shadow-lg shadow-violet-900/40">
          <Music className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-display font-bold text-sm text-white leading-none">Music Studio</p>
            <p className="text-[10px] text-violet-400 mt-0.5 font-medium tracking-widest uppercase">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
        <div className="px-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative
                  ${active
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-900/50'
                    : 'text-zinc-400 hover:text-white hover:bg-white/6'
                  } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-zinc-500 group-hover:text-white'}`} />
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="bg-violet-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>
                )}
                {collapsed && item.badge && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/8 p-3 space-y-1">
        <div className={`flex items-center gap-3 px-2 py-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="shrink-0 w-8 h-8 rounded-full bg-violet-900/60 border border-violet-700/50 flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-violet-300" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>ออกจากระบบ</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#0c0c0e]">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 transition-all duration-300 bg-[#111114] border-r border-white/6
          ${collapsed ? 'w-16' : 'w-60'}`}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-[calc(var(--sidebar-w)-12px)] z-10 w-5 h-5 bg-zinc-800 border border-white/10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors hidden md:flex"
          style={{ '--sidebar-w': collapsed ? '64px' : '240px' } as React.CSSProperties}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#111114] border-r border-white/6 z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="shrink-0 h-14 flex items-center justify-between px-4 md:px-6 border-b border-white/6 bg-[#0f0f12]">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1.5 text-zinc-400 hover:text-white" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <button
              className="hidden md:flex p-1.5 text-zinc-500 hover:text-white transition-colors"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/notifications" className="relative p-2 text-zinc-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-violet-500 rounded-full" />
            </Link>
            <div className="w-8 h-8 rounded-full bg-violet-900/60 border border-violet-700/40 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-violet-300" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
