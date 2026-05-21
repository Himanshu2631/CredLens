import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Reusable centered conversion card container.
 * Features a subtle top-radial gradient overlay and deep shadows.
 */
export default function CTACard({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "w-full max-w-4xl mx-auto rounded-2xl border border-border/80 bg-zinc-950/70 p-8 md:p-14 text-center select-none shadow-[0_16px_40px_-8px_rgba(0,0,0,0.6)] flex flex-col items-center relative overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Subtle geometric grid background overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(24,24,27,0.8),transparent)] pointer-events-none" />
      <div className="relative z-10 w-full flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}
