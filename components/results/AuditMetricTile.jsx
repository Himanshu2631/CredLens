'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * AuditMetricTile — a single KPI cell in the summary metrics strip.
 *
 * Deliberately minimal: label on top in monospace uppercase, value large and
 * prominent, optional subtext below for context. This matches the Stripe /
 * Linear financial summary pattern — one fact per tile, nothing else.
 *
 * @param {string}  label        — All-caps mono label (e.g. "Monthly Savings")
 * @param {string}  value        — Formatted value string (e.g. "$1,240/mo")
 * @param {string}  [subtext]    — Supporting context line below the value
 * @param {string}  [valueClass] — Optional Tailwind override for value color
 * @param {string}  [className]  — Wrapper class overrides
 */
export default function AuditMetricTile({
  label,
  value,
  subtext,
  valueClass = 'text-zinc-200',
  className,
}) {
  return (
    <div className={cn('flex flex-col gap-1 p-5 select-none', className)}>
      <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase">
        {label}
      </span>
      <div className={cn('text-xl font-semibold tracking-tight tabular-nums', valueClass)}>
        {value}
      </div>
      {subtext && (
        <span className="text-[10px] text-zinc-600 leading-snug">{subtext}</span>
      )}
    </div>
  );
}
