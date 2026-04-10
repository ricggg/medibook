"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────
const C = {
  blueDark: '#1e3c7d',
  blue: '#2563eb',
  blueLight: '#3b82f6',
  green: '#10b981',
  greenDark: '#059669',
  purple: '#7c3aed',
  amber: '#f59e0b',
  red: '#ef4444',
  textPrimary: '#0f1729',
  textMuted: '#64748b',
  textLight: '#9ca3af',
  border: '#e8ecf0',
  card: '#ffffff',
  page: '#f0f4f8',
};
const GRAD = {
  primary: 'linear-gradient(135deg, #1e3c7d, #2563eb)',
  hero: 'linear-gradient(135deg, #0f2347 0%, #1e3c7d 45%, #2563eb 100%)',
  green: 'linear-gradient(135deg, #059669, #10b981)',
  purple: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
  amber: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
  topBar: 'linear-gradient(90deg, #1e3c7d, #2563eb, #818cf8)',
};

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
const DEMO_CLINICS = [
  { name: 'Riverside Family Clinic', type: 'Family Practice', beds: '12 doctors' },
  { name: 'Summit Orthopedic Center', type: 'Specialty Clinic', beds: '8 specialists' },
  { name: "BluePeak Women's Health", type: "Women's Health", beds: '6 doctors' },
  { name: 'Clearwater Dental Group', type: 'Dental Practice', beds: '14 dentists' },
  { name: 'Horizon Pediatric Care', type: 'Pediatric Clinic', beds: '9 pediatricians' },
];
const PAIN_POINTS = [
  { problem: 'Receptionists overwhelmed with booking calls', solution: 'Patients self-book 24/7 online — zero phone time needed', icon: '📞', after: '📅' },
  { problem: 'No-shows cost your clinic $150–$300 each', solution: 'Automated SMS + email reminders cut no-shows by 67%', icon: '❌', after: '✅' },
  { problem: 'Paper records, lost files, wasted admin hours', solution: 'Digital patient records, prescriptions, and history — instantly searchable', icon: '📄', after: '💻' },
  { problem: 'No visibility into clinic performance or revenue', solution: 'Real-time analytics: utilization, revenue, patient retention', icon: '❓', after: '📊' },
];
const FEATURES = [
  { icon: '📅', gradient: GRAD.primary, shadow: '0 8px 32px rgba(37,99,235,0.35)', glowColor: 'rgba(37,99,235,0.12)', accentColor: '#2563eb', title: 'Smart Appointment Scheduling', desc: 'Drag-and-drop calendar for staff. Online booking portal for patients. Automatic conflict detection. Works 24/7.', badge: 'Most Used' },
  { icon: '👥', gradient: GRAD.green, shadow: '0 8px 32px rgba(5,150,105,0.35)', glowColor: 'rgba(5,150,105,0.12)', accentColor: '#10b981', title: 'Patient Management Portal', desc: 'Full patient profiles with medical history, prescriptions, lab results, and visit notes — all in one searchable database.', badge: null },
  { icon: '📊', gradient: GRAD.purple, shadow: '0 8px 32px rgba(124,58,237,0.35)', glowColor: 'rgba(124,58,237,0.12)', accentColor: '#7c3aed', title: 'Clinic Analytics Dashboard', desc: 'Track revenue, appointment utilization, no-show rates, and patient retention. Export reports in one click.', badge: 'New' },
  { icon: '🔔', gradient: GRAD.amber, shadow: '0 8px 32px rgba(245,158,11,0.35)', glowColor: 'rgba(245,158,11,0.12)', accentColor: '#f59e0b', title: 'Automated Reminders', desc: 'SMS and email reminders sent automatically at 48h, 24h, and 2h intervals. Patients can confirm or reschedule instantly.', badge: null },
  { icon: '💊', gradient: GRAD.green, shadow: '0 8px 32px rgba(5,150,105,0.35)', glowColor: 'rgba(5,150,105,0.12)', accentColor: '#10b981', title: 'Digital Prescriptions', desc: 'Doctors issue digital prescriptions in seconds. Sent directly to the patient and any connected pharmacy.', badge: null },
  { icon: '🔒', gradient: GRAD.primary, shadow: '0 8px 32px rgba(37,99,235,0.35)', glowColor: 'rgba(37,99,235,0.12)', accentColor: '#2563eb', title: 'Security & Compliance Ready', desc: 'Built with HIPAA-ready architecture. Role-based access control, audit logs, and encrypted data storage.', badge: null },
];
const PRICING = [
  { name: 'Starter', price: '$99', period: '/month', desc: 'Perfect for solo practitioners and small clinics', gradient: 'linear-gradient(135deg, #64748b, #94a3b8)', features: ['Up to 3 doctors', 'Online patient booking portal', 'Appointment calendar', 'SMS + email reminders', 'Basic patient records', 'Email support'], missing: ['Analytics dashboard', 'Multi-location', 'API access'], cta: 'Start 14-Day Free Trial', popular: false },
  { name: 'Clinic', price: '$249', period: '/month', desc: 'For growing clinics that need full control', gradient: GRAD.primary, features: ['Up to 15 doctors', 'Everything in Starter', 'Full analytics dashboard', 'Digital prescriptions', 'Staff role management', 'Priority support (< 4h)', 'Custom booking page branding'], missing: ['Multi-location', 'API access'], cta: 'Start 14-Day Free Trial', popular: true },
  { name: 'Enterprise', price: 'Custom', period: 'pricing', desc: 'For multi-location clinics and health networks', gradient: GRAD.purple, features: ['Unlimited doctors & staff', 'Multi-location management', 'API + EHR integration', 'Dedicated account manager', 'Custom SLA agreement', 'White-label option', 'Onboarding & training included'], missing: [], cta: 'Request a Demo', popular: false },
];
const TESTIMONIALS = [
  { name: 'Dr. Amanda Foster', role: 'Practice Owner', clinic: 'Riverside Family Clinic', rating: 5, text: 'We cut no-shows by 61% in the first month. Our receptionist now handles patient care instead of answering booking calls all day. MediBook paid for itself in week 2.', initials: 'AF', gradient: GRAD.primary, result: '61% fewer no-shows' },
  { name: 'James Okafor', role: 'Clinic Manager', clinic: 'Summit Orthopedic Center', rating: 5, text: 'The analytics dashboard alone is worth the subscription. I can see exactly which time slots underperform and which doctors have the highest retention.', initials: 'JO', gradient: GRAD.green, result: '40% revenue visibility increase' },
  { name: 'Dr. Sarah Nguyen', role: 'Medical Director', clinic: "BluePeak Women's Health", rating: 5, text: 'Setup took 2 days. Our patients love the online booking — 78% of new appointments now come through the portal. Our ratings went from 3.8 to 4.7.', initials: 'SN', gradient: GRAD.purple, result: 'Rating: 3.8 → 4.7 stars' },
  { name: 'Marcus Chen', role: 'Operations Director', clinic: 'Clearwater Dental Group', rating: 5, text: "We run 14 dentists across 3 locations. Before MediBook we had 3 separate systems that never talked to each other. Now it's one platform, one source of truth.", initials: 'MC', gradient: GRAD.amber, result: '3 locations, 1 platform' },
];
const FAQS = [
  { q: 'How long does setup take?', a: 'Most clinics are fully onboarded within 2–3 business days. We migrate your existing patient data, configure your booking portal, and train your staff. Your dedicated setup specialist handles everything.' },
  { q: 'Can patients book online without creating an account?', a: 'Yes. Patients can book as guests using just their name, phone, and email. For returning patients, a lightweight account stores their history and preferences automatically.' },
  { q: 'Does MediBook integrate with our existing EHR system?', a: 'Enterprise plans include full API + EHR integration (HL7 FHIR compatible). For Starter and Clinic plans, we support CSV import/export and offer integration guides for major EHR platforms.' },
  { q: 'What happens when we exceed our doctor limit?', a: "You'll receive a 30-day notice before being charged for the next tier. You can add individual doctor seats for $25/doctor/month, or upgrade plans at any time — no lock-in." },
  { q: 'Is patient data secure?', a: 'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Our architecture is designed with HIPAA principles in mind, including role-based access, audit logs, and zero third-party data sharing.' },
  { q: 'Can we cancel anytime?', a: 'Yes. Monthly plans cancel anytime, no questions asked. Annual plans include a 30-day money-back guarantee. We also offer a free 14-day trial with full access — no credit card required.' },
];

