"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    {
      icon: '🔍',
      title: 'Search Doctor',
      description: 'Browse 500+ verified doctors by specialty, location, or availability'
    },
    {
      icon: '📅',
      title: 'Book Instantly',
      description: 'Choose a time slot that works for you and confirm in seconds'
    },
    {
      icon: '💬',
      title: 'Get Treated',
      description: 'Video or in-person consultation, prescription, and follow-up care'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-6 bg-[var(--bg-page)]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-4">
            Healthcare Made Simple
          </h2>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            Book appointments with top doctors in just 3 easy steps. No phone calls, no paperwork.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[#2563eb] to-transparent" />
              )}

              {/* Card */}
              <div className="relative bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-br from-[#1e3c7d] to-[#2563eb] rounded-full flex items-center justify-center text-white font-black shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#1e3c7d] to-[#2563eb] rounded-2xl flex items-center justify-center text-4xl shadow-lg">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">
                  {step.title}
                </h3>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}