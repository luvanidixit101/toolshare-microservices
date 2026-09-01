import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, User, Phone, Check } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/common/Toast';
import { classNames } from '@/utils';

import { GoogleLoginButton } from '@/components/common/GoogleLoginButton';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  const handlePhoneChange = (val: string) => {
    let digits = val.replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length > 10) {
      digits = digits.slice(2);
    }
    digits = digits.slice(0, 10);
    update('phone', digits);
  };

  const passwordChecks = {
    length: form.password.length >= 8,
    match: form.password === form.confirmPassword && form.password.length > 0,
    hasUpper: /[A-Z]/.test(form.password),
    hasNumber: /\d/.test(form.password),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.firstName.trim()) {
      setError('Please enter your first name.');
      return;
    }
    if (!form.lastName.trim()) {
      setError('Please enter your last name.');
      return;
    }
    if (!form.email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!form.phone) {
      setError('Please enter your 10-digit mobile number.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError('Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!passwordChecks.hasUpper || !passwordChecks.hasNumber) {
      setError('Password must include at least one uppercase letter and one number.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: `+91${form.phone}`,
        password: form.password,
      });
      toast('success', 'Account created! Welcome to ToolShare.');
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Your Account" subtitle="Join ToolShare and start sharing tools today">
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <GoogleLoginButton
          label="Sign up with Google"
          onSuccess={() => {
            toast('success', 'Google Registration successful!');
            navigate('/', { replace: true });
          }}
          onError={(err) => setError(err)}
        />

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500 font-medium">Or register with email</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">First Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                placeholder="Aarav"
                className="input pl-10"
              />
            </div>
          </div>
          <div>
            <label className="label">Last Name</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              placeholder="Sharma"
              className="input"
            />
          </div>
        </div>
        <div>
          <label className="label">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="aarav.sharma@example.com"
              className="input pl-10"
            />
          </div>
        </div>
        <div>
          <label className="label">Mobile Number</label>
          <div className="relative flex rounded-lg border border-gray-300 shadow-sm focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 overflow-hidden">
            <div className="flex items-center gap-1 px-3 bg-gray-50 border-r border-gray-300 text-gray-700 text-sm font-semibold select-none">
              <span>🇮🇳</span>
              <span>+91</span>
            </div>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="98765 43210"
              maxLength={10}
              className="w-full px-3 py-2.5 text-sm bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Enter your 10-digit Indian mobile number</p>
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder="••••••••"
              className="input pl-10 pr-10"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        {form.password.length > 0 && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { ok: passwordChecks.length, label: '8+ characters' },
              { ok: passwordChecks.hasUpper, label: 'Uppercase letter' },
              { ok: passwordChecks.hasNumber, label: 'A number' },
              { ok: passwordChecks.match, label: 'Passwords match' },
            ].map((c) => (
              <div key={c.label} className={classNames('flex items-center gap-1.5', c.ok ? 'text-green-600' : 'text-gray-400')}>
                <Check size={14} className={c.ok ? 'text-green-500' : 'text-gray-300'} />
                {c.label}
              </div>
            ))}
          </div>
        )}
        <div>
          <label className="label">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              placeholder="••••••••"
              className="input pl-10"
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
