"use client";

import React from 'react';

interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  error,
  disabled = false,
  required = false
}: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-semibold text-[var(--text-muted)] flex items-center gap-2">
          {icon && <span className="text-base">{icon}</span>}
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`
          px-4 py-3 rounded-xl border-2 bg-[var(--bg-card)] text-[var(--text-primary)]
          transition-all duration-250 outline-none text-sm
          ${error 
            ? 'border-red-500' 
            : 'border-[var(--border-card)] focus:border-[#2563eb] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.08)]'
          }
          ${disabled ? 'bg-[var(--bg-card-elevated)] cursor-not-allowed opacity-60' : ''}
        `}
      />
      {error && (
        <span className="text-xs text-red-500 font-medium">{error}</span>
      )}
    </div>
  );
}