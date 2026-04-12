// FILE: app/login/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

// ─────────────────────────────────────────────
// TOKENS
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
};

const ROLE_PATH: Record<string, string> = {
  admin:   '/dashboard/admin',
  doctor:  '/dashboard/doctor',
  patient: '/dashboard/patient',
};

// ─────────────────────────────────────────────
// ROLE LOOKUP WITH RETRY — UNTOUCHED
// ─────────────────────────────────────────────
interface ProfileRow {
  role: string;
}

async function getRoleWithRetry(
  userId: string,
  maxAttempts = 4,
  delayMs     = 600
): Promise<string | null> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[MediBook] Role fetch attempt ${attempt}/${maxAttempts}`);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn(`[MediBook] Attempt ${attempt} DB error:`, error.message);
      } else {
        const profile = data as ProfileRow | null;
        if (profile?.role) {
          console.log(`[MediBook] ✅ Role found: "${profile.role}"`);
          return profile.role;
        }
        console.warn(`[MediBook] Attempt ${attempt}: row exists but no role`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[MediBook] Attempt ${attempt} threw:`, msg);
    }
    if (attempt < maxAttempts) {
      console.log(`[MediBook] Waiting ${delayMs}ms before retry...`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  console.error('[MediBook] ❌ All role fetch attempts failed');
  return null;
}

// ─────────────────────────────────────────────
// NAV LINKS — public pages
// ─────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Home',     href: '/'         },
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

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link
            href="/signup"
            style={{
              textDecoration: 'none',
              fontSize: 13, fontWeight: 700,
              color: C.blue,
              padding: '7px 16px', borderRadius: 8,
              border: '1.5px solid rgba(37,99,235,0.25)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(37,99,235,0.06)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            Create Account
          </Link>
          <div style={{
            background: GRAD.primary,
            borderRadius: 8,
            padding: '7px 16px',
            fontSize: 13, fontWeight: 700, color: '#fff',
            boxShadow: '0 3px 12px rgba(37,99,235,0.3)',
          }}>
            Sign In ↗
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
// LOGIN PAGE
// ─────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();

  const mounted             = useRef(true);
  const navigationTriggered = useRef(false);

  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [showPass,  setShowPass]  = useState(false);
  const [checking,  setChecking]  = useState(true);
  const [statusMsg, setStatusMsg] = useState('Checking session...');

  const [showForgot,    setShowForgot]    = useState(false);
  const [forgotEmail,   setForgotEmail]   = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError,   setForgotError]   = useState('');

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const safeSet = {
    error:    (v: string)  => { if (mounted.current) setError(v);     },
    loading:  (v: boolean) => { if (mounted.current) setLoading(v);   },
    status:   (v: string)  => { if (mounted.current) setStatusMsg(v); },
    checking: (v: boolean) => { if (mounted.current) setChecking(v);  },
  };

  // ─── SESSION CHECK ON MOUNT — UNTOUCHED ───
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        console.log('[MediBook] Checking existing session...');
        const { data: { user }, error: userError } =
          await supabase.auth.getUser();

        if (userError || !user) {
          console.log('[MediBook] No session — showing login form');
          safeSet.checking(false);
          return;
        }

        console.log('[MediBook] Session found:', user.id);
        safeSet.status('Detecting your role...');
        const role = await getRoleWithRetry(user.id);

        if (!mounted.current) return;

        if (role && ROLE_PATH[role]) {
          console.log(`[MediBook] Auto-redirecting to ${ROLE_PATH[role]}`);
          router.replace(ROLE_PATH[role]);
          return;
        }

        console.warn('[MediBook] Session exists but profile has no valid role');
        safeSet.checking(false);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[MediBook] Session check error:', msg);
        safeSet.checking(false);
      }
    };
    checkExistingSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── LOGIN HANDLER — UNTOUCHED ────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (loading || navigationTriggered.current) return;

    setError('');
    setLoading(true);
    setStatusMsg('Signing in...');
    navigationTriggered.current = false;

    try {
      console.log('[MediBook] Step 1: Authenticating...');
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email:    email.trim().toLowerCase(),
          password,
        });

      if (authError) {
        console.error('[MediBook] Auth error:', authError.message);
        const msg = authError.message.toLowerCase();
        let userMessage = 'Wrong email or password. Please try again.';
        if (msg.includes('email not confirmed')) {
          userMessage = 'Your email is not confirmed. Check your inbox for a confirmation link.';
        } else if (!msg.includes('invalid') && !msg.includes('credentials')) {
          userMessage = authError.message;
        }
        safeSet.error(userMessage);
        safeSet.loading(false);
        return;
      }

      if (!authData?.user) {
        safeSet.error('Login failed — no user returned. Please try again.');
        safeSet.loading(false);
        return;
      }

      const user = authData.user;
      console.log('[MediBook] Step 1 ✅ Authenticated:', user.id);
      console.log('[MediBook] Step 2: Fetching role...');
      safeSet.status('Loading your dashboard...');

      const role = await getRoleWithRetry(user.id);
      console.log('[MediBook] Step 2 result — role:', role);

      if (role && ROLE_PATH[role]) {
        if (navigationTriggered.current) return;
        navigationTriggered.current = true;
        const destination = ROLE_PATH[role];
        console.log(`[MediBook] Step 3 ✅ Navigating to ${destination}`);
        safeSet.status(`Opening ${role} dashboard...`);
        router.replace(destination);

        setTimeout(() => {
          if (mounted.current && !navigationTriggered.current) {
            safeSet.error('Navigation stalled. Please refresh the page.');
            safeSet.loading(false);
          }
        }, 6000);
        return;
      }

      console.warn('[MediBook] Step 3: No profile found — upserting...');
      safeSet.status('Setting up your profile...');

      const meta     = user.user_metadata ?? {};
      const metaRole = typeof meta.role === 'string' ? meta.role : 'admin';
      const fullName = typeof meta.full_name === 'string' ? meta.full_name : '';

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(
          { id: user.id, role: metaRole, full_name: fullName, email: user.email ?? '' },
          { onConflict: 'id' }
        );

      if (upsertError) {
        console.error('[MediBook] Upsert failed:', upsertError.message);
        safeSet.error('Your account profile is missing and could not be created. Please contact support.');
        await supabase.auth.signOut();
        safeSet.loading(false);
        navigationTriggered.current = false;
        return;
      }

      if (metaRole === 'admin') {
        const { data: existingClinic } = await supabase
          .from('clinics').select('id').eq('admin_id', user.id).maybeSingle();
        if (!existingClinic) {
          const clinicName = `${fullName.trim() || 'Admin'}'s Clinic`;
          const { data: newClinic } = await supabase
            .from('clinics')
            .insert({ admin_id: user.id, name: clinicName, email: user.email ?? '' })
            .select('id').single();
          if (newClinic) {
            await supabase.from('profiles').update({ clinic_id: newClinic.id }).eq('id', user.id);
          }
        }
      }

      if (navigationTriggered.current) return;
      navigationTriggered.current = true;

      const fallbackPath = ROLE_PATH[metaRole] ?? '/dashboard/admin';
      console.log(`[MediBook] Navigating after upsert to: ${fallbackPath}`);
      safeSet.status(`Opening ${metaRole} dashboard...`);
      router.replace(fallbackPath);

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[MediBook] Login handler threw:', msg);
      safeSet.error('Something went wrong. Please try again.');
      safeSet.loading(false);
      navigationTriggered.current = false;
    }
  };

  // ─── FORGOT PASSWORD — UNTOUCHED ──────────
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        forgotEmail.trim(),
        { redirectTo: `${window.location.origin}/reset-password` }
      );
      if (error) {
        setForgotError('Could not send reset email. Please check the address.');
      } else {
        setForgotSuccess(true);
      }
    } catch {
      setForgotError('Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  // ─── CHECKING SPINNER ─────────────────────
  if (checking) {
    return (
      <div style={{
        minHeight: '100vh', background: C.page,
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column',
        gap: 20, fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: GRAD.primary,
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 30,
          boxShadow: '0 12px 40px rgba(37,99,235,0.3)',
        }}>🏥</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: C.textPrimary }}>
          Medi<span style={{ color: C.blue }}>Book</span>
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '3px solid #e8ecf0',
            borderTop: `3px solid ${C.blue}`,
          }}
        />
        <div style={{ fontSize: 14, color: C.textMuted, fontWeight: 600 }}>
          {statusMsg}
        </div>
        <FallbackButton
          onFallback={async () => {
            console.log('[MediBook] Fallback — clearing session');
            await supabase.auth.signOut();
            if (mounted.current) setChecking(false);
          }}
          delayMs={8000}
        />
      </div>
    );
  }

  // ─── MAIN RENDER ──────────────────────────
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; }
        @media (max-width: 900px) {
          .login-left  { display: none !important; }
          .login-right { width: 100% !important; padding: 100px 24px 40px !important; }
        }
        @media (min-width: 901px) {
          .login-right { padding-top: 80px !important; }
        }
        .input-field:focus {
          border: 2px solid #2563eb !important;
          box-shadow: 0 0 0 4px rgba(37,99,235,0.08) !important;
        }
        .nav-link-item:hover {
          color: #2563eb !important;
          background: rgba(37,99,235,0.06) !important;
        }
      `}</style>

      <TopNav />

      <div style={{ minHeight: '100vh', background: C.page, display: 'flex' }}>

        {/* ══ LEFT PANEL — Enhanced ══ */}
        <motion.div
          className="login-left"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            width: '46%',
            background: GRAD.hero,
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            padding: '80px 52px 60px',
            position: 'relative', overflow: 'hidden', flexShrink: 0,
          }}
        >
          {/* Decorative rings */}
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
          {[...Array(7)].map((_, i) => (
            <motion.div key={i}
              animate={{ y: [0, -14, 0], opacity: [0.25, 0.65, 0.25] }}
              transition={{ duration: 2.6 + i * 0.35, repeat: Infinity, delay: i * 0.28 }}
              style={{
                position: 'absolute', width: 5, height: 5,
                borderRadius: '50%', background: 'rgba(255,255,255,0.28)',
                top: `${12 + i * 11}%`, left: `${8 + i * 12}%`,
              }}
            />
          ))}

          {/* Glow blob */}
          <div style={{
            position: 'absolute', width: 300, height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)',
            top: '20%', right: '-10%', pointerEvents: 'none',
          }} />

          {/* Logo + brand */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 14, delay: 0.2 }}
            style={{ textAlign: 'center', marginBottom: 36 }}
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
              fontSize: 34, fontWeight: 900, color: '#fff',
              marginBottom: 10, letterSpacing: '-0.8px',
            }}>
              MediBook
            </div>
            <div style={{
              fontSize: 14, color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.75, maxWidth: 290,
            }}>
              The smart clinic management platform trusted
              by 1,200+ healthcare teams worldwide
            </div>
          </motion.div>

          {/* Role access cards */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            gap: 10, width: '100%', maxWidth: 320, marginBottom: 28,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4,
            }}>
              One Login — Three Portals
            </div>
            {[
              { icon: '🔵', role: 'Admin Portal',   desc: 'Full clinic management & analytics', color: 'rgba(37,99,235,0.2)' },
              { icon: '🟢', role: 'Doctor Portal',  desc: 'Appointments, patients & earnings',  color: 'rgba(16,185,129,0.2)' },
              { icon: '🟣', role: 'Patient Portal', desc: 'My schedule, records & doctor info', color: 'rgba(139,92,246,0.2)' },
            ].map((r, i) => (
              <motion.div key={r.role}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.38 + i * 0.1 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 16px', borderRadius: 14,
                  background: r.color,
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <span style={{ fontSize: 22 }}>{r.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 2 }}>
                    {r.role}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
                    {r.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
              gap: 0, width: '100%', maxWidth: 320,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16, overflow: 'hidden',
            }}
          >
            {[
              { value: '1,200+', label: 'Active Clinics' },
              { value: '98.9%',  label: 'Uptime SLA'     },
              { value: '4.9★',   label: 'User Rating'    },
            ].map((s, i) => (
              <div key={s.label} style={{
                textAlign: 'center', padding: '16px 8px',
                borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}>
                <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', marginBottom: 3 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.38)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={{
              marginTop: 24, maxWidth: 320,
              padding: '14px 18px', borderRadius: 14,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 10 }}>
              "MediBook transformed how we run our clinic. Appointments, billing,
              and patient records all in one place."
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg,#2563eb,#818cf8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, color: '#fff',
              }}>D</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Dr. Sarah Mitchell</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Family Practice, Boston</div>
              </div>
            </div>
          </motion.div>

          <div style={{
            position: 'absolute', bottom: 24,
            fontSize: 10, color: 'rgba(255,255,255,0.22)',
            fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase',
          }}>
            HIPAA-Ready · AES-256 Encrypted · SOC 2 Compliant
          </div>
        </motion.div>

        {/* ══ RIGHT PANEL — Enhanced ══ */}
        <motion.div
          className="login-right"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            flex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '80px 40px 40px',
            overflowY: 'auto',
          }}
        >
          <div style={{ width: '100%', maxWidth: 440 }}>
            <AnimatePresence mode="wait">

              {/* ── FORGOT PASSWORD ── */}
              {showForgot ? (
                <motion.div key="forgot"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                >
                  <button
                    onClick={() => {
                      setShowForgot(false);
                      setForgotSuccess(false);
                      setForgotError('');
                      setForgotEmail('');
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 13, color: C.textMuted, fontWeight: 600,
                      marginBottom: 32, padding: '6px 0',
                    }}
                  >
                    ← Back to Sign In
                  </button>

                  {/* Card */}
                  <div style={{
                    background: '#fff', borderRadius: 24,
                    padding: '40px', border: '1px solid #e8ecf0',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.07)',
                  }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 16,
                      background: GRAD.primary,
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 26,
                      marginBottom: 20,
                      boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
                    }}>🔑</div>

                    <div style={{
                      fontSize: 24, fontWeight: 900, color: C.textPrimary,
                      marginBottom: 8, letterSpacing: '-0.5px',
                    }}>
                      Reset your password
                    </div>
                    <div style={{
                      fontSize: 14, color: C.textMuted,
                      marginBottom: 28, lineHeight: 1.65,
                    }}>
                      Enter your account email and we'll send you a
                      secure password reset link instantly.
                    </div>

                    {forgotSuccess ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                          padding: '28px', borderRadius: 16,
                          background: 'rgba(16,185,129,0.06)',
                          border: '1px solid rgba(16,185,129,0.2)',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: 44, marginBottom: 14 }}>📧</div>
                        <div style={{ fontSize: 17, fontWeight: 800, color: '#059669', marginBottom: 8 }}>
                          Check your inbox!
                        </div>
                        <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.65 }}>
                          Reset link sent to{' '}
                          <strong style={{ color: C.textPrimary }}>{forgotEmail}</strong>
                          <br />Check your spam folder if you don't see it.
                        </div>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                          <label style={{
                            display: 'block', fontSize: 12, fontWeight: 700,
                            color: C.textMuted, textTransform: 'uppercase',
                            letterSpacing: '0.8px', marginBottom: 8,
                          }}>
                            📧 Email Address
                          </label>
                          <input
                            type="email" value={forgotEmail}
                            onChange={e => setForgotEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            style={{
                              width: '100%', padding: '13px 16px',
                              borderRadius: 12, border: '2px solid #e8ecf0',
                              fontSize: 14, color: C.textPrimary,
                              background: '#fff', outline: 'none',
                              boxSizing: 'border-box', transition: 'all 0.2s',
                              fontFamily: "'Segoe UI', system-ui, sans-serif",
                            }}
                            onFocus={e => {
                              e.target.style.border = `2px solid ${C.blue}`;
                              e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.08)';
                            }}
                            onBlur={e => {
                              e.target.style.border = '2px solid #e8ecf0';
                              e.target.style.boxShadow = 'none';
                            }}
                          />
                        </div>

                        {forgotError && (
                          <div style={{
                            padding: '12px 16px', borderRadius: 12,
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.25)',
                            fontSize: 13, color: '#dc2626', fontWeight: 600,
                          }}>
                            ❌ {forgotError}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={forgotLoading || !forgotEmail.trim()}
                          style={{
                            padding: '15px', borderRadius: 14, border: 'none',
                            background: forgotLoading || !forgotEmail.trim()
                              ? '#e8ecf0' : GRAD.primary,
                            color: forgotLoading || !forgotEmail.trim()
                              ? C.textLight : '#fff',
                            fontSize: 15, fontWeight: 700,
                            cursor: forgotLoading || !forgotEmail.trim()
                              ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', gap: 10,
                            boxShadow: forgotLoading || !forgotEmail.trim()
                              ? 'none' : '0 4px 20px rgba(37,99,235,0.3)',
                          }}
                        >
                          {forgotLoading ? (
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
                              Sending...
                            </>
                          ) : '📧 Send Reset Link'}
                        </button>
                      </form>
                    )}
                  </div>
                </motion.div>

              ) : (

                /* ── MAIN LOGIN FORM — Enhanced ── */
                <motion.div key="login"
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Header */}
                  <div style={{ marginBottom: 28 }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center',
                      gap: 6, background: 'rgba(16,185,129,0.08)',
                      border: '1px solid rgba(16,185,129,0.2)',
                      borderRadius: 50, padding: '4px 12px',
                      marginBottom: 18,
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
                        All systems operational
                      </span>
                    </div>
                    <div style={{
                      fontSize: 30, fontWeight: 900, color: C.textPrimary,
                      marginBottom: 8, letterSpacing: '-0.6px', lineHeight: 1.15,
                    }}>
                      Welcome back 👋
                    </div>
                    <div style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.6 }}>
                      Sign in to your MediBook dashboard.
                      Your role is detected automatically.
                    </div>
                  </div>

                  {/* Role info panel */}
                  <div style={{
                    padding: '16px', borderRadius: 16,
                    background: 'rgba(37,99,235,0.04)',
                    border: '1px solid rgba(37,99,235,0.12)',
                    marginBottom: 26,
                  }}>
                    <div style={{
                      fontSize: 11, fontWeight: 700, color: C.blue,
                      textTransform: 'uppercase', letterSpacing: '0.8px',
                      marginBottom: 10,
                    }}>
                      🔑 One login — auto-detects your role
                    </div>
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
                    }}>
                      {[
                        { dot: '🔵', role: 'Admin',   tag: 'Full Access'  },
                        { dot: '🟢', role: 'Doctor',  tag: 'Medical View' },
                        { dot: '🟣', role: 'Patient', tag: 'My Portal'    },
                      ].map(r => (
                        <div key={r.role} style={{
                          textAlign: 'center', padding: '10px 6px',
                          background: '#fff', borderRadius: 10,
                          border: '1px solid #e8ecf0',
                        }}>
                          <div style={{ fontSize: 18, marginBottom: 4 }}>{r.dot}</div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: C.textPrimary }}>
                            {r.role}
                          </div>
                          <div style={{ fontSize: 10, color: C.textLight, fontWeight: 600 }}>
                            {r.tag}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form card */}
                  <div style={{
                    background: '#fff', borderRadius: 24,
                    padding: '36px', border: '1px solid #e8ecf0',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
                    marginBottom: 20,
                  }}>
                    <form
                      onSubmit={handleLogin}
                      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                    >
                      {/* Email */}
                      <div>
                        <label style={{
                          display: 'block', fontSize: 12, fontWeight: 700,
                          color: C.textMuted, textTransform: 'uppercase',
                          letterSpacing: '0.8px', marginBottom: 8,
                        }}>
                          📧 Email Address
                        </label>
                        <input
                          type="email" value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required autoComplete="email"
                          disabled={loading}
                          style={{
                            width: '100%', padding: '14px 16px',
                            borderRadius: 12, border: '2px solid #e8ecf0',
                            fontSize: 15, color: C.textPrimary,
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
                      </div>

                      {/* Password */}
                      <div>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center', marginBottom: 8,
                        }}>
                          <label style={{
                            fontSize: 12, fontWeight: 700,
                            color: C.textMuted, textTransform: 'uppercase',
                            letterSpacing: '0.8px',
                          }}>
                            🔒 Password
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setShowForgot(true);
                              setForgotEmail(email);
                              setError('');
                            }}
                            style={{
                              background: 'none', border: 'none',
                              cursor: 'pointer', fontSize: 12,
                              color: C.blue, fontWeight: 700, padding: 0,
                            }}
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showPass ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required autoComplete="current-password"
                            disabled={loading}
                            style={{
                              width: '100%', padding: '14px 50px 14px 16px',
                              borderRadius: 12, border: '2px solid #e8ecf0',
                              fontSize: 15, color: C.textPrimary,
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
                            type="button"
                            onClick={() => setShowPass(p => !p)}
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
                      </div>

                      {/* Error */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            key="error"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            style={{
                              padding: '13px 16px', borderRadius: 12,
                              background: 'rgba(239,68,68,0.07)',
                              border: '1px solid rgba(239,68,68,0.22)',
                              fontSize: 13, color: '#dc2626',
                              fontWeight: 600, lineHeight: 1.5,
                              display: 'flex', alignItems: 'flex-start', gap: 8,
                            }}
                          >
                            <span style={{ flexShrink: 0 }}>❌</span>
                            {error}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Status */}
                      {loading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          style={{
                            padding: '13px 16px', borderRadius: 12,
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
                          {statusMsg}
                        </motion.div>
                      )}

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          padding: '16px', borderRadius: 14, border: 'none',
                          background: loading ? '#e8ecf0' : GRAD.primary,
                          color: loading ? C.textLight : '#fff',
                          fontSize: 16, fontWeight: 800,
                          cursor: loading ? 'not-allowed' : 'pointer',
                          boxShadow: loading ? 'none' : '0 6px 24px rgba(37,99,235,0.38)',
                          transition: 'all 0.2s',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: 10,
                          letterSpacing: '-0.2px',
                        }}
                        onMouseEnter={e => {
                          if (!loading) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 10px 32px rgba(37,99,235,0.45)';
                          }
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = loading ? 'none' : '0 6px 24px rgba(37,99,235,0.38)';
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
                            {statusMsg}
                          </>
                        ) : '🔐 Sign In to Dashboard'}
                      </button>
                    </form>
                  </div>

                  {/* Divider */}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: 12, marginBottom: 16,
                  }}>
                    <div style={{ flex: 1, height: 1, background: C.border }} />
                    <span style={{ fontSize: 12, color: C.textLight, fontWeight: 600 }}>
                      New to MediBook?
                    </span>
                    <div style={{ flex: 1, height: 1, background: C.border }} />
                  </div>

                  {/* Signup CTA */}
                  <button
                    type="button"
                    onClick={() => router.push('/signup')}
                    style={{
                      width: '100%', padding: '14px',
                      borderRadius: 14, border: '2px solid #e8ecf0',
                      background: '#fff', color: C.textPrimary,
                      fontSize: 15, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 8,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.border = `2px solid ${C.blue}`;
                      e.currentTarget.style.color = C.blue;
                      e.currentTarget.style.background = 'rgba(37,99,235,0.04)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.border = '2px solid #e8ecf0';
                      e.currentTarget.style.color = C.textPrimary;
                      e.currentTarget.style.background = '#fff';
                    }}
                  >
                    🏥 Create a free clinic account →
                  </button>

                  {/* Trust bar */}
                  <div style={{
                    display: 'flex', justifyContent: 'center',
                    gap: 16, flexWrap: 'wrap', marginTop: 22,
                  }}>
                    {['🔒 SSL Secured', '🏥 HIPAA-Ready', '⚡ Supabase Auth', '🛡️ SOC 2'].map(b => (
                      <div key={b} style={{
                        fontSize: 11, color: C.textLight,
                        fontWeight: 600, display: 'flex',
                        alignItems: 'center', gap: 4,
                      }}>
                        {b}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// FALLBACK BUTTON — UNTOUCHED
// ─────────────────────────────────────────────
function FallbackButton({
  onFallback,
  delayMs = 8000,
}: {
  onFallback: () => void;
  delayMs?: number;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center', marginTop: 8 }}
    >
      <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 10 }}>
        Taking too long?
      </div>
      <button
        onClick={onFallback}
        style={{
          padding: '10px 24px', borderRadius: 12, border: 'none',
          background: GRAD.primary, color: '#fff',
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
        }}
      >
        Go to Login →
      </button>
    </motion.div>
  );
}