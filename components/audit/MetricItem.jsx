import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Reusable layout item representing a single metric column/block in a financial overview.
 * Renders a label, dynamic value text, and supporting subtext/highlights.
 */
export default function MetricItem({
  label,
  value,
  subtext,
  valueClassName = '',
  className = ''
}) {
  return (
    <div className={cn("p-5 md:p-6 space-y-1 select-none", className)}>
      <span className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase">
        {label}
      </span>
      <div
        className={cn(
          "text-lg md:text-xl font-semibold text-zinc-200",
          valueClassName
        )}
      >
        {value}
      </div>
      <div className="text-[11px] text-zinc-500 block leading-snug">
        {subtext}
      </div>
    </div>
  );
}
