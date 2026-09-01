import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon, Mail, MapPin, Calendar, Lock, Bell, LogOut,
  Trash2, Edit3, Save,
} from 'lucide-react';
import { getProfile, updateProfile, changePassword, deleteAccount } from '@/services/profileService';
import type { User } from '@/types';
import { formatDate, classNames } from '@/utils';
import StarRating from '@/components/common/StarRating';
import { FullPageSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/EmptyState';
import Modal from '@/components/common/Modal';
import { toast } from '@/components/common/Toast';
import { useAuth } from '@/context/AuthContext';

type Tab = 'profile' | 'security' | 'preferences' | 'account';

export default function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [editing, setEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '', location: '', bio: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [prefs, setPrefs] = useState({ email: true, booking: true, chat: true });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    getProfile()
      .then((p) => {
        setProfile(p);
        setEditForm({
          firstName: p.firstName,
          lastName: p.lastName,
          phone: p.phone || '',
          location: p.location || '',
          bio: p.bio || '',
        });
      })
      .catch((err) => setError(err?.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const updated = await updateProfile(editForm);
      setProfile(updated);
      setEditing(false);
      toast('success', 'Profile updated successfully!');
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast('error', e?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword.length < 8) {
      toast('error', 'Password must be at least 8 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast('error', 'New passwords do not match.');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast('success', 'Password changed successfully!');
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast('error', e?.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      await logout();
      toast('success', 'Account deleted.');
      navigate('/');
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast('error', e?.message || 'Failed to delete account.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <FullPageSpinner label="Loading profile..." />;
  if (error) return <div className="max-w-3xl mx-auto py-12"><ErrorState message={error} onRetry={load} /></div>;
  if (!profile) return null;

  const tabs: { key: Tab; label: string; icon: typeof UserIcon }[] = [
    { key: 'profile', label: 'Profile', icon: UserIcon },
    { key: 'security', label: 'Security', icon: Lock },
    { key: 'preferences', label: 'Preferences', icon: Bell },
    { key: 'account', label: 'Account', icon: LogOut },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* Profile header card */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.firstName} className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-3xl font-bold">
              {profile.firstName[0]}
            </div>
          )}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h2>
            <p className="text-sm text-gray-500 flex items-center justify-center sm:justify-start gap-1 mt-1">
              <Mail size={14} /> {profile.email}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-gray-500">
              {profile.location && <span className="flex items-center gap-1"><MapPin size={14} /> {profile.location}</span>}
              <span className="flex items-center gap-1"><Calendar size={14} /> Joined {formatDate(profile.memberSince)}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
              <StarRating value={profile.rating} size={16} showValue />
              <span className="text-sm text-gray-400">({profile.reviewCount} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={classNames(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === tab.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Profile Information</h3>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn-secondary text-sm">
                <Edit3 size={14} /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button>
                <button onClick={handleSaveProfile} disabled={savingProfile} className="btn-primary text-sm">
                  <Save size={14} /> {savingProfile ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
          {!editing ? (
            <dl className="grid sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-gray-400 mb-1">First Name</dt>
                <dd className="text-sm font-medium text-gray-900">{profile.firstName}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 mb-1">Last Name</dt>
                <dd className="text-sm font-medium text-gray-900">{profile.lastName}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 mb-1">Email</dt>
                <dd className="text-sm font-medium text-gray-900">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 mb-1">Phone</dt>
                <dd className="text-sm font-medium text-gray-900">{profile.phone || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 mb-1">Location</dt>
                <dd className="text-sm font-medium text-gray-900">{profile.location || 'Not provided'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-gray-400 mb-1">Bio</dt>
                <dd className="text-sm text-gray-700">{profile.bio || 'No bio added yet.'}</dd>
              </div>
            </dl>
          ) : (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input type="text" value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input type="text" value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} className="input" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone</label>
                  <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="label">Location</label>
                  <input type="text" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} className="input" />
                </div>
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={3} className="input resize-none" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Security tab */}
      {activeTab === 'security' && (
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="label">Current Password</label>
              <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="input" />
            </div>
            <button onClick={handleChangePassword} disabled={savingPassword} className="btn-primary">
              {savingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>
      )}

      {/* Preferences tab */}
      {activeTab === 'preferences' && (
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            {[
              { key: 'email' as const, label: 'Email Notifications', desc: 'Receive emails about your account activity and updates.' },
              { key: 'booking' as const, label: 'Booking Notifications', desc: 'Get notified when your bookings are updated or confirmed.' },
              { key: 'chat' as const, label: 'Chat Notifications', desc: 'Get notified when you receive new messages.' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <button
                  onClick={() => setPrefs((p) => ({ ...p, [item.key]: !p[item.key] }))}
                  className={classNames(
                    'relative w-12 h-6 rounded-full transition-colors shrink-0',
                    prefs[item.key] ? 'bg-primary-600' : 'bg-gray-300'
                  )}
                >
                  <span className={classNames('absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform', prefs[item.key] ? 'translate-x-6' : 'translate-x-0.5')} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account tab */}
      {activeTab === 'account' && (
        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Sign Out</h3>
            <p className="text-sm text-gray-500 mb-4">Sign out of your ToolShare account on this device.</p>
            <button onClick={handleLogout} className="btn-secondary">
              <LogOut size={16} /> Logout
            </button>
          </div>
          <div className="card p-6 border-red-200">
            <h3 className="font-semibold text-red-700 mb-2">Delete Account</h3>
            <p className="text-sm text-gray-500 mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
            <button onClick={() => setDeleteOpen(true)} className="btn-danger">
              <Trash2 size={16} /> Delete Account
            </button>
          </div>
        </div>
      )}

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Account?"
        footer={
          <>
            <button onClick={() => setDeleteOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleDeleteAccount} disabled={deleting} className="btn-danger">
              {deleting ? 'Deleting...' : 'Delete My Account'}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          This will permanently delete your account, all your tool listings, bookings, and messages. This action <span className="font-semibold">cannot be undone</span>. Are you absolutely sure?
        </p>
      </Modal>
    </div>
  );
}
