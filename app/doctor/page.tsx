"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================
// DATA
// ============================================================

const SCHEDULE = [
  { time: '09:00 AM', patient: 'Sarah Johnson', reason: 'Annual Cardiac Checkup', status: 'completed' },
  { time: '09:45 AM', patient: 'Michael Chen', reason: 'Follow-up Consultation', status: 'completed' },
  { time: '10:30 AM', patient: 'Emily Rodriguez', reason: 'Prescription Refill', status: 'completed' },
  { time: '11:15 AM', patient: 'David Kim', reason: 'New Patient Visit', status: 'active' },
  { time: '12:00 PM', patient: 'Lisa Thompson', reason: 'Lab Results Review', status: 'upcoming' },
  { time: '02:00 PM', patient: 'Tom Harrison', reason: 'Dermatology Consult', status: 'upcoming' },
  { time: '02:45 PM', patient: 'Rachel Martinez', reason: 'Post-Surgery Follow-up', status: 'upcoming' },
  { time: '03:30 PM', patient: 'James Wilson', reason: 'Hypertension Management', status: 'upcoming' },
];

const QUEUE = [
  { name: 'Lisa Thompson', age: 34, reason: 'Lab Results Review', waitTime: '5 min', priority: 'normal', initials: 'LT' },
  { name: 'Tom Harrison', age: 52, reason: 'Dermatology Consult', waitTime: '18 min', priority: 'normal', initials: 'TH' },
  { name: 'Rachel Martinez', age: 28, reason: 'Post-Surgery Follow-up', waitTime: '31 min', priority: 'urgent', initials: 'RM' },
];

const STATS = [
  { label: "Today's Patients", value: '12', icon: '👥', gradient: 'linear-gradient(135deg, #2563eb, #818cf8)', change: '+3 vs yesterday', positive: true },
  { label: 'Completed', value: '8', icon: '✅', gradient: 'linear-gradient(135deg, #059669, #10b981)', change: '+5 vs yesterday', positive: true },
  { label: 'Upcoming', value: '4', icon: '🕐', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)', change: 'Next at 12:00 PM', positive: null },
  { label: 'This Month', value: '186', icon: '📊', gradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', change: '+12% vs last month', positive: true },
];

const RECENT_PATIENTS = [
  { name: 'Sarah Johnson', diagnosis: 'Cardiac Arrhythmia', date: 'Today, 9:00 AM', status: 'Completed', initials: 'SJ' },
  { name: 'Michael Chen', diagnosis: 'Hypertension Follow-up', date: 'Today, 9:45 AM', status: 'Completed', initials: 'MC' },
  { name: 'Emily Rodriguez', diagnosis: 'Type 2 Diabetes', date: 'Today, 10:30 AM', status: 'Completed', initials: 'ER' },
];

// ============================================================
// SIDEBAR
// ============================================================

function DoctorSidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
}: {
  activeTab: string;
  setActiveTab: (t: string) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const menu = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'schedule', icon: '📅', label: "Today's Schedule" },
    { id: 'patients', icon: '👥', label: 'Patient Queue' },
    { id: 'records', icon: '📋', label: 'Medical Records' },
    { id: 'availability', icon: '🕐', label: 'Availability' },
    { id: 'earnings', icon: '💰', label: 'Earnings' },
  ];

  return (
    <motion.div
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3 }}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f2347 0%, #1e3c7d 50%, #0f2347 100%)',
        display: 'flex',
        flexDirection: 'column',
        padding: collapsed ? '24px 12px' : '24px 16px',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 40,
        paddingBottom: 24,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
      }}>
        <span style={{ fontSize: 24, flexShrink: 0 }}>🏥</span>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', lineHeight: 1 }}>MediBook</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginTop: 2 }}>Doctor Portal</div>
          </div>
        )}
      </div>

      {/* Doctor Info */}
      {!collapsed && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 32,
          padding: '14px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            flexShrink: 0,
          }}>
            👨‍⚕️
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>Dr. Sarah Mitchell</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Cardiologist</div>
          </div>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#10b981', marginLeft: 'auto', flexShrink: 0,
            boxShadow: '0 0 6px #10b981',
          }} />
        </div>
      )}

      {/* Nav Section Label */}
      {!collapsed && (
        <div style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: 'rgba(255,255,255,0.3)',
          marginBottom: 10,
          paddingLeft: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          📌 Main Menu
        </div>
      )}

      {/* Menu Items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {menu.map((item, index) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: collapsed ? 0 : 12,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '12px' : '12px 14px',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                borderLeft: isActive && !collapsed ? '3px solid #10b981' : '3px solid transparent',
                transition: 'all 0.2s ease',
                width: '100%',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              <span style={{
                fontSize: 18,
                flexShrink: 0,
                transition: 'transform 0.2s ease',
                filter: isActive ? 'brightness(1.2)' : 'none',
              }}>
                {item.icon}
              </span>
              {!collapsed && (
                <span style={{
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                  whiteSpace: 'nowrap',
                }}>
                  {item.label}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div style={{
        marginTop: 'auto',
        paddingTop: 20,
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : 12,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '12px' : '12px 14px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            background: 'transparent',
            color: 'rgba(255,255,255,0.6)',
            fontSize: 14,
            fontWeight: 500,
            width: '100%',
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ fontSize: 18 }}>{collapsed ? '→' : '←'}</span>
          {!collapsed && <span>Collapse</span>}
        </button>

        {/* Home Link */}
        <a
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : 12,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '12px' : '12px 14px',
            borderRadius: 12,
            cursor: 'pointer',
            background: 'transparent',
            color: 'rgba(255,255,255,0.6)',
            fontSize: 14,
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ fontSize: 18 }}>🏠</span>
          {!collapsed && <span>Back to Home</span>}
        </a>

        {/* Logout */}
        <a
          href="/login"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : 12,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '12px' : '12px 14px',
            borderRadius: 12,
            cursor: 'pointer',
            background: 'transparent',
            color: 'rgba(255,255,255,0.6)',
            fontSize: 14,
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ fontSize: 18 }}>🚪</span>
          {!collapsed && <span>Logout</span>}
        </a>
      </div>
    </motion.div>
  );
}

