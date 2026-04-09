"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = 'button'
}: ButtonProps) {
  const baseStyles = "font-bold transition-all duration-200 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-gradient-to-br from-[#1e3c7d] to-[#2563eb] text-white shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_30px_rgba(37,99,235,0.45)] hover:-translate-y-0.5",
    outline: "bg-transparent border-2 border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb] hover:text-white",
    ghost: "bg-transparent text-[#2563eb] hover:bg-[#2563eb]/10"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3.5 text-base rounded-[14px]",
    lg: "px-8 py-4 text-lg rounded-[16px]"
  };

  const disabledStyles = disabled || loading
    ? "opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none"
    : "";

  return (
    <motion.button
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabledStyles}
      `}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </motion.button>
  );
}