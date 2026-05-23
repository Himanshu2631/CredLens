import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Reusable Badge component for categorizing labels and showing platform statuses.
 * Supports three design variants (default emerald, muted gray, and success border indicator).
 */
export default function Badge({
  children,
  variant = 'default', // 'default' | 'muted' | 'success'
  dot = false,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border select-none transition-colors duration-150",
        // Variants
        variant === 'default' && "border-border bg-card px-2.5 py-0.5 text-[9px] font-mono font-medium text-emerald-400 uppercase",
        variant === 'muted' && "border-border bg-card/60 px-3 py-1 text-[11px] font-medium text-zinc-400",
        variant === 'success' && "bg-emerald-950/25 border-emerald-900/35 px-2 py-0.5 text-[9px] font-medium text-emerald-400 uppercase",
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "flex h-1.5 w-1.5 rounded-full bg-emerald-500",
            variant === 'muted' ? "animate-pulse" : ""
          )}
        />
      )}
      {children}
    </div>
  );
}
