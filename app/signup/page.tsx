// FILE: app/signup/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

// ─────────────────────────────────────────────
// DESIGN TOKENS — UNTOUCHED
// ─────────────────────────────────────────────
const C = {
  blue:        '#2563eb',
  blueDark:    '#1e3c7d',
  green:       '#10b981',
  textPrimary: '#0f1729',
  textMuted:   '#64748b',
  textLight:   '#9ca3af',
  border:      '#e8ecf0',
  page:        '#f0f4f8',
  red:         '#ef4444',
};

const GRAD = {
  primary: 'linear-gradient(135deg, #1e3c7d, #2563eb)',
  hero:    'linear-gradient(180deg, #0f2347 0%, #1e3c7d 50%, #0f2347 100%)',
  green:   'linear-gradient(135deg, #059669, #10b981)',
};

// ─────────────────────────────────────────────
// NAV LINKS
// ─────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Home',     href: '/'          },
  { label: 'Features', href: '/#features' },
  { label: 'Pricing',  href: '/#pricing'  },
  { label: 'Contact',  href: '/#contact'  },
];

// ─────────────────────────────────────────────
// TOP NAVBAR
// ─────────────────────────────────────────────
function TopNav() {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid #e8ecf0',
      boxShadow: '0 1px 20px rgba(0,0,0,0.04)',
      height: 60,
      display: 'flex', alignItems: 'center',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 24px',
        width: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{
          textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: GRAD.primary,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 16,
            boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
          }}>🏥</div>
          <span style={{
            fontSize: 17, fontWeight: 900,
            color: C.textPrimary, letterSpacing: '-0.3px',
          }}>
            Medi<span style={{ color: C.blue }}>Book</span>
          </span>
        </Link>

        {/* Center links */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
        }} className="nav-links-desktop">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                textDecoration: 'none',
                fontSize: 13, fontWeight: 600,
                color: C.textMuted,
                padding: '6px 12px', borderRadius: 8,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = C.blue;
                (e.currentTarget as HTMLElement).style.background = 'rgba(37,99,235,0.06)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = C.textMuted;
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link
            href="/login"
            style={{
              textDecoration: 'none',
              fontSize: 13, fontWeight: 700,
              color: C.textMuted,
              padding: '7px 16px', borderRadius: 8,
              border: '1.5px solid #e8ecf0',
              transition: 'all 0.2s ease',
              background: '#fff',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = C.blue;
              (e.currentTarget as HTMLElement).style.color = C.blue;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#e8ecf0';
              (e.currentTarget as HTMLElement).style.color = C.textMuted;
            }}
          >
            Sign In
          </Link>
          <div style={{
            background: GRAD.primary,
            borderRadius: 8,
            padding: '7px 16px',
            fontSize: 13, fontWeight: 700, color: '#fff',
            boxShadow: '0 3px 12px rgba(37,99,235,0.3)',
          }}>
            Get Started ↗
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
        }
      `}</style>
    </nav>
  );
}

// ─────────────────────────────────────────────
// INPUT COMPONENT — UNTOUCHED
// ─────────────────────────────────────────────
function Input({
  label, icon, type = 'text', value, onChange,
  placeholder, required, hint, disabled,
}: {
  label: string; icon: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  required?: boolean; hint?: string; disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 700,
        color: C.textMuted, textTransform: 'uppercase',
        letterSpacing: '0.8px', marginBottom: 8,
      }}>
        {icon} {label}
        {required && <span style={{ color: C.red }}> *</span>}
      </label>
      <input
        type={type} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        disabled={disabled}
        style={{
          width: '100%', padding: '13px 16px', borderRadius: 12,
          border: focused ? `2px solid ${C.blue}` : '2px solid #e8ecf0',
          fontSize: 14, color: C.textPrimary,
          background: disabled ? '#f8fafc' : '#fff',
          outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          boxShadow: focused ? '0 0 0 4px rgba(37,99,235,0.08)' : 'none',
          cursor: disabled ? 'not-allowed' : 'text',
        }}
        onFocus={() => { if (!disabled) setFocused(true);  }}
        onBlur={()  => setFocused(false)}
      />
      {hint && (
        <div style={{ fontSize: 11, color: C.textLight, marginTop: 5, paddingLeft: 2 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// PASSWORD STRENGTH — UNTOUCHED
// ─────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters',    pass: password.length >= 8          },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password)        },
    { label: 'Lowercase letter', pass: /[a-z]/.test(password)        },
    { label: 'Number',           pass: /\d/.test(password)           },
    { label: 'Special char',     pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const passed = checks.filter(c => c.pass).length;
  const strength =
    passed <= 1 ? 'Weak'   : passed <= 3 ? 'Fair' :
    passed === 4 ? 'Good'  : 'Strong';
  const strengthColor =
    passed <= 1 ? C.red     : passed <= 3 ? '#f59e0b' :
    passed === 4 ? C.blue   : C.green;

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: '14px 16px', borderRadius: 12,
        background: '#f8fafc', border: '1px solid #e8ecf0', marginTop: 8,
      }}
    >
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 8,
      }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: C.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.8px',
        }}>Password Strength</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: strengthColor }}>
          {strength}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i <= passed ? strengthColor : '#e8ecf0',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {checks.map(c => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: c.pass ? C.green : C.textLight }}>
              {c.pass ? '✅' : '○'}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: c.pass ? C.textPrimary : C.textLight,
            }}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// SIGNUP PAGE
// ─────────────────────────────────────────────
export default function SignupPage() {
  const router = useRouter();
  const mounted = useRef(true);
  const signupInProgress = useRef(false);

  const [step,        setStep]        = useState<1 | 2>(1);
  const [loading,     setLoading]     = useState(false);
  const [checking,    setChecking]    = useState(true);
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState(false);

  const [fullName,   setFullName]   = useState('');
  const [email,      setEmail]      = useState('');
  const [clinicName, setClinicName] = useState('');
  const [phone,      setPhone]      = useState('');
  const [address,    setAddress]    = useState('');
  const [password,   setPassword]   = useState('');
  const [confirm,    setConfirm]    = useState('');

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // ─── SESSION CHECK — UNTOUCHED ────────────
  useEffect(() => {
    const checkPreExistingSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (signupInProgress.current) {
          if (mounted.current) setChecking(false);
          return;
        }
        if (!session?.user) {
          if (mounted.current) setChecking(false);
          return;
        }
        const { data: profile } = await supabase
          .from('profiles').select('role').eq('id', session.user.id).maybeSingle();
        if (signupInProgress.current) {
          if (mounted.current) setChecking(false);
          return;
        }
        if (profile?.role) {
          const redirectMap: Record<string, string> = {
            admin:   '/dashboard/admin',
            doctor:  '/dashboard/doctor',
            patient: '/dashboard/patient',
          };
          router.replace(redirectMap[profile.role] ?? '/dashboard/admin');
          return;
        }
        await supabase.auth.signOut();
        if (mounted.current) setChecking(false);
      } catch (err) {
        console.error('Signup session check error:', err);
        if (mounted.current) setChecking(false);
      }
    };
    checkPreExistingSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── VALIDATION — UNTOUCHED ───────────────
  const step1Valid = fullName.trim().length >= 2 && email.includes('@');
  const passwordOk =
    password.length >= 8 && /[A-Z]/.test(password) &&
    /[a-z]/.test(password) && /\d/.test(password);
  const step2Valid =
    clinicName.trim().length >= 2 && passwordOk && password === confirm;

  // ─── SIGNUP HANDLER — UNTOUCHED ──────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!step2Valid) return;

    signupInProgress.current = true;
    if (mounted.current) { setError(''); setLoading(true); }

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email:    email.trim().toLowerCase(),
        password,
        options: { data: { full_name: fullName.trim(), role: 'admin' } },
      });

      if (signupError) {
        const msg = signupError.message.toLowerCase();
        let friendlyMsg = signupError.message;
        if (msg.includes('already registered') || msg.includes('already in use')) {
          friendlyMsg = 'This email is already registered. Please sign in instead.';
        } else if (msg.includes('password')) {
          friendlyMsg = 'Password is too weak. Please use a stronger password.';
        } else if (msg.includes('rate limit')) {
          friendlyMsg = 'Too many attempts. Please wait a moment and try again.';
        }
        if (mounted.current) { setError(friendlyMsg); setLoading(false); }
        signupInProgress.current = false;
        return;
      }

      if (!data?.user) {
        if (mounted.current) { setError('Signup failed. Please try again.'); setLoading(false); }
        signupInProgress.current = false;
        return;
      }

      const userId = data.user.id;
      await new Promise(r => setTimeout(r, 2500));

      let clinicUpdated = false;
      for (let attempt = 0; attempt < 4; attempt++) {
        const { error: clinicError } = await supabase
          .from('clinics')
          .update({
            name: clinicName.trim(), phone: phone.trim() || null,
            address: address.trim() || null, email: email.trim().toLowerCase(),
          })
          .eq('admin_id', userId);
        if (!clinicError) { clinicUpdated = true; break; }
        console.warn(`Clinic update attempt ${attempt + 1} failed:`, clinicError.message);
        await new Promise(r => setTimeout(r, 1000));
      }

      if (!clinicUpdated) {
        console.warn('Clinic name update failed — admin can fix from settings');
      }

      await supabase.auth.signOut();
      signupInProgress.current = false;
      if (mounted.current) { setSuccess(true); setLoading(false); }

    } catch (err) {
      console.error('Signup error:', err);
      if (mounted.current) { setError('Something went wrong. Please try again.'); setLoading(false); }
      signupInProgress.current = false;
    }
  };

  // ─── CHECKING SPINNER ─────────────────────
  if (checking) {
    return (
      <div style={{
        minHeight: '100vh', background: C.page,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, background: GRAD.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, boxShadow: '0 8px 24px rgba(37,99,235,0.3)', marginBottom: 4,
        }}>🏥</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: C.textPrimary }}>
          Medi<span style={{ color: C.blue }}>Book</span>
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            border: '3px solid #e8ecf0', borderTop: `3px solid ${C.blue}`,
          }}
        />
        <div style={{ fontSize: 14, color: C.textMuted, fontWeight: 600 }}>Loading...</div>
      </div>
    );
  }

  // ─── SUCCESS SCREEN — Enhanced ────────────
  if (success) {
    return (
      <>
        <TopNav />
        <div style={{
          minHeight: '100vh', background: C.page,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '80px 24px 24px',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20 }}
            style={{
              width: '100%', maxWidth: 500,
              background: '#fff', borderRadius: 28,
              padding: '52px 44px', textAlign: 'center',
              boxShadow: '0 24px 70px rgba(0,0,0,0.1)',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 14, delay: 0.1 }}
              style={{
                width: 90, height: 90, borderRadius: '50%',
                background: GRAD.green, margin: '0 auto 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 40, boxShadow: '0 14px 44px rgba(16,185,129,0.4)',
                color: '#fff', fontWeight: 900,
              }}
            >✓</motion.div>

            <div style={{
              fontSize: 28, fontWeight: 900, color: C.textPrimary,
              marginBottom: 10, letterSpacing: '-0.5px',
            }}>
              Clinic Created! 🎉
            </div>
            <div style={{ fontSize: 16, color: C.textMuted, marginBottom: 8, lineHeight: 1.7 }}>
              Welcome to MediBook,{' '}
              <strong style={{ color: C.textPrimary }}>{fullName}</strong>!
            </div>
            <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 32, lineHeight: 1.7 }}>
              Your clinic{' '}
              <strong style={{ color: C.textPrimary }}>{clinicName}</strong>{' '}
              is ready. Confirm your email then sign in to access your dashboard.
            </div>

            {/* Account summary */}
            <div style={{
              background: '#f8fafc', borderRadius: 16,
              padding: '20px', border: '1px solid #e8ecf0',
              marginBottom: 24, textAlign: 'left',
            }}>
              {[
                { label: 'Admin Name', value: fullName   },
                { label: 'Email',      value: email      },
                { label: 'Clinic',     value: clinicName },
                { label: 'Role',       value: '🔵 Admin' },
              ].map((r, i, arr) => (
                <div key={r.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '9px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid #e8ecf0' : 'none',
                }}>
                  <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 500 }}>
                    {r.label}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>
                    {r.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Next steps */}
            <div style={{
              background: 'rgba(37,99,235,0.04)',
              border: '1px solid rgba(37,99,235,0.12)',
              borderRadius: 14, padding: '16px 18px',
              marginBottom: 16, textAlign: 'left',
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: C.blue,
                textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10,
              }}>
                Next Steps
              </div>
              {[
                { step: '1', text: `Check your inbox at ${email}` },
                { step: '2', text: 'Click the confirmation link' },
                { step: '3', text: 'Sign in and set up your clinic' },
              ].map(s => (
                <div key={s.step} style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8,
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: GRAD.primary, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0,
                  }}>{s.step}</div>
                  <span style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>
                    {s.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Email notice */}
            <div style={{
              padding: '12px 16px', borderRadius: 12, marginBottom: 24,
              background: 'rgba(245,158,11,0.07)',
              border: '1px solid rgba(245,158,11,0.22)',
              fontSize: 13, color: '#d97706', fontWeight: 600, lineHeight: 1.6,
              display: 'flex', alignItems: 'flex-start', gap: 8,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>📧</span>
              <span>
                Confirm your email before signing in.
                Check spam if you don't see it within 2 minutes.
              </span>
            </div>

            <button
              onClick={() => router.push('/login')}
              style={{
                width: '100%', padding: '16px', borderRadius: 14,
                border: 'none', background: GRAD.primary,
                color: '#fff', fontSize: 16, fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 6px 24px rgba(37,99,235,0.38)',
                transition: 'all 0.2s', letterSpacing: '-0.2px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 32px rgba(37,99,235,0.45)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(37,99,235,0.38)';
              }}
            >
              🔐 Go to Sign In →
            </button>
          </motion.div>
        </div>
      </>
    );
  }

  // ─── MAIN RENDER — Enhanced ───────────────
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; }
        @media (max-width: 900px) {
          .signup-left  { display: none !important; }
          .signup-right {
            width: 100% !important;
            padding: 80px 24px 40px !important;
          }
        }
        @media (min-width: 901px) {
          .signup-right { padding-top: 80px !important; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.15); }
        }
      `}</style>

      <TopNav />

      <div style={{ minHeight: '100vh', background: C.page, display: 'flex' }}>

        {/* ══ LEFT PANEL — Enhanced ══ */}
        <motion.div
          className="signup-left"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            width: '44%', background: GRAD.hero,
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            padding: '80px 52px 60px',
            position: 'relative', overflow: 'hidden', flexShrink: 0,
          }}
        >
          {/* Rings */}
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: 260 + i * 130, height: 260 + i * 130,
              borderRadius: '50%',
              border: `1px solid rgba(255,255,255,${0.04 - i * 0.008})`,
              top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              pointerEvents: 'none',
            }} />
          ))}

          {/* Floating dots */}
          {[...Array(6)].map((_, i) => (
            <motion.div key={`dot-${i}`}
              animate={{ y: [0, -12, 0], opacity: [0.25, 0.6, 0.25] }}
              transition={{ duration: 2.6 + i * 0.35, repeat: Infinity, delay: i * 0.28 }}
              style={{
                position: 'absolute', width: 5, height: 5,
                borderRadius: '50%', background: 'rgba(255,255,255,0.28)',
                top: `${12 + i * 13}%`, left: `${8 + i * 14}%`,
              }}
            />
          ))}

          {/* Glow blob */}
          <div style={{
            position: 'absolute', width: 280, height: 280, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 70%)',
            top: '15%', right: '-8%', pointerEvents: 'none',
          }} />

          {/* Logo */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 14, delay: 0.2 }}
            style={{ textAlign: 'center', marginBottom: 32 }}
          >
            <div style={{
              width: 76, height: 76, borderRadius: 22,
              background: 'linear-gradient(135deg, #2563eb, #818cf8)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 36,
              margin: '0 auto 18px',
              boxShadow: '0 14px 44px rgba(37,99,235,0.45)',
            }}>🏥</div>
            <div style={{
              fontSize: 32, fontWeight: 900, color: '#fff',
              marginBottom: 10, letterSpacing: '-0.8px',
            }}>MediBook</div>
            <div style={{
              fontSize: 14, color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.75, maxWidth: 290,
            }}>
              Set up your clinic in 2 minutes. Start managing
              appointments and patients today.
            </div>
          </motion.div>

          {/* Feature list */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            gap: 9, width: '100%', maxWidth: 310, marginBottom: 28,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700,
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4,
            }}>
              Everything you get for free
            </div>
            {[
              { icon: '✅', text: 'Free clinic setup — no credit card required' },
              { icon: '👨‍⚕️', text: 'Add doctors with role-based access'          },
              { icon: '👥', text: 'Add patients and assign to doctors'           },
              { icon: '📅', text: 'Smart appointment scheduling'                 },
              { icon: '💰', text: 'Billing and payment tracking'                 },
              { icon: '📊', text: 'Real-time clinic analytics'                   },
              { icon: '🔒', text: 'HIPAA-ready secure infrastructure'            },
            ].map((f, i) => (
              <motion.div key={f.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.38 + i * 0.07 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <span style={{ fontSize: 15 }}>{f.icon}</span>
                <span style={{
                  fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500,
                }}>
                  {f.text}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            style={{
              width: '100%', maxWidth: 310,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            <div style={{ display: 'flex' }}>
              {['A', 'B', 'C', 'D'].map((l, i) => (
                <div key={l} style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: `linear-gradient(135deg, hsl(${i * 60},70%,45%), hsl(${i * 60 + 30},70%,55%))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, color: '#fff',
                  marginLeft: i > 0 ? -8 : 0,
                  border: '2px solid rgba(255,255,255,0.2)',
                }}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>
                1,200+ clinics trust MediBook
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ fontSize: 11, color: '#f59e0b' }}>★</span>
                ))}
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginLeft: 4 }}>
                  4.9/5 rating
                </span>
              </div>
            </div>
          </motion.div>

          <div style={{
            position: 'absolute', bottom: 24,
            fontSize: 10, color: 'rgba(255,255,255,0.22)',
            fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase',
          }}>
            Admin Account Only · Invite Doctors & Patients After
          </div>
        </motion.div>

        {/* ══ RIGHT PANEL — Enhanced ══ */}
        <motion.div
          className="signup-right"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            flex: 1, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            padding: '80px 40px 40px', overflowY: 'auto',
          }}
        >
          <div style={{ width: '100%', maxWidth: 480 }}>

            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center',
                gap: 6, background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 50, padding: '4px 12px', marginBottom: 16,
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: C.green, display: 'inline-block',
                  animation: 'pulse 1.5s infinite',
                }} />
                <span style={{
                  fontSize: 11, fontWeight: 700, color: '#059669',
                  textTransform: 'uppercase', letterSpacing: '1px',
                }}>
                  Free · No credit card needed
                </span>
              </div>
              <div style={{
                fontSize: 30, fontWeight: 900, color: C.textPrimary,
                marginBottom: 8, letterSpacing: '-0.6px', lineHeight: 1.15,
              }}>
                Create your clinic
              </div>
              <div style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.6 }}>
                Admin account · Set up in 2 steps · Free forever
              </div>
            </div>

            {/* Step indicator — Enhanced */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 0,
              marginBottom: 24, background: '#fff',
              borderRadius: 16, border: '1px solid #e8ecf0',
              padding: '4px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            }}>
              {[
                { num: 1, label: 'Your Details', icon: '👤' },
                { num: 2, label: 'Clinic Setup',  icon: '🏥' },
              ].map((s, i) => (
                <React.Fragment key={s.num}>
                  <div style={{
                    flex: 1, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 8,
                    padding: '11px 16px', borderRadius: 12,
                    background: step === s.num ? GRAD.primary : 'transparent',
                    transition: 'all 0.3s ease',
                    cursor: step > s.num ? 'pointer' : 'default',
                  }}
                  onClick={() => { if (step > s.num) { setStep(s.num as 1 | 2); setError(''); }}}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: step === s.num
                        ? 'rgba(255,255,255,0.2)'
                        : step > s.num ? 'rgba(37,99,235,0.1)' : '#f0f4f8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 900,
                      color: step === s.num ? '#fff' : step > s.num ? C.blue : C.textLight,
                    }}>
                      {step > s.num ? '✓' : s.num}
                    </div>
                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      color: step === s.num ? '#fff'
                        : step > s.num ? C.blue : C.textLight,
                    }}>
                      {s.icon} {s.label}
                    </span>
                  </div>
                  {i < 1 && (
                    <div style={{ width: 1, height: 20, background: '#e8ecf0', flexShrink: 0 }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Admin notice */}
            <div style={{
              padding: '12px 16px', borderRadius: 12,
              background: 'rgba(37,99,235,0.04)',
              border: '1px solid rgba(37,99,235,0.12)',
              marginBottom: 20,
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🔵</span>
              <div>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: C.blue,
                  textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 3,
                }}>
                  Admin Account Only
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
                  This creates your clinic admin account.
                  Doctors and patients are added from your dashboard after sign in.
                </div>
              </div>
            </div>

            {/* Form card */}
            <div style={{
              background: '#fff', borderRadius: 22,
              border: '1px solid #e8ecf0',
              boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
              padding: '32px', marginBottom: 16,
            }}>
              <AnimatePresence mode="wait">

                {/* STEP 1 */}
                {step === 1 && (
                  <motion.form key="step1"
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.22 }}
                    onSubmit={e => {
                      e.preventDefault();
                      if (step1Valid) { setError(''); setStep(2); }
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
                  >
                    <Input
                      label="Full Name" icon="👤"
                      value={fullName} onChange={setFullName}
                      placeholder="e.g. Dr. Jane Smith" required
                      hint="This will appear as the clinic admin name"
                    />
                    <Input
                      label="Email Address" icon="📧" type="email"
                      value={email} onChange={setEmail}
                      placeholder="admin@yourclinic.com" required
                      hint="You'll use this email to sign in"
                    />

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          padding: '12px 16px', borderRadius: 12,
                          background: 'rgba(239,68,68,0.08)',
                          border: '1px solid rgba(239,68,68,0.25)',
                          fontSize: 13, color: '#dc2626', fontWeight: 600,
                        }}
                      >❌ {error}</motion.div>
                    )}

                    <button
                      type="submit" disabled={!step1Valid}
                      style={{
                        padding: '15px', borderRadius: 14, border: 'none',
                        background: step1Valid ? GRAD.primary : '#e8ecf0',
                        color: step1Valid ? '#fff' : C.textLight,
                        fontSize: 15, fontWeight: 700,
                        cursor: step1Valid ? 'pointer' : 'not-allowed',
                        boxShadow: step1Valid
                          ? '0 4px 20px rgba(37,99,235,0.35)' : 'none',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => {
                        if (step1Valid) e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      Continue → Clinic Setup
                    </button>
                  </motion.form>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <motion.form key="step2"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.22 }}
                    onSubmit={handleSignup}
                    style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
                  >
                    <Input
                      label="Clinic Name" icon="🏥"
                      value={clinicName} onChange={setClinicName}
                      placeholder="e.g. Riverside Family Clinic"
                      required disabled={loading}
                      hint="Shown across all dashboards"
                    />
                    <Input
                      label="Clinic Phone" icon="📞" type="tel"
                      value={phone} onChange={setPhone}
                      placeholder="+1 (555) 200-3000" disabled={loading}
                    />
                    <Input
                      label="Clinic Address" icon="📍"
                      value={address} onChange={setAddress}
                      placeholder="450 Riverside Drive, New York, NY"
                      disabled={loading}
                    />

                    {/* Password */}
                    <div>
                      <label style={{
                        display: 'block', fontSize: 12, fontWeight: 700,
                        color: C.textMuted, textTransform: 'uppercase',
                        letterSpacing: '0.8px', marginBottom: 8,
                      }}>
                        🔒 Password <span style={{ color: C.red }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPass ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="Create a strong password"
                          required disabled={loading}
                          style={{
                            width: '100%', padding: '13px 48px 13px 16px',
                            borderRadius: 12, border: '2px solid #e8ecf0',
                            fontSize: 14, color: C.textPrimary,
                            background: loading ? '#f8fafc' : '#fff',
                            outline: 'none', boxSizing: 'border-box',
                            transition: 'all 0.2s',
                            fontFamily: "'Segoe UI', system-ui, sans-serif",
                            cursor: loading ? 'not-allowed' : 'text',
                          }}
                          onFocus={e => {
                            if (!loading) {
                              e.target.style.border = `2px solid ${C.blue}`;
                              e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.08)';
                            }
                          }}
                          onBlur={e => {
                            e.target.style.border = '2px solid #e8ecf0';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                        <button
                          type="button" onClick={() => setShowPass(!showPass)}
                          style={{
                            position: 'absolute', right: 14, top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none', border: 'none',
                            cursor: 'pointer', fontSize: 18,
                            color: C.textLight, padding: 0,
                          }}
                        >
                          {showPass ? '🙈' : '👁️'}
                        </button>
                      </div>
                      <PasswordStrength password={password} />
                    </div>

                    {/* Confirm password */}
                    <div>
                      <label style={{
                        display: 'block', fontSize: 12, fontWeight: 700,
                        color: C.textMuted, textTransform: 'uppercase',
                        letterSpacing: '0.8px', marginBottom: 8,
                      }}>
                        🔒 Confirm Password <span style={{ color: C.red }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          value={confirm}
                          onChange={e => setConfirm(e.target.value)}
                          placeholder="Repeat your password"
                          required disabled={loading}
                          style={{
                            width: '100%', padding: '13px 48px 13px 16px',
                            borderRadius: 12,
                            border: confirm && confirm !== password
                              ? `2px solid ${C.red}`
                              : confirm && confirm === password
                              ? `2px solid ${C.green}`
                              : '2px solid #e8ecf0',
                            fontSize: 14, color: C.textPrimary,
                            background: loading ? '#f8fafc' : '#fff',
                            outline: 'none', boxSizing: 'border-box',
                            transition: 'all 0.2s',
                            fontFamily: "'Segoe UI', system-ui, sans-serif",
                            cursor: loading ? 'not-allowed' : 'text',
                          }}
                          onFocus={e => {
                            if (!loading && (!confirm || confirm === password)) {
                              e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.08)';
                            }
                          }}
                          onBlur={e => { e.target.style.boxShadow = 'none'; }}
                        />
                        <button
                          type="button" onClick={() => setShowConfirm(!showConfirm)}
                          style={{
                            position: 'absolute', right: 14, top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none', border: 'none',
                            cursor: 'pointer', fontSize: 18,
                            color: C.textLight, padding: 0,
                          }}
                        >
                          {showConfirm ? '🙈' : '👁️'}
                        </button>
                      </div>
                      {confirm && confirm !== password && (
                        <div style={{ fontSize: 12, color: C.red, marginTop: 5, fontWeight: 600 }}>
                          ❌ Passwords do not match
                        </div>
                      )}
                      {confirm && confirm === password && (
                        <div style={{ fontSize: 12, color: C.green, marginTop: 5, fontWeight: 600 }}>
                          ✅ Passwords match
                        </div>
                      )}
                    </div>

                    {/* Error */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          padding: '12px 16px', borderRadius: 12,
                          background: 'rgba(239,68,68,0.08)',
                          border: '1px solid rgba(239,68,68,0.25)',
                          fontSize: 13, color: '#dc2626', fontWeight: 600,
                        }}
                      >❌ {error}</motion.div>
                    )}

                    {/* Loading */}
                    {loading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                          padding: '12px 16px', borderRadius: 12,
                          background: 'rgba(37,99,235,0.06)',
                          border: '1px solid rgba(37,99,235,0.15)',
                          fontSize: 13, color: C.blue, fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: 10,
                        }}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          style={{
                            width: 14, height: 14, borderRadius: '50%',
                            border: '2px solid rgba(37,99,235,0.2)',
                            borderTop: `2px solid ${C.blue}`, flexShrink: 0,
                          }}
                        />
                        Setting up your clinic — please wait...
                      </motion.div>
                    )}

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => { setStep(1); setError(''); }}
                        disabled={loading}
                        style={{
                          padding: '15px 20px', borderRadius: 14,
                          border: '2px solid #e8ecf0',
                          background: '#f8fafc', color: C.textMuted,
                          fontSize: 14, fontWeight: 700,
                          cursor: loading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s', flexShrink: 0,
                          opacity: loading ? 0.5 : 1,
                        }}
                      >
                        ← Back
                      </button>

                      <button
                        type="submit" disabled={!step2Valid || loading}
                        style={{
                          flex: 1, padding: '15px', borderRadius: 14, border: 'none',
                          background: step2Valid && !loading ? GRAD.green : '#e8ecf0',
                          color: step2Valid && !loading ? '#fff' : C.textLight,
                          fontSize: 15, fontWeight: 700,
                          cursor: step2Valid && !loading ? 'pointer' : 'not-allowed',
                          boxShadow: step2Valid && !loading
                            ? '0 4px 20px rgba(5,150,105,0.35)' : 'none',
                          transition: 'all 0.2s',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: 10,
                        }}
                        onMouseEnter={e => {
                          if (step2Valid && !loading)
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {loading ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                              style={{
                                width: 18, height: 18, borderRadius: '50%',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderTop: '2px solid #fff',
                              }}
                            />
                            Creating your clinic...
                          </>
                        ) : '🏥 Create Clinic Account'}
                      </button>
                    </div>

                    <div style={{
                      textAlign: 'center', fontSize: 11,
                      color: C.textLight, lineHeight: 1.6,
                    }}>
                      By creating an account you agree to our{' '}
                      <span style={{ color: C.blue, cursor: 'pointer' }}>Terms of Service</span>
                      {' '}and{' '}
                      <span style={{ color: C.blue, cursor: 'pointer' }}>Privacy Policy</span>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Sign in link */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 14, color: C.textMuted }}>
                Already have an account?{' '}
              </span>
              <button
                type="button"
                onClick={() => router.push('/login')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: 700, color: C.blue,
                  textDecoration: 'underline', padding: 0,
                }}
              >
                Sign in →
              </button>
            </div>

            {/* Trust bar */}
            <div style={{
              display: 'flex', justifyContent: 'center',
              gap: 16, flexWrap: 'wrap',
            }}>
              {['🔒 SSL Secured', '🏥 HIPAA-Ready', '⚡ Supabase', '🛡️ SOC 2'].map(b => (
                <div key={b} style={{
                  fontSize: 11, color: C.textLight, fontWeight: 600,
                }}>
                  {b}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}