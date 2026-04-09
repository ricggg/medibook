"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';

export default function PatientQueue() {
  const queue = [
    { name: 'Lisa Thompson', waitTime: '5 min', priority: 'normal' },
    { name: 'Tom Harrison', waitTime: '12 min', priority: 'normal' },
    { name: 'Rachel Martinez', waitTime: '18 min', priority: 'urgent' },
  ];

  return (
    <Card>
      {/* Section Header */}
      <div className="flex items-center gap-4 pb-4 mb-6 border-b-2 border-[var(--border-card)]">
        <div className="w-9 h-9 bg-gradient-to-br from-[#f59e0b] to-[#fbbf24] rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-lg">👥</span>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-[var(--text-section)]">Waiting Queue</h2>
          <p className="text-xs text-[var(--text-light)]">{queue.length} patients waiting</p>
        </div>
      </div>

      {/* Queue List */}
      <div className="space-y-3">
        {queue.map((patient, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              p-4 rounded-2xl border flex items-center justify-between
              ${patient.priority === 'urgent' 
                ? 'bg-red-500/10 border-red-500/30' 
                : 'bg-[var(--bg-card-elevated)] border-[var(--border-card)]'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1e3c7d] to-[#2563eb] rounded-full flex items-center justify-center text-white font-bold">
                {index + 1}
              </div>
              <div>
                <h3 className="font-bold text-[var(--text-primary)]">{patient.name}</h3>
                <p className="text-xs text-[var(--text-muted)]">Waiting: {patient.waitTime}</p>
              </div>
            </div>

            {patient.priority === 'urgent' && (
              <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                URGENT
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </Card>
  );
}