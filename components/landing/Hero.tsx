"use client";
import React from 'react';
import { motion } from 'framer-motion';

const GRAD = {
  primary: 'linear-gradient(135deg, #1e3c7d, #2563eb)',
  hero: 'linear-gradient(135deg, #0f2347 0%, #1e3c7d 45%, #2563eb 100%)',
  green: 'linear-gradient(135deg, #059669, #10b981)',
};

export default function Hero() {
  return (
    <section style={{
      background: GRAD.hero,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      padding: '80px 20px 60px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      {/* Background decorative circles */}
      <div style={{
        position: 'absolute', top: '-100px', right: '-100px',
        width: 400, height: 400, borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-50px', left: '10%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'rgba(255,255,255,0.03)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '30%', left: '-80px',
        width: 200, height: 200, borderRadius: '50%',
        background: 'rgba(255,255,255,0.03)', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>

        {/* ── RESPONSIVE FLEX CONTAINER ── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',       /* mobile: stacks */
          alignItems: 'center',
          gap: '48px',
        }}
          className="hero-inner"
        >

          {/* LEFT: Text content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{ flex: 1, width: '100%', textAlign: 'center' }}
            className="hero-text"
          >
            {/* Trust badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 50, padding: '8px 18px',
                fontSize: 13, fontWeight: 600, color: '#fff',
                marginBottom: 24,
              }}
            >
              🏥 Trusted by 50,000+ Patients
            </motion.div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(2rem, 6vw, 3.75rem)',
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.15,
              marginBottom: 24,
              letterSpacing: '-1px',
            }}>
              Book Your Doctor in{' '}
              <span style={{ color: '#93c5fd' }}>60 Seconds</span>
            </h1>

            {/* Subheadline */}
            <p style={{
              fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.7,
              marginBottom: 36,
              maxWidth: 520,
              margin: '0 auto 36px',
            }}>
              Skip the waiting rooms. Connect with verified doctors instantly.
              Get prescriptions, medical advice, and book appointments — all from your phone.
            </p>

            {/* CTA Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              alignItems: 'center',
              marginBottom: 32,
            }}
              className="hero-cta-wrap"
            >
              <button
                onClick={() => window.location.href = '/signup'}
                style={{
                  background: GRAD.primary,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 14,
                  padding: '15px 32px',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 6px 24px rgba(37,99,235,0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                  width: '100%',
                  maxWidth: 320,
                  justifyContent: 'center',
                }}
                onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                📅 Book Appointment Now
              </button>
              <button
                onClick={() => window.location.href = '#how-it-works'}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(8px)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  color: '#fff',
                  borderRadius: 14,
                  padding: '15px 32px',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                  width: '100%',
                  maxWidth: 320,
                  justifyContent: 'center',
                }}
                onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
              >
                See How It Works
              </button>
            </div>

            {/* Trust microcopy */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px 20px',
              justifyContent: 'center',
            }}>
              {['✅ 500+ Verified Doctors', '⭐ 4.9/5 Rating', '🔒 HIPAA Secure'].map((item, i) => (
                <span key={i} style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 13,
                  fontWeight: 600,
                }}>
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          {/* RIGHT: Floating Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            style={{ width: '100%', maxWidth: 400, flex: 1 }}
          >
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 24,
              padding: '28px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            }}>
              {/* Live indicator */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 20,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 8px rgba(34,197,94,0.6)',
                  animation: 'pulse 1.5s infinite',
                }} />
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 600 }}>
                  Live Platform Stats
                </span>
              </div>

              {/* Stat numbers */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 16,
                textAlign: 'center',
              }}>
                {[
                  { value: '500+', label: 'Doctors', color: '#93c5fd' },
                  { value: '50K+', label: 'Patients', color: '#6ee7b7' },
                  { value: '4.9★', label: 'Rating', color: '#fde68a' },
                ].map((stat, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 14,
                    padding: '16px 12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    <div style={{
                      fontSize: 24, fontWeight: 900,
                      color: stat.color, lineHeight: 1,
                      marginBottom: 6,
                    }}>
                      {stat.value}
                    </div>
                    <div style={{
                      fontSize: 11, color: 'rgba(255,255,255,0.6)',
                      fontWeight: 600, textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom CTA in card */}
              <div style={{
                marginTop: 20,
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 600 }}>
                  New booking received
                </span>
                <span style={{
                  background: 'rgba(34,197,94,0.2)',
                  border: '1px solid rgba(34,197,94,0.4)',
                  color: '#6ee7b7',
                  borderRadius: 50,
                  padding: '3px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                }}>
                  AUTO-CONFIRMED ✓
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        @media (min-width: 1024px) {
          .hero-inner {
            flex-direction: row !important;
            align-items: center !important;
          }
          .hero-text {
            text-align: left !important;
          }
          .hero-text p {
            margin-left: 0 !important;
          }
          .hero-cta-wrap {
            flex-direction: row !important;
            align-items: flex-start !important;
          }
          .hero-cta-wrap button {
            width: auto !important;
            max-width: none !important;
          }
          .hero-text > div:last-child {
            justify-content: flex-start !important;
          }
        }
      `}</style>
    </section>
  );
}
