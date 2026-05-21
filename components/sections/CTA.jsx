'use client';

import React from 'react';
import Container from '@/components/layout/Container';
import SectionWrapper from '@/components/layout/SectionWrapper';
import { Button } from '@/components/ui/button';

export default function CTA() {
  const handleScrollToAudit = (e) => {
    e.preventDefault();
    const element = document.getElementById('audit-workspace');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <SectionWrapper className="pb-20 pt-10">
      <Container>
        <div className="w-full max-w-4xl mx-auto rounded-2xl border border-border/80 bg-zinc-950/70 p-8 md:p-14 text-center select-none shadow-[0_16px_40px_-8px_rgba(0,0,0,0.6)] flex flex-col items-center relative overflow-hidden">
          
          {/* Subtle geometric grid background overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(24,24,27,0.8),transparent)] pointer-events-none" />

          <div className="relative z-10 space-y-6 max-w-2xl flex flex-col items-center">
            
            {/* CTA Category badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-[9px] font-mono font-medium text-emerald-450 uppercase">
              Immediate Diagnostics
            </div>

            {/* Headline */}
            <h3 className="text-section text-lg sm:text-2xl tracking-tight text-white max-w-lg">
              Take control of your AI margins.
            </h3>

            {/* Subheadline description */}
            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed max-w-md">
              Ingest your model execution logs locally. Flag duplicate licenses, token leaks, and rate tier anomalies in under two minutes.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto pt-2">
              <Button
                onClick={handleScrollToAudit}
                variant="default"
                size="lg"
                className="w-full sm:w-auto text-xs font-semibold px-6 h-10 gap-1.5 cursor-pointer"
              >
                Run First Audit
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-3.5 w-3.5 stroke-current stroke-[2] transition-transform group-hover/button:translate-x-0.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-xs font-semibold px-6 h-10 border-border bg-card/45 text-zinc-300 hover:text-white cursor-pointer"
              >
                Schedule Demo
              </Button>
            </div>

            {/* Micro trust-text below */}
            <div className="text-[10px] text-zinc-500 pt-1">
              No database connections required. Log files remain secure inside your browser context.
            </div>

          </div>
        </div>
      </Container>
    </SectionWrapper>
  );
}
