import { Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="flex flex-col justify-between p-12 text-white relative z-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Wrench size={24} />
            </div>
            <span className="text-2xl font-bold">ToolShare</span>
          </Link>
          <div>
            <h2 className="text-4xl font-bold leading-tight mb-4">Share Tools.<br />Save Money.<br />Build Together.</h2>
            <p className="text-primary-100 text-lg max-w-md">
              Join thousands of makers, DIYers, and professionals sharing tools in their community.
            </p>
            <div className="flex gap-8 mt-8">
              <div>
                <p className="text-3xl font-bold">10k+</p>
                <p className="text-primary-200 text-sm">Tools listed</p>
              </div>
              <div>
                <p className="text-3xl font-bold">5k+</p>
                <p className="text-primary-200 text-sm">Active users</p>
              </div>
              <div>
                <p className="text-3xl font-bold">98%</p>
                <p className="text-primary-200 text-sm">Satisfaction</p>
              </div>
            </div>
          </div>
          <p className="text-primary-200 text-sm">© 2024 ToolShare. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center">
              <Wrench className="text-white" size={22} />
            </div>
            <span className="text-2xl font-bold text-gray-900">ToolShare</span>
          </Link>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-500 mt-2">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
