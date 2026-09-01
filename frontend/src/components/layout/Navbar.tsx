import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Wrench, Menu, X, Search, Bell, User, LogOut, Home, List, Bookmark, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { classNames } from '@/utils';
import { mockGetNotifications } from '@/services/mockData';
import type { Notification } from '@/types';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (isAuthenticated) {
      mockGetNotifications().then((list) => setNotifications(list.filter((n) => n.type !== 'message')));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setMobileOpen(false);
    setNotifOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/tools?search=${encodeURIComponent(search)}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/tools', label: 'Browse Tools', icon: List },
    { to: '/tools/my-tools', label: 'My Tools', icon: Bookmark },
    { to: '/bookings', label: 'Bookings', icon: Bookmark },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center">
              <Wrench className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-gray-900">ToolShare</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  classNames(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Search bar (desktop) */}
          <form onSubmit={handleSearch} className="hidden xl:flex items-center relative">
            <Search className="absolute left-3 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools..."
              className="w-56 pl-10 pr-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
            />
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-accent-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 animate-slide-up overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                            }}
                            className="text-xs text-primary-600 font-semibold hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                        {notifications.length === 0 ? (
                          <p className="px-4 py-8 text-center text-sm text-gray-500">No notifications</p>
                        ) : (
                          notifications.map((n) => (
                            <button
                              key={n.id}
                              type="button"
                              onClick={() => {
                                setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)));
                                setNotifOpen(false);
                                if (n.type === 'booking') navigate('/bookings');
                                else if (n.type === 'message') navigate('/chat');
                                else if (n.type === 'review') navigate('/tools/my-tools');
                              }}
                              className={classNames('w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start justify-between gap-2', !n.read && 'bg-primary-50/60')}
                            >
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                                  {n.title}
                                  {!n.read && <span className="w-2 h-2 rounded-full bg-accent-500 shrink-0" />}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.body}</p>
                              </div>
                              <span className="text-[10px] text-gray-400 shrink-0">Click to view</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 rounded-lg pl-1 pr-2 py-1 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                      {user?.firstName?.[0] ?? 'U'}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.firstName}</span>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 animate-slide-up overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <User size={16} /> My Profile
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-purple-700 font-semibold bg-purple-50/50 hover:bg-purple-100/70 transition-colors">
                          <ShieldCheck size={16} className="text-purple-600" /> Admin Control Panel
                        </Link>
                      )}
                      <Link to="/tools/my-tools" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Bookmark size={16} /> My Tools
                      </Link>
                      <Link to="/bookings" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <List size={16} /> Bookings
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/auth/login" className="btn-secondary">Login</Link>
                <Link to="/auth/register" className="btn-primary">Register</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-200 py-3 animate-slide-up">
            <form onSubmit={handleSearch} className="relative mb-3 px-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tools..."
                className="w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:border-primary-500 focus:outline-none"
              />
            </form>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  classNames(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:bg-gray-100'
                  )
                }
              >
                <link.icon size={18} />
                {link.label}
              </NavLink>
            ))}
            {!isAuthenticated && (
              <div className="flex gap-2 mt-3 px-1">
                <Link to="/auth/login" className="btn-secondary flex-1">Login</Link>
                <Link to="/auth/register" className="btn-primary flex-1">Register</Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
