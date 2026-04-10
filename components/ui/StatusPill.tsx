"use client";

import React from 'react';

interface StatusPillProps {
  status: 'upcoming' | 'completed' | 'cancelled' | 'active';
  showDot?: boolean;
}

export default function StatusPill({ status, showDot = true }: StatusPillProps) {
  const styles = {
    upcoming: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-600',
      dot: 'bg-blue-500'
    },
    completed: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-600',
      dot: 'bg-green-500'
    },
    cancelled: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-600',
      dot: 'bg-red-500'
    },
    active: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-600',
      dot: 'bg-emerald-500'
    }
  };

  const style = styles[status];

  return (
    <div className={`
      inline-flex items-center gap-2 px-3 py-1 rounded-full border
      ${style.bg} ${style.border} ${style.text}
      text-[10px] font-bold uppercase tracking-wide
    `}>
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse-dot`} />
      )}
      {status}
    </div>
  );
}
