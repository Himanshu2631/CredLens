'use client';

import React from 'react';
import Container from '@/components/layout/Container';

export default function SocialProof() {
  return (
    <section className="py-10 border-b border-border/30 bg-zinc-950/10">
      <Container className="flex flex-col items-center">
        
        {/* Muted category label */}
        <h2 className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase select-none text-center">
          Ingesting spend telemetry for high-growth tech teams
        </h2>

        {/* Partners Logotypes Grid */}
        <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-6 mt-7 text-zinc-500 select-none">
          
          {/* Logo 1: Aether */}
          <div className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors duration-200 cursor-default">
            <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5 stroke-current stroke-[2]">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
            </svg>
            <span className="font-semibold text-xs tracking-wider uppercase font-sans">Aether</span>
          </div>

          {/* Logo 2: Orbit */}
          <div className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors duration-200 cursor-default">
            <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5 stroke-current stroke-[2]">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="font-semibold text-xs tracking-wider uppercase font-sans">Orbit</span>
          </div>

          {/* Logo 3: Apex */}
          <div className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors duration-200 cursor-default">
            <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5 stroke-current stroke-[2.2]">
              <path d="M3 20h18L12 4z" />
            </svg>
            <span className="font-semibold text-xs tracking-wider uppercase font-sans">Apex</span>
          </div>

          {/* Logo 4: Retrace */}
          <div className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors duration-200 cursor-default">
            <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5 stroke-current stroke-[2]" strokeLinecap="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span className="font-semibold text-xs tracking-wider uppercase font-sans">Retrace</span>
          </div>

          {/* Logo 5: Clarity */}
          <div className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors duration-200 cursor-default">
            <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5 stroke-current stroke-[2]">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M21 12H3" />
            </svg>
            <span className="font-semibold text-xs tracking-wider uppercase font-sans">Clarity</span>
          </div>

        </div>

      </Container>
    </section>
  );
}