// ============================================================
// STATUS PILL
// ============================================================

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; dot: string; label: string }> = {
    upcoming: { bg: 'rgba(37,99,235,0.1)', color: '#2563eb', dot: '#2563eb', label: 'Upcoming' },
    completed: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a', dot: '#22c55e', label: 'Completed' },
    cancelled: { bg: 'rgba(239,68,68,0.1)', color: '#dc2626', dot: '#ef4444', label: 'Cancelled' },
    active: { bg: 'rgba(16,185,129,0.12)', color: '#059669', dot: '#10b981', label: 'In Progress' },
  };
  const s = map[status] ?? map.upcoming;
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 12px',
      borderRadius: 50,
      background: s.bg,
      border: `1px solid ${s.dot}40`,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: s.dot, display: 'inline-block',
        animation: status === 'active' ? 'pulse 2s ease-in-out infinite' : 'none',
      }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {s.label}
      </span>
    </div>
  );
}

// ============================================================
// SECTION HEADER
// ============================================================

function SectionHeader({ icon, gradient, title, subtitle }: {
  icon: string; gradient: string; title: string; subtitle: string;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      paddingBottom: 18,
      marginBottom: 24,
      borderBottom: '2px solid #e8ecf0',
    }}>
      <div style={{
        width: 38,
        height: 38,
        background: gradient,
        borderRadius: 11,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        flexShrink: 0,
        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#1e3c7d' }}>{title}</div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>{subtitle}</div>
      </div>
    </div>
  );
}

// ============================================================
// STATS CARDS
// ============================================================

