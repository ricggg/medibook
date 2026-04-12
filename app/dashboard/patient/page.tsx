// FILE: app/dashboard/patient/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────
const C = {
  purpleDark: "#5b21b6",
  purple: "#7c3aed",
  purpleLight: "#a78bfa",
  green: "#10b981",
  greenDark: "#059669",
  blue: "#2563eb",
  amber: "#f59e0b",
  red: "#ef4444",
  textPrimary: "#0f1729",
  textMuted: "#64748b",
  textLight: "#9ca3af",
  border: "#e8ecf0",
  page: "#f5f3ff",
};

const GRAD = {
  primary: "linear-gradient(135deg, #5b21b6, #7c3aed)",
  hero: "linear-gradient(180deg, #2e1065 0%, #5b21b6 50%, #2e1065 100%)",
  green: "linear-gradient(135deg, #059669, #10b981)",
  blue: "linear-gradient(135deg, #1e3c7d, #2563eb)",
  amber: "linear-gradient(135deg, #f59e0b, #fbbf24)",
  red: "linear-gradient(135deg, #ef4444, #f87171)",
  topBar: "linear-gradient(90deg, #5b21b6, #7c3aed, #a78bfa)",
};

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface PatientProfile {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  condition: string;
  status: string;
  blood_type?: string;
  last_visit: string;
  visits: number;
  address?: string;
  assigned_doctor_id?: string | null;
  profile_id?: string;
  clinic_id?: string;
}

interface Appointment {
  id: string;
  patient_name: string;
  doctor_name: string;
  type: string;
  time: string;
  date: string;
  room: string;
  fee: number;
  status: string;
  notes?: string;
  patient_id?: string;
  doctor_id?: string;
  // (Optional for future DB enhancement; safe to keep even if column doesn't exist)
  patient_confirmed?: boolean;
  patient_confirmed_at?: string | null;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone?: string;
  email?: string;
  rating: number;
  initials: string;
  grad: string;
  status: string;
  clinic_id: string;
}

interface Clinic {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  booking_fee?: number;
}

type AppRole = "admin" | "doctor" | "patient";

function getRoleFromAuth(user: User | null): AppRole | null {
  const role = user?.app_metadata?.role;
  return role === "admin" || role === "doctor" || role === "patient" ? role : null;
}

// ─────────────────────────────────────────────
// LOCAL "PATIENT MANAGEMENT PORTAL" STORE (NO DB REQUIRED)
// ─────────────────────────────────────────────
type ConfirmMap = Record<string, { confirmed: boolean; confirmedAtISO?: string }>;

interface VisitNote {
  id: string;
  createdAtISO: string;
  title: string;
  body: string;
  doctorName?: string;
}

interface LabResult {
  id: string;
  createdAtISO: string;
  testName: string;
  summary: string;
  fileUrl?: string;
}

interface PrescriptionItem {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

interface Prescription {
  id: string;
  createdAtISO: string;
  diagnosis?: string;
  instructions: string;
  items: PrescriptionItem[];
  status: "draft" | "sent";
}

interface PatientRecords {
  visitNotes: VisitNote[];
  labResults: LabResult[];
  prescriptions: Prescription[];
}

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────
function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function timeToMinutes(t: string): number {
  const s = t.trim().toUpperCase();
  const hasAmPm = s.includes("AM") || s.includes("PM");
  if (!hasAmPm) {
    const [hhRaw, mmRaw] = s.split(":");
    return Number(hhRaw) * 60 + Number(mmRaw ?? "0");
  }
  const [timePart, ampmPart] = s.split(" ");
  const [hhRaw, mmRaw] = timePart.split(":");
  const hh = Number(hhRaw);
  const mm = Number(mmRaw ?? "0");
  const base = (hh % 12) * 60 + mm;
  return ampmPart === "PM" ? base + 12 * 60 : base;
}

function combineDateTime(dateISO: string, time12: string): Date {
  const mins = timeToMinutes(time12);
  const hh = Math.floor(mins / 60);
  const mm = mins % 60;
  const d = new Date(`${dateISO}T00:00:00`);
  d.setHours(hh, mm, 0, 0);
  return d;
}

function formatPrettyDate(dateISO: string): string {
  return new Date(dateISO).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function seedRecords(patient: PatientProfile, doctor: Doctor | null): PatientRecords {
  const now = new Date();
  const d1 = new Date(now); d1.setDate(d1.getDate() - 18);
  const d2 = new Date(now); d2.setDate(d2.getDate() - 7);
  const d3 = new Date(now); d3.setDate(d3.getDate() - 3);

  const condition = (patient.condition || "General health").toLowerCase();

  const baseDiagnosis =
    condition.includes("diabetes") ? "Type 2 Diabetes (monitoring)" :
    condition.includes("hypertension") ? "Hypertension (follow-up)" :
    condition.includes("asthma") ? "Asthma (review)" :
    condition.includes("anxiety") || condition.includes("mental") ? "Anxiety (follow-up)" :
    "General Consultation";

  const visitNotes: VisitNote[] = [
    {
      id: uid("note"),
      createdAtISO: d2.toISOString(),
      title: "Consultation Summary",
      doctorName: doctor?.name ?? "Clinic Doctor",
      body:
        `Patient reports ongoing symptoms related to ${patient.condition || "their condition"}. ` +
        `Vitals reviewed and discussed next steps. Advised lifestyle adjustments, medication adherence, and a follow-up visit if symptoms persist.`,
    },
    {
      id: uid("note"),
      createdAtISO: d3.toISOString(),
      title: "Follow-up Plan",
      doctorName: doctor?.name ?? "Clinic Doctor",
      body:
        `Plan: Continue treatment and monitor symptoms daily. ` +
        `If any worsening occurs (fever, severe pain, shortness of breath), contact the clinic immediately.`,
    },
  ];

  const labResults: LabResult[] = [
    {
      id: uid("lab"),
      createdAtISO: d1.toISOString(),
      testName: condition.includes("diabetes") ? "HbA1c" : "Complete Blood Count (CBC)",
      summary:
        condition.includes("diabetes")
          ? "HbA1c slightly elevated. Recommended improved diet control and follow-up in 8–12 weeks."
          : "CBC reviewed. Values within expected range; mild variations noted but not clinically concerning.",
    },
    {
      id: uid("lab"),
      createdAtISO: d2.toISOString(),
      testName: "Lipid Panel",
      summary: "Cholesterol levels reviewed. Maintain balanced diet and regular exercise; follow-up recommended.",
    },
  ];

  const rxItems: PrescriptionItem[] =
    condition.includes("diabetes")
      ? [
          { id: uid("rx_item"), medication: "Metformin", dosage: "500mg", frequency: "2× daily", duration: "30 days", notes: "Take with meals." },
        ]
      : condition.includes("hypertension")
        ? [
            { id: uid("rx_item"), medication: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "30 days", notes: "Take at the same time each day." },
          ]
        : condition.includes("asthma")
          ? [
              { id: uid("rx_item"), medication: "Salbutamol Inhaler", dosage: "2 puffs", frequency: "As needed", duration: "30 days", notes: "Use for wheeze/shortness of breath." },
            ]
          : [
              { id: uid("rx_item"), medication: "Ibuprofen", dosage: "400mg", frequency: "2× daily", duration: "5 days", notes: "Take with food." },
            ];

  const prescriptions: Prescription[] = [
    {
      id: uid("rx"),
      createdAtISO: d2.toISOString(),
      diagnosis: baseDiagnosis,
      instructions: "Take medications as prescribed. Return if symptoms worsen or new symptoms develop.",
      items: rxItems,
      status: "sent",
    },
  ];

  return { visitNotes, labResults, prescriptions };
}

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────
interface Toast { id: string; message: string; type: "success" | "error" | "info"; }

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const removeToast = useCallback((id: string) => {
    setToasts(p => p.filter(t => t.id !== id));
  }, []);
  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts(p => [...p, { id, message, type }]);
    window.setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);
  return { toasts, addToast, removeToast };
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div style={{ position: "fixed", top: 24, right: 24, zIndex: 99999, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none" }}>
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div key={t.id}
            initial={{ opacity: 0, x: 80, scale: 0.85 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 80, scale: 0.85 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={() => removeToast(t.id)}
            style={{ padding: "14px 20px", borderRadius: 16, pointerEvents: "all", background: t.type === "success" ? GRAD.green : t.type === "error" ? GRAD.red : GRAD.primary, color: "#fff", fontSize: 14, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 10, minWidth: 280, cursor: "pointer" }}
          >
            <span style={{ fontSize: 18 }}>{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE LOADER
// ─────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.page, flexDirection: "column", gap: 24, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ position: "relative", width: 80, height: 80 }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ width: 80, height: 80, borderRadius: "50%", border: "4px solid #e8ecf0", borderTop: `4px solid ${C.purple}`, position: "absolute" }} />
        <div style={{ position: "absolute", inset: 10, borderRadius: "50%", background: GRAD.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🏥</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: C.textPrimary, marginBottom: 6 }}>MediBook</div>
        <div style={{ fontSize: 14, color: C.textMuted }}>Loading your health portal...</div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i} animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
            style={{ width: 8, height: 8, borderRadius: "50%", background: C.purple }} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STATUS PILL
// ─────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; dot: string; label: string }> = {
    completed: { bg: "rgba(34,197,94,0.1)", color: "#16a34a", dot: "#22c55e", label: "Completed" },
    "in-progress": { bg: "rgba(16,185,129,0.12)", color: "#059669", dot: "#10b981", label: "In Progress" },
    upcoming: { bg: "rgba(124,58,237,0.1)", color: "#7c3aed", dot: "#8b5cf6", label: "Upcoming" },
    cancelled: { bg: "rgba(239,68,68,0.1)", color: "#dc2626", dot: "#ef4444", label: "Cancelled" },
    active: { bg: "rgba(16,185,129,0.1)", color: "#059669", dot: "#10b981", label: "Active" },
    "in-treatment": { bg: "rgba(124,58,237,0.1)", color: "#7c3aed", dot: "#8b5cf6", label: "In Treatment" },
    monitoring: { bg: "rgba(8,145,178,0.1)", color: "#0891b2", dot: "#06b6d4", label: "Monitoring" },
    inactive: { bg: "rgba(100,116,139,0.1)", color: "#64748b", dot: "#94a3b8", label: "Inactive" },
  };
  const s = map[status] ?? { bg: "rgba(124,58,237,0.1)", color: C.purple, dot: C.purple, label: status };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 50, background: s.bg, border: `1px solid ${s.dot}40` }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────
function Card({ children, style = {}, topBarGrad = GRAD.topBar }: { children: React.ReactNode; style?: React.CSSProperties; topBarGrad?: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: "26px", border: "1px solid #e8ecf0", boxShadow: "0 6px 30px rgba(0,0,0,0.06)", position: "relative", overflow: "hidden", ...style }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: topBarGrad, borderRadius: "20px 20px 0 0" }} />
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────
function SectionHeader({ icon, gradient, title, subtitle, action }: { icon: string; gradient: string; title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, marginBottom: 20, borderBottom: "2px solid #e8ecf0", flexWrap: "wrap", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, background: gradient, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>{icon}</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.purpleDark }}>{title}</div>
          <div style={{ fontSize: 12, color: C.textLight, marginTop: 1 }}>{subtitle}</div>
        </div>
      </div>
      {action}
    </div>
  );
}

