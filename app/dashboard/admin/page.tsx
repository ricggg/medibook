"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

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

const GRAD_OPTIONS = [
  GRAD.primary, GRAD.green, GRAD.purple, GRAD.amber, GRAD.red,
];

const TODAY = new Date().toISOString().split('T')[0];

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface Appointment {
  id: string;
  time: string;
  patient_name: string;
  doctor_name: string;
  type: string;
  status: string;
  room: string;
  fee: number;
  date: string;
  notes?: string;
  doctor_id?: string;
  patient_id?: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  last_visit: string;
  condition: string;
  status: string;
  visits: number;
  blood_type?: string;
  address?: string;
  assigned_doctor_id?: string;
  profile_id?: string;
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
  profile_id?: string;
}

interface Clinic {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

type CreateUserRole = 'doctor' | 'patient';
type CreateUserApiUser = { id: string; email: string; role: CreateUserRole };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function getApiErrorMessage(json: unknown, fallback: string) {
  if (isRecord(json) && typeof json.error === 'string' && json.error.trim()) return json.error;
  return fallback;
}

async function createPortalUser(payload: {
  fullName: string;
  email: string;
  password: string;
  role: CreateUserRole;
}): Promise<CreateUserApiUser> {
  const res = await fetch('/api/admin/create-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(getApiErrorMessage(json, 'Failed to create user account.'));
  }

  if (!isRecord(json) || json.ok !== true || !isRecord(json.user)) {
    throw new Error('Unexpected server response. Please try again.');
  }

  const u = json.user;

  if (typeof u.id !== 'string' || typeof u.email !== 'string') {
    throw new Error('Invalid user data returned from server.');
  }

  if (u.role !== 'doctor' && u.role !== 'patient') {
    throw new Error('Invalid role returned from server.');
  }

  return { id: u.id, email: u.email, role: u.role };
}

// ─────────────────────────────────────────────
// TOAST HOOK
// ─────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  const removeToast = useCallback((id: string) =>
    setToasts(prev => prev.filter(t => t.id !== id)), []);
  return { toasts, addToast, removeToast };
}

// ─────────────────────────────────────────────
// TOAST CONTAINER
// ─────────────────────────────────────────────
function ToastContainer({
  toasts, removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 99999,
      display: 'flex', flexDirection: 'column', gap: 10,
      pointerEvents: 'none',
    }}>
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
              background: toast.type === 'success'
                ? GRAD.green : toast.type === 'error'
                ? GRAD.red : GRAD.primary,
              color: '#fff', fontSize: 14, fontWeight: 600,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              display: 'flex', alignItems: 'center', gap: 10,
              minWidth: 300, cursor: 'pointer', pointerEvents: 'all',
            }}
          >
            <span style={{ fontSize: 20 }}>
              {toast.type === 'success' ? '✅'
                : toast.type === 'error' ? '❌' : 'ℹ️'}
            </span>
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
function LoadingSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px 0', gap: 20,
    }}>
      <div style={{ position: 'relative', width: 72, height: 72 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 72, height: 72, borderRadius: '50%',
            border: '4px solid #e8ecf0',
            borderTop: `4px solid ${C.blue}`,
            position: 'absolute',
          }}
        />
        <div style={{
          position: 'absolute', inset: 8, borderRadius: '50%',
          background: 'rgba(37,99,235,0.08)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 22,
        }}>
          🏥
        </div>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}>
        {label}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE LOADER
// ─────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: C.page,
      flexDirection: 'column', gap: 24,
    }}>
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 80, height: 80, borderRadius: '50%',
            border: '4px solid #e8ecf0',
            borderTop: `4px solid ${C.blue}`, position: 'absolute',
          }}
        />
        <div style={{
          position: 'absolute', inset: 10, borderRadius: '50%',
          background: GRAD.primary,
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 26,
        }}>
          🏥
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: 20, fontWeight: 900, color: C.textPrimary, marginBottom: 6,
        }}>
          MediBook Admin
        </div>
        <div style={{ fontSize: 14, color: C.textMuted }}>
          Loading clinic data...
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i}
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
            style={{
              width: 8, height: 8, borderRadius: '50%', background: C.blue,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SUCCESS SCREEN
// ─────────────────────────────────────────────
function SuccessScreen({
  title, subtitle, details, onClose, onAddAnother, addAnotherLabel = 'Add Another',
}: {
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
      style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '32px 16px', textAlign: 'center',
      }}
    >
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 14, stiffness: 200, delay: 0.1 }}
        style={{
          width: 88, height: 88, borderRadius: '50%',
          background: GRAD.green, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 40, marginBottom: 24,
          boxShadow: '0 12px 40px rgba(16,185,129,0.4)',
          color: '#fff', fontWeight: 900,
        }}
      >
        ✓
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div style={{
          fontSize: 24, fontWeight: 900, color: C.textPrimary, marginBottom: 8,
        }}>
          {title}
        </div>
        <div style={{
          fontSize: 15, color: C.textMuted, marginBottom: 24, lineHeight: 1.6,
        }}>
          {subtitle}
        </div>
      </motion.div>
      {details && details.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{
            width: '100%', background: '#f8fafc', borderRadius: 16,
            padding: '16px 20px', border: '1px solid #e8ecf0',
            marginBottom: 28, textAlign: 'left',
          }}
        >
          {details.map((d, i) => (
            <div key={d.label} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '8px 0',
              borderBottom: i < details.length - 1 ? '1px solid #e8ecf0' : 'none',
            }}>
              <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 500 }}>
                {d.label}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>
                {d.value}
              </span>
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
          <button onClick={onAddAnother} style={{
            flex: 1, padding: '13px', borderRadius: 12,
            border: `2px solid ${C.blue}`, background: 'transparent',
            color: C.blue, fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}>
            ➕ {addAnotherLabel}
          </button>
        )}
        <button onClick={onClose} style={{
          flex: 1, padding: '13px', borderRadius: 12, border: 'none',
          background: GRAD.primary, color: '#fff', fontSize: 14,
          fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
        }}>
          ✓ Done
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// MODAL WRAPPER
// ─────────────────────────────────────────────
function Modal({
  isOpen, onClose, title, children, width = 580, step,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
  step?: 'form' | 'loading' | 'success';
}) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step !== 'loading') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, step]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99990,
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '20px',
        }}>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => step !== 'loading' && onClose()}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(10,20,40,0.65)',
              backdropFilter: 'blur(6px)',
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 30 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            style={{
              position: 'relative', zIndex: 1, width: '100%',
              maxWidth: width, background: '#fff', borderRadius: 24,
              boxShadow: '0 40px 100px rgba(0,0,0,0.3)',
              overflow: 'hidden', maxHeight: '92vh',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {step === 'form' && (
              <div style={{
                padding: '18px 24px', background: GRAD.primary,
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', flexShrink: 0,
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>
                  {title}
                </div>
                <button
                  onClick={onClose}
                  style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: 'rgba(255,255,255,0.15)', border: 'none',
                    color: '#fff', fontSize: 18, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.background = 'rgba(239,68,68,0.5)')}
                  onMouseLeave={e =>
                    (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                >
                  ✕
                </button>
              </div>
            )}
            <div style={{
              overflowY: 'auto', flex: 1,
              padding: step === 'form' ? '24px' : '0',
            }}>
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
function FormField({
  label, value, onChange, type = 'text', options,
  required, placeholder, icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  icon?: string;
}) {
  const base: React.CSSProperties = {
    width: '100%', padding: '10px 13px', borderRadius: 10,
    border: '2px solid #e8ecf0', fontSize: 14, color: C.textPrimary,
    background: '#f8fafc', outline: 'none', boxSizing: 'border-box',
    fontFamily: "'Segoe UI', system-ui, sans-serif", transition: 'all 0.2s',
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 700,
        color: C.textMuted, textTransform: 'uppercase',
        letterSpacing: '0.8px', marginBottom: 5,
      }}>
        {icon} {label}{required && <span style={{ color: C.red }}> *</span>}
      </label>
      {options ? (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ ...base, cursor: 'pointer' }}
          onFocus={e => {
            e.target.style.border = `2px solid ${C.blue}`;
            e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
          }}
          onBlur={e => {
            e.target.style.border = '2px solid #e8ecf0';
            e.target.style.boxShadow = 'none';
          }}
        >
          <option value="">Select {label}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          style={base}
          onFocus={e => {
            e.target.style.border = `2px solid ${C.blue}`;
            e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
          }}
          onBlur={e => {
            e.target.style.border = '2px solid #e8ecf0';
            e.target.style.boxShadow = 'none';
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// STATUS PILL
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
    'inactive':     { bg: 'rgba(100,116,139,0.1)', color: '#64748b', dot: '#94a3b8', label: 'Inactive'     },
    'paid':         { bg: 'rgba(34,197,94,0.1)',   color: '#16a34a', dot: '#22c55e', label: 'Paid'         },
    'pending':      { bg: 'rgba(245,158,11,0.1)',  color: '#d97706', dot: '#f59e0b', label: 'Pending'      },
  };
  const s = map[status] ?? {
    bg: 'rgba(37,99,235,0.1)', color: C.blue, dot: C.blue, label: status,
  };
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 50,
      background: s.bg, border: `1px solid ${s.dot}40`,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%',
        background: s.dot, display: 'inline-block',
      }} />
      <span style={{
        fontSize: 10, fontWeight: 700, color: s.color,
        textTransform: 'uppercase', letterSpacing: '0.5px',
      }}>
        {s.label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────
function Card({
  children, style = {}, topBarGrad = GRAD.topBar,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  topBarGrad?: string;
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: 20, padding: '28px',
      border: '1px solid #e8ecf0',
      boxShadow: '0 6px 30px rgba(0,0,0,0.06)',
      position: 'relative', overflow: 'hidden', ...style,
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 4, background: topBarGrad,
        borderRadius: '20px 20px 0 0',
      }} />
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────
function SectionHeader({
  icon, gradient, title, subtitle, action,
}: {
  icon: string;
  gradient: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 18, marginBottom: 22,
      borderBottom: '2px solid #e8ecf0',
      flexWrap: 'wrap', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 38, height: 38, background: gradient,
          borderRadius: 11, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0,
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.blueDark }}>
            {title}
          </div>
          <div style={{ fontSize: 12, color: C.textLight, marginTop: 1 }}>
            {subtitle}
          </div>
        </div>
      </div>
      {action}
    </div>
  );
}

// ─────────────────────────────────────────────
// ACTION BUTTON
// ─────────────────────────────────────────────
function ActionBtn({
  label, gradient = GRAD.primary, onClick, small = false,
}: {
  label: string;
  gradient?: string;
  onClick?: () => void;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: small ? '7px 14px' : '10px 20px', borderRadius: 10,
        border: 'none', cursor: 'pointer', background: gradient,
        color: '#fff', fontSize: small ? 12 : 13, fontWeight: 700,
        boxShadow: '0 4px 14px rgba(37,99,235,0.2)',
        transition: 'all 0.2s ease', whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.3)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.2)';
      }}
    >
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────
// DELETE CONFIRM MODAL
// ─────────────────────────────────────────────
function DeleteModal({
  isOpen, onClose, onConfirm, itemName, itemType,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: string;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" width={420} step="form">
      <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 14 }}
          style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(239,68,68,0.1)',
            border: '2px solid rgba(239,68,68,0.25)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 32,
            margin: '0 auto 16px',
          }}
        >
          🗑️
        </motion.div>
        <div style={{
          fontSize: 20, fontWeight: 800, color: C.textPrimary, marginBottom: 8,
        }}>
          Delete {itemType}?
        </div>
        <div style={{
          fontSize: 14, color: C.textMuted, marginBottom: 28, lineHeight: 1.7,
        }}>
          Are you sure you want to delete{' '}
          <strong style={{ color: C.textPrimary }}>{itemName}</strong>?
          <br />This action cannot be undone.
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px', borderRadius: 12,
            border: '1px solid #e8ecf0', background: '#f0f4f8',
            color: C.textMuted, fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}>
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            style={{
              flex: 1, padding: '12px', borderRadius: 12, border: 'none',
              background: GRAD.red, color: '#fff', fontSize: 14,
              fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(239,68,68,0.35)',
            }}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// ADD DOCTOR MODAL
