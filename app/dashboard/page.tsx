"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────
const C = {
  blueDark:    '#1e3c7d',
  blue:        '#2563eb',
  green:       '#10b981',
  greenDark:   '#059669',
  purple:      '#7c3aed',
  amber:       '#f59e0b',
  red:         '#ef4444',
  textPrimary: '#0f1729',
  textMuted:   '#64748b',
  textLight:   '#9ca3af',
  border:      '#e8ecf0',
  card:        '#ffffff',
  page:        '#f0f4f8',
};

const GRAD = {
  primary: 'linear-gradient(135deg, #1e3c7d, #2563eb)',
  hero:    'linear-gradient(180deg, #0f2347 0%, #1e3c7d 50%, #0f2347 100%)',
  green:   'linear-gradient(135deg, #059669, #10b981)',
  purple:  'linear-gradient(135deg, #7c3aed, #8b5cf6)',
  amber:   'linear-gradient(135deg, #f59e0b, #fbbf24)',
  red:     'linear-gradient(135deg, #ef4444, #f87171)',
  topBar:  'linear-gradient(90deg, #1e3c7d, #2563eb, #818cf8)',
};

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface Appointment {
  id: string;
  time: string;
  patient: string;
  doctor: string;
  type: string;
  status: string;
  room: string;
  fee: number;
  date: string;
  notes?: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  lastVisit: string;
  condition: string;
  status: string;
  visits: number;
  bloodType?: string;
  address?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  patients: number;
  utilization: number;
  rating: number;
  status: string;
  revenue: number;
  initials: string;
  grad: string;
  phone?: string;
  email?: string;
  experience?: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// ─────────────────────────────────────────────
// DEFAULT DATA
// ─────────────────────────────────────────────
const TODAY = new Date().toISOString().split('T')[0];

const DEFAULT_APPOINTMENTS: Appointment[] = [
  { id: 'a1', time: '09:00 AM', patient: 'James Doe',      doctor: 'Dr. Sarah Mitchell',  type: 'Annual Checkup',      status: 'completed',   room: '1A', fee: 120, date: TODAY },
  { id: 'a2', time: '09:45 AM', patient: 'Maria Chen',     doctor: 'Dr. Emily Rodriguez', type: 'Follow-up Consult',   status: 'completed',   room: '2B', fee: 90,  date: TODAY },
  { id: 'a3', time: '10:30 AM', patient: 'Robert Singh',   doctor: 'Dr. Michael Patel',   type: 'Orthopedic Eval',     status: 'in-progress', room: '3A', fee: 150, date: TODAY },
  { id: 'a4', time: '11:15 AM', patient: 'Sarah Kim',      doctor: 'Dr. David Kim',       type: 'Neurology Consult',   status: 'upcoming',    room: '1B', fee: 140, date: TODAY },
  { id: 'a5', time: '12:00 PM', patient: 'Tom Harrison',   doctor: 'Dr. Lisa Thompson',   type: 'General Checkup',     status: 'upcoming',    room: '2A', fee: 80,  date: TODAY },
  { id: 'a6', time: '02:00 PM', patient: 'Priya Sharma',   doctor: 'Dr. Sarah Mitchell',  type: 'Cardiac Follow-up',   status: 'upcoming',    room: '1A', fee: 120, date: TODAY },
  { id: 'a7', time: '02:45 PM', patient: 'Marcus Johnson', doctor: 'Dr. Emily Rodriguez', type: 'Pediatric Checkup',   status: 'upcoming',    room: '2B', fee: 90,  date: TODAY },
  { id: 'a8', time: '03:30 PM', patient: 'Rachel Brown',   doctor: 'Dr. Michael Patel',   type: 'Post-Surgery Review', status: 'cancelled',   room: '3A', fee: 150, date: TODAY },
];

const DEFAULT_DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Sarah Mitchell',  specialty: 'Cardiologist',       patients: 8, utilization: 88, rating: 4.9, status: 'active',   revenue: 960, initials: 'SM', grad: GRAD.primary, phone: '+1 (555) 101-0001', email: 'mitchell@medibook.com',  experience: '12 years' },
  { id: 'd2', name: 'Dr. Emily Rodriguez', specialty: 'Pediatrician',       patients: 7, utilization: 74, rating: 5.0, status: 'active',   revenue: 630, initials: 'ER', grad: GRAD.green,   phone: '+1 (555) 101-0002', email: 'rodriguez@medibook.com', experience: '8 years'  },
  { id: 'd3', name: 'Dr. Michael Patel',   specialty: 'Orthopedic Surgeon', patients: 5, utilization: 62, rating: 4.9, status: 'active',   revenue: 750, initials: 'MP', grad: GRAD.purple,  phone: '+1 (555) 101-0003', email: 'patel@medibook.com',     experience: '15 years' },
  { id: 'd4', name: 'Dr. David Kim',       specialty: 'Neurologist',        patients: 4, utilization: 55, rating: 4.9, status: 'on-leave', revenue: 0,   initials: 'DK', grad: GRAD.amber,   phone: '+1 (555) 101-0004', email: 'kim@medibook.com',       experience: '10 years' },
  { id: 'd5', name: 'Dr. Lisa Thompson',   specialty: 'General Physician',  patients: 6, utilization: 70, rating: 4.7, status: 'active',   revenue: 480, initials: 'LT', grad: GRAD.red,     phone: '+1 (555) 101-0005', email: 'thompson@medibook.com',  experience: '6 years'  },
];

const DEFAULT_PATIENTS: Patient[] = [
  { id: 'p1', name: 'James Doe',    age: 45, phone: '+1 (555) 001-0001', email: 'james@email.com',  lastVisit: 'Today 9:00 AM',  condition: 'Hypertension',     status: 'active',       visits: 12, bloodType: 'A+',  address: '123 Main St, NY'  },
  { id: 'p2', name: 'Maria Chen',   age: 32, phone: '+1 (555) 001-0002', email: 'maria@email.com',  lastVisit: 'Today 9:45 AM',  condition: 'Seasonal Allergy', status: 'active',       visits: 4,  bloodType: 'B+',  address: '456 Oak Ave, NY'  },
  { id: 'p3', name: 'Robert Singh', age: 58, phone: '+1 (555) 001-0003', email: 'robert@email.com', lastVisit: 'Today 10:30 AM', condition: 'Knee Replacement', status: 'in-treatment', visits: 8,  bloodType: 'O-',  address: '789 Pine Rd, NY'  },
  { id: 'p4', name: 'Sarah Kim',    age: 29, phone: '+1 (555) 001-0004', email: 'sarah@email.com',  lastVisit: 'May 10, 2025',   condition: 'Migraine',         status: 'active',       visits: 3,  bloodType: 'AB+', address: '321 Elm St, NY'   },
  { id: 'p5', name: 'Tom Harrison', age: 67, phone: '+1 (555) 001-0005', email: 'tom@email.com',    lastVisit: 'May 8, 2025',    condition: 'Diabetes Type 2',  status: 'active',       visits: 18, bloodType: 'A-',  address: '654 Cedar Ln, NY' },
  { id: 'p6', name: 'Rachel Brown', age: 41, phone: '+1 (555) 001-0006', email: 'rachel@email.com', lastVisit: 'Apr 28, 2025',   condition: 'Post-Surgery',     status: 'monitoring',   visits: 6,  bloodType: 'O+',  address: '987 Maple Dr, NY' },
];

const WEEKLY_REVENUE = [38, 52, 44, 68, 58, 82, 64];

// ─────────────────────────────────────────────
// LOCAL STORAGE HOOK
// ─────────────────────────────────────────────
function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch { return defaultValue; }
  });

  const setStored = (newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const resolved = typeof newValue === 'function'
        ? (newValue as (prev: T) => T)(prev) : newValue;
      try { localStorage.setItem(key, JSON.stringify(resolved)); } catch {}
      return resolved;
    });
  };
  return [value, setStored] as const;
}

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));
  return { toasts, addToast, removeToast };
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div key={toast.id}
            initial={{ opacity: 0, x: 80, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.85 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={() => removeToast(toast.id)}
            style={{
              padding: '14px 20px', borderRadius: 16,
              background: toast.type === 'success' ? GRAD.green : toast.type === 'error' ? GRAD.red : GRAD.primary,
              color: '#fff', fontSize: 14, fontWeight: 600,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              display: 'flex', alignItems: 'center', gap: 10,
              minWidth: 300, cursor: 'pointer', pointerEvents: 'all',
            }}
          >
            <span style={{ fontSize: 20 }}>{toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}</span>
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// LOADING SPINNER
// ─────────────────────────────────────────────
function LoadingSpinner({ label = 'Saving...' }: { label?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 20 }}>
      <div style={{ position: 'relative', width: 72, height: 72 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 72, height: 72, borderRadius: '50%',
            border: '4px solid #e8ecf0',
            borderTop: `4px solid ${C.blue}`,
            borderRight: `4px solid ${C.blue}`,
            position: 'absolute',
          }}
        />
        <div style={{
          position: 'absolute', inset: 8,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(16,185,129,0.08))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
        }}>🏥</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 13, color: C.textMuted }}>Please wait a moment...</div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i}
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
            style={{ width: 8, height: 8, borderRadius: '50%', background: C.blue }}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SUCCESS SCREEN
