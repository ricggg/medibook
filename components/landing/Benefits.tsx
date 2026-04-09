"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function Benefits() {
  const benefits = [
    {
      icon: '⚡',
      gradient: 'from-[#f59e0b] to-[#fbbf24]',
      title: 'Instant Booking',
      description: 'Book appointments in under 60 seconds. No more waiting on hold or playing phone tag with clinics.'
    },
    {
      icon: '🔒',
      gradient: 'from-[#059669] to-[#10b981]',
      title: 'HIPAA Secure',
      description: 'Your medical data is encrypted with bank-level security. We\'re fully HIPAA compliant and audited.'
    },
    {
      icon: '💰',
      gradient: 'from-[#2563eb] to-[#818cf8]',
      title: 'Transparent Pricing',
      description: 'See consultation fees upfront. No hidden charges. Insurance accepted for eligible appointments.'
    },
    {
      icon: '📱',
      gradient: 'from-[#7c3aed] to-[#8b5cf6]',
      title: 'Video Consultations',
      description: 'Consult with doctors from home via secure video calls. Perfect for follow-ups and minor concerns.'
    },
    {
      icon: '📋',
      gradient: 'from-[#0891b2] to-[#06b6d4]',
      title: 'Digital Records',
      description: 'Access your prescriptions, lab reports, and medical history anytime from your dashboard.'
    },
    {
      icon: '🔔',
      gradient: 'from-[#ef4444] to-[#f87171]',
      title: 'Smart Reminders',
      description: 'Never miss an appointment with SMS and email reminders 24 hours and 1 hour before.'
    }
  ];

  return (
    <section className="py-20 px-6 bg-[var(--bg-card-elevated)]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-4">
            Why Patients Love MediBook
          </h2>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            Modern healthcare designed around your life, not waiting rooms.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group relative bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Top Gradient Bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${benefit.gradient} rounded-t-2xl`} />

              {/* Icon */}
              <div className={`w-14 h-14 bg-gradient-to-br ${benefit.gradient} rounded-xl flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                {benefit.icon}
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}