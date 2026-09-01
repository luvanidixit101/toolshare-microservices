import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Wrench, Calendar, Users, DollarSign, Trash2, CheckCircle2,
  XCircle, Server, RefreshCw, Layers, ShieldAlert,
} from 'lucide-react';
import { getAdminStats, getAllAdminTools, getAllAdminBookings, type SystemStats } from '@/services/adminService';
import { deleteTool } from '@/services/toolService';
import { approveBooking, cancelBooking } from '@/services/bookingService';
import type { Tool, Booking } from '@/types';
import { formatPrice, formatDate, bookingStatusConfig, classNames, getToolImage } from '@/utils';
import { FullPageSpinner } from '@/components/common/LoadingSpinner';
import { toast } from '@/components/common/Toast';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'tools' | 'bookings' | 'users' | 'services'>('tools');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [s, t, b] = await Promise.all([
        getAdminStats(),
        getAllAdminTools(),
        getAllAdminBookings(),
      ]);
      setStats(s);
      setTools(t);
      setBookings(b);
    } catch {
      toast('error', 'Failed to refresh admin data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleDeleteTool = async (id: string) => {
    if (!confirm('Admin Action: Are you sure you want to remove this tool listing from the platform?')) return;
    setActionLoading(id);
    try {
      await deleteTool(id);
      setTools((prev) => prev.filter((t) => t.id !== id));
      toast('success', 'Admin Action: Tool listing removed.');
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast('error', e?.message || 'Failed to remove tool.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveBooking = async (b: Booking) => {
    setActionLoading(b.id);
    try {
      await approveBooking(b.id);
      setBookings((prev) => prev.map((x) => (x.id === b.id ? { ...x, status: 'APPROVED' } : x)));
      toast('success', 'Admin Action: Booking override approved.');
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast('error', e?.message || 'Failed to approve booking.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async (b: Booking) => {
    setActionLoading(b.id);
    try {
      await cancelBooking(b.id);
      setBookings((prev) => prev.map((x) => (x.id === b.id ? { ...x, status: 'CANCELLED' } : x)));
      toast('success', 'Admin Action: Booking cancelled.');
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast('error', e?.message || 'Failed to cancel booking.');
    } finally {
      setActionLoading(null);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="card p-8 bg-red-50/70 border border-red-200 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-xl font-bold text-red-800">Access Denied — Admin Role Only</h2>
          <p className="text-xs text-gray-600 mt-2 leading-relaxed">
            Admin control functions are strictly restricted to accounts with the <strong className="text-red-700 font-mono">ADMIN</strong> role. Standard users do not have permission to access these controls.
          </p>
          <Link to="/" className="btn-primary inline-block mt-5 text-xs px-4 py-2">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <FullPageSpinner label="Loading Admin Control Center..." />;

  const serviceNodes = [
    { name: 'API Gateway', port: 8080, status: 'ONLINE', route: '/api/**' },
    { name: 'Auth Service', port: 8081, status: 'ONLINE', route: '/api/auth/**' },
    { name: 'User Service', port: 8082, status: 'ONLINE', route: '/api/users/**' },
    { name: 'Tool Service', port: 8083, status: 'ONLINE', route: '/api/tools/**' },
    { name: 'Booking Service', port: 8084, status: 'ONLINE', route: '/api/bookings/**' },
    { name: 'Chat Service', port: 8085, status: 'ONLINE', route: '/api/chat/**' },
    { name: 'Payment Service', port: 8086, status: 'ONLINE', route: '/api/payments/**' },
    { name: 'AI Service', port: 8087, status: 'ONLINE', route: '/api/ai/**' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-gray-900 rounded-2xl p-6 mb-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Admin Control Center</h1>
              <p className="text-purple-200/80 text-xs mt-0.5">
                Polyglot Microservices Operations & Moderation Console
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            disabled={refreshing}
            className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold px-4 py-2 flex items-center gap-2"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh Data
          </button>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Platform Healthy
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Wrench size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Tools</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalTools}</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Bookings</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Active Rentals</p>
              <p className="text-xl font-bold text-gray-900">{stats.activeBookings}</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">System Users</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3 col-span-2 lg:col-span-1">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Platform Volume</p>
              <p className="text-xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('tools')}
          className={classNames(
            'px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap',
            activeTab === 'tools'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <Wrench size={16} /> Tool Catalog ({tools.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={classNames(
            'px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap',
            activeTab === 'bookings'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <Calendar size={16} /> Booking Overrides ({bookings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={classNames(
            'px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap',
            activeTab === 'services'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <Server size={16} /> Microservices Health
        </button>
      </div>

      {/* Tools Moderation Tab */}
      {activeTab === 'tools' && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">Tool Listing Moderation Console</h3>
            <span className="text-xs text-gray-500">Admins can remove or edit any community listing</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Tool Details</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Owner</th>
                  <th className="px-6 py-3">Daily Rate</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tools.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                      <img
                        src={getToolImage(t.images, t.category)}
                        alt={t.name}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{t.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-xs">{t.location || 'Community Location'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">{t.ownerName || 'DIXIT LUVANI'}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{formatPrice(t.pricePerDay)}/day</td>
                    <td className="px-6 py-4">
                      <span className={classNames('badge text-xs', t.available ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600')}>
                        {t.available ? 'Available' : 'Rented'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteTool(t.id)}
                        disabled={actionLoading === t.id}
                        className="btn bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs px-3 py-1.5 font-bold flex items-center gap-1 ml-auto"
                      >
                        <Trash2 size={14} /> Remove Listing
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Overrides Tab */}
      {activeTab === 'bookings' && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">Booking Override & Resolution Console</h3>
            <span className="text-xs text-gray-500">Admins can force approve or cancel disputed bookings</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Booking ID</th>
                  <th className="px-6 py-3">Tool Name</th>
                  <th className="px-6 py-3">Renter & Owner</th>
                  <th className="px-6 py-3">Dates</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Admin Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((b) => {
                  const config = bookingStatusConfig[b.status];
                  return (
                    <tr key={b.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{b.id.slice(0, 8)}...</td>
                      <td className="px-6 py-4 font-bold text-gray-900">{b.toolName}</td>
                      <td className="px-6 py-4 text-xs">
                        <p><span className="font-semibold text-gray-700">Renter:</span> {b.renterName || 'Renter'}</p>
                        <p><span className="font-semibold text-gray-700">Owner:</span> {b.ownerName || 'Owner'}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-700">
                        {formatDate(b.startDate)} - {formatDate(b.endDate)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={classNames('badge px-2.5 py-1 text-xs font-bold', config.color)}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          {b.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => handleApproveBooking(b)}
                              disabled={actionLoading === b.id}
                              className="btn bg-green-600 hover:bg-green-700 text-white text-xs px-2.5 py-1.5 font-bold flex items-center gap-1"
                            >
                              <CheckCircle2 size={14} /> Force Approve
                            </button>
                          )}
                          {(b.status === 'PENDING' || b.status === 'APPROVED' || b.status === 'ACTIVE') && (
                            <button
                              type="button"
                              onClick={() => handleCancelBooking(b)}
                              disabled={actionLoading === b.id}
                              className="btn bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs px-2.5 py-1.5 font-bold flex items-center gap-1"
                            >
                              <XCircle size={14} /> Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Microservices Health Tab */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {serviceNodes.map((s) => (
            <div key={s.name} className="card p-5 border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <Server size={16} className="text-emerald-600" /> {s.name}
                </h4>
                <span className="badge bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  {s.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-mono">Port: {s.port}</p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">Route: {s.route}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
