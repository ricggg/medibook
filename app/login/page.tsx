"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const GRAD = {
  primary: 'linear-gradient(135deg, #1e3c7d, #2563eb)',
  hero:    'linear-gradient(160deg, #0f2347 0%, #1e3c7d 50%, #2563eb 100%)',
  green:   'linear-gradient(135deg, #059669, #10b981)',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: '#64748b', marginBottom: 7,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '13px 15px',
  borderRadius: 12, border: '2px solid #e8ecf0',
  fontSize: 14, color: '#0f1729', background: '#ffffff',
  outline: 'none', transition: 'all 0.25s ease',
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
    admin:  { email: 'admin@riverside-clinic.com',  password: 'demo1234' },
    doctor: { email: 'dr.mitchell@riverside-clinic.com', password: 'demo1234' },
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f0f4f8', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* LEFT PANEL */}
      <div className="hidden lg:flex" style={{ width: '42%', background: GRAD.hero, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', padding: '60px 56px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 56 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #2563eb, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏥</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1 }}>MediBook</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px' }}>For Clinics</div>
          </div>
        </a>

        <h2 style={{ fontSize: 34, fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 18, letterSpacing: '-0.5px' }}>
          Welcome Back<br />to Your Clinic Portal.
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, marginBottom: 44, maxWidth: 340 }}>
          Manage your clinic's appointments, patients, doctors, and analytics — all from one unified dashboard.
        </p>

        {/* What's inside */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 44 }}>
          {[
            { icon: '📊', title: 'Admin Dashboard',  desc: 'Full clinic overview, revenue & analytics' },
            { icon: '👨‍⚕️', title: 'Doctor Portal',    desc: 'Schedule, patients, prescriptions'        },
            { icon: '📅', title: 'Live Scheduling',  desc: 'Real-time appointment management'          },
          ].map(item => (
            <div key={item.title} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, border: '1px solid rgba(255,255,255,0.15)' }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{item.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.08)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)', maxWidth: 360 }}>
          <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
            {[1,2,3,4,5].map(s => <span key={s} style={{ color: '#fbbf24', fontSize: 13 }}>⭐</span>)}
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 12 }}>
            "Our no-show rate dropped 61% in the first month. MediBook runs our entire clinic."
          </p>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Dr. Amanda Foster · Riverside Family Clinic</div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px 24px' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 480 }}>

          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: GRAD.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏥</div>
              <span style={{ fontSize: 18, fontWeight: 900, background: GRAD.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MediBook</span>
            </a>
            <a href="/" style={{ fontSize: 13, fontWeight: 600, color: '#64748b', textDecoration: 'none' }}>← Home</a>
          </div>

          {/* Desktop back nav */}
          <div className="hidden lg:flex" style={{ justifyContent: 'flex-end', marginBottom: 24, gap: 20 }}>
            <a href="/" style={{ fontSize: 13, fontWeight: 600, color: '#64748b', textDecoration: 'none' }}>🏠 Home</a>
            <a href="/#pricing" style={{ fontSize: 13, fontWeight: 600, color: '#64748b', textDecoration: 'none' }}>Pricing</a>
            <a href="/#faq" style={{ fontSize: 13, fontWeight: 600, color: '#64748b', textDecoration: 'none' }}>FAQ</a>
          </div>

          {/* Card */}
          <div style={{ background: '#fff', borderRadius: 28, padding: '44px 40px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', border: '1px solid #e8ecf0', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: GRAD.primary, borderRadius: '28px 28px 0 0' }} />

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ width: 52, height: 52, background: GRAD.primary, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18, boxShadow: '0 6px 20px rgba(37,99,235,0.3)' }}>🏥</div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f1729', marginBottom: 6, letterSpacing: '-0.5px' }}>Sign In to MediBook</h1>
              <p style={{ fontSize: 14, color: '#64748b' }}>Access your clinic management dashboard</p>
            </div>

            {/* Role selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24, background: '#f0f4f8', padding: 5, borderRadius: 14 }}>
              {(['admin', 'doctor'] as const).map(r => (
                <button key={r} type="button" onClick={() => {
                  setRole(r);
                  setForm(prev => ({ ...prev, email: demoCredentials[r].email, password: demoCredentials[r].password }));
                }} style={{ padding: '11px 14px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.25s ease', background: role === r ? GRAD.primary : 'transparent', color: role === r ? '#fff' : '#64748b', boxShadow: role === r ? '0 4px 14px rgba(37,99,235,0.25)' : 'none' }}>
                  {r === 'admin' ? '🏥 Clinic Admin' : '👨‍⚕️ Doctor Login'}
                </button>
              ))}
            </div>

            {/* Demo credentials hint */}
            <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.12)', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', marginBottom: 2 }}>🎮 Demo credentials loaded</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{demoCredentials[role].email}</div>
              </div>
              <button
                onClick={() => setForm(prev => ({ ...prev, email: demoCredentials[role].email, password: demoCredentials[role].password }))}
                style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: GRAD.primary, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
              >
                Use Demo
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>📧 Email Address</label>
                <input type="email" required value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} style={inputStyle} onFocus={e => Object.assign(e.target.style, inputFocus)} onBlur={e => Object.assign(e.target.style, inputStyle)} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>🔒 Password</label>
                  <a href="#" style={{ fontSize: 13, color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</a>
                </div>
                <input type="password" required value={form.password} onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))} style={inputStyle} onFocus={e => Object.assign(e.target.style, inputFocus)} onBlur={e => Object.assign(e.target.style, inputStyle)} />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.remember} onChange={e => setForm(prev => ({ ...prev, remember: e.target.checked }))} style={{ width: 17, height: 17, accentColor: '#2563eb', cursor: 'pointer' }} />
                <span style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>Stay signed in for 30 days</span>
              </label>

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', borderRadius: 14, border: 'none', fontSize: 15, fontWeight: 700, color: '#fff', background: loading ? 'rgba(156,163,175,0.6)' : GRAD.primary, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 20px rgba(37,99,235,0.3)', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                {loading ? (
                  <>
                    <div style={{ width: 17, height: 17, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Signing In...
                  </>
                ) : (
                  `Sign In as ${role === 'admin' ? 'Clinic Admin' : 'Doctor'} →`
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '22px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#e8ecf0' }} />
              <span style={{ fontSize: 12, color: '#9ca3af' }}>or</span>
              <div style={{ flex: 1, height: 1, background: '#e8ecf0' }} />
            </div>

            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 14, color: '#64748b' }}>
                New clinic?{' '}
                <a href="/signup" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Request a Free Demo</a>
              </span>
            </div>

            <div style={{ padding: '11px 14px', background: 'rgba(16,185,129,0.05)', borderRadius: 12, border: '1px solid rgba(16,185,129,0.15)', textAlign: 'center' }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>
                Patient booking portal?{' '}
                <a href="/book" style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}>Book an Appointment →</a>
              </span>
            </div>
          </div>

          {/* Trust row */}
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
            {[{ icon: '🔒', text: 'HIPAA-Ready' }, { icon: '🛡️', text: 'AES-256 Encrypted' }, { icon: '✅', text: 'SOC 2 Type II' }].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                {item.icon} {item.text}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
