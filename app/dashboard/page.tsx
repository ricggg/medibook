"use client";

import React, { useState } from 'react';
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
// DATA
// ─────────────────────────────────────────────
const APPOINTMENTS_DATA = [
  { id: 'a1', time: '09:00 AM', patient: 'James Doe',      doctor: 'Dr. Sarah Mitchell',  type: 'Annual Checkup',       status: 'completed', room: '1A', fee: 120 },
  { id: 'a2', time: '09:45 AM', patient: 'Maria Chen',     doctor: 'Dr. Emily Rodriguez', type: 'Follow-up Consult',    status: 'completed', room: '2B', fee: 90  },
  { id: 'a3', time: '10:30 AM', patient: 'Robert Singh',   doctor: 'Dr. Michael Patel',   type: 'Orthopedic Eval',      status: 'in-progress', room: '3A', fee: 150 },
  { id: 'a4', time: '11:15 AM', patient: 'Sarah Kim',      doctor: 'Dr. David Kim',       type: 'Neurology Consult',    status: 'upcoming',  room: '1B', fee: 140 },
  { id: 'a5', time: '12:00 PM', patient: 'Tom Harrison',   doctor: 'Dr. Lisa Thompson',   type: 'General Checkup',      status: 'upcoming',  room: '2A', fee: 80  },
  { id: 'a6', time: '02:00 PM', patient: 'Priya Sharma',   doctor: 'Dr. Sarah Mitchell',  type: 'Cardiac Follow-up',    status: 'upcoming',  room: '1A', fee: 120 },
  { id: 'a7', time: '02:45 PM', patient: 'Marcus Johnson', doctor: 'Dr. Emily Rodriguez', type: 'Pediatric Checkup',    status: 'upcoming',  room: '2B', fee: 90  },
  { id: 'a8', time: '03:30 PM', patient: 'Rachel Brown',   doctor: 'Dr. Michael Patel',   type: 'Post-Surgery Review',  status: 'cancelled', room: '3A', fee: 150 },
];

const DOCTORS_DATA = [
  { id: 'd1', name: 'Dr. Sarah Mitchell',  specialty: 'Cardiologist',      patients: 8,  utilization: 88, rating: 4.9, status: 'active',  revenue: 960,  initials: 'SM', grad: GRAD.primary },
  { id: 'd2', name: 'Dr. Emily Rodriguez', specialty: 'Pediatrician',      patients: 7,  utilization: 74, rating: 5.0, status: 'active',  revenue: 630,  initials: 'ER', grad: GRAD.green   },
  { id: 'd3', name: 'Dr. Michael Patel',   specialty: 'Orthopedic Surgeon',patients: 5,  utilization: 62, rating: 4.9, status: 'active',  revenue: 750,  initials: 'MP', grad: GRAD.purple  },
  { id: 'd4', name: 'Dr. David Kim',       specialty: 'Neurologist',       patients: 4,  utilization: 55, rating: 4.9, status: 'on-leave',revenue: 0,    initials: 'DK', grad: GRAD.amber   },
  { id: 'd5', name: 'Dr. Lisa Thompson',   specialty: 'General Physician', patients: 6,  utilization: 70, rating: 4.7, status: 'active',  revenue: 480,  initials: 'LT', grad: GRAD.red     },
];

const PATIENTS_DATA = [
  { id: 'p1', name: 'James Doe',      age: 45, phone: '+1 (555) 001-0001', lastVisit: 'Today 9:00 AM',  condition: 'Hypertension',    status: 'active',    visits: 12 },
  { id: 'p2', name: 'Maria Chen',     age: 32, phone: '+1 (555) 001-0002', lastVisit: 'Today 9:45 AM',  condition: 'Seasonal Allergy',status: 'active',    visits: 4  },
  { id: 'p3', name: 'Robert Singh',   age: 58, phone: '+1 (555) 001-0003', lastVisit: 'Today 10:30 AM', condition: 'Knee Replacement',status: 'in-treatment', visits: 8 },
  { id: 'p4', name: 'Sarah Kim',      age: 29, phone: '+1 (555) 001-0004', lastVisit: 'May 10, 2025',   condition: 'Migraine',        status: 'active',    visits: 3  },
  { id: 'p5', name: 'Tom Harrison',   age: 67, phone: '+1 (555) 001-0005', lastVisit: 'May 8, 2025',    condition: 'Diabetes Type 2', status: 'active',    visits: 18 },
  { id: 'p6', name: 'Rachel Brown',   age: 41, phone: '+1 (555) 001-0006', lastVisit: 'Apr 28, 2025',   condition: 'Post-Surgery',    status: 'monitoring', visits: 6 },
];

const WEEKLY_REVENUE = [38, 52, 44, 68, 58, 82, 64];

// ─────────────────────────────────────────────
// SHARED COMPONENTS
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
  };
  const s = map[status] ?? map['upcoming'];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 50,
      background: s.bg, border: `1px solid ${s.dot}40`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {s.label}
      </span>
    </div>
  );
}

