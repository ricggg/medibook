"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import { MEDICAL_RECORDS } from '@/lib/data';

export default function MedicalHistory() {
  return (
    <Card>
      {/* Section Header */}
      <div className="flex items-center gap-4 pb-4 mb-6 border-b-2 border-[var(--border-card)]">
        <div className="w-9 h-9 bg-gradient-to-br from-[#7c3aed] to-[#8b5cf6] rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-lg">📋</span>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-[var(--text-section)]">Medical History</h2>
          <p className="text-xs text-[var(--text-light)]">Your past consultations and records</p>
        </div>
        <button className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-white rounded-lg hover:shadow-lg transition-all">
          Download All
        </button>
      </div>

      {/* Records Timeline */}
      <div className="space-y-6">
        {MEDICAL_RECORDS.map((record, index) => (
          <motion.div
            key={record.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-8 pb-6 border-l-2 border-[var(--border-card)] last:border-l-0 last:pb-0"
          >
            {/* Timeline Dot */}
            <div className="absolute -left-2 top-1 w-4 h-4 bg-gradient-to-br from-[#7c3aed] to-[#8b5cf6] rounded-full border-2 border-[var(--bg-card)]" />

            {/* Record Card */}
            <div className="p-5 rounded-2xl bg-[var(--bg-card-elevated)] border border-[var(--border-card)] hover:shadow-md transition-all">
              {/* Date & Doctor */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs text-[var(--text-muted)] mb-1">
                    {new Date(record.date).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                  <h3 className="font-bold text-[var(--text-primary)]">{record.doctor}</h3>
                </div>
                <button className="px-3 py-1 text-xs font-bold text-[#7c3aed] border border-[#7c3aed] rounded-lg hover:bg-[#7c3aed] hover:text-white transition-all">
                  View Full
                </button>
              </div>

              {/* Details */}
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide mb-1">
                    Diagnosis
                  </div>
                  <p className="text-[var(--text-primary)]">{record.diagnosis}</p>
                </div>

                <div>
                  <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide mb-1">
                    Prescription
                  </div>
                  <p className="text-[var(--text-primary)] font-mono text-xs bg-[var(--bg-card)] px-3 py-2 rounded-lg border border-[var(--border-card)]">
                    {record.prescription}
                  </p>
                </div>

                <div>
                  <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide mb-1">
                    Doctor's Notes
                  </div>
                  <p className="text-[var(--text-muted)] text-xs">{record.notes}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {MEDICAL_RECORDS.length === 0 && (
        <div className="text-center py-12 text-[var(--text-muted)]">
          <p className="text-4xl mb-2">📋</p>
          <p className="font-semibold">No medical history yet</p>
          <p className="text-sm">Your consultation records will appear here</p>
        </div>
      )}
    </Card>
  );
}