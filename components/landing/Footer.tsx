"use client";

import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-card)] border-t border-[var(--border-card)] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-black bg-gradient-to-r from-[#1e3c7d] to-[#2563eb] bg-clip-text text-transparent mb-3">
              🏥 MediBook
            </h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Modern healthcare booking platform connecting patients with verified doctors.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-[var(--text-primary)] mb-3 text-sm uppercase tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li><a href="#" className="hover:text-[#2563eb] transition-colors">Find Doctors</a></li>
              <li><a href="#" className="hover:text-[#2563eb] transition-colors">Specialties</a></li>
              <li><a href="#" className="hover:text-[#2563eb] transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-[#2563eb] transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* For Doctors */}
          <div>
            <h4 className="font-bold text-[var(--text-primary)] mb-3 text-sm uppercase tracking-wide">
              For Doctors
            </h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li><a href="#" className="hover:text-[#2563eb] transition-colors">Join Network</a></li>
              <li><a href="#" className="hover:text-[#2563eb] transition-colors">Doctor Dashboard</a></li>
              <li><a href="#" className="hover:text-[#2563eb] transition-colors">Resources</a></li>
              <li><a href="#" className="hover:text-[#2563eb] transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-[var(--text-primary)] mb-3 text-sm uppercase tracking-wide">
              Contact
            </h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li>📧 support@medibook.com</li>
              <li>📞 1-800-MEDIBOOK</li>
              <li>📍 San Francisco, CA</li>
              <li>🕐 24/7 Support</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--border-card)] pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[var(--text-muted)]">
          <p>© 2024 MediBook. All rights reserved. HIPAA Compliant.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#2563eb] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#2563eb] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#2563eb] transition-colors">HIPAA Notice</a>
          </div>
        </div>
      </div>
    </footer>
  );
}