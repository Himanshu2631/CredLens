'use client';

import React from 'react';
import Container from '@/components/layout/Container';
import SectionWrapper from '@/components/layout/SectionWrapper';
import FeatureRow from './FeatureRow';
import MockCard from '@/components/ui/MockCard';

/**
 * Features section highlighting the platform's cost telemetry, seat auditing, and reporting.
 * Utilizes reusable FeatureRow layouts and MockCard containers.
 */
export default function Features() {
  return (
    <SectionWrapper className="border-b border-border/30 bg-zinc-950/25 py-12 md:py-16">
      <Container className="space-y-12 lg:space-y-16">

        {/* Feature 1: Spend Visibility & Optimization Insights (Merged) */}
        <FeatureRow
          badge="01 · Spend & Optimization"
          title="Detect waste, optimize tiers, and recover savings"
          description="Instantly audit active AI seat assignments and API usage patterns to detect cost redundancies."
          visual={
            <MockCard>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4 select-none">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">AI Spend Distribution</span>
                <span className="text-[9.5px] font-mono text-zinc-400">Total Run-rate: $14,240/mo</span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full rounded-full overflow-hidden bg-zinc-900 border border-zinc-800/60 flex p-[1px] mb-4 select-none">
                <div className="bg-zinc-300 h-full rounded-l-full" style={{ width: '58%' }} />
                <div className="bg-zinc-600 h-full rounded-r-full -ml-[1px]" style={{ width: '42%' }} />
              </div>

              {/* Legends */}
              <div className="grid grid-cols-2 gap-4 mb-4 select-none">
                <div className="flex flex-col">
                  <span className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                    Subscriptions
                  </span>
                  <span className="text-xs font-semibold text-zinc-200 mt-0.5">$8,260/mo</span>
                </div>
                <div className="flex flex-col">
                  <span className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                    API Volumetrics
                  </span>
                  <span className="text-xs font-semibold text-zinc-200 mt-0.5">$5,980/mo</span>
                </div>
              </div>

              <div className="border-t border-border/30 my-4" />

              {/* Optimization Insights Header */}
              <div className="flex items-center justify-between pb-3 mb-3 select-none">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Active Optimization Insights</span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-1.5 py-0.5 rounded">
                  3 Issues Surfaced
                </span>
              </div>

              {/* Insight List */}
              <div className="space-y-2 select-none">
                {/* Item 1 */}
                <div className="flex items-center justify-between gap-3 p-2 rounded border border-border/20 bg-zinc-950/40 hover:border-zinc-800 transition-colors">
                  <div className="min-w-0">
                    <div className="text-[11.5px] font-semibold text-zinc-200 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                      Duplicate Coding Assistants
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                      Cursor & GitHub Copilot active simultaneously
                    </p>
                  </div>
                  <div className="text-[10px] font-mono font-semibold text-red-400 shrink-0">
                    -$190/mo
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex items-center justify-between gap-3 p-2 rounded border border-border/20 bg-zinc-950/40 hover:border-zinc-800 transition-colors">
                  <div className="min-w-0">
                    <div className="text-[11.5px] font-semibold text-zinc-200 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      Oversized Team Tiers
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                      Workspace plan exceeds active seat baseline
                    </p>
                  </div>
                  <div className="text-[10px] font-mono font-semibold text-amber-400 shrink-0">
                    -$60/mo
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex items-center justify-between gap-3 p-2 rounded border border-border/20 bg-zinc-950/40 hover:border-zinc-800 transition-colors">
                  <div className="min-w-0">
                    <div className="text-[11.5px] font-semibold text-zinc-200 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                      Unused Premium Plans
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                      Enterprise subscriptions with zero engagement
                    </p>
                  </div>
                  <div className="text-[10px] font-mono font-semibold text-zinc-400 shrink-0">
                    -$150/mo
                  </div>
                </div>
              </div>

              <div className="border-t border-border/30 my-4" />

              {/* Footer */}
              <div className="flex justify-between items-center text-[10px] font-mono select-none">
                <span className="text-zinc-500">Recoverable Cost Run-rate</span>
                <span className="text-emerald-400 font-semibold text-xs">$400/mo</span>
              </div>
            </MockCard>
          }
        >
          {/* Supporting scannable points */}
          <ul className="space-y-2 pt-2 select-none">
            <li className="flex items-start gap-2.5 text-[13px] text-zinc-400 leading-normal">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>
                <strong className="text-zinc-200 font-medium">Duplicate subscriptions</strong>: Surface overlapping seats across coding and design tools.
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-[13px] text-zinc-400 leading-normal">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>
                <strong className="text-zinc-200 font-medium">Bloated plan tiers</strong>: Identify inactive seat allocations and oversized workspace tiers.
              </span>
            </li>
            <li className="flex items-start gap-2.5 text-[13px] text-zinc-400 leading-normal">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>
                <strong className="text-zinc-200 font-medium">API capacity leaks</strong>: Audit usage profiles to optimize multi-provider overhead.
              </span>
            </li>
          </ul>
        </FeatureRow>

      </Container>
    </SectionWrapper>
  );
}
