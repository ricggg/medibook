"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function TrustBar() {
  const stats = [
    { icon: '👨‍⚕️', label: 'Verified Doctors', value: '500+' },
    { icon: '📅', label: 'Appointments Completed', value: '50,000+' },
    { icon: '⭐', label: 'Average Rating', value: '4.9/5' },
    { icon: '🏙️', label: 'Cities Covered', value: '50+' },
  ];

  return (
    <section className="py-12 bg-gradient-to-r from-[#1e3c7d] to-[#2563eb]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center text-white"
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-black mb-1">{stat.value}</div>
              <div className="text-sm opacity-90 font-semibold">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}