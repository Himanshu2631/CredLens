import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Reusable screenshot-grade visual card frame.
 * Wraps mock telemetry logs, seats, or shared interfaces with consistent borders, backgrounds, and shadows.
 */
export default function MockCard({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "w-full max-w-md rounded-xl border border-border bg-zinc-950/70 p-5 select-none shadow-[0_8px_24px_rgba(0,0,0,0.5)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
