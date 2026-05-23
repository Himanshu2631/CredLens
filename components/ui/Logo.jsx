import React from 'react';
import Link from 'next/link';

/**
 * Reusable brand logo mark for CredLens.
 * Renders a custom lens focus grid representing AI spend auditing.
 */
export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group select-none">
      <div className="relative flex h-6 w-6 items-center justify-center rounded-md bg-zinc-950 border border-zinc-800 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_1px_2px_rgba(0,0,0,0.4)] group-hover:border-zinc-700 transition-all duration-200">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-3.5 w-3.5 stroke-zinc-200 stroke-[1.8] group-hover:stroke-emerald-400 group-hover:rotate-45 transition-all duration-300"
        >
          <circle cx="12" cy="12" r="8" className="opacity-30" />
          <path d="M12 4v16" strokeDasharray="2 2" className="opacity-60" />
          <path d="M4 12h16" strokeDasharray="2 2" className="opacity-60" />
          <circle cx="12" cy="12" r="3.5" className="fill-zinc-950 stroke-zinc-200 group-hover:stroke-emerald-400 group-hover:fill-emerald-950/20 transition-all duration-200" />
        </svg>
      </div>
      <span className="font-semibold text-xs tracking-tight text-white transition-opacity group-hover:opacity-90">
        CredLens
      </span>
    </Link>
  );
}
