import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Sparkles, ArrowRight, Loader, Mail, RotateCcw, CheckCircle } from 'lucide-react';
import axios from 'axios';

import { useSignIn, useAuth, useSession, useUser } from "@clerk/clerk-react";


// ─── OTP Screen ──────────────────────────────
function OTPScreen({ userId, email, onSuccess, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(59);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputs = useRef([]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    setError('');
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Enter all 6 digits'); return; }
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_PATH}/auth/verify-otp`, { user_id: userId, otp: code }, { withCredentials: true });
      setSuccess(true);
      setTimeout(() => onSuccess(), 1400);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired OTP');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_PATH}/auth/resend-otp`, { user_id: userId });
      setTimer(59);
      setOtp(['', '', '', '', '', '']);
      setError('');
      inputs.current[0]?.focus();
    } catch (err) {
      setError('Failed to resend. Try again.');
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: 'center', padding: '20px 0' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}
        >
          <div style={{
            width: '64px', height: '64px',
            background: 'rgba(62,207,142,0.15)',
            border: '1px solid rgba(62,207,142,0.3)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckCircle size={28} color="var(--green)" />
          </div>
        </motion.div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
          Email verified!
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-2)', fontWeight: 300 }}>
          Redirecting you to your dashboard...
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="otp"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div style={{
        width: '52px', height: '52px',
        background: 'rgba(79,142,247,0.12)',
        border: '1px solid rgba(79,142,247,0.25)',
        borderRadius: 'var(--r-lg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '24px',
      }}>
        <Mail size={22} color="var(--blue)" />
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: '8px' }}>
        Check your email
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text-2)', fontWeight: 300, marginBottom: '32px', lineHeight: 1.6 }}>
        We sent a 6-digit code to{' '}
        <span style={{ color: 'var(--text)', fontWeight: 500 }}>{email}</span>.
        Enter it below to verify your account.
      </p>

      {/* OTP inputs */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={el => inputs.current[i] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleOtpChange(e.target.value, i)}
            onKeyDown={e => handleKeyDown(e, i)}
            onPaste={handlePaste}
            style={{
              width: '52px', height: '60px',
              textAlign: 'center',
              fontSize: '24px', fontWeight: 700,
              fontFamily: 'var(--font-display)',
              color: 'var(--text)',
              background: 'var(--bg-3)',
              border: `2px solid ${error ? 'var(--pink)' : digit ? 'var(--blue)' : 'var(--border)'}`,
              borderRadius: 'var(--r-md)',
              outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={e => { if (!error) e.target.style.borderColor = 'var(--blue)'; }}
            onBlur={e => { if (!digit && !error) e.target.style.borderColor = 'var(--border)'; }}
          />
        ))}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '13px', color: 'var(--pink)', textAlign: 'center', marginBottom: '16px' }}
        >
          {error}
        </motion.p>
      )}

      <button
        onClick={handleVerify}
        disabled={loading || otp.join('').length < 6}
        className="btn btn-primary"
        style={{
          width: '100%', padding: '14px', fontSize: '15px',
          opacity: loading || otp.join('').length < 6 ? 0.6 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          marginBottom: '20px',
        }}
      >
        {loading
          ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Verifying...</>
          : <>Verify email <ArrowRight size={16} /></>
        }
      </button>

      {/* Timer / Resend */}
      <div style={{ textAlign: 'center' }}>
        {timer > 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-3)' }}>
            Resend code in{' '}
            <span style={{ color: 'var(--text-2)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              0:{String(timer).padStart(2, '0')}
            </span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: '13px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: resending ? 0.6 : 1 }}
          >
            <RotateCcw size={13} style={resending ? { animation: 'spin 1s linear infinite' } : {}} />
            {resending ? 'Sending...' : 'Resend code'}
          </button>
        )}
      </div>

      <button
        onClick={onBack}
        style={{ display: 'block', margin: '20px auto 0', background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '13px', transition: 'color 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-2)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
      >
        ← Back to sign up
      </button>
    </motion.div>
  );
}

