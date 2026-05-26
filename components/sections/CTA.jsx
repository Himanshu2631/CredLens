'use client';

import React from 'react';
import Container from '@/components/layout/Container';
import SectionWrapper from '@/components/layout/SectionWrapper';
import { Button } from '@/components/ui/button';
import CTACard from '@/components/ui/CTACard';
import SectionHeader from '@/components/ui/SectionHeader';

/**
 * Centered CTA section promoting the platform's immediate diagnostics.
 * Integrates reusable CTACard and SectionHeader elements.
 */
export default function CTA() {
  const handleScrollToAudit = (e) => {
    e.preventDefault();
    const element = document.getElementById('audit-workspace');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <SectionWrapper className="py-12 md:py-16">
      <Container>
        <CTACard>
          <div className="space-y-6 max-w-2xl flex flex-col items-center">
            
            {/* CTA Header Info */}
            <SectionHeader
              badge="Immediate Diagnostics"
              title="Take control of your AI margins."
              description="Run a private audit of your AI subscriptions in under two minutes. Instantly pinpoint duplicate licenses, over-allocated seats, and misaligned plan tiers."
              align="center"
              titleClassName="text-lg sm:text-2xl max-w-lg"
              descriptionClassName="max-w-md"
            />

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
            <div className="text-[11px] text-zinc-500 pt-1">
              No database connections or keys required. All audits run securely in your browser context.
            </div>

          </div>
        </CTACard>
      </Container>
    </SectionWrapper>
  );
}
