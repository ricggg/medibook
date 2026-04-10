"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  gradient?: boolean;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Card({
  children,
  gradient = true,
  hover = true,
  padding = 'md',
  className = ''
}: CardProps) {
  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={hover ? { y: -3 } : {}}
      className={`
        relative bg-[var(--bg-card)] border border-[var(--border-card)] rounded-[20px]
        shadow-[0_6px_30px_rgba(0,0,0,0.06)]
        dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)]
        transition-all duration-300
        ${hover ? 'hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)]' : ''}
        ${paddings[padding]}
        ${className}
      `}
    >
      {gradient && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1e3c7d] via-[#2563eb] to-[#818cf8] rounded-t-[20px]" />
      )}
      {children}
    </motion.div>
  );
}

