"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'appointments', icon: '📅', label: 'Appointments' },
    { id: 'book', icon: '➕', label: 'Book Appointment' },
    { id: 'history', icon: '📋', label: 'Medical History' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <div className="w-64 min-h-screen bg-gradient-to-b from-[#0f2347] via-[#1e3c7d] to-[#0f2347] p-6 flex flex-col">
      {/* Logo */}
      <div className="mb-10">
        <h1 className="text-2xl font-black text-white mb-1">🏥 MediBook</h1>
        <p className="text-xs text-white/50 uppercase tracking-wider">Patient Portal</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item, index) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setActiveTab(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-white/15 text-white font-bold border-l-3 border-l-[#ffd700] shadow-lg' 
                  : 'text-white/75 hover:bg-white/10 hover:translate-x-1.5'
                }
              `}
            >
              <span className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto pt-6 border-t border-white/10">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/75 hover:bg-white/10 transition-all">
          <span className="text-xl">⚙️</span>
          <span>Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/75 hover:bg-white/10 transition-all mt-2">
          <span className="text-xl">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}