function Card({
  children, style = {},
  topBarGrad = GRAD.topBar,
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
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: topBarGrad, borderRadius: '20px 20px 0 0',
      }} />
      {children}
    </div>
  );
}

function SectionHeader({
  icon, gradient, title, subtitle, action,
}: {
  icon: string; gradient: string; title: string;
  subtitle: string; action?: React.ReactNode;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      paddingBottom: 18, marginBottom: 22,
      borderBottom: '2px solid #e8ecf0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 38, height: 38, background: gradient, borderRadius: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0, boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.blueDark }}>{title}</div>
          <div style={{ fontSize: 12, color: C.textLight, marginTop: 1 }}>{subtitle}</div>
        </div>
      </div>
      {action}
    </div>
  );
}

function ActionBtn({
  label, gradient = GRAD.primary, onClick, small = false,
}: {
  label: string; gradient?: string; onClick?: () => void; small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: small ? '7px 14px' : '10px 20px',
        borderRadius: 10, border: 'none', cursor: 'pointer',
        background: gradient, color: '#fff',
        fontSize: small ? 12 : 13, fontWeight: 700,
        boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────
function Sidebar({
  activeTab, setActiveTab, collapsed, setCollapsed,
}: {
  activeTab: string; setActiveTab: (t: string) => void;
  collapsed: boolean; setCollapsed: (v: boolean) => void;
}) {
  const sections = [
    {
      label: '📌 Main',
      items: [
        { id: 'overview',     icon: '📊', label: 'Overview'         },
        { id: 'appointments', icon: '📅', label: 'Appointments'     },
        { id: 'patients',     icon: '👥', label: 'Patients'         },
        { id: 'doctors',      icon: '👨‍⚕️', label: 'Doctors'          },
        { id: 'analytics',    icon: '📈', label: 'Analytics'        },
      ],
    },
    {
      label: '⚙️ Manage',
      items: [
        { id: 'billing',      icon: '💰', label: 'Billing'          },
        { id: 'settings',     icon: '⚙️', label: 'Settings'         },
      ],
    },
  ];

  return (
    <motion.div
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.3 }}
      style={{
        minHeight: '100vh',
        background: GRAD.hero,
        display: 'flex', flexDirection: 'column',
        padding: collapsed ? '24px 10px' : '24px 14px',
        flexShrink: 0, overflow: 'hidden',
        boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
      }}
    >
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 28, paddingBottom: 20,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #2563eb, #818cf8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0,
          boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
        }}>🏥</div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', lineHeight: 1 }}>MediBook</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.2px', marginTop: 2 }}>Admin Portal</div>
          </div>
        )}
      </div>

      {/* Clinic info */}
      {!collapsed && (
        <div style={{
          padding: '12px 14px', marginBottom: 24,
          background: 'rgba(255,255,255,0.07)',
          borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: GRAD.green, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}>🏥</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>Riverside Family Clinic</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Admin Account</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <div style={{ flex: 1 }}>
        {sections.map(section => (
          <div key={section.label} style={{ marginBottom: 20 }}>
            {!collapsed && (
              <div style={{
                fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.28)',
                textTransform: 'uppercase', letterSpacing: '1.5px',
                marginBottom: 8, paddingLeft: 10,
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
                      gap: collapsed ? 0 : 11,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      padding: collapsed ? '11px' : '11px 12px',
                      borderRadius: 11, border: 'none', cursor: 'pointer',
                      background: isActive ? 'rgba(255,255,255,0.14)' : 'transparent',
                      borderLeft: isActive && !collapsed ? '3px solid #ffd700' : '3px solid transparent',
                      transition: 'all 0.2s ease', width: '100%',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
                    }}
                    onMouseLeave={e => {
                      if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    }}
                  >
                    <span style={{ fontSize: 17, flexShrink: 0 }}>{item.icon}</span>
                    {!collapsed && (
                      <span style={{
                        fontSize: 13, fontWeight: isActive ? 700 : 500,
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

      {/* Bottom actions */}
      <div style={{
        marginTop: 'auto', paddingTop: 16,
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display: 'flex', alignItems: 'center',
            gap: collapsed ? 0 : 11, justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '11px' : '11px 12px',
            borderRadius: 11, border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'rgba(255,255,255,0.5)',
            fontSize: 13, fontWeight: 500, width: '100%',
          }}
        >
          <span style={{ fontSize: 17 }}>{collapsed ? '→' : '←'}</span>
          {!collapsed && <span>Collapse</span>}
        </button>
        <a href="/"
          style={{
            display: 'flex', alignItems: 'center',
            gap: collapsed ? 0 : 11, justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '11px' : '11px 12px',
            borderRadius: 11, cursor: 'pointer',
            background: 'transparent', color: 'rgba(255,255,255,0.5)',
            fontSize: 13, fontWeight: 500, textDecoration: 'none',
          }}
        >
          <span style={{ fontSize: 17 }}>🏠</span>
          {!collapsed && <span>Back to Home</span>}
        </a>
        <a href="/login"
          style={{
            display: 'flex', alignItems: 'center',
            gap: collapsed ? 0 : 11, justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '11px' : '11px 12px',
            borderRadius: 11, cursor: 'pointer',
            background: 'transparent', color: 'rgba(255,255,255,0.5)',
            fontSize: 13, fontWeight: 500, textDecoration: 'none',
          }}
        >
          <span style={{ fontSize: 17 }}>🚪</span>
          {!collapsed && <span>Logout</span>}
        </a>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// OVERVIEW TAB
// ─────────────────────────────────────────────
function OverviewTab({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const stats = [
    { label: "Today's Appointments", value: '24', sub: '+3 vs yesterday', icon: '📅', grad: GRAD.primary, pos: true },
    { label: 'Active Patients',       value: '1,284', sub: '+12 this week',   icon: '👥', grad: GRAD.green,   pos: true },
    { label: 'No-show Rate',          value: '4.2%',  sub: 'Down 61% ↓',     icon: '📉', grad: GRAD.amber,   pos: true },
    { label: "Today's Revenue",       value: '$3,840', sub: '+8% vs avg',     icon: '💰', grad: GRAD.purple,  pos: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 20 }}>
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
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: s.grad, borderRadius: '20px 20px 0 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>{s.label}</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: C.textPrimary, lineHeight: 1, letterSpacing: '-1px' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 8 }}>{s.sub}</div>
              </div>
              <div style={{ width: 48, height: 48, background: s.grad, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                {s.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
        {/* Appointment list */}
        <Card>
          <SectionHeader
            icon="📅" gradient={GRAD.primary}
            title="Today's Appointments" subtitle="Live clinic schedule"
            action={<ActionBtn label="+ New Appointment" small onClick={() => setActiveTab('appointments')} />}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {APPOINTMENTS_DATA.slice(0, 5).map((apt, i) => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 16px', borderRadius: 14,
                  background: apt.status === 'in-progress' ? 'rgba(16,185,129,0.06)' : '#f8fafc',
                  border: apt.status === 'in-progress' ? '1px solid rgba(16,185,129,0.25)' : '1px solid #e8ecf0',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  if (apt.status !== 'in-progress') {
                    (e.currentTarget as HTMLDivElement).style.background = '#f0f4f8';
                  }
                }}
                onMouseLeave={e => {
                  if (apt.status !== 'in-progress') {
                    (e.currentTarget as HTMLDivElement).style.background = '#f8fafc';
                  }
                }}
              >
                <div style={{
                  minWidth: 68, textAlign: 'center',
                  padding: '7px 8px', background: '#fff',
                  borderRadius: 10, border: '1px solid #e8ecf0',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: C.textPrimary, lineHeight: 1 }}>
                    {apt.time.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: 9, color: C.textLight, marginTop: 2 }}>
                    {apt.time.split(' ')[1]}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>{apt.patient}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
                    {apt.doctor} · {apt.type} · Room {apt.room}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <StatusPill status={apt.status} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.textPrimary, marginTop: 6 }}>
                    ${apt.fee}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <button
            onClick={() => setActiveTab('appointments')}
            style={{
              width: '100%', marginTop: 14, padding: '10px',
              borderRadius: 12, border: '1px solid #e8ecf0',
              background: '#f8fafc', color: C.textMuted,
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            View All 24 Appointments →
          </button>
        </Card>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Revenue chart */}
          <Card topBarGrad={GRAD.purple}>
            <SectionHeader
              icon="💰" gradient={GRAD.purple}
              title="Weekly Revenue" subtitle="May 13–19, 2025"
            />
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80, marginBottom: 12 }}>
              {WEEKLY_REVENUE.map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: '100%', height: `${h}%`,
                    background: i === 5 ? GRAD.primary : 'rgba(37,99,235,0.12)',
                    borderRadius: '5px 5px 0 0',
                    transition: 'all 0.3s',
                  }} />
                  <span style={{ fontSize: 9, color: C.textLight, fontWeight: 600 }}>
                    {['M','T','W','T','F','S','S'][i]}
                  </span>
                </div>
              ))}
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', background: '#f8fafc', borderRadius: 12,
              border: '1px solid #e8ecf0',
            }}>
              <div>
                <div style={{ fontSize: 11, color: C.textLight, fontWeight: 600 }}>Week Total</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: C.blueDark, letterSpacing: '-0.5px' }}>$24,320</div>
              </div>
              <div style={{
                padding: '6px 12px', borderRadius: 50,
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                fontSize: 13, fontWeight: 700, color: '#059669',
              }}>
                ↑ 12% vs last week
              </div>
            </div>
          </Card>

          {/* Doctor utilization */}
          <Card topBarGrad={GRAD.green}>
            <SectionHeader
              icon="👨‍⚕️" gradient={GRAD.green}
              title="Doctor Utilization" subtitle="Today's capacity"
            />
            {DOCTORS_DATA.slice(0, 4).map((doc, i) => (
              <div key={doc.id} style={{ marginBottom: i < 3 ? 14 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: doc.grad,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 10, fontWeight: 700,
                    }}>
                      {doc.initials}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{doc.name.replace('Dr. ', 'Dr.')}</span>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: doc.utilization >= 80 ? '#059669' : doc.utilization >= 60 ? C.blue : C.amber,
                  }}>
                    {doc.status === 'on-leave' ? 'On Leave' : `${doc.utilization}%`}
                  </span>
                </div>
                <div style={{ height: 6, background: '#f0f4f8', borderRadius: 3 }}>
                  <div style={{
                    height: '100%',
                    width: doc.status === 'on-leave' ? '0%' : `${doc.utilization}%`,
                    background: doc.utilization >= 80 ? GRAD.green : doc.utilization >= 60 ? GRAD.primary : GRAD.amber,
                    borderRadius: 3, transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            ))}
          </Card>

          {/* Quick actions */}
          <Card topBarGrad={GRAD.amber}>
            <SectionHeader
              icon="⚡" gradient={GRAD.amber}
              title="Quick Actions" subtitle="Common tasks"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { icon: '➕', label: 'New Appointment', grad: GRAD.primary },
                { icon: '👤', label: 'Add Patient',     grad: GRAD.green   },
                { icon: '👨‍⚕️', label: 'Add Doctor',      grad: GRAD.purple  },
                { icon: '📊', label: 'Export Report',   grad: GRAD.amber   },
              ].map(a => (
                <button key={a.label} style={{
                  padding: '12px 10px', borderRadius: 12, border: 'none',
                  background: a.grad, color: '#fff',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 6, transition: 'all 0.2s ease',
                }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <span>{a.icon}</span> {a.label}
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
function AppointmentsTab() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = APPOINTMENTS_DATA.filter(a => {
    const matchFilter = filter === 'all' || a.status === filter;
    const matchSearch = !search ||
      a.patient.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <Card>
      <SectionHeader
        icon="📅" gradient={GRAD.primary}
        title="All Appointments" subtitle={`${APPOINTMENTS_DATA.length} total today`}
        action={<ActionBtn label="+ Schedule Appointment" />}
      />

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>🔍</span>
          <input
            placeholder="Search patient or doctor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '11px 14px 11px 38px',
              borderRadius: 12, border: '2px solid #e8ecf0',
              fontSize: 13, color: C.textPrimary, background: '#f8fafc',
              outline: 'none', boxSizing: 'border-box',
              fontFamily: "'Segoe UI', system-ui, sans-serif",
              transition: 'all 0.2s',
            }}
            onFocus={e => { e.target.style.border = `2px solid ${C.blue}`; e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.08)'; }}
            onBlur={e => { e.target.style.border = '2px solid #e8ecf0'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: 'all',         label: 'All'         },
            { id: 'upcoming',    label: 'Upcoming'    },
            { id: 'in-progress', label: 'In Progress' },
            { id: 'completed',   label: 'Completed'   },
            { id: 'cancelled',   label: 'Cancelled'   },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '8px 16px', borderRadius: 50, border: 'none',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: filter === f.id ? GRAD.primary : '#f0f4f8',
              color: filter === f.id ? '#fff' : C.textMuted,
              boxShadow: filter === f.id ? '0 4px 14px rgba(37,99,235,0.25)' : 'none',
              transition: 'all 0.2s',
            }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Time', 'Patient', 'Doctor', 'Type', 'Room', 'Fee', 'Status', ''].map(h => (
                <th key={h} style={{
                  textAlign: 'left', fontSize: 10, fontWeight: 700,
                  color: C.textLight, textTransform: 'uppercase', letterSpacing: '1px',
                  paddingBottom: 14, borderBottom: '1px solid #e8ecf0',
                  paddingRight: 12,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((apt, i) => (
              <motion.tr
                key={apt.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{ borderBottom: '1px solid #f0f4f8' }}
              >
                <td style={{ padding: '14px 12px 14px 0' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>{apt.time}</div>
                </td>
                <td style={{ padding: '14px 12px 14px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: GRAD.primary, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 11, fontWeight: 700,
                    }}>
                      {apt.patient.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{apt.patient}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 12px 14px 0', fontSize: 13, color: C.textMuted }}>{apt.doctor}</td>
                <td style={{ padding: '14px 12px 14px 0', fontSize: 13, color: C.textMuted }}>{apt.type}</td>
                <td style={{ padding: '14px 12px 14px 0' }}>
                  <div style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: 6,
                    background: '#f0f4f8', fontSize: 11, fontWeight: 700, color: C.textMuted,
                  }}>
                    {apt.room}
                  </div>
                </td>
                <td style={{ padding: '14px 12px 14px 0', fontSize: 13, fontWeight: 700, color: C.textPrimary }}>${apt.fee}</td>
                <td style={{ padding: '14px 12px 14px 0' }}>
                  <StatusPill status={apt.status} />
                </td>
                <td style={{ padding: '14px 0 14px 0' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {apt.status === 'upcoming' && (
                      <button style={{
                        padding: '6px 12px', borderRadius: 8, border: 'none',
                        background: GRAD.green, color: '#fff',
                        fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      }}>Check In</button>
                    )}
                    <button style={{
                      padding: '6px 12px', borderRadius: 8,
                      border: '1px solid #e8ecf0', background: '#fff',
                      color: C.textMuted, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    }}>View</button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: C.textMuted }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No appointments found</div>
            <div style={{ fontSize: 14 }}>Adjust your filters or search term</div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────
// PATIENTS TAB
// ─────────────────────────────────────────────
function PatientsTab() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = PATIENTS_DATA.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.condition.toLowerCase().includes(search.toLowerCase())
  );

  const selectedPatient = PATIENTS_DATA.find(p => p.id === selected);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 24 }}>
      <Card>
        <SectionHeader
          icon="👥" gradient={GRAD.green}
          title="Patient Records" subtitle={`${PATIENTS_DATA.length} registered patients`}
          action={<ActionBtn label="+ Add Patient" gradient={GRAD.green} />}
        />

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>🔍</span>
          <input
            placeholder="Search by name or condition..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '11px 14px 11px 38px',
              borderRadius: 12, border: '2px solid #e8ecf0',
              fontSize: 13, color: C.textPrimary, background: '#f8fafc',
              outline: 'none', boxSizing: 'border-box',
              fontFamily: "'Segoe UI', system-ui, sans-serif",
              transition: 'all 0.2s',
            }}
            onFocus={e => { e.target.style.border = `2px solid ${C.green}`; e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.08)'; }}
            onBlur={e => { e.target.style.border = '2px solid #e8ecf0'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(selected === p.id ? null : p.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '16px 18px', borderRadius: 16,
                background: selected === p.id ? 'rgba(37,99,235,0.04)' : '#f8fafc',
                border: selected === p.id ? `2px solid ${C.blue}` : '1px solid #e8ecf0',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                if (selected !== p.id) {
                  (e.currentTarget as HTMLDivElement).style.background = '#f0f4f8';
                }
              }}
              onMouseLeave={e => {
                if (selected !== p.id) {
                  (e.currentTarget as HTMLDivElement).style.background = '#f8fafc';
                }
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: GRAD.green, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 15, fontWeight: 700,
                boxShadow: '0 3px 10px rgba(5,150,105,0.25)',
              }}>
                {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}>{p.name}</span>
                  <span style={{ fontSize: 12, color: C.textMuted }}>· Age {p.age}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: C.textMuted }}>
                  <span>📋 {p.condition}</span>
                  <span>🕐 {p.lastVisit}</span>
                  <span>📞 {p.visits} visits</span>
                </div>
              </div>
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                <StatusPill status={p.status} />
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Patient Detail Panel */}
      <AnimatePresence>
        {selectedPatient && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card topBarGrad={GRAD.green} style={{ position: 'sticky', top: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.blueDark }}>Patient Profile</div>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    border: '1px solid #e8ecf0', background: '#f0f4f8',
                    cursor: 'pointer', fontSize: 14, color: C.textMuted,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >✕</button>
              </div>

              {/* Avatar + name */}
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: GRAD.green, margin: '0 auto 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 24, fontWeight: 700,
                  boxShadow: '0 8px 24px rgba(5,150,105,0.3)',
                }}>
                  {selectedPatient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.textPrimary }}>{selectedPatient.name}</div>
                <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>Age {selectedPatient.age} · {selectedPatient.phone}</div>
                <div style={{ marginTop: 10 }}>
                  <StatusPill status={selectedPatient.status} />
                </div>
              </div>

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Primary Condition', value: selectedPatient.condition, icon: '📋' },
                  { label: 'Last Visit',         value: selectedPatient.lastVisit, icon: '🕐' },
                  { label: 'Total Visits',       value: `${selectedPatient.visits} consultations`, icon: '📊' },
                  { label: 'Contact',            value: selectedPatient.phone,    icon: '📞' },
                ].map(f => (
                  <div key={f.label} style={{
                    padding: '12px 14px', borderRadius: 12,
                    background: '#f8fafc', border: '1px solid #e8ecf0',
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>
                      {f.icon} {f.label}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>{f.value}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <ActionBtn label="📅 Schedule Appointment" />
                <ActionBtn label="📋 View Medical Records" gradient={GRAD.purple} />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// DOCTORS TAB
// ─────────────────────────────────────────────
function DoctorsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Card>
        <SectionHeader
          icon="👨‍⚕️" gradient={GRAD.primary}
          title="Medical Staff" subtitle={`${DOCTORS_DATA.length} doctors registered`}
          action={<ActionBtn label="+ Add Doctor" />}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          {DOCTORS_DATA.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
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
              {/* Top accent */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: doc.grad, borderRadius: '18px 18px 0 0' }} />

              <div style={{ display: 'flex', gap: 14, marginBottom: 16, alignItems: 'flex-start' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                  background: doc.grad,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 18, fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                }}>
                  {doc.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.textPrimary, marginBottom: 3 }}>{doc.name}</div>
                  <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 8 }}>{doc.specialty}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ fontSize: 11, color: s <= Math.floor(doc.rating) ? '#f59e0b' : '#e8ecf0' }}>★</span>
                      ))}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.textPrimary }}>{doc.rating}</span>
                    <StatusPill status={doc.status} />
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
                marginBottom: 14,
              }}>
                {[
                  { label: 'Patients Today', value: doc.patients },
                  { label: 'Revenue',        value: doc.status === 'on-leave' ? '—' : `$${doc.revenue}` },
                  { label: 'Utilization',    value: doc.status === 'on-leave' ? 'Leave' : `${doc.utilization}%` },
                ].map(s => (
                  <div key={s.label} style={{
                    padding: '10px', borderRadius: 10,
                    background: '#fff', border: '1px solid #e8ecf0',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 10, color: C.textLight, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: C.textPrimary }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Utilization bar */}
              {doc.status !== 'on-leave' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.textMuted, marginBottom: 5 }}>
                    <span>Today's Capacity</span>
                    <span style={{ fontWeight: 700, color: doc.utilization >= 80 ? '#059669' : C.blue }}>{doc.utilization}%</span>
                  </div>
                  <div style={{ height: 6, background: '#f0f4f8', borderRadius: 3 }}>
                    <div style={{
                      height: '100%', width: `${doc.utilization}%`,
                      background: doc.utilization >= 80 ? GRAD.green : GRAD.primary,
                      borderRadius: 3,
                    }} />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button style={{
                  flex: 1, padding: '9px', borderRadius: 10,
                  background: GRAD.primary, border: 'none',
                  color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>View Schedule</button>
                <button style={{
                  padding: '9px 14px', borderRadius: 10,
                  border: '1px solid #e8ecf0', background: '#fff',
                  color: C.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>Edit</button>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// ANALYTICS TAB
// ─────────────────────────────────────────────
function AnalyticsTab() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const revenueData = [68, 74, 65, 88, 92, 85];
  const appointmentData = [180, 210, 195, 240, 256, 230];
  const noShowData = [12, 10, 9, 7, 5, 4.2];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
        {[
          { label: 'Monthly Revenue',     value: '$98,240', change: '+18%',   icon: '💰', grad: GRAD.primary },
          { label: 'Total Appointments',  value: '1,536',   change: '+22%',   icon: '📅', grad: GRAD.green   },
          { label: 'New Patients',        value: '284',     change: '+31%',   icon: '👥', grad: GRAD.purple  },
          { label: 'Avg No-show Rate',    value: '4.2%',    change: '-61%',   icon: '📉', grad: GRAD.amber   },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: k.grad, borderRadius: '20px 20px 0 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>{k.label}</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: C.textPrimary, letterSpacing: '-0.5px' }}>{k.value}</div>
                  <div style={{ fontSize: 12, color: '#059669', fontWeight: 700, marginTop: 6 }}>
                    {k.change} vs last month
                  </div>
                </div>
                <div style={{ width: 44, height: 44, background: k.grad, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
                  {k.icon}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        {/* Revenue chart */}
        <Card topBarGrad={GRAD.primary}>
          <SectionHeader
            icon="📈" gradient={GRAD.primary}
            title="Revenue Trend" subtitle="Jan – Jun 2025"
          />
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 140, marginBottom: 12 }}>
            {revenueData.map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 600 }}>${h}k</div>
                <div style={{
                  width: '100%', height: `${(h / 100) * 100}%`,
                  background: i === 4 ? GRAD.primary : 'rgba(37,99,235,0.12)',
                  borderRadius: '6px 6px 0 0',
                  position: 'relative',
                }} />
                <span style={{ fontSize: 11, color: C.textLight, fontWeight: 600 }}>{months[i]}</span>
              </div>
            ))}
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 16px', background: '#f8fafc', borderRadius: 14, border: '1px solid #e8ecf0',
          }}>
            <div>
              <div style={{ fontSize: 11, color: C.textLight, fontWeight: 600 }}>6-Month Total</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: C.blueDark, letterSpacing: '-0.5px' }}>$472,000</div>
            </div>
            <div style={{ padding: '8px 16px', borderRadius: 50, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', fontSize: 14, fontWeight: 700, color: '#059669' }}>
              ↑ 18% growth
            </div>
          </div>
        </Card>

        {/* Right column analytics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* No-show trend */}
          <Card topBarGrad={GRAD.green}>
            <SectionHeader
              icon="📉" gradient={GRAD.green}
              title="No-show Rate" subtitle="Jan – Jun 2025"
            />
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 60, marginBottom: 10 }}>
              {noShowData.map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div style={{
                    width: '100%', height: `${(h / 15) * 100}%`,
                    background: i === 5 ? GRAD.green : 'rgba(16,185,129,0.2)',
                    borderRadius: '4px 4px 0 0',
                  }} />
                  <span style={{ fontSize: 8, color: C.textLight }}>{months[i].slice(0,1)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: C.textMuted }}>Current rate</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#059669' }}>4.2% ↓</span>
            </div>
          </Card>

          {/* Specialty breakdown */}
          <Card topBarGrad={GRAD.purple}>
            <SectionHeader
              icon="🏥" gradient={GRAD.purple}
              title="By Specialty" subtitle="Appointments this month"
            />
            {[
              { name: 'General Medicine', pct: 42, count: 108 },
              { name: 'Cardiology',       pct: 28, count: 72  },
              { name: 'Pediatrics',       pct: 18, count: 46  },
              { name: 'Orthopedics',      pct: 12, count: 30  },
            ].map((s, i) => (
              <div key={s.name} style={{ marginBottom: i < 3 ? 12 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary }}>{s.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.textMuted }}>{s.count} appts</span>
                </div>
                <div style={{ height: 6, background: '#f0f4f8', borderRadius: 3 }}>
                  <div style={{
                    height: '100%', width: `${s.pct}%`,
                    background: [GRAD.primary, GRAD.green, GRAD.purple, GRAD.amber][i],
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
function BillingTab() {
  const invoices = [
    { id: 'INV-2025-001', patient: 'James Doe',      doctor: 'Dr. Mitchell',  amount: 120, date: 'May 19', status: 'paid'    },
    { id: 'INV-2025-002', patient: 'Maria Chen',      doctor: 'Dr. Rodriguez', amount: 90,  date: 'May 19', status: 'paid'    },
    { id: 'INV-2025-003', patient: 'Robert Singh',    doctor: 'Dr. Patel',     amount: 150, date: 'May 19', status: 'pending' },
    { id: 'INV-2025-004', patient: 'Sarah Kim',       doctor: 'Dr. Kim',       amount: 140, date: 'May 19', status: 'pending' },
    { id: 'INV-2025-005', patient: 'Rachel Brown',    doctor: 'Dr. Patel',     amount: 150, date: 'May 18', status: 'overdue' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
        {[
          { label: 'Collected Today',   value: '$3,840',  icon: '✅', grad: GRAD.green   },
          { label: 'Pending',           value: '$1,240',  icon: '⏳', grad: GRAD.amber   },
          { label: 'Overdue',           value: '$450',    icon: '⚠️', grad: GRAD.red     },
          { label: 'Monthly Total',     value: '$98,240', icon: '💰', grad: GRAD.primary },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: s.grad, borderRadius: '20px 20px 0 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: C.textPrimary, letterSpacing: '-0.5px' }}>{s.value}</div>
                </div>
                <div style={{ width: 44, height: 44, background: s.grad, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.icon}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Invoice table */}
      <Card>
        <SectionHeader
          icon="💳" gradient={GRAD.primary}
          title="Recent Invoices" subtitle="Today's billing records"
          action={<ActionBtn label="Export CSV" gradient="linear-gradient(135deg,#64748b,#94a3b8)" small />}
        />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Invoice', 'Patient', 'Doctor', 'Amount', 'Date', 'Status', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '1px', paddingBottom: 14, borderBottom: '1px solid #e8ecf0', paddingRight: 12 }}>{h}</th>
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
                  <td style={{ padding: '13px 12px 13px 0' }}>
                    <StatusPill status={inv.status} />
                  </td>
                  <td style={{ padding: '13px 0 13px 0' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {inv.status === 'pending' && (
                        <button style={{ padding: '5px 12px', borderRadius: 8, border: 'none', background: GRAD.green, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                          Collect
                        </button>
                      )}
                      {inv.status === 'overdue' && (
                        <button style={{ padding: '5px 12px', borderRadius: 8, border: 'none', background: GRAD.red, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                          Remind
                        </button>
                      )}
                      <button style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #e8ecf0', background: '#fff', color: C.textMuted, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        View
                      </button>
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
      {/* Clinic Profile */}
      <Card>
        <SectionHeader icon="🏥" gradient={GRAD.primary} title="Clinic Profile" subtitle="Basic clinic information" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Clinic Name',    value: 'Riverside Family Clinic',  icon: '🏥' },
            { label: 'Admin Name',     value: 'Dr. Amanda Foster',         icon: '👤' },
            { label: 'Email',          value: 'admin@riverside-clinic.com',icon: '📧' },
            { label: 'Phone',          value: '+1 (555) 200-3000',         icon: '📞' },
            { label: 'Address',        value: '450 Riverside Drive, NY',   icon: '📍' },
            { label: 'Plan',           value: 'Clinic Plan · $249/mo',     icon: '💎' },
          ].map(f => (
            <div key={f.label} style={{ padding: '12px 14px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e8ecf0' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>{f.icon} {f.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>{f.value}</div>
            </div>
          ))}
          <ActionBtn label="Update Profile" />
        </div>
      </Card>

      {/* Notifications */}
      <Card topBarGrad={GRAD.green}>
        <SectionHeader icon="🔔" gradient={GRAD.green} title="Notification Settings" subtitle="Reminder configuration" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'SMS reminders to patients', enabled: true  },
            { label: 'Email reminders to patients', enabled: true  },
            { label: '48h appointment reminders',  enabled: true  },
            { label: '24h appointment reminders',  enabled: true  },
            { label: '2h appointment reminders',   enabled: false },
            { label: 'Doctor utilization alerts',  enabled: true  },
            { label: 'No-show notifications',      enabled: true  },
          ].map((setting, i) => (
            <div key={setting.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e8ecf0' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>{setting.label}</span>
              <div style={{
                width: 44, height: 24, borderRadius: 50,
                background: setting.enabled ? GRAD.green : '#e8ecf0',
                cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 3,
                  left: setting.enabled ? 23 : 3,
                  transition: 'left 0.2s',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Security */}
      <Card topBarGrad={GRAD.purple}>
        <SectionHeader icon="🔒" gradient={GRAD.purple} title="Security" subtitle="Access & compliance" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Two-Factor Authentication', value: 'Enabled', good: true  },
            { label: 'HIPAA-Ready Architecture',  value: 'Active',  good: true  },
            { label: 'Audit Log',                 value: 'Enabled', good: true  },
            { label: 'Data Encryption (AES-256)', value: 'Active',  good: true  },
            { label: 'Last Security Review',      value: 'May 1, 2025', good: true },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e8ecf0' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{item.label}</span>
              <div style={{
                padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700,
                background: item.good ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: item.good ? '#059669' : '#dc2626',
                border: `1px solid ${item.good ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
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
// TOPBAR
// ─────────────────────────────────────────────
function TopBar({ title, subtitle, collapsed }: { title: string; subtitle: string; collapsed: boolean }) {
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = [
    { icon: '📅', msg: 'Robert Singh checked in for 10:30 AM', time: '2 min ago', unread: true  },
    { icon: '⚠️', msg: 'Rachel Brown cancelled her 3:30 PM slot', time: '8 min ago', unread: true  },
    { icon: '💰', msg: 'Invoice INV-2025-001 collected — $120', time: '14 min ago', unread: false },
    { icon: '👥', msg: 'New patient registered: Tom Harrison', time: '1h ago', unread: false },
  ];

  return (
    <div style={{
      background: '#fff', borderBottom: '1px solid #e8ecf0',
      padding: '16px 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: C.textPrimary, letterSpacing: '-0.5px' }}>{title}</h1>
        <p style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{subtitle}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Live indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '7px 14px', borderRadius: 50,
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>Clinic Live</span>
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: '#f0f4f8', border: '1px solid #e8ecf0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, cursor: 'pointer', position: 'relative',
            }}
          >
            🔔
            <div style={{
              position: 'absolute', top: 8, right: 8,
              width: 8, height: 8, borderRadius: '50%',
              background: '#ef4444', border: '2px solid #fff',
            }} />
          </button>

          {/* Notif dropdown */}
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                style={{
                  position: 'absolute', top: 48, right: 0, zIndex: 200,
                  background: '#fff', borderRadius: 18, width: 360,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                  border: '1px solid #e8ecf0', overflow: 'hidden',
                }}
              >
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8ecf0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.textPrimary }}>Notifications</div>
                  <div style={{ padding: '3px 10px', borderRadius: 50, background: 'rgba(239,68,68,0.1)', color: '#dc2626', fontSize: 11, fontWeight: 700 }}>2 new</div>
                </div>
                {notifications.map((n, i) => (
                  <div key={i} style={{
                    padding: '14px 20px', borderBottom: i < notifications.length - 1 ? '1px solid #f0f4f8' : 'none',
                    background: n.unread ? 'rgba(37,99,235,0.03)' : '#fff',
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                  }}>
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

        {/* Avatar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 14px 6px 6px',
          borderRadius: 50, background: '#f0f4f8', border: '1px solid #e8ecf0',
          cursor: 'pointer',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: GRAD.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12, fontWeight: 700,
          }}>AF</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>Dr. Foster</span>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);

  const tabMeta: Record<string, { title: string; subtitle: string }> = {
    overview:     { title: 'Clinic Overview',      subtitle: 'Riverside Family Clinic · Monday, May 19, 2025'     },
    appointments: { title: 'Appointments',          subtitle: "Today's full schedule — 24 appointments"            },
    patients:     { title: 'Patient Records',       subtitle: '1,284 registered patients'                          },
    doctors:      { title: 'Medical Staff',         subtitle: '5 doctors · 4 active today'                         },
    analytics:    { title: 'Clinic Analytics',      subtitle: 'Performance data Jan – May 2025'                    },
    billing:      { title: 'Billing & Invoices',    subtitle: "Today's financial summary"                          },
    settings:     { title: 'Clinic Settings',       subtitle: 'Profile, notifications, and security'               },
  };

  const current = tabMeta[activeTab] ?? tabMeta.overview;

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: C.page,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <Sidebar
        activeTab={activeTab} setActiveTab={setActiveTab}
        collapsed={collapsed} setCollapsed={setCollapsed}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', minWidth: 0 }}>
        <TopBar title={current.title} subtitle={current.subtitle} collapsed={collapsed} />

        <div style={{ flex: 1, padding: '28px 32px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === 'overview'     && <OverviewTab setActiveTab={setActiveTab} />}
              {activeTab === 'appointments' && <AppointmentsTab />}
              {activeTab === 'patients'     && <PatientsTab />}
              {activeTab === 'doctors'      && <DoctorsTab />}
              {activeTab === 'analytics'    && <AnalyticsTab />}
              {activeTab === 'billing'      && <BillingTab />}
              {activeTab === 'settings'     && <SettingsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}