// ─────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────
function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed, patient, clinic, onLogout }: {
  activeTab: string; setActiveTab: (t: string) => void;
  collapsed: boolean; setCollapsed: (v: boolean) => void;
  patient: PatientProfile | null; clinic: Clinic | null; onLogout: () => void;
}) {
  const navItems = [
    { id: "overview", icon: "📊", label: "Overview" },
    { id: "book", icon: "➕", label: "Book Appointment" },
    { id: "appointments", icon: "📅", label: "My Appointments" },
    { id: "reminders", icon: "🔔", label: "Reminders" }, // ✅ ADDED
    { id: "health", icon: "🩺", label: "Health Record" },
    { id: "doctor", icon: "👨‍⚕️", label: "My Doctor" },
    { id: "payments", icon: "💳", label: "Payments" },
    { id: "profile", icon: "👤", label: "My Profile" },
  ];
  const initials = patient?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "PT";

  return (
    <motion.div animate={{ width: collapsed ? 68 : 240 }} transition={{ duration: 0.3 }}
      style={{ minHeight: "100vh", background: GRAD.hero, display: "flex", flexDirection: "column", padding: collapsed ? "24px 10px" : "24px 14px", flexShrink: 0, overflow: "hidden", boxShadow: "4px 0 24px rgba(0,0,0,0.15)" }}>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: GRAD.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, boxShadow: "0 4px 12px rgba(124,58,237,0.4)" }}>🏥</div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", lineHeight: 1 }}>MediBook</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.2px", marginTop: 2 }}>{clinic?.name || "Patient Portal"}</div>
          </div>
        )}
      </div>

      {/* Patient card */}
      {!collapsed && patient && (
        <div style={{ padding: "12px 14px", marginBottom: 20, background: "rgba(255,255,255,0.08)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: GRAD.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{patient.name}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>🟣 Patient</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <div style={{ flex: 1 }}>
        {!collapsed && <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 8, paddingLeft: 10 }}>📌 Navigation</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map((item, idx) => {
            const isActive = activeTab === item.id;
            const isPayments = item.id === "payments";
            return (
              <motion.button key={item.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                onClick={() => setActiveTab(item.id)}
                style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "11px" : "10px 12px", borderRadius: 11, border: "none", cursor: "pointer", background: isActive ? "rgba(255,255,255,0.15)" : "transparent", borderLeft: isActive && !collapsed ? `3px solid ${C.purpleLight}` : "3px solid transparent", transition: "all 0.2s ease", width: "100%", position: "relative" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && (
                  <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? "#fff" : "rgba(255,255,255,0.65)", whiteSpace: "nowrap", flex: 1, textAlign: "left" }}>{item.label}</span>
                )}
                {/* Coming soon badge for payments */}
                {isPayments && !collapsed && (
                  <span style={{ fontSize: 8, fontWeight: 800, background: "rgba(245,158,11,0.3)", color: "#fbbf24", padding: "2px 6px", borderRadius: 50, letterSpacing: "0.5px", textTransform: "uppercase", flexShrink: 0 }}>Soon</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bottom */}
      <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: 2 }}>
        <button onClick={() => setCollapsed(!collapsed)} style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "11px" : "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500, width: "100%" }}>
          <span style={{ fontSize: 16 }}>{collapsed ? "→" : "←"}</span>
          {!collapsed && <span>Collapse</span>}
        </button>
        <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "11px" : "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500, width: "100%", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.color = "#f87171"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
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
function TopBar({ title, subtitle, patient }: { title: string; subtitle: string; patient: PatientProfile | null }) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const initials = patient?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "PT";
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #e8ecf0", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <div>
        <h1 style={{ fontSize: 19, fontWeight: 900, color: C.textPrimary, letterSpacing: "-0.5px" }}>{title}</h1>
        <p style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{subtitle}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 50, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
          <span style={{ fontSize: 13 }}>📅</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.purpleDark }}>{today}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px 5px 5px", borderRadius: 50, background: "#f5f3ff", border: "1px solid #e8ecf0" }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: GRAD.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>{initials}</div>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.textPrimary }}>{patient?.name || "Patient"}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAYMENTS TAB — UPCOMING FEATURE
// ─────────────────────────────────────────────
function PaymentsTab({ appointments }: { appointments: Appointment[] }) {
  const paid = appointments.filter(a => a.status === "completed" && a.fee > 0);
  const unpaid = appointments.filter(a => a.status === "upcoming" && a.fee > 0);
  const totalPaid = paid.reduce((s, a) => s + a.fee, 0);
  const totalUnpaid = unpaid.reduce((s, a) => s + a.fee, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Coming Soon Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "linear-gradient(135deg, #2e1065, #5b21b6)", borderRadius: 20, padding: "32px", position: "relative", overflow: "hidden", boxShadow: "0 12px 40px rgba(91,33,182,0.3)" }}>
        <div style={{ position: "absolute", right: -30, top: -30, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", right: 60, bottom: -50, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 50, background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)", marginBottom: 16 }}>
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: 14 }}>🚀</motion.span>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "1.5px" }}>Coming Soon</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", marginBottom: 10 }}>Online Payments</div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, maxWidth: 480 }}>
            We&apos;re building a secure payment system so you can pay for appointments, view invoices, and manage your health billing — all in one place.
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
            {["💳 Card Payments", "🏦 Bank Transfer", "📧 Email Invoices", "📊 Payment History"].map(f => (
              <div key={f} style={{ padding: "8px 14px", borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{f}</div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Payment summary (current data) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
        {[
          { label: "Total Paid", value: `$${totalPaid.toLocaleString()}`, icon: "✅", grad: GRAD.green, sub: `${paid.length} appointments` },
          { label: "Pending", value: `$${totalUnpaid.toLocaleString()}`, icon: "⏳", grad: GRAD.amber, sub: `${unpaid.length} upcoming` },
          { label: "Total Billed", value: `$${(totalPaid + totalUnpaid).toLocaleString()}`, icon: "📋", grad: GRAD.primary, sub: "All time" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: C.textPrimary, letterSpacing: "-0.5px" }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6 }}>{s.sub}</div>
                </div>
                <div style={{ width: 42, height: 42, background: s.grad, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}>{s.icon}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent billing */}
      <Card topBarGrad={GRAD.primary}>
        <SectionHeader icon="💳" gradient={GRAD.primary} title="Billing History" subtitle="Appointment fees" />
        {appointments.filter(a => a.fee > 0).length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: C.textMuted }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>💳</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>No billing records yet</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {appointments.filter(a => a.fee > 0).slice(0, 10).map((apt, i) => (
              <motion.div key={apt.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e8ecf0" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: apt.status === "completed" ? GRAD.green : GRAD.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                    {apt.status === "completed" ? "✅" : "⏳"}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>{apt.type}</div>
                    <div style={{ fontSize: 11, color: C.textLight, marginTop: 1 }}>{apt.doctor_name} · {apt.date}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: apt.status === "completed" ? C.greenDark : C.amber }}>${apt.fee}</div>
                  <StatusPill status={apt.status} />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Payment CTA */}
        <div style={{ marginTop: 20, padding: "16px", borderRadius: 14, background: "rgba(124,58,237,0.04)", border: "2px dashed rgba(124,58,237,0.2)", textAlign: "center" }}>
          <div style={{ fontSize: 20, marginBottom: 8 }}>🔔</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.purpleDark, marginBottom: 4 }}>Online payments coming soon</div>
          <div style={{ fontSize: 12, color: C.textMuted }}>You&apos;ll be able to pay directly from this dashboard. For now, please pay at the clinic.</div>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// BOOK APPOINTMENT TAB (UPDATED: availability check + clearer trust microcopy)
// ─────────────────────────────────────────────
function BookAppointmentTab({ patient, doctor, clinic, addToast, onBooked }: {
  patient: PatientProfile | null; doctor: Doctor | null;
  clinic: Clinic | null;
  addToast: (msg: string, type?: Toast["type"]) => void;
  onBooked: () => void;
}) {
  const [form, setForm] = useState({ type: "", date: "", time: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);

  // Best-effort availability (won't change your API)
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [takenTimes, setTakenTimes] = useState<string[]>([]);
  const [availabilityHint, setAvailabilityHint] = useState<string>("");

  const bookingFee = clinic?.booking_fee ?? 50;

  const appointmentTypes = [
    "General Consultation", "Follow-up Visit", "Lab Results Review",
    "Physical Examination", "Prescription Renewal", "Specialist Referral",
    "Emergency Consultation", "Vaccination", "Mental Health Check",
    "Chronic Disease Management",
  ];

  const timeSlots = [
    "08:00 AM","08:30 AM","09:00 AM","09:30 AM","10:00 AM","10:30 AM",
    "11:00 AM","11:30 AM","12:00 PM","12:30 PM","01:00 PM","01:30 PM",
    "02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM","04:30 PM","05:00 PM",
  ];

  const today = new Date().toISOString().split("T")[0];

  const selectStyle: React.CSSProperties = {
    width: "100%", padding: "13px 16px", borderRadius: 12,
    border: "2px solid #e8ecf0", fontSize: 14, color: C.textPrimary,
    background: "#fff", outline: "none", boxSizing: "border-box",
    transition: "all 0.2s", fontFamily: "'Segoe UI', system-ui, sans-serif",
    cursor: "pointer",
  };

  const disabledSelectStyle: React.CSSProperties = {
    ...selectStyle, background: "#f8fafc", cursor: "not-allowed",
  };

  // ✅ Availability check (best-effort). If RLS blocks reading other patients, we degrade gracefully.
  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setTakenTimes([]);
      setAvailabilityHint("");
      if (!doctor?.id || !form.date) return;

      setCheckingAvailability(true);
      try {
        const { data, error } = await supabase
          .from("appointments")
          .select("time,status")
          .eq("doctor_id", doctor.id)
          .eq("date", form.date)
          .neq("status", "cancelled");

        if (!mounted) return;

        if (error) {
          setAvailabilityHint("Availability check is not available for this clinic setup.");
          setTakenTimes([]);
          return;
        }

        const times = (data ?? [])
          .filter((r: { time: string; status: string }) => r.status !== "cancelled")
          .map((r: { time: string }) => r.time);

        setTakenTimes(times);
        setAvailabilityHint(times.length > 0 ? "Some time slots are already booked." : "All time slots currently look available.");
      } finally {
        if (mounted) setCheckingAvailability(false);
      }
    };

    void run();
    return () => { mounted = false; };
  }, [doctor?.id, form.date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) { addToast("Patient profile not loaded.", "error"); return; }
    if (!doctor) { addToast("No doctor assigned. Please contact your clinic admin.", "error"); return; }
    if (!form.type || !form.date || !form.time) {
      addToast("Please fill in appointment type, date, and time.", "error"); return;
    }

    // Soft guard
    if (takenTimes.includes(form.time)) {
      addToast("That time slot may already be taken. Please choose another time.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/patient/book-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: form.type, date: form.date, time: form.time, notes: form.notes }),
      });

      const json = await res.json() as { ok?: boolean; error?: string; fee?: number };

      if (!res.ok || !json.ok) {
        addToast(json.error ?? "Booking failed. Please try again.", "error");
        return;
      }

      addToast(`Appointment booked! Fee: $${json.fee ?? bookingFee}`, "success");
      setBooked(true);
      setForm({ type: "", date: "", time: "", notes: "" });
      onBooked();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Unknown error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (booked) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card topBarGrad={GRAD.green}>
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }} style={{ fontSize: 64, marginBottom: 20 }}>🎉</motion.div>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.textPrimary, marginBottom: 8 }}>Appointment Booked!</div>
            <div style={{ fontSize: 15, color: C.textMuted, marginBottom: 24 }}>Your appointment has been successfully scheduled.</div>
            <button onClick={() => setBooked(false)} style={{ padding: "12px 28px", borderRadius: 14, border: "none", background: GRAD.primary, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Book Another →
            </button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {!doctor && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: "16px 20px", borderRadius: 16, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#92400e" }}>No Doctor Assigned</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Please contact your clinic admin to assign a doctor before booking.</div>
          </div>
        </motion.div>
      )}

      <Card topBarGrad={GRAD.primary}>
        <SectionHeader icon="➕" gradient={GRAD.primary} title="Book an Appointment"
          subtitle={doctor ? `With ${doctor.name} · ${doctor.specialty}` : "No doctor assigned yet"} />

        {/* Doctor pill */}
        {doctor && (
          <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(91,33,182,0.05)", border: "1px solid rgba(91,33,182,0.15)", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: doctor.grad || GRAD.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 700, flexShrink: 0 }}>{doctor.initials}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.textPrimary }}>{doctor.name}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{doctor.specialty}</div>
              </div>
            </div>
            {/* Booking fee badge */}
            <div style={{ padding: "8px 16px", borderRadius: 12, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", textAlign: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 2 }}>Booking Fee</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.greenDark }}>${bookingFee}</div>
            </div>
          </div>
        )}

        {doctor && (
          <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 14, background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.14)" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.purpleDark }}>🧠 Smart scheduling</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6, lineHeight: 1.6 }}>
              {checkingAvailability ? "Checking availability…" : (availabilityHint || "Choose your preferred time — the clinic will confirm if needed.")}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Type */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>📋 Appointment Type *</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} required disabled={!doctor || submitting}
              style={!doctor || submitting ? disabledSelectStyle : selectStyle}
              onFocus={e => { e.currentTarget.style.border = `2px solid ${C.purple}`; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(124,58,237,0.08)"; }}
              onBlur={e => { e.currentTarget.style.border = "2px solid #e8ecf0"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <option value="">Select appointment type...</option>
              {appointmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Date + Time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>📅 Preferred Date *</label>
              <input type="date" value={form.date} min={today} required disabled={!doctor || submitting}
                onChange={e => setForm(f => ({ ...f, date: e.target.value, time: "" }))}
                style={{ ...((!doctor || submitting) ? disabledSelectStyle : selectStyle) }}
                onFocus={e => { e.currentTarget.style.border = `2px solid ${C.purple}`; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(124,58,237,0.08)"; }}
                onBlur={e => { e.currentTarget.style.border = "2px solid #e8ecf0"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>🕐 Preferred Time *</label>
              <select value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} required disabled={!doctor || submitting || !form.date}
                style={!doctor || submitting || !form.date ? disabledSelectStyle : selectStyle}
                onFocus={e => { e.currentTarget.style.border = `2px solid ${C.purple}`; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(124,58,237,0.08)"; }}
                onBlur={e => { e.currentTarget.style.border = "2px solid #e8ecf0"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <option value="">{form.date ? "Select time slot..." : "Select date first..."}</option>
                {timeSlots.map(t => (
                  <option key={t} value={t} disabled={takenTimes.includes(t)}>
                    {takenTimes.includes(t) ? `${t} — booked` : t}
                  </option>
                ))}
              </select>
              {doctor && form.date && takenTimes.length > 0 && (
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 8 }}>
                  Greyed-out slots are already booked.
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>📝 Notes / Symptoms (optional)</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Describe your symptoms or reason for visit..."
              rows={4} disabled={!doctor || submitting}
              style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "2px solid #e8ecf0", fontSize: 14, color: C.textPrimary, background: !doctor ? "#f8fafc" : "#fff", outline: "none", boxSizing: "border-box", transition: "all 0.2s", fontFamily: "'Segoe UI', system-ui, sans-serif", resize: "vertical", minHeight: 100 }}
              onFocus={e => { e.currentTarget.style.border = `2px solid ${C.purple}`; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(124,58,237,0.08)"; }}
              onBlur={e => { e.currentTarget.style.border = "2px solid #e8ecf0"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          {/* Summary preview */}
          {form.type && form.date && form.time && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ padding: "18px", borderRadius: 16, background: "rgba(91,33,182,0.04)", border: "1px solid rgba(91,33,182,0.15)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.purpleDark, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 14 }}>📋 Booking Summary</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                {[
                  { label: "Type", value: form.type },
                  { label: "Doctor", value: doctor?.name ?? "—" },
                  { label: "Date", value: new Date(form.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) },
                  { label: "Time", value: form.time },
                  { label: "Booking Fee", value: `$${bookingFee}` },
                  { label: "Status", value: "Upcoming" },
                ].map(f => (
                  <div key={f.label} style={{ padding: "10px 12px", borderRadius: 10, background: "#fff", border: "1px solid #e8ecf0" }}>
                    <div style={{ fontSize: 9, color: C.textLight, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 3 }}>{f.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: f.label === "Booking Fee" ? C.greenDark : C.textPrimary }}>{f.value}</div>
                  </div>
                ))}
              </div>
              {/* Fee note */}
              <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", fontSize: 12, color: "#92400e", display: "flex", alignItems: "center", gap: 8 }}>
                <span>💡</span>
                <span>Booking fee of <strong>${bookingFee}</strong> is payable at the clinic. Online payments coming soon.</span>
              </div>
            </motion.div>
          )}

          {/* Submit */}
          <button type="submit" disabled={submitting || !doctor}
            style={{ padding: "15px", borderRadius: 14, border: "none", background: submitting || !doctor ? "rgba(156,163,175,0.4)" : GRAD.primary, color: "#fff", fontSize: 15, fontWeight: 700, cursor: submitting || !doctor ? "not-allowed" : "pointer", boxShadow: submitting || !doctor ? "none" : "0 4px 20px rgba(91,33,182,0.35)", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
            onMouseEnter={e => { if (!submitting && doctor) e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {submitting ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff" }} />
                Booking...
              </>
            ) : `📅 Confirm Booking · $${bookingFee}`}
          </button>
        </form>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// OVERVIEW TAB (UPDATED: shows confirmation hint)
// ─────────────────────────────────────────────
function OverviewTab({ patient, appointments, doctor, clinic, setActiveTab, confirmMap }: {
  patient: PatientProfile | null; appointments: Appointment[];
  doctor: Doctor | null; clinic: Clinic | null; setActiveTab: (t: string) => void;
  confirmMap: ConfirmMap;
}) {
  const today = new Date().toISOString().split("T")[0];
  const upcoming = appointments.filter(a => a.status === "upcoming" && a.date >= today);
  const completed = appointments.filter(a => a.status === "completed");
  const nextAppt = [...upcoming].sort((a, b) => combineDateTime(a.date, a.time).getTime() - combineDateTime(b.date, b.time).getTime())[0];
  const bookingFee = clinic?.booking_fee ?? 50;

  const nextConfirmed = nextAppt ? !!confirmMap[nextAppt.id]?.confirmed : false;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: GRAD.hero, borderRadius: 20, padding: "28px 32px", position: "relative", overflow: "hidden", boxShadow: "0 12px 40px rgba(91,33,182,0.25)" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 600, marginBottom: 6 }}>
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", marginBottom: 8 }}>{patient?.name || "Patient"} 👋</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}>{patient?.condition ? `Managing: ${patient.condition}` : "Welcome to your health portal"}</div>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { label: "Upcoming", value: upcoming.length, icon: "📅" },
              { label: "Completed", value: completed.length, icon: "✅" },
              { label: "Visits", value: patient?.visits ?? 0, icon: "🏥" },
            ].map(s => (
              <div key={s.label} style={{ padding: "14px 20px", borderRadius: 16, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", textAlign: "center", minWidth: 90 }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {[
          { label: "Book Appointment", icon: "➕", tab: "book", grad: GRAD.primary },
          { label: "My Appointments", icon: "📅", tab: "appointments", grad: GRAD.green },
          { label: "Reminders", icon: "🔔", tab: "reminders", grad: GRAD.amber },
          { label: "Health Record", icon: "🩺", tab: "health", grad: GRAD.blue },
        ].map((a, i) => (
          <motion.button key={a.tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            onClick={() => setActiveTab(a.tab)}
            style={{ padding: "18px 20px", borderRadius: 16, border: "none", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border2: "1px solid #e8ecf0", transition: "all 0.2s" } as React.CSSProperties}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)"; }}
          >
            <div style={{ width: 42, height: 42, borderRadius: 12, background: a.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>{a.icon}</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>{a.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Booking fee info */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div style={{ padding: "14px 20px", borderRadius: 14, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: GRAD.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💰</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>Clinic Booking Fee</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>Fee applied to all appointments at {clinic?.name || "your clinic"}</div>
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.greenDark }}>${bookingFee}</div>
        </div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
        {/* Next appointment */}
        <Card topBarGrad={GRAD.primary}>
          <SectionHeader
            icon="⏰"
            gradient={GRAD.primary}
            title="Next Appointment"
            subtitle="Your upcoming visit"
            action={
              nextAppt ? (
                <button
                  onClick={() => setActiveTab("reminders")}
                  style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: "rgba(245,158,11,0.12)", color: "#92400e", fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                >
                  🔔 Confirm/Reschedule →
                </button>
              ) : undefined
            }
          />
          {nextAppt ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ padding: "20px", borderRadius: 16, background: "linear-gradient(135deg, rgba(91,33,182,0.06), rgba(124,58,237,0.06))", border: "1px solid rgba(124,58,237,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: C.purpleDark }}>{nextAppt.time}</div>
                  <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>
                    {new Date(nextAppt.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <StatusPill status={nextAppt.status} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: nextConfirmed ? C.greenDark : C.textMuted }}>
                    {nextConfirmed ? "✅ Confirmed" : "Awaiting confirmation"}
                  </span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "Doctor", value: nextAppt.doctor_name, icon: "👨‍⚕️" },
                  { label: "Type", value: nextAppt.type, icon: "📋" },
                  { label: "Room", value: nextAppt.room, icon: "🚪" },
                  { label: "Fee", value: `$${nextAppt.fee}`, icon: "💰" },
                ].map(f => (
                  <div key={f.label} style={{ padding: "10px 12px", borderRadius: 10, background: "#fff", border: "1px solid #e8ecf0" }}>
                    <div style={{ fontSize: 10, color: C.textLight, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 3 }}>{f.icon} {f.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: f.label === "Fee" ? C.greenDark : C.textPrimary }}>{f.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div style={{ textAlign: "center", padding: "32px", color: C.textMuted }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>No upcoming appointments</div>
              <button onClick={() => setActiveTab("book")} style={{ marginTop: 14, padding: "10px 20px", borderRadius: 12, border: "none", background: GRAD.primary, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Book Now →
              </button>
            </div>
          )}
        </Card>

        {/* My Doctor */}
        <Card topBarGrad={GRAD.green}>
          <SectionHeader icon="👨‍⚕️" gradient={GRAD.green} title="My Doctor" subtitle="Your assigned physician" />
          {doctor ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px", borderRadius: 16, background: "rgba(5,150,105,0.05)", border: "1px solid rgba(5,150,105,0.15)", marginBottom: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: doctor.grad || GRAD.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: 700, flexShrink: 0 }}>{doctor.initials}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.textPrimary }}>{doctor.name}</div>
                  <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>{doctor.specialty}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 4 }}>
                    {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 12, color: s <= Math.floor(doctor.rating) ? "#f59e0b" : "#e8ecf0" }}>★</span>)}
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.textPrimary, marginLeft: 4 }}>{doctor.rating}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setActiveTab("doctor")} style={{ width: "100%", padding: "10px", borderRadius: 12, border: "1px solid #e8ecf0", background: "#f8fafc", color: C.textMuted, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                View Full Profile →
              </button>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "32px", color: C.textMuted }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>👨‍⚕️</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>No doctor assigned yet</div>
              <div style={{ fontSize: 12, color: C.textLight, marginTop: 6 }}>Your clinic admin will assign a doctor</div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// APPOINTMENTS TAB (UPDATED: shows confirmation badge if available)
// ─────────────────────────────────────────────
function AppointmentsTab({
  appointments,
  setActiveTab,
  confirmMap,
}: {
  appointments: Appointment[];
  setActiveTab: (t: string) => void;
  confirmMap: ConfirmMap;
}) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const filtered = appointments.filter(a => {
    const matchFilter = filter === "all" || a.status === filter;
    const matchSearch = !search || a.doctor_name.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const grouped = filtered.reduce((acc, apt) => {
    if (!acc[apt.date]) acc[apt.date] = [];
    acc[apt.date].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  const sortedDates = Object.keys(grouped).sort();

  return (
    <Card>
      <SectionHeader
        icon="📅"
        gradient={GRAD.primary}
        title="My Appointments"
        subtitle={`${appointments.length} total appointments`}
        action={
          <button onClick={() => setActiveTab("book")} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: GRAD.primary, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(91,33,182,0.3)" }}>
            ➕ Book New
          </button>
        }
      />

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>🔍</span>
          <input placeholder="Search by doctor or type..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "9px 14px 9px 36px", borderRadius: 11, border: "2px solid #e8ecf0", fontSize: 13, color: C.textPrimary, background: "#f8fafc", outline: "none", boxSizing: "border-box", transition: "all 0.2s" }}
            onFocus={e => (e.currentTarget.style.border = `2px solid ${C.purple}`)} onBlur={e => (e.currentTarget.style.border = "2px solid #e8ecf0")} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["all", "upcoming", "in-progress", "completed", "cancelled"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 13px", borderRadius: 50, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", background: filter === f ? GRAD.primary : "#f0f4f8", color: filter === f ? "#fff" : C.textMuted, transition: "all 0.2s", textTransform: "capitalize" }}>
              {f === "all" ? "All" : f.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total", value: appointments.length, color: C.purple },
          { label: "Upcoming", value: appointments.filter(a => a.status === "upcoming").length, color: C.purple },
          { label: "Completed", value: appointments.filter(a => a.status === "completed").length, color: C.green },
          { label: "Cancelled", value: appointments.filter(a => a.status === "cancelled").length, color: C.red },
        ].map(s => (
          <div key={s.label} style={{ padding: "10px", borderRadius: 11, background: "#f8fafc", border: "1px solid #e8ecf0", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: C.textLight, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {sortedDates.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px", color: C.textMuted }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>No appointments found</div>
          <button onClick={() => setActiveTab("book")} style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: GRAD.primary, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Book Your First Appointment →</button>
        </div>
      ) : (
        sortedDates.map(date => (
          <div key={date} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ padding: "4px 14px", borderRadius: 50, background: date === today ? GRAD.primary : "#f0f4f8", fontSize: 12, fontWeight: 700, color: date === today ? "#fff" : C.textMuted }}>
                {date === today ? "📅 Today" : new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </div>
              <div style={{ flex: 1, height: 1, background: "#e8ecf0" }} />
              <span style={{ fontSize: 11, color: C.textLight, fontWeight: 600 }}>{grouped[date].length} appointments</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {grouped[date].map((apt, i) => {
                const confirmed = !!confirmMap[apt.id]?.confirmed;
                return (
                  <motion.div key={apt.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, background: apt.status === "in-progress" ? "rgba(124,58,237,0.05)" : "#f8fafc", border: apt.status === "in-progress" ? "1px solid rgba(124,58,237,0.2)" : "1px solid #e8ecf0" }}>
                    <div style={{ minWidth: 60, textAlign: "center", padding: "8px", background: "#fff", borderRadius: 10, border: "1px solid #e8ecf0", flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: C.textPrimary, lineHeight: 1 }}>{apt.time.split(" ")[0]}</div>
                      <div style={{ fontSize: 9, color: C.textLight, marginTop: 1 }}>{apt.time.split(" ")[1]}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, marginBottom: 3 }}>{apt.doctor_name}</div>
                      <div style={{ display: "flex", gap: 10, fontSize: 11, color: C.textMuted, flexWrap: "wrap" }}>
                        <span>📋 {apt.type}</span>
                        <span>🚪 {apt.room}</span>
                        <span style={{ color: C.greenDark, fontWeight: 700 }}>💰 ${apt.fee}</span>
                        {apt.status === "upcoming" && (
                          <span style={{ color: confirmed ? C.greenDark : C.textMuted, fontWeight: 800 }}>
                            {confirmed ? "✅ Confirmed" : "Awaiting confirmation"}
                          </span>
                        )}
                      </div>
                      {apt.notes && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, fontStyle: "italic" }}>📝 {apt.notes}</div>}
                    </div>
                    <StatusPill status={apt.status} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </Card>
  );
}

// ─────────────────────────────────────────────
// REMINDERS TAB (NEW)
// - 48h/24h/2h schedule
// - Confirm (localStorage)
// - Reschedule/Cancel (Supabase update, conflict-check best-effort)
// ─────────────────────────────────────────────
function RemindersTab({
  patient,
  appointments,
  doctor,
  clinic,
  confirmMap,
  setConfirmMap,
  addToast,
  refreshAppointments,
}: {
  patient: PatientProfile | null;
  appointments: Appointment[];
  doctor: Doctor | null;
  clinic: Clinic | null;
  confirmMap: ConfirmMap;
  setConfirmMap: React.Dispatch<React.SetStateAction<ConfirmMap>>;
  addToast: (msg: string, type?: Toast["type"]) => void;
  refreshAppointments: () => Promise<void>;
}) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const upcoming = useMemo(() => {
    return appointments
      .filter(a => a.status === "upcoming" && a.date >= today)
      .slice()
      .sort((a, b) => combineDateTime(a.date, a.time).getTime() - combineDateTime(b.date, b.time).getTime());
  }, [appointments, today]);

  const timeSlots = [
    "08:00 AM","08:30 AM","09:00 AM","09:30 AM","10:00 AM","10:30 AM",
    "11:00 AM","11:30 AM","12:00 PM","12:30 PM","01:00 PM","01:30 PM",
    "02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM","04:30 PM","05:00 PM",
  ];

  const scheduleFor = (apt: Appointment): Array<{ label: string; at: Date }> => {
    const base = combineDateTime(apt.date, apt.time);
    const hours = [48, 24, 2];
    return hours.map(h => {
      const d = new Date(base);
      d.setHours(d.getHours() - h);
      return { label: `${h}h before`, at: d };
    });
  };

  const persistConfirmMap = (next: ConfirmMap) => {
    if (!patient?.id) return;
    localStorage.setItem(`medibook_patient_confirm_${patient.id}`, JSON.stringify(next));
  };

  const confirmAppointment = (apt: Appointment) => {
    const next: ConfirmMap = {
      ...confirmMap,
      [apt.id]: { confirmed: true, confirmedAtISO: new Date().toISOString() },
    };
    setConfirmMap(next);
    persistConfirmMap(next);
    addToast("Appointment confirmed. You’re all set.", "success");
  };

  const cancelAppointment = async (apt: Appointment) => {
    setSaving(true);
    try {
      const { error } = await supabase.from("appointments").update({ status: "cancelled" }).eq("id", apt.id);
      if (error) {
        addToast("Could not cancel appointment. Please contact the clinic.", "error");
        return;
      }
      addToast("Appointment cancelled.", "success");
      await refreshAppointments();
    } finally {
      setSaving(false);
    }
  };

  const openReschedule = (apt: Appointment) => {
    setRescheduleId(apt.id);
    setNewDate(apt.date);
    setNewTime(apt.time);
    setRescheduleOpen(true);
  };

  const saveReschedule = async () => {
    if (!rescheduleId) return;
    if (!newDate || !newTime) {
      addToast("Select a new date and time.", "error");
      return;
    }

    const current = appointments.find(a => a.id === rescheduleId);
    if (!current) {
      addToast("Appointment not found.", "error");
      return;
    }

    setSaving(true);
    try {
      // Best-effort conflict detection (only if clinic RLS permits reading schedule)
      if (current.doctor_id) {
        const { data: conflicts, error: conflictErr } = await supabase
          .from("appointments")
          .select("id")
          .eq("doctor_id", current.doctor_id)
          .eq("date", newDate)
          .eq("time", newTime)
          .neq("id", rescheduleId)
          .neq("status", "cancelled")
          .limit(1);

        if (conflictErr) {
          addToast("Reschedule saved, but conflict check is not available for this clinic setup.", "info");
        } else if ((conflicts ?? []).length > 0) {
          addToast("That time is already booked. Please choose another slot.", "error");
          return;
        }
      }

      const { error } = await supabase
        .from("appointments")
        .update({ date: newDate, time: newTime, status: "upcoming" })
        .eq("id", rescheduleId);

      if (error) {
        addToast("Could not reschedule. Please contact the clinic.", "error");
        return;
      }

      // Reset confirmation on reschedule (local)
      if (patient?.id) {
        const next: ConfirmMap = { ...confirmMap, [rescheduleId]: { confirmed: false } };
        setConfirmMap(next);
        persistConfirmMap(next);
      }

      addToast("Reschedule saved. Please confirm your updated time.", "success");
      setRescheduleOpen(false);
      await refreshAppointments();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Card topBarGrad={GRAD.amber}>
        <SectionHeader
          icon="🔔"
          gradient={GRAD.amber}
          title="Automated Reminders"
          subtitle="48h, 24h, and 2h reminders help clinics reduce no-shows."
        />
        <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>
          Confirming your appointment keeps your slot reserved. If you need to change the time, reschedule early so the clinic can offer your slot to another patient.
        </div>
      </Card>

      <Card topBarGrad={GRAD.primary}>
        <SectionHeader
          icon="📅"
          gradient={GRAD.primary}
          title="Upcoming Visits"
          subtitle={`${upcoming.length} upcoming appointment(s)`}
          action={
            clinic ? (
              <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>
                Need help? {clinic.phone ? `📞 ${clinic.phone}` : ""} {clinic.email ? `· 📧 ${clinic.email}` : ""}
              </div>
            ) : undefined
          }
        />

        {upcoming.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: C.textMuted }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🔔</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>No upcoming appointments</div>
            <div style={{ fontSize: 12, color: C.textLight, marginTop: 6 }}>Book a visit to start receiving reminders.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {upcoming.slice(0, 10).map((apt) => {
              const confirmed = !!confirmMap[apt.id]?.confirmed;
              const confirmedAt = confirmMap[apt.id]?.confirmedAtISO;

              return (
                <div
                  key={apt.id}
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    background: "#f8fafc",
                    border: "1px solid #e8ecf0",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: C.textPrimary }}>
                        {apt.type} • {apt.doctor_name}
                      </div>
                      <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>
                        📅 {formatPrettyDate(apt.date)} • ⏰ {apt.time} • 🚪 {apt.room}
                      </div>

                      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <StatusPill status={apt.status} />
                        <span style={{ fontSize: 11, fontWeight: 800, color: confirmed ? C.greenDark : C.textMuted }}>
                          {confirmed ? "✅ Confirmed" : "Awaiting confirmation"}
                        </span>
                        {confirmed && confirmedAt ? (
                          <span style={{ fontSize: 11, color: C.textLight }}>
                            Confirmed on {new Date(confirmedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => confirmAppointment(apt)}
                        disabled={confirmed}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 12,
                          border: "none",
                          background: confirmed ? "rgba(156,163,175,0.4)" : GRAD.green,
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: confirmed ? "not-allowed" : "pointer",
                        }}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => openReschedule(apt)}
                        disabled={saving}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 12,
                          border: "1px solid rgba(124,58,237,0.25)",
                          background: "rgba(124,58,237,0.06)",
                          color: C.purpleDark,
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: saving ? "not-allowed" : "pointer",
                          opacity: saving ? 0.6 : 1,
                        }}
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => void cancelAppointment(apt)}
                        disabled={saving}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 12,
                          border: "1px solid rgba(239,68,68,0.25)",
                          background: "rgba(239,68,68,0.06)",
                          color: C.red,
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: saving ? "not-allowed" : "pointer",
                          opacity: saving ? 0.6 : 1,
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                    {scheduleFor(apt).map((s) => (
                      <div key={s.label} style={{ padding: 12, borderRadius: 14, background: "#fff", border: "1px solid #e8ecf0" }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: C.textLight, textTransform: "uppercase", letterSpacing: "1px" }}>
                          {s.label}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: C.textPrimary, marginTop: 6 }}>
                          {s.at.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {doctor ? (
                    <div style={{ marginTop: 12, fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
                      Tip: If you need a prescription renewal, choose “Prescription Renewal” when booking and add your medication details in notes.
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <AnimatePresence>
        {rescheduleOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99998,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 18,
            }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setRescheduleOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.25 }}
              style={{
                width: "100%",
                maxWidth: 560,
                background: "#fff",
                borderRadius: 24,
                padding: 28,
                boxShadow: "0 25px 80px rgba(0,0,0,0.3)",
                border: "1px solid #e8ecf0",
                position: "relative",
              }}
            >
              <button
                onClick={() => setRescheduleOpen(false)}
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: "1px solid #e8ecf0",
                  background: "#f8fafc",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                ✕
              </button>

              <div style={{ fontSize: 16, fontWeight: 900, color: C.textPrimary }}>Reschedule Appointment</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6, lineHeight: 1.6 }}>
                Choose a new time. If the doctor already has a booking at the same slot, MediBook will block the change (when clinic permissions allow conflict checking).
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>📅 Date</div>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "2px solid #e8ecf0", outline: "none" }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>🕐 Time</div>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "2px solid #e8ecf0", outline: "none", cursor: "pointer" }}
                  >
                    <option value="">Select time…</option>
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
                <button
                  onClick={() => setRescheduleOpen(false)}
                  disabled={saving}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: `2px solid ${C.purple}`,
                    background: "transparent",
                    color: C.purpleDark,
                    fontWeight: 900,
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => void saveReschedule()}
                  disabled={saving}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: "none",
                    background: saving ? "rgba(156,163,175,0.4)" : GRAD.primary,
                    color: "#fff",
                    fontWeight: 900,
                    cursor: saving ? "not-allowed" : "pointer",
                    boxShadow: saving ? "none" : "0 4px 18px rgba(91,33,182,0.25)",
                  }}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>

              <div style={{ marginTop: 12, fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
                If you urgently need care today, call the clinic directly for the fastest assistance.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// HEALTH TAB (UPDATED: Visit Notes + Labs + Prescriptions)
// ─────────────────────────────────────────────
function HealthTab({
  patient,
  records,
  doctor,
}: {
  patient: PatientProfile | null;
  records: PatientRecords;
  doctor: Doctor | null;
}) {
  if (!patient) return null;

  const exportSummary = () => {
    const lines: string[] = [];
    lines.push(`MediBook — Patient Summary`);
    lines.push(`Name: ${patient.name}`);
    lines.push(`Condition: ${patient.condition || "—"}`);
    lines.push(`Blood Type: ${patient.blood_type || "—"}`);
    lines.push(`Last Visit: ${patient.last_visit || "—"}`);
    lines.push(`Total Visits: ${patient.visits}`);
    lines.push(``);
    lines.push(`Visit Notes: ${records.visitNotes.length}`);
    for (const n of records.visitNotes.slice(0, 10)) {
      lines.push(`- ${new Date(n.createdAtISO).toLocaleDateString("en-US")} — ${n.title}${n.doctorName ? ` (${n.doctorName})` : ""}`);
      lines.push(`  ${n.body}`);
    }
    lines.push(``);
    lines.push(`Lab Results: ${records.labResults.length}`);
    for (const l of records.labResults.slice(0, 10)) {
      lines.push(`- ${new Date(l.createdAtISO).toLocaleDateString("en-US")} — ${l.testName}`);
      lines.push(`  ${l.summary}`);
      if (l.fileUrl) lines.push(`  Attachment: ${l.fileUrl}`);
    }
    lines.push(``);
    lines.push(`Prescriptions: ${records.prescriptions.length}`);
    for (const rx of records.prescriptions.slice(0, 10)) {
      lines.push(`- ${new Date(rx.createdAtISO).toLocaleDateString("en-US")} — ${rx.diagnosis ?? "Prescription"}`);
      lines.push(`  Instructions: ${rx.instructions}`);
      for (const it of rx.items) {
        lines.push(`  • ${it.medication} ${it.dosage} — ${it.frequency} for ${it.duration}${it.notes ? ` (${it.notes})` : ""}`);
      }
    }

    downloadTextFile(`medibook-records-${patient.name.replaceAll(" ", "-").toLowerCase()}.txt`, lines.join("\n"));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
        <Card topBarGrad={GRAD.primary}>
          <SectionHeader
            icon="🩺"
            gradient={GRAD.primary}
            title="Health Overview"
            subtitle="Your medical information"
            action={
              <button
                onClick={exportSummary}
                style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: GRAD.primary, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 14px rgba(91,33,182,0.3)" }}
              >
                ⬇️ Export Summary
              </button>
            }
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Primary Condition", value: patient.condition || "—", icon: "📋" },
              { label: "Blood Type", value: patient.blood_type || "—", icon: "🩸" },
              { label: "Health Status", value: patient.status, icon: "💚" },
              { label: "Last Visit", value: patient.last_visit || "—", icon: "🕐" },
              { label: "Total Visits", value: `${patient.visits} visits`, icon: "📊" },
            ].map(f => (
              <div key={f.label} style={{ padding: "12px 14px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e8ecf0" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: C.textLight, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{f.icon} {f.label}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.textPrimary }}>{f.value}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 14, background: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.18)", fontSize: 12, color: C.textMuted, lineHeight: 1.7 }}>
            <span style={{ fontWeight: 900, color: C.textPrimary }}>Privacy:</span> Your health records are only available to authorized clinic staff and your patient account.
          </div>
        </Card>

        <Card topBarGrad={GRAD.green}>
          <SectionHeader icon="📌" gradient={GRAD.green} title="Record Summary" subtitle="What’s currently available in your portal" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { label: "Visit Notes", value: records.visitNotes.length, color: C.blue },
              { label: "Lab Results", value: records.labResults.length, color: C.purple },
              { label: "Prescriptions", value: records.prescriptions.length, color: C.greenDark },
            ].map(s => (
              <div key={s.label} style={{ padding: "12px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e8ecf0", textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.8px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, padding: "14px", borderRadius: 14, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)", fontSize: 12, color: "#92400e", lineHeight: 1.7 }}>
            <span style={{ fontWeight: 900 }}>Important:</span> Always follow your doctor’s advice. If you experience urgent symptoms, contact your clinic immediately.
          </div>

          {doctor ? (
            <div style={{ marginTop: 14, padding: "14px", borderRadius: 14, background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.16)", fontSize: 12, color: C.textMuted, lineHeight: 1.7 }}>
              Records are typically updated by <span style={{ fontWeight: 900, color: C.textPrimary }}>{doctor.name}</span> and clinic staff after review.
            </div>
          ) : null}
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
        <Card topBarGrad={GRAD.blue}>
          <SectionHeader icon="📝" gradient={GRAD.blue} title="Visit Notes" subtitle="Clinical summaries from your visits" />
          {records.visitNotes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "34px", color: C.textMuted }}>
              <div style={{ fontSize: 34, marginBottom: 10 }}>📝</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>No visit notes yet</div>
              <div style={{ fontSize: 12, color: C.textLight, marginTop: 6 }}>
                After your visit, your clinic may upload a summary here.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {records.visitNotes.slice(0, 6).map((n) => (
                <div key={n.id} style={{ padding: 14, borderRadius: 14, background: "#f8fafc", border: "1px solid #e8ecf0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: C.textPrimary }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: C.textLight, fontWeight: 800 }}>
                      {new Date(n.createdAtISO).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 8, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                    {n.body}
                  </div>
                  {n.doctorName ? (
                    <div style={{ marginTop: 10, fontSize: 11, color: C.textLight, fontWeight: 700 }}>
                      Recorded by: {n.doctorName}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card topBarGrad={GRAD.amber}>
          <SectionHeader icon="🧪" gradient={GRAD.amber} title="Lab Results" subtitle="Summaries and attachments (if provided)" />
          {records.labResults.length === 0 ? (
            <div style={{ textAlign: "center", padding: "34px", color: C.textMuted }}>
              <div style={{ fontSize: 34, marginBottom: 10 }}>🧪</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>No lab results yet</div>
              <div style={{ fontSize: 12, color: C.textLight, marginTop: 6 }}>
                Lab results appear after clinic review.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {records.labResults.slice(0, 6).map((l) => (
                <div key={l.id} style={{ padding: 14, borderRadius: 14, background: "#f8fafc", border: "1px solid #e8ecf0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: C.textPrimary }}>{l.testName}</div>
                    <div style={{ fontSize: 11, color: C.textLight, fontWeight: 800 }}>
                      {new Date(l.createdAtISO).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 8, lineHeight: 1.7 }}>
                    {l.summary}
                  </div>
                  {l.fileUrl ? (
                    <a href={l.fileUrl} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 10, fontSize: 12, fontWeight: 900, color: C.blue, textDecoration: "none" }}>
                      📄 View attachment →
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card topBarGrad={GRAD.green}>
          <SectionHeader icon="💊" gradient={GRAD.green} title="Prescriptions" subtitle="Digital prescriptions issued by your doctor" />
          {records.prescriptions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "34px", color: C.textMuted }}>
              <div style={{ fontSize: 34, marginBottom: 10 }}>💊</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>No prescriptions yet</div>
              <div style={{ fontSize: 12, color: C.textLight, marginTop: 6 }}>
                If your doctor issues a prescription, it will appear here.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {records.prescriptions.slice(0, 4).map((rx) => (
                <div key={rx.id} style={{ padding: 14, borderRadius: 14, background: "#f8fafc", border: "1px solid #e8ecf0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: C.textPrimary }}>
                      {rx.diagnosis ? rx.diagnosis : "Prescription"}
                    </div>
                    <div style={{ fontSize: 11, color: C.textLight, fontWeight: 800 }}>
                      {new Date(rx.createdAtISO).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>

                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                    {rx.items.map((it) => (
                      <div key={it.id} style={{ padding: "10px 12px", borderRadius: 12, background: "#fff", border: "1px solid #e8ecf0" }}>
                        <div style={{ fontSize: 12, fontWeight: 900, color: C.textPrimary }}>
                          {it.medication} <span style={{ fontSize: 11, fontWeight: 900, color: C.textMuted }}>• {it.dosage}</span>
                        </div>
                        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, lineHeight: 1.6 }}>
                          {it.frequency} • {it.duration}{it.notes ? ` • ${it.notes}` : ""}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 10, fontSize: 12, color: C.textMuted, lineHeight: 1.7 }}>
                    <span style={{ fontWeight: 900, color: C.textPrimary }}>Instructions:</span> {rx.instructions}
                  </div>

                  <div style={{ marginTop: 10, fontSize: 11, fontWeight: 900, color: rx.status === "sent" ? C.greenDark : C.textMuted, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                    Status: {rx.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DOCTOR TAB
// ─────────────────────────────────────────────
function DoctorTab({ doctor, clinic }: { doctor: Doctor | null; clinic: Clinic | null }) {
  if (!doctor) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "60px", color: C.textMuted }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👨‍⚕️</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, marginBottom: 8 }}>No Doctor Assigned Yet</div>
          <div style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.6 }}>Your clinic admin will assign a doctor to your profile.</div>
          {clinic && (
            <div style={{ marginTop: 24, padding: "16px 20px", borderRadius: 16, background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)", display: "inline-block", textAlign: "left" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.8px" }}>🏥 Contact Your Clinic</div>
              <div style={{ fontSize: 13, color: C.textPrimary, fontWeight: 600 }}>{clinic.name}</div>
              {clinic.phone && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>📞 {clinic.phone}</div>}
              {clinic.email && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>📧 {clinic.email}</div>}
            </div>
          )}
        </div>
      </Card>
    );
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
      <Card topBarGrad={GRAD.green}>
        <SectionHeader icon="👨‍⚕️" gradient={GRAD.green} title="My Doctor" subtitle="Your assigned physician" />
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: doctor.grad || GRAD.primary, margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 26, fontWeight: 700, boxShadow: "0 12px 32px rgba(0,0,0,0.2)" }}>{doctor.initials}</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: C.textPrimary, marginBottom: 4 }}>{doctor.name}</div>
          <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 8 }}>{doctor.specialty}</div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2 }}>
            {[1, 2, 3, 4, 5].map(s => <span key={s} style={{ fontSize: 16, color: s <= Math.floor(doctor.rating) ? "#f59e0b" : "#e8ecf0" }}>★</span>)}
            <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, marginLeft: 6 }}>{doctor.rating}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Phone", value: doctor.phone || "Contact clinic", icon: "📞" },
            { label: "Email", value: doctor.email || "Contact clinic", icon: "📧" },
            { label: "Status", value: doctor.status, icon: "🔘" },
          ].map(f => (
            <div key={f.label} style={{ padding: "10px 12px", borderRadius: 11, background: "#f8fafc", border: "1px solid #e8ecf0" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 3 }}>{f.icon} {f.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>{f.value}</div>
            </div>
          ))}
        </div>
      </Card>
      {clinic && (
        <Card topBarGrad={GRAD.amber}>
          <SectionHeader icon="🏥" gradient={GRAD.amber} title="My Clinic" subtitle="Where your care happens" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Clinic Name", value: clinic.name, icon: "🏥" },
              { label: "Phone", value: clinic.phone || "—", icon: "📞" },
              { label: "Email", value: clinic.email || "—", icon: "📧" },
              { label: "Address", value: clinic.address || "—", icon: "📍" },
              { label: "Booking Fee", value: `$${clinic.booking_fee ?? 50}`, icon: "💰" },
            ].map(f => (
              <div key={f.label} style={{ padding: "10px 12px", borderRadius: 11, background: "#f8fafc", border: "1px solid #e8ecf0" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 3 }}>{f.icon} {f.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: f.label === "Booking Fee" ? C.greenDark : C.textPrimary }}>{f.value}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// PROFILE TAB
// ─────────────────────────────────────────────
function ProfileTab({ patient, user }: { patient: PatientProfile | null; user: User | null }) {
  if (!patient) return null;
  const initials = patient.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "PT";
  return (
    <Card topBarGrad={GRAD.primary}>
      <SectionHeader icon="👤" gradient={GRAD.primary} title="My Profile" subtitle="Your personal health details" />
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: GRAD.primary, margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 26, fontWeight: 700, boxShadow: "0 12px 32px rgba(91,33,182,0.3)" }}>{initials}</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: C.textPrimary, marginBottom: 4 }}>{patient.name}</div>
        <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 8 }}>Age {patient.age}</div>
        <StatusPill status={patient.status} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
        {[
          { label: "Email", value: patient.email || user?.email || "—", icon: "📧" },
          { label: "Phone", value: patient.phone || "—", icon: "📞" },
          { label: "Condition", value: patient.condition || "—", icon: "📋" },
          { label: "Blood Type", value: patient.blood_type || "—", icon: "🩸" },
          { label: "Last Visit", value: patient.last_visit || "—", icon: "🕐" },
          { label: "Address", value: patient.address || "—", icon: "📍" },
        ].map(f => (
          <div key={f.label} style={{ padding: "12px 14px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e8ecf0" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{f.icon} {f.label}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, wordBreak: "break-word" }}>{f.value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, padding: "14px 16px", borderRadius: 14, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)", fontSize: 12, color: C.textMuted, lineHeight: 1.7 }}>
        <span style={{ fontWeight: 900, color: C.textPrimary }}>Security note:</span> Keep your login private. This portal provides access to sensitive medical information.
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────
// MAIN PATIENT DASHBOARD
// ─────────────────────────────────────────────
export default function PatientDashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // ✅ Added: patient portal records + confirmation (NO DB tables needed)
  const [records, setRecords] = useState<PatientRecords>({ visitNotes: [], labResults: [], prescriptions: [] });
  const [confirmMap, setConfirmMap] = useState<ConfirmMap>({});

  const { toasts, addToast, removeToast } = useToast();

  // ── AUTH CHECK ──────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      try {
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        if (userError || !authUser) { if (mounted) router.replace("/login"); return; }

        let role = getRoleFromAuth(authUser);
        if (!role) {
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", authUser.id).maybeSingle();
          const pr = profile?.role;
          role = pr === "admin" || pr === "doctor" || pr === "patient" ? pr : null;
        }
        if (!mounted) return;
        if (!role) { await supabase.auth.signOut(); router.replace("/login"); return; }
        if (role !== "patient") { router.replace(role === "admin" ? "/dashboard/admin" : "/dashboard/doctor"); return; }

        setUser(authUser);
        setAuthLoading(false);
      } catch (err) {
        console.error("Patient auth error:", err);
        if (mounted) { setAuthError("Authentication failed. Please refresh."); setAuthLoading(false); }
      }
    };
    void checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === "SIGNED_OUT" && mounted) router.replace("/login");
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [router]);

  // ── LOAD DATA ───────────────────────────────────────────────────────────
  const loadData = useCallback(async (uid: string) => {
    setDataLoading(true);
    try {
      const { data: patientData, error: patErr } = await supabase
        .from("patients").select("*").eq("profile_id", uid)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();

      if (patErr) { addToast("Could not load your profile.", "error"); return; }
      if (!patientData) { addToast("Patient profile not found. Contact your clinic admin.", "info"); return; }

      setPatient(patientData as PatientProfile);

      const [clinicResult, apptResult] = await Promise.all([
        supabase.from("clinics").select("*").eq("id", (patientData as PatientProfile).clinic_id ?? "").maybeSingle(),
        supabase.from("appointments").select("*").eq("patient_id", (patientData as PatientProfile).id)
          .order("date", { ascending: true }).order("time", { ascending: true }),
      ]);

      setClinic(clinicResult.data as Clinic ?? null);
      setAppointments(apptResult.data as Appointment[] ?? []);

      const assignedDoctorId = (patientData as PatientProfile).assigned_doctor_id;
      if (assignedDoctorId) {
        const { data: doctorData } = await supabase.from("doctors").select("*").eq("id", assignedDoctorId).maybeSingle();
        setDoctor(doctorData as Doctor ?? null);
      } else {
        setDoctor(null);
      }
    } catch (err) {
      console.error("Patient load error:", err);
      addToast("Failed to load dashboard.", "error");
    } finally {
      setDataLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (!user?.id) return;
    void loadData(user.id);
  }, [user?.id, loadData]);

  const handleLogout = async () => { await supabase.auth.signOut(); router.replace("/login"); };

  const refreshAppointments = useCallback(async () => {
    if (!patient?.id) return;
    const { data } = await supabase.from("appointments").select("*").eq("patient_id", patient.id)
      .order("date", { ascending: true }).order("time", { ascending: true });
    setAppointments(data as Appointment[] ?? []);
  }, [patient?.id]);

  // ✅ Init/load patient records + confirm map (localStorage only)
  useEffect(() => {
    if (!patient?.id) return;

    const recordsKey = `medibook_patient_records_${patient.id}`;
    const confirmKey = `medibook_patient_confirm_${patient.id}`;

    const storedRecords = safeJsonParse<PatientRecords | null>(localStorage.getItem(recordsKey), null);
    const storedConfirm = safeJsonParse<ConfirmMap>(localStorage.getItem(confirmKey), {});

    if (storedRecords) {
      setRecords(storedRecords);
    } else {
      const seeded = seedRecords(patient, doctor);
      localStorage.setItem(recordsKey, JSON.stringify(seeded));
      setRecords(seeded);
    }

    setConfirmMap(storedConfirm);
  }, [patient?.id, doctor?.id]); // safe: doesn't touch auth/routing

  // Persist records on change
  useEffect(() => {
    if (!patient?.id) return;
    localStorage.setItem(`medibook_patient_records_${patient.id}`, JSON.stringify(records));
  }, [records, patient?.id]);

  useEffect(() => {
    if (!patient?.id) return;
    localStorage.setItem(`medibook_patient_confirm_${patient.id}`, JSON.stringify(confirmMap));
  }, [confirmMap, patient?.id]);

  // ── RENDER ──────────────────────────────────────────────────────────────
  if (authLoading) return <PageLoader />;
  if (authError) {
    return (
      <div style={{ minHeight: "100vh", background: C.page, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 48 }}>⚠️</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary }}>{authError}</div>
        <button onClick={() => window.location.reload()} style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: GRAD.primary, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Refresh Page</button>
      </div>
    );
  }
  if (!user) return null;
  if (dataLoading) return <PageLoader />;

  const tabMeta: Record<string, { title: string; subtitle: string }> = {
    overview: { title: `Hello, ${patient?.name || "Patient"}`, subtitle: `${patient?.condition ? `Managing: ${patient.condition}` : "Welcome"} · ${clinic?.name || "Your Clinic"}` },
    book: { title: "Book Appointment", subtitle: `With ${doctor?.name || "your assigned doctor"}` },
    appointments: { title: "My Appointments", subtitle: `${appointments.length} total appointments` },
    reminders: { title: "Reminders", subtitle: "Confirm or reschedule your upcoming visits" }, // ✅ ADDED
    health: { title: "Health Record", subtitle: "Your visit notes, lab results, and prescriptions" }, // ✅ IMPROVED COPY
    doctor: { title: "My Doctor", subtitle: doctor ? `${doctor.name} · ${doctor.specialty}` : "No doctor assigned yet" },
    payments: { title: "Payments", subtitle: "Billing & payment history" },
    profile: { title: "My Profile", subtitle: "Your personal details" },
  };

  const current = tabMeta[activeTab] ?? tabMeta.overview;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f5f3ff; }
        ::-webkit-scrollbar-thumb { background: #c4b5fd; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #a78bfa; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: C.page, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} collapsed={collapsed} setCollapsed={setCollapsed} patient={patient} clinic={clinic} onLogout={handleLogout} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", minWidth: 0 }}>
          <TopBar title={current.title} subtitle={current.subtitle} patient={patient} />

          <div style={{ flex: 1, padding: "24px 28px", minHeight: 0 }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                {activeTab === "overview" && (
                  <OverviewTab
                    patient={patient}
                    appointments={appointments}
                    doctor={doctor}
                    clinic={clinic}
                    setActiveTab={setActiveTab}
                    confirmMap={confirmMap}
                  />
                )}

                {activeTab === "book" && (
                  <BookAppointmentTab
                    patient={patient}
                    doctor={doctor}
                    clinic={clinic}
                    addToast={addToast}
                    onBooked={() => { void refreshAppointments(); setActiveTab("appointments"); }}
                  />
                )}

                {activeTab === "appointments" && (
                  <AppointmentsTab
                    appointments={appointments}
                    setActiveTab={setActiveTab}
                    confirmMap={confirmMap}
                  />
                )}

                {activeTab === "reminders" && (
                  <RemindersTab
                    patient={patient}
                    appointments={appointments}
                    doctor={doctor}
                    clinic={clinic}
                    confirmMap={confirmMap}
                    setConfirmMap={setConfirmMap}
                    addToast={addToast}
                    refreshAppointments={refreshAppointments}
                  />
                )}

                {activeTab === "health" && <HealthTab patient={patient} records={records} doctor={doctor} />}
                {activeTab === "doctor" && <DoctorTab doctor={doctor} clinic={clinic} />}
                {activeTab === "payments" && <PaymentsTab appointments={appointments} />}
                {activeTab === "profile" && <ProfileTab patient={patient} user={user} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}