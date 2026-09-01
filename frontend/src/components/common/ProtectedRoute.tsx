import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import type { ReactNode } from 'react';

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: ReactNode;
  requireAdmin?: boolean;
}) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && user?.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="card p-8 bg-red-50/70 border border-red-200">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-xl font-bold text-red-800">Access Denied — Admin Only</h2>
          <p className="text-xs text-gray-600 mt-2 leading-relaxed">
            You do not have Administrator permissions (<code className="bg-red-100 px-1 py-0.5 rounded text-red-800 font-mono">ROLE_ADMIN</code>) to access the Admin Control Center.
          </p>
          <Link to="/" className="btn-primary inline-block mt-5 text-xs px-4 py-2">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