// ─────────────────────────────────────────────
function SuccessScreen({ title, subtitle, details, onClose, onAddAnother, addAnotherLabel = 'Add Another' }: {
  title: string;
  subtitle: string;
  details?: { label: string; value: string }[];
  onClose: () => void;
  onAddAnother?: () => void;
  addAnotherLabel?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 260 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px', textAlign: 'center' }}
    >
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 14, stiffness: 200, delay: 0.1 }}
        style={{
          width: 88, height: 88, borderRadius: '50%',
          background: GRAD.green,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40, marginBottom: 24,
          boxShadow: '0 12px 40px rgba(16,185,129,0.4)',
        }}
      >
        ✓
      </motion.div>

      {/* Confetti dots */}
      <div style={{ position: 'relative', marginBottom: -20 }}>
        {[...Array(8)].map((_, i) => (
          <motion.div key={i}
            initial={{ opacity: 1, y: 0, x: 0 }}
            animate={{ opacity: 0, y: -60 - Math.random() * 40, x: (i % 2 === 0 ? 1 : -1) * (20 + Math.random() * 60) }}
            transition={{ duration: 1.2, delay: 0.2 + i * 0.06, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: 10, height: 10,
              borderRadius: '50%',
              background: [C.blue, C.green, C.amber, C.purple, C.red][i % 5],
              top: -44, left: '50%',
            }}
          />
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: C.textPrimary, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 15, color: C.textMuted, marginBottom: 24, lineHeight: 1.6 }}>{subtitle}</div>
      </motion.div>

      {details && details.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ width: '100%', background: '#f8fafc', borderRadius: 16, padding: '16px 20px', border: '1px solid #e8ecf0', marginBottom: 28, textAlign: 'left' }}
        >
          {details.map((d, i) => (
            <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < details.length - 1 ? '1px solid #e8ecf0' : 'none' }}>
              <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 500 }}>{d.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>{d.value}</span>
            </div>
          ))}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        style={{ display: 'flex', gap: 12, width: '100%' }}
      >
        {onAddAnother && (
          <button onClick={onAddAnother}
            style={{ flex: 1, padding: '13px', borderRadius: 12, border: `2px solid ${C.blue}`, background: 'transparent', color: C.blue, fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            ➕ {addAnotherLabel}
          </button>
        )}
        <button onClick={onClose}
          style={{ flex: 1, padding: '13px', borderRadius: 12, border: 'none', background: GRAD.primary, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(37,99,235,0.3)', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          ✓ Done
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// MODAL WRAPPER — FIXED CENTERED
// ─────────────────────────────────────────────
function Modal({ isOpen, onClose, title, children, width = 580, step }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
  step?: 'form' | 'loading' | 'success';
}) {
  useEffect(() => {
    if (isOpen) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && step !== 'loading') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, step]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99990,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => step !== 'loading' && onClose()}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(10,20,40,0.65)',
              backdropFilter: 'blur(6px)',
            }}
          />

          {/* Modal box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 30 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            style={{
              position: 'relative', zIndex: 1,
              width: '100%', maxWidth: width,
              background: '#fff',
              borderRadius: 24,
              boxShadow: '0 40px 100px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header — hide on success/loading */}
            {step === 'form' && (
              <div style={{
                padding: '18px 24px',
                background: GRAD.primary,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0,
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{title}</div>
                <button onClick={onClose}
                  style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.5)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                >✕</button>
              </div>
            )}

            {/* Body */}
            <div style={{ overflowY: 'auto', flex: 1, padding: step === 'form' ? '24px' : '0' }}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// FORM FIELD
// ─────────────────────────────────────────────
function FormField({ label, value, onChange, type = 'text', options, required, placeholder, icon }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; options?: string[]; required?: boolean; placeholder?: string; icon?: string;
}) {
  const base: React.CSSProperties = {
    width: '100%', padding: '10px 13px', borderRadius: 10,
    border: '2px solid #e8ecf0', fontSize: 14, color: C.textPrimary,
    background: '#f8fafc', outline: 'none', boxSizing: 'border-box',
    fontFamily: "'Segoe UI', system-ui, sans-serif", transition: 'all 0.2s',
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 5 }}>
        {icon} {label} {required && <span style={{ color: C.red }}>*</span>}
      </label>
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={{ ...base, cursor: 'pointer' }}
          onFocus={e => { e.target.style.border = `2px solid ${C.blue}`; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
          onBlur={e => { e.target.style.border = '2px solid #e8ecf0'; e.target.style.boxShadow = 'none'; }}
        >
          <option value="">Select {label}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} style={base}
          onFocus={e => { e.target.style.border = `2px solid ${C.blue}`; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
          onBlur={e => { e.target.style.border = '2px solid #e8ecf0'; e.target.style.boxShadow = 'none'; }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// DELETE CONFIRM MODAL
// ─────────────────────────────────────────────
function DeleteModal({ isOpen, onClose, onConfirm, itemName, itemType }: {
  isOpen: boolean; onClose: () => void; onConfirm: () => void; itemName: string; itemType: string;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" width={420} step="form">
      <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 14 }}
          style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px' }}>
          🗑️
        </motion.div>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.textPrimary, marginBottom: 8 }}>Delete {itemType}?</div>
        <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 28, lineHeight: 1.7 }}>
          Are you sure you want to delete <strong style={{ color: C.textPrimary }}>{itemName}</strong>?<br />This action cannot be undone.
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #e8ecf0', background: '#f0f4f8', color: C.textMuted, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: GRAD.red, color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(239,68,68,0.35)' }}>🗑️ Delete</button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// APPOINTMENT MODAL
// ─────────────────────────────────────────────
function AppointmentModal({ isOpen, onClose, onSave, doctors, patients, editData }: {
  isOpen: boolean; onClose: () => void;
  onSave: (data: Appointment) => void;
  doctors: Doctor[]; patients: Patient[]; editData?: Appointment | null;
}) {
  type Step = 'form' | 'loading' | 'success';
  const [step, setStep] = useState<Step>('form');
  const [saved, setSaved] = useState<Appointment | null>(null);
  const [form, setForm] = useState({ patient: '', doctor: '', type: '', time: '', date: TODAY, room: '', fee: '', status: 'upcoming', notes: '' });

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setSaved(null);
      if (editData) {
        setForm({ patient: editData.patient, doctor: editData.doctor, type: editData.type, time: editData.time, date: editData.date || TODAY, room: editData.room, fee: String(editData.fee), status: editData.status, notes: editData.notes || '' });
      } else {
        setForm({ patient: '', doctor: '', type: '', time: '', date: TODAY, room: '', fee: '', status: 'upcoming', notes: '' });
      }
    }
  }, [isOpen, editData]);

  const f = (key: string) => (v: string) => setForm(prev => ({ ...prev, [key]: v }));
  const valid = !!(form.patient && form.doctor && form.type && form.time && form.date);

  const handleSave = () => {
    if (!valid) return;
    setStep('loading');
    const data: Appointment = {
      id: editData?.id || `a${Date.now()}`,
      patient: form.patient, doctor: form.doctor, type: form.type,
      time: form.time, date: form.date, room: form.room || 'TBD',
      fee: Number(form.fee) || 0, status: form.status, notes: form.notes,
    };
    setTimeout(() => { onSave(data); setSaved(data); setStep('success'); }, 1400);
  };

  const handleClose = () => { setStep('form'); setSaved(null); onClose(); };
  const handleAnother = () => { setStep('form'); setSaved(null); setForm({ patient: '', doctor: '', type: '', time: '', date: TODAY, room: '', fee: '', status: 'upcoming', notes: '' }); };

  const TYPES = ['Annual Checkup','Follow-up Consult','Orthopedic Eval','Neurology Consult','General Checkup','Cardiac Follow-up','Pediatric Checkup','Post-Surgery Review','Dental Cleaning','Vaccination','Lab Results Review','New Patient Consultation'];
  const TIMES = ['08:00 AM','08:30 AM','09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:15 AM','11:30 AM','12:00 PM','12:30 PM','01:00 PM','01:30 PM','02:00 PM','02:30 PM','02:45 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM'];
  const ROOMS = ['1A','1B','2A','2B','3A','3B','4A','4B','Consultation Room','Emergency'];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={editData ? '✏️ Edit Appointment' : '📅 Schedule New Appointment'} width={600} step={step}>
      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <FormField label="Patient" icon="👤" value={form.patient} onChange={f('patient')} options={patients.map(p => p.name)} required />
              </div>
              <FormField label="Doctor" icon="👨‍⚕️" value={form.doctor} onChange={f('doctor')} options={doctors.filter(d => d.status === 'active').map(d => d.name)} required />
              <FormField label="Appointment Type" icon="📋" value={form.type} onChange={f('type')} options={TYPES} required />
              <FormField label="Date" icon="📆" type="date" value={form.date} onChange={f('date')} required />
              <FormField label="Time Slot" icon="🕐" value={form.time} onChange={f('time')} options={TIMES} required />
              <FormField label="Room" icon="🚪" value={form.room} onChange={f('room')} options={ROOMS} />
              <FormField label="Fee ($)" icon="💰" type="number" value={form.fee} onChange={f('fee')} placeholder="e.g. 120" />
              <FormField label="Status" icon="🔘" value={form.status} onChange={f('status')} options={['upcoming','in-progress','completed','cancelled']} />
              <div style={{ gridColumn: '1 / -1', marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 5 }}>📝 Notes (optional)</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any special instructions..." rows={3}
                  style={{ width: '100%', padding: '10px 13px', borderRadius: 10, border: '2px solid #e8ecf0', fontSize: 14, color: C.textPrimary, background: '#f8fafc', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: "'Segoe UI', system-ui, sans-serif" }}
                  onFocus={e => { e.target.style.border = `2px solid ${C.blue}`; }}
                  onBlur={e => { e.target.style.border = '2px solid #e8ecf0'; }}
                />
              </div>
            </div>
            {!valid && (
              <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', fontSize: 13, color: '#d97706', fontWeight: 600 }}>
                ⚠️ Please fill in all required fields (Patient, Doctor, Type, Time, Date)
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={handleClose} style={{ padding: '11px 22px', borderRadius: 12, border: '1px solid #e8ecf0', background: '#f0f4f8', color: C.textMuted, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={!valid}
                style={{ padding: '11px 26px', borderRadius: 12, border: 'none', background: valid ? GRAD.primary : '#e8ecf0', color: valid ? '#fff' : C.textLight, fontSize: 14, fontWeight: 800, cursor: valid ? 'pointer' : 'not-allowed', boxShadow: valid ? '0 4px 16px rgba(37,99,235,0.3)' : 'none', transition: 'all 0.2s' }}>
                {editData ? '✅ Save Changes' : '📅 Schedule Appointment'}
              </button>
            </div>
          </motion.div>
        )}
        {step === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingSpinner label={editData ? 'Updating appointment...' : 'Scheduling appointment...'} />
          </motion.div>
        )}
        {step === 'success' && saved && (
          <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SuccessScreen
              title={editData ? 'Appointment Updated!' : 'Appointment Scheduled!'}
              subtitle={`${saved.patient}'s appointment has been ${editData ? 'updated' : 'successfully scheduled'} and saved to the dashboard.`}
              details={[
                { label: 'Patient', value: saved.patient },
                { label: 'Doctor', value: saved.doctor },
                { label: 'Date & Time', value: `${saved.date} at ${saved.time}` },
                { label: 'Type', value: saved.type },
                { label: 'Room', value: saved.room },
                { label: 'Fee', value: `$${saved.fee}` },
              ]}
              onClose={handleClose}
              onAddAnother={editData ? undefined : handleAnother}
              addAnotherLabel="Schedule Another"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// PATIENT MODAL
// ─────────────────────────────────────────────
function PatientModal({ isOpen, onClose, onSave, editData }: {
  isOpen: boolean; onClose: () => void; onSave: (data: Patient) => void; editData?: Patient | null;
}) {
  type Step = 'form' | 'loading' | 'success';
  const [step, setStep] = useState<Step>('form');
  const [saved, setSaved] = useState<Patient | null>(null);
  const [form, setForm] = useState({ name: '', age: '', phone: '', email: '', condition: '', status: 'active', bloodType: '', address: '' });

  useEffect(() => {
    if (isOpen) {
      setStep('form'); setSaved(null);
      if (editData) {
        setForm({ name: editData.name, age: String(editData.age), phone: editData.phone, email: editData.email || '', condition: editData.condition, status: editData.status, bloodType: editData.bloodType || '', address: editData.address || '' });
      } else {
        setForm({ name: '', age: '', phone: '', email: '', condition: '', status: 'active', bloodType: '', address: '' });
      }
    }
  }, [isOpen, editData]);

  const f = (key: string) => (v: string) => setForm(prev => ({ ...prev, [key]: v }));
  const valid = !!(form.name && form.phone && form.condition);

  const handleSave = () => {
    if (!valid) return;
    setStep('loading');
    const data: Patient = {
      id: editData?.id || `p${Date.now()}`,
      name: form.name, age: Number(form.age) || 0,
      phone: form.phone, email: form.email,
      condition: form.condition, status: form.status,
      bloodType: form.bloodType, address: form.address,
      lastVisit: editData?.lastVisit || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      visits: editData?.visits || 0,
    };
    setTimeout(() => { onSave(data); setSaved(data); setStep('success'); }, 1400);
  };

  const handleClose = () => { setStep('form'); setSaved(null); onClose(); };
  const handleAnother = () => { setStep('form'); setSaved(null); setForm({ name: '', age: '', phone: '', email: '', condition: '', status: 'active', bloodType: '', address: '' }); };

  const CONDITIONS = ['Hypertension','Diabetes Type 1','Diabetes Type 2','Asthma','Arthritis','Migraine','Seasonal Allergy','Heart Disease','Back Pain','Anxiety','Depression','Knee Replacement','Post-Surgery','General Wellness','Other'];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={editData ? '✏️ Edit Patient' : '👤 Add New Patient'} width={580} step={step}>
      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <FormField label="Full Name" icon="👤" value={form.name} onChange={f('name')} required placeholder="e.g. John Smith" />
              </div>
              <FormField label="Age" icon="🎂" type="number" value={form.age} onChange={f('age')} placeholder="e.g. 35" />
              <FormField label="Blood Type" icon="🩸" value={form.bloodType} onChange={f('bloodType')} options={['A+','A-','B+','B-','AB+','AB-','O+','O-']} />
              <FormField label="Phone Number" icon="📞" value={form.phone} onChange={f('phone')} required placeholder="+1 (555) 000-0000" />
              <FormField label="Email Address" icon="📧" type="email" value={form.email} onChange={f('email')} placeholder="patient@email.com" />
              <FormField label="Primary Condition" icon="📋" value={form.condition} onChange={f('condition')} options={CONDITIONS} required />
              <FormField label="Status" icon="🔘" value={form.status} onChange={f('status')} options={['active','in-treatment','monitoring','inactive']} />
              <div style={{ gridColumn: '1 / -1' }}>
                <FormField label="Home Address" icon="📍" value={form.address} onChange={f('address')} placeholder="123 Main St, New York, NY" />
              </div>
            </div>
            {!valid && (
              <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', fontSize: 13, color: '#d97706', fontWeight: 600 }}>
                ⚠️ Please fill in Name, Phone, and Condition
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={handleClose} style={{ padding: '11px 22px', borderRadius: 12, border: '1px solid #e8ecf0', background: '#f0f4f8', color: C.textMuted, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={!valid}
                style={{ padding: '11px 26px', borderRadius: 12, border: 'none', background: valid ? GRAD.green : '#e8ecf0', color: valid ? '#fff' : C.textLight, fontSize: 14, fontWeight: 800, cursor: valid ? 'pointer' : 'not-allowed', boxShadow: valid ? '0 4px 16px rgba(5,150,105,0.3)' : 'none', transition: 'all 0.2s' }}>
                {editData ? '✅ Save Changes' : '👤 Add Patient'}
              </button>
            </div>
          </motion.div>
        )}
        {step === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingSpinner label={editData ? 'Updating patient record...' : 'Adding new patient...'} />
          </motion.div>
        )}
        {step === 'success' && saved && (
          <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SuccessScreen
              title={editData ? 'Patient Updated!' : 'Patient Added!'}
              subtitle={`${saved.name} has been ${editData ? 'updated' : 'registered'} and is now visible in the Patient Records.`}
              details={[
                { label: 'Name', value: saved.name },
                { label: 'Age', value: saved.age ? `${saved.age} years old` : 'Not specified' },
                { label: 'Phone', value: saved.phone },
                { label: 'Condition', value: saved.condition },
                { label: 'Status', value: saved.status },
                { label: 'Blood Type', value: saved.bloodType || 'Not recorded' },
              ]}
              onClose={handleClose}
              onAddAnother={editData ? undefined : handleAnother}
              addAnotherLabel="Add Another Patient"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// DOCTOR MODAL
// ─────────────────────────────────────────────
function DoctorModal({ isOpen, onClose, onSave, editData }: {
  isOpen: boolean; onClose: () => void; onSave: (data: Doctor) => void; editData?: Doctor | null;
}) {
  type Step = 'form' | 'loading' | 'success';
  const [step, setStep] = useState<Step>('form');
  const [saved, setSaved] = useState<Doctor | null>(null);
  const gradOptions = [GRAD.primary, GRAD.green, GRAD.purple, GRAD.amber, GRAD.red];
  const [form, setForm] = useState({ name: '', specialty: '', phone: '', email: '', experience: '', status: 'active', grad: GRAD.primary });

  useEffect(() => {
    if (isOpen) {
      setStep('form'); setSaved(null);
      if (editData) {
        setForm({ name: editData.name, specialty: editData.specialty, phone: editData.phone || '', email: editData.email || '', experience: editData.experience || '', status: editData.status, grad: editData.grad });
      } else {
        setForm({ name: '', specialty: '', phone: '', email: '', experience: '', status: 'active', grad: GRAD.primary });
      }
    }
  }, [isOpen, editData]);

  const f = (key: string) => (v: string) => setForm(prev => ({ ...prev, [key]: v }));
  const valid = !!(form.name && form.specialty);

  const handleSave = () => {
    if (!valid) return;
    setStep('loading');
    const cleanName = form.name.startsWith('Dr.') ? form.name : `Dr. ${form.name}`;
    const initials = cleanName.replace('Dr. ', '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
    const data: Doctor = {
      id: editData?.id || `d${Date.now()}`,
      name: cleanName, specialty: form.specialty,
      phone: form.phone, email: form.email,
      experience: form.experience, status: form.status,
      grad: form.grad, initials,
      patients: editData?.patients || 0,
      utilization: editData?.utilization || 0,
      rating: editData?.rating || 5.0,
      revenue: editData?.revenue || 0,
    };
    setTimeout(() => { onSave(data); setSaved(data); setStep('success'); }, 1400);
  };

  const handleClose = () => { setStep('form'); setSaved(null); onClose(); };
  const handleAnother = () => { setStep('form'); setSaved(null); setForm({ name: '', specialty: '', phone: '', email: '', experience: '', status: 'active', grad: GRAD.primary }); };

  const SPECIALTIES = ['Cardiologist','Pediatrician','Orthopedic Surgeon','Neurologist','General Physician','Dermatologist','Psychiatrist','Oncologist','Gynecologist','Urologist','Radiologist','Anesthesiologist','Emergency Medicine','Internal Medicine','Family Medicine'];
  const GRAD_LABELS: Record<string, string> = { [GRAD.primary]: '🔵 Blue', [GRAD.green]: '🟢 Green', [GRAD.purple]: '🟣 Purple', [GRAD.amber]: '🟡 Amber', [GRAD.red]: '🔴 Red' };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={editData ? '✏️ Edit Doctor' : '👨‍⚕️ Add New Doctor'} width={580} step={step}>
      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <FormField label="Full Name" icon="👨‍⚕️" value={form.name} onChange={f('name')} required placeholder="e.g. Dr. Jane Smith or Jane Smith" />
              </div>
              <FormField label="Specialty" icon="🏥" value={form.specialty} onChange={f('specialty')} options={SPECIALTIES} required />
              <FormField label="Experience" icon="📅" value={form.experience} onChange={f('experience')} placeholder="e.g. 8 years" />
              <FormField label="Phone Number" icon="📞" value={form.phone} onChange={f('phone')} placeholder="+1 (555) 000-0000" />
              <FormField label="Email Address" icon="📧" type="email" value={form.email} onChange={f('email')} placeholder="doctor@medibook.com" />
              <FormField label="Status" icon="🔘" value={form.status} onChange={f('status')} options={['active','on-leave','inactive']} />
              <div style={{ gridColumn: '1 / -1', marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>🎨 Profile Color</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {gradOptions.map(g => (
                    <button key={g} onClick={() => setForm(p => ({ ...p, grad: g }))} title={GRAD_LABELS[g]}
                      style={{ width: 44, height: 44, borderRadius: 14, background: g, border: form.grad === g ? '3px solid #0f1729' : '3px solid transparent', cursor: 'pointer', boxShadow: form.grad === g ? '0 0 0 3px rgba(37,99,235,0.35)' : 'none', transition: 'all 0.2s' }}
                    />
                  ))}
                </div>
              </div>
            </div>
            {!valid && (
              <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', fontSize: 13, color: '#d97706', fontWeight: 600 }}>
                ⚠️ Please fill in Name and Specialty
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={handleClose} style={{ padding: '11px 22px', borderRadius: 12, border: '1px solid #e8ecf0', background: '#f0f4f8', color: C.textMuted, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={!valid}
                style={{ padding: '11px 26px', borderRadius: 12, border: 'none', background: valid ? GRAD.primary : '#e8ecf0', color: valid ? '#fff' : C.textLight, fontSize: 14, fontWeight: 800, cursor: valid ? 'pointer' : 'not-allowed', boxShadow: valid ? '0 4px 16px rgba(37,99,235,0.3)' : 'none', transition: 'all 0.2s' }}>
                {editData ? '✅ Save Changes' : '👨‍⚕️ Add Doctor'}
              </button>
            </div>
          </motion.div>
        )}
        {step === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingSpinner label={editData ? 'Updating doctor profile...' : 'Adding new doctor...'} />
          </motion.div>
        )}
        {step === 'success' && saved && (
          <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SuccessScreen
              title={editData ? 'Doctor Updated!' : 'Doctor Added!'}
              subtitle={`${saved.name} has been ${editData ? 'updated' : 'added to the medical staff'} and is now visible in the Doctors tab.`}
              details={[
                { label: 'Name', value: saved.name },
                { label: 'Specialty', value: saved.specialty },
                { label: 'Experience', value: saved.experience || 'Not specified' },
                { label: 'Phone', value: saved.phone || 'Not specified' },
                { label: 'Email', value: saved.email || 'Not specified' },
                { label: 'Status', value: saved.status },
              ]}
              onClose={handleClose}
              onAddAnother={editData ? undefined : handleAnother}
              addAnotherLabel="Add Another Doctor"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// SHARED UI COMPONENTS
// ─────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; dot: string; label: string }> = {
    'completed':    { bg: 'rgba(34,197,94,0.1)',   color: '#16a34a', dot: '#22c55e', label: 'Completed'    },
    'in-progress':  { bg: 'rgba(16,185,129,0.12)', color: '#059669', dot: '#10b981', label: 'In Progress'  },
    'upcoming':     { bg: 'rgba(37,99,235,0.1)',   color: '#2563eb', dot: '#3b82f6', label: 'Upcoming'     },
    'cancelled':    { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626', dot: '#ef4444', label: 'Cancelled'    },
    'active':       { bg: 'rgba(16,185,129,0.1)',  color: '#059669', dot: '#10b981', label: 'Active'       },
    'on-leave':     { bg: 'rgba(245,158,11,0.1)',  color: '#d97706', dot: '#f59e0b', label: 'On Leave'     },
    'in-treatment': { bg: 'rgba(124,58,237,0.1)',  color: '#7c3aed', dot: '#8b5cf6', label: 'In Treatment' },
    'monitoring':   { bg: 'rgba(8,145,178,0.1)',   color: '#0891b2', dot: '#06b6d4', label: 'Monitoring'   },
    'paid':         { bg: 'rgba(34,197,94,0.1)',   color: '#16a34a', dot: '#22c55e', label: 'Paid'         },
    'pending':      { bg: 'rgba(245,158,11,0.1)',  color: '#d97706', dot: '#f59e0b', label: 'Pending'      },
    'overdue':      { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626', dot: '#ef4444', label: 'Overdue'      },
    'inactive':     { bg: 'rgba(100,116,139,0.1)', color: '#64748b', dot: '#94a3b8', label: 'Inactive'     },
  };
  const s = map[status] ?? { bg: 'rgba(37,99,235,0.1)', color: C.blue, dot: C.blue, label: status };
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 50, background: s.bg, border: `1px solid ${s.dot}40` }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</span>
    </div>
  );
}

function Card({ children, style = {}, topBarGrad = GRAD.topBar }: { children: React.ReactNode; style?: React.CSSProperties; topBarGrad?: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: '28px', border: '1px solid #e8ecf0', boxShadow: '0 6px 30px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden', ...style }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: topBarGrad, borderRadius: '20px 20px 0 0' }} />
      {children}
    </div>
  );
}

function SectionHeader({ icon, gradient, title, subtitle, action }: { icon: string; gradient: string; title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 18, marginBottom: 22, borderBottom: '2px solid #e8ecf0', flexWrap: 'wrap', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 38, height: 38, background: gradient, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>{icon}</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.blueDark }}>{title}</div>
          <div style={{ fontSize: 12, color: C.textLight, marginTop: 1 }}>{subtitle}</div>
        </div>
      </div>
      {action}
    </div>
  );
}

function ActionBtn({ label, gradient = GRAD.primary, onClick, small = false }: { label: string; gradient?: string; onClick?: () => void; small?: boolean }) {
  return (
    <button onClick={onClick}
      style={{ padding: small ? '7px 14px' : '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: gradient, color: '#fff', fontSize: small ? 12 : 13, fontWeight: 700, boxShadow: '0 4px 14px rgba(37,99,235,0.2)', transition: 'all 0.2s ease', whiteSpace: 'nowrap' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.2)'; }}
    >
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────
function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }: { activeTab: string; setActiveTab: (t: string) => void; collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const sections = [
    { label: '📌 Main', items: [
      { id: 'overview', icon: '📊', label: 'Overview' },
      { id: 'appointments', icon: '📅', label: 'Appointments' },
      { id: 'patients', icon: '👥', label: 'Patients' },
      { id: 'doctors', icon: '👨‍⚕️', label: 'Doctors' },
      { id: 'analytics', icon: '📈', label: 'Analytics' },
    ]},
    { label: '⚙️ Manage', items: [
      { id: 'billing', icon: '💰', label: 'Billing' },
      { id: 'settings', icon: '⚙️', label: 'Settings' },
    ]},
  ];

  return (
    <motion.div animate={{ width: collapsed ? 68 : 240 }} transition={{ duration: 0.3 }}
      style={{ minHeight: '100vh', background: GRAD.hero, display: 'flex', flexDirection: 'column', padding: collapsed ? '24px 10px' : '24px 14px', flexShrink: 0, overflow: 'hidden', boxShadow: '4px 0 24px rgba(0,0,0,0.15)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #2563eb, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, boxShadow: '0 4px 12px rgba(37,99,235,0.4)' }}>🏥</div>
        {!collapsed && <div><div style={{ fontSize: 15, fontWeight: 900, color: '#fff', lineHeight: 1 }}>MediBook</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.2px', marginTop: 2 }}>Admin Portal</div></div>}
      </div>
      {!collapsed && (
        <div style={{ padding: '12px 14px', marginBottom: 24, background: 'rgba(255,255,255,0.07)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: GRAD.green, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏥</div>
            <div><div style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>Riverside Family Clinic</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Admin Account</div></div>
          </div>
        </div>
      )}
      <div style={{ flex: 1 }}>
        {sections.map(section => (
          <div key={section.label} style={{ marginBottom: 20 }}>
            {!collapsed && <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8, paddingLeft: 10 }}>{section.label}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {section.items.map((item, idx) => {
                const isActive = activeTab === item.id;
                return (
                  <motion.button key={item.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }} onClick={() => setActiveTab(item.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 11, justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '11px' : '11px 12px', borderRadius: 11, border: 'none', cursor: 'pointer', background: isActive ? 'rgba(255,255,255,0.14)' : 'transparent', borderLeft: isActive && !collapsed ? '3px solid #ffd700' : '3px solid transparent', transition: 'all 0.2s ease', width: '100%' }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                  >
                    <span style={{ fontSize: 17, flexShrink: 0 }}>{item.icon}</span>
                    {!collapsed && <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? '#fff' : 'rgba(255,255,255,0.65)', whiteSpace: 'nowrap' }}>{item.label}</span>}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <button onClick={() => setCollapsed(!collapsed)} style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 11, justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '11px' : '11px 12px', borderRadius: 11, border: 'none', cursor: 'pointer', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500, width: '100%' }}>
          <span style={{ fontSize: 17 }}>{collapsed ? '→' : '←'}</span>
          {!collapsed && <span>Collapse</span>}
        </button>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 11, justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '11px' : '11px 12px', borderRadius: 11, cursor: 'pointer', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
          <span style={{ fontSize: 17 }}>🏠</span>{!collapsed && <span>Back to Home</span>}
        </a>
        <a href="/login" style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 11, justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '11px' : '11px 12px', borderRadius: 11, cursor: 'pointer', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
          <span style={{ fontSize: 17 }}>🚪</span>{!collapsed && <span>Logout</span>}
        </a>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// TOP BAR
// ─────────────────────────────────────────────
function TopBar({ title, subtitle }: { title: string; subtitle: string }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const notifications = [
    { icon: '📅', msg: 'Robert Singh checked in for 10:30 AM', time: '2 min ago', unread: true },
    { icon: '⚠️', msg: 'Rachel Brown cancelled her 3:30 PM slot', time: '8 min ago', unread: true },
    { icon: '💰', msg: 'Invoice INV-2025-001 collected — $120', time: '14 min ago', unread: false },
    { icon: '👥', msg: 'New patient registered: Tom Harrison', time: '1h ago', unread: false },
  ];
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #e8ecf0', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: C.textPrimary, letterSpacing: '-0.5px' }}>{title}</h1>
        <p style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{subtitle}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 50, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>Clinic Live</span>
        </div>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setNotifOpen(!notifOpen)} style={{ width: 40, height: 40, borderRadius: 12, background: '#f0f4f8', border: '1px solid #e8ecf0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', position: 'relative' }}>
            🔔
            <div style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: '#ef4444', border: '2px solid #fff' }} />
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                style={{ position: 'absolute', top: 48, right: 0, zIndex: 200, background: '#fff', borderRadius: 18, width: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e8ecf0', overflow: 'hidden' }}
              >
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8ecf0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.textPrimary }}>Notifications</div>
                  <div style={{ padding: '3px 10px', borderRadius: 50, background: 'rgba(239,68,68,0.1)', color: '#dc2626', fontSize: 11, fontWeight: 700 }}>2 new</div>
                </div>
                {notifications.map((n, i) => (
                  <div key={i} style={{ padding: '14px 20px', borderBottom: i < notifications.length - 1 ? '1px solid #f0f4f8' : 'none', background: n.unread ? 'rgba(37,99,235,0.03)' : '#fff', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{n.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: n.unread ? 700 : 500, color: C.textPrimary, lineHeight: 1.4 }}>{n.msg}</div>
                      <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>{n.time}</div>
                    </div>
                    {n.unread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.blue, flexShrink: 0, marginTop: 4 }} />}
                  </div>
                ))}
                <div style={{ padding: '12px 20px', textAlign: 'center', cursor: 'pointer' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.blue }}>View all notifications →</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px 6px 6px', borderRadius: 50, background: '#f0f4f8', border: '1px solid #e8ecf0', cursor: 'pointer' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: GRAD.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>AF</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>Dr. Foster</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// OVERVIEW TAB
// ─────────────────────────────────────────────
function OverviewTab({ setActiveTab, appointments, openApptModal }: { setActiveTab: (t: string) => void; appointments: Appointment[]; openApptModal: () => void }) {
  const todayAppts = appointments.filter(a => a.date === TODAY);
  const todayRevenue = todayAppts.filter(a => a.status === 'completed').reduce((s, a) => s + a.fee, 0);
  const cancelledCount = todayAppts.filter(a => a.status === 'cancelled').length;
  const noShowRate = todayAppts.length ? ((cancelledCount / todayAppts.length) * 100).toFixed(1) : '0.0';

  const stats = [
    { label: "Today's Appointments", value: String(todayAppts.length || appointments.length), sub: `${appointments.filter(a => a.status === 'upcoming').length} upcoming`, icon: '📅', grad: GRAD.primary },
    { label: 'Active Patients', value: '1,284', sub: '+12 this week', icon: '👥', grad: GRAD.green },
    { label: 'No-show Rate', value: `${noShowRate}%`, sub: 'Down 61% ↓', icon: '📉', grad: GRAD.amber },
    { label: "Today's Revenue", value: `$${todayRevenue.toLocaleString()}`, sub: '+8% vs avg', icon: '💰', grad: GRAD.purple },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 20 }}>
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={{ background: '#fff', borderRadius: 20, padding: '24px', border: '1px solid #e8ecf0', boxShadow: '0 6px 30px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 14px 40px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 30px rgba(0,0,0,0.06)'; }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: s.grad, borderRadius: '20px 20px 0 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>{s.label}</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: C.textPrimary, lineHeight: 1, letterSpacing: '-1px' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 8 }}>{s.sub}</div>
              </div>
              <div style={{ width: 48, height: 48, background: s.grad, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>{s.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        <Card>
          <SectionHeader icon="📅" gradient={GRAD.primary} title="Today's Appointments" subtitle="Live clinic schedule"
            action={<ActionBtn label="+ New Appointment" small onClick={openApptModal} />}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {appointments.slice(0, 6).map((apt, i) => (
              <motion.div key={apt.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 14, background: apt.status === 'in-progress' ? 'rgba(16,185,129,0.06)' : '#f8fafc', border: apt.status === 'in-progress' ? '1px solid rgba(16,185,129,0.25)' : '1px solid #e8ecf0' }}
              >
                <div style={{ minWidth: 60, textAlign: 'center', padding: '6px', background: '#fff', borderRadius: 10, border: '1px solid #e8ecf0' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.textPrimary, lineHeight: 1 }}>{apt.time.split(' ')[0]}</div>
                  <div style={{ fontSize: 9, color: C.textLight, marginTop: 1 }}>{apt.time.split(' ')[1]}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{apt.patient}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{apt.doctor} · {apt.type}</div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <StatusPill status={apt.status} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.textPrimary, marginTop: 4, textAlign: 'right' }}>${apt.fee}</div>
                </div>
              </motion.div>
            ))}
            {appointments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px', color: C.textMuted }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>No appointments yet</div>
                <button onClick={openApptModal} style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: GRAD.primary, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Schedule First Appointment</button>
              </div>
            )}
          </div>
          <button onClick={() => setActiveTab('appointments')} style={{ width: '100%', marginTop: 14, padding: '10px', borderRadius: 12, border: '1px solid #e8ecf0', background: '#f8fafc', color: C.textMuted, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            View All {appointments.length} Appointments →
          </button>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card topBarGrad={GRAD.purple}>
            <SectionHeader icon="💰" gradient={GRAD.purple} title="Weekly Revenue" subtitle="This week" />
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80, marginBottom: 12 }}>
              {WEEKLY_REVENUE.map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', height: `${h}%`, background: i === 5 ? GRAD.primary : 'rgba(37,99,235,0.12)', borderRadius: '5px 5px 0 0' }} />
                  <span style={{ fontSize: 9, color: C.textLight, fontWeight: 600 }}>{['M','T','W','T','F','S','S'][i]}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e8ecf0' }}>
              <div><div style={{ fontSize: 11, color: C.textLight, fontWeight: 600 }}>Week Total</div><div style={{ fontSize: 22, fontWeight: 900, color: C.blueDark }}>$24,320</div></div>
              <div style={{ padding: '6px 12px', borderRadius: 50, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', fontSize: 13, fontWeight: 700, color: '#059669' }}>↑ 12%</div>
            </div>
          </Card>

          <Card topBarGrad={GRAD.amber}>
            <SectionHeader icon="⚡" gradient={GRAD.amber} title="Quick Actions" subtitle="Common tasks" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { icon: '➕', label: 'New Appointment', grad: GRAD.primary, action: () => openApptModal() },
                { icon: '👤', label: 'Add Patient', grad: GRAD.green, action: () => setActiveTab('patients') },
                { icon: '👨‍⚕️', label: 'Add Doctor', grad: GRAD.purple, action: () => setActiveTab('doctors') },
                { icon: '📊', label: 'Analytics', grad: GRAD.amber, action: () => setActiveTab('analytics') },
              ].map(a => (
                <button key={a.label} onClick={a.action}
                  style={{ padding: '12px 10px', borderRadius: 12, border: 'none', background: a.grad, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <span>{a.icon}</span>{a.label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// APPOINTMENTS TAB
// ─────────────────────────────────────────────
function AppointmentsTab({ appointments, setAppointments, doctors, patients, addToast }: {
  appointments: Appointment[]; setAppointments: (fn: (prev: Appointment[]) => Appointment[]) => void;
  doctors: Doctor[]; patients: Patient[]; addToast: (msg: string, type?: Toast['type']) => void;
}) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Appointment | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: Appointment | null }>({ open: false, item: null });

  const filtered = appointments.filter(a => {
    const matchFilter = filter === 'all' || a.status === filter;
    const matchSearch = !search || a.patient.toLowerCase().includes(search.toLowerCase()) || a.doctor.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleSave = (data: Appointment) => {
    if (editData) { setAppointments(prev => prev.map(a => a.id === data.id ? data : a)); }
    else { setAppointments(prev => [data, ...prev]); }
    setEditData(null);
  };

  const handleDelete = (apt: Appointment) => {
    setAppointments(prev => prev.filter(a => a.id !== apt.id));
    addToast(`Appointment for ${apt.patient} deleted.`, 'info');
  };

  const handleStatusChange = (id: string, status: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    addToast('Status updated successfully!', 'success');
  };

  return (
    <>
      <Card>
        <SectionHeader icon="📅" gradient={GRAD.primary} title="All Appointments" subtitle={`${appointments.length} total appointments`}
          action={<ActionBtn label="+ Schedule Appointment" onClick={() => { setEditData(null); setModalOpen(true); }} />}
        />
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>🔍</span>
            <input placeholder="Search patient, doctor, or type..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 12, border: '2px solid #e8ecf0', fontSize: 13, color: C.textPrimary, background: '#f8fafc', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s' }}
              onFocus={e => (e.target.style.border = `2px solid ${C.blue}`)} onBlur={e => (e.target.style.border = '2px solid #e8ecf0')}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['all','upcoming','in-progress','completed','cancelled'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '8px 14px', borderRadius: 50, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', background: filter === f ? GRAD.primary : '#f0f4f8', color: filter === f ? '#fff' : C.textMuted, transition: 'all 0.2s', textTransform: 'capitalize' }}>
                {f === 'all' ? 'All' : f.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total', value: appointments.length, color: C.blue },
            { label: 'Upcoming', value: appointments.filter(a => a.status === 'upcoming').length, color: C.blue },
            { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length, color: C.green },
            { label: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, color: C.red },
          ].map(s => (
            <div key={s.label} style={{ padding: '10px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e8ecf0', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: C.textLight, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Time & Date','Patient','Doctor','Type','Room','Fee','Status','Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '1px', padding: '10px 12px 10px 0', borderBottom: '2px solid #e8ecf0', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((apt, i) => (
                  <motion.tr key={apt.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ delay: i * 0.03 }} style={{ borderBottom: '1px solid #f0f4f8' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '13px 12px 13px 0' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>{apt.time}</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>{apt.date}</div>
                    </td>
                    <td style={{ padding: '13px 12px 13px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: GRAD.primary, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>
                          {apt.patient.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, whiteSpace: 'nowrap' }}>{apt.patient}</span>
                      </div>
                    </td>
                    <td style={{ padding: '13px 12px 13px 0', fontSize: 12, color: C.textMuted, whiteSpace: 'nowrap' }}>{apt.doctor}</td>
                    <td style={{ padding: '13px 12px 13px 0', fontSize: 12, color: C.textMuted, whiteSpace: 'nowrap' }}>{apt.type}</td>
                    <td style={{ padding: '13px 12px 13px 0' }}>
                      <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, background: '#f0f4f8', fontSize: 11, fontWeight: 700, color: C.textMuted }}>{apt.room}</div>
                    </td>
                    <td style={{ padding: '13px 12px 13px 0', fontSize: 13, fontWeight: 800, color: C.textPrimary }}>${apt.fee}</td>
                    <td style={{ padding: '13px 12px 13px 0' }}>
                      <select value={apt.status} onChange={e => handleStatusChange(apt.id, e.target.value)}
                        style={{ padding: '5px 8px', borderRadius: 8, border: '1px solid #e8ecf0', fontSize: 11, fontWeight: 700, cursor: 'pointer', background: '#f8fafc', outline: 'none' }}>
                        {['upcoming','in-progress','completed','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '13px 0' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => { setEditData(apt); setModalOpen(true); }} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: GRAD.primary, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => setDeleteModal({ open: true, item: apt })} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', color: C.red, fontSize: 11, cursor: 'pointer' }}>🗑️</button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: C.textMuted }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No appointments found</div>
              <div style={{ fontSize: 14, marginBottom: 16 }}>Adjust your filters or schedule a new appointment</div>
              <button onClick={() => { setEditData(null); setModalOpen(true); }} style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: GRAD.primary, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Schedule Appointment</button>
            </div>
          )}
        </div>
      </Card>

      <AppointmentModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditData(null); }} onSave={handleSave} doctors={doctors} patients={patients} editData={editData} />
      <DeleteModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, item: null })} onConfirm={() => deleteModal.item && handleDelete(deleteModal.item)} itemName={deleteModal.item?.patient || ''} itemType="Appointment" />
    </>
  );
}

// ─────────────────────────────────────────────
// PATIENTS TAB
// ─────────────────────────────────────────────
function PatientsTab({ patients, setPatients, addToast }: {
  patients: Patient[]; setPatients: (fn: (prev: Patient[]) => Patient[]) => void; addToast: (msg: string, type?: Toast['type']) => void;
}) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Patient | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: Patient | null }>({ open: false, item: null });

  const filtered = patients.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.condition.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search));
  const selectedPatient = patients.find(p => p.id === selected);

  const handleSave = (data: Patient) => {
    if (editData) { setPatients(prev => prev.map(p => p.id === data.id ? data : p)); }
    else { setPatients(prev => [data, ...prev]); }
    setEditData(null);
  };

  const handleDelete = (patient: Patient) => {
    setPatients(prev => prev.filter(p => p.id !== patient.id));
    if (selected === patient.id) setSelected(null);
    addToast(`${patient.name} removed from records.`, 'info');
  };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 24 }}>
        <Card>
          <SectionHeader icon="👥" gradient={GRAD.green} title="Patient Records" subtitle={`${patients.length} registered patients`}
            action={<ActionBtn label="+ Add Patient" gradient={GRAD.green} onClick={() => { setEditData(null); setModalOpen(true); }} />}
          />
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>🔍</span>
            <input placeholder="Search by name, condition, or phone..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 12, border: '2px solid #e8ecf0', fontSize: 13, color: C.textPrimary, background: '#f8fafc', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s' }}
              onFocus={e => (e.target.style.border = `2px solid ${C.green}`)} onBlur={e => (e.target.style.border = '2px solid #e8ecf0')}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <AnimatePresence>
              {filtered.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ delay: i * 0.04 }}
                  onClick={() => setSelected(selected === p.id ? null : p.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 16, background: selected === p.id ? 'rgba(37,99,235,0.04)' : '#f8fafc', border: selected === p.id ? `2px solid ${C.blue}` : '1px solid #e8ecf0', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onMouseEnter={e => { if (selected !== p.id) (e.currentTarget as HTMLDivElement).style.background = '#f0f4f8'; }}
                  onMouseLeave={e => { if (selected !== p.id) (e.currentTarget as HTMLDivElement).style.background = '#f8fafc'; }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: GRAD.green, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15, fontWeight: 700, boxShadow: '0 3px 10px rgba(5,150,105,0.25)' }}>
                    {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>{p.name}</span>
                      <span style={{ fontSize: 11, color: C.textMuted }}>Age {p.age}</span>
                      {p.bloodType && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 50, background: 'rgba(239,68,68,0.1)', color: C.red, fontWeight: 700 }}>{p.bloodType}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: C.textMuted, flexWrap: 'wrap' }}>
                      <span>📋 {p.condition}</span>
                      <span>📊 {p.visits} visits</span>
                      <span>📞 {p.phone}</span>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusPill status={p.status} />
                    <button onClick={e => { e.stopPropagation(); setEditData(p); setModalOpen(true); }} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e8ecf0', background: '#fff', color: C.textMuted, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                    <button onClick={e => { e.stopPropagation(); setDeleteModal({ open: true, item: p }); }} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: C.red, fontSize: 11, cursor: 'pointer' }}>🗑️</button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: C.textMuted }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>👥</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>No patients found</div>
                <button onClick={() => { setEditData(null); setModalOpen(true); }} style={{ marginTop: 10, padding: '8px 18px', borderRadius: 10, border: 'none', background: GRAD.green, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Add First Patient</button>
              </div>
            )}
          </div>
        </Card>

        <AnimatePresence>
          {selectedPatient && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <Card topBarGrad={GRAD.green} style={{ position: 'sticky', top: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.blueDark }}>Patient Profile</div>
                  <button onClick={() => setSelected(null)} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #e8ecf0', background: '#f0f4f8', cursor: 'pointer', fontSize: 14, color: C.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: GRAD.green, margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 700, boxShadow: '0 8px 24px rgba(5,150,105,0.3)' }}>
                    {selectedPatient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: C.textPrimary }}>{selectedPatient.name}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Age {selectedPatient.age} · {selectedPatient.phone}</div>
                  <div style={{ marginTop: 8 }}><StatusPill status={selectedPatient.status} /></div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {[
                    { label: 'Condition', value: selectedPatient.condition, icon: '📋' },
                    { label: 'Last Visit', value: selectedPatient.lastVisit, icon: '🕐' },
                    { label: 'Total Visits', value: `${selectedPatient.visits} consultations`, icon: '📊' },
                    { label: 'Blood Type', value: selectedPatient.bloodType || 'Not recorded', icon: '🩸' },
                    { label: 'Email', value: selectedPatient.email || 'Not recorded', icon: '📧' },
                    { label: 'Address', value: selectedPatient.address || 'Not recorded', icon: '📍' },
                  ].map(f => (
                    <div key={f.label} style={{ padding: '9px 12px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e8ecf0' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 2 }}>{f.icon} {f.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, wordBreak: 'break-word' }}>{f.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <ActionBtn label="✏️ Edit Patient" onClick={() => { setEditData(selectedPatient); setModalOpen(true); }} />
                  <button onClick={() => setDeleteModal({ open: true, item: selectedPatient })} style={{ padding: '10px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', color: C.red, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>🗑️ Remove Patient</button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PatientModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditData(null); }} onSave={handleSave} editData={editData} />
      <DeleteModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, item: null })} onConfirm={() => deleteModal.item && handleDelete(deleteModal.item)} itemName={deleteModal.item?.name || ''} itemType="Patient" />
    </>
  );
}

// ─────────────────────────────────────────────
// DOCTORS TAB
// ─────────────────────────────────────────────
function DoctorsTab({ doctors, setDoctors, addToast }: {
  doctors: Doctor[]; setDoctors: (fn: (prev: Doctor[]) => Doctor[]) => void; addToast: (msg: string, type?: Toast['type']) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Doctor | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: Doctor | null }>({ open: false, item: null });

  const handleSave = (data: Doctor) => {
    if (editData) { setDoctors(prev => prev.map(d => d.id === data.id ? data : d)); }
    else { setDoctors(prev => [data, ...prev]); }
    setEditData(null);
  };

  const handleDelete = (doctor: Doctor) => {
    setDoctors(prev => prev.filter(d => d.id !== doctor.id));
    addToast(`${doctor.name} removed from staff.`, 'info');
  };

  const handleStatusToggle = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'on-leave' : 'active';
    setDoctors(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
    addToast('Doctor status updated.', 'success');
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Summary bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          {[
            { label: 'Total Doctors', value: doctors.length, icon: '👨‍⚕️', grad: GRAD.primary },
            { label: 'Active Today', value: doctors.filter(d => d.status === 'active').length, icon: '✅', grad: GRAD.green },
            { label: 'On Leave', value: doctors.filter(d => d.status === 'on-leave').length, icon: '🏖️', grad: GRAD.amber },
            { label: 'Avg Rating', value: doctors.length ? (doctors.reduce((s, d) => s + d.rating, 0) / doctors.length).toFixed(1) : '—', icon: '⭐', grad: GRAD.purple },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card style={{ padding: '18px 20px' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.grad, borderRadius: '20px 20px 0 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: C.textPrimary }}>{s.value}</div>
                  </div>
                  <div style={{ width: 38, height: 38, background: s.grad, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <SectionHeader icon="👨‍⚕️" gradient={GRAD.primary} title="Medical Staff" subtitle={`${doctors.length} doctors registered`}
            action={<ActionBtn label="+ Add Doctor" onClick={() => { setEditData(null); setModalOpen(true); }} />}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            <AnimatePresence>
              {doctors.map((doc, i) => (
                <motion.div key={doc.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.06 }}
                  style={{ background: '#f8fafc', borderRadius: 18, padding: '20px', border: '1px solid #e8ecf0', transition: 'all 0.25s ease', position: 'relative', overflow: 'hidden' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLDivElement).style.background = '#fff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.background = '#f8fafc'; }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: doc.grad, borderRadius: '18px 18px 0 0' }} />
                  <div style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 54, height: 54, borderRadius: 16, flexShrink: 0, background: doc.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>{doc.initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: C.textPrimary, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</div>
                      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>{doc.specialty}</div>
                      {doc.experience && <div style={{ fontSize: 11, color: C.textLight }}>📅 {doc.experience}</div>}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: 2 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 10, color: s <= Math.floor(doc.rating) ? '#f59e0b' : '#e8ecf0' }}>★</span>)}</div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.textPrimary }}>{doc.rating}</span>
                        <StatusPill status={doc.status} />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                    {[
                      { label: 'Patients', value: doc.patients },
                      { label: 'Revenue', value: doc.status === 'on-leave' ? '—' : `$${doc.revenue}` },
                      { label: 'Utilization', value: doc.status === 'on-leave' ? 'Leave' : `${doc.utilization}%` },
                    ].map(s => (
                      <div key={s.label} style={{ padding: '8px', borderRadius: 10, background: '#fff', border: '1px solid #e8ecf0', textAlign: 'center' }}>
                        <div style={{ fontSize: 9, color: C.textLight, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{s.label}</div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: C.textPrimary }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                  {doc.email && <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📧 {doc.email}</div>}
                  {doc.phone && <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 10 }}>📞 {doc.phone}</div>}
                  {doc.status !== 'on-leave' && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.textMuted, marginBottom: 4 }}>
                        <span>Capacity</span><span style={{ fontWeight: 700, color: doc.utilization >= 80 ? '#059669' : C.blue }}>{doc.utilization}%</span>
                      </div>
                      <div style={{ height: 5, background: '#f0f4f8', borderRadius: 3 }}>
                        <div style={{ height: '100%', width: `${doc.utilization}%`, background: doc.utilization >= 80 ? GRAD.green : GRAD.primary, borderRadius: 3, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setEditData(doc); setModalOpen(true); }} style={{ flex: 1, padding: '9px', borderRadius: 10, background: GRAD.primary, border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✏️ Edit</button>
                    <button onClick={() => handleStatusToggle(doc.id, doc.status)} style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid #e8ecf0', background: '#fff', color: C.textMuted, fontSize: 12, cursor: 'pointer' }} title={doc.status === 'active' ? 'Set On Leave' : 'Set Active'}>
                      {doc.status === 'active' ? '🏖️' : '✅'}
                    </button>
                    <button onClick={() => setDeleteModal({ open: true, item: doc })} style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: C.red, fontSize: 12, cursor: 'pointer' }}>🗑️</button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add new card */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: doctors.length * 0.06 }}
              onClick={() => { setEditData(null); setModalOpen(true); }}
              style={{ background: '#f8fafc', borderRadius: 18, padding: '20px', border: '2px dashed #e8ecf0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 220, gap: 12, transition: 'all 0.25s ease' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.blue; (e.currentTarget as HTMLDivElement).style.background = 'rgba(37,99,235,0.03)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#e8ecf0'; (e.currentTarget as HTMLDivElement).style.background = '#f8fafc'; }}
            >
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(37,99,235,0.08)', border: `2px dashed ${C.blue}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>➕</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.blue }}>Add New Doctor</div>
              <div style={{ fontSize: 12, color: C.textLight, textAlign: 'center' }}>Click to register a new medical staff member</div>
            </motion.div>
          </div>
        </Card>
      </div>

      <DoctorModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditData(null); }} onSave={handleSave} editData={editData} />
      <DeleteModal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, item: null })} onConfirm={() => deleteModal.item && handleDelete(deleteModal.item)} itemName={deleteModal.item?.name || ''} itemType="Doctor" />
    </>
  );
}

// ─────────────────────────────────────────────
// ANALYTICS TAB
// ─────────────────────────────────────────────
function AnalyticsTab({ appointments, patients, doctors }: { appointments: Appointment[]; patients: Patient[]; doctors: Doctor[] }) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun'];
  const revenueData = [68,74,65,88,92,85];
  const noShowData = [12,10,9,7,5,4.2];
  const totalRevenue = appointments.filter(a => a.status === 'completed').reduce((s, a) => s + a.fee, 0);
  const completionRate = appointments.length ? Math.round((appointments.filter(a => a.status === 'completed').length / appointments.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: '+18%', icon: '💰', grad: GRAD.primary },
          { label: 'Total Appointments', value: appointments.length.toString(), change: '+22%', icon: '📅', grad: GRAD.green },
          { label: 'Registered Patients', value: patients.length.toString(), change: '+31%', icon: '👥', grad: GRAD.purple },
          { label: 'Completion Rate', value: `${completionRate}%`, change: '+5%', icon: '✅', grad: GRAD.amber },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: k.grad, borderRadius: '20px 20px 0 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>{k.label}</div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: C.textPrimary, letterSpacing: '-0.5px' }}>{k.value}</div>
                  <div style={{ fontSize: 12, color: '#059669', fontWeight: 700, marginTop: 6 }}>{k.change} vs last month</div>
                </div>
                <div style={{ width: 44, height: 44, background: k.grad, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>{k.icon}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        <Card topBarGrad={GRAD.primary}>
          <SectionHeader icon="📈" gradient={GRAD.primary} title="Revenue Trend" subtitle="Jan – Jun 2025" />
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 130, marginBottom: 12 }}>
            {revenueData.map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 600 }}>${h}k</div>
                <div style={{ width: '100%', height: `${(h / 100) * 100}%`, background: i === 4 ? GRAD.primary : 'rgba(37,99,235,0.12)', borderRadius: '6px 6px 0 0' }} />
                <span style={{ fontSize: 11, color: C.textLight, fontWeight: 600 }}>{months[i]}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#f8fafc', borderRadius: 14, border: '1px solid #e8ecf0' }}>
            <div><div style={{ fontSize: 11, color: C.textLight, fontWeight: 600 }}>6-Month Total</div><div style={{ fontSize: 26, fontWeight: 900, color: C.blueDark }}>$472,000</div></div>
            <div style={{ padding: '8px 14px', borderRadius: 50, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', fontSize: 13, fontWeight: 700, color: '#059669' }}>↑ 18% growth</div>
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card topBarGrad={GRAD.green}>
            <SectionHeader icon="📉" gradient={GRAD.green} title="No-show Rate" subtitle="Jan – Jun 2025" />
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 60, marginBottom: 10 }}>
              {noShowData.map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div style={{ width: '100%', height: `${(h / 15) * 100}%`, background: i === 5 ? GRAD.green : 'rgba(16,185,129,0.2)', borderRadius: '4px 4px 0 0' }} />
                  <span style={{ fontSize: 8, color: C.textLight }}>{months[i].slice(0, 1)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: C.textMuted }}>Current rate</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#059669' }}>4.2% ↓</span>
            </div>
          </Card>

          <Card topBarGrad={GRAD.purple}>
            <SectionHeader icon="🏥" gradient={GRAD.purple} title="By Specialty" subtitle="This month" />
            {[
              { name: 'General Medicine', pct: 42, count: 108 },
              { name: 'Cardiology', pct: 28, count: 72 },
              { name: 'Pediatrics', pct: 18, count: 46 },
              { name: 'Orthopedics', pct: 12, count: 30 },
            ].map((s, i) => (
              <div key={s.name} style={{ marginBottom: i < 3 ? 12 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary }}>{s.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.textMuted }}>{s.count} appts</span>
                </div>
                <div style={{ height: 6, background: '#f0f4f8', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${s.pct}%`, background: [GRAD.primary, GRAD.green, GRAD.purple, GRAD.amber][i], borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// BILLING TAB
// ─────────────────────────────────────────────
function BillingTab({ appointments }: { appointments: Appointment[] }) {
  const invoices = [
    { id: 'INV-2025-001', patient: 'James Doe',   doctor: 'Dr. Mitchell',  amount: 120, date: 'May 19', status: 'paid'    },
    { id: 'INV-2025-002', patient: 'Maria Chen',   doctor: 'Dr. Rodriguez', amount: 90,  date: 'May 19', status: 'paid'    },
    { id: 'INV-2025-003', patient: 'Robert Singh', doctor: 'Dr. Patel',     amount: 150, date: 'May 19', status: 'pending' },
    { id: 'INV-2025-004', patient: 'Sarah Kim',    doctor: 'Dr. Kim',       amount: 140, date: 'May 19', status: 'pending' },
    { id: 'INV-2025-005', patient: 'Rachel Brown', doctor: 'Dr. Patel',     amount: 150, date: 'May 18', status: 'overdue' },
  ];
  const totalRevenue = appointments.filter(a => a.status === 'completed').reduce((s, a) => s + a.fee, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
        {[
          { label: 'Collected Today', value: `$${totalRevenue.toLocaleString()}`, icon: '✅', grad: GRAD.green },
          { label: 'Pending', value: '$1,240', icon: '⏳', grad: GRAD.amber },
          { label: 'Overdue', value: '$450', icon: '⚠️', grad: GRAD.red },
          { label: 'Monthly Total', value: '$98,240', icon: '💰', grad: GRAD.primary },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: s.grad, borderRadius: '20px 20px 0 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>{s.label}</div><div style={{ fontSize: 26, fontWeight: 900, color: C.textPrimary }}>{s.value}</div></div>
                <div style={{ width: 44, height: 44, background: s.grad, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.icon}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      <Card>
        <SectionHeader icon="💳" gradient={GRAD.primary} title="Recent Invoices" subtitle="Billing records"
          action={<ActionBtn label="Export CSV" gradient="linear-gradient(135deg,#64748b,#94a3b8)" small />}
        />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr><th colSpan={7} style={{ padding: 0 }}></th></tr>
              <tr>
                {['Invoice','Patient','Doctor','Amount','Date','Status',''].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '1px', paddingBottom: 12, borderBottom: '1px solid #e8ecf0', paddingRight: 12, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => (
                <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} style={{ borderBottom: '1px solid #f0f4f8' }}>
                  <td style={{ padding: '13px 12px 13px 0', fontSize: 12, fontWeight: 700, color: C.blue, fontFamily: 'monospace' }}>{inv.id}</td>
                  <td style={{ padding: '13px 12px 13px 0', fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{inv.patient}</td>
                  <td style={{ padding: '13px 12px 13px 0', fontSize: 13, color: C.textMuted }}>{inv.doctor}</td>
                  <td style={{ padding: '13px 12px 13px 0', fontSize: 14, fontWeight: 800, color: C.textPrimary }}>${inv.amount}</td>
                  <td style={{ padding: '13px 12px 13px 0', fontSize: 12, color: C.textMuted }}>{inv.date}</td>
                  <td style={{ padding: '13px 12px 13px 0' }}><StatusPill status={inv.status} /></td>
                  <td style={{ padding: '13px 0' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {inv.status === 'pending' && <button style={{ padding: '5px 12px', borderRadius: 8, border: 'none', background: GRAD.green, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Collect</button>}
                      {inv.status === 'overdue' && <button style={{ padding: '5px 12px', borderRadius: 8, border: 'none', background: GRAD.red, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Remind</button>}
                      <button style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #e8ecf0', background: '#fff', color: C.textMuted, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>View</button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// SETTINGS TAB
// ─────────────────────────────────────────────
function SettingsTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
      <Card>
        <SectionHeader icon="🏥" gradient={GRAD.primary} title="Clinic Profile" subtitle="Basic clinic information" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Clinic Name', value: 'Riverside Family Clinic', icon: '🏥' },
            { label: 'Admin Name', value: 'Dr. Amanda Foster', icon: '👤' },
            { label: 'Email', value: 'admin@riverside-clinic.com', icon: '📧' },
            { label: 'Phone', value: '+1 (555) 200-3000', icon: '📞' },
            { label: 'Address', value: '450 Riverside Drive, NY', icon: '📍' },
            { label: 'Plan', value: 'Clinic Plan · $249/mo', icon: '💎' },
          ].map(f => (
            <div key={f.label} style={{ padding: '11px 13px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e8ecf0' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 3 }}>{f.icon} {f.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>{f.value}</div>
            </div>
          ))}
          <ActionBtn label="Update Profile" />
        </div>
      </Card>
      <Card topBarGrad={GRAD.green}>
        <SectionHeader icon="🔔" gradient={GRAD.green} title="Notifications" subtitle="Reminder configuration" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'SMS reminders to patients', enabled: true },
            { label: 'Email reminders to patients', enabled: true },
            { label: '48h appointment reminders', enabled: true },
            { label: '24h appointment reminders', enabled: true },
            { label: '2h appointment reminders', enabled: false },
            { label: 'No-show notifications', enabled: true },
          ].map(setting => (
            <div key={setting.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 13px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e8ecf0' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{setting.label}</span>
              <div style={{ width: 44, height: 24, borderRadius: 50, background: setting.enabled ? GRAD.green : '#e8ecf0', cursor: 'pointer', position: 'relative', transition: 'all 0.2s' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: setting.enabled ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card topBarGrad={GRAD.purple}>
        <SectionHeader icon="🔒" gradient={GRAD.purple} title="Security" subtitle="Access & compliance" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Two-Factor Authentication', value: 'Enabled', good: true },
            { label: 'HIPAA-Ready Architecture', value: 'Active', good: true },
            { label: 'Audit Log', value: 'Enabled', good: true },
            { label: 'Data Encryption (AES-256)', value: 'Active', good: true },
            { label: 'Last Security Review', value: 'May 1, 2025', good: true },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 13px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e8ecf0' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{item.label}</span>
              <div style={{ padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700, background: item.good ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: item.good ? '#059669' : '#dc2626', border: `1px solid ${item.good ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }}>{item.value}</div>
            </div>
          ))}
          <ActionBtn label="Download Compliance Report" gradient={GRAD.purple} />
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [apptModalOpen, setApptModalOpen] = useState(false);

  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('medibook_appointments', DEFAULT_APPOINTMENTS);
  const [patients, setPatients] = useLocalStorage<Patient[]>('medibook_patients', DEFAULT_PATIENTS);
  const [doctors, setDoctors] = useLocalStorage<Doctor[]>('medibook_doctors', DEFAULT_DOCTORS);

  const { toasts, addToast, removeToast } = useToast();

  const handleSaveAppointment = (data: Appointment) => {
    const exists = appointments.find(a => a.id === data.id);
    if (exists) { setAppointments(prev => prev.map(a => a.id === data.id ? data : a)); }
    else { setAppointments(prev => [data, ...prev]); }
  };

  const tabMeta: Record<string, { title: string; subtitle: string }> = {
    overview:     { title: 'Clinic Overview',   subtitle: `Riverside Family Clinic · ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` },
    appointments: { title: 'Appointments',       subtitle: `${appointments.length} total appointments` },
    patients:     { title: 'Patient Records',    subtitle: `${patients.length} registered patients` },
    doctors:      { title: 'Medical Staff',      subtitle: `${doctors.length} doctors · ${doctors.filter(d => d.status === 'active').length} active today` },
    analytics:    { title: 'Clinic Analytics',   subtitle: 'Performance data Jan – Jun 2025' },
    billing:      { title: 'Billing & Invoices', subtitle: "Today's financial summary" },
    settings:     { title: 'Clinic Settings',    subtitle: 'Profile, notifications, and security' },
  };

  const current = tabMeta[activeTab] ?? tabMeta.overview;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f0f4f8; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: C.page, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} collapsed={collapsed} setCollapsed={setCollapsed} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', minWidth: 0 }}>
          <TopBar title={current.title} subtitle={current.subtitle} />

          <div style={{ flex: 1, padding: '28px 32px', minHeight: 0 }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                {activeTab === 'overview' && <OverviewTab setActiveTab={setActiveTab} appointments={appointments} openApptModal={() => setApptModalOpen(true)} />}
                {activeTab === 'appointments' && <AppointmentsTab appointments={appointments} setAppointments={setAppointments} doctors={doctors} patients={patients} addToast={addToast} />}
                {activeTab === 'patients' && <PatientsTab patients={patients} setPatients={setPatients} addToast={addToast} />}
                {activeTab === 'doctors' && <DoctorsTab doctors={doctors} setDoctors={setDoctors} addToast={addToast} />}
                {activeTab === 'analytics' && <AnalyticsTab appointments={appointments} patients={patients} doctors={doctors} />}
                {activeTab === 'billing' && <BillingTab appointments={appointments} />}
                {activeTab === 'settings' && <SettingsTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Global appointment modal from overview */}
      <AppointmentModal isOpen={apptModalOpen} onClose={() => setApptModalOpen(false)} onSave={handleSaveAppointment} doctors={doctors} patients={patients} editData={null} />

      {/* Toasts */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}