// ─────────────────────────────────────────────
// TALK TO SALES MODAL
// ─────────────────────────────────────────────
function TalkToSalesModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  type Step = 'form' | 'loading' | 'success';
  const [step, setStep] = useState<Step>('form');
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', clinicName: '',
    clinicSize: '', role: '', message: '', contactMethod: 'email',
  });

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setForm({ firstName: '', lastName: '', email: '', phone: '', clinicName: '', clinicSize: '', role: '', message: '', contactMethod: 'email' });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && step !== 'loading') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, step]);

  const f = (key: string) => (v: string) => setForm(prev => ({ ...prev, [key]: v }));
  const valid = !!(form.firstName && form.lastName && form.email && form.clinicName);

  const handleSubmit = () => {
    if (!valid) return;
    setStep('loading');
    setTimeout(() => setStep('success'), 1600);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 13px', borderRadius: 10,
    border: '2px solid #e8ecf0', fontSize: 14, color: C.textPrimary,
    background: '#f8fafc', outline: 'none', boxSizing: 'border-box',
    fontFamily: "'Segoe UI', system-ui, sans-serif", transition: 'all 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 700, color: C.textMuted,
    textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 5,
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99990, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => step !== 'loading' && onClose()}
        style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,40,0.65)', backdropFilter: 'blur(6px)' }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 30 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        style={{
          position: 'relative', zIndex: 1, width: '100%', maxWidth: 620,
          background: '#fff', borderRadius: 24, boxShadow: '0 40px 100px rgba(0,0,0,0.3)',
          overflow: 'hidden', maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        {step === 'form' && (
          <div style={{ padding: '18px 24px', background: GRAD.primary, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>📞 Talk to Sales</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>We'll get back to you within 1 business hour</div>
            </div>
            <button onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.5)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            >✕</button>
          </div>
        )}

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: step === 'form' ? '24px' : '0' }}>
          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Contact options banner */}
                <div style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(16,185,129,0.06))', borderRadius: 14, padding: '16px', marginBottom: 20, border: '1px solid rgba(37,99,235,0.12)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '1px' }}>Or reach us directly</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    <a href="mailto:hello@medibook.com" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, background: '#fff', border: '1px solid #e8ecf0', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = C.blue; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e8ecf0'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'; }}
                    >
                      <span style={{ fontSize: 16 }}>📧</span>
                      <div>
                        <div style={{ fontSize: 11, color: C.textLight, fontWeight: 600 }}>Email Sales</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.blue }}>hello@medibook.com</div>
                      </div>
                    </a>
                    <a href="tel:+18006334265" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, background: '#fff', border: '1px solid #e8ecf0', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = C.green; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e8ecf0'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'; }}
                    >
                      <span style={{ fontSize: 16 }}>📞</span>
                      <div>
                        <div style={{ fontSize: 11, color: C.textLight, fontWeight: 600 }}>Call Sales</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.green }}>+1 (800) 633-4265</div>
                      </div>
                    </a>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, background: '#fff', border: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                      <span style={{ fontSize: 16 }}>💬</span>
                      <div>
                        <div style={{ fontSize: 11, color: C.textLight, fontWeight: 600 }}>Live Chat</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>Available 24/7</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 13, fontWeight: 700, color: C.textMuted, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 1, background: '#e8ecf0' }} />
                  <span>Or fill out the form below</span>
                  <div style={{ flex: 1, height: 1, background: '#e8ecf0' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                  {/* First Name */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>👤 First Name <span style={{ color: C.red }}>*</span></label>
                    <input value={form.firstName} onChange={e => f('firstName')(e.target.value)} placeholder="e.g. Amanda" style={inputStyle}
                      onFocus={e => { e.target.style.border = `2px solid ${C.blue}`; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                      onBlur={e => { e.target.style.border = '2px solid #e8ecf0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  {/* Last Name */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>👤 Last Name <span style={{ color: C.red }}>*</span></label>
                    <input value={form.lastName} onChange={e => f('lastName')(e.target.value)} placeholder="e.g. Foster" style={inputStyle}
                      onFocus={e => { e.target.style.border = `2px solid ${C.blue}`; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                      onBlur={e => { e.target.style.border = '2px solid #e8ecf0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  {/* Email */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>📧 Work Email <span style={{ color: C.red }}>*</span></label>
                    <input type="email" value={form.email} onChange={e => f('email')(e.target.value)} placeholder="you@clinic.com" style={inputStyle}
                      onFocus={e => { e.target.style.border = `2px solid ${C.blue}`; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                      onBlur={e => { e.target.style.border = '2px solid #e8ecf0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  {/* Phone */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>📞 Phone Number</label>
                    <input type="tel" value={form.phone} onChange={e => f('phone')(e.target.value)} placeholder="+1 (555) 000-0000" style={inputStyle}
                      onFocus={e => { e.target.style.border = `2px solid ${C.blue}`; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                      onBlur={e => { e.target.style.border = '2px solid #e8ecf0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  {/* Clinic Name */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>🏥 Clinic Name <span style={{ color: C.red }}>*</span></label>
                    <input value={form.clinicName} onChange={e => f('clinicName')(e.target.value)} placeholder="e.g. Riverside Family Clinic" style={inputStyle}
                      onFocus={e => { e.target.style.border = `2px solid ${C.blue}`; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                      onBlur={e => { e.target.style.border = '2px solid #e8ecf0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  {/* Clinic Size */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>👥 Clinic Size</label>
                    <select value={form.clinicSize} onChange={e => f('clinicSize')(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}
                      onFocus={e => { e.target.style.border = `2px solid ${C.blue}`; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                      onBlur={e => { e.target.style.border = '2px solid #e8ecf0'; e.target.style.boxShadow = 'none'; }}
                    >
                      <option value="">Select size</option>
                      <option value="1-3 doctors">1–3 doctors (Starter)</option>
                      <option value="4-15 doctors">4–15 doctors (Clinic)</option>
                      <option value="16+ doctors">16+ doctors (Enterprise)</option>
                      <option value="Multi-location">Multi-location network</option>
                    </select>
                  </div>
                  {/* Role */}
                  <div style={{ marginBottom: 14, gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>💼 Your Role</label>
                    <select value={form.role} onChange={e => f('role')(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}
                      onFocus={e => { e.target.style.border = `2px solid ${C.blue}`; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                      onBlur={e => { e.target.style.border = '2px solid #e8ecf0'; e.target.style.boxShadow = 'none'; }}
                    >
                      <option value="">Select your role</option>
                      <option value="Practice Owner / Physician">Practice Owner / Physician</option>
                      <option value="Clinic Manager">Clinic Manager</option>
                      <option value="Operations Director">Operations Director</option>
                      <option value="IT / Technology Lead">IT / Technology Lead</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {/* Message */}
                  <div style={{ marginBottom: 14, gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>📝 What can we help you with?</label>
                    <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      placeholder="Tell us about your clinic's current challenges or what you're looking for in a clinic management solution..."
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical' }}
                      onFocus={e => { e.target.style.border = `2px solid ${C.blue}`; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                      onBlur={e => { e.target.style.border = '2px solid #e8ecf0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>

                {!valid && (
                  <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', fontSize: 13, color: '#d97706', fontWeight: 600 }}>
                    ⚠️ Please fill in First Name, Last Name, Email, and Clinic Name
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #e8ecf0', background: '#f0f4f8', color: C.textMuted, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={handleSubmit} disabled={!valid}
                    style={{ flex: 2, padding: '12px 24px', borderRadius: 12, border: 'none', background: valid ? GRAD.primary : '#e8ecf0', color: valid ? '#fff' : C.textLight, fontSize: 14, fontWeight: 800, cursor: valid ? 'pointer' : 'not-allowed', boxShadow: valid ? '0 4px 16px rgba(37,99,235,0.3)' : 'none', transition: 'all 0.2s' }}
                    onMouseEnter={e => { if (valid) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    📞 Contact Sales Team
                  </button>
                </div>

                <p style={{ fontSize: 11, color: C.textLight, textAlign: 'center', marginTop: 12 }}>
                  🔒 Your information is secure and will never be shared with third parties.
                </p>
              </motion.div>
            )}

            {step === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 32px', gap: 20 }}>
                  <div style={{ position: 'relative', width: 72, height: 72 }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ width: 72, height: 72, borderRadius: '50%', border: '4px solid #e8ecf0', borderTop: `4px solid ${C.blue}`, borderRight: `4px solid ${C.blue}`, position: 'absolute' }}
                    />
                    <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(16,185,129,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏥</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>Sending your message...</div>
                    <div style={{ fontSize: 13, color: C.textMuted }}>Connecting you with our sales team</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                        style={{ width: 8, height: 8, borderRadius: '50%', background: C.blue }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 20, stiffness: 260 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 32px', textAlign: 'center' }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 14, stiffness: 200, delay: 0.1 }}
                    style={{ width: 88, height: 88, borderRadius: '50%', background: GRAD.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 24, boxShadow: '0 12px 40px rgba(16,185,129,0.4)' }}
                  >✓</motion.div>

                  {/* Confetti */}
                  <div style={{ position: 'relative', marginBottom: -20 }}>
                    {[...Array(8)].map((_, i) => (
                      <motion.div key={i}
                        initial={{ opacity: 1, y: 0, x: 0 }}
                        animate={{ opacity: 0, y: -60 - Math.random() * 40, x: (i % 2 === 0 ? 1 : -1) * (20 + Math.random() * 60) }}
                        transition={{ duration: 1.2, delay: 0.2 + i * 0.06, ease: 'easeOut' }}
                        style={{ position: 'absolute', width: 10, height: 10, borderRadius: '50%', background: [C.blue, C.green, C.amber, C.purple, C.red][i % 5], top: -44, left: '50%' }}
                      />
                    ))}
                  </div>

                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: C.textPrimary, marginBottom: 8 }}>Message Sent! 🎉</div>
                    <div style={{ fontSize: 15, color: C.textMuted, marginBottom: 28, lineHeight: 1.7 }}>
                      Our sales team will reach out within <strong style={{ color: C.textPrimary }}>1 business hour</strong>.<br />
                      In the meantime, feel free to explore MediBook.
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    style={{ width: '100%', background: '#f8fafc', borderRadius: 16, padding: '20px', border: '1px solid #e8ecf0', marginBottom: 28, textAlign: 'left' }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>What happens next</div>
                    {[
                      { icon: '📧', step: '1', text: 'Confirmation email sent to your inbox', color: C.blue },
                      { icon: '📞', step: '2', text: 'Sales specialist calls within 1 business hour', color: C.green },
                      { icon: '🎯', step: '3', text: 'Personalized demo scheduled for your clinic', color: C.purple },
                      { icon: '🚀', step: '4', text: 'Onboarding begins — we handle everything', color: C.amber },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < 3 ? '1px solid #e8ecf0' : 'none' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: `${item.color}18`, border: `1px solid ${item.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{item.icon}</div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: item.color, marginRight: 6 }}>Step {item.step}</span>
                          <span style={{ fontSize: 13, color: C.textPrimary }}>{item.text}</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    style={{ width: '100%', display: 'flex', gap: 12 }}
                  >
                    <div style={{ flex: 1, padding: '12px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e8ecf0', textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: C.textLight, fontWeight: 600, marginBottom: 4 }}>NEED IMMEDIATE HELP?</div>
                      <a href="tel:+18006334265" style={{ fontSize: 13, fontWeight: 700, color: C.blue, textDecoration: 'none' }}>📞 +1 (800) 633-4265</a>
                    </div>
                    <div style={{ flex: 1, padding: '12px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e8ecf0', textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: C.textLight, fontWeight: 600, marginBottom: 4 }}>LIVE CHAT</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>Available 24/7</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                    onClick={onClose}
                    style={{ marginTop: 20, width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: GRAD.primary, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(37,99,235,0.3)' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    ✓ Done — Back to MediBook
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ANIMATED COUNTER
// ─────────────────────────────────────────────
function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let current = 0;
    const step = Math.ceil(target / 80);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(current);
    }, 20);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  const links = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
  ];
  return (
    <>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent', backdropFilter: scrolled ? 'blur(24px)' : 'none', borderBottom: scrolled ? '1px solid #e8ecf0' : 'none', boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.35s ease' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: GRAD.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>🏥</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.5px', background: GRAD.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>MediBook</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '1.5px', lineHeight: 1 }}>For Clinics</div>
          </div>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="hidden md:flex">
          {links.map(l => (
            <a key={l.label} href={l.href} style={{ fontSize: 14, fontWeight: 600, color: C.textMuted, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = C.blue)}
              onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)}
            >{l.label}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12 }} className="hidden md:flex">
          <a href="/login" style={{ padding: '9px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700, color: C.blue, border: `2px solid ${C.blue}`, textDecoration: 'none', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = C.blue; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.blue; }}
          >Sign In</a>
          <a href="/signup" style={{ padding: '9px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700, color: '#fff', background: GRAD.primary, textDecoration: 'none', boxShadow: '0 4px 16px rgba(37,99,235,0.35)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(37,99,235,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.35)'; }}
          >Request a Demo</a>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden" style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: C.textPrimary }}>
          {mobileOpen ? '✕' : '☰'}
        </button>
      </nav>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ position: 'fixed', top: 68, left: 0, right: 0, zIndex: 999, background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(24px)', borderBottom: '1px solid #e8ecf0', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
          >
            {links.map(l => (
              <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)} style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid #f0f4f8' }}>{l.label}</a>
            ))}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <a href="/login" style={{ flex: 1, padding: '13px', borderRadius: 12, fontSize: 15, fontWeight: 700, color: C.blue, border: `2px solid ${C.blue}`, textDecoration: 'none', textAlign: 'center' }}>Sign In</a>
              <a href="/signup" style={{ flex: 1, padding: '13px', borderRadius: 12, fontSize: 15, fontWeight: 700, color: '#fff', background: GRAD.primary, textDecoration: 'none', textAlign: 'center' }}>Request Demo</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────
function Hero({ onTalkToSales }: { onTalkToSales: () => void }) {
  return (
    <section style={{ minHeight: '100vh', background: GRAD.hero, display: 'flex', alignItems: 'center', padding: '120px 40px 80px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '10%', right: '5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '5%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64, alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -32 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 50, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', marginBottom: 24 }}
            >
              <span style={{ fontSize: 16 }}>🏥</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.3px' }}>Clinic Management SaaS</span>
            </motion.div>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, color: '#ffffff', lineHeight: 1.06, marginBottom: 24, letterSpacing: '-2px' }}>
              Run Your Clinic<br />
              <span style={{ background: 'linear-gradient(90deg, #60a5fa, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Smarter. Not Harder.</span>
            </h1>
            <p style={{ fontSize: 18, fontWeight: 400, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, marginBottom: 40, maxWidth: 500 }}>
              MediBook gives your clinic an online booking portal, automated scheduling, patient records management, and performance analytics — all in one platform. Setup takes 48 hours.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
              {['67% reduction in no-shows with automated reminders', 'Patients self-book 24/7 — no receptionist needed', 'Full clinic analytics: revenue, utilization, retention'].map((point, i) => (
                <motion.div key={point} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: 'rgba(16,185,129,0.25)', border: '1px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#34d399', fontWeight: 900, marginTop: 2 }}>✓</div>
                  <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{point}</span>
                </motion.div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 40 }}>
              <motion.a href="/signup" whileHover={{ y: -3, boxShadow: '0 16px 48px rgba(255,255,255,0.2)' }} whileTap={{ scale: 0.97 }}
                style={{ padding: '18px 36px', borderRadius: 14, fontSize: 16, fontWeight: 800, color: C.blueDark, background: '#ffffff', textDecoration: 'none', boxShadow: '0 6px 24px rgba(0,0,0,0.2)', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s ease' }}
              >🚀 Request a Free Demo</motion.a>
              <motion.a href="#features" whileHover={{ y: -2 }}
                style={{ padding: '18px 36px', borderRadius: 14, fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s ease', backdropFilter: 'blur(10px)' }}
              >See All Features →</motion.a>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
              {[{ icon: '🏥', label: '200+ clinics', sub: 'actively using MediBook' }, { icon: '⭐', label: '4.9/5 rating', sub: 'from clinic managers' }, { icon: '⚡', label: '48h setup', sub: 'we handle everything' }].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Dashboard preview */}
          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }} style={{ position: 'relative' }}>
            <div style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.35)' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', gap: 5 }}>{['#ef4444', '#f59e0b', '#22c55e'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}</div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 5, padding: '4px 12px', fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>app.medibook.com/admin</div>
                <div style={{ padding: '3px 10px', borderRadius: 50, fontSize: 10, fontWeight: 700, background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>● LIVE</div>
              </div>
              <div style={{ padding: '20px', background: '#f0f4f8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.textPrimary }}>Clinic Admin Dashboard</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>Riverside Family Clinic • Monday, May 19</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ padding: '5px 10px', borderRadius: 8, background: GRAD.primary, color: '#fff', fontSize: 11, fontWeight: 700 }}>+ Add Doctor</div>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: '#fff', border: '1px solid #e8ecf0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🔔</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
                  {[{ label: "Today's Appts", value: '24', icon: '📅', grad: GRAD.primary, change: '+3' }, { label: 'Active Patients', value: '1,284', icon: '👥', grad: GRAD.green, change: '+12' }, { label: 'No-show Rate', value: '4.2%', icon: '📉', grad: 'linear-gradient(135deg,#f59e0b,#fbbf24)', change: '-61%' }, { label: "Today's Revenue", value: '$3,840', icon: '💰', grad: GRAD.purple, change: '+8%' }].map(s => (
                    <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '12px', border: '1px solid #e8ecf0', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.grad, borderRadius: '12px 12px 0 0' }} />
                      <div style={{ fontSize: 9, color: C.textLight, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: C.textPrimary }}>{s.value}</div>
                      <div style={{ fontSize: 9, color: '#059669', fontWeight: 700, marginTop: 2 }}>{s.change} vs yesterday</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ background: '#fff', borderRadius: 12, padding: '12px', border: '1px solid #e8ecf0' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: C.textPrimary, marginBottom: 8 }}>Today's Schedule</div>
                    {[{ time: '09:00', doc: 'Dr. Mitchell', patient: 'J. Doe', status: 'done' }, { time: '10:30', doc: 'Dr. Rodriguez', patient: 'M. Chen', status: 'active' }, { time: '11:15', doc: 'Dr. Patel', patient: 'S. Kim', status: 'next' }, { time: '02:00', doc: 'Dr. Thompson', patient: 'R. Singh', status: 'upcoming' }].map((row, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, marginBottom: 4, background: row.status === 'active' ? 'rgba(16,185,129,0.08)' : 'transparent', border: row.status === 'active' ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent' }}>
                        <span style={{ fontSize: 9, color: C.textMuted, minWidth: 36, fontFamily: 'monospace' }}>{row.time}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: C.textPrimary, flex: 1 }}>{row.patient}</span>
                        <span style={{ fontSize: 9, color: C.textMuted }}>{row.doc.split(' ')[1]}</span>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: row.status === 'active' ? '#10b981' : row.status === 'done' ? '#22c55e' : row.status === 'next' ? '#f59e0b' : '#94a3b8' }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#fff', borderRadius: 12, padding: '12px', border: '1px solid #e8ecf0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: C.textPrimary }}>Weekly Revenue</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#059669' }}>↑ 12%</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
                      {[40, 65, 55, 80, 70, 90, 75].map((h, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                          <div style={{ width: '100%', height: `${h}%`, background: i === 5 ? GRAD.primary : 'rgba(37,99,235,0.15)', borderRadius: 4 }} />
                          <span style={{ fontSize: 8, color: C.textLight }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 8, padding: '6px', background: '#f8fafc', borderRadius: 6, textAlign: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 900, color: C.blueDark }}>$24,320</span>
                      <span style={{ fontSize: 10, color: C.textMuted }}> this week</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              style={{ position: 'absolute', top: -20, left: -24, background: '#fff', borderRadius: 16, padding: '14px 18px', boxShadow: '0 12px 32px rgba(0,0,0,0.15)', border: '1px solid #e8ecf0' }}
            >
              <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 4 }}>New booking received</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.textPrimary }}>Sarah M. → Dr. Chen</div>
              <div style={{ fontSize: 11, color: '#059669', fontWeight: 600, marginTop: 2 }}>Today at 3:30 PM · Auto-confirmed ✓</div>
            </motion.div>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}
              style={{ position: 'absolute', bottom: -16, right: -24, background: GRAD.green, borderRadius: 16, padding: '14px 18px', boxShadow: '0 12px 32px rgba(5,150,105,0.35)', color: '#fff' }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>This month</div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>67% fewer</div>
              <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85 }}>no-shows vs before</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// SOCIAL PROOF BAR
// ─────────────────────────────────────────────
function ProofBar() {
  return (
    <section style={{ padding: '56px 40px', background: '#fff', borderBottom: '1px solid #e8ecf0' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 28 }}>Trusted by independent clinics and group practices</p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 32 }}>
            {DEMO_CLINICS.map(clinic => (
              <div key={clinic.name} style={{ padding: '10px 20px', borderRadius: 12, background: C.page, border: '1px solid #e8ecf0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>{clinic.name}</div>
                <div style={{ fontSize: 11, color: C.textLight }}>{clinic.type} · {clinic.beds}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: C.textLight, marginTop: 16, fontStyle: 'italic' }}>* Demo clinic names for illustration purposes</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, padding: '32px 40px', background: C.page, borderRadius: 24, border: '1px solid #e8ecf0' }}>
          {[{ target: 200, suffix: '+', label: 'Clinics Using MediBook', icon: '🏥' }, { target: 50000, suffix: '+', label: 'Appointments Managed', icon: '📅' }, { target: 67, suffix: '%', label: 'Avg. No-show Reduction', icon: '📉' }, { target: 48, suffix: 'h', label: 'Average Setup Time', icon: '⚡' }].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{stat.icon}</div>
              <div style={{ fontSize: 38, fontWeight: 900, color: C.blueDark, lineHeight: 1, marginBottom: 6, letterSpacing: '-1px' }}>
                <AnimatedNumber target={stat.target} suffix={stat.suffix} />
              </div>
              <div style={{ fontSize: 13, color: C.textMuted, fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// PAIN → SOLUTION
// ─────────────────────────────────────────────
function PainSolution() {
  return (
    <section id="how-it-works" style={{ padding: '100px 40px', background: C.page }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'inline-block', padding: '6px 18px', borderRadius: 50, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 20 }}>Sound Familiar?</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: C.textPrimary, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 16 }}>The Problems MediBook Solves</h2>
          <p style={{ fontSize: 18, color: C.textMuted, maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>Every clinic we talk to faces the same operational headaches. Here's exactly how we fix them.</p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 20 }}>
          {PAIN_POINTS.map((item, i) => (
            <motion.div key={item.problem} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #e8ecf0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
            >
              <div style={{ padding: '20px 24px', background: 'rgba(239,68,68,0.04)', borderBottom: '1px solid rgba(239,68,68,0.1)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>The Problem</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, lineHeight: 1.4 }}>{item.problem}</div>
                </div>
              </div>
              <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{item.after}</div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>MediBook Fix</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, lineHeight: 1.4 }}>{item.solution}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// FEATURES SECTION
// ─────────────────────────────────────────────
function FeaturesSection() {
  return (
    <section id="features" style={{ padding: '100px 40px', background: '#fff' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'inline-block', padding: '6px 18px', borderRadius: 50, background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', color: C.blue, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 20 }}>Platform Features</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: C.textPrimary, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 16 }}>
            Everything Your Clinic Needs.<br />Nothing You Don't.
          </h2>
          <p style={{ fontSize: 18, color: C.textMuted, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>One platform replaces your booking software, reminder system, patient records, and analytics tools.</p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              style={{ background: '#fff', borderRadius: 20, padding: '28px', border: '1px solid #e8ecf0', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'default' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-6px)'; el.style.boxShadow = `0 20px 60px ${f.glowColor}, 0 8px 24px rgba(0,0,0,0.06)`; el.style.borderColor = f.accentColor + '40'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; el.style.borderColor = '#e8ecf0'; }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: f.gradient, borderRadius: '20px 20px 0 0' }} />
              <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, borderRadius: '0 20px 0 100%', background: f.glowColor, pointerEvents: 'none' }} />
              {f.badge && (
                <div style={{ position: 'absolute', top: 16, right: 16, padding: '3px 10px', borderRadius: 50, background: f.gradient, color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{f.badge}</div>
              )}
              <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, flexShrink: 0, background: f.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: f.shadow, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', borderRadius: '16px 16px 0 0', background: 'rgba(255,255,255,0.18)' }} />
                  <span style={{ position: 'relative', zIndex: 1 }}>{f.icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: C.textPrimary, marginBottom: 8, letterSpacing: '-0.2px', lineHeight: 1.3 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// PLATFORM PREVIEW
// ─────────────────────────────────────────────
function PlatformPreview() {
  const [activeTab, setActiveTab] = useState<'admin' | 'patient' | 'doctor'>('admin');
  const tabs = [
    { id: 'admin', label: '🖥️ Admin View', desc: 'Clinic manager' },
    { id: 'doctor', label: '👨‍⚕️ Doctor View', desc: 'Medical staff' },
    { id: 'patient', label: '📱 Patient View', desc: 'Booking portal' },
  ] as const;

  return (
    <section style={{ padding: '100px 40px', background: GRAD.hero, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-block', padding: '6px 18px', borderRadius: 50, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 20 }}>Live Platform Preview</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 16 }}>Three Dashboards. One Platform.</h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', maxWidth: 520, margin: '0 auto' }}>Your admin team, doctors, and patients each get a purpose-built interface — all connected in real time.</p>
        </motion.div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 40, flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: '12px 24px', borderRadius: 14, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.25s ease', background: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.1)', color: activeTab === tab.id ? C.blueDark : 'rgba(255,255,255,0.7)', boxShadow: activeTab === tab.id ? '0 4px 20px rgba(0,0,0,0.2)' : 'none' }}
            >
              {tab.label}
              <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.65, marginTop: 2 }}>{tab.desc}</div>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            {activeTab === 'admin' && <AdminPreview />}
            {activeTab === 'doctor' && <DoctorPreview />}
            {activeTab === 'patient' && <PatientBookingPreview />}
          </motion.div>
        </AnimatePresence>
        <div style={{ textAlign: 'center', marginTop: 44 }}>
          <a href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 36px', borderRadius: 14, fontSize: 16, fontWeight: 800, color: C.blueDark, background: '#fff', textDecoration: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', transition: 'all 0.2s' }}>
            🚀 Try It Free — No Credit Card Needed
          </a>
          <p style={{ marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Full platform access · 14-day trial · We handle setup</p>
        </div>
      </div>
    </section>
  );
}

function AdminPreview() {
  return (
    <div style={{ background: '#f0f4f8', borderRadius: 24, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ background: '#1e2333', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', gap: 5 }}>{['#ef4444', '#f59e0b', '#22c55e'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}</div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 5, padding: '4px 12px', fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>app.medibook.com/admin/dashboard</div>
      </div>
      <div style={{ display: 'flex', height: 460 }}>
        <div style={{ width: 180, background: 'linear-gradient(180deg, #0f2347, #1e3c7d)', padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', marginBottom: 16, paddingLeft: 8 }}>🏥 MediBook</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6, paddingLeft: 8 }}>Admin Panel</div>
          {[{ icon: '📊', label: 'Overview', active: true }, { icon: '📅', label: 'Appointments', active: false }, { icon: '👥', label: 'Patients', active: false }, { icon: '👨‍⚕️', label: 'Doctors', active: false }, { icon: '💰', label: 'Billing', active: false }, { icon: '📈', label: 'Analytics', active: false }, { icon: '⚙️', label: 'Settings', active: false }].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 8, background: item.active ? 'rgba(255,255,255,0.15)' : 'transparent', borderLeft: item.active ? '3px solid #ffd700' : '3px solid transparent' }}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              <span style={{ fontSize: 12, fontWeight: item.active ? 700 : 500, color: item.active ? '#fff' : 'rgba(255,255,255,0.6)' }}>{item.label}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.textPrimary }}>Clinic Overview</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>Riverside Family Clinic · Monday, May 19, 2025</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ padding: '6px 12px', borderRadius: 8, background: GRAD.primary, color: '#fff', fontSize: 11, fontWeight: 700 }}>+ New Appointment</div>
              <div style={{ padding: '6px 12px', borderRadius: 8, background: '#f0f4f8', border: '1px solid #e8ecf0', color: C.textMuted, fontSize: 11, fontWeight: 700 }}>Export Report</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
            {[{ label: "Today's Appts", value: '24', sub: '+3 vs yesterday', icon: '📅', grad: GRAD.primary }, { label: 'Active Patients', value: '1,284', sub: '+12 this week', icon: '👥', grad: GRAD.green }, { label: 'No-show Rate', value: '4.2%', sub: 'Down 61% ↓', icon: '📉', grad: GRAD.amber }, { label: "Today's Revenue", value: '$3,840', sub: '+8% vs avg', icon: '💰', grad: GRAD.purple }].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '14px', border: '1px solid #e8ecf0', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.grad, borderRadius: '14px 14px 0 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 9, color: C.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: C.textPrimary, letterSpacing: '-0.5px' }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: '#059669', fontWeight: 700, marginTop: 4 }}>{s.sub}</div>
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: s.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, boxShadow: '0 3px 10px rgba(0,0,0,0.15)' }}>{s.icon}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: '16px', border: '1px solid #e8ecf0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.textPrimary }}>Today's Appointments</div>
                <div style={{ fontSize: 10, color: C.blue, fontWeight: 700 }}>View All →</div>
              </div>
              {[{ time: '09:00', patient: 'James Doe', doctor: 'Dr. Mitchell', type: 'Checkup', status: 'completed' }, { time: '10:30', patient: 'Maria Chen', doctor: 'Dr. Rodriguez', type: 'Follow-up', status: 'in-progress' }, { time: '11:15', patient: 'Sarah Kim', doctor: 'Dr. Patel', type: 'Consultation', status: 'upcoming' }, { time: '02:00', patient: 'Robert Singh', doctor: 'Dr. Thompson', type: 'Checkup', status: 'upcoming' }].map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 9, marginBottom: 4, background: row.status === 'in-progress' ? 'rgba(16,185,129,0.06)' : '#f8fafc', border: row.status === 'in-progress' ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent' }}>
                  <span style={{ fontSize: 10, color: C.textMuted, minWidth: 36, fontFamily: 'monospace', fontWeight: 600 }}>{row.time}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.textPrimary }}>{row.patient}</div>
                    <div style={{ fontSize: 10, color: C.textMuted }}>{row.doctor} · {row.type}</div>
                  </div>
                  <div style={{ padding: '3px 8px', borderRadius: 50, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', background: row.status === 'in-progress' ? 'rgba(16,185,129,0.15)' : row.status === 'completed' ? 'rgba(34,197,94,0.1)' : 'rgba(37,99,235,0.08)', color: row.status === 'in-progress' ? '#059669' : row.status === 'completed' ? '#16a34a' : C.blue }}>
                    {row.status === 'in-progress' ? '● Active' : row.status}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: '#fff', borderRadius: 14, padding: '14px', border: '1px solid #e8ecf0', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: C.textPrimary }}>Weekly Revenue</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#059669' }}>↑ 12%</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 56 }}>
                  {[45, 62, 55, 78, 68, 92, 75].map((h, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <div style={{ width: '100%', height: `${h}%`, background: i === 5 ? GRAD.primary : 'rgba(37,99,235,0.12)', borderRadius: '4px 4px 0 0' }} />
                      <span style={{ fontSize: 8, color: C.textLight }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, textAlign: 'center' }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: C.blueDark }}>$24,320</span>
                  <span style={{ fontSize: 11, color: C.textMuted }}> this week</span>
                </div>
              </div>
              <div style={{ background: '#fff', borderRadius: 14, padding: '14px', border: '1px solid #e8ecf0' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.textPrimary, marginBottom: 10 }}>Doctor Utilization</div>
                {[{ name: 'Dr. Mitchell', pct: 88 }, { name: 'Dr. Rodriguez', pct: 74 }, { name: 'Dr. Patel', pct: 62 }].map(d => (
                  <div key={d.name} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: C.textPrimary }}>{d.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: C.blue }}>{d.pct}%</span>
                    </div>
                    <div style={{ height: 5, background: '#f0f4f8', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${d.pct}%`, background: GRAD.primary, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DoctorPreview() {
  return (
    <div style={{ background: '#f0f4f8', borderRadius: 24, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ background: '#1e2333', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', gap: 5 }}>{['#ef4444', '#f59e0b', '#22c55e'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}</div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 5, padding: '4px 12px', fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>app.medibook.com/doctor/schedule</div>
      </div>
      <div style={{ display: 'flex', height: 460 }}>
        <div style={{ width: 180, background: 'linear-gradient(180deg, #0f2347, #1e3c7d)', padding: '20px 12px' }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', marginBottom: 8, paddingLeft: 8 }}>🏥 MediBook</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12, paddingLeft: 8 }}>Doctor Portal</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: GRAD.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>SM</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Dr. Mitchell</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>Cardiologist</div>
            </div>
          </div>
          {['📊 Dashboard', '📅 My Schedule', '👥 Patients', '💊 Prescriptions', '📋 Records'].map((item, i) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: i === 1 ? 'rgba(255,255,255,0.15)' : 'transparent', borderLeft: i === 1 ? '3px solid #10b981' : '3px solid transparent', marginBottom: 3 }}>
              <span style={{ fontSize: 12, fontWeight: i === 1 ? 700 : 500, color: i === 1 ? '#fff' : 'rgba(255,255,255,0.6)' }}>{item}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.textPrimary }}>Today's Schedule</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>Monday, May 19 · 8 appointments</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: 12, color: '#059669', fontWeight: 700 }}>Available</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
            {[{ label: 'Today', value: '8', grad: GRAD.primary, icon: '📅' }, { label: 'Completed', value: '3', grad: GRAD.green, icon: '✅' }, { label: 'Waiting', value: '2', grad: GRAD.amber, icon: '🕐' }, { label: 'This Month', value: '94', grad: GRAD.purple, icon: '📊' }].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '12px', border: '1px solid #e8ecf0', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.grad, borderRadius: '12px 12px 0 0' }} />
                <div style={{ fontSize: 9, color: C.textLight, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>{s.label}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: C.textPrimary }}>{s.value}</div>
                  <div style={{ fontSize: 16 }}>{s.icon}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', borderRadius: 14, padding: '14px', border: '1px solid #e8ecf0' }}>
            {[{ time: '09:00 AM', patient: 'Sarah Johnson', reason: 'Annual Cardiac Checkup', status: 'completed', init: 'SJ' }, { time: '10:30 AM', patient: 'Michael Chen', reason: 'Post-Surgery Follow-up', status: 'in-progress', init: 'MC' }, { time: '11:30 AM', patient: 'Emily Davis', reason: 'Prescription Refill', status: 'next', init: 'ED' }, { time: '02:00 PM', patient: 'Robert Kim', reason: 'New Patient Consult', status: 'upcoming', init: 'RK' }].map((apt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, marginBottom: 6, background: apt.status === 'in-progress' ? 'rgba(16,185,129,0.07)' : '#f8fafc', border: apt.status === 'in-progress' ? '1px solid rgba(16,185,129,0.2)' : '1px solid #e8ecf0' }}>
                <div style={{ minWidth: 64, textAlign: 'center', padding: '6px', background: '#fff', borderRadius: 8, border: '1px solid #e8ecf0' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.textPrimary, lineHeight: 1 }}>{apt.time.split(' ')[0]}</div>
                  <div style={{ fontSize: 9, color: C.textLight }}>{apt.time.split(' ')[1]}</div>
                </div>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: apt.status === 'in-progress' ? GRAD.green : GRAD.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{apt.init}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>{apt.patient}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{apt.reason}</div>
                </div>
                <div style={{ padding: '4px 10px', borderRadius: 50, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: apt.status === 'in-progress' ? 'rgba(16,185,129,0.15)' : apt.status === 'completed' ? 'rgba(34,197,94,0.1)' : apt.status === 'next' ? 'rgba(245,158,11,0.1)' : 'rgba(37,99,235,0.08)', color: apt.status === 'in-progress' ? '#059669' : apt.status === 'completed' ? '#16a34a' : apt.status === 'next' ? '#d97706' : C.blue }}>
                  {apt.status === 'in-progress' ? '● Active' : apt.status === 'next' ? 'Up Next' : apt.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PatientBookingPreview() {
  const [step, setStep] = useState(1);
  return (
    <div style={{ background: '#f0f4f8', borderRadius: 24, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ background: '#1e2333', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', gap: 5 }}>{['#ef4444', '#f59e0b', '#22c55e'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}</div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 5, padding: '4px 12px', fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>book.riversidefamilyclinic.com (powered by MediBook)</div>
      </div>
      <div style={{ padding: '40px', background: '#f8fafc', minHeight: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: C.blueDark, marginBottom: 4 }}>🏥 Riverside Family Clinic</div>
          <div style={{ fontSize: 13, color: C.textMuted }}>Online appointment booking — available 24/7</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: s <= step ? GRAD.primary : '#e8ecf0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s <= step ? '#fff' : C.textLight, fontSize: 13, fontWeight: 700 }}>
                {s < step ? '✓' : s}
              </div>
              <span style={{ fontSize: 12, color: s <= step ? C.blue : C.textLight, fontWeight: s === step ? 700 : 400 }}>{['Select Doctor', 'Choose Time', 'Confirm'][s - 1]}</span>
              {s < 3 && <div style={{ width: 32, height: 2, background: s < step ? C.blue : '#e8ecf0', borderRadius: 2 }} />}
            </div>
          ))}
        </div>
        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, maxWidth: 700, margin: '0 auto' }}>
            {[{ name: 'Dr. Sarah Mitchell', spec: 'Cardiologist', rating: '4.9', fee: '$120', next: 'Today 2:30 PM', init: 'SM', grad: GRAD.primary }, { name: 'Dr. Emily Rodriguez', spec: 'Pediatrician', rating: '5.0', fee: '$90', next: 'Today 4:00 PM', init: 'ER', grad: GRAD.green }, { name: 'Dr. Michael Patel', spec: 'Orthopedics', rating: '4.9', fee: '$150', next: 'Wed 9:00 AM', init: 'MP', grad: GRAD.purple }].map(doc => (
              <div key={doc.name} onClick={() => setStep(2)} style={{ background: '#fff', borderRadius: 16, padding: '18px', border: '1px solid #e8ecf0', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.blue; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(37,99,235,0.15)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e8ecf0'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: doc.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700, margin: '0 auto 12px' }}>{doc.init}</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 3 }}>{doc.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>{doc.spec}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, fontSize: 11, marginBottom: 10 }}>
                    <span style={{ color: '#f59e0b', fontWeight: 700 }}>⭐ {doc.rating}</span>
                    <span style={{ color: C.textMuted }}>·</span>
                    <span style={{ fontWeight: 700, color: C.textPrimary }}>{doc.fee}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>Next: {doc.next}</div>
                  <div style={{ marginTop: 10, padding: '8px', borderRadius: 8, background: GRAD.primary, color: '#fff', fontSize: 11, fontWeight: 700 }}>Book →</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {step === 2 && (
          <div style={{ maxWidth: 500, margin: '0 auto', background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e8ecf0' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.textPrimary, marginBottom: 16 }}>Select Date & Time</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
              {['Mon 19', 'Tue 20', 'Wed 21', 'Thu 22', 'Fri 23', 'Mon 26'].map((d, i) => (
                <div key={d} style={{ padding: '10px', borderRadius: 10, textAlign: 'center', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: i === 0 ? GRAD.primary : '#f8fafc', color: i === 0 ? '#fff' : C.textPrimary, border: i === 0 ? 'none' : '1px solid #e8ecf0' }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
              {['09:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '02:30 PM', '04:00 PM'].map((t, i) => (
                <div key={t} style={{ padding: '9px', borderRadius: 8, textAlign: 'center', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: i === 2 ? GRAD.primary : '#f8fafc', color: i === 2 ? '#fff' : C.textPrimary, border: i === 2 ? 'none' : '1px solid #e8ecf0' }}>{t}</div>
              ))}
            </div>
            <button onClick={() => setStep(3)} style={{ width: '100%', padding: '12px', borderRadius: 10, background: GRAD.primary, color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Confirm Time →</button>
          </div>
        )}
        {step === 3 && (
          <div style={{ maxWidth: 460, margin: '0 auto', background: '#fff', borderRadius: 16, padding: '28px', border: '1px solid #e8ecf0', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: GRAD.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(5,150,105,0.3)' }}>✓</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.textPrimary, marginBottom: 8 }}>Booking Confirmed!</div>
            <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 20 }}>Your appointment has been confirmed. A confirmation SMS and email have been sent.</div>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px', border: '1px solid #e8ecf0', textAlign: 'left', marginBottom: 20 }}>
              {[{ label: 'Doctor', value: 'Dr. Emily Rodriguez' }, { label: 'Date', value: 'Monday, May 19, 2025' }, { label: 'Time', value: '11:00 AM' }, { label: 'Clinic', value: 'Riverside Family Clinic' }, { label: 'Type', value: 'In-Person Consultation' }].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: C.textMuted }}>{row.label}</span>
                  <span style={{ fontWeight: 700, color: C.textPrimary }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '10px', borderRadius: 10, background: '#f0f4f8', border: '1px solid #e8ecf0', color: C.textMuted, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Book Another</button>
              <button style={{ flex: 1, padding: '10px', borderRadius: 10, background: GRAD.green, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Add to Calendar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────────
function TestimonialsSection() {
  return (
    <section id="testimonials" style={{ padding: '100px 40px', background: '#fff' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'inline-block', padding: '6px 18px', borderRadius: 50, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#d97706', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 20 }}>Clinic Manager Reviews</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: C.textPrimary, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 16 }}>What Clinics Say After<br />30 Days with MediBook</h2>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 3 }}>{[1, 2, 3, 4, 5].map(s => <span key={s} style={{ fontSize: 20, color: '#f59e0b' }}>⭐</span>)}</div>
            <span style={{ fontSize: 18, fontWeight: 900, color: C.textPrimary }}>4.9</span>
            <span style={{ fontSize: 14, color: C.textMuted }}>from 200+ clinic managers</span>
          </div>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 24 }}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ background: C.page, borderRadius: 24, padding: '32px', border: '1px solid #e8ecf0', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#fff'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 48px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = C.page; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: t.gradient, borderRadius: '24px 24px 0 0' }} />
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 50, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: 16 }}>
                <span style={{ fontSize: 12 }}>📈</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>{t.result}</span>
              </div>
              <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>{[...Array(t.rating)].map((_, j) => <span key={j} style={{ fontSize: 16, color: '#f59e0b' }}>⭐</span>)}</div>
              <p style={{ fontSize: 16, color: C.textPrimary, lineHeight: 1.75, marginBottom: 24 }}>"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: t.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15, fontWeight: 700, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>{t.initials}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{t.role} · {t.clinic}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 50, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', fontSize: 11, fontWeight: 700, color: '#059669' }}>✓ Verified</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// PRICING
// ─────────────────────────────────────────────
function PricingSection() {
  return (
    <section id="pricing" style={{ padding: '100px 40px', background: C.page }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'inline-block', padding: '6px 18px', borderRadius: 50, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', color: C.purple, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 20 }}>Clinic Pricing</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: C.textPrimary, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 16 }}>Pricing Built for Clinics</h2>
          <p style={{ fontSize: 18, color: C.textMuted, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>Per-clinic pricing. No per-patient fees. No surprise charges. Start your free 14-day trial — we handle the setup.</p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'start' }}>
          {PRICING.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ background: plan.popular ? GRAD.primary : '#fff', borderRadius: 24, padding: '36px 32px', border: plan.popular ? 'none' : '1px solid #e8ecf0', boxShadow: plan.popular ? '0 24px 64px rgba(37,99,235,0.3)' : '0 4px 20px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden', transform: plan.popular ? 'scale(1.03)' : 'scale(1)' }}
            >
              {plan.popular && (
                <div style={{ position: 'absolute', top: 20, right: 20, padding: '5px 14px', borderRadius: 50, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>Most Popular</div>
              )}
              <div style={{ fontSize: 12, fontWeight: 700, color: plan.popular ? 'rgba(255,255,255,0.7)' : C.textLight, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, color: plan.popular ? '#fff' : C.textPrimary, letterSpacing: '-2px' }}>{plan.price}</span>
                <span style={{ fontSize: 15, fontWeight: 500, paddingBottom: 8, color: plan.popular ? 'rgba(255,255,255,0.6)' : C.textMuted }}>{plan.period}</span>
              </div>
              <p style={{ fontSize: 14, marginBottom: 24, color: plan.popular ? 'rgba(255,255,255,0.7)' : C.textMuted, lineHeight: 1.5 }}>{plan.desc}</p>
              <div style={{ height: 1, background: plan.popular ? 'rgba(255,255,255,0.15)' : '#e8ecf0', marginBottom: 24 }} />
              <div style={{ marginBottom: 28 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: plan.popular ? 'rgba(255,255,255,0.2)' : 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: plan.popular ? '#fff' : '#059669', fontWeight: 700, marginTop: 1 }}>✓</div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: plan.popular ? '#fff' : C.textPrimary }}>{f}</span>
                  </div>
                ))}
                {plan.missing.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, opacity: 0.35 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>—</div>
                    <span style={{ fontSize: 14, color: C.textMuted, textDecoration: 'line-through' }}>{f}</span>
                  </div>
                ))}
              </div>
              <a href="/signup" style={{ display: 'block', width: '100%', padding: '15px', borderRadius: 14, fontSize: 15, fontWeight: 800, color: plan.popular ? C.blueDark : '#fff', background: plan.popular ? '#fff' : GRAD.primary, textDecoration: 'none', textAlign: 'center', boxShadow: plan.popular ? '0 4px 20px rgba(255,255,255,0.2)' : '0 4px 16px rgba(37,99,235,0.3)', transition: 'all 0.2s' }}>
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 50, background: '#fff', border: '1px solid #e8ecf0', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: 20 }}>🛡️</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>30-day money-back guarantee — no questions asked</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────
function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" style={{ padding: '100px 40px', background: '#fff' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: C.textPrimary, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 16 }}>Questions Clinic Managers Ask</h2>
          <p style={{ fontSize: 18, color: C.textMuted }}>Still unsure? <a href="mailto:hello@medibook.com" style={{ color: C.blue, fontWeight: 700, textDecoration: 'none' }}>Email our team →</a></p>
        </motion.div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAQS.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              style={{ background: C.page, borderRadius: 18, overflow: 'hidden', border: open === i ? `1px solid ${C.blue}` : '1px solid #e8ecf0', boxShadow: open === i ? '0 4px 24px rgba(37,99,235,0.08)' : 'none', transition: 'all 0.3s ease' }}
            >
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', padding: '22px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: open === i ? C.blue : C.textPrimary, transition: 'color 0.3s', lineHeight: 1.4 }}>{faq.q}</span>
                <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: open === i ? GRAD.primary : '#e8ecf0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: open === i ? '#fff' : C.textMuted, transition: 'all 0.3s ease', transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '0 24px 24px', fontSize: 15, color: C.textMuted, lineHeight: 1.75, borderTop: '1px solid #e8ecf0', paddingTop: 16 }}>{faq.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// FINAL CTA
// ─────────────────────────────────────────────
function FinalCTA({ onTalkToSales }: { onTalkToSales: () => void }) {
  return (
    <section style={{ padding: '0 40px 100px', background: '#fff' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ borderRadius: 32, overflow: 'hidden', position: 'relative' }}
        >
          {/* Background */}
          <div style={{ position: 'absolute', inset: 0, background: GRAD.hero }} />
          <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          {/* Glow orbs */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.35) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center', padding: '72px 64px' }}>
            {/* LEFT — copy */}
            <div>
              {/* Live badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 50, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', marginBottom: 24 }}>
                <motion.span animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}
                />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#34d399', letterSpacing: '0.5px' }}>200+ clinics live on MediBook</span>
              </div>

              <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.08, marginBottom: 18 }}>
                Ready to Modernize<br />
                <span style={{ background: 'linear-gradient(90deg, #60a5fa, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Your Clinic?
                </span>
              </h2>

              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, marginBottom: 28, maxWidth: 440 }}>
                Join 200+ clinics already running smarter with MediBook. Setup takes 48 hours — your dedicated specialist handles everything.
              </p>

              {/* Trust badges row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}>
                {['🛡️ HIPAA-Ready', '🔒 AES-256', '📅 48h Setup', '💳 No Credit Card'].map(badge => (
                  <div key={badge} style={{ padding: '6px 14px', borderRadius: 50, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>{badge}</div>
                ))}
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <motion.a href="/signup"
                  whileHover={{ y: -3, boxShadow: '0 20px 48px rgba(255,255,255,0.25)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{ padding: '16px 32px', borderRadius: 14, fontSize: 16, fontWeight: 800, color: C.blueDark, background: '#ffffff', textDecoration: 'none', boxShadow: '0 6px 24px rgba(0,0,0,0.2)', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s ease' }}
                >🚀 Request a Free Demo</motion.a>

                {/* ── TALK TO SALES BUTTON — NOW FUNCTIONAL ── */}
                <motion.button
                  onClick={onTalkToSales}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ padding: '16px 32px', borderRadius: 14, fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s ease', cursor: 'pointer' }}
                >📧 Talk to Sales</motion.button>
              </div>
            </div>

            {/* RIGHT — stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { icon: '📉', value: '67%', label: 'Fewer No-Shows', sub: 'avg. across all clinics', color: '#34d399' },
                { icon: '⭐', value: '4.9', label: 'Star Rating', sub: 'from clinic managers', color: '#fbbf24' },
                { icon: '⚡', value: '48h', label: 'Setup Time', sub: 'we handle everything', color: '#60a5fa' },
                { icon: '🏥', value: '200+', label: 'Clinics Live', sub: 'and growing fast', color: '#a78bfa' },
              ].map((stat, i) => (
                <motion.div key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  style={{ padding: '22px 20px', borderRadius: 18, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', transition: 'all 0.25s ease', cursor: 'default' }}
                >
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{stat.icon}</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: stat.color, letterSpacing: '-1px', lineHeight: 1, marginBottom: 6 }}>{stat.value}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{stat.label}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{stat.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom strip */}
          <div style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.08)', padding: '18px 64px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
            {['📅 30-min onboarding demo', '⚡ 48h full setup', '🛡️ 30-day money-back guarantee', '✉️ hello@medibook.com'].map(item => (
              <span key={item} style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{item}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────
function Footer() {
  const cols = [
    { title: 'Product', links: ['Appointment Scheduling', 'Patient Portal', 'Analytics Dashboard', 'Digital Prescriptions', 'Automated Reminders'] },
    { title: 'For Clinics', links: ['How It Works', 'Pricing', 'Implementation Guide', 'API Documentation', 'Integrations'] },
    { title: 'Company', links: ['About MediBook', 'Blog', 'Careers', 'Press Kit', 'Contact Us'] },
    { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Security Overview', 'Cookie Policy', 'HIPAA-Ready Architecture'] },
  ];
  return (
    <footer style={{ background: '#0f1729', padding: '72px 40px 40px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 40, marginBottom: 56 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: GRAD.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏥</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1 }}>MediBook</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>For Clinics</div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, marginBottom: 20, maxWidth: 260 }}>Clinic scheduling software trusted by 200+ independent practices and group clinics worldwide.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[{ icon: '📧', text: 'hello@medibook.com' }, { icon: '📞', text: '+1 (800) 633-4265' }, { icon: '🕐', text: 'Mon–Fri, 9am–6pm EST' }].map(item => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                  <span>{item.icon}</span>{item.text}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#34d399' }}>All systems operational</span>
            </div>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 18 }}>{col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(link => (
                  <a key={link} href="#" style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
                  >{link}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>© 2025 MediBook Inc. All rights reserved. · <span style={{ fontStyle: 'italic' }}>Demo project — for portfolio purposes</span></p>
          <div style={{ display: 'flex', gap: 8 }}>
            {['🔒 HIPAA-Ready', '🛡️ AES-256', '✅ SOC 2 Type II'].map(badge => (
              <div key={badge} style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)' }}>{badge}</div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────
export default function LandingPage() {
  const [salesModalOpen, setSalesModalOpen] = useState(false);

  return (
    <div style={{ paddingBottom: 0 }}>
      <Navbar />
      <Hero onTalkToSales={() => setSalesModalOpen(true)} />
      <ProofBar />
      <PainSolution />
      <FeaturesSection />
      <PlatformPreview />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <FinalCTA onTalkToSales={() => setSalesModalOpen(true)} />
      <Footer />

      {/* Talk to Sales Modal */}
      <AnimatePresence>
        {salesModalOpen && (
          <TalkToSalesModal
            isOpen={salesModalOpen}
            onClose={() => setSalesModalOpen(false)}
          />
        )}
      </AnimatePresence>

      <div style={{ position: 'fixed', bottom: 0, right: 0, width: 100, height: 100, pointerEvents: 'none', zIndex: 0 }} aria-hidden="true" />
    </div>
  );
}

