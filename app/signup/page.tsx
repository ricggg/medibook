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
  padding: '12px 14px',
  borderRadius: 11,
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

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13,
  fontWeight: 600, color: '#64748b', marginBottom: 7,
};

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    clinicName: '', adminName: '', email: '',
    phone: '', clinicType: '', doctors: '',
    password: '', confirm: '', agreed: false,
  });

  const update = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    setLoading(true);
    setTimeout(() => { window.location.href = '/dashboard'; }, 1800);
  };

  const clinicTypes = [
    'Family Practice', 'Specialty Clinic', "Women's Health",
    'Dental Practice', 'Pediatric Clinic', 'Orthopedic Center',
    'Mental Health', 'Other',
  ];

  const doctorRanges = ['1–3', '4–10', '11–25', '26–50', '50+'];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      background: '#f0f4f8',
    }}>

      {/* ── RESPONSIVE LAYOUT ── */}
      <div style={{ display: 'flex', flex: 1, minHeight: '100vh' }} className="signup-layout">

        {/* ── LEFT PANEL (hidden on mobile) ── */}
        <div
          className="signup-left-panel"
          style={{
            background: GRAD.hero,
            display: 'none',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '48px 40px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background circles */}
          <div style={{
            position: 'absolute', top: '-80px', right: '-80px',
            width: 300, height: 300, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '10%', left: '-60px',
            width: 250, height: 250, borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
          }} />

          <div>
            {/* Logo */}
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

            <h2 style={{ fontSize: 30, fontWeight: 800, color: '#fff', lineHeight: 1.25, marginBottom: 14 }}>
              Start Running Your<br />Clinic Smarter.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.7, marginBottom: 36 }}>
              200+ clinics use MediBook to reduce no-shows, automate scheduling, and grow patient retention.
            </p>

            {/* Benefits list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: '⚡', text: 'Setup in 48 hours — we handle migration' },
                { icon: '📉', text: '67% average reduction in no-shows' },
                { icon: '📊', text: 'Real-time analytics and revenue reporting' },
                { icon: '🔒', text: 'HIPAA-ready architecture and AES-256 encryption' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15,
                  }}>{item.icon}</div>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.5, paddingTop: 6 }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Guarantee card */}
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 16, padding: '20px 22px',
            display: 'flex', alignItems: 'flex-start', gap: 14,
          }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>🛡️</span>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, marginBottom: 4 }}>
                14-Day Free Trial
              </div>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                Full platform access. No credit card required. If you don't love it after 30 days, we'll refund you — no questions asked.
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL (always visible) ── */}
        <div style={{
          flex: 1, background: '#f0f4f8',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}>

          {/* Top nav */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid #e8ecf0',
            background: '#fff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="mobile-logo-signup">
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: GRAD.primary,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              }}>🏥</div>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0f1729' }}>MediBook</span>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <a href="/" style={{ color: '#64748b', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>← Home</a>
              <a href="/pricing" style={{ color: '#64748b', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Pricing</a>
              <a href="/login" style={{ color: '#2563eb', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Sign In</a>
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
                maxWidth: 480,
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                border: '1px solid #e8ecf0',
              }}
              className="signup-card"
            >

              {/* Step indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
                {[1, 2].map((s, i) => (
                  <React.Fragment key={s}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: step >= s ? GRAD.primary : '#f0f4f8',
                        border: step >= s ? 'none' : '2px solid #e8ecf0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700,
                        color: step >= s ? '#fff' : '#9ca3af',
                        boxShadow: step >= s ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
                        transition: 'all 0.3s ease',
                      }}>
                        {s < step ? '✓' : s}
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: step === s ? 700 : 500,
                        color: step >= s ? '#2563eb' : '#9ca3af',
                        whiteSpace: 'nowrap',
                      }}>
                        {s === 1 ? 'Clinic Details' : 'Account Setup'}
                      </span>
                    </div>
                    {i < 1 && (
                      <div style={{
                        flex: 1, height: 2, margin: '0 12px',
                        marginBottom: 22,
                        background: step > s ? '#2563eb' : '#e8ecf0',
                        borderRadius: 2,
                        transition: 'background 0.4s ease',
                      }} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Card header */}
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f1729', margin: '0 0 6px' }}>
                  {step === 1 ? 'Tell Us About Your Clinic' : 'Create Your Login'}
                </h2>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                  {step === 1 ? 'We use this to customize your MediBook setup.' : "You'll use these credentials to access MediBook."}
                </p>
              </div>

              <form onSubmit={handleSubmit}>

                {step === 1 ? (
                  <>
                    {/* Step 1: Clinic info */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>🏥 Clinic Name *</label>
                      <input
                        type="text" value={form.clinicName} required
                        placeholder="e.g. Riverside Family Clinic"
                        onChange={e => update('clinicName', e.target.value)}
                        style={inputStyle}
                        onFocus={e => Object.assign(e.target.style, inputFocus)}
                        onBlur={e => Object.assign(e.target.style, inputStyle)}
                      />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>👤 Your Full Name (Admin) *</label>
                      <input
                        type="text" value={form.adminName} required
                        placeholder="e.g. Dr. Amanda Foster"
                        onChange={e => update('adminName', e.target.value)}
                        style={inputStyle}
                        onFocus={e => Object.assign(e.target.style, inputFocus)}
                        onBlur={e => Object.assign(e.target.style, inputStyle)}
                      />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>📧 Work Email *</label>
                      <input
                        type="email" value={form.email} required
                        placeholder="you@yourclinic.com"
                        onChange={e => update('email', e.target.value)}
                        style={inputStyle}
                        onFocus={e => Object.assign(e.target.style, inputFocus)}
                        onBlur={e => Object.assign(e.target.style, inputStyle)}
                      />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>📞 Phone Number</label>
                      <input
                        type="tel" value={form.phone}
                        placeholder="+1 (555) 000-0000"
                        onChange={e => update('phone', e.target.value)}
                        style={inputStyle}
                        onFocus={e => Object.assign(e.target.style, inputFocus)}
                        onBlur={e => Object.assign(e.target.style, inputStyle)}
                      />
                    </div>

                    {/* Two column grid — stacks on mobile */}
                    <div style={{ marginBottom: 24 }} className="signup-two-col">
                      <div>
                        <label style={labelStyle}>🏥 Clinic Type *</label>
                        <select
                          value={form.clinicType} required
                          onChange={e => update('clinicType', e.target.value)}
                          style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
                        >
                          <option value="">Select type...</option>
                          {clinicTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>👨‍⚕️ Number of Doctors *</label>
                        <select
                          value={form.doctors} required
                          onChange={e => update('doctors', e.target.value)}
                          style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
                        >
                          <option value="">Select range...</option>
                          {doctorRanges.map(r => <option key={r} value={r}>{r} doctors</option>)}
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      style={{
                        width: '100%', padding: '15px',
                        background: GRAD.primary, color: '#fff',
                        border: 'none', borderRadius: 14, fontWeight: 700,
                        fontSize: 15, cursor: 'pointer',
                        boxShadow: '0 4px 20px rgba(37,99,235,0.35)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                      Continue to Account Setup →
                    </button>
                  </>
                ) : (
                  <>
                    {/* Step 2: Account credentials */}
                    {/* Clinic summary badge */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'rgba(37,99,235,0.05)',
                      border: '1px solid rgba(37,99,235,0.15)',
                      borderRadius: 12, padding: '12px 14px', marginBottom: 20,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 8,
                          background: GRAD.primary,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16,
                        }}>🏥</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f1729' }}>
                            {form.clinicName || 'Your Clinic'}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            {form.clinicType || 'Clinic'} · {form.adminName || 'Admin'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>📧 Login Email *</label>
                      <input
                        type="email" value={form.email} required
                        onChange={e => update('email', e.target.value)}
                        style={inputStyle}
                        onFocus={e => Object.assign(e.target.style, inputFocus)}
                        onBlur={e => Object.assign(e.target.style, inputStyle)}
                      />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>🔒 Password *</label>
                      <input
                        type="password" value={form.password} required
                        placeholder="Min. 8 characters"
                        onChange={e => update('password', e.target.value)}
                        style={inputStyle}
                        onFocus={e => Object.assign(e.target.style, inputFocus)}
                        onBlur={e => Object.assign(e.target.style, inputStyle)}
                      />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                      <label style={labelStyle}>🔒 Confirm Password *</label>
                      <input
                        type="password" value={form.confirm} required
                        placeholder="Repeat password"
                        onChange={e => update('confirm', e.target.value)}
                        style={{
                          ...inputStyle,
                          borderColor: form.confirm && form.confirm !== form.password ? '#ef4444' : inputStyle.border as string,
                        }}
                        onFocus={e => Object.assign(e.target.style, inputFocus)}
                        onBlur={e => Object.assign(e.target.style, inputStyle)}
                      />
                      {form.confirm && form.confirm !== form.password && (
                        <p style={{ margin: '5px 0 0', fontSize: 12, color: '#ef4444', fontWeight: 600 }}>
                          ⚠️ Passwords do not match
                        </p>
                      )}
                    </div>

                    {/* Terms */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 24 }}>
                      <input
                        type="checkbox" checked={form.agreed}
                        onChange={e => update('agreed', e.target.checked)}
                        style={{ width: 17, height: 17, marginTop: 2, accentColor: '#2563eb', flexShrink: 0 }}
                      />
                      <span style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                        I agree to the{' '}
                        <a href="/terms" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Terms of Service</a>
                        {' '}and{' '}
                        <a href="/privacy" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</a>.
                        I confirm this is a legitimate healthcare clinic.
                      </span>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        style={{
                          flex: '0 0 auto', padding: '15px 20px',
                          borderRadius: 14, border: '1px solid #e8ecf0',
                          background: '#f0f4f8', color: '#64748b',
                          fontSize: 14, fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !form.agreed || form.password !== form.confirm}
                        style={{
                          flex: 1, padding: '15px',
                          background: (loading || !form.agreed || form.password !== form.confirm)
                            ? 'rgba(156,163,175,0.4)'
                            : GRAD.primary,
                          color: '#fff', border: 'none', borderRadius: 14,
                          fontWeight: 700, fontSize: 14,
                          cursor: (loading || !form.agreed) ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          transition: 'all 0.2s',
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
                            Creating Clinic...
                          </>
                        ) : '🚀 Launch My Clinic Dashboard'}
                      </button>
                    </div>
                  </>
                )}
              </form>

              {/* Footer link */}
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                  Already registered?{' '}
                  <a href="/login" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
                    Sign in to your clinic
                  </a>
                </p>
              </div>

              {/* Trust badges */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 8,
                justifyContent: 'center', marginTop: 20,
                paddingTop: 18, borderTop: '1px solid #e8ecf0',
              }}>
                {[
                  { icon: '🛡️', text: '14-day free trial' },
                  { icon: '🔒', text: 'HIPAA-Ready' },
                  { icon: '🚫', text: 'No credit card' },
                  { icon: '⚡', text: '48h setup' },
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
        .signup-two-col {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 480px) {
          .signup-two-col {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (min-width: 1024px) {
          .signup-layout {
            flex-direction: row !important;
          }
          .signup-left-panel {
            display: flex !important;
            width: 45% !important;
            min-width: 380px !important;
          }
          .mobile-logo-signup {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .signup-card {
            padding: 28px 20px !important;
            border-radius: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
