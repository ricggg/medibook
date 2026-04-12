// FILE: app/dashboard/doctor/page.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

// ─────────────────────────────────────────────
// DESIGN TOKENS — Teal/Healthcare palette
// ─────────────────────────────────────────────
const C = {
  tealDark: "#0f766e",
  teal: "#14b8a6",
  tealLight: "#5eead4",
  green: "#10b981",
  greenDark: "#059669",
  blue: "#2563eb",
  purple: "#7c3aed",
  amber: "#f59e0b",
  red: "#ef4444",
  textPrimary: "#0f1729",
  textMuted: "#64748b",
  textLight: "#9ca3af",
  border: "#e8ecf0",
  page: "#f0fafa",
};

const GRAD = {
  primary: "linear-gradient(135deg, #0f766e, #14b8a6)",
  hero: "linear-gradient(180deg, #083344 0%, #0f766e 50%, #083344 100%)",
  green: "linear-gradient(135deg, #059669, #10b981)",
  blue: "linear-gradient(135deg, #1e3c7d, #2563eb)",
  purple: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
  amber: "linear-gradient(135deg, #f59e0b, #fbbf24)",
  red: "linear-gradient(135deg, #ef4444, #f87171)",
  topBar: "linear-gradient(90deg, #0f766e, #14b8a6, #5eead4)",
};

// ─────────────────────────────────────────────
// ANIMATIONS (kept subtle + consistent)
// ─────────────────────────────────────────────
const ANIM = {
  fadeSlideUp: {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0 },
  },
  cardPop: {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 },
  },
  slideIn: {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  },
};

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface Appointment {
  id: string;
  patient_name: string;
  doctor_name?: string;
  type: string;
  time: string; // e.g. "09:30 AM"
  date: string; // yyyy-mm-dd
  room: string;
  fee: number;
  status: string; // upcoming | in-progress | completed | cancelled
  notes?: string;
  patient_id?: string;
  doctor_id?: string;
}

interface Patient {
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
  medical_notes?: string;
}

interface DoctorProfile {
  id: string;
  profile_id?: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  experience: string;
  status: string;
  rating: number;
  patients: number;
  utilization: number;
  revenue: number;
  initials: string;
  grad: string;
  bio: string;
  clinic_id: string;
}

interface Clinic {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
}

interface Earning {
  id: string;
  amount: number;
  date: string;
  description: string;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

type AppRole = "admin" | "doctor" | "patient";

type ReminderChannel = "sms" | "email";
interface ReminderSettings {
  enabled: boolean;
  channels: ReminderChannel[];
  scheduleHours: number[]; // [48,24,2]
}

interface AuditEvent {
  id: string;
  atISO: string;
  actor: string;
  action: string;
  details: string;
  severity: "info" | "success" | "warning";
}

interface VisitNote {
  id: string;
  atISO: string;
  title: string;
  body: string;
}

interface LabResult {
  id: string;
  atISO: string;
  testName: string;
  summary: string;
  fileUrl?: string;
}

interface PrescriptionItem {
  id: string;
  medication: string;
  dosage: string; // "500mg"
  frequency: string; // "2x daily"
  duration: string; // "7 days"
  notes?: string;
}

type PrescriptionStatus = "draft" | "sent";

interface Prescription {
  id: string;
  createdAtISO: string;
  patientId: string;
  patientName: string;
  diagnosis?: string;
  instructions: string;
  items: PrescriptionItem[];
  status: PrescriptionStatus;
  sentTo: { patient: boolean; pharmacy: boolean };
}

interface PatientClinicalRecord {
  visitNotes: VisitNote[];
  labs: LabResult[];
  prescriptions: Prescription[];
}

type PatientClinicalStore = Record<string, PatientClinicalRecord>;

// ─────────────────────────────────────────────
// ROLE HELPERS
// ─────────────────────────────────────────────
function getRoleFromAuth(user: User | null): AppRole | null {
  const role = user?.app_metadata?.role;
  return role === "admin" || role === "doctor" || role === "patient" ? role : null;
}

function roleToDashboard(role: AppRole): string {
  if (role === "admin") return "/dashboard/admin";
  if (role === "doctor") return "/dashboard/doctor";
  return "/dashboard/patient";
}

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────
function uid(prefix = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function formatPrettyDate(dateISO: string): string {
  return new Date(dateISO).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
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

// Accepts "09:30 AM" / "9:30 AM" / "14:00"
function timeToMinutes(t: string): number {
  const s = t.trim().toUpperCase();
  const hasAmPm = s.includes("AM") || s.includes("PM");
  if (hasAmPm) {
    const [timePart, ampmPart] = s.split(" ");
    const [hhRaw, mmRaw] = timePart.split(":");
    const hh = Number(hhRaw);
    const mm = Number(mmRaw ?? "0");
    const ampm = (ampmPart ?? "").trim();
    const base = (hh % 12) * 60 + mm;
    return ampm === "PM" ? base + 12 * 60 : base;
  }
  const [hhRaw, mmRaw] = s.split(":");
  const hh = Number(hhRaw);
  const mm = Number(mmRaw ?? "0");
  return hh * 60 + mm;
}

function minutesToTime12(mins: number): string {
  const m = ((mins % (24 * 60)) + 24 * 60) % (24 * 60);
  const hh24 = Math.floor(m / 60);
  const mm = m % 60;
  const ampm = hh24 >= 12 ? "PM" : "AM";
  const hh12 = hh24 % 12 === 0 ? 12 : hh24 % 12;
  return `${String(hh12).padStart(2, "0")}:${String(mm).padStart(2, "0")} ${ampm}`;
}

function combineDateTime(dateISO: string, time12: string): Date {
  const mins = timeToMinutes(time12);
  const hh = Math.floor(mins / 60);
  const mm = mins % 60;
  // Construct local date reliably:
  const d = new Date(`${dateISO}T00:00:00`);
  d.setHours(hh, mm, 0, 0);
  return d;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function dateToISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function useIsNarrow(breakpoint = 980): boolean {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const update = () => setNarrow(window.innerWidth < breakpoint);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [breakpoint]);
  return narrow;
}

// ─────────────────────────────────────────────
// TOAST HOOK (stable callbacks)
// ─────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return { toasts, addToast, removeToast };
}

// ─────────────────────────────────────────────
// TOAST CONTAINER
// ─────────────────────────────────────────────
function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 80, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.85 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={() => removeToast(toast.id)}
            style={{
              padding: "14px 20px",
              borderRadius: 16,
              background:
                toast.type === "success"
                  ? GRAD.green
                  : toast.type === "error"
                    ? GRAD.red
                    : GRAD.primary,
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              minWidth: 280,
              cursor: "pointer",
              pointerEvents: "all",
            }}
          >
            <span style={{ fontSize: 18 }}>
              {toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️"}
            </span>
            {toast.message}
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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: C.page,
        flexDirection: "column",
        gap: 24,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div style={{ position: "relative", width: 80, height: 80 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: "4px solid #e8ecf0",
            borderTop: `4px solid ${C.teal}`,
            position: "absolute",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 10,
            borderRadius: "50%",
            background: GRAD.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
          }}
        >
          👨‍⚕️
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: C.textPrimary, marginBottom: 6 }}>
          MediBook
        </div>
        <div style={{ fontSize: 14, color: C.textMuted }}>Loading your dashboard...</div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
            style={{ width: 8, height: 8, borderRadius: "50%", background: C.teal }}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STATUS PILL
// ─────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const map: Record<
    string,
    {
      bg: string;
      color: string;
      dot: string;
      label: string;
    }
  > = {
    completed: {
      bg: "rgba(34,197,94,0.1)",
      color: "#16a34a",
      dot: "#22c55e",
      label: "Completed",
    },
    "in-progress": {
      bg: "rgba(16,185,129,0.12)",
      color: "#059669",
      dot: "#10b981",
      label: "In Progress",
    },
    upcoming: {
      bg: "rgba(20,184,166,0.1)",
      color: "#0f766e",
      dot: "#14b8a6",
      label: "Upcoming",
    },
    cancelled: {
      bg: "rgba(239,68,68,0.1)",
      color: "#dc2626",
      dot: "#ef4444",
      label: "Cancelled",
    },
    active: {
      bg: "rgba(16,185,129,0.1)",
      color: "#059669",
      dot: "#10b981",
      label: "Active",
    },
    "in-treatment": {
      bg: "rgba(124,58,237,0.1)",
      color: "#7c3aed",
      dot: "#8b5cf6",
      label: "In Treatment",
    },
    monitoring: {
      bg: "rgba(8,145,178,0.1)",
      color: "#0891b2",
      dot: "#06b6d4",
      label: "Monitoring",
    },
    inactive: {
      bg: "rgba(100,116,139,0.1)",
      color: "#64748b",
      dot: "#94a3b8",
      label: "Inactive",
    },
    "no-show": {
      bg: "rgba(245,158,11,0.10)",
      color: "#b45309",
      dot: "#f59e0b",
      label: "No-Show",
    },
  };

