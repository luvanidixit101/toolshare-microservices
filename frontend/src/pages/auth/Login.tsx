import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck, UserCheck } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/common/Toast';

import { GoogleLoginButton } from '@/components/common/GoogleLoginButton';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickLogin = async (targetEmail: string, targetPass: string, redirectTarget?: string) => {
    setError('');
    setEmail(targetEmail);
    setPassword(targetPass);
    setLoading(true);
    try {
      await login(targetEmail, targetPass);
      toast('success', `Welcome back, ${targetEmail.includes('admin') ? 'Administrator' : 'User'}!`);
      navigate(redirectTarget || (from !== '/auth/login' ? from : '/'), { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message || 'Invalid login ID or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast('success', 'Welcome back to ToolShare!');
      const destination = email.toLowerCase().includes('admin') ? '/admin' : (from !== '/auth/login' ? from : '/');
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message || 'Invalid login ID or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your ToolShare account">
      {location.search.includes('session=expired') && !email && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          <AlertCircle size={16} /> Your session expired. Please sign in again.
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aarav.sharma@example.com"
              className="input pl-10"
              autoComplete="email"
            />
          </div>
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input pl-10 pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            Remember me
          </label>
          <Link to="/auth/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Forgot password?
          </Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500 font-medium">Or continue with</span>
          </div>
        </div>

        <GoogleLoginButton
          onSuccess={() => {
            toast('success', 'Google Login successful!');
            navigate(from !== '/auth/login' ? from : '/', { replace: true });
          }}
          onError={(err) => setError(err)}
        />

        {/* Quick Fill Demo Logins */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider text-center">Quick Fill Demo Accounts</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('alex.morgan@example.com', 'password123', '/')}
              className="btn bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs py-2 font-medium flex items-center justify-center gap-1.5"
            >
              <UserCheck size={14} className="text-gray-500" /> Regular User
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('dixit@gmail.com', 'Dixit@123', '/admin')}
              className="btn bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs py-2 font-bold flex items-center justify-center gap-1.5"
            >
              <ShieldCheck size={14} className="text-purple-600" /> Admin Account
            </button>
          </div>
        </div>
      </form>
      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{' '}
        <Link to="/auth/register" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign up free
        </Link>
      </p>
    </AuthLayout>
  );
}
