'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * ImpactBadge — color-coded priority indicator for audit recommendations.
 * 
 * Variants intentionally use restrained tints rather than saturated colors
 * to stay readable against the dark card background without looking alarming.
 * 
 * @param {'High' | 'Medium' | 'Low'} impact
 */
export default function ImpactBadge({ impact = 'Low', className }) {
  const styles = {
    High: 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40',
    Medium: 'bg-amber-950/20 text-amber-400/80 border-amber-900/30',
    Low: 'bg-zinc-900/60 text-zinc-500 border-zinc-800/60',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-mono font-medium uppercase tracking-wider border',
        styles[impact] || styles.Low,
        className
      )}
    >
      {impact}
    </span>
  );
}