// ─── Auth Screen ──────────────────────────────
function AuthScreen({ mode, setMode, onOTPRequired }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstname: '', lastname: '', email: '', password: '' });
  const [errors, setErrors] = useState({});

  const {signIn,isLoaded} = useSignIn();
  const {isSignedIn} = useAuth();
  const {session} = useSession();
  const {user} = useUser();

  const handleGoogleLogin=async ()=>{
    if(!isLoaded){
      return
    }
    
    // If Clerk remembers they are signed in, sync automatically to avoid Clerk's "Already signed in" popup error
    if (isSignedIn && session && user) {
      try {
        const token = await session.getToken();
        await axios.post(`${import.meta.env.VITE_BACKEND_PATH}/auth/google`, {
          token,
          firstname: user.firstName,
          lastname: user.lastName,
          email: user.emailAddresses[0]?.emailAddress,
          google_id: user.id,
        }, { withCredentials: true });
        window.location.href = '/dashboard';
      } catch (err) {
        console.error('Fast-sync failed', err);
      }
      return;
    }

    try{
      await signIn.authenticateWithRedirect({
        strategy:"oauth_google",
        redirectUrl:"/sso-callback",
        redirectUrlComplete:"/dashboard"
      })
    }catch(error){
      console.log(error)
    }
  }


  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (mode === 'register') {
      if (!form.firstname.trim()) errs.firstname = 'Required';
      if (!form.lastname.trim()) errs.lastname = 'Required';
    }
    if (!form.email.trim()) errs.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Required';
    else if (form.password.length < 8) errs.password = 'Min 8 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      if (mode === 'register') {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_PATH}/auth/register`, {
          firstname: form.firstname,
          lastname: form.lastname,
          email: form.email,
          password: form.password,
        });
        onOTPRequired(res.data.user_id, form.email);
      } else {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_PATH}/auth/login`, {
          email: form.email,
          password: form.password,
        }, { withCredentials: true });
        console.log(res.data)
        if (res.data.message?.includes('not verified')) {
          onOTPRequired(res.data.user_id, form.email);
        } else {
          window.location.href = '/dashboard';
        }
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      setErrors({ general: typeof detail === 'string' ? detail : 'Something went wrong. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%', padding: '13px 16px',
    background: 'var(--bg-3)',
    border: `1px solid ${errors[field] ? 'var(--pink)' : 'var(--border)'}`,
    borderRadius: 'var(--r-md)',
    color: 'var(--text)', fontSize: '15px',
    fontFamily: 'var(--font-body)', outline: 'none',
    transition: 'border-color 0.2s ease',
  });

  return (
    <motion.div
      key={mode}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: '6px' }}>
        {mode === 'login' ? 'Welcome back' : 'Create your account'}
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text-2)', fontWeight: 300, marginBottom: '28px' }}>
        {mode === 'login' ? 'Log in to continue generating blogs.' : 'Start generating research-backed blogs today.'}
      </p>

      {errors.general && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: '12px 16px', marginBottom: '16px', background: 'rgba(232,121,160,0.1)', border: '1px solid rgba(232,121,160,0.25)', borderRadius: 'var(--r-md)', fontSize: '13px', color: 'var(--pink)' }}
        >
          {errors.general}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <AnimatePresence>
          {mode === 'register' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', overflow: 'hidden' }}
            >
              <div>
                <input name="firstname" placeholder="First name" value={form.firstname} onChange={handleChange} style={inputStyle('firstname')}
                  onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                  onBlur={e => e.target.style.borderColor = errors.firstname ? 'var(--pink)' : 'var(--border)'}
                />
                {errors.firstname && <p style={{ fontSize: '12px', color: 'var(--pink)', marginTop: '4px' }}>{errors.firstname}</p>}
              </div>
              <div>
                <input name="lastname" placeholder="Last name" value={form.lastname} onChange={handleChange} style={inputStyle('lastname')}
                  onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                  onBlur={e => e.target.style.borderColor = errors.lastname ? 'var(--pink)' : 'var(--border)'}
                />
                {errors.lastname && <p style={{ fontSize: '12px', color: 'var(--pink)', marginTop: '4px' }}>{errors.lastname}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <input name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange} style={inputStyle('email')}
            onFocus={e => e.target.style.borderColor = 'var(--blue)'}
            onBlur={e => e.target.style.borderColor = errors.email ? 'var(--pink)' : 'var(--border)'}
          />
          {errors.email && <p style={{ fontSize: '12px', color: 'var(--pink)', marginTop: '4px' }}>{errors.email}</p>}
        </div>

        <div style={{ position: 'relative' }}>
          <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={handleChange}
            style={{ ...inputStyle('password'), paddingRight: '44px' }}
            onFocus={e => e.target.style.borderColor = 'var(--blue)'}
            onBlur={e => e.target.style.borderColor = errors.password ? 'var(--pink)' : 'var(--border)'}
          />
          <button type="button" onClick={() => setShowPassword(s => !s)}
            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', padding: '4px', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-2)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          {errors.password && <p style={{ fontSize: '12px', color: 'var(--pink)', marginTop: '4px' }}>{errors.password}</p>}
        </div>

        {mode === 'login' && (
          <div style={{ textAlign: 'right', marginTop: '-4px' }}>
            <a href="#" style={{ fontSize: '13px', color: 'var(--text-3)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-2)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
            >Forgot password?</a>
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading}
          style={{ width: '100%', padding: '14px', marginTop: '4px', fontSize: '15px', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {loading
            ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
            : <>{mode === 'login' ? 'Log in' : 'Create account'} <ArrowRight size={16} /></>
          }
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        <span style={{ fontSize: '12px', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>or continue with</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      <button type="button"
        style={{ width: '100%', padding: '13px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', color: 'var(--text)', fontSize: '15px', fontFamily: 'var(--font-body)', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s ease' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}
        onClick={handleGoogleLogin}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-3)' }}>
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}
          style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: '14px', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '3px' }}
        >
          {mode === 'login' ? 'Sign up' : 'Log in'}
        </button>
      </p>
    </motion.div>
  );
}




// ─── Main Modal ───────────────────────────────
export default function AuthModal({ mode: initialMode = 'register', onClose }) {
  const [mode, setMode] = useState(initialMode);
  const [screen, setScreen] = useState('auth');
  const [otpData, setOtpData] = useState({ userId: '', email: '' });


  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && screen !== 'otp') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, screen]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => screen !== 'otp' && onClose()}
        style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(14px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: '440px',
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            padding: '40px',
            position: 'relative',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            overflow: 'hidden',
          }}
        >
          {/* Glow blob */}
          <div style={{
            position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
            width: '300px', height: '200px',
            background: 'radial-gradient(ellipse, rgba(79,142,247,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Close button — hidden on OTP screen */}
          {screen !== 'otp' && (
            <button onClick={onClose}
              style={{ position: 'absolute', top: '20px', right: '20px', width: '32px', height: '32px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <X size={15} />
            </button>
          )}

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
            <div style={{ width: '28px', height: '28px', background: 'var(--white)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={13} color="#0a0a0b" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--text)', letterSpacing: '-0.03em' }}>
              BlogForge
            </span>
          </div>

          {/* Screen transition */}
          <AnimatePresence mode="wait">
            {screen === 'auth' ? (
              <AuthScreen
                key="auth"
                mode={mode}
                setMode={setMode}
                onOTPRequired={(userId, email) => {
                  setOtpData({ userId, email });
                  setScreen('otp');
                }}
              />
            ) : (
              <OTPScreen
                key="otp"
                userId={otpData.userId}
                email={otpData.email}
                onSuccess={() => { window.location.href = '/dashboard'; }}
                onBack={() => setScreen('auth')}
              />
            )}
          </AnimatePresence>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}