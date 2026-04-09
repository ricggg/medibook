"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import StatusPill from '../ui/StatusPill';

export default function TodaySchedule() {
  const schedule = [
    { time: '09:00 AM', patient: 'Sarah Johnson', reason: 'Annual Checkup', status: 'completed' as const },
    { time: '09:30 AM', patient: 'Michael Chen', reason: 'Follow-up Consultation', status: 'completed' as const },
    { time: '10:00 AM', patient: 'Emily Rodriguez', reason: 'Prescription Refill', status: 'completed' as const },
    { time: '10:30 AM', patient: 'David Kim', reason: 'New Patient Visit', status: 'active' as const },
    { time: '11:00 AM', patient: 'Lisa Thompson', reason: 'Lab Results Review', status: 'upcoming' as const },
    { time: '11:30 AM', patient: 'Tom Harrison', reason: 'Dermatology Consult', status: 'upcoming' as const },
  ];

  return (
    <Card>
      {/* Section Header */}
      <div className="flex items-center gap-4 pb-4 mb-6 border-b-2 border-[var(--border-card)]">
        <div className="w-9 h-9 bg-gradient-to-br from-[#1e3c7d] to-[#2563eb] rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-lg">📅</span>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-[var(--text-section)]">Today's Schedule</h2>
          <p className="text-xs text-[var(--text-light)]">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Schedule List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {schedule.map((apt, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              p-4 rounded-2xl border transition-all
              ${apt.status === 'active' 
                ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 shadow-md' 
                : 'bg-[var(--bg-card-elevated)] border-[var(--border-card)] hover:shadow-md'
              }
            `}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-xs font-bold text-[var(--text-muted)]">
                    {apt.time.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-[var(--text-light)]">
                    {apt.time.split(' ')[1]}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">{apt.patient}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{apt.reason}</p>
                </div>
              </div>
              <StatusPill status={apt.status} />
            </div>

            {apt.status === 'active' && (
              <div className="flex gap-2 mt-3">
                <button className="flex-1 px-4 py-2 text-xs font-bold bg-gradient-to-r from-[#059669] to-[#10b981] text-white rounded-lg hover:shadow-lg transition-all">
                  Start Consultation
                </button>
                <button className="px-4 py-2 text-xs font-bold text-[#2563eb] border border-[#2563eb] rounded-lg hover:bg-[#2563eb] hover:text-white transition-all">
                  View Chart
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </Card>
  );
}