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
      title: 'Configure Stack Profile',
      description: 'Select your team’s active AI subscriptions, developer tools, and seat counts. No code integrations or database permissions are required.'
    },
    {
      number: '02',
      title: 'Identify Plan Redundancy',
      description: 'Our cost intelligence engine evaluates your tools against active pricing models to pinpoint seat overlaps and misaligned subscription tiers.'
    },
    {
      number: '03',
      title: 'Optimize and Recover',
      description: 'Follow the generated recommendations to prune seat allocations, cancel duplicate services, and export shareable reports for your finance team.'
    }
  ];

  return (
    <SectionWrapper className="border-b border-border/30 bg-zinc-950/15 py-20 md:py-24">
      <Container className="space-y-16">
        
        {/* Section Title Header */}
        <SectionHeader
          badge="Audit Workflow"
          title="Optimize your spend in three steps"
          description="A private, browser-based workflow designed to instantly identify software waste without exposing developer credentials or keys."
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
