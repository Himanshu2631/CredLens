import React from 'react';
import { cn } from '@/lib/utils';

/**
 * ProviderIcon — lightweight icon wrapper for AI tool/provider logos.
 *
 * Uses handcrafted SVG mark approximations rather than external image assets
 * to avoid network dependencies and keep bundle size clean.
 *
 * Supported providers:
 *   openai, anthropic, cursor, copilot, gemini,
 *   openai_api, anthropic_api, v0_dev, all (generic)
 */
export default function ProviderIcon({ provider, className }) {
  const base = 'flex h-7 w-7 items-center justify-center rounded-lg border bg-zinc-900 border-zinc-800 shrink-0 select-none';

  // OpenAI / ChatGPT
  if (provider === 'openai' || provider === 'chatgpt') {
    return (
      <div className={cn(base, 'text-emerald-300', className)}>
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current stroke-[1.8]">
          <circle cx="12" cy="12" r="8" className="opacity-25" />
          <path d="M12 2v20M2 12h20" strokeDasharray="1.5 2" />
          <circle cx="12" cy="12" r="3" className="fill-zinc-950 stroke-current" />
        </svg>
      </div>
    );
  }

  // Anthropic / Claude
  if (provider === 'anthropic' || provider === 'claude' || provider === 'anthropic_api') {
    return (
      <div className={cn(base, 'text-orange-300', className)}>
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current stroke-[1.8]">
          <path d="M4 20L12 4l8 16M6 16h12" />
        </svg>
      </div>
    );
  }

  // Cursor
  if (provider === 'cursor') {
    return (
      <div className={cn(base, 'text-sky-300', className)}>
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current stroke-[1.8]">
          <path d="M5 3l14 9-8 2-3 8L5 3z" />
        </svg>
      </div>
    );
  }

  // GitHub Copilot
  if (provider === 'copilot') {
    return (
      <div className={cn(base, 'text-zinc-200', className)}>
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current stroke-[1.8]">
          <circle cx="12" cy="8" r="4" />
          <path d="M8 14c-3 1-5 3-5 5h18c0-2-2-4-5-5" />
          <path d="M9 8h6" strokeDasharray="1 1" />
        </svg>
      </div>
    );
  }

  // Gemini / Google
  if (provider === 'gemini') {
    return (
      <div className={cn(base, 'text-sky-300', className)}>
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current stroke-[1.8]">
          <path d="M12 2C6 6 6 10 12 12C18 10 18 6 12 2z" />
          <path d="M12 22C6 18 6 14 12 12C18 14 18 18 12 22z" />
        </svg>
      </div>
    );
  }

  // OpenAI API (distinct from chat product)
  if (provider === 'openai_api') {
    return (
      <div className={cn(base, 'text-emerald-400', className)}>
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current stroke-[1.8]">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>
    );
  }

  // v0.dev
  if (provider === 'v0_dev') {
    return (
      <div className={cn(base, 'text-teal-300', className)}>
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current stroke-[1.8]">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M7 8h10M7 12h7M7 16h5" />
        </svg>
      </div>
    );
  }

  // "all" — generic multi-tool icon
  if (provider === 'all') {
    return (
      <div className={cn(base, 'text-zinc-400', className)}>
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current stroke-[1.8]">
          <circle cx="8" cy="8" r="3" />
          <circle cx="16" cy="8" r="3" />
          <circle cx="12" cy="16" r="3" />
          <path d="M11 8h2M10.5 11l-2 3M13.5 11l2 3" strokeDasharray="1 1" />
        </svg>
      </div>
    );
  }

  // Default fallback
  return (
    <div className={cn(base, 'text-zinc-500', className)}>
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current stroke-[1.8]">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
  );
}
