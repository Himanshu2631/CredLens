import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Reusable AI provider icon wrapper.
 * Displays lightweight handcrafted SVG logo marks for OpenAI, Anthropic, and other tools.
 */
export default function ProviderIcon({ provider, className }) {
  if (provider === 'openai') {
    return (
      <div
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 shrink-0 select-none",
          className
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current stroke-[1.8]">
          <circle cx="12" cy="12" r="8" className="opacity-30" />
          <path d="M12 2v20M2 12h20" strokeDasharray="1 1" />
          <circle cx="12" cy="12" r="3" className="fill-zinc-950 stroke-current" />
        </svg>
      </div>
    );
  }
  
  if (provider === 'anthropic') {
    return (
      <div
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-250 shrink-0 select-none",
          className
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current stroke-[1.8]">
          <path d="M4 20L12 4l8 16M6 16h12" />
        </svg>
      </div>
    );
  }
  
  // Default / Midjourney or general subscription
  return (
    <div
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0 select-none",
        className
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current stroke-[1.8]">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
  );
}
