import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface GoogleLoginButtonProps {
  label?: string;
  onSuccess?: () => void;
  onError?: (errorMsg: string) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          prompt: () => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  label = 'Continue with Google',
  onSuccess,
  onError,
}) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const isRealClientId = rawClientId.trim() !== '' && !rawClientId.includes('your-google-client-id');
  const googleClientId = isRealClientId ? rawClientId.trim() : '';

  useEffect(() => {
    if (!googleClientId) return;

    // Dynamically load Google Identity Services SDK if Client ID is configured
    const scriptId = 'google-jssdk';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response) => {
              try {
                setLoading(true);
                await googleLogin(response.credential);
                onSuccess ? onSuccess() : navigate('/');
              } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : 'Google authentication failed';
                onError ? onError(msg) : alert(msg);
              } finally {
                setLoading(false);
              }
            },
          });
        }
      };
      document.body.appendChild(script);
    }
  }, [googleClientId, googleLogin, navigate, onSuccess, onError]);

  const handleGoogleClick = async () => {
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
      return;
    }


    // Interactive Fallback / Developer Mode when Google Client ID is not yet set in .env
    try {
      setLoading(true);
      const testEmail = prompt('Enter your Google email for testing (or leave default):', 'dixit.user');
      if (testEmail === null) {
        setLoading(false);
        return; // User cancelled
      }
      const mockIdToken = 'mock_google_' + (testEmail.trim() || 'user');
      await googleLogin(mockIdToken);
      onSuccess ? onSuccess() : navigate('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google authentication failed';
      onError ? onError(msg) : alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl border border-slate-200 shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5 text-slate-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      )}
      <span>{loading ? 'Authenticating...' : label}</span>
    </button>
  );
};

export default GoogleLoginButton;
