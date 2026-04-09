"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function QuickActions() {
  const actions = [
    { icon: '🩺', label: 'Book Checkup', color: 'from-[#2563eb] to-[#818cf8]' },
    { icon: '💊', label: 'Refill Prescription', color: 'from-[#059669] to-[#10b981]' },
    { icon: '📞', label: 'Emergency Call', color: 'from-[#ef4444] to-[#f87171]' },
    { icon: '📄', label: 'Lab Results', color: 'from-[#7c3aed] to-[#8b5cf6]' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className={`relative p-6 rounded-2xl bg-gradient-to-br ${action.color} text-white shadow-lg hover:shadow-xl transition-all overflow-hidden group`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full blur-2xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center">
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{action.icon}</div>
            <div className="font-bold text-sm">{action.label}</div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}