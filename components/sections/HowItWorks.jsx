'use client';

import React from 'react';
import Container from '@/components/layout/Container';
import SectionWrapper from '@/components/layout/SectionWrapper';
import SectionHeader from '@/components/ui/SectionHeader';

/**
 * HowItWorks section detailing the 3-step process of auditing AI costs.
 * Integrates the reusable SectionHeader component.
 */
export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Upload log telemetry',
      description: 'Drag and drop your model API execution logs or subscription CSV sheets. All files are parsed locally using WebAssembly—no backend data collection occurs.'
    },
    {
      number: '02',
      title: 'Analyze cost leaks',
      description: 'Our rules engine audits your files for seat overlapping, latent token thread leaks, and recursive api loops. Diagnostics are ready in under ten seconds.'
    },
    {
      number: '03',
      title: 'Optimize and share',
      description: 'Apply the generated savings checklists to prune license pools, fix code loops, and share read-only markdown audit logs with your growth team.'
    }
  ];

  return (
    <SectionWrapper className="border-b border-border/30 bg-zinc-950/15">
      <Container className="space-y-16">
        
        {/* Section Title Header */}
        <SectionHeader
          badge="Audit Pipeline"
          title="Audit your spend in three steps"
          description="A developer-first ingestion pipeline built to identify leaks instantly without exposing database credentials or security environments."
          descriptionClassName="select-none max-w-lg mt-2"
        />

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step) => (
            <div key={step.number} className="border-t border-border/60 pt-5 space-y-3">
              {/* Step number indicator */}
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wide">
                STEP {step.number}
              </div>
              <h4 className="text-xs font-semibold text-white tracking-tight">
                {step.title}
              </h4>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </Container>
    </SectionWrapper>
  );
}
