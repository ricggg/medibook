"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const GRAD = {
  primary: 'linear-gradient(135deg, #1e3c7d, #2563eb)',
  hero: 'linear-gradient(160deg, #0f2347 0%, #1e3c7d 50%, #2563eb 100%)',
  green: 'linear-gradient(135deg, #059669, #10b981)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 15px',
  borderRadius: 12,
  border: '2px solid #e8ecf0',
  fontSize: 14,
  color: '#0f1729',
  background: '#ffffff',
  outline: 'none',
  transition: 'all 0.25s ease',
  fontFamily: "'Segoe UI', system-ui, sans-serif",
  boxSizing: 'border-box',
};

const inputFocus: React.CSSProperties = {
  ...inputStyle,
  border: '2px solid #2563eb',
  boxShadow: '0 0 0 4px rgba(37,99,235,0.08)',
};

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'admin' | 'doctor'>('admin');
  const [form, setForm] = useState({ email: '', password: '', remember: false });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      window.location.href = role === 'admin' ? '/dashboard' : '/doctor';
    }, 1800);
  };

  const demoCredentials = {
    admin: { email: 'admin@riverside-clinic.com', password: 'demo1234' },
    doctor: { email: 'dr.mitchell@riverside-clinic.com', password: 'demo1234' },
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      background: '#f0f4f8',
    }}>

      {/* ── RESPONSIVE LAYOUT WRAPPER ── */}
      <div style={{ display: 'flex', flex: 1, minHeight: '100vh' }} className="login-layout">

        {/* ── LEFT PANEL (hidden on mobile, shown on lg) ── */}
        <div
          className="login-left-panel"
          style={{
            background: GRAD.hero,
            display: 'none', /* hidden by default, shown via CSS below */
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '48px 40px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background decoration */}
          <div style={{
            position: 'absolute', top: '-80px', right: '-80px',
            width: 300, height: 300, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '20%', left: '-60px',
            width: 200, height: 200, borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
          }} />

          {/* Logo */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, border: '1px solid rgba(255,255,255,0.2)',
              }}>🏥</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>MediBook</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>For Clinics</div>
              </div>
            </div>

            <h2 style={{
              fontSize: 32, fontWeight: 800, color: '#fff',
              lineHeight: 1.25, marginBottom: 16,
            }}>
              Welcome Back<br />to Your Clinic Portal.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.7, marginBottom: 40 }}>
              Manage your clinic's appointments, patients, doctors, and analytics — all from one unified dashboard.
            </p>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: '📊', title: 'Admin Dashboard', desc: 'Full clinic overview, revenue & analytics' },
                { icon: '👨‍⚕️', title: 'Doctor Portal', desc: 'Schedule, patients, prescriptions' },
                { icon: '📅', title: 'Live Scheduling', desc: 'Real-time appointment management' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18,
                  }}>{item.icon}</div>
                  <div>
                    <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{item.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 16, padding: '20px 24px',
          }}>
            <div style={{ display: 'flex', gap: 3, marginBottom: 10 }}>
              {[1,2,3,4,5].map(s => <span key={s} style={{ color: '#fbbf24', fontSize: 14 }}>★</span>)}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 1.6, fontStyle: 'italic', marginBottom: 12 }}>
              "Our no-show rate dropped 61% in the first month. MediBook runs our entire clinic."
            </p>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600 }}>
              Dr. Amanda Foster · Riverside Family Clinic
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL (form — always visible) ── */}
        <div style={{
          flex: 1,
          background: '#f0f4f8',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}>

          {/* Top nav */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid #e8ecf0',
            background: '#fff',
          }}>
            {/* Mobile logo (shown only on small screens) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="mobile-logo">
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: GRAD.primary,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>🏥</div>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0f1729' }}>MediBook</span>
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <a href="/" style={{ color: '#64748b', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>← Home</a>
              <a href="/pricing" style={{ color: '#64748b', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Pricing</a>
              <a href="#faq" style={{ color: '#64748b', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>FAQ</a>
            </div>
          </div>

          {/* Form area */}
          <div style={{
            flex: 1, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            padding: '32px 20px',
          }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                background: '#fff',
                borderRadius: 24,
                padding: '36px 32px',
                width: '100%',
                maxWidth: 460,
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                border: '1px solid #e8ecf0',
              }}
              className="login-card"
            >
              {/* Card header */}
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: GRAD.primary, margin: '0 auto 14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
                }}>🏥</div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f1729', margin: '0 0 6px' }}>
                  Sign In to MediBook
                </h1>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                  Access your clinic management dashboard
                </p>
              </div>

              {/* Role tabs */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 8, background: '#f0f4f8',
                borderRadius: 14, padding: 6, marginBottom: 24,
              }}>
                {(['admin', 'doctor'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setForm(prev => ({
                        ...prev,
                        email: demoCredentials[r].email,
                        password: demoCredentials[r].password,
                      }));
                    }}
                    style={{
                      padding: '11px 14px',
                      borderRadius: 10, border: 'none',
                      fontSize: 13, fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      background: role === r ? GRAD.primary : 'transparent',
                      color: role === r ? '#fff' : '#64748b',
                      boxShadow: role === r ? '0 4px 14px rgba(37,99,235,0.25)' : 'none',
                    }}
                  >
                    {r === 'admin' ? '🏥 Clinic Admin' : '👨‍⚕️ Doctor Login'}
                  </button>
                ))}
              </div>

              {/* Demo credentials hint */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(37,99,235,0.05)',
                border: '1px solid rgba(37,99,235,0.15)',
                borderRadius: 12, padding: '12px 14px',
                marginBottom: 20,
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', marginBottom: 2 }}>
                    🎮 Demo credentials loaded
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{demoCredentials[role].email}</div>
                </div>
                <button
                  onClick={() => setForm(prev => ({
                    ...prev,
                    email: demoCredentials[role].email,
                    password: demoCredentials[role].password,
                  }))}
                  style={{
                    padding: '6px 14px', borderRadius: 8, border: 'none',
                    background: GRAD.primary, color: '#fff',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Use Demo
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 7 }}>
                    📧 Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                    style={inputStyle}
                    onFocus={e => Object.assign(e.target.style, inputFocus)}
                    onBlur={e => Object.assign(e.target.style, inputStyle)}
                  />
                </div>

                {/* Password */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>
                      🔒 Password
                    </label>
                    <a href="/forgot-password" style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                      Forgot password?
                    </a>
                  </div>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                    style={inputStyle}
                    onFocus={e => Object.assign(e.target.style, inputFocus)}
                    onBlur={e => Object.assign(e.target.style, inputStyle)}
                  />
                </div>

                {/* Remember me */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={e => setForm(prev => ({ ...prev, remember: e.target.checked }))}
                    style={{ width: 17, height: 17, accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                    Stay signed in for 30 days
                  </span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '15px',
                    background: loading ? 'rgba(156,163,175,0.4)' : GRAD.primary,
                    color: '#fff', border: 'none', borderRadius: 14,
                    fontWeight: 700, fontSize: 15,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 4px 20px rgba(37,99,235,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{
                        width: 18, height: 18, borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid #fff',
                        display: 'inline-block',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                      Signing In...
                    </>
                  ) : (
                    `Sign In as ${role === 'admin' ? 'Clinic Admin' : 'Doctor'} →`
                  )}
                </button>
              </form>

              {/* Divider */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                margin: '20px 0',
              }}>
                <div style={{ flex: 1, height: 1, background: '#e8ecf0' }} />
                <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600 }}>or</span>
                <div style={{ flex: 1, height: 1, background: '#e8ecf0' }} />
              </div>

              {/* Secondary links */}
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
                  New clinic?{' '}
                  <a href="/signup" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
                    Request a Free Demo
                  </a>
                </p>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                  Patient booking portal?{' '}
                  <a href="/book" style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}>
                    Book an Appointment →
                  </a>
                </p>
              </div>

              {/* Trust badges */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center',
                marginTop: 24, paddingTop: 20,
                borderTop: '1px solid #e8ecf0',
              }}>
                {[
                  { icon: '🔒', text: 'HIPAA-Ready' },
                  { icon: '🛡️', text: 'AES-256 Encrypted' },
                  { icon: '✅', text: 'SOC 2 Type II' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: '#f8fafc', border: '1px solid #e8ecf0',
                    borderRadius: 50, padding: '5px 12px',
                    fontSize: 11, color: '#64748b', fontWeight: 600,
                  }}>
                    {item.icon} {item.text}
                  </div>
                ))}
              </div>

            </motion.div>
          </div>
        </div>

      </div>

      {/* Responsive styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        /* On large screens: show left panel, make it 45% wide */
        @media (min-width: 1024px) {
          .login-layout {
            flex-direction: row !important;
          }
          .login-left-panel {
            display: flex !important;
            width: 45% !important;
            min-width: 380px !important;
          }
          .mobile-logo {
            display: none !important;
          }
        }
        /* On medium screens: compact form */
        @media (max-width: 640px) {
          .login-card {
            padding: 28px 20px !important;
            border-radius: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
