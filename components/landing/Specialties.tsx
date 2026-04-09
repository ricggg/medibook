"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { SPECIALTIES } from '@/lib/data';

export default function Specialties() {
  return (
    <section className="py-20 px-6 bg-[var(--bg-page)]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-4">
            Browse by Specialty
          </h2>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            Find the right specialist for your health needs from our network of verified doctors.
          </p>
        </motion.div>

        {/* Specialties Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SPECIALTIES.map((specialty, index) => (
            <motion.button
              key={specialty.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {specialty.icon}
              </div>
              <h3 className="font-bold text-[var(--text-primary)] mb-1 text-sm">
                {specialty.name}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {specialty.count} doctors
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}