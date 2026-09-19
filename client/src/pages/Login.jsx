import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CyberLogo } from '../components/common/CyberLogo';
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const { login, loginWithGoogle, launchGoogleRedirect, systemMode, showToast } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setAuthError(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setAuthError(null);
    setGoogleLoading(true);
    showToast('Verifying Google credentials with backend...', 'sync');

    try {
      const result = await loginWithGoogle(credentialResponse.credential);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setAuthError(result.error || 'Google login failed. Please try again.');
      }
    } catch (err) {
      setAuthError('Google authentication error. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setAuthError(
      'Google Sign-In was blocked or cancelled. (If configuring Google Cloud Console, ensure "http://localhost:5173" is listed under Authorized JavaScript origins, and your account is added to Test Users).'
    );
    showToast('Google Sign-In prompt closed or blocked.', 'error');
  };


  return (
    <div className="min-h-screen w-full bg-surface flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-xl p-8 z-10 flex flex-col gap-6">
        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <CyberLogo size="xl" variant="light" title="CYBERAI PLATFORM" subtitle="AUTONOMOUS SOC ENGINE" />
          <p className="font-body-sm text-xs text-outline max-w-xs mt-1">
            Autonomous Security Operations Center & Incident Investigation Platform
          </p>
          <div className="inline-flex items-center gap-1.5 bg-surface-container border border-outline-variant/40 px-3 py-1 rounded-full text-xs font-bold text-primary">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {systemMode}
          </div>
        </div>

        {/* Error Alert Message */}
        {authError && (
          <div className="bg-red-50 border border-red-300 text-red-900 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Google OAuth Section */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={async () => {
              setAuthError(null);
              setGoogleLoading(true);
              showToast('Redirecting to Google OAuth 2.0...', 'sync');
              try {
                await launchGoogleRedirect();
              } catch (err) {
                setAuthError('Failed to initialize Google login. Please try again.');
                setGoogleLoading(false);
              }
            }}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-[#1F1F1F] border border-[rgba(15,23,42,0.14)] hover:border-[rgba(15,23,42,0.25)] rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {googleLoading ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin text-[#07111F]">cyclone</span>
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-outline-variant/40 w-full"></div>
            <span className="bg-surface-container-lowest px-3 text-[11px] font-bold uppercase tracking-wider text-outline absolute">
              or sign in with credentials
            </span>
          </div>
        </div>

        {/* Standard Email/Password Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md font-semibold text-on-surface">SOC Administrator Email</label>
            <div className="flex items-center bg-surface-container-low border border-outline-variant/40 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
              <Mail className="w-5 h-5 text-outline mr-2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cyberai.com"
                className="w-full bg-transparent border-none outline-none font-body-sm text-on-surface"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md font-semibold text-on-surface">Password</label>
            <div className="flex items-center bg-surface-container-low border border-outline-variant/40 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
              <Lock className="w-5 h-5 text-outline mr-2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent border-none outline-none font-body-sm text-on-surface"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-on-primary rounded-xl font-label-md text-label-md font-bold shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 mt-1"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-xl">cyclone</span>
            ) : (
              <>
                <span>Authenticate SOC Session</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
