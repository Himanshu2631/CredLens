'use client';

import React from 'react';
import Container from '@/components/layout/Container';
import SectionWrapper from '@/components/layout/SectionWrapper';

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
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-[9px] font-mono font-medium text-emerald-450 uppercase select-none">
            Audit Pipeline
          </div>
          <h3 className="text-section mt-4 tracking-tight text-white">
            Audit your spend in three steps
          </h3>
          <p className="text-zinc-400 text-xs md:text-sm mt-2 max-w-lg select-none">
            A developer-first ingestion pipeline built to identify leaks instantly without exposing database credentials or security environments.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step) => (
            <div key={step.number} className="border-t border-border/60 pt-5 space-y-3">
              {/* Step number indicator */}
              <div className="text-xs font-mono font-bold text-emerald-450 uppercase tracking-wide">
                STEP {step.number}
              </div>
              <h4 className="text-xs font-semibold text-white tracking-tight">
                {step.title}
              </h4>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </Container>
    </SectionWrapper>
  );
}