  const s = map[status] ?? {
    bg: "rgba(20,184,166,0.1)",
    color: C.teal,
    dot: C.teal,
    label: status,
  };

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 50,
        background: s.bg,
        border: `1px solid ${s.dot}40`,
      }}
    >
      <motion.span
        animate={{ opacity: [1, 0.7, 1], scale: [1, 1.08, 1] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: s.dot,
          display: "inline-block",
        }}
      />
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: s.color,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {s.label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// BUTTONS
// ─────────────────────────────────────────────
function PrimaryButton({
  children,
  onClick,
  disabled,
  style,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "rgba(156,163,175,0.4)" : GRAD.primary,
        color: "#fff",
        borderRadius: 14,
        padding: "12px 16px",
        fontWeight: 800,
        fontSize: 14,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : "0 4px 20px rgba(20,184,166,0.35)",
        transition: "all 0.2s ease",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {children}
    </button>
  );
}

function OutlineButton({
  children,
  onClick,
  style,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent",
        color: C.tealDark,
        borderRadius: 14,
        padding: "12px 16px",
        fontWeight: 800,
        fontSize: 14,
        border: `2px solid ${C.teal}`,
        cursor: "pointer",
        transition: "all 0.2s ease",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────
// INPUT
// ─────────────────────────────────────────────
function TextInput({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  style,
}: {
  label: string;
  icon?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "date" | "url";
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, ...style }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, display: "flex", gap: 6, alignItems: "center" }}>
        {icon ? <span style={{ fontSize: 14 }}>{icon}</span> : null}
        {label}
      </div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "13px 16px",
          borderRadius: 10,
          border: `2px solid ${C.border}`,
          fontSize: 14,
          background: "#fff",
          color: C.textPrimary,
          outline: "none",
          transition: "all 0.25s ease",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = C.teal;
          e.currentTarget.style.boxShadow = "0 0 0 4px rgba(20,184,166,0.08)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = C.border;
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────
function Modal({
  open,
  title,
  subtitle,
  icon,
  children,
  onClose,
  width = 620,
}: {
  open: boolean;
  title: string;
  subtitle: string;
  icon: string;
  children: React.ReactNode;
  onClose: () => void;
  width?: number;
}) {
  return (
    <AnimatePresence>
      {open ? (
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
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25 }}
            style={{
              width: "100%",
              maxWidth: width,
              maxHeight: "90vh",
              overflow: "auto",
              background: "#fff",
              borderRadius: 24,
              padding: 30,
              boxShadow: "0 25px 80px rgba(0,0,0,0.3)",
              position: "relative",
              border: `1px solid ${C.border}`,
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                width: 36,
                height: 36,
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                background: "#f8fafc",
                cursor: "pointer",
                fontWeight: 900,
              }}
            >
              ✕
            </button>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingBottom: 14, marginBottom: 18, borderBottom: `2px solid ${C.border}` }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: GRAD.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  boxShadow: "0 4px 12px rgba(20,184,166,0.3)",
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: C.textPrimary }}>{title}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{subtitle}</div>
              </div>
            </div>

            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────
function Card({
  children,
  style = {},
  topBarGrad = GRAD.topBar,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  topBarGrad?: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: "26px",
        border: `1px solid ${C.border}`,
        boxShadow: "0 6px 30px rgba(0,0,0,0.06)",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: topBarGrad,
          borderRadius: "20px 20px 0 0",
        }}
      />
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────
function SectionHeader({
  icon,
  gradient,
  title,
  subtitle,
  action,
}: {
  icon: string;
  gradient: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 16,
        marginBottom: 20,
        borderBottom: `2px solid ${C.border}`,
        flexWrap: "wrap",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            background: gradient,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 17,
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.tealDark }}>{title}</div>
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
function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  doctor,
  clinic,
  onLogout,
}: {
  activeTab: string;
  setActiveTab: (t: string) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  doctor: DoctorProfile | null;
  clinic: Clinic | null;
  onLogout: () => void;
}) {
  const navItems: Array<{ id: string; icon: string; label: string; badge?: string }> = [
    { id: "overview", icon: "📊", label: "Overview" },
    { id: "calendar", icon: "🗓️", label: "Calendar" },
    { id: "appointments", icon: "📅", label: "Appointments" },
    { id: "patients", icon: "👥", label: "My Patients" },
    { id: "prescriptions", icon: "💊", label: "Prescriptions", badge: "NEW" },
    { id: "reminders", icon: "🔔", label: "Reminders" },
    { id: "analytics", icon: "📈", label: "Analytics" },
    { id: "earnings", icon: "💰", label: "Earnings" },
    { id: "profile", icon: "👨‍⚕️", label: "My Profile" },
    { id: "security", icon: "🔒", label: "Security" },
  ];

  const initials =
    doctor?.initials || doctor?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "DR";

  return (
    <motion.div
      animate={{ width: collapsed ? 68 : 260 }}
      transition={{ duration: 0.3 }}
      style={{
        minHeight: "100vh",
        background: GRAD.hero,
        display: "flex",
        flexDirection: "column",
        padding: collapsed ? "24px 10px" : "24px 14px",
        flexShrink: 0,
        overflow: "hidden",
        boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
          paddingBottom: 16,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: GRAD.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(20,184,166,0.4)",
          }}
        >
          🏥
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
              MediBook
            </div>
            <div
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.4)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1.2px",
                marginTop: 2,
              }}
            >
              {clinic?.name || "Doctor Portal"}
            </div>
          </div>
        )}
      </div>

      {/* Doctor card */}
      {!collapsed && doctor && (
        <div
          style={{
            padding: "12px 14px",
            marginBottom: 18,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: doctor.grad || GRAD.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {doctor.name}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                🟢 {doctor.specialty}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <div style={{ flex: 1 }}>
        {!collapsed && (
          <div
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: "rgba(255,255,255,0.28)",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              marginBottom: 8,
              paddingLeft: 10,
            }}
          >
            📌 Navigation
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map((item, idx) => {
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                variants={ANIM.slideIn}
                initial="hidden"
                animate="show"
                transition={{ delay: idx * 0.04 }}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: collapsed ? 0 : 10,
                  justifyContent: collapsed ? "center" : "flex-start",
                  padding: collapsed ? "11px" : "10px 12px",
                  borderRadius: 11,
                  border: "none",
                  cursor: "pointer",
                  background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                  borderLeft: isActive && !collapsed ? `3px solid ${C.tealLight}` : "3px solid transparent",
                  transition: "all 0.2s ease",
                  width: "100%",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && (
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? "#fff" : "rgba(255,255,255,0.72)",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {item.label}
                    {item.badge ? (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 900,
                          color: "#083344",
                          background: "rgba(94,234,212,0.95)",
                          padding: "2px 7px",
                          borderRadius: 999,
                          letterSpacing: "0.6px",
                        }}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bottom */}
      <div
        style={{
          marginTop: "auto",
          paddingTop: 14,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "11px" : "10px 12px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: "transparent",
            color: "rgba(255,255,255,0.55)",
            fontSize: 13,
            fontWeight: 600,
            width: "100%",
          }}
        >
          <span style={{ fontSize: 16 }}>{collapsed ? "→" : "←"}</span>
          {!collapsed && <span>Collapse</span>}
        </button>

        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "11px" : "10px 12px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: "transparent",
            color: "rgba(255,255,255,0.55)",
            fontSize: 13,
            fontWeight: 600,
            width: "100%",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.15)";
            e.currentTarget.style.color = "#f87171";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.55)";
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
  title,
  subtitle,
  doctor,
}: {
  title: string;
  subtitle: string;
  doctor: DoctorProfile | null;
}) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      style={{
        background: "#fff",
        borderBottom: `1px solid ${C.border}`,
        padding: "14px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        gap: 14,
        flexWrap: "wrap",
      }}
    >
      <div>
        <h1 style={{ fontSize: 19, fontWeight: 900, color: C.textPrimary, letterSpacing: "-0.5px" }}>
          {title}
        </h1>
        <p style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{subtitle}</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 50,
            background: "rgba(20,184,166,0.08)",
            border: "1px solid rgba(20,184,166,0.2)",
          }}
        >
          <span style={{ fontSize: 13 }}>📅</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: C.tealDark }}>{today}</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 50,
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.2)",
          }}
        >
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block" }}
          />
          <span style={{ fontSize: 11, fontWeight: 800, color: "#059669" }}>On Duty</span>
        </div>

        {doctor && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 12px 5px 5px",
              borderRadius: 50,
              background: "#f0fafa",
              border: `1px solid ${C.border}`,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: doctor.grad || GRAD.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              {doctor.initials}
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, color: C.textPrimary }}>{doctor.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// OVERVIEW TAB (mostly your existing UI)
// ─────────────────────────────────────────────
function OverviewTab({
  appointments,
  patients,
  doctor,
  setActiveTab,
}: {
  appointments: Appointment[];
  patients: Patient[];
  doctor: DoctorProfile | null;
  setActiveTab: (t: string) => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const todayAppts = appointments.filter((a) => a.date === today);
  const upcoming = appointments.filter((a) => a.status === "upcoming" && a.date >= today);
  const completed = appointments.filter((a) => a.status === "completed");

  const todayEarnings = appointments
    .filter((a) => a.date === today && a.status === "completed")
    .reduce((s, a) => s + a.fee, 0);

  const totalEarnings = completed.reduce((s, a) => s + a.fee, 0);

  const nextAppt = [...upcoming].sort(
    (a, b) => combineDateTime(a.date, a.time).getTime() - combineDateTime(b.date, b.time).getTime()
  )[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <motion.div
        variants={ANIM.fadeSlideUp}
        initial="hidden"
        animate="show"
        style={{
          background: GRAD.hero,
          borderRadius: 20,
          padding: "28px 32px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(15,118,110,0.25)",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -20,
            top: -20,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 40,
            bottom: -40,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 700, marginBottom: 6 }}>
              Good{" "}
              {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", marginBottom: 8 }}>
              {doctor?.name || "Doctor"} 👋
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}>
              {doctor?.specialty || "Clinical Practice"} · {todayAppts.length} appointments today
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { label: "Today's Appts", value: todayAppts.length, icon: "📅" },
              { label: "Upcoming", value: upcoming.length, icon: "⏰" },
              { label: "Today's Earn", value: `$${todayEarnings}`, icon: "💰" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  padding: "14px 20px",
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  textAlign: "center",
                  minWidth: 110,
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{s.value}</div>
                <div
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.5)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginTop: 2,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
        {[
          { label: "Total Appointments", value: String(appointments.length), sub: `${completed.length} completed`, icon: "📅", grad: GRAD.primary },
          { label: "My Patients", value: String(patients.length), sub: "Assigned to you", icon: "👥", grad: GRAD.green },
          { label: "Total Earnings", value: `$${totalEarnings.toLocaleString()}`, sub: "From completed appointments", icon: "💰", grad: GRAD.amber },
          { label: "My Rating", value: doctor?.rating?.toFixed(1) || "5.0", sub: "Patient satisfaction", icon: "⭐", grad: GRAD.purple },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            variants={ANIM.cardPop}
            initial="hidden"
            animate="show"
            transition={{ delay: i * 0.06 }}
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "22px",
              border: `1px solid ${C.border}`,
              boxShadow: "0 6px 30px rgba(0,0,0,0.06)",
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 14px 40px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 30px rgba(0,0,0,0.06)";
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: s.grad, borderRadius: "20px 20px 0 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: C.textLight,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: 10,
                  }}
                >
                  {s.label}
                </div>
                <div style={{ fontSize: 34, fontWeight: 900, color: C.textPrimary, lineHeight: 1, letterSpacing: "-1px" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: C.greenDark, fontWeight: 700, marginTop: 8 }}>{s.sub}</div>
              </div>
              <div
                style={{
                  width: 46,
                  height: 46,
                  background: s.grad,
                  borderRadius: 13,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 21,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                }}
              >
                {s.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
        <Card topBarGrad={GRAD.primary}>
          <SectionHeader icon="⏰" gradient={GRAD.primary} title="Next Appointment" subtitle="Coming up" action={
            <button
              onClick={() => setActiveTab("calendar")}
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                border: `1px solid rgba(20,184,166,0.25)`,
                background: "rgba(20,184,166,0.07)",
                color: C.tealDark,
                fontWeight: 800,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Open Calendar →
            </button>
          } />
          {nextAppt ? (
            <motion.div
              variants={ANIM.cardPop}
              initial="hidden"
              animate="show"
              style={{
                padding: "20px",
                borderRadius: 16,
                background: "linear-gradient(135deg, rgba(15,118,110,0.06), rgba(20,184,166,0.06))",
                border: "1px solid rgba(20,184,166,0.2)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: C.tealDark, letterSpacing: "-0.5px" }}>
                    {nextAppt.time}
                  </div>
                  <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>
                    {new Date(nextAppt.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </div>
                </div>
                <StatusPill status={nextAppt.status} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "Patient", value: nextAppt.patient_name, icon: "👤" },
                  { label: "Type", value: nextAppt.type, icon: "📋" },
                  { label: "Room", value: nextAppt.room, icon: "🚪" },
                  { label: "Fee", value: `$${nextAppt.fee}`, icon: "💰" },
                ].map((f) => (
                  <div key={f.label} style={{ padding: "10px 12px", borderRadius: 10, background: "#fff", border: `1px solid ${C.border}` }}>
                    <div
                      style={{
                        fontSize: 10,
                        color: C.textLight,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        marginBottom: 3,
                      }}
                    >
                      {f.icon} {f.label}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.textPrimary }}>{f.value}</div>
                  </div>
                ))}
              </div>
              {nextAppt.notes && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "rgba(245,158,11,0.06)",
                    border: "1px solid rgba(245,158,11,0.2)",
                    fontSize: 12,
                    color: C.textMuted,
                  }}
                >
                  📝 {nextAppt.notes}
                </div>
              )}
            </motion.div>
          ) : (
            <div style={{ textAlign: "center", padding: "32px", color: C.textMuted }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>No upcoming appointments</div>
            </div>
          )}
        </Card>

        <Card topBarGrad={GRAD.green}>
          <SectionHeader
            icon="📅"
            gradient={GRAD.green}
            title="Today's Schedule"
            subtitle={`${todayAppts.length} appointments`}
            action={
              <button
                onClick={() => setActiveTab("appointments")}
                style={{
                  padding: "8px 12px",
                  borderRadius: 12,
                  border: "none",
                  background: "rgba(5,150,105,0.1)",
                  color: C.greenDark,
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                View All →
              </button>
            }
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {todayAppts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px", color: C.textMuted }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🌟</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>No appointments today</div>
              </div>
            ) : (
              todayAppts.slice(0, 5).map((apt, i) => (
                <motion.div
                  key={apt.id}
                  variants={ANIM.slideIn}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "11px 13px",
                    borderRadius: 12,
                    background: apt.status === "in-progress" ? "rgba(16,185,129,0.06)" : "#f8fafc",
                    border:
                      apt.status === "in-progress"
                        ? "1px solid rgba(16,185,129,0.2)"
                        : `1px solid ${C.border}`,
                  }}
                >
                  <div
                    style={{
                      minWidth: 52,
                      textAlign: "center",
                      padding: "5px",
                      background: "#fff",
                      borderRadius: 8,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 900, color: C.textPrimary, lineHeight: 1 }}>
                      {apt.time.split(" ")[0]}
                    </div>
                    <div style={{ fontSize: 9, color: C.textLight, marginTop: 1 }}>{apt.time.split(" ")[1]}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: C.textPrimary,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {apt.patient_name}
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>{apt.type}</div>
                  </div>
                  <StatusPill status={apt.status} />
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// APPOINTMENTS TAB (adds reschedule modal + audit hook)
// ─────────────────────────────────────────────
function AppointmentsTab({
  appointments,
  setAppointments,
  addToast,
  onLog,
}: {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  addToast: (msg: string, type?: Toast["type"]) => void;
  onLog: (evt: Omit<AuditEvent, "id" | "atISO">) => void;
}) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleApptId, setRescheduleApptId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTimeMins, setNewTimeMins] = useState(9 * 60);

  const today = new Date().toISOString().split("T")[0];

  const filtered = appointments.filter((a) => {
    const matchFilter = filter === "all" || a.status === filter;
    const matchSearch =
      !search ||
      a.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      a.type.toLowerCase().includes(search.toLowerCase());
    const matchDate = !dateFilter || a.date === dateFilter;
    return matchFilter && matchSearch && matchDate;
  });

  const grouped = filtered.reduce((acc, apt) => {
    const key = apt.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  const sortedDates = Object.keys(grouped).sort();

  const conflictExists = useCallback(
    (excludeId: string, dateISO: string, time12: string): boolean => {
      return appointments.some(
        (a) =>
          a.id !== excludeId &&
          a.status !== "cancelled" &&
          a.date === dateISO &&
          timeToMinutes(a.time) === timeToMinutes(time12)
      );
    },
    [appointments]
  );

  const handleStatusUpdate = async (id: string, status: string) => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) {
      addToast("Failed to update status.", "error");
      return;
    }
    const appt = appointments.find((a) => a.id === id);
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    addToast("Status updated!", "success");
    onLog({
      actor: "Doctor",
      action: "Appointment status updated",
      details: `${appt?.patient_name ?? "Patient"} → ${status}`,
      severity: "success",
    });
  };

  const openReschedule = (appt: Appointment) => {
    setRescheduleApptId(appt.id);
    setNewDate(appt.date);
    setNewTimeMins(timeToMinutes(appt.time));
    setRescheduleOpen(true);
  };

  const commitReschedule = async () => {
    if (!rescheduleApptId) return;
    const appt = appointments.find((a) => a.id === rescheduleApptId);
    if (!appt) return;

    const time12 = minutesToTime12(newTimeMins);

    if (conflictExists(appt.id, newDate, time12)) {
      addToast("Conflict detected: another appointment already exists at that time.", "error");
      return;
    }

    const { error } = await supabase
      .from("appointments")
      .update({ date: newDate, time: time12 })
      .eq("id", appt.id);

    if (error) {
      addToast("Could not reschedule. Please try again.", "error");
      return;
    }

    setAppointments((prev) => prev.map((a) => (a.id === appt.id ? { ...a, date: newDate, time: time12 } : a)));
    addToast("Appointment rescheduled.", "success");
    onLog({
      actor: "Doctor",
      action: "Appointment rescheduled",
      details: `${appt.patient_name} → ${newDate} at ${time12}`,
      severity: "warning",
    });
    setRescheduleOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <SectionHeader
          icon="📅"
          gradient={GRAD.primary}
          title="My Appointments"
          subtitle={`${appointments.length} total appointments`}
          action={
            <button
              onClick={() => addToast("Tip: Use Calendar for drag-and-drop rescheduling.", "info")}
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                border: "none",
                background: "rgba(20,184,166,0.10)",
                color: C.tealDark,
                fontWeight: 800,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              🗓️ Calendar Tips
            </button>
          }
        />

        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>
              🔍
            </span>
            <input
              placeholder="Search patient or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px 12px 36px",
                borderRadius: 11,
                border: `2px solid ${C.border}`,
                fontSize: 13,
                color: C.textPrimary,
                background: "#f8fafc",
                outline: "none",
                boxSizing: "border-box",
                transition: "all 0.2s",
              }}
              onFocus={(e) => (e.currentTarget.style.border = `2px solid ${C.teal}`)}
              onBlur={(e) => (e.currentTarget.style.border = `2px solid ${C.border}`)}
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              padding: "12px 14px",
              borderRadius: 11,
              border: `2px solid ${C.border}`,
              fontSize: 13,
              color: C.textPrimary,
              background: "#f8fafc",
              outline: "none",
              cursor: "pointer",
            }}
            onFocus={(e) => (e.currentTarget.style.border = `2px solid ${C.teal}`)}
            onBlur={(e) => (e.currentTarget.style.border = `2px solid ${C.border}`)}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["all", "upcoming", "in-progress", "completed", "cancelled"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "9px 13px",
                  borderRadius: 50,
                  border: "none",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                  background: filter === f ? GRAD.primary : "#f0f4f8",
                  color: filter === f ? "#fff" : C.textMuted,
                  transition: "all 0.2s",
                  textTransform: "capitalize",
                }}
              >
                {f === "all" ? "All" : f.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total", value: appointments.length, color: C.teal },
            { label: "Upcoming", value: appointments.filter((a) => a.status === "upcoming").length, color: C.teal },
            { label: "Completed", value: appointments.filter((a) => a.status === "completed").length, color: C.green },
            { label: "Cancelled", value: appointments.filter((a) => a.status === "cancelled").length, color: C.red },
          ].map((s) => (
            <div key={s.label} style={{ padding: "10px", borderRadius: 11, background: "#f8fafc", border: `1px solid ${C.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: C.textLight, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {sortedDates.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: C.textMuted }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>No appointments found</div>
          </div>
        ) : (
          sortedDates.map((date) => (
            <div key={date} style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div
                  style={{
                    padding: "6px 14px",
                    borderRadius: 50,
                    background: date === today ? GRAD.primary : "#f0f4f8",
                    fontSize: 12,
                    fontWeight: 800,
                    color: date === today ? "#fff" : C.textMuted,
                  }}
                >
                  {date === today
                    ? "📅 Today"
                    : new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </div>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ fontSize: 11, color: C.textLight, fontWeight: 700 }}>{grouped[date].length} appointments</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {grouped[date].map((apt, i) => (
                  <motion.div
                    key={apt.id}
                    variants={ANIM.fadeSlideUp}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: i * 0.04 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 16px",
                      borderRadius: 14,
                      background: apt.status === "in-progress" ? "rgba(16,185,129,0.05)" : "#f8fafc",
                      border: apt.status === "in-progress" ? "1px solid rgba(16,185,129,0.2)" : `1px solid ${C.border}`,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ minWidth: 60, textAlign: "center", padding: "8px", background: "#fff", borderRadius: 10, border: `1px solid ${C.border}`, flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: C.textPrimary, lineHeight: 1 }}>{apt.time.split(" ")[0]}</div>
                      <div style={{ fontSize: 9, color: C.textLight, marginTop: 1 }}>{apt.time.split(" ")[1]}</div>
                    </div>

                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: GRAD.primary, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 900 }}>
                      {apt.patient_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>

                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: C.textPrimary, marginBottom: 3 }}>{apt.patient_name}</div>
                      <div style={{ display: "flex", gap: 10, fontSize: 11, color: C.textMuted, flexWrap: "wrap" }}>
                        <span>📋 {apt.type}</span>
                        <span>🚪 Room {apt.room}</span>
                        <span>💰 ${apt.fee}</span>
                      </div>
                      {apt.notes && (
                        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, fontStyle: "italic" }}>
                          📝 {apt.notes}
                        </div>
                      )}
                    </div>

                    <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                      <StatusPill status={apt.status} />

                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {(apt.status === "upcoming" || apt.status === "in-progress") && (
                          <button
                            onClick={() => openReschedule(apt)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 10,
                              border: `1px solid rgba(20,184,166,0.25)`,
                              background: "rgba(20,184,166,0.08)",
                              color: C.tealDark,
                              fontSize: 11,
                              fontWeight: 900,
                              cursor: "pointer",
                            }}
                          >
                            🗓️ Reschedule
                          </button>
                        )}

                        {apt.status === "upcoming" && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(apt.id, "in-progress")}
                              style={{ padding: "6px 10px", borderRadius: 10, border: "none", background: GRAD.primary, color: "#fff", fontSize: 11, fontWeight: 900, cursor: "pointer" }}
                            >
                              Start
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(apt.id, "cancelled")}
                              style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)", color: C.red, fontSize: 11, fontWeight: 900, cursor: "pointer" }}
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {apt.status === "in-progress" && (
                          <button
                            onClick={() => handleStatusUpdate(apt.id, "completed")}
                            style={{ padding: "6px 10px", borderRadius: 10, border: "none", background: GRAD.green, color: "#fff", fontSize: 11, fontWeight: 900, cursor: "pointer" }}
                          >
                            ✅ Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </Card>

      <Modal
        open={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        title="Reschedule Appointment"
        subtitle="Conflict detection prevents double-booking."
        icon="🗓️"
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <TextInput label="New Date" icon="📅" type="date" value={newDate} onChange={setNewDate} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, display: "flex", gap: 6, alignItems: "center" }}>
              ⏰ New Time
            </div>
            <input
              type="range"
              min={8 * 60}
              max={18 * 60}
              step={15}
              value={newTimeMins}
              onChange={(e) => setNewTimeMins(Number(e.target.value))}
            />
            <div style={{ fontSize: 14, fontWeight: 900, color: C.tealDark }}>
              {minutesToTime12(newTimeMins)}
              <span style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, marginLeft: 8 }}>
                (15-min increments)
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <OutlineButton onClick={() => setRescheduleOpen(false)}>Cancel</OutlineButton>
          <PrimaryButton onClick={commitReschedule}>Save Changes</PrimaryButton>
        </div>

        <div style={{ marginTop: 14, fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
          <span style={{ fontWeight: 800, color: C.textPrimary }}>Conflict detection:</span> If another active appointment exists at the same date/time, MediBook will block the change.
        </div>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────
// PATIENTS TAB (adds Visit Notes + Labs + Prescription quick create)
// ─────────────────────────────────────────────
function PatientsTab({
  patients,
  appointments,
  clinicalStore,
  setClinicalStore,
  addToast,
  onLog,
}: {
  patients: Patient[];
  appointments: Appointment[];
  clinicalStore: PatientClinicalStore;
  setClinicalStore: React.Dispatch<React.SetStateAction<PatientClinicalStore>>;
  addToast: (msg: string, type?: Toast["type"]) => void;
  onLog: (evt: Omit<AuditEvent, "id" | "atISO">) => void;
}) {
  const isNarrow = useIsNarrow(1100);

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  // Modals
  const [noteOpen, setNoteOpen] = useState(false);
  const [labOpen, setLabOpen] = useState(false);
  const [rxOpen, setRxOpen] = useState(false);

  const [noteTitle, setNoteTitle] = useState("Follow-up Note");
  const [noteBody, setNoteBody] = useState("");

  const [labTest, setLabTest] = useState("Complete Blood Count (CBC)");
  const [labSummary, setLabSummary] = useState("");
  const [labUrl, setLabUrl] = useState("");

  const [rxDiagnosis, setRxDiagnosis] = useState("");
  const [rxInstructions, setRxInstructions] = useState("Take medications as prescribed. Return if symptoms worsen.");
  const [rxItems, setRxItems] = useState<Array<Omit<PrescriptionItem, "id">>>([
    { medication: "Amoxicillin", dosage: "500mg", frequency: "3× daily", duration: "7 days", notes: "Take after meals." },
  ]);

  const filtered = patients.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.condition.toLowerCase().includes(search.toLowerCase())
  );

  const selectedPatient = patients.find((p) => p.id === selected) || null;

  const patientAppts = selectedPatient
    ? appointments.filter((a) => a.patient_id === selectedPatient.id || a.patient_name === selectedPatient.name)
    : [];

  const record: PatientClinicalRecord = useMemo(() => {
    if (!selectedPatient) return { visitNotes: [], labs: [], prescriptions: [] };
    return clinicalStore[selectedPatient.id] ?? { visitNotes: [], labs: [], prescriptions: [] };
  }, [clinicalStore, selectedPatient]);

  const updateRecord = useCallback(
    (patientId: string, updater: (prev: PatientClinicalRecord) => PatientClinicalRecord) => {
      setClinicalStore((prev) => {
        const current = prev[patientId] ?? { visitNotes: [], labs: [], prescriptions: [] };
        return { ...prev, [patientId]: updater(current) };
      });
    },
    [setClinicalStore]
  );

  const openAddNote = () => {
    if (!selectedPatient) return;
    setNoteTitle("Follow-up Note");
    setNoteBody("");
    setNoteOpen(true);
  };

  const saveNote = () => {
    if (!selectedPatient) return;
    if (!noteBody.trim()) {
      addToast("Please enter clinical note details.", "error");
      return;
    }
    updateRecord(selectedPatient.id, (prev) => ({
      ...prev,
      visitNotes: [{ id: uid("note"), atISO: new Date().toISOString(), title: noteTitle.trim(), body: noteBody.trim() }, ...prev.visitNotes],
    }));
    addToast("Visit note saved.", "success");
    onLog({
      actor: "Doctor",
      action: "Visit note created",
      details: `${selectedPatient.name} • ${noteTitle.trim()}`,
      severity: "info",
    });
    setNoteOpen(false);
  };

  const openAddLab = () => {
    if (!selectedPatient) return;
    setLabTest("Complete Blood Count (CBC)");
    setLabSummary("");
    setLabUrl("");
    setLabOpen(true);
  };

  const saveLab = () => {
    if (!selectedPatient) return;
    if (!labTest.trim() || !labSummary.trim()) {
      addToast("Please provide test name and a short summary.", "error");
      return;
    }
    updateRecord(selectedPatient.id, (prev) => ({
      ...prev,
      labs: [{ id: uid("lab"), atISO: new Date().toISOString(), testName: labTest.trim(), summary: labSummary.trim(), fileUrl: labUrl.trim() || undefined }, ...prev.labs],
    }));
    addToast("Lab result added.", "success");
    onLog({
      actor: "Doctor",
      action: "Lab result added",
      details: `${selectedPatient.name} • ${labTest.trim()}`,
      severity: "info",
    });
    setLabOpen(false);
  };

  const openCreateRx = () => {
    if (!selectedPatient) return;
    setRxDiagnosis("");
    setRxInstructions("Take medications as prescribed. Return if symptoms worsen.");
    setRxItems([{ medication: "Amoxicillin", dosage: "500mg", frequency: "3× daily", duration: "7 days", notes: "Take after meals." }]);
    setRxOpen(true);
  };

  const addRxItem = () => {
    setRxItems((prev) => [...prev, { medication: "", dosage: "", frequency: "", duration: "", notes: "" }]);
  };

  const updateRxItem = (idx: number, key: keyof Omit<PrescriptionItem, "id">, value: string) => {
    setRxItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));
  };

  const removeRxItem = (idx: number) => {
    setRxItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const saveRx = () => {
    if (!selectedPatient) return;
    const cleaned = rxItems
      .map((it) => ({
        medication: it.medication.trim(),
        dosage: it.dosage.trim(),
        frequency: it.frequency.trim(),
        duration: it.duration.trim(),
        notes: it.notes?.trim() || undefined,
      }))
      .filter((it) => it.medication && it.dosage && it.frequency && it.duration);

    if (cleaned.length === 0) {
      addToast("Add at least one complete medication line (name, dosage, frequency, duration).", "error");
      return;
    }

    const prescription: Prescription = {
      id: uid("rx"),
      createdAtISO: new Date().toISOString(),
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      diagnosis: rxDiagnosis.trim() || undefined,
      instructions: rxInstructions.trim() || "Follow doctor instructions.",
      items: cleaned.map((it) => ({ id: uid("rx_item"), ...it })),
      status: "draft",
      sentTo: { patient: false, pharmacy: false },
    };

    updateRecord(selectedPatient.id, (prev) => ({ ...prev, prescriptions: [prescription, ...prev.prescriptions] }));
    addToast("Prescription saved as draft.", "success");
    onLog({
      actor: "Doctor",
      action: "Prescription created (draft)",
      details: `${selectedPatient.name} • ${cleaned.length} medication(s)`,
      severity: "warning",
    });
    setRxOpen(false);
  };

  const sendPrescription = (rxId: string, to: "patient" | "pharmacy") => {
    if (!selectedPatient) return;
    updateRecord(selectedPatient.id, (prev) => {
      const next = prev.prescriptions.map((rx) => {
        if (rx.id !== rxId) return rx;
        const sentTo = { ...rx.sentTo, [to]: true };
        const status: PrescriptionStatus = sentTo.patient && sentTo.pharmacy ? "sent" : rx.status;
        return { ...rx, sentTo, status };
      });
      return { ...prev, prescriptions: next };
    });
    addToast(`Prescription sent to ${to === "patient" ? "patient portal" : "connected pharmacy"} (simulated).`, "success");
    onLog({
      actor: "Doctor",
      action: "Prescription sent",
      details: `${selectedPatient.name} • Sent to ${to}`,
      severity: "success",
    });
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast("Copied to clipboard.", "success");
    } catch {
      addToast("Could not copy. Please copy manually.", "error");
    }
  };

  const DetailsPanel = selectedPatient ? (
    <motion.div variants={ANIM.fadeSlideUp} initial="hidden" animate="show" exit="hidden" transition={{ duration: 0.22 }}>
      <Card topBarGrad={GRAD.green} style={{ position: isNarrow ? "relative" : "sticky", top: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: C.tealDark }}>Patient Record</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>
              Medical history, labs, notes & prescriptions in one place.
            </div>
          </div>
          <button
            onClick={() => setSelected(null)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: "#f8fafc",
              cursor: "pointer",
              fontSize: 14,
              color: C.textMuted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div
            style={{
              width: 62,
              height: 62,
              borderRadius: "50%",
              background: GRAD.primary,
              margin: "0 auto 10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 20,
              fontWeight: 900,
              boxShadow: "0 8px 24px rgba(15,118,110,0.3)",
            }}
          >
            {selectedPatient.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: C.textPrimary }}>{selectedPatient.name}</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>
            Age {selectedPatient.age} · {selectedPatient.phone}
          </div>
          <div style={{ marginTop: 8 }}>
            <StatusPill status={selectedPatient.status} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            <button
              onClick={() => copyText(selectedPatient.phone)}
              style={{
                padding: "7px 10px",
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                background: "#f8fafc",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 900,
                color: C.textPrimary,
              }}
            >
              📞 Copy Phone
            </button>
            <button
              onClick={() => copyText(selectedPatient.email)}
              style={{
                padding: "7px 10px",
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                background: "#f8fafc",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 900,
                color: C.textPrimary,
              }}
            >
              📧 Copy Email
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {[
            { label: "Condition", value: selectedPatient.condition, icon: "📋" },
            { label: "Blood Type", value: selectedPatient.blood_type || "—", icon: "🩸" },
            { label: "Last Visit", value: selectedPatient.last_visit, icon: "🕐" },
            { label: "Visits", value: `${selectedPatient.visits} total`, icon: "📊" },
          ].map((f) => (
            <div key={f.label} style={{ padding: "10px 12px", borderRadius: 11, background: "#f8fafc", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: C.textLight, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 3 }}>
                {f.icon} {f.label}
              </div>
              <div style={{ fontSize: 13, fontWeight: 900, color: C.textPrimary, wordBreak: "break-word" }}>{f.value}</div>
            </div>
          ))}
        </div>

        {selectedPatient.medical_notes ? (
          <div style={{ padding: "12px", borderRadius: 12, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: "#b45309", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>
              📝 Medical Notes
            </div>
            <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>{selectedPatient.medical_notes}</div>
          </div>
        ) : null}

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          <PrimaryButton onClick={openAddNote} style={{ padding: "10px 14px", fontSize: 13 }}>
            📝 Add Visit Note
          </PrimaryButton>
          <OutlineButton onClick={openAddLab} style={{ padding: "10px 14px", fontSize: 13 }}>
            🧪 Add Lab Result
          </OutlineButton>
          <OutlineButton onClick={openCreateRx} style={{ padding: "10px 14px", fontSize: 13 }}>
            💊 Create Prescription
          </OutlineButton>
        </div>

        {/* Visit Notes */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: 8 }}>
            📝 Visit Notes
          </div>
          {record.visitNotes.length === 0 ? (
            <div style={{ padding: "12px", borderRadius: 12, background: "#f8fafc", border: `1px solid ${C.border}`, color: C.textMuted, fontSize: 12, lineHeight: 1.6 }}>
              No visit notes yet. Add your first note after the consultation to keep the patient history complete.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {record.visitNotes.slice(0, 4).map((n) => (
                <div key={n.id} style={{ padding: "12px", borderRadius: 12, background: "#f8fafc", border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: C.textPrimary }}>{n.title}</div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: C.textLight }}>
                      {new Date(n.atISO).toLocaleString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 12, color: C.textMuted, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {n.body}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Labs */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: 8 }}>
            🧪 Lab Results
          </div>
          {record.labs.length === 0 ? (
            <div style={{ padding: "12px", borderRadius: 12, background: "#f8fafc", border: `1px solid ${C.border}`, color: C.textMuted, fontSize: 12, lineHeight: 1.6 }}>
              No lab results saved. Add a summary and optional file link for quick reference.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {record.labs.slice(0, 4).map((l) => (
                <div key={l.id} style={{ padding: "12px", borderRadius: 12, background: "#f8fafc", border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: C.textPrimary }}>{l.testName}</div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: C.textLight }}>
                      {new Date(l.atISO).toLocaleString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
                    {l.summary}
                  </div>
                  {l.fileUrl ? (
                    <a
                      href={l.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: "inline-block", marginTop: 8, fontSize: 12, fontWeight: 900, color: C.tealDark, textDecoration: "none" }}
                    >
                      📄 View file →
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prescriptions */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: 8 }}>
            💊 Prescriptions
          </div>

          {record.prescriptions.length === 0 ? (
            <div style={{ padding: "12px", borderRadius: 12, background: "#f8fafc", border: `1px solid ${C.border}`, color: C.textMuted, fontSize: 12, lineHeight: 1.6 }}>
              No prescriptions created yet. Create a draft and send it to the patient portal or connected pharmacy.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {record.prescriptions.slice(0, 3).map((rx) => (
                <div key={rx.id} style={{ padding: "12px", borderRadius: 12, background: "#f8fafc", border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 900, color: C.textPrimary }}>
                        Prescription • {new Date(rx.createdAtISO).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>
                        {rx.items.length} medication(s) • Status:{" "}
                        <span style={{ fontWeight: 900, color: rx.status === "sent" ? C.greenDark : C.tealDark }}>
                          {rx.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => sendPrescription(rx.id, "patient")}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 10,
                          border: "none",
                          background: GRAD.primary,
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 900,
                          cursor: "pointer",
                        }}
                      >
                        Send to Patient
                      </button>
                      <button
                        onClick={() => sendPrescription(rx.id, "pharmacy")}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 10,
                          border: `1px solid rgba(245,158,11,0.25)`,
                          background: "rgba(245,158,11,0.08)",
                          color: "#b45309",
                          fontSize: 11,
                          fontWeight: 900,
                          cursor: "pointer",
                        }}
                      >
                        Send to Pharmacy
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                    {rx.items.slice(0, 3).map((it) => (
                      <div key={it.id} style={{ padding: "8px 10px", borderRadius: 10, background: "#fff", border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 12, fontWeight: 900, color: C.textPrimary }}>
                          {it.medication} <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 800 }}>• {it.dosage}</span>
                        </div>
                        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>
                          {it.frequency} • {it.duration}{it.notes ? ` • ${it.notes}` : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {patientAppts.length > 0 ? (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>
              📅 Appointment History
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {patientAppts.slice(0, 4).map((apt) => (
                <div key={apt.id} style={{ padding: "8px 10px", borderRadius: 10, background: "#f8fafc", border: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: C.textPrimary }}>{apt.type}</div>
                    <div style={{ fontSize: 10, color: C.textLight, marginTop: 1 }}>
                      {apt.date} · {apt.time}
                    </div>
                  </div>
                  <StatusPill status={apt.status} />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Card>

      {/* Visit Note Modal */}
      <Modal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        title="Add Visit Note"
        subtitle="Document key findings and follow-up plan."
        icon="📝"
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
          <TextInput label="Title" icon="🏷️" value={noteTitle} onChange={setNoteTitle} placeholder="e.g., Post-consultation note" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>📄 Note</div>
            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Example: Patient reports mild fever for 2 days. Advised hydration and prescribed antibiotics..."
              style={{
                width: "100%",
                minHeight: 140,
                padding: "13px 16px",
                borderRadius: 12,
                border: `2px solid ${C.border}`,
                fontSize: 14,
                outline: "none",
                lineHeight: 1.6,
                color: C.textPrimary,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = C.teal;
                e.currentTarget.style.boxShadow = "0 0 0 4px rgba(20,184,166,0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <OutlineButton onClick={() => setNoteOpen(false)}>Cancel</OutlineButton>
          <PrimaryButton onClick={saveNote}>Save Note</PrimaryButton>
        </div>
      </Modal>

      {/* Lab Modal */}
      <Modal
        open={labOpen}
        onClose={() => setLabOpen(false)}
        title="Add Lab Result"
        subtitle="Save a summary and optional file link."
        icon="🧪"
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
          <TextInput label="Test Name" icon="🔬" value={labTest} onChange={setLabTest} placeholder="e.g., CBC, HbA1c, Lipid Panel" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>🧾 Summary</div>
            <textarea
              value={labSummary}
              onChange={(e) => setLabSummary(e.target.value)}
              placeholder="Example: WBC slightly elevated. Recommend follow-up in 7 days."
              style={{
                width: "100%",
                minHeight: 120,
                padding: "13px 16px",
                borderRadius: 12,
                border: `2px solid ${C.border}`,
                fontSize: 14,
                outline: "none",
                lineHeight: 1.6,
                color: C.textPrimary,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = C.teal;
                e.currentTarget.style.boxShadow = "0 0 0 4px rgba(20,184,166,0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
          <TextInput label="File URL (optional)" icon="🔗" type="url" value={labUrl} onChange={setLabUrl} placeholder="https://..." />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <OutlineButton onClick={() => setLabOpen(false)}>Cancel</OutlineButton>
          <PrimaryButton onClick={saveLab}>Save Lab Result</PrimaryButton>
        </div>
      </Modal>

      {/* Prescription Modal */}
      <Modal
        open={rxOpen}
        onClose={() => setRxOpen(false)}
        title="Create Digital Prescription"
        subtitle="Save a draft first, then send to patient portal or pharmacy."
        icon="💊"
        width={720}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          <TextInput label="Diagnosis (optional)" icon="🩺" value={rxDiagnosis} onChange={setRxDiagnosis} placeholder="e.g., Acute bacterial sinusitis" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>📝 General Instructions</div>
            <textarea
              value={rxInstructions}
              onChange={(e) => setRxInstructions(e.target.value)}
              style={{
                width: "100%",
                minHeight: 96,
                padding: "13px 16px",
                borderRadius: 12,
                border: `2px solid ${C.border}`,
                fontSize: 14,
                outline: "none",
                lineHeight: 1.6,
                color: C.textPrimary,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = C.teal;
                e.currentTarget.style.boxShadow = "0 0 0 4px rgba(20,184,166,0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: C.textPrimary }}>Medication Lines</div>
            <button
              onClick={addRxItem}
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                border: "none",
                background: "rgba(20,184,166,0.10)",
                color: C.tealDark,
                fontWeight: 900,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              + Add Medication
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rxItems.map((it, idx) => (
              <div key={idx} style={{ padding: 12, borderRadius: 14, border: `1px solid ${C.border}`, background: "#f8fafc" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                  <TextInput label="Medication" icon="💊" value={it.medication} onChange={(v) => updateRxItem(idx, "medication", v)} placeholder="e.g., Amoxicillin" />
                  <TextInput label="Dosage" icon="⚖️" value={it.dosage} onChange={(v) => updateRxItem(idx, "dosage", v)} placeholder="e.g., 500mg" />
                  <TextInput label="Frequency" icon="⏱️" value={it.frequency} onChange={(v) => updateRxItem(idx, "frequency", v)} placeholder="e.g., 3× daily" />
                  <TextInput label="Duration" icon="📆" value={it.duration} onChange={(v) => updateRxItem(idx, "duration", v)} placeholder="e.g., 7 days" />
                </div>
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <TextInput label="Notes (optional)" icon="📝" value={it.notes ?? ""} onChange={(v) => updateRxItem(idx, "notes", v)} placeholder="e.g., Take after meals" />
                  </div>
                  <button
                    onClick={() => removeRxItem(idx)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: `1px solid rgba(239,68,68,0.25)`,
                      background: "rgba(239,68,68,0.07)",
                      color: "#dc2626",
                      fontWeight: 900,
                      cursor: "pointer",
                      height: 44,
                      alignSelf: "flex-end",
                    }}
                    title="Remove line"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <OutlineButton onClick={() => setRxOpen(false)}>Cancel</OutlineButton>
          <PrimaryButton onClick={saveRx}>Save Draft</PrimaryButton>
        </div>

        <div style={{ marginTop: 14, fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
          <span style={{ fontWeight: 900, color: C.textPrimary }}>Demo behavior:</span> Prescriptions are stored locally for the demo and can be “sent” to patient/pharmacy (simulated) to show the full workflow.
        </div>
      </Modal>
    </motion.div>
  ) : null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: selected && !isNarrow ? "1fr 420px" : "1fr", gap: 24 }}>
      <Card>
        <SectionHeader
          icon="👥"
          gradient={GRAD.green}
          title="My Patients"
          subtitle={`${patients.length} patients assigned to you`}
          action={
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => addToast("Tip: Open a patient record to add labs, notes, or prescriptions.", "info")}
                style={{
                  padding: "8px 12px",
                  borderRadius: 12,
                  border: "none",
                  background: "rgba(16,185,129,0.10)",
                  color: C.greenDark,
                  fontWeight: 900,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                🧾 Patient Records
              </button>
            </div>
          }
        />

        <div style={{ position: "relative", marginBottom: 16 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>🔍</span>
          <input
            placeholder="Search by name or condition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px 12px 36px",
              borderRadius: 11,
              border: `2px solid ${C.border}`,
              fontSize: 13,
              color: C.textPrimary,
              background: "#f8fafc",
              outline: "none",
              boxSizing: "border-box",
              transition: "all 0.2s",
            }}
            onFocus={(e) => (e.currentTarget.style.border = `2px solid ${C.teal}`)}
            onBlur={(e) => (e.currentTarget.style.border = `2px solid ${C.border}`)}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: C.textMuted }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>👥</div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>No patients found</div>
            </div>
          ) : (
            filtered.map((p, i) => (
              <motion.div
                key={p.id}
                variants={ANIM.fadeSlideUp}
                initial="hidden"
                animate="show"
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelected(selected === p.id ? null : p.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  borderRadius: 14,
                  background: selected === p.id ? "rgba(20,184,166,0.05)" : "#f8fafc",
                  border: selected === p.id ? `2px solid ${C.teal}` : `1px solid ${C.border}`,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (selected !== p.id) (e.currentTarget as HTMLDivElement).style.background = "#f0fafa";
                }}
                onMouseLeave={(e) => {
                  if (selected !== p.id) (e.currentTarget as HTMLDivElement).style.background = "#f8fafc";
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: GRAD.primary,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 900,
                    boxShadow: "0 3px 10px rgba(15,118,110,0.25)",
                  }}
                >
                  {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 900, color: C.textPrimary }}>{p.name}</span>
                    <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 800 }}>Age {p.age}</span>
                    {p.blood_type && (
                      <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 50, background: "rgba(239,68,68,0.1)", color: C.red, fontWeight: 900 }}>
                        {p.blood_type}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 12, fontSize: 11, color: C.textMuted, flexWrap: "wrap" }}>
                    <span>📋 {p.condition}</span>
                    <span>📊 {p.visits} visits</span>
                    <span>📞 {p.phone}</span>
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <StatusPill status={p.status} />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>

      <AnimatePresence>{selectedPatient ? DetailsPanel : null}</AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// CALENDAR TAB (drag/drop + conflict detection)
// ─────────────────────────────────────────────
function CalendarTab({
  appointments,
  setAppointments,
  addToast,
  onLog,
}: {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  addToast: (msg: string, type?: Toast["type"]) => void;
  onLog: (evt: Omit<AuditEvent, "id" | "atISO">) => void;
}) {
  const isNarrow = useIsNarrow(980);

  const [weekOffset, setWeekOffset] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState<{
    apptId: string;
    toDateISO: string;
    toTimeMins: number;
  } | null>(null);

  const [dragApptId, setDragApptId] = useState<string | null>(null);

  const now = new Date();
  const baseWeek = addDays(startOfWeek(now), weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(baseWeek, i));
  const dayISOs = days.map((d) => dateToISO(d));

  const slotStart = 8 * 60;
  const slotEnd = 18 * 60;
  const slotStep = 30;
  const slots = Array.from({ length: Math.floor((slotEnd - slotStart) / slotStep) + 1 }, (_, i) => slotStart + i * slotStep);

  const apptsInWeek = useMemo(() => {
    const isoStart = dayISOs[0];
    const isoEnd = dayISOs[dayISOs.length - 1];
    return appointments.filter((a) => a.date >= isoStart && a.date <= isoEnd && a.status !== "cancelled");
  }, [appointments, dayISOs]);

  const byDay = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const iso of dayISOs) map[iso] = [];
    for (const a of apptsInWeek) {
      if (!map[a.date]) map[a.date] = [];
      map[a.date].push(a);
    }
    for (const k of Object.keys(map)) {
      map[k] = map[k].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
    }
    return map;
  }, [apptsInWeek, dayISOs]);

  const conflictExists = useCallback(
    (excludeId: string, dateISO: string, timeMins: number): boolean => {
      return appointments.some(
        (a) =>
          a.id !== excludeId &&
          a.status !== "cancelled" &&
          a.date === dateISO &&
          timeToMinutes(a.time) === timeMins
      );
    },
    [appointments]
  );

  const onDropSlot = (dateISO: string, timeMins: number) => {
    if (!dragApptId) return;
    const appt = appointments.find((a) => a.id === dragApptId);
    if (!appt) return;

    if (conflictExists(appt.id, dateISO, timeMins)) {
      addToast("Conflict detected: slot already booked.", "error");
      setDragApptId(null);
      return;
    }

    setPendingMove({ apptId: appt.id, toDateISO: dateISO, toTimeMins: timeMins });
    setConfirmOpen(true);
    setDragApptId(null);
  };

  const commitMove = async () => {
    if (!pendingMove) return;
    const appt = appointments.find((a) => a.id === pendingMove.apptId);
    if (!appt) return;

    const newTime = minutesToTime12(pendingMove.toTimeMins);

    const { error } = await supabase
      .from("appointments")
      .update({ date: pendingMove.toDateISO, time: newTime })
      .eq("id", appt.id);

    if (error) {
      addToast("Could not reschedule. Please try again.", "error");
      setConfirmOpen(false);
      return;
    }

    setAppointments((prev) =>
      prev.map((a) => (a.id === appt.id ? { ...a, date: pendingMove.toDateISO, time: newTime } : a))
    );

    addToast("Rescheduled successfully.", "success");
    onLog({
      actor: "Doctor",
      action: "Calendar reschedule",
      details: `${appt.patient_name} → ${pendingMove.toDateISO} at ${newTime}`,
      severity: "warning",
    });

    setConfirmOpen(false);
    setPendingMove(null);
  };

  const weekLabel = `${formatPrettyDate(dayISOs[0])} – ${formatPrettyDate(dayISOs[6])}`;

  if (isNarrow) {
    // Mobile list view
    const list = apptsInWeek
      .slice()
      .sort((a, b) => combineDateTime(a.date, a.time).getTime() - combineDateTime(b.date, b.time).getTime());

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Card topBarGrad={GRAD.primary}>
          <SectionHeader
            icon="🗓️"
            gradient={GRAD.primary}
            title="Weekly Calendar"
            subtitle={`Mobile view • ${weekLabel}`}
            action={
              <div style={{ display: "flex", gap: 10 }}>
                <OutlineButton onClick={() => setWeekOffset((w) => w - 1)} style={{ padding: "10px 12px" }}>
                  ← Prev
                </OutlineButton>
                <PrimaryButton onClick={() => setWeekOffset(0)} style={{ padding: "10px 12px" }}>
                  This Week
                </PrimaryButton>
                <OutlineButton onClick={() => setWeekOffset((w) => w + 1)} style={{ padding: "10px 12px" }}>
                  Next →
                </OutlineButton>
              </div>
            }
          />

          {list.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: C.textMuted }}>
              <div style={{ fontSize: 34, marginBottom: 10 }}>🗓️</div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>No appointments this week</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>Your schedule is clear.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {list.map((a) => (
                <div key={a.id} style={{ padding: 14, borderRadius: 14, background: "#f8fafc", border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: C.textPrimary }}>
                        {a.patient_name}
                      </div>
                      <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
                        {formatPrettyDate(a.date)} • {a.time} • {a.type}
                      </div>
                    </div>
                    <StatusPill status={a.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card topBarGrad={GRAD.primary}>
        <SectionHeader
          icon="🗓️"
          gradient={GRAD.primary}
          title="Weekly Calendar"
          subtitle={`Drag and drop to reschedule • ${weekLabel}`}
          action={
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <OutlineButton onClick={() => setWeekOffset((w) => w - 1)} style={{ padding: "10px 12px" }}>
                ← Prev
              </OutlineButton>
              <PrimaryButton onClick={() => setWeekOffset(0)} style={{ padding: "10px 12px" }}>
                This Week
              </PrimaryButton>
              <OutlineButton onClick={() => setWeekOffset((w) => w + 1)} style={{ padding: "10px 12px" }}>
                Next →
              </OutlineButton>
            </div>
          }
        />

        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 980 }}>
            {/* Header row */}
            <div style={{ display: "grid", gridTemplateColumns: "120px repeat(7, 1fr)", gap: 10, marginBottom: 10 }}>
              <div />
              {days.map((d) => {
                const iso = dateToISO(d);
                const isToday = iso === dateToISO(new Date());
                return (
                  <div
                    key={iso}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 14,
                      background: isToday ? "rgba(20,184,166,0.10)" : "#f8fafc",
                      border: isToday ? `2px solid ${C.teal}` : `1px solid ${C.border}`,
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 900, color: C.textPrimary }}>
                      {d.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                    <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 800, marginTop: 3 }}>
                      {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "120px repeat(7, 1fr)", gap: 10 }}>
              {slots.map((mins) => (
                <React.Fragment key={mins}>
                  {/* time label */}
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: 14,
                      background: "#fff",
                      border: `1px solid ${C.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: 12,
                      color: C.textMuted,
                    }}
                  >
                    {minutesToTime12(mins)}
                  </div>

                  {/* slots */}
                  {dayISOs.map((iso) => {
                    const matching = byDay[iso]?.filter((a) => timeToMinutes(a.time) === mins) ?? [];
                    const isBooked = matching.length > 0;

                    return (
                      <div
                        key={`${iso}_${mins}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => onDropSlot(iso, mins)}
                        style={{
                          minHeight: 56,
                          padding: 8,
                          borderRadius: 14,
                          background: isBooked ? "rgba(16,185,129,0.06)" : "#f8fafc",
                          border: isBooked ? "1px solid rgba(16,185,129,0.25)" : `1px dashed ${C.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {matching.length === 0 ? (
                          <div style={{ fontSize: 10, color: C.textLight, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>
                            Drop here
                          </div>
                        ) : (
                          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
                            {matching.map((a) => (
                              <div
                                key={a.id}
                                draggable
                                onDragStart={() => setDragApptId(a.id)}
                                onDragEnd={() => setDragApptId(null)}
                                style={{
                                  width: "100%",
                                  padding: "8px 10px",
                                  borderRadius: 12,
                                  background: "#fff",
                                  border: `1px solid ${C.border}`,
                                  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                                  cursor: "grab",
                                }}
                                title="Drag to reschedule"
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 900, color: C.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                      {a.patient_name}
                                    </div>
                                    <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 800, marginTop: 2 }}>
                                      {a.type} • Room {a.room}
                                    </div>
                                  </div>
                                  <StatusPill status={a.status} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            <div style={{ marginTop: 14, fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
              <span style={{ fontWeight: 900, color: C.textPrimary }}>Smart scheduling:</span> Drag-and-drop rescheduling includes <span style={{ fontWeight: 900 }}>conflict detection</span> to prevent double-booking.
            </div>
          </div>
        </div>
      </Card>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Reschedule"
        subtitle="This updates the appointment time for the patient."
        icon="✅"
        width={560}
      >
        <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>
          You’re about to move the appointment to:
          <div style={{ marginTop: 10, padding: 12, borderRadius: 14, border: `1px solid ${C.border}`, background: "#f8fafc" }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: C.textPrimary }}>
              {pendingMove ? `${pendingMove.toDateISO} • ${minutesToTime12(pendingMove.toTimeMins)}` : ""}
            </div>
            <div style={{ fontSize: 12, marginTop: 6 }}>
              Conflict detection has already been applied to this slot.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <OutlineButton onClick={() => setConfirmOpen(false)}>Cancel</OutlineButton>
          <PrimaryButton onClick={commitMove}>Confirm</PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────
// PRESCRIPTIONS TAB (global view + send flow)
// ─────────────────────────────────────────────
function PrescriptionsTab({
  patients,
  clinicalStore,
  setClinicalStore,
  addToast,
  onLog,
}: {
  patients: Patient[];
  clinicalStore: PatientClinicalStore;
  setClinicalStore: React.Dispatch<React.SetStateAction<PatientClinicalStore>>;
  addToast: (msg: string, type?: Toast["type"]) => void;
  onLog: (evt: Omit<AuditEvent, "id" | "atISO">) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id ?? "");
  const [createOpen, setCreateOpen] = useState(false);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) ?? null;

  const record = selectedPatient ? clinicalStore[selectedPatient.id] ?? { visitNotes: [], labs: [], prescriptions: [] } : null;

  const filteredPatients = patients.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  const updateRecord = useCallback(
    (patientId: string, updater: (prev: PatientClinicalRecord) => PatientClinicalRecord) => {
      setClinicalStore((prev) => {
        const current = prev[patientId] ?? { visitNotes: [], labs: [], prescriptions: [] };
        return { ...prev, [patientId]: updater(current) };
      });
    },
    [setClinicalStore]
  );

  // Create form state
  const [diagnosis, setDiagnosis] = useState("");
  const [instructions, setInstructions] = useState("Take medications as prescribed. Avoid driving if drowsy.");
  const [items, setItems] = useState<Array<Omit<PrescriptionItem, "id">>>([
    { medication: "Ibuprofen", dosage: "400mg", frequency: "2× daily", duration: "5 days", notes: "Take with food." },
  ]);

  const resetForm = () => {
    setDiagnosis("");
    setInstructions("Take medications as prescribed. Avoid driving if drowsy.");
    setItems([{ medication: "Ibuprofen", dosage: "400mg", frequency: "2× daily", duration: "5 days", notes: "Take with food." }]);
  };

  const openCreate = () => {
    if (!selectedPatient) {
      addToast("Select a patient first.", "error");
      return;
    }
    resetForm();
    setCreateOpen(true);
  };

  const addLine = () => setItems((p) => [...p, { medication: "", dosage: "", frequency: "", duration: "", notes: "" }]);
  const updateLine = (idx: number, key: keyof Omit<PrescriptionItem, "id">, value: string) => {
    setItems((p) => p.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));
  };
  const removeLine = (idx: number) => setItems((p) => p.filter((_, i) => i !== idx));

  const saveDraft = () => {
    if (!selectedPatient) return;
    const cleaned = items
      .map((it) => ({
        medication: it.medication.trim(),
        dosage: it.dosage.trim(),
        frequency: it.frequency.trim(),
        duration: it.duration.trim(),
        notes: it.notes?.trim() || undefined,
      }))
      .filter((it) => it.medication && it.dosage && it.frequency && it.duration);

    if (cleaned.length === 0) {
      addToast("Add at least one complete medication line.", "error");
      return;
    }

    const rx: Prescription = {
      id: uid("rx"),
      createdAtISO: new Date().toISOString(),
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      diagnosis: diagnosis.trim() || undefined,
      instructions: instructions.trim() || "Follow doctor instructions.",
      items: cleaned.map((it) => ({ id: uid("rx_item"), ...it })),
      status: "draft",
      sentTo: { patient: false, pharmacy: false },
    };

    updateRecord(selectedPatient.id, (prev) => ({ ...prev, prescriptions: [rx, ...prev.prescriptions] }));
    addToast("Prescription draft created.", "success");
    onLog({
      actor: "Doctor",
      action: "Prescription created (draft)",
      details: `${selectedPatient.name} • ${cleaned.length} medication(s)`,
      severity: "warning",
    });
    setCreateOpen(false);
  };

  const send = (rxId: string, to: "patient" | "pharmacy") => {
    if (!selectedPatient) return;
    updateRecord(selectedPatient.id, (prev) => {
      const next = prev.prescriptions.map((rx) => {
        if (rx.id !== rxId) return rx;
        const sentTo = { ...rx.sentTo, [to]: true };
        const status: PrescriptionStatus = sentTo.patient && sentTo.pharmacy ? "sent" : rx.status;
        return { ...rx, sentTo, status };
      });
      return { ...prev, prescriptions: next };
    });

    addToast(`Sent to ${to} (simulated).`, "success");
    onLog({
      actor: "Doctor",
      action: "Prescription sent",
      details: `${selectedPatient.name} • Sent to ${to}`,
      severity: "success",
    });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
      <Card topBarGrad={GRAD.purple}>
        <SectionHeader
          icon="💊"
          gradient={GRAD.purple}
          title="Digital Prescriptions"
          subtitle="Create drafts and send to patient portal or connected pharmacy."
          action={
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={openCreate}
                style={{
                  padding: "10px 14px",
                  borderRadius: 14,
                  border: "none",
                  background: GRAD.primary,
                  color: "#fff",
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow: "0 4px 18px rgba(20,184,166,0.25)",
                }}
              >
                + New Prescription
              </button>
            </div>
          }
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 18 }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient..."
              style={{
                width: "100%",
                padding: "12px 14px 12px 36px",
                borderRadius: 12,
                border: `2px solid ${C.border}`,
                background: "#f8fafc",
                outline: "none",
                fontSize: 13,
                fontWeight: 700,
              }}
              onFocus={(e) => (e.currentTarget.style.border = `2px solid ${C.teal}`)}
              onBlur={(e) => (e.currentTarget.style.border = `2px solid ${C.border}`)}
            />
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 900, color: C.textPrimary, marginBottom: 8 }}>👤 Selected Patient</div>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: `2px solid ${C.border}`,
                background: "#fff",
                outline: "none",
                fontSize: 13,
                fontWeight: 800,
                color: C.textPrimary,
                cursor: "pointer",
              }}
            >
              {filteredPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} • {p.condition}
                </option>
              ))}
            </select>
          </div>

          <div style={{ padding: 14, borderRadius: 14, border: `1px solid ${C.border}`, background: "#f8fafc" }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: C.textLight, textTransform: "uppercase", letterSpacing: "1px" }}>
              Trust & Compliance
            </div>
            <div style={{ fontSize: 13, fontWeight: 900, color: C.textPrimary, marginTop: 6 }}>
              Role-based access + audit log
            </div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6, lineHeight: 1.6 }}>
              Prescription actions are logged so clinics can review what changed and when (demo audit log).
            </div>
          </div>
        </div>

        {!selectedPatient || !record ? (
          <div style={{ padding: 30, textAlign: "center", color: C.textMuted }}>
            Select a patient to view prescriptions.
          </div>
        ) : record.prescriptions.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: C.textMuted }}>
            <div style={{ fontSize: 34, marginBottom: 10 }}>💊</div>
            <div style={{ fontSize: 14, fontWeight: 900 }}>No prescriptions yet for {selectedPatient.name}</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>
              Create a draft prescription, then send it to the patient portal or connected pharmacy.
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
            {record.prescriptions.map((rx) => (
              <div key={rx.id} style={{ padding: 16, borderRadius: 16, border: `1px solid ${C.border}`, background: "#fff", boxShadow: "0 6px 26px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: C.textPrimary }}>
                      {selectedPatient.name} • {new Date(rx.createdAtISO).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6, lineHeight: 1.5 }}>
                      {rx.diagnosis ? (
                        <>
                          <span style={{ fontWeight: 900, color: C.textPrimary }}>Diagnosis:</span> {rx.diagnosis}
                        </>
                      ) : (
                        <span style={{ fontWeight: 900, color: C.textMuted }}>Diagnosis not provided</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <div
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        background: rx.status === "sent" ? "rgba(16,185,129,0.12)" : "rgba(20,184,166,0.10)",
                        border: rx.status === "sent" ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(20,184,166,0.25)",
                        fontSize: 10,
                        fontWeight: 900,
                        color: rx.status === "sent" ? C.greenDark : C.tealDark,
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                      }}
                    >
                      {rx.status}
                    </div>
                    <div style={{ fontSize: 11, color: C.textLight, fontWeight: 800 }}>
                      {rx.items.length} meds
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  {rx.items.slice(0, 4).map((it) => (
                    <div key={it.id} style={{ padding: 10, borderRadius: 12, background: "#f8fafc", border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: C.textPrimary }}>
                        {it.medication} <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 800 }}>• {it.dosage}</span>
                      </div>
                      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>
                        {it.frequency} • {it.duration}{it.notes ? ` • ${it.notes}` : ""}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={() => send(rx.id, "patient")}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 14,
                      border: "none",
                      background: GRAD.primary,
                      color: "#fff",
                      fontWeight: 900,
                      cursor: "pointer",
                      fontSize: 12,
                      flex: 1,
                      minWidth: 160,
                    }}
                  >
                    Send to Patient
                  </button>
                  <button
                    onClick={() => send(rx.id, "pharmacy")}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 14,
                      border: `1px solid rgba(245,158,11,0.25)`,
                      background: "rgba(245,158,11,0.09)",
                      color: "#b45309",
                      fontWeight: 900,
                      cursor: "pointer",
                      fontSize: 12,
                      flex: 1,
                      minWidth: 160,
                    }}
                  >
                    Send to Pharmacy
                  </button>
                </div>

                <div style={{ marginTop: 10, fontSize: 11, color: C.textMuted, lineHeight: 1.6 }}>
                  <span style={{ fontWeight: 900, color: C.textPrimary }}>Instructions:</span> {rx.instructions}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New Prescription"
        subtitle={selectedPatient ? `Patient: ${selectedPatient.name}` : "Select a patient first."}
        icon="💊"
        width={760}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          <TextInput label="Diagnosis (optional)" icon="🩺" value={diagnosis} onChange={setDiagnosis} placeholder="e.g., Acute otitis media" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>📝 Instructions</div>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              style={{
                width: "100%",
                minHeight: 96,
                padding: "13px 16px",
                borderRadius: 12,
                border: `2px solid ${C.border}`,
                fontSize: 14,
                outline: "none",
                lineHeight: 1.6,
                color: C.textPrimary,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = C.teal;
                e.currentTarget.style.boxShadow = "0 0 0 4px rgba(20,184,166,0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: C.textPrimary }}>Medication Lines</div>
            <button
              onClick={addLine}
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                border: "none",
                background: "rgba(20,184,166,0.10)",
                color: C.tealDark,
                fontWeight: 900,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              + Add Medication
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((it, idx) => (
              <div key={idx} style={{ padding: 12, borderRadius: 14, border: `1px solid ${C.border}`, background: "#f8fafc" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                  <TextInput label="Medication" icon="💊" value={it.medication} onChange={(v) => updateLine(idx, "medication", v)} placeholder="e.g., Ibuprofen" />
                  <TextInput label="Dosage" icon="⚖️" value={it.dosage} onChange={(v) => updateLine(idx, "dosage", v)} placeholder="e.g., 400mg" />
                  <TextInput label="Frequency" icon="⏱️" value={it.frequency} onChange={(v) => updateLine(idx, "frequency", v)} placeholder="e.g., 2× daily" />
                  <TextInput label="Duration" icon="📆" value={it.duration} onChange={(v) => updateLine(idx, "duration", v)} placeholder="e.g., 5 days" />
                </div>
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <TextInput label="Notes (optional)" icon="📝" value={it.notes ?? ""} onChange={(v) => updateLine(idx, "notes", v)} placeholder="e.g., Take with food" />
                  </div>
                  <button
                    onClick={() => removeLine(idx)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: `1px solid rgba(239,68,68,0.25)`,
                      background: "rgba(239,68,68,0.07)",
                      color: "#dc2626",
                      fontWeight: 900,
                      cursor: "pointer",
                      height: 44,
                      alignSelf: "flex-end",
                    }}
                    title="Remove line"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <OutlineButton onClick={() => setCreateOpen(false)}>Cancel</OutlineButton>
          <PrimaryButton onClick={saveDraft}>Save Draft</PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────
// REMINDERS TAB (48h/24h/2h schedule + send now)
// ─────────────────────────────────────────────
function RemindersTab({
  appointments,
  settings,
  setSettings,
  addToast,
  onLog,
}: {
  appointments: Appointment[];
  settings: ReminderSettings;
  setSettings: React.Dispatch<React.SetStateAction<ReminderSettings>>;
  addToast: (msg: string, type?: Toast["type"]) => void;
  onLog: (evt: Omit<AuditEvent, "id" | "atISO">) => void;
}) {
  const upcoming = useMemo(() => {
    const now = new Date();
    return appointments
      .filter((a) => a.status === "upcoming")
      .map((a) => ({ a, when: combineDateTime(a.date, a.time) }))
      .filter(({ when }) => when.getTime() >= now.getTime())
      .sort((x, y) => x.when.getTime() - y.when.getTime())
      .slice(0, 10);
  }, [appointments]);

  const scheduleFor = (apt: Appointment): Array<{ label: string; atISO: string }> => {
    const apptDate = combineDateTime(apt.date, apt.time);
    return settings.scheduleHours
      .slice()
      .sort((a, b) => b - a)
      .map((h) => {
        const d = new Date(apptDate);
        d.setHours(d.getHours() - h);
        return { label: `${h}h before`, atISO: d.toISOString() };
      });
  };

  const toggleChannel = (ch: ReminderChannel) => {
    setSettings((prev) => {
      const has = prev.channels.includes(ch);
      const channels = has ? prev.channels.filter((c) => c !== ch) : [...prev.channels, ch];
      return { ...prev, channels };
    });
  };

  const sendNow = (apt: Appointment) => {
    if (!settings.enabled) {
      addToast("Reminders are disabled. Enable them to send.", "error");
      return;
    }
    if (settings.channels.length === 0) {
      addToast("Select at least one channel (SMS or Email).", "error");
      return;
    }
    addToast(`Reminder sent via ${settings.channels.join(" + ").toUpperCase()} (simulated).`, "success");
    onLog({
      actor: "System",
      action: "Reminder sent",
      details: `${apt.patient_name} • ${apt.date} ${apt.time} • ${settings.channels.join(", ")}`,
      severity: "success",
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Card topBarGrad={GRAD.amber}>
        <SectionHeader
          icon="🔔"
          gradient={GRAD.amber}
          title="Automated Reminders"
          subtitle="48h, 24h, and 2h reminder schedule (demo workflow)"
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          <div style={{ padding: 14, borderRadius: 16, border: `1px solid ${C.border}`, background: "#f8fafc" }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: C.textLight, textTransform: "uppercase", letterSpacing: "1px" }}>
              Status
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: C.textPrimary }}>
                {settings.enabled ? "Enabled" : "Disabled"}
              </div>
              <button
                onClick={() => setSettings((p) => ({ ...p, enabled: !p.enabled }))}
                style={{
                  padding: "10px 14px",
                  borderRadius: 14,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 900,
                  background: settings.enabled ? GRAD.green : "rgba(100,116,139,0.15)",
                  color: settings.enabled ? "#fff" : C.textMuted,
                }}
              >
                {settings.enabled ? "ON" : "OFF"}
              </button>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
              Patients can confirm or reschedule quickly when reminders are active.
            </div>
          </div>

          <div style={{ padding: 14, borderRadius: 16, border: `1px solid ${C.border}`, background: "#f8fafc" }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: C.textLight, textTransform: "uppercase", letterSpacing: "1px" }}>
              Channels
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
              {(["sms", "email"] as ReminderChannel[]).map((ch) => {
                const active = settings.channels.includes(ch);
                return (
                  <button
                    key={ch}
                    onClick={() => toggleChannel(ch)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 999,
                      border: active ? "none" : `2px solid ${C.border}`,
                      background: active ? GRAD.primary : "#fff",
                      color: active ? "#fff" : C.textMuted,
                      fontWeight: 900,
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    {ch === "sms" ? "📩 SMS" : "📧 Email"}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
              Demo: sending is simulated, but the workflow mirrors real clinics.
            </div>
          </div>

          <div style={{ padding: 14, borderRadius: 16, border: `1px solid ${C.border}`, background: "#f8fafc" }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: C.textLight, textTransform: "uppercase", letterSpacing: "1px" }}>
              Schedule
            </div>
            <div style={{ marginTop: 10, fontSize: 14, fontWeight: 900, color: C.textPrimary }}>
              {settings.scheduleHours.slice().sort((a, b) => b - a).join("h • ")}h before
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
              Clinics commonly use 48h + 24h + 2h to reduce no-shows.
            </div>
          </div>
        </div>
      </Card>

      <Card topBarGrad={GRAD.primary}>
        <SectionHeader
          icon="📅"
          gradient={GRAD.primary}
          title="Upcoming Appointment Reminders"
          subtitle={`${upcoming.length} upcoming appointments`}
        />

        {upcoming.length === 0 ? (
          <div style={{ padding: 34, textAlign: "center", color: C.textMuted }}>
            <div style={{ fontSize: 34, marginBottom: 10 }}>🔔</div>
            <div style={{ fontSize: 14, fontWeight: 900 }}>No upcoming appointments</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>Once patients book, reminders appear here.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {upcoming.map(({ a }) => (
              <div key={a.id} style={{ padding: 14, borderRadius: 16, border: `1px solid ${C.border}`, background: "#f8fafc" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: C.textPrimary }}>
                      {a.patient_name} • {a.type}
                    </div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>
                      📅 {formatPrettyDate(a.date)} • ⏰ {a.time} • 🚪 Room {a.room}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <StatusPill status={a.status} />
                    <button
                      onClick={() => sendNow(a)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 14,
                        border: "none",
                        background: GRAD.green,
                        color: "#fff",
                        fontWeight: 900,
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Send Now
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                  {scheduleFor(a).map((s) => (
                    <div key={s.label} style={{ padding: 12, borderRadius: 14, background: "#fff", border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 10, fontWeight: 900, color: C.textLight, textTransform: "uppercase", letterSpacing: "1px" }}>
                        {s.label}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 900, color: C.textPrimary, marginTop: 6 }}>
                        {new Date(s.atISO).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// ANALYTICS TAB (utilization/no-show/retention/export)
// ─────────────────────────────────────────────
function AnalyticsTab({
  appointments,
  patients,
  addToast,
}: {
  appointments: Appointment[];
  patients: Patient[];
  addToast: (msg: string, type?: Toast["type"]) => void;
}) {
  const todayISO = new Date().toISOString().slice(0, 10);
  const completed = appointments.filter((a) => a.status === "completed");
  const cancelled = appointments.filter((a) => a.status === "cancelled");
  const upcoming = appointments.filter((a) => a.status === "upcoming" && a.date >= todayISO);

  const revenue = completed.reduce((s, a) => s + a.fee, 0);

  const totalFinished = completed.length + cancelled.length;
  const noShowRate = totalFinished === 0 ? 0 : Math.round((cancelled.length / totalFinished) * 100);

  // Retention proxy: patients with 2+ completed appointments
  const completedByPatient = completed.reduce<Record<string, number>>((acc, a) => {
    const key = a.patient_id || a.patient_name;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const patientsWithCompleted = Object.keys(completedByPatient).length;
  const retained = Object.values(completedByPatient).filter((n) => n >= 2).length;
  const retentionRate = patientsWithCompleted === 0 ? 0 : Math.round((retained / patientsWithCompleted) * 100);

  // Weekly utilization proxy: bookings / capacity
  const week = startOfWeek(new Date());
  const weekStartISO = dateToISO(week);
  const weekEndISO = dateToISO(addDays(week, 6));
  const thisWeekActive = appointments.filter(
    (a) => a.status !== "cancelled" && a.date >= weekStartISO && a.date <= weekEndISO
  ).length;

  const capacitySlotsPerDay = 16; // 8h to 18h with 30-min slots
  const capacityPerWeek = 7 * capacitySlotsPerDay;
  const utilization = Math.round((thisWeekActive / capacityPerWeek) * 100);

  const types = appointments.reduce<Record<string, number>>((acc, a) => {
    const key = a.type || "General";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const typeEntries = Object.entries(types).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxType = Math.max(...typeEntries.map(([, v]) => v), 1);

  const exportCsv = () => {
    const headers = ["date", "time", "patient_name", "type", "room", "fee", "status"];
    const rows = appointments
      .slice()
      .sort((a, b) => combineDateTime(a.date, a.time).getTime() - combineDateTime(b.date, b.time).getTime())
      .map((a) => [a.date, a.time, a.patient_name, a.type, a.room, String(a.fee), a.status]);

    const csv = [headers.join(","), ...rows.map((r) => r.map((x) => `"${String(x).replaceAll(`"`, `""`)}"`).join(","))].join("\n");
    downloadTextFile(`medibook-doctor-report-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    addToast("Report exported (CSV).", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
        {[
          { label: "Revenue (Completed)", value: `$${revenue.toLocaleString()}`, icon: "💵", grad: GRAD.green },
          { label: "Utilization (This Week)", value: `${clamp(utilization, 0, 100)}%`, icon: "📊", grad: GRAD.primary },
          { label: "No-Show Rate", value: `${clamp(noShowRate, 0, 100)}%`, icon: "⚠️", grad: GRAD.amber },
          { label: "Retention Rate", value: `${clamp(retentionRate, 0, 100)}%`, icon: "🔁", grad: GRAD.purple },
        ].map((s) => (
          <Card key={s.label}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 900, color: C.textLight, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.textPrimary, letterSpacing: "-0.5px" }}>{s.value}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6, lineHeight: 1.6 }}>
                  {s.label.includes("No-Show") ? "Based on cancelled vs completed." : s.label.includes("Retention") ? "Patients with 2+ completed visits." : "Clinic-ready KPI snapshot."}
                </div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: s.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}>
                {s.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
        <Card topBarGrad={GRAD.primary}>
          <SectionHeader
            icon="📈"
            gradient={GRAD.primary}
            title="Appointment Type Breakdown"
            subtitle="Top categories"
            action={
              <button
                onClick={exportCsv}
                style={{
                  padding: "10px 14px",
                  borderRadius: 14,
                  border: "none",
                  background: GRAD.primary,
                  color: "#fff",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                ⬇️ Export CSV
              </button>
            }
          />

          {typeEntries.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: C.textMuted }}>
              <div style={{ fontSize: 34, marginBottom: 10 }}>📈</div>
              <div style={{ fontSize: 14, fontWeight: 900 }}>No analytics yet</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>Once appointments exist, charts appear here.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {typeEntries.map(([name, val], idx) => (
                <motion.div
                  key={name}
                  variants={ANIM.fadeSlideUp}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: idx * 0.04 }}
                  style={{ padding: 12, borderRadius: 14, background: "#f8fafc", border: `1px solid ${C.border}` }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: C.textPrimary }}>{name}</div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: C.textMuted }}>{val}</div>
                  </div>
                  <div style={{ height: 8, background: "#e8ecf0", borderRadius: 6, marginTop: 10 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(val / maxType) * 100}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      style={{ height: "100%", borderRadius: 6, background: idx === 0 ? GRAD.primary : "rgba(20,184,166,0.35)" }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        <Card topBarGrad={GRAD.green}>
          <SectionHeader
            icon="🧾"
            gradient={GRAD.green}
            title="Clinic Snapshot"
            subtitle="What owners care about"
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            {[
              { label: "Patients", value: String(patients.length), color: C.tealDark },
              { label: "Upcoming", value: String(upcoming.length), color: C.tealDark },
              { label: "Completed", value: String(completed.length), color: C.greenDark },
              { label: "Cancelled", value: String(cancelled.length), color: C.red },
            ].map((s) => (
              <div key={s.label} style={{ padding: 14, borderRadius: 14, border: `1px solid ${C.border}`, background: "#f8fafc", textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, fontWeight: 900, color: C.textLight, textTransform: "uppercase", letterSpacing: "1px", marginTop: 4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, padding: 14, borderRadius: 14, border: `1px solid ${C.border}`, background: "#f8fafc", fontSize: 12, color: C.textMuted, lineHeight: 1.7 }}>
            <span style={{ fontWeight: 900, color: C.textPrimary }}>Export-ready:</span> Clinic owners can download reports for revenue and utilization reviews (CSV export).
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// EARNINGS TAB (kept from your original)
// ─────────────────────────────────────────────
function EarningsTab({ appointments }: { appointments: Appointment[] }) {
  const today = new Date().toISOString().split("T")[0];
  const thisMonth = new Date().toISOString().slice(0, 7);

  const completed = appointments.filter((a) => a.status === "completed");

  const todayEarnings = completed.filter((a) => a.date === today).reduce((s, a) => s + a.fee, 0);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEarnings = completed
    .filter((a) => a.date >= weekStart.toISOString().split("T")[0])
    .reduce((s, a) => s + a.fee, 0);

  const monthEarnings = completed.filter((a) => a.date.startsWith(thisMonth)).reduce((s, a) => s + a.fee, 0);

  const totalEarnings = completed.reduce((s, a) => s + a.fee, 0);

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString("en-US", { month: "short" });
    const amount = completed.filter((a) => a.date.startsWith(key)).reduce((s, a) => s + a.fee, 0);
    return { key, label, amount };
  });

  const maxMonth = Math.max(...months.map((m) => m.amount), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20 }}>
        {[
          { label: "Today's Earnings", value: `$${todayEarnings}`, icon: "📅", grad: GRAD.primary },
          { label: "This Week", value: `$${weekEarnings}`, icon: "📆", grad: GRAD.green },
          { label: "This Month", value: `$${monthEarnings}`, icon: "🗓️", grad: GRAD.amber },
          { label: "Total Earnings", value: `$${totalEarnings.toLocaleString()}`, icon: "💰", grad: GRAD.purple },
        ].map((s, i) => (
          <motion.div key={s.label} variants={ANIM.fadeSlideUp} initial="hidden" animate="show" transition={{ delay: i * 0.06 }}>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 900, color: C.textLight, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: C.textPrimary, letterSpacing: "-0.5px" }}>{s.value}</div>
                </div>
                <div style={{ width: 42, height: 42, background: s.grad, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}>
                  {s.icon}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
        <Card topBarGrad={GRAD.primary}>
          <SectionHeader icon="📈" gradient={GRAD.primary} title="Monthly Earnings" subtitle="Last 6 months" />
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 140, marginBottom: 16 }}>
            {months.map((m, i) => (
              <div key={m.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 700, whiteSpace: "nowrap" }}>{m.amount > 0 ? `$${m.amount}` : ""}</div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(m.amount / maxMonth) * 100}%` }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                  style={{
                    width: "100%",
                    minHeight: 4,
                    background: i === months.length - 1 ? GRAD.primary : "rgba(20,184,166,0.2)",
                    borderRadius: "6px 6px 0 0",
                  }}
                />
                <span style={{ fontSize: 10, color: C.textLight, fontWeight: 700 }}>{m.label}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: 12, border: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, color: C.textLight, fontWeight: 700 }}>All Time Total</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.tealDark }}>${totalEarnings.toLocaleString()}</div>
            </div>
            <div style={{ padding: "7px 14px", borderRadius: 50, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", fontSize: 12, fontWeight: 900, color: "#059669" }}>
              {completed.length} completed
            </div>
          </div>
        </Card>

        <Card topBarGrad={GRAD.green}>
          <SectionHeader icon="💳" gradient={GRAD.green} title="Recent Earnings" subtitle="Completed appointments" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {completed.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px", color: C.textMuted }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>💰</div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>No completed appointments yet</div>
              </div>
            ) : (
              completed.slice(0, 8).map((apt, i) => (
                <motion.div
                  key={apt.id}
                  variants={ANIM.slideIn}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: i * 0.05 }}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 13px", borderRadius: 11, background: "#f8fafc", border: `1px solid ${C.border}` }}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: GRAD.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 900, flexShrink: 0 }}>
                      {apt.patient_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: C.textPrimary }}>{apt.patient_name}</div>
                      <div style={{ fontSize: 11, color: C.textLight, fontWeight: 800 }}>
                        {apt.type} · {apt.date}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: C.greenDark }}>+${apt.fee}</div>
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PROFILE TAB (kept + minor trust copy)
// ─────────────────────────────────────────────
function ProfileTab({
  doctor,
  clinic,
  user,
}: {
  doctor: DoctorProfile | null;
  clinic: Clinic | null;
  user: User | null;
}) {
  if (!doctor) return null;

  const profileFields = [
    { label: "Email", value: doctor.email || user?.email || "—", icon: "📧" },
    { label: "Phone", value: doctor.phone || "—", icon: "📞" },
    { label: "Experience", value: doctor.experience || "—", icon: "📅" },
    { label: "Status", value: doctor.status || "—", icon: "🔘" },
    { label: "Patients", value: String(doctor.patients ?? 0), icon: "👥" },
    { label: "Clinic", value: clinic?.name || "—", icon: "🏥" },
  ] as const;

  const perfStats = [
    { label: "Utilization", value: `${doctor.utilization ?? 0}%`, color: C.teal },
    { label: "Revenue", value: `$${doctor.revenue ?? 0}`, color: C.greenDark },
    { label: "Patients", value: String(doctor.patients ?? 0), color: C.teal },
    { label: "Rating", value: `${doctor.rating ?? 5}/5.0`, color: "#f59e0b" },
  ] as const;

  const clinicFields = clinic
    ? ([
        { label: "Clinic Name", value: clinic.name, icon: "🏥" },
        { label: "Phone", value: clinic.phone || "—", icon: "📞" },
        { label: "Email", value: clinic.email || "—", icon: "📧" },
        { label: "Address", value: clinic.address || "—", icon: "📍" },
      ] as const)
    : [];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: 24,
      }}
    >
      <Card topBarGrad={GRAD.primary}>
        <SectionHeader
          icon="👨‍⚕️"
          gradient={GRAD.primary}
          title="My Profile"
          subtitle="Your professional details"
        />

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: doctor.grad || GRAD.primary,
              margin: "0 auto 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 26,
              fontWeight: 900,
              boxShadow: "0 12px 32px rgba(15,118,110,0.3)",
            }}
          >
            {doctor.initials}
          </div>

          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: C.textPrimary,
              marginBottom: 4,
            }}
          >
            {doctor.name}
          </div>
          <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 8, fontWeight: 800 }}>
            {doctor.specialty}
          </div>

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} style={{ fontSize: 16, color: s <= Math.floor(doctor.rating ?? 5) ? "#f59e0b" : "#e8ecf0" }}>
                ★
              </span>
            ))}
            <span style={{ fontSize: 14, fontWeight: 900, color: C.textPrimary, marginLeft: 4 }}>
              {doctor.rating ?? 5}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {profileFields.map((f) => (
            <div key={f.label} style={{ padding: "10px 12px", borderRadius: 11, background: "#f8fafc", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: C.textLight, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 3 }}>
                {f.icon} {f.label}
              </div>
              <div style={{ fontSize: 13, fontWeight: 900, color: C.textPrimary }}>
                {f.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14, padding: 14, borderRadius: 14, border: `1px solid ${C.border}`, background: "rgba(20,184,166,0.06)", color: C.textMuted, fontSize: 12, lineHeight: 1.7 }}>
          <span style={{ fontWeight: 900, color: C.textPrimary }}>Clinic-ready:</span> Your profile is used on the patient portal and in booking confirmations to build trust.
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Card topBarGrad={GRAD.green}>
          <SectionHeader icon="📊" gradient={GRAD.green} title="Performance Stats" subtitle="Your metrics" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {perfStats.map((s) => (
              <div key={s.label} style={{ padding: "14px", borderRadius: 12, background: "#f8fafc", border: `1px solid ${C.border}`, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: C.textLight, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textMuted, marginBottom: 6 }}>
              <span>Schedule Utilization</span>
              <span style={{ fontWeight: 900, color: C.tealDark }}>{doctor.utilization ?? 0}%</span>
            </div>
            <div style={{ height: 8, background: "#e8ecf0", borderRadius: 4 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${doctor.utilization ?? 0}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ height: "100%", background: GRAD.primary, borderRadius: 4 }}
              />
            </div>
          </div>
        </Card>

        {clinic ? (
          <Card topBarGrad={GRAD.amber}>
            <SectionHeader icon="🏥" gradient={GRAD.amber} title="My Clinic" subtitle="Where you practice" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {clinicFields.map((f) => (
                <div key={f.label} style={{ padding: "10px 12px", borderRadius: 11, background: "#f8fafc", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: C.textLight, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 3 }}>
                    {f.icon} {f.label}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: C.textPrimary }}>{f.value}</div>
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SECURITY TAB (audit log + trust UI)
// ─────────────────────────────────────────────
function SecurityTab({
  userEmail,
  auditLog,
  onClear,
}: {
  userEmail: string;
  auditLog: AuditEvent[];
  onClear: () => void;
}) {
  const latest = auditLog.slice(0, 18);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Card topBarGrad={GRAD.blue}>
        <SectionHeader icon="🔒" gradient={GRAD.blue} title="Security & Compliance" subtitle="Role-based access, audit logs, and data protection signals" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          <div style={{ padding: 14, borderRadius: 16, border: `1px solid ${C.border}`, background: "#f8fafc" }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: C.textLight, textTransform: "uppercase", letterSpacing: "1px" }}>
              Role-based access
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: C.textPrimary, marginTop: 8 }}>
              Doctor portal access only
            </div>
            <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.7, marginTop: 8 }}>
              This dashboard is protected by authenticated roles. Doctors only see assigned appointments and patients.
            </div>
          </div>

          <div style={{ padding: 14, borderRadius: 16, border: `1px solid ${C.border}`, background: "#f8fafc" }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: C.textLight, textTransform: "uppercase", letterSpacing: "1px" }}>
              Signed-in identity
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: C.textPrimary, marginTop: 8 }}>
              {userEmail}
            </div>
            <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.7, marginTop: 8 }}>
              Clinics can trace actions to authenticated accounts (demo audit log below).
            </div>
          </div>

          <div style={{ padding: 14, borderRadius: 16, border: `1px solid ${C.border}`, background: "#f8fafc" }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: C.textLight, textTransform: "uppercase", letterSpacing: "1px" }}>
              Data protection
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: C.textPrimary, marginTop: 8 }}>
              Encrypted storage (platform-level)
            </div>
            <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.7, marginTop: 8 }}>
              In production, clinics typically rely on encrypted transport + database encryption and strict access policies.
            </div>
          </div>
        </div>
      </Card>

      <Card topBarGrad={GRAD.primary}>
        <SectionHeader
          icon="🧾"
          gradient={GRAD.primary}
          title="Audit Log"
          subtitle="Tracks scheduling, reminders, and prescription activity"
          action={
            <button
              onClick={onClear}
              style={{
                padding: "10px 14px",
                borderRadius: 14,
                border: `1px solid rgba(239,68,68,0.25)`,
                background: "rgba(239,68,68,0.08)",
                color: "#dc2626",
                fontWeight: 900,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Clear Log
            </button>
          }
        />

        {latest.length === 0 ? (
          <div style={{ padding: 34, textAlign: "center", color: C.textMuted }}>
            <div style={{ fontSize: 34, marginBottom: 10 }}>🧾</div>
            <div style={{ fontSize: 14, fontWeight: 900 }}>No audit events yet</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>
              When you reschedule, send reminders, or create prescriptions, events appear here.
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {latest.map((e) => (
              <div key={e.id} style={{ padding: 14, borderRadius: 16, border: `1px solid ${C.border}`, background: "#f8fafc" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: C.textPrimary }}>
                      {e.action}
                    </div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6, lineHeight: 1.6 }}>
                      {e.details}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 900,
                        color:
                          e.severity === "success" ? C.greenDark : e.severity === "warning" ? "#b45309" : C.tealDark,
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                      }}
                    >
                      {e.severity}
                    </div>
                    <div style={{ fontSize: 11, color: C.textLight, fontWeight: 800, marginTop: 6 }}>
                      {new Date(e.atISO).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div style={{ fontSize: 11, color: C.textLight, fontWeight: 800, marginTop: 4 }}>
                      {e.actor}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN DOCTOR DASHBOARD
// - Adds: Calendar, Prescriptions, Reminders, Analytics, Security/Audit
// - Stores clinical notes/labs/prescriptions in localStorage (demo-safe)
// ─────────────────────────────────────────────
export default function DoctorDashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [doctorMissing, setDoctorMissing] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);

  const { toasts, addToast, removeToast } = useToast();

  // Local “Patient Management Portal” store (demo-safe)
  const [clinicalStore, setClinicalStore] = useState<PatientClinicalStore>({});
  const clinicalKeyRef = useRef<string | null>(null);

  // Reminder settings (demo)
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    enabled: true,
    channels: ["sms", "email"],
    scheduleHours: [48, 24, 2],
  });

  // Audit log (demo)
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([]);
  const auditKeyRef = useRef<string | null>(null);

  const logEvent = useCallback((evt: Omit<AuditEvent, "id" | "atISO">) => {
    setAuditLog((prev) => [{ id: uid("audit"), atISO: new Date().toISOString(), ...evt }, ...prev].slice(0, 220));
  }, []);

  // Persist audit log
  useEffect(() => {
    if (!auditKeyRef.current) return;
    try {
      localStorage.setItem(auditKeyRef.current, JSON.stringify(auditLog));
    } catch {
      // ignore (storage might be blocked)
    }
  }, [auditLog]);

  // Persist clinical store
  useEffect(() => {
    if (!clinicalKeyRef.current) return;
    try {
      localStorage.setItem(clinicalKeyRef.current, JSON.stringify(clinicalStore));
    } catch {
      // ignore
    }
  }, [clinicalStore]);

  // ─────────────────────────────────────────────
  // AUTH CHECK
  // ─────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const {
          data: { user: authUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !authUser) {
          if (mounted) router.replace("/login");
          return;
        }

        // Prefer secure role from app_metadata (set server-side)
        let role = getRoleFromAuth(authUser);

        // Fallback for older accounts only (read profiles.role)
        if (!role) {
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", authUser.id).maybeSingle();
          const pr = profile?.role;
          role = pr === "admin" || pr === "doctor" || pr === "patient" ? pr : null;
        }

        if (!mounted) return;

        if (!role) {
          await supabase.auth.signOut();
          router.replace("/login");
          return;
        }

        if (role !== "doctor") {
          router.replace(roleToDashboard(role));
          return;
        }

        setUser(authUser);
        setAuthLoading(false);
      } catch {
        if (mounted) {
          setAuthError("Authentication failed. Please refresh the page.");
          setAuthLoading(false);
        }
      }
    };

    void checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" && mounted) router.replace("/login");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  // ─────────────────────────────────────────────
  // LOAD DOCTOR DATA (runs once per user.id)
  // ─────────────────────────────────────────────
  const loadData = useCallback(
    async (uidUser: string) => {
      setDataLoading(true);
      setDoctorMissing(false);

      try {
        const { data: doctorData, error: docErr } = await supabase
          .from("doctors")
          .select("*")
          .eq("profile_id", uidUser)
          .maybeSingle();

        if (docErr) {
          addToast("Could not load doctor profile.", "error");
          return;
        }

        if (!doctorData) {
          setDoctor(null);
          setClinic(null);
          setAppointments([]);
          setPatients([]);
          setEarnings([]);
          setDoctorMissing(true);
          addToast("Doctor profile not found. Please contact your clinic admin.", "info");
          return;
        }

        const doc = doctorData as DoctorProfile;
        setDoctor(doc);

        const [
          { data: clinicData },
          { data: apptData },
          { data: patientData },
          { data: earningData },
        ] = await Promise.all([
          supabase.from("clinics").select("*").eq("id", doc.clinic_id).maybeSingle(),
          supabase
            .from("appointments")
            .select("*")
            .eq("doctor_id", doc.id)
            .order("date", { ascending: true })
            .order("time", { ascending: true }),
          supabase.from("patients").select("*").eq("assigned_doctor_id", doc.id),
          supabase
            .from("doctor_earnings")
            .select("*")
            .eq("doctor_id", doc.id)
            .order("date", { ascending: false }),
        ]);

        setClinic((clinicData as Clinic) ?? null);
        setAppointments((apptData as Appointment[]) ?? []);
        setPatients((patientData as Patient[]) ?? []);
        setEarnings((earningData as Earning[]) ?? []);

        // Init localStorage keys & load persisted data
        const auditKey = `medibook_doctor_audit_${doc.id}`;
        const clinicalKey = `medibook_clinical_store_${doc.clinic_id}_${doc.id}`;

        auditKeyRef.current = auditKey;
        clinicalKeyRef.current = clinicalKey;

        const storedAudit = safeJsonParse<AuditEvent[]>(localStorage.getItem(auditKey), []);
        const storedClinical = safeJsonParse<PatientClinicalStore>(localStorage.getItem(clinicalKey), {});

        setAuditLog(storedAudit);
        setClinicalStore(storedClinical);

        // Trust log entry (optional)
        setAuditLog((prev) => {
          const already = prev.some((e) => e.action === "Session started" && e.details.includes(doc.name));
          if (already) return prev;
          return [{ id: uid("audit"), atISO: new Date().toISOString(), actor: "System", action: "Session started", details: `Doctor portal access • ${doc.name}`, severity: "info" }, ...prev].slice(0, 220);
        });
      } catch {
        addToast("Failed to load dashboard.", "error");
      } finally {
        setDataLoading(false);
      }
    },
    [addToast]
  );

  useEffect(() => {
    if (!user?.id) return;
    void loadData(user.id);
  }, [user?.id, loadData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const clearAudit = () => {
    setAuditLog([]);
    addToast("Audit log cleared.", "success");
  };

  // ─────────────────────────────────────────────
  // RENDER STATES
  // ─────────────────────────────────────────────
  if (authLoading) return <PageLoader />;

  if (authError) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.page,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 48 }}>⚠️</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.textPrimary }}>{authError}</div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "12px 24px",
            borderRadius: 12,
            border: "none",
            background: GRAD.primary,
            color: "#fff",
            fontSize: 14,
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          Refresh Page
        </button>
      </div>
    );
  }

  if (!user) return null;
  if (dataLoading) return <PageLoader />;

  const tabMeta: Record<string, { title: string; subtitle: string }> = {
    overview: {
      title: `Welcome, ${doctor?.name || "Doctor"}`,
      subtitle: `${doctor?.specialty || ""} · ${clinic?.name || ""}`,
    },
    calendar: {
      title: "Smart Scheduling",
      subtitle: "Weekly calendar with drag-and-drop rescheduling + conflict detection",
    },
    appointments: {
      title: "My Appointments",
      subtitle: `${appointments.length} total appointments`,
    },
    patients: {
      title: "My Patients",
      subtitle: `${patients.length} patients assigned to you`,
    },
    prescriptions: {
      title: "Digital Prescriptions",
      subtitle: "Create drafts and send to patient portal or pharmacy (demo workflow)",
    },
    reminders: {
      title: "Automated Reminders",
      subtitle: "48h, 24h, 2h reminder schedule with send-now testing",
    },
    analytics: {
      title: "Clinic Analytics",
      subtitle: "Revenue, utilization, no-show rate, retention + export",
    },
    earnings: {
      title: "My Earnings",
      subtitle: "Revenue from completed appointments",
    },
    profile: {
      title: "My Profile",
      subtitle: `${doctor?.specialty || ""} · ${clinic?.name || ""}`,
    },
    security: {
      title: "Security & Compliance",
      subtitle: "Role-based access + audit logs to reduce clinic owner risk",
    },
  };

  const current = tabMeta[activeTab] ?? tabMeta.overview;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f0fafa; }
        ::-webkit-scrollbar-thumb { background: #99f6e4; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #5eead4; }
      `}</style>

      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: C.page,
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}
      >
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          doctor={doctor}
          clinic={clinic}
          onLogout={handleLogout}
        />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", minWidth: 0 }}>
          <TopBar title={current.title} subtitle={current.subtitle} doctor={doctor} />

          <div style={{ flex: 1, padding: "24px 28px", minHeight: 0 }}>
            {doctorMissing ? (
              <Card topBarGrad={GRAD.amber}>
                <SectionHeader
                  icon="⏳"
                  gradient={GRAD.amber}
                  title="Account setup pending"
                  subtitle="Your doctor profile hasn’t been created yet."
                  action={
                    <button
                      onClick={handleLogout}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 12,
                        border: "none",
                        background: "rgba(239,68,68,0.1)",
                        color: "#dc2626",
                        fontSize: 12,
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      Logout
                    </button>
                  }
                />
                <div style={{ color: C.textMuted, fontSize: 13, lineHeight: 1.7 }}>
                  Please contact your clinic admin and ask them to complete your doctor record.
                  <div style={{ marginTop: 10, fontSize: 12, color: C.textLight }}>
                    Signed in as: <span style={{ fontWeight: 900, color: C.textPrimary }}>{user.email}</span>
                  </div>
                </div>
              </Card>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={ANIM.fadeSlideUp}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  transition={{ duration: 0.22 }}
                >
                  {activeTab === "overview" && (
                    <OverviewTab appointments={appointments} patients={patients} doctor={doctor} setActiveTab={setActiveTab} />
                  )}

                  {activeTab === "calendar" && (
                    <CalendarTab
                      appointments={appointments}
                      setAppointments={setAppointments}
                      addToast={addToast}
                      onLog={logEvent}
                    />
                  )}

                  {activeTab === "appointments" && (
                    <AppointmentsTab
                      appointments={appointments}
                      setAppointments={setAppointments}
                      addToast={addToast}
                      onLog={logEvent}
                    />
                  )}

                  {activeTab === "patients" && (
                    <PatientsTab
                      patients={patients}
                      appointments={appointments}
                      clinicalStore={clinicalStore}
                      setClinicalStore={setClinicalStore}
                      addToast={addToast}
                      onLog={logEvent}
                    />
                  )}

                  {activeTab === "prescriptions" && (
                    <PrescriptionsTab
                      patients={patients}
                      clinicalStore={clinicalStore}
                      setClinicalStore={setClinicalStore}
                      addToast={addToast}
                      onLog={logEvent}
                    />
                  )}

                  {activeTab === "reminders" && (
                    <RemindersTab
                      appointments={appointments}
                      settings={reminderSettings}
                      setSettings={setReminderSettings}
                      addToast={addToast}
                      onLog={logEvent}
                    />
                  )}

                  {activeTab === "analytics" && (
                    <AnalyticsTab
                      appointments={appointments}
                      patients={patients}
                      addToast={addToast}
                    />
                  )}

                  {activeTab === "earnings" && <EarningsTab appointments={appointments} />}

                  {activeTab === "profile" && <ProfileTab doctor={doctor} clinic={clinic} user={user} />}

                  {activeTab === "security" && (
                    <SecurityTab userEmail={user.email ?? "—"} auditLog={auditLog} onClear={clearAudit} />
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}