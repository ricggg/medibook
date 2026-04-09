"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { TESTIMONIALS } from '@/lib/data';

export default function Testimonials() {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-[#0f2347] via-[#1e3c7d] to-[#2563eb]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Real stories from real patients who transformed their healthcare experience.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300"
            >
              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">⭐</span>
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-white/90 leading-relaxed mb-6 italic">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{testimonial.name}</div>
                  <div className="text-sm text-white/60">{testimonial.location}</div>
                </div>
                <div className="text-xs text-white/50">{testimonial.date}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}