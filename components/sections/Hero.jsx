'use client';

import React from 'react';
import Container from '@/components/layout/Container';
import SectionWrapper from '@/components/layout/SectionWrapper';
import { Button } from '@/components/ui/button';
import AuditPreviewCard from '@/components/audit/AuditPreviewCard';
import Badge from '@/components/ui/Badge';

export default function Hero() {
  const handleScrollToAudit = (e) => {
    e.preventDefault();
    const element = document.getElementById('audit-workspace');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToRules = (e) => {
    e.preventDefault();
    const element = document.getElementById('rules-catalog');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <SectionWrapper className="pb-16 pt-16 md:pt-24 border-b border-border/40 bg-zinc-950/20">
      <Container className="flex flex-col items-center text-center">
        
        {/* Sleek top badge representing engine status */}
        <Badge variant="muted" dot>
          AI Spend Optimization Engine
        </Badge>

        {/* Headline - structured with clamped size text-hero */}
        <h1 className="text-hero max-w-3xl mt-6 tracking-tight">
          Audit your AI subscriptions.<br />
          Identify unnecessary API spend.
        </h1>

        {/* Supporting Subheadline */}
        <p className="text-zinc-400 text-sm md:text-base font-normal leading-relaxed max-w-xl mt-4 select-none">
          Most startups overspend by 30% on redundant LLM seats and ghost API keys. CredLens analyzes execution logs to pinpoint optimizations and extend your runway—no credentials required.
        </p>

        {/* CTA Area */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 w-full sm:w-auto">
          <Button
            onClick={handleScrollToAudit}
            variant="default"
            size="lg"
            className="w-full sm:w-auto text-xs font-medium px-6 h-10 gap-2 cursor-pointer"
          >
            Start Cost Audit
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
            onClick={handleScrollToRules}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto text-xs font-medium px-6 h-10 border-border bg-card/45 text-zinc-300 hover:text-white cursor-pointer"
          >
            View Saving Rules
          </Button>
        </div>

        {/* Trust-focused supporting text */}
        <div className="flex items-center gap-2 mt-5 text-xs text-zinc-500 select-none">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-3.5 w-3.5 stroke-zinc-500 stroke-[1.8]"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l7-2a1 1 0 0 1 .48 0l7 2A1 1 0 0 1 20 6z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>100% private. Audits run entirely inside your browser.</span>
        </div>

        {/* Audit Report Preview Card */}
        <div className="mt-12 md:mt-16 w-full animate-fade-in">
          <AuditPreviewCard />
        </div>

      </Container>
    </SectionWrapper>
  );
}
