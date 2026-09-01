import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Eye, X, Phone, Star, User, CheckCircle2, XCircle,
} from 'lucide-react';
import { getBookings, cancelBooking, updateBookingStatus, approveBooking, rejectBooking } from '@/services/bookingService';
import type { Booking, BookingStatus } from '@/types';
import { formatPrice, formatDate, bookingStatusConfig, classNames, getToolImage } from '@/utils';
import { FullPageSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import Modal from '@/components/common/Modal';
import { toast } from '@/components/common/Toast';
import { useAuth } from '@/context/AuthContext';

const tabs: { key: BookingStatus | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

export default function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<BookingStatus | 'ALL'>('ALL');
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getBookings()
      .then(setBookings)
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setError(e?.message || 'Failed to load bookings');
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = activeTab === 'ALL' ? bookings : bookings.filter((b) => b.status === activeTab);

  const handleApprove = async (booking: Booking) => {
    setActionLoading(booking.id);
    try {
      await approveBooking(booking.id);
      setBookings((prev) => prev.map((b) => b.id === booking.id ? { ...b, status: 'APPROVED' } : b));
      toast('success', `Booking request for ${booking.toolName} approved! Renter notified.`);
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast('error', e?.message || 'Failed to approve booking.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (booking: Booking) => {
    setActionLoading(booking.id);
    try {
      await rejectBooking(booking.id);
      setBookings((prev) => prev.map((b) => b.id === booking.id ? { ...b, status: 'REJECTED' } : b));
      toast('success', `Booking request for ${booking.toolName} rejected.`);
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast('error', e?.message || 'Failed to reject booking.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setActionLoading(cancelTarget.id);
    try {
      await cancelBooking(cancelTarget.id);
      setBookings((prev) => prev.map((b) => b.id === cancelTarget.id ? { ...b, status: 'CANCELLED' } : b));
      toast('success', 'Booking cancelled.');
      setCancelTarget(null);
    } catch {
      toast('error', 'Failed to cancel booking.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReturn = async (booking: Booking) => {
    setActionLoading(booking.id);
    try {
      await updateBookingStatus(booking.id, 'COMPLETED');
      setBookings((prev) => prev.map((b) => b.id === booking.id ? { ...b, status: 'COMPLETED' } : b));
      toast('success', 'Tool marked as returned.');
    } catch {
      toast('error', 'Failed to update booking.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <FullPageSpinner label="Loading your bookings..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-500 mt-1">Manage your tool rentals and bookings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={classNames(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === tab.key
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
            {tab.key !== 'ALL' && (
              <span className="ml-1.5 text-xs text-gray-400">
                ({bookings.filter((b) => b.status === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && filtered.length === 0 && (
        <EmptyState
          title="No bookings found"
          message={activeTab === 'ALL' ? "You haven't booked any tools yet." : `No ${activeTab.toLowerCase()} bookings.`}
          icon={<Calendar size={28} />}
          action={<Link to="/tools" className="btn-primary">Browse Tools</Link>}
        />
      )}

      {!error && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((booking) => {
            const config = bookingStatusConfig[booking.status];
            const isOwner = !!user && user.id === booking.ownerId;
            return (
              <div key={booking.id} className="card p-5 transition-all hover:border-gray-300">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Tool image */}
                  <Link to={`/tools/${booking.toolId}`} className="shrink-0">
                    <img
                      src={getToolImage([booking.toolImage].filter(Boolean) as string[])}
                      alt={booking.toolName}
                      className="w-full sm:w-28 h-28 rounded-lg object-cover"
                      onError={(e) => { e.currentTarget.src = getToolImage([]); }}
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link to={`/tools/${booking.toolId}`} className="font-bold text-gray-900 text-base hover:text-primary-600 transition-colors">
                            {booking.toolName}
                          </Link>
                          {isOwner && (
                            <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full border border-purple-200 uppercase">
                              Your Tool Listing
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">Booking ID: {booking.id}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1">
                          ✓ Payment Verified
                        </span>
                        <span className={classNames('badge px-3 py-1 font-bold', config.color)}>
                          {config.label}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">{isOwner ? 'Renter Requesting' : 'Tool Owner'}</p>
                        <p className="font-semibold text-gray-800 flex items-center gap-1 text-xs">
                          <User size={13} className="text-primary-600 shrink-0" /> {isOwner ? (booking.renterName || 'Renter') : booking.ownerName}
                        </p>
                        <p className="text-xs font-semibold text-green-700 flex items-center gap-1 mt-1 font-mono">
                          <Phone size={12} className="text-green-600 shrink-0" /> {booking.ownerPhone || '+91 98765 43210'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Start Date</p>
                        <p className="font-medium text-gray-700">{formatDate(booking.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">End Date</p>
                        <p className="font-medium text-gray-700">{formatDate(booking.endDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Total Amount</p>
                        <p className="font-extrabold text-primary-600 text-base">{formatPrice(booking.totalPrice)}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                      {/* Owner Approval Controls */}
                      {isOwner && booking.status === 'PENDING' && (
                        <div className="flex items-center gap-2 mr-auto bg-amber-50 p-1.5 rounded-xl border border-amber-200">
                          <button
                            type="button"
                            onClick={() => handleApprove(booking)}
                            disabled={actionLoading === booking.id}
                            className="btn bg-green-600 hover:bg-green-700 text-white text-xs px-3.5 py-2 font-bold shadow-xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 size={15} /> Approve Request
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(booking)}
                            disabled={actionLoading === booking.id}
                            className="btn bg-white hover:bg-red-50 text-red-700 border border-red-200 text-xs px-3.5 py-2 font-bold flex items-center gap-1.5"
                          >
                            <XCircle size={15} /> Reject
                          </button>
                        </div>
                      )}

                      <Link to={`/tools/${booking.toolId}`} className="btn-secondary text-xs px-3 py-2">
                        <Eye size={14} /> View Tool
                      </Link>
                      <Link
                        to={`/payments/success?bookingId=${booking.id}&amount=${encodeURIComponent(formatPrice(booking.totalPrice))}&toolName=${encodeURIComponent(booking.toolName)}`}
                        className="btn-secondary text-xs px-3 py-2 text-primary-700 bg-primary-50 hover:bg-primary-100"
                      >
                        Receipt
                      </Link>
                      <div className="text-xs font-semibold text-green-800 bg-green-50/90 border border-green-200 px-3 py-2 rounded-xl flex items-center gap-1.5 font-mono">
                        <Phone size={13} className="text-green-600" /> Contact: {booking.ownerPhone || '+91 98765 43210'}
                      </div>
                      {booking.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleReturn(booking)}
                          disabled={actionLoading === booking.id}
                          className="btn-primary text-xs px-3 py-2"
                        >
                          <Calendar size={14} /> Return Tool
                        </button>
                      )}
                      {booking.status === 'COMPLETED' && (
                        <button className="btn-accent text-xs px-3 py-2">
                          <Star size={14} /> Leave Review
                        </button>
                      )}
                      {(booking.status === 'PENDING' || booking.status === 'APPROVED' || booking.status === 'ACTIVE') && (
                        <button
                          onClick={() => setCancelTarget(booking)}
                          disabled={actionLoading === booking.id}
                          className="btn-ghost text-xs px-3 py-2 text-red-500 hover:bg-red-50"
                        >
                          <X size={14} /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Booking?"
        footer={
          <>
            <button onClick={() => setCancelTarget(null)} className="btn-secondary">Keep Booking</button>
            <button onClick={handleCancel} disabled={actionLoading === cancelTarget?.id} className="btn-danger">
              {actionLoading === cancelTarget?.id ? 'Cancelling...' : 'Yes, Cancel'}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to cancel your booking for <span className="font-semibold">{cancelTarget?.toolName}</span>?
          You may lose your security deposit depending on the cancellation policy.
        </p>
      </Modal>
    </div>
  );
}
