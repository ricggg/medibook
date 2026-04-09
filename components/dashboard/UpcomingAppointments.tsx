"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import StatusPill from '../ui/StatusPill';
import { APPOINTMENTS } from '@/lib/data';

export default function UpcomingAppointments() {
  return (
    <Card>
      {/* Section Header */}
      <div className="flex items-center gap-4 pb-4 mb-6 border-b-2 border-[var(--border-card)]">
        <div className="w-9 h-9 bg-gradient-to-br from-[#1e3c7d] to-[#2563eb] rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-lg">📅</span>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-[var(--text-section)]">Upcoming Appointments</h2>
          <p className="text-xs text-[var(--text-light)]">Your scheduled consultations</p>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {APPOINTMENTS.map((apt, index) => (
          <motion.div
            key={apt.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--bg-card-elevated)] border border-[var(--border-card)] hover:shadow-md transition-all"
          >
            {/* Doctor Image */}
            <img
              src={apt.doctorImage}
              alt={apt.doctorName}
              className="w-14 h-14 rounded-xl object-cover border-2 border-[#2563eb]"
            />

            {/* Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">{apt.doctorName}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{apt.specialty}</p>
                </div>
                <StatusPill status={apt.status} />
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
                <div className="flex items-center gap-1.5">
                  <span>📅</span>
                  <span>{new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>🕐</span>
                  <span>{apt.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>🏥</span>
                  <span>{apt.hospital}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                <button className="px-4 py-1.5 text-xs font-bold bg-gradient-to-r from-[#1e3c7d] to-[#2563eb] text-white rounded-lg hover:shadow-lg transition-all">
                  Join Video Call
                </button>
                <button className="px-4 py-1.5 text-xs font-bold text-[#2563eb] border border-[#2563eb] rounded-lg hover:bg-[#2563eb] hover:text-white transition-all">
                  Reschedule
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {APPOINTMENTS.length === 0 && (
          <div className="text-center py-8 text-[var(--text-muted)]">
            <p className="text-4xl mb-2">📅</p>
            <p className="font-semibold">No upcoming appointments</p>
            <p className="text-sm">Book your first consultation to get started</p>
          </div>
        )}
      </div>
    </Card>
  );
}