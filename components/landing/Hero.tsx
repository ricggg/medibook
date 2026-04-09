"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6 py-20">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f2347] via-[#1e3c7d] to-[#2563eb] opacity-[0.03] dark:opacity-10" />
      
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left"
        >
          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 mb-6"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-dot" />
            <span className="text-sm font-bold text-green-600">Trusted by 50,000+ Patients</span>
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl lg:text-6xl font-black text-[var(--text-primary)] leading-tight mb-6">
            Book Your Doctor in{' '}
            <span className="bg-gradient-to-r from-[#1e3c7d] to-[#2563eb] bg-clip-text text-transparent">
              60 Seconds
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg lg:text-xl text-[var(--text-muted)] mb-8 leading-relaxed max-w-xl">
            Skip the waiting rooms. Connect with verified doctors instantly. 
            Get prescriptions, medical advice, and book appointments — all from your phone.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
            <Button size="lg" onClick={() => window.location.href = '/signup'}>
              📅 Book Appointment Now
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.location.href = '#how-it-works'}>
              See How It Works
            </Button>
          </div>

          {/* Trust Microcopy */}
          <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-[var(--text-light)]">
            <div className="flex items-center gap-2">
              <span className="text-lg">✅</span>
              <span>500+ Verified Doctors</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">⭐</span>
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🔒</span>
              <span>HIPAA Secure</span>
            </div>
          </div>
        </motion.div>

        {/* Right Visual */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop"
              alt="Professional doctor consultation"
              className="w-full h-auto object-cover"
            />
            
            {/* Floating Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute bottom-8 left-8 right-8 bg-white/95 dark:bg-[#1a1a2e]/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-black bg-gradient-to-r from-[#1e3c7d] to-[#2563eb] bg-clip-text text-transparent">
                    500+
                  </div>
                  <div className="text-xs text-[var(--text-muted)] font-semibold">Doctors</div>
                </div>
                <div>
                  <div className="text-2xl font-black bg-gradient-to-r from-[#059669] to-[#10b981] bg-clip-text text-transparent">
                    50K+
                  </div>
                  <div className="text-xs text-[var(--text-muted)] font-semibold">Patients</div>
                </div>
                <div>
                  <div className="text-2xl font-black bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] bg-clip-text text-transparent">
                    4.9★
                  </div>
                  <div className="text-xs text-[var(--text-muted)] font-semibold">Rating</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}