function StatsCards() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 20,
      marginBottom: 28,
    }}>
      {STATS.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          style={{
            background: '#fff',
            borderRadius: 20,
            padding: '24px',
            border: '1px solid #e8ecf0',
            boxShadow: '0 6px 30px rgba(0,0,0,0.06)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 30px rgba(0,0,0,0.06)';
          }}
        >
          {/* Top accent bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 4,
            background: stat.gradient, borderRadius: '20px 20px 0 0',
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#9ca3af',
                textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10,
              }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#1a1a2a', lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: 12, marginTop: 8, fontWeight: 600,
                color: stat.positive === true ? '#16a34a' : stat.positive === false ? '#dc2626' : '#64748b',
              }}>
                {stat.positive === true ? '↑ ' : stat.positive === false ? '↓ ' : ''}{stat.change}
              </div>
            </div>
            <div style={{
              width: 48,
              height: 48,
              background: stat.gradient,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}>
              {stat.icon}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================
// TODAY'S SCHEDULE
// ============================================================

function TodaySchedule() {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      padding: '28px',
      border: '1px solid #e8ecf0',
      boxShadow: '0 6px 30px rgba(0,0,0,0.06)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: 'linear-gradient(90deg, #1e3c7d, #2563eb, #818cf8)',
        borderRadius: '20px 20px 0 0',
      }} />

      <SectionHeader
        icon="📅"
        gradient="linear-gradient(135deg, #1e3c7d, #2563eb)"
        title="Today's Schedule"
        subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 520, overflowY: 'auto', paddingRight: 4 }}>
        {SCHEDULE.map((apt, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '16px 18px',
              borderRadius: 14,
              background: apt.status === 'active'
                ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.05))'
                : '#f8fafc',
              border: apt.status === 'active'
                ? '1px solid rgba(16,185,129,0.3)'
                : '1px solid #e8ecf0',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (apt.status !== 'active') {
                (e.currentTarget as HTMLDivElement).style.background = '#f0f4f8';
                (e.currentTarget as HTMLDivElement).style.borderColor = '#d0d8e8';
              }
            }}
            onMouseLeave={(e) => {
              if (apt.status !== 'active') {
                (e.currentTarget as HTMLDivElement).style.background = '#f8fafc';
                (e.currentTarget as HTMLDivElement).style.borderColor = '#e8ecf0';
              }
            }}
          >
            {/* Time */}
            <div style={{
              minWidth: 72,
              textAlign: 'center',
              padding: '8px 10px',
              background: '#fff',
              borderRadius: 10,
              border: '1px solid #e8ecf0',
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#1a1a2a', lineHeight: 1 }}>
                {apt.time.split(' ')[0]}
              </div>
              <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, marginTop: 2 }}>
                {apt.time.split(' ')[1]}
              </div>
            </div>

            {/* Patient Avatar */}
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: apt.status === 'active'
                ? 'linear-gradient(135deg, #059669, #10b981)'
                : 'linear-gradient(135deg, #1e3c7d, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {apt.patient.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>

            {/* Details */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2a' }}>{apt.patient}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{apt.reason}</div>
            </div>

            {/* Status + Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <StatusPill status={apt.status} />
              {apt.status === 'active' && (
                <button style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
                }}>
                  Start Consult
                </button>
              )}
              {apt.status === 'upcoming' && (
                <button style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: '1px solid #e8ecf0',
                  background: '#fff',
                  color: '#64748b',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}>
                  View Chart
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// PATIENT QUEUE
// ============================================================

function PatientQueue() {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      padding: '28px',
      border: '1px solid #e8ecf0',
      boxShadow: '0 6px 30px rgba(0,0,0,0.06)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
        borderRadius: '20px 20px 0 0',
      }} />

      <SectionHeader
        icon="👥"
        gradient="linear-gradient(135deg, #f59e0b, #fbbf24)"
        title="Waiting Queue"
        subtitle={`${QUEUE.length} patients currently waiting`}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {QUEUE.map((patient, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '16px 18px',
              borderRadius: 14,
              background: patient.priority === 'urgent' ? 'rgba(239,68,68,0.05)' : '#f8fafc',
              border: patient.priority === 'urgent' ? '1px solid rgba(239,68,68,0.25)' : '1px solid #e8ecf0',
            }}
          >
            {/* Queue Number */}
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: patient.priority === 'urgent'
                ? 'linear-gradient(135deg, #ef4444, #f87171)'
                : 'linear-gradient(135deg, #1e3c7d, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 13,
              fontWeight: 900,
              flexShrink: 0,
            }}>
              {i + 1}
            </div>

            {/* Avatar */}
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #64748b, #94a3b8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {patient.initials}
            </div>

            {/* Details */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2a' }}>{patient.name}</span>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>Age {patient.age}</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{patient.reason}</div>
            </div>

            {/* Wait time + priority */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                Waiting: <strong style={{ color: '#1a1a2a' }}>{patient.waitTime}</strong>
              </div>
              {patient.priority === 'urgent' ? (
                <div style={{
                  padding: '3px 10px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 50,
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#dc2626',
                  textTransform: 'uppercase',
                }}>
                  Urgent
                </div>
              ) : (
                <div style={{
                  padding: '3px 10px',
                  background: 'rgba(37,99,235,0.08)',
                  border: '1px solid rgba(37,99,235,0.2)',
                  borderRadius: 50,
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#2563eb',
                  textTransform: 'uppercase',
                }}>
                  Normal
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Queue Summary */}
      <div style={{
        marginTop: 20,
        padding: '14px 18px',
        background: 'rgba(245,158,11,0.06)',
        borderRadius: 12,
        border: '1px solid rgba(245,158,11,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
          ⏱ Average wait time today
        </span>
        <span style={{ fontSize: 16, fontWeight: 900, color: '#d97706' }}>18 minutes</span>
      </div>
    </div>
  );
}

// ============================================================
// RECENT PATIENTS TABLE
// ============================================================

function RecentPatients() {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      padding: '28px',
      border: '1px solid #e8ecf0',
      boxShadow: '0 6px 30px rgba(0,0,0,0.06)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: 'linear-gradient(90deg, #7c3aed, #8b5cf6)',
        borderRadius: '20px 20px 0 0',
      }} />

      <SectionHeader
        icon="📋"
        gradient="linear-gradient(135deg, #7c3aed, #8b5cf6)"
        title="Recent Patients"
        subtitle="Consultations completed today"
      />

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Patient', 'Diagnosis', 'Time', 'Status'].map((h) => (
              <th key={h} style={{
                textAlign: 'left',
                fontSize: 11,
                fontWeight: 700,
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                paddingBottom: 14,
                borderBottom: '1px solid #e8ecf0',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RECENT_PATIENTS.map((p, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f0f4f8' }}>
              <td style={{ padding: '14px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1e3c7d, #2563eb)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 12, fontWeight: 700,
                  }}>
                    {p.initials}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2a' }}>{p.name}</span>
                </div>
              </td>
              <td style={{ padding: '14px 0', fontSize: 13, color: '#64748b' }}>{p.diagnosis}</td>
              <td style={{ padding: '14px 0', fontSize: 13, color: '#64748b' }}>{p.date}</td>
              <td style={{ padding: '14px 0' }}>
                <StatusPill status="completed" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// OVERVIEW (Dashboard Tab)
// ============================================================

function Overview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <StatsCards />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: 24,
      }}>
        <TodaySchedule />
        <PatientQueue />
      </div>
      <RecentPatients />
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Doctor Dashboard', subtitle: `Good morning, Dr. Mitchell • ${today}` },
    schedule: { title: "Today's Schedule", subtitle: '8 appointments scheduled for today' },
    patients: { title: 'Patient Queue', subtitle: '3 patients currently waiting' },
    records: { title: 'Medical Records', subtitle: 'Patient history and documentation' },
    availability: { title: 'Availability Settings', subtitle: 'Manage your booking schedule' },
    earnings: { title: 'Earnings Overview', subtitle: 'Revenue and payment history' },
  };

  const current = tabTitles[activeTab] ?? tabTitles.dashboard;

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f0f4f8',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <DoctorSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {/* Top Bar */}
        <div style={{
          background: '#fff',
          borderBottom: '1px solid #e8ecf0',
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#1a1a2a', letterSpacing: '-0.5px' }}>
              {current.title}
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>
              {current.subtitle}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Online Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 50,
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#10b981', display: 'inline-block',
                boxShadow: '0 0 6px #10b981',
                animation: 'pulse 2s ease-in-out infinite',
              }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>Online</span>
            </div>

            {/* Notifications */}
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: '#f0f4f8',
              border: '1px solid #e8ecf0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              cursor: 'pointer',
              position: 'relative',
            }}>
              🔔
              <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#ef4444',
                border: '2px solid #fff',
              }} />
            </div>

            {/* Avatar */}
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #1e3c7d, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
            }}>
              SM
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, padding: '28px 32px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === 'dashboard' && <Overview />}
              {activeTab === 'schedule' && <TodaySchedule />}
              {activeTab === 'patients' && <PatientQueue />}
              {activeTab === 'records' && <RecentPatients />}
              {(activeTab === 'availability' || activeTab === 'earnings') && (
                <div style={{
                  background: '#fff',
                  borderRadius: 20,
                  padding: '60px',
                  textAlign: 'center',
                  border: '1px solid #e8ecf0',
                  boxShadow: '0 6px 30px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>
                    {activeTab === 'availability' ? '🕐' : '💰'}
                  </div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2a', marginBottom: 8 }}>
                    {activeTab === 'availability' ? 'Availability Settings' : 'Earnings Overview'}
                  </h2>
                  <p style={{ fontSize: 15, color: '#64748b', maxWidth: 400, margin: '0 auto' }}>
                    {activeTab === 'availability'
                      ? 'Manage your working hours, appointment slots, and time-off settings.'
                      : 'Track your consultation revenue, payment history, and monthly earnings.'}
                  </p>
                  <div style={{
                    marginTop: 28,
                    display: 'inline-block',
                    padding: '8px 20px',
                    borderRadius: 10,
                    background: 'rgba(37,99,235,0.08)',
                    border: '1px solid rgba(37,99,235,0.2)',
                    color: '#2563eb',
                    fontSize: 13,
                    fontWeight: 700,
                  }}>
                    Full feature available in production build
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
