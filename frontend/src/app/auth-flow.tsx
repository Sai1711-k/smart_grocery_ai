'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, ChevronLeft, Sparkles, Eye, EyeOff } from 'lucide-react';

import { useAuth } from '@/lib/providers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to safely parse JSON response and handle non-JSON 404/500 HTML responses
const safeFetchJson = async (res: Response) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Backend API is currently waking up or unreachable. Please verify NEXT_PUBLIC_API_URL on Vercel.');
  }
};

export function AuthFlow({ onComplete }: { onComplete: () => void }) {
  const { setAuthSession } = useAuth();
  const [mode, setMode] = useState<'welcome' | 'signup' | 'login' | 'otp' | 'loginOtp' | 'adminLogin' | 'adminOtp' | 'forgotPassword' | 'resetPassword'>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  // ── Signup: send OTP ──
  const handleSignup = async () => {
    setError('');
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      
      alert(data.message); // Show OTP fallback message
      setMode('otp');
      setResendTimer(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  // ── Login ──
  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      if (data.requiresOtp && data.newDevice) {
        alert(data.message); // Show OTP fallback message
        setMode('loginOtp');
        setResendTimer(30);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        if (data.session) {
          setAuthSession(data.session, data.user);
        }
        onComplete();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  // ── Admin Login ──
  const handleAdminLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Email and Passkey are required');
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, passkey: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Admin login failed');

      if (data.requiresVerification) {
        alert(data.message); // Show OTP fallback message
        setMode('adminOtp');
        setResendTimer(30);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        if (data.session) {
          setAuthSession(data.session, data.user);
        }
        onComplete();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  // ── Forgot Password ──
  const handleForgotPassword = async () => {
    setError('');
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await safeFetchJson(res);
      if (!res.ok) throw new Error(data.error || 'Failed to send reset code');
      
      alert(data.message); // Show OTP fallback message
      setMode('resetPassword');
      setResendTimer(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleResetPassword = async (code: string) => {
    setError('');
    if (!password || password.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password reset failed');
      
      alert('Password reset successfully! Please log in with your new password.');
      setMode('login');
      setPassword('');
      setOtp(['', '', '', '', '', '']);
    } catch (err: any) {
      setError(err.message);
      setOtp(['', '', '', '', '', '']);
    } finally {
      setVerifying(false);
    }
  };

  // ── OTP input handlers ──
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d !== '') && newOtp.join('').length === 6) {
      if (mode === 'otp') handleVerifySignupOtp(newOtp.join(''));
      else if (mode === 'adminOtp') handleVerifyAdminOtp(newOtp.join(''));
      else handleVerifyLoginOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split('');
      setOtp(newOtp);
      otpRefs.current[5]?.focus();
      if (mode === 'otp') handleVerifySignupOtp(pasted);
      else if (mode === 'adminOtp') handleVerifyAdminOtp(pasted);
      else handleVerifyLoginOtp(pasted);
    }
  };

  // ── Verify Signup OTP ──
  const handleVerifySignupOtp = useCallback(async (code: string) => {
    setError('');
    setVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/auth/signup/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      
      // Account created – save session and auto‑login
      if (data.session && data.user) {
        setAuthSession(data.session, data.user);
      }
      onComplete();
    } catch (err: any) {
      setError(err.message);
      setOtp(['', '', '', '', '', '']);
    } finally {
      setVerifying(false);
    }
  }, [email, onComplete]);

  // ── Verify Login OTP (new device) ──
  const handleVerifyLoginOtp = useCallback(async (code: string) => {
    setError('');
    setVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      
      if (data.session && data.user) {
        setAuthSession(data.session, data.user);
      }
      onComplete();
    } catch (err: any) {
      setError(err.message);
      setOtp(['', '', '', '', '', '']);
    } finally {
      setVerifying(false);
    }
  }, [email, onComplete]);

  // ── Verify Admin OTP ──
  const handleVerifyAdminOtp = useCallback(async (code: string) => {
    setError('');
    setVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/auth/admin/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      
      if (data.session && data.user) {
        setAuthSession(data.session, data.user);
      }
      onComplete();
    } catch (err: any) {
      setError(err.message);
      setOtp(['', '', '', '', '', '']);
    } finally {
      setVerifying(false);
    }
  }, [email, onComplete]);

  const handleResend = () => {
    if (resendTimer > 0) return;
    setOtp(['', '', '', '', '', '']);
    setResendTimer(30);
    // Re-trigger the original request
    if (mode === 'otp') handleSignup();
    else if (mode === 'adminOtp') handleAdminLogin();
    else if (mode === 'resetPassword') handleForgotPassword();
    else handleLogin();
  };

  // ═══════════════════════════════════════════
  // WELCOME SCREEN
  // ═══════════════════════════════════════════
  if (mode === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-green-500 to-teal-500 flex flex-col relative overflow-hidden">
        {/* Admin Login Button - Top Right */}
        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={() => setMode('adminLogin')}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-bold rounded-full backdrop-blur transition-all border border-white/20 shadow-lg shadow-black/10"
          >
            <ShieldCheck size={16} />
            Admin Login
          </button>
        </div>

        {/* Decorative */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 -left-20 w-60 h-60 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-400/10 rounded-full blur-2xl"></div>
          <div className="absolute top-[15%] left-[10%] text-5xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>🥬</div>
          <div className="absolute top-[25%] right-[15%] text-4xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}>🍎</div>
          <div className="absolute top-[45%] left-[20%] text-3xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>🥛</div>
          <div className="absolute top-[55%] right-[10%] text-5xl animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.2s' }}>🍞</div>
          <div className="absolute top-[35%] left-[60%] text-3xl animate-bounce" style={{ animationDelay: '0.7s', animationDuration: '3.8s' }}>🥑</div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center px-8 relative z-10">
          <div className="w-28 h-28 bg-white rounded-[32px] shadow-2xl shadow-black/20 flex items-center justify-center mb-8 rotate-6 hover:rotate-0 transition-transform duration-500">
            <span className="text-6xl">🛒</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight mb-3 text-center">
            Fresh<span className="text-yellow-300">Cart</span>
          </h1>
          <p className="text-white/80 text-lg text-center max-w-sm leading-relaxed">
            Groceries delivered fresh to your doorstep in minutes
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8 mb-12">
            {['🚀 10-min delivery', '💰 Best Prices', '🌿 Farm Fresh', '🎁 Daily Offers'].map(f => (
              <span key={f} className="bg-white/15 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-full border border-white/20">
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="px-8 pb-12 relative z-10 space-y-3">
          <button
            onClick={() => setMode('signup')}
            className="w-full bg-white text-emerald-700 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-black/20 flex items-center justify-center gap-3 hover:bg-emerald-50 active:scale-[0.98] transition-all"
          >
            Create Account
            <ArrowRight size={22} />
          </button>
          <button
            onClick={() => setMode('login')}
            className="w-full bg-white/15 backdrop-blur text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 hover:bg-white/25 active:scale-[0.98] transition-all border border-white/30"
          >
            I already have an account
          </button>
          <p className="text-center text-white/50 text-xs mt-4">
            By continuing, you agree to our Terms &amp; Privacy Policy
          </p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // SIGNUP SCREEN
  // ═══════════════════════════════════════════
  if (mode === 'signup') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="px-6 pt-8 pb-4">
          <button onClick={() => setMode('welcome')} className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition">
            <ChevronLeft size={22} />
          </button>
        </div>

        <div className="flex-1 px-8 pt-4">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
            <User size={28} className="text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-neutral-900 mb-2">Create your<br />account</h2>
          <p className="text-neutral-500 mb-8">Sign up with your email &amp; password</p>

          {/* Full Name */}
          <div className="mb-4">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Full Name</label>
            <div className="flex items-center gap-3 bg-neutral-50 px-4 py-4 rounded-xl border-2 border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all">
              <User size={20} className="text-neutral-400" />
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="John Doe"
                className="flex-1 bg-transparent text-neutral-900 text-lg font-semibold outline-none placeholder:text-neutral-300"
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Email</label>
            <div className="flex items-center gap-3 bg-neutral-50 px-4 py-4 rounded-xl border-2 border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all">
              <Mail size={20} className="text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                className="flex-1 bg-transparent text-neutral-900 text-lg font-semibold outline-none placeholder:text-neutral-300"
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Password</label>
            <div className="flex items-center gap-3 bg-neutral-50 px-4 py-4 rounded-xl border-2 border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all">
              <Lock size={20} className="text-neutral-400" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Min. 6 characters"
                className="flex-1 bg-transparent text-neutral-900 text-lg font-semibold outline-none placeholder:text-neutral-300"
              />
              <button onClick={() => setShowPass(!showPass)} className="text-neutral-400 hover:text-neutral-600">
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}

          <div className="flex items-start gap-3 bg-emerald-50 p-4 rounded-xl border border-emerald-100 mt-6">
            <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-800">
              We&apos;ll send a 6-digit OTP to your email to verify your account.
            </p>
          </div>

          <p className="text-center text-neutral-400 text-sm mt-6">
            Already have an account?{' '}
            <button onClick={() => { setMode('login'); setError(''); }} className="text-emerald-600 font-bold hover:underline">
              Log in
            </button>
          </p>
        </div>

        <div className="px-8 pb-10 pt-6">
          <button
            onClick={handleSignup}
            disabled={!email || !password || sending}
            className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
              email && password
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating account...
              </>
            ) : (
              <>
                Sign Up &amp; Send OTP
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // LOGIN SCREEN
  // ═══════════════════════════════════════════
  if (mode === 'login') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="px-6 pt-8 pb-4">
          <button onClick={() => setMode('welcome')} className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition">
            <ChevronLeft size={22} />
          </button>
        </div>

        <div className="flex-1 px-8 pt-4">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
            <Lock size={28} className="text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-neutral-900 mb-2">Welcome<br />back</h2>
          <p className="text-neutral-500 mb-8">Log in with your email &amp; password</p>

          {/* Email */}
          <div className="mb-4">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Email</label>
            <div className="flex items-center gap-3 bg-neutral-50 px-4 py-4 rounded-xl border-2 border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all">
              <Mail size={20} className="text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                className="flex-1 bg-transparent text-neutral-900 text-lg font-semibold outline-none placeholder:text-neutral-300"
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Password</label>
            <div className="flex items-center gap-3 bg-neutral-50 px-4 py-4 rounded-xl border-2 border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all">
              <Lock size={20} className="text-neutral-400" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Your password"
                className="flex-1 bg-transparent text-neutral-900 text-lg font-semibold outline-none placeholder:text-neutral-300"
              />
              <button onClick={() => setShowPass(!showPass)} className="text-neutral-400 hover:text-neutral-600">
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="flex justify-end mt-2">
              <button onClick={() => { setMode('forgotPassword'); setError(''); setPassword(''); }} className="text-sm font-bold text-emerald-600 hover:underline">
                Forgot password?
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}

          <p className="text-center text-neutral-400 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <button onClick={() => { setMode('signup'); setError(''); }} className="text-emerald-600 font-bold hover:underline">
              Sign up
            </button>
          </p>
        </div>

        <div className="px-8 pb-10 pt-6">
          <button
            onClick={handleLogin}
            disabled={!email || !password || sending}
            className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
              email && password
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Logging in...
              </>
            ) : (
              <>
                Log In
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // ADMIN LOGIN SCREEN
  // ═══════════════════════════════════════════
  if (mode === 'adminLogin') {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col">
        <div className="px-6 pt-8 pb-4">
          <button onClick={() => { setMode('welcome'); setError(''); setEmail(''); setPassword(''); }} className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white hover:bg-neutral-700 transition">
            <ChevronLeft size={22} />
          </button>
        </div>

        <div className="flex-1 px-8 pt-8">
          <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mb-6 border border-neutral-700">
            <ShieldCheck size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-2">Admin Access</h2>
          <p className="text-neutral-400 mb-10 text-lg">Enter your credentials and passkey to access the dashboard.</p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-neutral-300 mb-2 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
                  <User size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@freshcart.com"
                  className="w-full bg-neutral-800 text-white placeholder-neutral-500 font-medium py-4 pl-12 pr-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all border border-neutral-700 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-300 mb-2 ml-1">Admin Passkey</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
                  <Lock size={20} />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter Passkey"
                  className="w-full bg-neutral-800 text-white placeholder-neutral-500 font-medium py-4 pl-12 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all border border-neutral-700 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition"
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button onClick={() => { setMode('forgotPassword'); setError(''); setPassword(''); }} className="text-sm font-bold text-emerald-500 hover:underline">
                  Forgot password?
                </button>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm font-medium ml-1">{error}</p>}
          </div>
        </div>

        <div className="px-8 pb-10 pt-6">
          <button
            onClick={handleAdminLogin}
            disabled={!email || !password || sending}
            className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
              email && password
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600'
                : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Authenticating...
              </>
            ) : (
              <>
                Verify Identity
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // FORGOT PASSWORD SCREEN
  // ═══════════════════════════════════════════
  if (mode === 'forgotPassword') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="px-6 pt-8 pb-4">
          <button onClick={() => setMode('login')} className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition">
            <ChevronLeft size={22} />
          </button>
        </div>

        <div className="flex-1 px-8 pt-4">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
            <Lock size={28} className="text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-neutral-900 mb-2">Forgot<br />Password?</h2>
          <p className="text-neutral-500 mb-8">Enter your email and we'll send you a reset code.</p>

          <div className="mb-4">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Email</label>
            <div className="flex items-center gap-3 bg-neutral-50 px-4 py-4 rounded-xl border-2 border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all">
              <Mail size={20} className="text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                className="flex-1 bg-transparent text-neutral-900 text-lg font-semibold outline-none placeholder:text-neutral-300"
                autoFocus
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
        </div>

        <div className="px-8 pb-10 pt-6">
          <button
            onClick={handleForgotPassword}
            disabled={!email || sending}
            className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
              email
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              <>
                Send Reset Code
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // RESET PASSWORD SCREEN
  // ═══════════════════════════════════════════
  if (mode === 'resetPassword') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="px-6 pt-8 pb-4">
          <button onClick={() => { setMode('forgotPassword'); setOtp(['', '', '', '', '', '']); setError(''); setPassword(''); }} className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition">
            <ChevronLeft size={22} />
          </button>
        </div>

        <div className="flex-1 px-8 pt-4">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck size={28} className="text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-neutral-900 mb-2">Reset Password</h2>
          <p className="text-neutral-500 mb-8">Enter the 6-digit code sent to <span className="font-bold text-neutral-900">{email}</span> and your new password.</p>

          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block text-center">Verification Code</label>
          <div className="flex gap-3 justify-center mb-6" onPaste={handleOtpPaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => { otpRefs.current[idx] = el; }}
                type="tel"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(idx, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(idx, e)}
                className={`w-12 h-14 text-center text-xl font-black rounded-xl border-2 outline-none transition-all ${
                  digit
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-900 focus:border-emerald-500 focus:bg-white'
                } ${error && !password ? 'border-red-300 bg-red-50' : ''}`}
                disabled={verifying}
              />
            ))}
          </div>

          <div className="mb-4 mt-6">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block">New Password</label>
            <div className="flex items-center gap-3 bg-neutral-50 px-4 py-4 rounded-xl border-2 border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all">
              <Lock size={20} className="text-neutral-400" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="At least 6 characters"
                className="flex-1 bg-transparent text-neutral-900 text-lg font-semibold outline-none placeholder:text-neutral-300"
              />
              <button onClick={() => setShowPass(!showPass)} className="text-neutral-400 hover:text-neutral-600">
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-2 font-medium text-center">{error}</p>}

          <div className="text-center mt-6">
            {resendTimer > 0 ? (
              <p className="text-neutral-400 text-sm">Resend code in <span className="font-bold text-neutral-600">{resendTimer}s</span></p>
            ) : (
              <button onClick={handleResend} className="text-emerald-600 font-bold text-sm hover:underline">Resend Code</button>
            )}
          </div>
        </div>

        <div className="px-8 pb-10 pt-6">
          <button
            onClick={() => handleResetPassword(otp.join(''))}
            disabled={otp.join('').length !== 6 || !password || verifying}
            className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
              otp.join('').length === 6 && password
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
            }`}
          >
            {verifying ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Resetting...
              </>
            ) : (
              <>
                Reset Password
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // OTP VERIFICATION SCREEN (Signup & Login & Admin)
  // ═══════════════════════════════════════════
  const isLoginOtp = mode === 'loginOtp';
  const isAdminOtp = mode === 'adminOtp';

  return (
    <div className={`min-h-screen ${isAdminOtp ? 'bg-neutral-900' : 'bg-white'} flex flex-col`}>
      <div className="px-6 pt-8 pb-4">
        <button
          onClick={() => { 
            setMode(isAdminOtp ? 'adminLogin' : isLoginOtp ? 'login' : 'signup'); 
            setOtp(['', '', '', '', '', '']); 
            setError(''); 
          }}
          className={`w-10 h-10 rounded-full ${isAdminOtp ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-neutral-100 hover:bg-neutral-200'} flex items-center justify-center transition`}
        >
          <ChevronLeft size={22} />
        </button>
      </div>

      <div className="flex-1 px-8 pt-8">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${isAdminOtp ? 'bg-neutral-800 border border-neutral-700' : 'bg-emerald-50'}`}>
          <ShieldCheck size={28} className={isAdminOtp ? 'text-emerald-500' : 'text-emerald-600'} />
        </div>
        <h2 className={`text-3xl font-black mb-2 ${isAdminOtp ? 'text-white' : 'text-neutral-900'}`}>
          {isAdminOtp ? 'Admin Approval Required' : isLoginOtp ? 'New device detected' : 'Verify your email'}
        </h2>
        <p className={`mb-2 ${isAdminOtp ? 'text-neutral-400' : 'text-neutral-500'}`}>
          {isAdminOtp 
            ? 'We sent a verification code to the Main Admin.'
            : isLoginOtp
            ? 'We sent a verification code to confirm this device'
            : 'Enter the 6-digit code sent to'}
        </p>
        <p className={`font-bold text-lg mb-10 ${isAdminOtp ? 'text-white' : 'text-neutral-900'}`}>
          {isAdminOtp ? 'sai17042004@gmail.com' : email}
          {!isAdminOtp && (
            <button onClick={() => { setMode(isLoginOtp ? 'login' : 'signup'); setOtp(['', '', '', '', '', '']); }} className="text-emerald-600 text-sm font-bold ml-3">
              Change
            </button>
          )}
        </p>

        {/* OTP Input Boxes */}
        <div className="flex gap-3 justify-center mb-6" onPaste={handleOtpPaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={el => { otpRefs.current[idx] = el; }}
              type="tel"
              maxLength={1}
              value={digit}
              onChange={e => handleOtpChange(idx, e.target.value)}
              onKeyDown={e => handleOtpKeyDown(idx, e)}
              className={`w-14 h-16 text-center text-2xl font-black rounded-xl border-2 outline-none transition-all ${
                digit
                  ? isAdminOtp ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : isAdminOtp ? 'border-neutral-700 bg-neutral-800 text-white focus:border-emerald-500' : 'border-neutral-200 bg-neutral-50 text-neutral-900 focus:border-emerald-500 focus:bg-white'
              } ${error ? 'border-red-500 bg-red-500/10 text-red-500' : ''}`}
              disabled={verifying}
            />
          ))}
        </div>

        {error && <p className="text-red-500 text-sm text-center font-medium mb-4">{error}</p>}

        {verifying && (
          <div className="flex items-center justify-center gap-2 text-emerald-500 font-semibold mb-4">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            Verifying...
          </div>
        )}

        {/* Resend */}
        <div className="text-center mt-6">
          {resendTimer > 0 ? (
            <p className="text-neutral-400 text-sm">
              Resend OTP in <span className="font-bold text-neutral-600">{resendTimer}s</span>
            </p>
          ) : (
            <button onClick={handleResend} className="text-emerald-600 font-bold text-sm hover:underline">
              Resend OTP
            </button>
          )}
        </div>

        </div>
    </div>
  );
}
