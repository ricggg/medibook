"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';

export default function DoctorStats() {
  const stats = [
    { label: 'Today\'s Patients', value: '12', icon: '👥', gradient: 'from-[#2563eb] to-[#818cf8]', change: '+3' },
    { label: 'Completed', value: '8', icon: '✅', gradient: 'from-[#059669] to-[#10b981]', change: '+5' },
    { label: 'Upcoming', value: '4', icon: '🕐', gradient: 'from-[#f59e0b] to-[#fbbf24]', change: '' },
    { label: 'This Month', value: '186', icon: '📊', gradient: 'from-[#7c3aed] to-[#8b5cf6]', change: '+12%' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
        >
          <Card padding="md" hover>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide mb-2">
                  {stat.label}
                </div>
                <div className="text-3xl font-black text-[var(--text-primary)] mb-1">
                  {stat.value}
                </div>
                {stat.change && (
                  <div className="text-xs font-semibold text-green-600">
                    {stat.change} from yesterday
                  </div>
                )}
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                {stat.icon}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}