// ─────────────────────────────────────────────
function AddDoctorModal({
  isOpen, onClose, clinicId, onDoctorAdded, addToast,
}: {
  isOpen: boolean;
  onClose: () => void;
  clinicId: string;
  onDoctorAdded: (d: Doctor) => void;
  addToast: (msg: string, type?: Toast['type']) => void;
}) {
  type ModalStep = 'form' | 'loading' | 'success';
  const [step, setStep]             = useState<ModalStep>('form');
  const [saved, setSaved]           = useState<Doctor | null>(null);
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [specialty, setSpecialty]   = useState('');
  const [experience, setExperience] = useState('');
  const [phone, setPhone]           = useState('');
  const [grad, setGrad]             = useState(GRAD.primary);

  const resetForm = () => {
    setName(''); setEmail(''); setPassword('');
    setShowPass(false); setSpecialty('');
    setExperience(''); setPhone(''); setGrad(GRAD.primary);
  };

  useEffect(() => {
    if (isOpen) { setStep('form'); setSaved(null); resetForm(); }
  }, [isOpen]);

  const passwordOk =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password);

  const valid = !!(name.trim() && email.includes('@') && specialty && passwordOk);

  const SPECIALTIES = [
    'Cardiologist', 'Pediatrician', 'Orthopedic Surgeon', 'Neurologist',
    'General Physician', 'Dermatologist', 'Psychiatrist', 'Oncologist',
    'Gynecologist', 'Urologist', 'Radiologist', 'Anesthesiologist',
    'Emergency Medicine', 'Internal Medicine', 'Family Medicine',
  ];

  const handleAdd = async () => {
    if (!valid) return;
    setStep('loading');

    try {
      const cleanName = name.trim().startsWith('Dr.')
        ? name.trim() : `Dr. ${name.trim()}`;

      const initials = cleanName
        .replace('Dr. ', '')
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      const created = await createPortalUser({
        fullName: cleanName,
        email: email.trim().toLowerCase(),
        password,
        role: 'doctor',
      });

      const { data: docRow, error: docErr } = await supabase
        .from('doctors')
        .insert({
          clinic_id:    clinicId,
          profile_id:   created.id,
          name:         cleanName,
          email:        created.email,
          phone,
          specialty,
          experience,
          initials,
          grad,
          status:       'active',
          patients:     0,
          utilization:  0,
          rating:       5.0,
          revenue:      0,
        })
        .select('*')
        .single();

      if (docErr || !docRow) {
        console.error('Doctor insert error:', docErr?.message);
        addToast(
          'Doctor account created, but doctor record could not be saved. Please contact support.',
          'error'
        );
        setStep('form');
        return;
      }

      const newDoctor: Doctor = {
        id:          String((docRow as Record<string, unknown>).id ?? ''),
        name:        String((docRow as Record<string, unknown>).name ?? cleanName),
        specialty:   String((docRow as Record<string, unknown>).specialty ?? specialty),
        patients:    Number((docRow as Record<string, unknown>).patients ?? 0),
        utilization: Number((docRow as Record<string, unknown>).utilization ?? 0),
        rating:      Number((docRow as Record<string, unknown>).rating ?? 5.0),
        status:      String((docRow as Record<string, unknown>).status ?? 'active'),
        revenue:     Number((docRow as Record<string, unknown>).revenue ?? 0),
        initials:    String((docRow as Record<string, unknown>).initials ?? initials),
        grad:        String((docRow as Record<string, unknown>).grad ?? grad),
        phone:       typeof (docRow as Record<string, unknown>).phone === 'string'
          ? (docRow as Record<string, unknown>).phone as string
          : undefined,
        email:       typeof (docRow as Record<string, unknown>).email === 'string'
          ? (docRow as Record<string, unknown>).email as string
          : created.email,
        experience:  typeof (docRow as Record<string, unknown>).experience === 'string'
          ? (docRow as Record<string, unknown>).experience as string
          : undefined,
        profile_id:  typeof (docRow as Record<string, unknown>).profile_id === 'string'
          ? (docRow as Record<string, unknown>).profile_id as string
          : created.id,
      };

      setSaved(newDoctor);
      onDoctorAdded(newDoctor);
      setStep('success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      console.error('Add doctor error:', err);
      addToast(msg, 'error');
      setStep('form');
    }
  };

  const handleClose   = () => { setStep('form'); setSaved(null); onClose(); };
  const handleAnother = () => { setStep('form'); setSaved(null); resetForm(); };

  return (
    <Modal
      isOpen={isOpen} onClose={handleClose}
      title="👨‍⚕️ Add New Doctor"
      width={600} step={step}
    >
      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.div key="form"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div style={{
              padding: '12px 16px', borderRadius: 12, marginBottom: 20,
              background: 'rgba(37,99,235,0.06)',
              border: '1px solid rgba(37,99,235,0.15)',
              fontSize: 13, color: C.textMuted, lineHeight: 1.6,
            }}>
              <strong style={{ color: C.blue }}>🔑 Login Credentials:</strong>
              {' '}You are setting the doctor&apos;s email and password.
              Share these credentials with the doctor so they can log in.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <FormField
                  label="Full Name" icon="👨‍⚕️"
                  value={name} onChange={setName}
                  required placeholder="e.g. Dr. Jane Smith"
                />
              </div>
              <FormField
                label="Login Email" icon="📧" type="email"
                value={email} onChange={setEmail}
                required placeholder="doctor@clinic.com"
              />
              <div style={{ marginBottom: 14 }}>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 700,
                  color: C.textMuted, textTransform: 'uppercase',
                  letterSpacing: '0.8px', marginBottom: 5,
                }}>
                  🔒 Login Password <span style={{ color: C.red }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 8 chars, A-Z, a-z, 0-9"
                    style={{
                      width: '100%', padding: '10px 40px 10px 13px',
                      borderRadius: 10, border: '2px solid #e8ecf0',
                      fontSize: 14, color: C.textPrimary,
                      background: '#f8fafc', outline: 'none',
                      boxSizing: 'border-box', transition: 'all 0.2s',
                      fontFamily: "'Segoe UI', system-ui, sans-serif",
                    }}
                    onFocus={e => {
                      e.target.style.border = `2px solid ${C.blue}`;
                      e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
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
                      position: 'absolute', right: 10, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: 16,
                      color: C.textLight, padding: 0,
                    }}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
                {password && (
                  <div style={{ display: 'flex', gap: 3, marginTop: 6 }}>
                    {[
                      password.length >= 8,
                      /[A-Z]/.test(password),
                      /[a-z]/.test(password),
                      /\d/.test(password),
                    ].map((ok, i) => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: ok ? C.green : '#e8ecf0',
                        transition: 'background 0.2s',
                      }} />
                    ))}
                  </div>
                )}
                {password && !passwordOk && (
                  <div style={{ fontSize: 10, color: '#d97706', marginTop: 4, fontWeight: 600 }}>
                    ⚠️ Need: 8+ chars, uppercase, lowercase, number
                  </div>
                )}
                {password && passwordOk && (
                  <div style={{ fontSize: 10, color: C.green, marginTop: 4, fontWeight: 600 }}>
                    ✅ Password meets requirements
                  </div>
                )}
              </div>

              <FormField
                label="Specialty" icon="🏥"
                value={specialty} onChange={setSpecialty}
                options={SPECIALTIES} required
              />
              <FormField
                label="Experience" icon="📅"
                value={experience} onChange={setExperience}
                placeholder="e.g. 8 years"
              />
              <FormField
                label="Phone Number" icon="📞"
                value={phone} onChange={setPhone}
                placeholder="+1 (555) 000-0000"
              />
              <div style={{ marginBottom: 14 }}>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 700,
                  color: C.textMuted, textTransform: 'uppercase',
                  letterSpacing: '0.8px', marginBottom: 8,
                }}>
                  🎨 Profile Color
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {GRAD_OPTIONS.map(g => (
                    <button key={g} onClick={() => setGrad(g)}
                      style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: g, cursor: 'pointer',
                        border: grad === g ? '3px solid #0f1729' : '3px solid transparent',
                        boxShadow: grad === g ? '0 0 0 3px rgba(37,99,235,0.35)' : 'none',
                        transition: 'all 0.2s',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {!valid && (name || email || password || specialty) && (
              <div style={{
                marginBottom: 14, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.3)',
                fontSize: 13, color: '#d97706', fontWeight: 600,
              }}>
                ⚠️ Please fill in Name, Email, a strong Password, and Specialty
              </div>
            )}
            {valid && (
              <div style={{
                marginBottom: 14, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(16,185,129,0.06)',
                border: '1px solid rgba(16,185,129,0.2)',
                fontSize: 12, color: '#059669', fontWeight: 600,
              }}>
                ✅ Ready — doctor will log in with: <strong>{email}</strong>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={handleClose} style={{
                padding: '11px 22px', borderRadius: 12,
                border: '1px solid #e8ecf0', background: '#f0f4f8',
                color: C.textMuted, fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}>
                Cancel
              </button>
              <button onClick={handleAdd} disabled={!valid} style={{
                padding: '11px 26px', borderRadius: 12, border: 'none',
                background: valid ? GRAD.primary : '#e8ecf0',
                color: valid ? '#fff' : C.textLight,
                fontSize: 14, fontWeight: 800,
                cursor: valid ? 'pointer' : 'not-allowed',
                boxShadow: valid ? '0 4px 16px rgba(37,99,235,0.3)' : 'none',
                transition: 'all 0.2s',
              }}>
                👨‍⚕️ Add Doctor
              </button>
            </div>
          </motion.div>
        )}

        {step === 'loading' && (
          <motion.div key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <LoadingSpinner label="Creating doctor account..." />
          </motion.div>
        )}

        {step === 'success' && saved && (
          <motion.div key="success"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <SuccessScreen
              title="Doctor Added!"
              subtitle={`${saved.name}'s account is ready.`}
              details={[
                { label: 'Name',        value: saved.name              },
                { label: 'Login Email', value: saved.email ?? email    },
                { label: 'Password',    value: '(as you entered)'      },
                { label: 'Specialty',   value: saved.specialty         },
                { label: 'Dashboard',   value: 'Doctor Dashboard'      },
              ]}
              onClose={handleClose}
              onAddAnother={handleAnother}
              addAnotherLabel="Add Another Doctor"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// ADD PATIENT MODAL
// ─────────────────────────────────────────────
function AddPatientModal({
  isOpen, onClose, clinicId, doctors, onPatientAdded, addToast,
}: {
  isOpen: boolean;
  onClose: () => void;
  clinicId: string;
  doctors: Doctor[];
  onPatientAdded: (p: Patient) => void;
  addToast: (msg: string, type?: Toast['type']) => void;
}) {
  type ModalStep = 'form' | 'loading' | 'success';
  const [step, setStep]                     = useState<ModalStep>('form');
  const [saved, setSaved]                   = useState<Patient | null>(null);
  const [name, setName]                     = useState('');
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [showPass, setShowPass]             = useState(false);
  const [age, setAge]                       = useState('');
  const [phone, setPhone]                   = useState('');
  const [condition, setCondition]           = useState('');
  const [bloodType, setBloodType]           = useState('');
  const [address, setAddress]               = useState('');
  const [assignedDoctor, setAssignedDoctor] = useState('');
  const [patientStatus, setPatientStatus]   = useState('active');

  const resetForm = () => {
    setName(''); setEmail(''); setPassword('');
    setShowPass(false); setAge(''); setPhone('');
    setCondition(''); setBloodType(''); setAddress('');
    setAssignedDoctor(''); setPatientStatus('active');
  };

  useEffect(() => {
    if (isOpen) { setStep('form'); setSaved(null); resetForm(); }
  }, [isOpen]);

  const valid = !!(
    name.trim() && email.includes('@') &&
    password.length >= 8 && condition
  );

  const CONDITIONS = [
    'Hypertension', 'Diabetes Type 1', 'Diabetes Type 2', 'Asthma',
    'Arthritis', 'Migraine', 'Seasonal Allergy', 'Heart Disease',
    'Back Pain', 'Anxiety', 'Depression', 'Knee Replacement',
    'Post-Surgery', 'General Wellness', 'Other',
  ];

  const handleSave = async () => {
    if (!valid) return;
    setStep('loading');

    try {
      const assignedDoc = doctors.find(d => d.name === assignedDoctor);

      const created = await createPortalUser({
        fullName: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: 'patient',
      });

      const { data: patientRow, error: patientErr } = await supabase
        .from('patients')
        .insert({
          clinic_id:          clinicId,
          profile_id:         created.id,
          name:               name.trim(),
          email:              created.email,
          age:                Number(age) || 0,
          phone,
          condition,
          blood_type:         bloodType,
          address,
          assigned_doctor_id: assignedDoc?.id ?? null,
          status:             patientStatus,
          visits:             0,
          last_visit:         TODAY,
        })
        .select('*')
        .single();

      if (patientErr || !patientRow) {
        console.error('Patient insert error:', patientErr?.message);
        addToast(
          'Patient account created, but patient record could not be saved. Please contact support.',
          'error'
        );
        setStep('form');
        return;
      }

      const newPatient: Patient = {
        id:                 String((patientRow as Record<string, unknown>).id ?? ''),
        name:               String((patientRow as Record<string, unknown>).name ?? name.trim()),
        age:                Number((patientRow as Record<string, unknown>).age ?? (Number(age) || 0)),
        phone:              String((patientRow as Record<string, unknown>).phone ?? phone),
        email:              String((patientRow as Record<string, unknown>).email ?? created.email),
        last_visit:         String((patientRow as Record<string, unknown>).last_visit ?? TODAY),
        condition:          String((patientRow as Record<string, unknown>).condition ?? condition),
        status:             String((patientRow as Record<string, unknown>).status ?? patientStatus),
        visits:             Number((patientRow as Record<string, unknown>).visits ?? 0),
        blood_type:         typeof (patientRow as Record<string, unknown>).blood_type === 'string'
          ? (patientRow as Record<string, unknown>).blood_type as string
          : undefined,
        address:            typeof (patientRow as Record<string, unknown>).address === 'string'
          ? (patientRow as Record<string, unknown>).address as string
          : undefined,
        assigned_doctor_id: typeof (patientRow as Record<string, unknown>).assigned_doctor_id === 'string'
          ? (patientRow as Record<string, unknown>).assigned_doctor_id as string
          : undefined,
        profile_id:         typeof (patientRow as Record<string, unknown>).profile_id === 'string'
          ? (patientRow as Record<string, unknown>).profile_id as string
          : created.id,
      };

      setSaved(newPatient);
      onPatientAdded(newPatient);
      setStep('success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      console.error('Add patient error:', err);
      addToast(msg, 'error');
      setStep('form');
    }
  };

  const handleClose   = () => { setStep('form'); setSaved(null); onClose(); };
  const handleAnother = () => { setStep('form'); setSaved(null); resetForm(); };

  return (
    <Modal
      isOpen={isOpen} onClose={handleClose}
      title="👤 Add New Patient"
      width={600} step={step}
    >
      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.div key="form"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div style={{
              padding: '12px 16px', borderRadius: 12, marginBottom: 20,
              background: 'rgba(16,185,129,0.06)',
              border: '1px solid rgba(16,185,129,0.2)',
              fontSize: 13, color: C.textMuted, lineHeight: 1.6,
            }}>
              <strong style={{ color: C.greenDark }}>🔑 Login Credentials:</strong>
              {' '}You are setting the patient&apos;s email and password.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <FormField
                  label="Full Name" icon="👤"
                  value={name} onChange={setName}
                  required placeholder="e.g. John Smith"
                />
              </div>
              <FormField
                label="Login Email" icon="📧" type="email"
                value={email} onChange={setEmail}
                required placeholder="patient@email.com"
              />
              <div style={{ marginBottom: 14 }}>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 700,
                  color: C.textMuted, textTransform: 'uppercase',
                  letterSpacing: '0.8px', marginBottom: 5,
                }}>
                  🔒 Login Password <span style={{ color: C.red }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    style={{
                      width: '100%', padding: '10px 40px 10px 13px',
                      borderRadius: 10, border: '2px solid #e8ecf0',
                      fontSize: 14, color: C.textPrimary,
                      background: '#f8fafc', outline: 'none',
                      boxSizing: 'border-box', transition: 'all 0.2s',
                      fontFamily: "'Segoe UI', system-ui, sans-serif",
                    }}
                    onFocus={e => {
                      e.target.style.border = `2px solid ${C.blue}`;
                      e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
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
                      position: 'absolute', right: 10, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: 16,
                      color: C.textLight, padding: 0,
                    }}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
                {password && password.length < 8 && (
                  <div style={{ fontSize: 10, color: '#d97706', marginTop: 4, fontWeight: 600 }}>
                    ⚠️ Password must be at least 8 characters
                  </div>
                )}
                {password && password.length >= 8 && (
                  <div style={{ fontSize: 10, color: C.green, marginTop: 4, fontWeight: 600 }}>
                    ✅ Password length OK
                  </div>
                )}
              </div>

              <FormField label="Age" icon="🎂" type="number"
                value={age} onChange={setAge} placeholder="e.g. 35" />
              <FormField label="Blood Type" icon="🩸"
                value={bloodType} onChange={setBloodType}
                options={['A+','A-','B+','B-','AB+','AB-','O+','O-']} />
              <FormField label="Phone Number" icon="📞"
                value={phone} onChange={setPhone} placeholder="+1 (555) 000-0000" />
              <FormField label="Primary Condition" icon="📋"
                value={condition} onChange={setCondition}
                options={CONDITIONS} required />
              <FormField label="Status" icon="🔘"
                value={patientStatus} onChange={setPatientStatus}
                options={['active','in-treatment','monitoring','inactive']} />
              <FormField label="Assign Doctor" icon="👨‍⚕️"
                value={assignedDoctor} onChange={setAssignedDoctor}
                options={doctors.filter(d => d.status === 'active').map(d => d.name)} />
              <div style={{ gridColumn: '1 / -1' }}>
                <FormField label="Home Address" icon="📍"
                  value={address} onChange={setAddress}
                  placeholder="123 Main St, New York, NY" />
              </div>
            </div>

            {!valid && (name || email || password || condition) && (
              <div style={{
                marginBottom: 14, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.3)',
                fontSize: 13, color: '#d97706', fontWeight: 600,
              }}>
                ⚠️ Name, Email, Password (8+ chars), and Condition are required
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={handleClose} style={{
                padding: '11px 22px', borderRadius: 12,
                border: '1px solid #e8ecf0', background: '#f0f4f8',
                color: C.textMuted, fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={!valid} style={{
                padding: '11px 26px', borderRadius: 12, border: 'none',
                background: valid ? GRAD.green : '#e8ecf0',
                color: valid ? '#fff' : C.textLight,
                fontSize: 14, fontWeight: 800,
                cursor: valid ? 'pointer' : 'not-allowed',
                boxShadow: valid ? '0 4px 16px rgba(5,150,105,0.3)' : 'none',
                transition: 'all 0.2s',
              }}>
                👤 Add Patient
              </button>
            </div>
          </motion.div>
        )}

        {step === 'loading' && (
          <motion.div key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <LoadingSpinner label="Creating patient account..." />
          </motion.div>
        )}

        {step === 'success' && saved && (
          <motion.div key="success"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <SuccessScreen
              title="Patient Added!"
              subtitle={`${saved.name} has been registered.`}
              details={[
                { label: 'Name',        value: saved.name          },
                { label: 'Login Email', value: saved.email         },
                { label: 'Password',    value: '(as you entered)'  },
                { label: 'Condition',   value: saved.condition     },
                { label: 'Dashboard',   value: 'Patient Dashboard' },
              ]}
              onClose={handleClose}
              onAddAnother={handleAnother}
              addAnotherLabel="Add Another Patient"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// APPOINTMENT MODAL
// ─────────────────────────────────────────────
function AppointmentModal({
  isOpen, onClose, onSave, doctors, patients, editData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Appointment) => Promise<void>;
  doctors: Doctor[];
  patients: Patient[];
  editData?: Appointment | null;
}) {
  type ModalStep = 'form' | 'loading' | 'success';
  const [step, setStep]   = useState<ModalStep>('form');
  const [saved, setSaved] = useState<Appointment | null>(null);
  const [form, setForm]   = useState({
    patient_name: '', doctor_name: '', type: '', time: '',
    date: TODAY, room: '', fee: '', status: 'upcoming', notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      setStep('form'); setSaved(null);
      if (editData) {
        setForm({
          patient_name: editData.patient_name,
          doctor_name:  editData.doctor_name,
          type:         editData.type,
          time:         editData.time,
          date:         editData.date || TODAY,
          room:         editData.room,
          fee:          String(editData.fee),
          status:       editData.status,
          notes:        editData.notes || '',
        });
      } else {
        setForm({
          patient_name: '', doctor_name: '', type: '', time: '',
          date: TODAY, room: '', fee: '', status: 'upcoming', notes: '',
        });
      }
    }
  }, [isOpen, editData]);

  const f = (key: string) => (v: string) =>
    setForm(prev => ({ ...prev, [key]: v }));

  const valid = !!(
    form.patient_name && form.doctor_name &&
    form.type && form.time && form.date
  );

  const handleSave = async () => {
    if (!valid) return;
    setStep('loading');
    const selectedDoctor  = doctors.find(d => d.name === form.doctor_name);
    const selectedPatient = patients.find(p => p.name === form.patient_name);
    const data: Appointment = {
      id:           editData?.id || `a${Date.now()}`,
      patient_name: form.patient_name,
      doctor_name:  form.doctor_name,
      type:         form.type,
      time:         form.time,
      date:         form.date,
      room:         form.room || 'TBD',
      fee:          Number(form.fee) || 0,
      status:       form.status,
      notes:        form.notes,
      doctor_id:    selectedDoctor?.id,
      patient_id:   selectedPatient?.id,
    };
    await onSave(data);
    setSaved(data);
    setStep('success');
  };

  const handleClose   = () => { setStep('form'); setSaved(null); onClose(); };
  const handleAnother = () => {
    setStep('form'); setSaved(null);
    setForm({
      patient_name: '', doctor_name: '', type: '', time: '',
      date: TODAY, room: '', fee: '', status: 'upcoming', notes: '',
    });
  };

  const TYPES = [
    'Annual Checkup', 'Follow-up Consult', 'Orthopedic Eval',
    'Neurology Consult', 'General Checkup', 'Cardiac Follow-up',
    'Pediatric Checkup', 'Post-Surgery Review', 'Dental Cleaning',
    'Vaccination', 'Lab Results Review', 'New Patient Consultation',
  ];
  const TIMES = [
    '08:00 AM','08:30 AM','09:00 AM','09:30 AM','10:00 AM','10:30 AM',
    '11:00 AM','11:15 AM','11:30 AM','12:00 PM','12:30 PM','01:00 PM',
    '01:30 PM','02:00 PM','02:30 PM','02:45 PM','03:00 PM','03:30 PM',
    '04:00 PM','04:30 PM','05:00 PM',
  ];
  const ROOMS = [
    '1A','1B','2A','2B','3A','3B','4A','4B','Consultation Room','Emergency',
  ];

  return (
    <Modal
      isOpen={isOpen} onClose={handleClose}
      title={editData ? '✏️ Edit Appointment' : '📅 Schedule New Appointment'}
      width={600} step={step}
    >
      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.div key="form"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <FormField label="Patient" icon="👤"
                  value={form.patient_name} onChange={f('patient_name')}
                  options={patients.map(p => p.name)} required />
              </div>
              <FormField label="Doctor" icon="👨‍⚕️"
                value={form.doctor_name} onChange={f('doctor_name')}
                options={doctors.filter(d => d.status === 'active').map(d => d.name)}
                required />
              <FormField label="Appointment Type" icon="📋"
                value={form.type} onChange={f('type')}
                options={TYPES} required />
              <FormField label="Date" icon="📆" type="date"
                value={form.date} onChange={f('date')} required />
              <FormField label="Time Slot" icon="🕐"
                value={form.time} onChange={f('time')}
                options={TIMES} required />
              <FormField label="Room" icon="🚪"
                value={form.room} onChange={f('room')} options={ROOMS} />
              <FormField label="Fee ($)" icon="💰" type="number"
                value={form.fee} onChange={f('fee')} placeholder="e.g. 120" />
              <FormField label="Status" icon="🔘"
                value={form.status} onChange={f('status')}
                options={['upcoming','in-progress','completed','cancelled']} />
              <div style={{ gridColumn: '1 / -1', marginBottom: 14 }}>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 700,
                  color: C.textMuted, textTransform: 'uppercase',
                  letterSpacing: '0.8px', marginBottom: 5,
                }}>
                  📝 Notes (optional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Any special instructions..."
                  rows={3}
                  style={{
                    width: '100%', padding: '10px 13px', borderRadius: 10,
                    border: '2px solid #e8ecf0', fontSize: 14,
                    color: C.textPrimary, background: '#f8fafc',
                    outline: 'none', resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: "'Segoe UI', system-ui, sans-serif",
                  }}
                  onFocus={e => { e.target.style.border = `2px solid ${C.blue}`; }}
                  onBlur={e => { e.target.style.border = '2px solid #e8ecf0'; }}
                />
              </div>
            </div>

            {!valid && (
              <div style={{
                marginBottom: 14, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.3)',
                fontSize: 13, color: '#d97706', fontWeight: 600,
              }}>
                ⚠️ Please fill in Patient, Doctor, Type, Time, and Date
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={handleClose} style={{
                padding: '11px 22px', borderRadius: 12,
                border: '1px solid #e8ecf0', background: '#f0f4f8',
                color: C.textMuted, fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={!valid} style={{
                padding: '11px 26px', borderRadius: 12, border: 'none',
                background: valid ? GRAD.primary : '#e8ecf0',
                color: valid ? '#fff' : C.textLight,
                fontSize: 14, fontWeight: 800,
                cursor: valid ? 'pointer' : 'not-allowed',
                boxShadow: valid ? '0 4px 16px rgba(37,99,235,0.3)' : 'none',
                transition: 'all 0.2s',
              }}>
                {editData ? '✅ Save Changes' : '📅 Schedule'}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'loading' && (
          <motion.div key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <LoadingSpinner
              label={editData ? 'Updating appointment...' : 'Scheduling appointment...'} />
          </motion.div>
        )}

        {step === 'success' && saved && (
          <motion.div key="success"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <SuccessScreen
              title={editData ? 'Appointment Updated!' : 'Appointment Scheduled!'}
              subtitle={`${saved.patient_name}'s appointment has been ${editData ? 'updated' : 'scheduled'}.`}
              details={[
                { label: 'Patient',     value: saved.patient_name },
                { label: 'Doctor',      value: saved.doctor_name  },
                { label: 'Date & Time', value: `${saved.date} at ${saved.time}` },
                { label: 'Type',        value: saved.type         },
                { label: 'Room',        value: saved.room         },
                { label: 'Fee',         value: `$${saved.fee}`    },
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
// SIDEBAR
// ─────────────────────────────────────────────
function Sidebar({
  activeTab, setActiveTab, collapsed, setCollapsed, user, clinic, onLogout,
}: {
  activeTab: string;
  setActiveTab: (t: string) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  user: User | null;
  clinic: Clinic | null;
  onLogout: () => void;
}) {
  const sections = [
    {
      label: '📌 Main', items: [
        { id: 'overview',     icon: '📊', label: 'Overview'     },
        { id: 'appointments', icon: '📅', label: 'Appointments' },
        { id: 'patients',     icon: '👥', label: 'Patients'     },
        { id: 'doctors',      icon: '👨‍⚕️', label: 'Doctors'   },
        { id: 'analytics',   icon: '📈', label: 'Analytics'    },
      ],
    },
    {
      label: '⚙️ Manage', items: [
        { id: 'billing',  icon: '💰', label: 'Billing'  },
        { id: 'settings', icon: '⚙️', label: 'Settings' },
      ],
    },
  ];

  const displayName = user?.user_metadata?.full_name
    || user?.email?.split('@')[0] || 'Admin';
  const displayInitials = displayName
    .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.div
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.3 }}
      style={{
        minHeight: '100vh', background: GRAD.hero,
        display: 'flex', flexDirection: 'column',
        padding: collapsed ? '24px 10px' : '24px 14px',
        flexShrink: 0, overflow: 'hidden',
        boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 20, paddingBottom: 16,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #2563eb, #818cf8)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 18, flexShrink: 0,
          boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
        }}>
          🏥
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
              MediBook
            </div>
            <div style={{
              fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '1.2px', marginTop: 2,
            }}>
              {clinic?.name || 'Admin Portal'}
            </div>
          </div>
        )}
      </div>

      {!collapsed && (
        <div style={{
          padding: '10px 12px', marginBottom: 20,
          background: 'rgba(255,255,255,0.07)',
          borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: GRAD.green, flexShrink: 0,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 12,
              fontWeight: 700, color: '#fff',
            }}>
              {displayInitials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: '#fff',
                lineHeight: 1.2, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {displayName}
              </div>
              <div style={{
                fontSize: 9, color: 'rgba(255,255,255,0.4)',
                marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.8px',
              }}>
                🔵 Admin
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1 }}>
        {sections.map(section => (
          <div key={section.label} style={{ marginBottom: 18 }}>
            {!collapsed && (
              <div style={{
                fontSize: 9, fontWeight: 700,
                color: 'rgba(255,255,255,0.28)',
                textTransform: 'uppercase', letterSpacing: '1.5px',
                marginBottom: 6, paddingLeft: 10,
              }}>
                {section.label}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {section.items.map((item, idx) => {
                const isActive = activeTab === item.id;
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      display: 'flex', alignItems: 'center',
                      gap: collapsed ? 0 : 10,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      padding: collapsed ? '11px' : '10px 12px',
                      borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: isActive ? 'rgba(255,255,255,0.14)' : 'transparent',
                      borderLeft: isActive && !collapsed
                        ? '3px solid #ffd700' : '3px solid transparent',
                      transition: 'all 0.2s ease', width: '100%',
                    }}
                    onMouseEnter={e => {
                      if (!isActive)
                        e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                    }}
                    onMouseLeave={e => {
                      if (!isActive)
                        e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                    {!collapsed && (
                      <span style={{
                        fontSize: 13,
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                        whiteSpace: 'nowrap',
                      }}>
                        {item.label}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 'auto', paddingTop: 14,
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display: 'flex', alignItems: 'center',
            gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '11px' : '10px 12px',
            borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'rgba(255,255,255,0.5)',
            fontSize: 13, fontWeight: 500, width: '100%',
          }}
        >
          <span style={{ fontSize: 16 }}>{collapsed ? '→' : '←'}</span>
          {!collapsed && <span>Collapse</span>}
        </button>

        <button
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center',
            gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '11px' : '10px 12px',
            borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'rgba(255,255,255,0.5)',
            fontSize: 13, fontWeight: 500, width: '100%', transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
            e.currentTarget.style.color = '#f87171';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
          }}
        >
          <span style={{ fontSize: 16 }}>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// TOP BAR
// ─────────────────────────────────────────────
function TopBar({
  title, subtitle, user,
}: {
  title: string;
  subtitle: string;
  user: User | null;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const displayName = user?.user_metadata?.full_name
    || user?.email?.split('@')[0] || 'Admin';
  const displayInitials = displayName
    .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{
      background: '#fff', borderBottom: '1px solid #e8ecf0',
      padding: '14px 28px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', position: 'sticky', top: 0,
      zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    }}>
      <div>
        <h1 style={{
          fontSize: 19, fontWeight: 900, color: C.textPrimary, letterSpacing: '-0.5px',
        }}>
          {title}
        </h1>
        <p style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{subtitle}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 50,
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.2)',
        }}>
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#10b981', display: 'inline-block',
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>
            Clinic Live
          </span>
        </div>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              width: 38, height: 38, borderRadius: 11,
              background: '#f0f4f8', border: '1px solid #e8ecf0',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 17, cursor: 'pointer',
              position: 'relative',
            }}
          >
            🔔
            <div style={{
              position: 'absolute', top: 8, right: 8,
              width: 7, height: 7, borderRadius: '50%',
              background: '#ef4444', border: '2px solid #fff',
            }} />
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                style={{
                  position: 'absolute', top: 46, right: 0, zIndex: 200,
                  background: '#fff', borderRadius: 16, width: 320,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                  border: '1px solid #e8ecf0', overflow: 'hidden',
                }}
              >
                <div style={{
                  padding: '14px 18px', borderBottom: '1px solid #e8ecf0',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.textPrimary }}>
                    Notifications
                  </div>
                  <div style={{
                    padding: '2px 8px', borderRadius: 50,
                    background: 'rgba(239,68,68,0.1)',
                    color: '#dc2626', fontSize: 11, fontWeight: 700,
                  }}>
                    2 new
                  </div>
                </div>
                {[
                  { icon: '📅', msg: 'New appointment scheduled', time: '2m ago', unread: true  },
                  { icon: '👤', msg: 'New patient registered',    time: '8m ago', unread: true  },
                  { icon: '💰', msg: 'Invoice collected — $120',  time: '1h ago', unread: false },
                ].map((n, i) => (
                  <div key={i} style={{
                    padding: '12px 18px',
                    borderBottom: i < 2 ? '1px solid #f0f4f8' : 'none',
                    background: n.unread ? 'rgba(37,99,235,0.03)' : '#fff',
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 9,
                      background: '#f0f4f8', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, flexShrink: 0,
                    }}>
                      {n.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 13, fontWeight: n.unread ? 700 : 500,
                        color: C.textPrimary, lineHeight: 1.4,
                      }}>
                        {n.msg}
                      </div>
                      <div style={{ fontSize: 11, color: C.textLight, marginTop: 3 }}>
                        {n.time}
                      </div>
                    </div>
                    {n.unread && (
                      <div style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: C.blue, flexShrink: 0, marginTop: 3,
                      }} />
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 12px 5px 5px', borderRadius: 50,
          background: '#f0f4f8', border: '1px solid #e8ecf0',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: GRAD.primary, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 11, fontWeight: 700,
          }}>
            {displayInitials}
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.textPrimary }}>
            {displayName}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// OVERVIEW TAB
// ─────────────────────────────────────────────
function OverviewTab({
  setActiveTab, appointments, openApptModal, doctors, patients,
}: {
  setActiveTab: (t: string) => void;
  appointments: Appointment[];
  openApptModal: () => void;
  doctors: Doctor[];
  patients: Patient[];
}) {
  const todayAppts   = appointments.filter(a => a.date === TODAY);
  const todayRevenue = todayAppts
    .filter(a => a.status === 'completed')
    .reduce((s, a) => s + a.fee, 0);

  const stats = [
    {
      label: "Today's Appointments",
      value: String(todayAppts.length || appointments.length),
      sub:   `${appointments.filter(a => a.status === 'upcoming').length} upcoming`,
      icon:  '📅', grad: GRAD.primary,
    },
    {
      label: 'Registered Patients',
      value: String(patients.length),
      sub:   'Total in system',
      icon:  '👥', grad: GRAD.green,
    },
    {
      label: 'Active Doctors',
      value: String(doctors.filter(d => d.status === 'active').length),
      sub:   `${doctors.length} total staff`,
      icon:  '👨‍⚕️', grad: GRAD.purple,
    },
    {
      label: "Today's Revenue",
      value: `$${todayRevenue.toLocaleString()}`,
      sub:   'From completed appointments',
      icon:  '💰', grad: GRAD.amber,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: 20,
      }}>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{
              background: '#fff', borderRadius: 20, padding: '24px',
              border: '1px solid #e8ecf0',
              boxShadow: '0 6px 30px rgba(0,0,0,0.06)',
              position: 'relative', overflow: 'hidden',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 14px 40px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 30px rgba(0,0,0,0.06)';
            }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: 4, background: s.grad, borderRadius: '20px 20px 0 0',
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: C.textLight,
                  textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10,
                }}>
                  {s.label}
                </div>
                <div style={{
                  fontSize: 36, fontWeight: 900, color: C.textPrimary,
                  lineHeight: 1, letterSpacing: '-1px',
                }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 8 }}>
                  {s.sub}
                </div>
              </div>
              <div style={{
                width: 48, height: 48, background: s.grad, borderRadius: 14,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 22,
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}>
                {s.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 24,
      }}>
        <Card>
          <SectionHeader
            icon="📅" gradient={GRAD.primary}
            title="Today's Appointments" subtitle="Live clinic schedule"
            action={<ActionBtn label="+ New Appointment" small onClick={openApptModal} />}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {appointments.slice(0, 6).map((apt, i) => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 13px', borderRadius: 13,
                  background: apt.status === 'in-progress'
                    ? 'rgba(16,185,129,0.06)' : '#f8fafc',
                  border: apt.status === 'in-progress'
                    ? '1px solid rgba(16,185,129,0.25)' : '1px solid #e8ecf0',
                }}
              >
                <div style={{
                  minWidth: 56, textAlign: 'center', padding: '5px',
                  background: '#fff', borderRadius: 9, border: '1px solid #e8ecf0',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.textPrimary, lineHeight: 1 }}>
                    {apt.time.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: 9, color: C.textLight, marginTop: 1 }}>
                    {apt.time.split(' ')[1]}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: C.textPrimary,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {apt.patient_name}
                  </div>
                  <div style={{
                    fontSize: 11, color: C.textMuted, marginTop: 1,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {apt.doctor_name} · {apt.type}
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <StatusPill status={apt.status} />
                  <div style={{
                    fontSize: 12, fontWeight: 700,
                    color: C.textPrimary, marginTop: 4, textAlign: 'right',
                  }}>
                    ${apt.fee}
                  </div>
                </div>
              </motion.div>
            ))}
            {appointments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px', color: C.textMuted }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                  No appointments yet
                </div>
                <button onClick={openApptModal} style={{
                  padding: '8px 18px', borderRadius: 10, border: 'none',
                  background: GRAD.primary, color: '#fff',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}>
                  Schedule First Appointment
                </button>
              </div>
            )}
          </div>
          <button onClick={() => setActiveTab('appointments')} style={{
            width: '100%', marginTop: 14, padding: '10px', borderRadius: 12,
            border: '1px solid #e8ecf0', background: '#f8fafc',
            color: C.textMuted, fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>
            View All {appointments.length} Appointments →
          </button>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card topBarGrad={GRAD.amber}>
            <SectionHeader
              icon="⚡" gradient={GRAD.amber}
              title="Quick Actions" subtitle="Common tasks"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { icon: '➕', label: 'New Appointment', grad: GRAD.primary,
                  action: () => openApptModal()           },
                { icon: '👤', label: 'Add Patient',     grad: GRAD.green,
                  action: () => setActiveTab('patients') },
                { icon: '👨‍⚕️', label: 'Add Doctor',    grad: GRAD.purple,
                  action: () => setActiveTab('doctors')  },
                { icon: '📊', label: 'Analytics',       grad: GRAD.amber,
                  action: () => setActiveTab('analytics')},
              ].map(a => (
                <button
                  key={a.label}
                  onClick={a.action}
                  style={{
                    padding: '12px 10px', borderRadius: 12, border: 'none',
                    background: a.grad, color: '#fff', fontSize: 12,
                    fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 6,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={e =>
                    (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <span>{a.icon}</span>{a.label}
                </button>
              ))}
            </div>
          </Card>

          <Card topBarGrad={GRAD.purple}>
            <SectionHeader
              icon="💰" gradient={GRAD.purple}
              title="Weekly Revenue" subtitle="This week"
            />
            <div style={{
              display: 'flex', alignItems: 'flex-end', gap: 8,
              height: 70, marginBottom: 12,
            }}>
              {[38, 52, 44, 68, 58, 82, 64].map((h, i) => (
                <div key={i} style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 4,
                }}>
                  <div style={{
                    width: '100%', height: `${h}%`,
                    background: i === 5 ? GRAD.primary : 'rgba(37,99,235,0.12)',
                    borderRadius: '5px 5px 0 0',
                  }} />
                  <span style={{ fontSize: 9, color: C.textLight, fontWeight: 600 }}>
                    {['M','T','W','T','F','S','S'][i]}
                  </span>
                </div>
              ))}
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 14px', background: '#f8fafc',
              borderRadius: 12, border: '1px solid #e8ecf0',
            }}>
              <div>
                <div style={{ fontSize: 11, color: C.textLight, fontWeight: 600 }}>
                  Week Total
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: C.blueDark }}>
                  $24,320
                </div>
              </div>
              <div style={{
                padding: '6px 12px', borderRadius: 50,
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.2)',
                fontSize: 13, fontWeight: 700, color: '#059669',
              }}>
                ↑ 12%
              </div>
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
function AppointmentsTab({
  appointments, setAppointments, doctors, patients, addToast, clinicId, userId,
}: {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  doctors: Doctor[];
  patients: Patient[];
  addToast: (msg: string, type?: Toast['type']) => void;
  clinicId: string;
  userId: string;
}) {
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData]   = useState<Appointment | null>(null);
  const [deleteModal, setDeleteModal] =
    useState<{ open: boolean; item: Appointment | null }>({ open: false, item: null });

  const filtered = appointments.filter(a => {
    const matchFilter = filter === 'all' || a.status === filter;
    const matchSearch = !search ||
      a.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor_name.toLowerCase().includes(search.toLowerCase())  ||
      a.type.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleSave = async (data: Appointment) => {
    const { error } = await supabase.from('appointments').upsert({
      id:           data.id,
      clinic_id:    clinicId,
      user_id:      userId,
      doctor_id:    data.doctor_id  ?? null,
      patient_id:   data.patient_id ?? null,
      doctor_name:  data.doctor_name,
      patient_name: data.patient_name,
      type:         data.type,
      time:         data.time,
      date:         data.date,
      room:         data.room,
      fee:          data.fee,
      status:       data.status,
      notes:        data.notes ?? '',
    });
    if (error) { addToast('Failed to save appointment.', 'error'); return; }
    if (editData) {
      setAppointments(prev => prev.map(a => a.id === data.id ? data : a));
      addToast('Appointment updated!', 'success');
    } else {
      setAppointments(prev => [data, ...prev]);
      addToast('Appointment scheduled!', 'success');
    }
    setEditData(null);
  };

  const handleDelete = async (apt: Appointment) => {
    const { error } = await supabase.from('appointments')
      .delete().eq('id', apt.id).eq('clinic_id', clinicId);
    if (error) { addToast('Failed to delete.', 'error'); return; }
    setAppointments(prev => prev.filter(a => a.id !== apt.id));
    addToast('Appointment deleted.', 'info');
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase.from('appointments')
      .update({ status }).eq('id', id).eq('clinic_id', clinicId);
    if (error) { addToast('Failed to update status.', 'error'); return; }
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    addToast('Status updated!', 'success');
  };

  return (
    <>
      <Card>
        <SectionHeader
          icon="📅" gradient={GRAD.primary}
          title="All Appointments"
          subtitle={`${appointments.length} total appointments`}
          action={
            <ActionBtn
              label="+ Schedule Appointment"
              onClick={() => { setEditData(null); setModalOpen(true); }}
            />
          }
        />

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <span style={{
              position: 'absolute', left: 12, top: '50%',
              transform: 'translateY(-50%)', fontSize: 14,
            }}>
              🔍
            </span>
            <input
              placeholder="Search patient, doctor, type..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '9px 14px 9px 36px',
                borderRadius: 11, border: '2px solid #e8ecf0',
                fontSize: 13, color: C.textPrimary,
                background: '#f8fafc', outline: 'none',
                boxSizing: 'border-box', transition: 'all 0.2s',
              }}
              onFocus={e => (e.target.style.border = `2px solid ${C.blue}`)}
              onBlur={e => (e.target.style.border = '2px solid #e8ecf0')}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['all','upcoming','in-progress','completed','cancelled'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '7px 13px', borderRadius: 50, border: 'none',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                background: filter === f ? GRAD.primary : '#f0f4f8',
                color: filter === f ? '#fff' : C.textMuted,
                transition: 'all 0.2s', textTransform: 'capitalize',
              }}>
                {f === 'all' ? 'All' : f.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12, marginBottom: 20,
        }}>
          {[
            { label: 'Total',     value: appointments.length,                                       color: C.blue  },
            { label: 'Upcoming',  value: appointments.filter(a => a.status === 'upcoming').length,  color: C.blue  },
            { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length, color: C.green },
            { label: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, color: C.red   },
          ].map(s => (
            <div key={s.label} style={{
              padding: '10px', borderRadius: 11,
              background: '#f8fafc', border: '1px solid #e8ecf0',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{
                fontSize: 10, color: C.textLight, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Time & Date','Patient','Doctor','Type','Room','Fee','Status','Actions'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', fontSize: 10, fontWeight: 700,
                    color: C.textLight, textTransform: 'uppercase',
                    letterSpacing: '1px', padding: '10px 12px 10px 0',
                    borderBottom: '2px solid #e8ecf0', whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((apt, i) => (
                  <motion.tr
                    key={apt.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: '1px solid #f0f4f8' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 12px 12px 0' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>
                        {apt.time}
                      </div>
                      <div style={{ fontSize: 10, color: C.textLight }}>{apt.date}</div>
                    </td>
                    <td style={{ padding: '12px 12px 12px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: 8,
                          background: GRAD.primary, flexShrink: 0,
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', color: '#fff',
                          fontSize: 10, fontWeight: 700,
                        }}>
                          {apt.patient_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span style={{
                          fontSize: 13, fontWeight: 600,
                          color: C.textPrimary, whiteSpace: 'nowrap',
                        }}>
                          {apt.patient_name}
                        </span>
                      </div>
                    </td>
                    <td style={{
                      padding: '12px 12px 12px 0',
                      fontSize: 12, color: C.textMuted, whiteSpace: 'nowrap',
                    }}>
                      {apt.doctor_name}
                    </td>
                    <td style={{
                      padding: '12px 12px 12px 0',
                      fontSize: 12, color: C.textMuted, whiteSpace: 'nowrap',
                    }}>
                      {apt.type}
                    </td>
                    <td style={{ padding: '12px 12px 12px 0' }}>
                      <div style={{
                        display: 'inline-block', padding: '2px 8px',
                        borderRadius: 6, background: '#f0f4f8',
                        fontSize: 11, fontWeight: 700, color: C.textMuted,
                      }}>
                        {apt.room}
                      </div>
                    </td>
                    <td style={{
                      padding: '12px 12px 12px 0',
                      fontSize: 13, fontWeight: 800, color: C.textPrimary,
                    }}>
                      ${apt.fee}
                    </td>
                    <td style={{ padding: '12px 12px 12px 0' }}>
                      <select
                        value={apt.status}
                        onChange={e => handleStatusChange(apt.id, e.target.value)}
                        style={{
                          padding: '4px 8px', borderRadius: 7,
                          border: '1px solid #e8ecf0', fontSize: 11,
                          fontWeight: 700, cursor: 'pointer',
                          background: '#f8fafc', outline: 'none',
                        }}
                      >
                        {['upcoming','in-progress','completed','cancelled'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '12px 0' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => { setEditData(apt); setModalOpen(true); }}
                          style={{
                            padding: '5px 10px', borderRadius: 7, border: 'none',
                            background: GRAD.primary, color: '#fff',
                            fontSize: 11, fontWeight: 700, cursor: 'pointer',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteModal({ open: true, item: apt })}
                          style={{
                            padding: '5px 8px', borderRadius: 7,
                            border: '1px solid rgba(239,68,68,0.3)',
                            background: 'rgba(239,68,68,0.05)',
                            color: C.red, fontSize: 11, cursor: 'pointer',
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: C.textMuted }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
                No appointments found
              </div>
              <button
                onClick={() => { setEditData(null); setModalOpen(true); }}
                style={{
                  padding: '9px 20px', borderRadius: 10, border: 'none',
                  background: GRAD.primary, color: '#fff',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}
              >
                + Schedule Appointment
              </button>
            </div>
          )}
        </div>
      </Card>

      <AppointmentModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSave={handleSave}
        doctors={doctors} patients={patients} editData={editData}
      />
      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={() => deleteModal.item && handleDelete(deleteModal.item)}
        itemName={deleteModal.item?.patient_name || ''}
        itemType="Appointment"
      />
    </>
  );
}

// ─────────────────────────────────────────────
// PATIENTS TAB
// ─────────────────────────────────────────────
function PatientsTab({
  patients, setPatients, doctors, addToast, clinicId, onOpenAddPatient,
}: {
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  doctors: Doctor[];
  addToast: (msg: string, type?: Toast['type']) => void;
  clinicId: string;
  onOpenAddPatient: () => void;
}) {
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] =
    useState<{ open: boolean; item: Patient | null }>({ open: false, item: null });

  const filtered = patients.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.condition.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  const selectedPatient = patients.find(p => p.id === selected);
  const assignedDoctor  = selectedPatient
    ? doctors.find(d => d.id === selectedPatient.assigned_doctor_id)
    : null;

  const handleDelete = async (patient: Patient) => {
    const { error } = await supabase.from('patients')
      .delete().eq('id', patient.id).eq('clinic_id', clinicId);
    if (error) { addToast('Failed to remove patient.', 'error'); return; }
    setPatients(prev => prev.filter(p => p.id !== patient.id));
    if (selected === patient.id) setSelected(null);
    addToast(`${patient.name} removed.`, 'info');
  };

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: selected ? '1fr 360px' : '1fr',
        gap: 24,
      }}>
        <Card>
          <SectionHeader
            icon="👥" gradient={GRAD.green}
            title="Patient Records"
            subtitle={`${patients.length} registered patients`}
            action={
              <ActionBtn label="+ Add Patient" gradient={GRAD.green} onClick={onOpenAddPatient} />
            }
          />
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <span style={{
              position: 'absolute', left: 12, top: '50%',
              transform: 'translateY(-50%)', fontSize: 14,
            }}>
              🔍
            </span>
            <input
              placeholder="Search by name, condition, or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '9px 14px 9px 36px',
                borderRadius: 11, border: '2px solid #e8ecf0',
                fontSize: 13, color: C.textPrimary,
                background: '#f8fafc', outline: 'none',
                boxSizing: 'border-box', transition: 'all 0.2s',
              }}
              onFocus={e => (e.target.style.border = `2px solid ${C.green}`)}
              onBlur={e => (e.target.style.border = '2px solid #e8ecf0')}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <AnimatePresence>
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelected(selected === p.id ? null : p.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 15px', borderRadius: 14,
                    background: selected === p.id ? 'rgba(37,99,235,0.04)' : '#f8fafc',
                    border: selected === p.id
                      ? `2px solid ${C.blue}` : '1px solid #e8ecf0',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    if (selected !== p.id)
                      (e.currentTarget as HTMLDivElement).style.background = '#f0f4f8';
                  }}
                  onMouseLeave={e => {
                    if (selected !== p.id)
                      (e.currentTarget as HTMLDivElement).style.background = '#f8fafc';
                  }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: GRAD.green, flexShrink: 0,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#fff',
                    fontSize: 14, fontWeight: 700,
                    boxShadow: '0 3px 10px rgba(5,150,105,0.25)',
                  }}>
                    {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: 8, marginBottom: 3, flexWrap: 'wrap',
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>
                        {p.name}
                      </span>
                      <span style={{ fontSize: 11, color: C.textMuted }}>Age {p.age}</span>
                      {p.blood_type && (
                        <span style={{
                          fontSize: 10, padding: '2px 7px', borderRadius: 50,
                          background: 'rgba(239,68,68,0.1)',
                          color: C.red, fontWeight: 700,
                        }}>
                          {p.blood_type}
                        </span>
                      )}
                    </div>
                    <div style={{
                      display: 'flex', gap: 10, fontSize: 11,
                      color: C.textMuted, flexWrap: 'wrap',
                    }}>
                      <span>📋 {p.condition}</span>
                      <span>📊 {p.visits} visits</span>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusPill status={p.status} />
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setDeleteModal({ open: true, item: p });
                      }}
                      style={{
                        padding: '5px 9px', borderRadius: 8,
                        border: '1px solid rgba(239,68,68,0.2)',
                        background: 'rgba(239,68,68,0.05)',
                        color: C.red, fontSize: 11, cursor: 'pointer',
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: C.textMuted }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>👥</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
                  No patients found
                </div>
                <button onClick={onOpenAddPatient} style={{
                  marginTop: 10, padding: '8px 18px', borderRadius: 10,
                  border: 'none', background: GRAD.green,
                  color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}>
                  + Add First Patient
                </button>
              </div>
            )}
          </div>
        </Card>

        <AnimatePresence>
          {selectedPatient && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card topBarGrad={GRAD.green} style={{ position: 'sticky', top: 24 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', marginBottom: 18,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.blueDark }}>
                    Patient Profile
                  </div>
                  <button onClick={() => setSelected(null)} style={{
                    width: 26, height: 26, borderRadius: 7,
                    border: '1px solid #e8ecf0', background: '#f0f4f8',
                    cursor: 'pointer', fontSize: 13, color: C.textMuted,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    ✕
                  </button>
                </div>
                <div style={{ textAlign: 'center', marginBottom: 18 }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%',
                    background: GRAD.green, margin: '0 auto 10px',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#fff',
                    fontSize: 20, fontWeight: 700,
                    boxShadow: '0 8px 24px rgba(5,150,105,0.3)',
                  }}>
                    {selectedPatient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.textPrimary }}>
                    {selectedPatient.name}
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
                    Age {selectedPatient.age} · {selectedPatient.phone}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <StatusPill status={selectedPatient.status} />
                  </div>
                </div>

                {assignedDoctor && (
                  <div style={{
                    padding: '12px 14px', borderRadius: 12, marginBottom: 12,
                    background: 'rgba(37,99,235,0.05)',
                    border: '1px solid rgba(37,99,235,0.15)',
                  }}>
                    <div style={{
                      fontSize: 10, fontWeight: 700, color: C.blue,
                      textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6,
                    }}>
                      👨‍⚕️ Assigned Doctor
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>
                      {assignedDoctor.name}
                    </div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
                      {assignedDoctor.specialty}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Condition',    value: selectedPatient.condition,          icon: '📋' },
                    { label: 'Last Visit',   value: selectedPatient.last_visit,         icon: '🕐' },
                    { label: 'Total Visits', value: `${selectedPatient.visits} visits`, icon: '📊' },
                    { label: 'Blood Type',   value: selectedPatient.blood_type || '—',  icon: '🩸' },
                    { label: 'Email',        value: selectedPatient.email || '—',       icon: '📧' },
                    { label: 'Address',      value: selectedPatient.address  || '—',    icon: '📍' },
                  ].map(f => (
                    <div key={f.label} style={{
                      padding: '8px 12px', borderRadius: 9,
                      background: '#f8fafc', border: '1px solid #e8ecf0',
                    }}>
                      <div style={{
                        fontSize: 9, fontWeight: 700, color: C.textLight,
                        textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 2,
                      }}>
                        {f.icon} {f.label}
                      </div>
                      <div style={{
                        fontSize: 13, fontWeight: 700, color: C.textPrimary,
                        wordBreak: 'break-word',
                      }}>
                        {f.value}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={() => deleteModal.item && handleDelete(deleteModal.item)}
        itemName={deleteModal.item?.name || ''}
        itemType="Patient"
      />
    </>
  );
}

// ─────────────────────────────────────────────
// DOCTORS TAB
// ─────────────────────────────────────────────
function DoctorsTab({
  doctors, setDoctors, addToast, clinicId, onOpenAddDoctor,
}: {
  doctors: Doctor[];
  setDoctors: React.Dispatch<React.SetStateAction<Doctor[]>>;
  addToast: (msg: string, type?: Toast['type']) => void;
  clinicId: string;
  onOpenAddDoctor: () => void;
}) {
  const [deleteModal, setDeleteModal] =
    useState<{ open: boolean; item: Doctor | null }>({ open: false, item: null });

  const handleDelete = async (doctor: Doctor) => {
    const { error } = await supabase.from('doctors')
      .delete().eq('id', doctor.id).eq('clinic_id', clinicId);
    if (error) { addToast('Failed to remove doctor.', 'error'); return; }
    setDoctors(prev => prev.filter(d => d.id !== doctor.id));
    addToast(`${doctor.name} removed.`, 'info');
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'on-leave' : 'active';
    const { error } = await supabase.from('doctors')
      .update({ status: newStatus }).eq('id', id).eq('clinic_id', clinicId);
    if (error) { addToast('Failed to update status.', 'error'); return; }
    setDoctors(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
    addToast('Doctor status updated.', 'success');
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16,
        }}>
          {[
            { label: 'Total Doctors', value: doctors.length,                                      icon: '👨‍⚕️', grad: GRAD.primary },
            { label: 'Active Today',  value: doctors.filter(d => d.status === 'active').length,   icon: '✅',   grad: GRAD.green   },
            { label: 'On Leave',      value: doctors.filter(d => d.status === 'on-leave').length, icon: '🏖️',  grad: GRAD.amber   },
            {
              label: 'Avg Rating',
              value: doctors.length
                ? (doctors.reduce((s, d) => s + d.rating, 0) / doctors.length).toFixed(1)
                : '—',
              icon: '⭐', grad: GRAD.purple,
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{
                      fontSize: 9, fontWeight: 700, color: C.textLight,
                      textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6,
                    }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: C.textPrimary }}>
                      {s.value}
                    </div>
                  </div>
                  <div style={{
                    width: 38, height: 38, background: s.grad,
                    borderRadius: 10, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>
                    {s.icon}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <SectionHeader
            icon="👨‍⚕️" gradient={GRAD.primary}
            title="Medical Staff"
            subtitle={`${doctors.length} doctors registered`}
            action={<ActionBtn label="+ Add Doctor" onClick={onOpenAddDoctor} />}
          />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}>
            <AnimatePresence>
              {doctors.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.06 }}
                  style={{
                    background: '#f8fafc', borderRadius: 18, padding: '20px',
                    border: '1px solid #e8ecf0', transition: 'all 0.25s ease',
                    position: 'relative', overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)';
                    (e.currentTarget as HTMLDivElement).style.background = '#fff';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                    (e.currentTarget as HTMLDivElement).style.background = '#f8fafc';
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: 3, background: doc.grad, borderRadius: '18px 18px 0 0',
                  }} />
                  <div style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                      background: doc.grad, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 17, fontWeight: 700,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                    }}>
                      {doc.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 800, color: C.textPrimary,
                        marginBottom: 2, whiteSpace: 'nowrap',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {doc.name}
                      </div>
                      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 3 }}>
                        {doc.specialty}
                      </div>
                      {doc.experience && (
                        <div style={{ fontSize: 11, color: C.textLight }}>
                          📅 {doc.experience}
                        </div>
                      )}
                      <div style={{
                        display: 'flex', alignItems: 'center',
                        gap: 8, marginTop: 5, flexWrap: 'wrap',
                      }}>
                        <div style={{ display: 'flex', gap: 1 }}>
                          {[1,2,3,4,5].map(s => (
                            <span key={s} style={{
                              fontSize: 10,
                              color: s <= Math.floor(doc.rating) ? '#f59e0b' : '#e8ecf0',
                            }}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.textPrimary }}>
                          {doc.rating}
                        </span>
                        <StatusPill status={doc.status} />
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 8, marginBottom: 12,
                  }}>
                    {[
                      { label: 'Patients',    value: doc.patients          },
                      { label: 'Revenue',     value: `$${doc.revenue}`     },
                      { label: 'Utilization', value: `${doc.utilization}%` },
                    ].map(s => (
                      <div key={s.label} style={{
                        padding: '7px', borderRadius: 9,
                        background: '#fff', border: '1px solid #e8ecf0',
                        textAlign: 'center',
                      }}>
                        <div style={{
                          fontSize: 9, color: C.textLight, fontWeight: 600,
                          textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2,
                        }}>
                          {s.label}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: C.textPrimary }}>
                          {s.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {doc.email && (
                    <div style={{
                      fontSize: 11, color: C.textMuted, marginBottom: 2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      📧 {doc.email}
                    </div>
                  )}
                  {doc.phone && (
                    <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 10 }}>
                      📞 {doc.phone}
                    </div>
                  )}

                  {doc.status !== 'on-leave' && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontSize: 10, color: C.textMuted, marginBottom: 4,
                      }}>
                        <span>Capacity</span>
                        <span style={{
                          fontWeight: 700,
                          color: doc.utilization >= 80 ? '#059669' : C.blue,
                        }}>
                          {doc.utilization}%
                        </span>
                      </div>
                      <div style={{ height: 5, background: '#f0f4f8', borderRadius: 3 }}>
                        <div style={{
                          height: '100%', width: `${doc.utilization}%`,
                          background: doc.utilization >= 80 ? GRAD.green : GRAD.primary,
                          borderRadius: 3, transition: 'width 0.8s ease',
                        }} />
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleStatusToggle(doc.id, doc.status)}
                      style={{
                        flex: 1, padding: '8px', borderRadius: 9,
                        border: '1px solid #e8ecf0', background: '#fff',
                        color: C.textMuted, fontSize: 12, cursor: 'pointer',
                      }}
                    >
                      {doc.status === 'active' ? '🏖️ Leave' : '✅ Activate'}
                    </button>
                    <button
                      onClick={() => setDeleteModal({ open: true, item: doc })}
                      style={{
                        padding: '8px 12px', borderRadius: 9,
                        border: '1px solid rgba(239,68,68,0.2)',
                        background: 'rgba(239,68,68,0.05)',
                        color: C.red, fontSize: 12, cursor: 'pointer',
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: doctors.length * 0.06 }}
              onClick={onOpenAddDoctor}
              style={{
                background: '#f8fafc', borderRadius: 18, padding: '20px',
                border: '2px dashed #e8ecf0', cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                minHeight: 200, gap: 12, transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = C.blue;
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(37,99,235,0.03)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = '#e8ecf0';
                (e.currentTarget as HTMLDivElement).style.background = '#f8fafc';
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(37,99,235,0.08)',
                border: `2px dashed ${C.blue}`,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 22,
              }}>
                ➕
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.blue }}>
                Add New Doctor
              </div>
              <div style={{ fontSize: 12, color: C.textLight, textAlign: 'center' }}>
                Set credentials and register a doctor
              </div>
            </motion.div>
          </div>
        </Card>
      </div>

      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={() => deleteModal.item && handleDelete(deleteModal.item)}
        itemName={deleteModal.item?.name || ''}
        itemType="Doctor"
      />
    </>
  );
}

// ─────────────────────────────────────────────
// ANALYTICS TAB
// ─────────────────────────────────────────────
function AnalyticsTab({
  appointments, patients, doctors,
}: {
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
}) {
  const months      = ['Jan','Feb','Mar','Apr','May','Jun'];
  const revenueData = [68, 74, 65, 88, 92, 85];
  const noShowData  = [12, 10, 9, 7, 5, 4.2];

  const totalRevenue = appointments
    .filter(a => a.status === 'completed')
    .reduce((s, a) => s + a.fee, 0);

  const completionRate = appointments.length
    ? Math.round(
        (appointments.filter(a => a.status === 'completed').length /
          appointments.length) * 100)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 20,
      }}>
        {[
          { label: 'Total Revenue',       value: `$${totalRevenue.toLocaleString()}`, change: '+18%', icon: '💰', grad: GRAD.primary },
          { label: 'Total Appointments',  value: String(appointments.length),          change: '+22%', icon: '📅', grad: GRAD.green   },
          { label: 'Registered Patients', value: String(patients.length),              change: '+31%', icon: '👥', grad: GRAD.purple  },
          { label: 'Completion Rate',     value: `${completionRate}%`,                change: '+5%',  icon: '✅', grad: GRAD.amber   },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: C.textLight,
                    textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8,
                  }}>
                    {k.label}
                  </div>
                  <div style={{
                    fontSize: 30, fontWeight: 900, color: C.textPrimary, letterSpacing: '-0.5px',
                  }}>
                    {k.value}
                  </div>
                  <div style={{ fontSize: 12, color: '#059669', fontWeight: 700, marginTop: 6 }}>
                    {k.change} vs last month
                  </div>
                </div>
                <div style={{
                  width: 44, height: 44, background: k.grad, borderRadius: 12,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 20,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                }}>
                  {k.icon}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24,
      }}>
        <Card topBarGrad={GRAD.primary}>
          <SectionHeader
            icon="📈" gradient={GRAD.primary}
            title="Revenue Trend" subtitle="Jan – Jun 2025"
          />
          <div style={{
            display: 'flex', alignItems: 'flex-end',
            gap: 12, height: 120, marginBottom: 12,
          }}>
            {revenueData.map((h, i) => (
              <div key={i} style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 6,
              }}>
                <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 600 }}>
                  ${h}k
                </div>
                <div style={{
                  width: '100%', height: `${(h / 100) * 100}%`,
                  background: i === 4 ? GRAD.primary : 'rgba(37,99,235,0.12)',
                  borderRadius: '6px 6px 0 0',
                }} />
                <span style={{ fontSize: 11, color: C.textLight, fontWeight: 600 }}>
                  {months[i]}
                </span>
              </div>
            ))}
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 16px', background: '#f8fafc',
            borderRadius: 14, border: '1px solid #e8ecf0',
          }}>
            <div>
              <div style={{ fontSize: 11, color: C.textLight, fontWeight: 600 }}>
                6-Month Total
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: C.blueDark }}>
                $472,000
              </div>
            </div>
            <div style={{
              padding: '7px 14px', borderRadius: 50,
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.2)',
              fontSize: 13, fontWeight: 700, color: '#059669',
            }}>
              ↑ 18% growth
            </div>
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card topBarGrad={GRAD.green}>
            <SectionHeader
              icon="📉" gradient={GRAD.green}
              title="No-show Rate" subtitle="Jan – Jun 2025"
            />
            <div style={{
              display: 'flex', alignItems: 'flex-end',
              gap: 8, height: 60, marginBottom: 10,
            }}>
              {noShowData.map((h, i) => (
                <div key={i} style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 3,
                }}>
                  <div style={{
                    width: '100%', height: `${(h / 15) * 100}%`,
                    background: i === 5 ? GRAD.green : 'rgba(16,185,129,0.2)',
                    borderRadius: '4px 4px 0 0',
                  }} />
                  <span style={{ fontSize: 8, color: C.textLight }}>
                    {months[i].slice(0, 1)}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: C.textMuted }}>Current rate</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#059669' }}>4.2% ↓</span>
            </div>
          </Card>

          <Card topBarGrad={GRAD.purple}>
            <SectionHeader
              icon="🏥" gradient={GRAD.purple}
              title="By Specialty" subtitle="This month"
            />
            {[
              { name: 'General Medicine', pct: 42, count: 108 },
              { name: 'Cardiology',       pct: 28, count:  72 },
              { name: 'Pediatrics',       pct: 18, count:  46 },
              { name: 'Orthopedics',      pct: 12, count:  30 },
            ].map((s, i) => (
              <div key={s.name} style={{ marginBottom: i < 3 ? 12 : 0 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', marginBottom: 5,
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary }}>
                    {s.name}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.textMuted }}>
                    {s.count} appts
                  </span>
                </div>
                <div style={{ height: 6, background: '#f0f4f8', borderRadius: 3 }}>
                  <div style={{
                    height: '100%', width: `${s.pct}%`,
                    background: [GRAD.primary,GRAD.green,GRAD.purple,GRAD.amber][i],
                    borderRadius: 3,
                  }} />
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
  const totalRevenue = appointments
    .filter(a => a.status === 'completed')
    .reduce((s, a) => s + a.fee, 0);

  const invoices = appointments
    .filter(a => a.status === 'completed' || a.status === 'upcoming')
    .slice(0, 8)
    .map((a, i) => ({
      id:      `INV-2025-00${i + 1}`,
      patient: a.patient_name,
      doctor:  a.doctor_name,
      amount:  a.fee,
      date:    a.date,
      status:  a.status === 'completed' ? 'paid' : 'pending',
    }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 20,
      }}>
        {[
          { label: 'Collected',     value: `$${totalRevenue.toLocaleString()}`, icon: '✅', grad: GRAD.green   },
          { label: 'Pending',       value: '$1,240',                            icon: '⏳', grad: GRAD.amber   },
          { label: 'Overdue',       value: '$450',                              icon: '⚠️', grad: GRAD.red     },
          { label: 'Monthly Total', value: '$98,240',                           icon: '💰', grad: GRAD.primary },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: C.textLight,
                    textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8,
                  }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: C.textPrimary }}>
                    {s.value}
                  </div>
                </div>
                <div style={{
                  width: 44, height: 44, background: s.grad, borderRadius: 12,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 20,
                }}>
                  {s.icon}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <SectionHeader
          icon="💳" gradient={GRAD.primary}
          title="Recent Invoices" subtitle="Billing records"
          action={
            <ActionBtn
              label="Export CSV"
              gradient="linear-gradient(135deg,#64748b,#94a3b8)"
              small
            />
          }
        />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr>
                {['Invoice','Patient','Doctor','Amount','Date','Status',''].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', fontSize: 10, fontWeight: 700,
                    color: C.textLight, textTransform: 'uppercase',
                    letterSpacing: '1px', paddingBottom: 12,
                    borderBottom: '1px solid #e8ecf0',
                    paddingRight: 12, whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => (
                <motion.tr
                  key={inv.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ borderBottom: '1px solid #f0f4f8' }}
                >
                  <td style={{
                    padding: '12px 12px 12px 0', fontSize: 12,
                    fontWeight: 700, color: C.blue, fontFamily: 'monospace',
                  }}>
                    {inv.id}
                  </td>
                  <td style={{
                    padding: '12px 12px 12px 0',
                    fontSize: 13, fontWeight: 600, color: C.textPrimary,
                  }}>
                    {inv.patient}
                  </td>
                  <td style={{ padding: '12px 12px 12px 0', fontSize: 13, color: C.textMuted }}>
                    {inv.doctor}
                  </td>
                  <td style={{
                    padding: '12px 12px 12px 0',
                    fontSize: 14, fontWeight: 800, color: C.textPrimary,
                  }}>
                    ${inv.amount}
                  </td>
                  <td style={{ padding: '12px 12px 12px 0', fontSize: 12, color: C.textMuted }}>
                    {inv.date}
                  </td>
                  <td style={{ padding: '12px 12px 12px 0' }}>
                    <StatusPill status={inv.status} />
                  </td>
                  <td style={{ padding: '12px 0' }}>
                    <button style={{
                      padding: '4px 10px', borderRadius: 7,
                      border: '1px solid #e8ecf0', background: '#fff',
                      color: C.textMuted, fontSize: 11, cursor: 'pointer',
                    }}>
                      View
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {invoices.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: C.textMuted }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>No invoices yet</div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// SETTINGS TAB
// ─────────────────────────────────────────────
function SettingsTab({
  user, clinic,
}: {
  user: User | null;
  clinic: Clinic | null;
}) {
  const displayName = user?.user_metadata?.full_name
    || user?.email?.split('@')[0] || 'Admin';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: 24,
    }}>
      <Card>
        <SectionHeader
          icon="🏥" gradient={GRAD.primary}
          title="Clinic Profile" subtitle="Basic information"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Clinic Name', value: clinic?.name    || 'My Clinic',        icon: '🏥' },
            { label: 'Admin Name',  value: displayName,                            icon: '👤' },
            { label: 'Email',       value: clinic?.email   || user?.email || '—', icon: '📧' },
            { label: 'Phone',       value: clinic?.phone   || '—',                icon: '📞' },
            { label: 'Address',     value: clinic?.address || '—',                icon: '📍' },
            { label: 'Plan',        value: 'Clinic Plan · $249/mo',               icon: '💎' },
          ].map(f => (
            <div key={f.label} style={{
              padding: '10px 12px', borderRadius: 11,
              background: '#f8fafc', border: '1px solid #e8ecf0',
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: C.textLight,
                textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 3,
              }}>
                {f.icon} {f.label}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>
                {f.value}
              </div>
            </div>
          ))}
          <ActionBtn label="Update Profile" />
        </div>
      </Card>

      <Card topBarGrad={GRAD.green}>
        <SectionHeader
          icon="🔔" gradient={GRAD.green}
          title="Notifications" subtitle="Reminder configuration"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'SMS reminders to patients',   enabled: true  },
            { label: 'Email reminders to patients', enabled: true  },
            { label: '48h appointment reminders',   enabled: true  },
            { label: '24h appointment reminders',   enabled: true  },
            { label: 'No-show notifications',       enabled: true  },
            { label: '2h appointment reminders',    enabled: false },
          ].map(setting => (
            <div key={setting.label} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '10px 12px', borderRadius: 11,
              background: '#f8fafc', border: '1px solid #e8ecf0',
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>
                {setting.label}
              </span>
              <div style={{
                width: 40, height: 22, borderRadius: 50,
                background: setting.enabled ? GRAD.green : '#e8ecf0',
                cursor: 'pointer', position: 'relative',
              }}>
                <div style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#fff', position: 'absolute', top: 3,
                  left: setting.enabled ? 21 : 3, transition: 'left 0.2s',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card topBarGrad={GRAD.purple}>
        <SectionHeader
          icon="🔒" gradient={GRAD.purple}
          title="Security" subtitle="Access & compliance"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Two-Factor Authentication', value: 'Enabled',  good: true },
            { label: 'HIPAA-Ready Architecture',  value: 'Active',   good: true },
            { label: 'Audit Log',                 value: 'Enabled',  good: true },
            { label: 'Data Encryption (AES-256)', value: 'Active',   good: true },
            { label: 'Last Security Review',      value: 'May 2025', good: true },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '10px 12px', borderRadius: 11,
              background: '#f8fafc', border: '1px solid #e8ecf0',
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>
                {item.label}
              </span>
              <div style={{
                padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700,
                background: item.good ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: item.good ? '#059669' : '#dc2626',
                border: `1px solid ${item.good
                  ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
              }}>
                {item.value}
              </div>
            </div>
          ))}
          <ActionBtn label="Download Compliance Report" gradient={GRAD.purple} />
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN ADMIN DASHBOARD
// ─────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();

  const [activeTab,      setActiveTab]      = useState('overview');
  const [collapsed,      setCollapsed]      = useState(false);
  const [apptModalOpen,  setApptModalOpen]  = useState(false);
  const [addDoctorOpen,  setAddDoctorOpen]  = useState(false);
  const [addPatientOpen, setAddPatientOpen] = useState(false);

  const [user,        setUser]        = useState<User | null>(null);
  const [clinic,      setClinic]      = useState<Clinic | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [authError,   setAuthError]   = useState('');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients,     setPatients]     = useState<Patient[]>([]);
  const [doctors,      setDoctors]      = useState<Doctor[]>([]);

  const { toasts, addToast, removeToast } = useToast();

  // ─────────────────────────────────────────────
  // AUTH CHECK
  // ─────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { user: authUser }, error: userError } =
          await supabase.auth.getUser();

        if (userError || !authUser) {
          if (mounted) router.replace('/login');
          return;
        }

        let role: string | null = null;
        for (let attempt = 0; attempt < 3; attempt++) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authUser.id)
            .maybeSingle();

          if (profile?.role) { role = profile.role; break; }
          if (attempt < 2) await new Promise(r => setTimeout(r, 1000));
        }

        if (!mounted) return;

        if (!role) {
          const meta     = authUser.user_metadata ?? {};
          const metaRole = (meta.role as string) ?? 'admin';
          await supabase.from('profiles').upsert(
            {
              id:        authUser.id,
              role:      metaRole,
              full_name: (meta.full_name as string) ?? '',
              email:     authUser.email ?? '',
            },
            { onConflict: 'id' }
          );
          role = metaRole;
        }

        if (role !== 'admin') {
          const dest = role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient';
          if (mounted) router.replace(dest);
          return;
        }

        if (mounted) {
          setUser(authUser);
          setAuthLoading(false);
        }
      } catch (err) {
        console.error('Admin auth error:', err);
        if (mounted) {
          setAuthError('Authentication failed. Please refresh the page.');
          setAuthLoading(false);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_OUT' && mounted) router.replace('/login');
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, [router]);

  // ─────────────────────────────────────────────
  // LOAD CLINIC DATA
  // ─────────────────────────────────────────────
  const loadData = useCallback(async (uid: string) => {
    setDataLoading(true);
    try {
      let { data: clinicData } = await supabase
        .from('clinics')
        .select('*')
        .eq('admin_id', uid)
        .maybeSingle();

      if (!clinicData) {
        console.warn('[MediBook] No clinic found for admin — creating one...');
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', uid)
          .maybeSingle();

        const name  = profile?.full_name
          ? `${profile.full_name}'s Clinic`
          : 'My Clinic';
        const email = profile?.email ?? '';

        const { data: newClinic, error: createError } = await supabase
          .from('clinics')
          .insert({ admin_id: uid, name, email })
          .select('*')
          .single();

        if (!createError && newClinic) {
          clinicData = newClinic;
          await supabase
            .from('profiles')
            .update({ clinic_id: newClinic.id })
            .eq('id', uid);
          addToast('Clinic profile created automatically.', 'info');
        } else {
          console.error('[MediBook] Could not create clinic:', createError?.message);
          addToast('Could not load clinic data. Some features may be limited.', 'error');
          setDataLoading(false);
          return;
        }
      }

      setClinic(clinicData);
      const cid = clinicData.id;

      const [
        { data: doctorRows  },
        { data: patientRows },
        { data: apptRows    },
      ] = await Promise.all([
        supabase.from('doctors')
          .select('*').eq('clinic_id', cid)
          .order('created_at', { ascending: true }),
        supabase.from('patients')
          .select('*').eq('clinic_id', cid)
          .order('created_at', { ascending: true }),
        supabase.from('appointments')
          .select('*').eq('clinic_id', cid)
          .order('created_at', { ascending: false }),
      ]);

      setDoctors(doctorRows   ?? []);
      setPatients(patientRows ?? []);
      setAppointments(apptRows ?? []);
    } catch (err) {
      console.error('Load error:', err);
      addToast('Failed to load clinic data.', 'error');
    } finally {
      setDataLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (user) loadData(user.id);
  }, [user, loadData]);

  // ─────────────────────────────────────────────
  // SAVE APPOINTMENT
  // ─────────────────────────────────────────────
  const handleSaveAppointment = async (data: Appointment) => {
    if (!user || !clinic) return;
    const { error } = await supabase.from('appointments').upsert({
      id:           data.id,
      clinic_id:    clinic.id,
      user_id:      user.id,
      doctor_id:    data.doctor_id  ?? null,
      patient_id:   data.patient_id ?? null,
      doctor_name:  data.doctor_name,
      patient_name: data.patient_name,
      type:         data.type,
      time:         data.time,
      date:         data.date,
      room:         data.room,
      fee:          data.fee,
      status:       data.status,
      notes:        data.notes ?? '',
    });
    if (error) { addToast('Failed to save.', 'error'); return; }
    const exists = appointments.find(a => a.id === data.id);
    if (exists) setAppointments(prev => prev.map(a => a.id === data.id ? data : a));
    else setAppointments(prev => [data, ...prev]);
    addToast('Appointment scheduled!', 'success');
  };

  // ─────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  // ─────────────────────────────────────────────
  // RENDER STATES
  // ─────────────────────────────────────────────
  if (authLoading) return <PageLoader />;

  if (authError) {
    return (
      <div style={{
        minHeight: '100vh', background: '#f0f4f8',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column',
        gap: 16, fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}>
        <div style={{ fontSize: 48 }}>⚠️</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#0f1729' }}>
          {authError}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg,#1e3c7d,#2563eb)',
            color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Refresh Page
        </button>
      </div>
    );
  }

  if (dataLoading) return <PageLoader />;
  if (!user) return null;

  const tabMeta: Record<string, { title: string; subtitle: string }> = {
    overview: {
      title:    'Clinic Overview',
      subtitle: `${clinic?.name || 'Your Clinic'} · ${new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })}`,
    },
    appointments: {
      title:    'Appointments',
      subtitle: `${appointments.length} total appointments`,
    },
    patients: {
      title:    'Patient Records',
      subtitle: `${patients.length} registered patients`,
    },
    doctors: {
      title:    'Medical Staff',
      subtitle: `${doctors.length} doctors · ${doctors.filter(d => d.status === 'active').length} active`,
    },
    analytics: {
      title:    'Clinic Analytics',
      subtitle: 'Performance data Jan – Jun 2025',
    },
    billing: {
      title:    'Billing & Invoices',
      subtitle: "Today's financial summary",
    },
    settings: {
      title:    'Clinic Settings',
      subtitle: 'Profile, notifications, and security',
    },
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

      <div style={{
        display: 'flex', minHeight: '100vh', background: C.page,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}>
        <Sidebar
          activeTab={activeTab} setActiveTab={setActiveTab}
          collapsed={collapsed} setCollapsed={setCollapsed}
          user={user} clinic={clinic} onLogout={handleLogout}
        />

        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          overflow: 'auto', minWidth: 0,
        }}>
          <TopBar title={current.title} subtitle={current.subtitle} user={user} />

          <div style={{ flex: 1, padding: '24px 28px', minHeight: 0 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                {activeTab === 'overview' && (
                  <OverviewTab
                    setActiveTab={setActiveTab}
                    appointments={appointments}
                    openApptModal={() => setApptModalOpen(true)}
                    doctors={doctors}
                    patients={patients}
                  />
                )}
                {activeTab === 'appointments' && clinic && (
                  <AppointmentsTab
                    appointments={appointments}
                    setAppointments={setAppointments}
                    doctors={doctors}
                    patients={patients}
                    addToast={addToast}
                    clinicId={clinic.id}
                    userId={user.id}
                  />
                )}
                {activeTab === 'patients' && clinic && (
                  <PatientsTab
                    patients={patients}
                    setPatients={setPatients}
                    doctors={doctors}
                    addToast={addToast}
                    clinicId={clinic.id}
                    onOpenAddPatient={() => setAddPatientOpen(true)}
                  />
                )}
                {activeTab === 'doctors' && clinic && (
                  <DoctorsTab
                    doctors={doctors}
                    setDoctors={setDoctors}
                    addToast={addToast}
                    clinicId={clinic.id}
                    onOpenAddDoctor={() => setAddDoctorOpen(true)}
                  />
                )}
                {activeTab === 'analytics' && (
                  <AnalyticsTab
                    appointments={appointments}
                    patients={patients}
                    doctors={doctors}
                  />
                )}
                {activeTab === 'billing' && (
                  <BillingTab appointments={appointments} />
                )}
                {activeTab === 'settings' && (
                  <SettingsTab user={user} clinic={clinic} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AppointmentModal
        isOpen={apptModalOpen}
        onClose={() => setApptModalOpen(false)}
        onSave={handleSaveAppointment}
        doctors={doctors}
        patients={patients}
        editData={null}
      />

      {clinic && (
        <>
          <AddDoctorModal
            isOpen={addDoctorOpen}
            onClose={() => setAddDoctorOpen(false)}
            clinicId={clinic.id}
            onDoctorAdded={d => setDoctors(prev => [d, ...prev])}
            addToast={addToast}
          />
          <AddPatientModal
            isOpen={addPatientOpen}
            onClose={() => setAddPatientOpen(false)}
            clinicId={clinic.id}
            doctors={doctors}
            onPatientAdded={p => setPatients(prev => [p, ...prev])}
            addToast={addToast}
          />
        </>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}