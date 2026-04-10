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
  width: '100%', padding: '12px 14px',
  borderRadius: 11, border: '2px solid #e8ecf0',
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

  const clinicTypes = ['Family Practice', 'Specialty Clinic', "Women's Health", 'Dental Practice', 'Pediatric Clinic', 'Orthopedic Center', 'Mental Health', 'Other'];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f0f4f8', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* LEFT PANEL */}
      <div className="hidden lg:flex" style={{ width: '40%', background: GRAD.hero, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', padding: '60px 52px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 52 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #2563eb, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏥</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1 }}>MediBook</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px' }}>For Clinics</div>
          </div>
        </a>

        <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 18, letterSpacing: '-0.5px' }}>
          Start Running Your<br />Clinic Smarter.
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, marginBottom: 40, maxWidth: 320 }}>
          200+ clinics use MediBook to reduce no-shows, automate scheduling, and grow patient retention.
        </p>

        {/* What you get */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
          {[
            { icon: '⚡', text: 'Setup in 48 hours — we handle migration'        },
            { icon: '📉', text: '67% average reduction in no-shows'               },
            { icon: '📊', text: 'Real-time analytics and revenue reporting'       },
            { icon: '🔒', text: 'HIPAA-ready architecture and AES-256 encryption' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{item.icon}</div>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.82)', fontWeight: 500 }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        <div style={{ padding: '18px 22px', background: 'rgba(255,255,255,0.08)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)', maxWidth: 340 }}>
          <div style={{ fontSize: 22, marginBottom: 10 }}>🛡️</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>14-Day Free Trial</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            Full platform access. No credit card required. If you don't love it after 30 days, we'll refund you — no questions asked.
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px 24px', overflowY: 'auto' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 560 }}>

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
            <a href="/login" style={{ fontSize: 13, fontWeight: 600, color: '#64748b', textDecoration: 'none' }}>Sign In</a>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
            {[1, 2].map(s => (
              <React.Fragment key={s}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: s <= step ? GRAD.primary : '#e8ecf0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s <= step ? '#fff' : '#9ca3af', fontSize: 13, fontWeight: 700 }}>
                    {s < step ? '✓' : s}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: s === step ? 700 : 400, color: s <= step ? '#2563eb' : '#9ca3af' }}>
                    {s === 1 ? 'Clinic Details' : 'Account Setup'}
                  </span>
                </div>
                {s < 2 && <div style={{ width: 40, height: 2, background: step > s ? '#2563eb' : '#e8ecf0', borderRadius: 2 }} />}
              </React.Fragment>
            ))}
          </div>

          {/* Card */}
          <div style={{ background: '#fff', borderRadius: 28, padding: '40px 40px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', border: '1px solid #e8ecf0', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: GRAD.primary, borderRadius: '28px 28px 0 0' }} />

            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f1729', marginBottom: 6, letterSpacing: '-0.5px' }}>
                {step === 1 ? 'Tell Us About Your Clinic' : 'Create Your Login'}
              </h1>
              <p style={{ fontSize: 14, color: '#64748b' }}>
                {step === 1 ? 'We use this to customize your MediBook setup.' : 'You\'ll use these credentials to access MediBook.'}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {step === 1 ? (
                <>
                  {/* Step 1: Clinic info */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>🏥 Clinic Name <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="text" placeholder="Riverside Family Clinic" required value={form.clinicName} onChange={e => update('clinicName', e.target.value)} style={inputStyle} onFocus={e => Object.assign(e.target.style, inputFocus)} onBlur={e => Object.assign(e.target.style, inputStyle)} />
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>👤 Your Full Name (Admin) <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="text" placeholder="Dr. Amanda Foster" required value={form.adminName} onChange={e => update('adminName', e.target.value)} style={inputStyle} onFocus={e => Object.assign(e.target.style, inputFocus)} onBlur={e => Object.assign(e.target.style, inputStyle)} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                    <div>
                      <label style={labelStyle}>📧 Work Email <span style={{ color: '#ef4444' }}>*</span></label>
                      <input type="email" placeholder="admin@yourclinic.com" required value={form.email} onChange={e => update('email', e.target.value)} style={inputStyle} onFocus={e => Object.assign(e.target.style, inputFocus)} onBlur={e => Object.assign(e.target.style, inputStyle)} />
                    </div>
                    <div>
                      <label style={labelStyle}>📞 Phone Number</label>
                      <input type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => update('phone', e.target.value)} style={inputStyle} onFocus={e => Object.assign(e.target.style, inputFocus)} onBlur={e => Object.assign(e.target.style, inputStyle)} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                    <div>
                      <label style={labelStyle}>🏥 Clinic Type <span style={{ color: '#ef4444' }}>*</span></label>
                      <select required value={form.clinicType} onChange={e => update('clinicType', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }} onFocus={e => Object.assign(e.target.style, inputFocus)} onBlur={e => Object.assign(e.target.style, inputStyle)}>
                        <option value="">Select type...</option>
                        {clinicTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>👨‍⚕️ Number of Doctors</label>
                      <select value={form.doctors} onChange={e => update('doctors', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="">Select range...</option>
                        <option>1–3 doctors</option>
                        <option>4–10 doctors</option>
                        <option>11–20 doctors</option>
                        <option>20+ doctors</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" style={{ width: '100%', padding: '15px', borderRadius: 14, border: 'none', fontSize: 15, fontWeight: 700, color: '#fff', background: GRAD.primary, cursor: 'pointer', boxShadow: '0 4px 20px rgba(37,99,235,0.3)', transition: 'all 0.2s' }}>
                    Continue to Account Setup →
                  </button>
                </>
              ) : (
                <>
                  {/* Step 2: Account credentials */}
                  <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.12)', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: GRAD.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏥</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f1729' }}>{form.clinicName || 'Your Clinic'}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{form.clinicType || 'Clinic'} · {form.adminName || 'Admin'}</div>
                    </div>
                    <button type="button" onClick={() => setStep(1)} style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>📧 Login Email <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="email" required value={form.email} onChange={e => update('email', e.target.value)} style={inputStyle} onFocus={e => Object.assign(e.target.style, inputFocus)} onBlur={e => Object.assign(e.target.style, inputStyle)} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
                    <div>
                      <label style={labelStyle}>🔒 Password <span style={{ color: '#ef4444' }}>*</span></label>
                      <input type="password" placeholder="Min. 8 characters" required value={form.password} onChange={e => update('password', e.target.value)} style={inputStyle} onFocus={e => Object.assign(e.target.style, inputFocus)} onBlur={e => Object.assign(e.target.style, inputStyle)} />
                    </div>
                    <div>
                      <label style={labelStyle}>🔒 Confirm <span style={{ color: '#ef4444' }}>*</span></label>
                      <input type="password" placeholder="Re-enter password" required value={form.confirm} onChange={e => update('confirm', e.target.value)} style={inputStyle} onFocus={e => Object.assign(e.target.style, inputFocus)} onBlur={e => Object.assign(e.target.style, inputStyle)} />
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 22, cursor: 'pointer' }}>
                    <input type="checkbox" required checked={form.agreed} onChange={e => update('agreed', e.target.checked)} style={{ width: 17, height: 17, marginTop: 2, accentColor: '#2563eb', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                      I agree to the <a href="#" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Terms of Service</a> and <a href="#" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</a>. I confirm this is a legitimate healthcare clinic.
                    </span>
                  </label>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" onClick={() => setStep(1)} style={{ flex: 0.4, padding: '15px', borderRadius: 14, border: '1px solid #e8ecf0', background: '#f0f4f8', color: '#64748b', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>← Back</button>
                    <button type="submit" disabled={loading} style={{ flex: 1, padding: '15px', borderRadius: 14, border: 'none', fontSize: 15, fontWeight: 700, color: '#fff', background: loading ? 'rgba(156,163,175,0.6)' : GRAD.green, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 20px rgba(5,150,105,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      {loading ? (
                        <>
                          <div style={{ width: 17, height: 17, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          Creating Clinic...
                        </>
                      ) : '🚀 Launch My Clinic Dashboard'}
                    </button>
                  </div>
                </>
              )}
            </form>

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <span style={{ fontSize: 14, color: '#64748b' }}>
                Already registered?{' '}
                <a href="/login" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Sign in to your clinic</a>
              </span>
            </div>
          </div>

          {/* Trust badges */}
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
            {[
              { icon: '🛡️', text: '14-day free trial'   },
              { icon: '🔒', text: 'HIPAA-Ready'         },
              { icon: '🚫', text: 'No credit card'      },
              { icon: '⚡', text: '48h setup'           },
            ].map(item => (
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

