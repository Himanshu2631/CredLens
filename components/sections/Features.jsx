'use client';

import React, { useState } from 'react';
import Container from '@/components/layout/Container';
import SectionWrapper from '@/components/layout/SectionWrapper';
import FeatureRow from './FeatureRow';
import MockCard from '@/components/ui/MockCard';

/**
 * Features section highlighting the platform's cost telemetry, seat auditing, and reporting.
 * Utilizes reusable FeatureRow layouts and MockCard containers.
 */
export default function Features() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('https://credlens.com/audit/acme-labs-849a');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <SectionWrapper className="border-b border-border/30 bg-zinc-950/25">
      <Container className="space-y-24 md:space-y-36">

        {/* Feature 1: Stack Visibility */}
        <FeatureRow
          badge="Stack Visibility"
          title="Consolidated view of your AI spend"
          description="Get a clear, structured breakdown of your software subscriptions and volumetric API spend. Understand exactly where your capital is going across OpenAI, Anthropic, and specialized AI providers."
          visual={
            <MockCard>
              <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4 select-none">
                <span className="text-[10px] font-mono text-zinc-500">SPEND DISTRIBUTION</span>
                <span className="text-[9.5px] font-mono text-zinc-400">Monthly Run-rate: $14,240</span>
              </div>

              {/* Progress bar */}
              <div className="h-2.5 w-full rounded-full overflow-hidden bg-zinc-900 border border-zinc-800/60 flex p-[1px] mb-5 select-none">
                <div className="bg-zinc-300 h-full rounded-l-full" style={{ width: '58%' }} />
                <div className="bg-zinc-600 h-full rounded-r-full -ml-[1px]" style={{ width: '42%' }} />
              </div>

              <div className="space-y-2.5 select-none">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <span className="h-2 w-2 rounded-full bg-zinc-300" />
                    Subscriptions
                  </span>
                  <span className="font-semibold text-zinc-200 font-mono">$8,260/mo</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <span className="h-2 w-2 rounded-full bg-zinc-600" />
                    API Volumetrics
                  </span>
                  <span className="font-semibold text-zinc-200 font-mono">$5,980/mo</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/40 flex justify-between items-center text-[10px] text-zinc-500 font-mono select-none">
                <span>Audited Providers</span>
                <span>OpenAI · Anthropic · Gemini</span>
              </div>
            </MockCard>
          }
        />

        {/* Feature 2: Optimization Insights */}
        <FeatureRow
          badge="Optimization Insights"
          title="Identify redundant and underutilized subscriptions"
          description="Detect overlapping AI tools, duplicate developer licenses, and API spend concentrations. Our analysis maps your team footprint against a registry of optimization rules to highlight immediately recoverable waste."
          reverse
          visual={
            <MockCard>
              <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4 select-none">
                <span className="text-[10px] font-mono text-zinc-500">OPTIMIZATION INSIGHTS</span>
                <span className="text-[9.5px] font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded">
                  4 Actions Identified
                </span>
              </div>

              <div className="space-y-2.5 select-none">
                {/* Insight item 1 */}
                <div className="flex items-start justify-between gap-3 p-2.5 rounded border border-border/30 bg-zinc-950/40">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                      Duplicate Coding Assistants
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      Cursor & GitHub Copilot seats active simultaneously across engineering.
                    </p>
                  </div>
                  <div className="text-[9.5px] font-mono font-semibold text-red-400 shrink-0">
                    -$190/mo
                  </div>
                </div>

                {/* Insight item 2 */}
                <div className="flex items-start justify-between gap-3 p-2.5 rounded border border-border/30 bg-zinc-950/40">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      Oversized Team Tiers
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      Workspace plan exceeds active seat usage baseline.
                    </p>
                  </div>
                  <div className="text-[9.5px] font-mono font-semibold text-amber-400 shrink-0">
                    -$60/mo
                  </div>
                </div>

                {/* Insight item 3 */}
                <div className="flex items-start justify-between gap-3 p-2.5 rounded border border-border/30 bg-zinc-950/40">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                      Unused Premium AI Plans
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      Enterprise subscriptions with low engagement detected.
                    </p>
                  </div>
                  <div className="text-[9.5px] font-mono font-semibold text-zinc-400 shrink-0">
                    -$150/mo
                  </div>
                </div>

                {/* Insight item 4 */}
                <div className="flex items-start justify-between gap-3 p-2.5 rounded border border-border/30 bg-zinc-950/40">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                      API Concentration Risk
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      Single-provider dependency increases billing overhead.
                    </p>
                  </div>
                  <div className="text-[9.5px] font-mono font-semibold text-zinc-400 shrink-0">
                    -$220/mo
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/40 flex justify-between items-center text-[10px] text-zinc-500 font-mono select-none">
                <span>Recoverable AI Cost Run-rate</span>
                <span className="text-emerald-400 font-semibold">$620/mo</span>
              </div>
            </MockCard>
          }
        />

        {/* Feature 3: Shareable Reports */}
        <FeatureRow
          badge="Shareable Reports"
          title="Export transparent checklists"
          description="Compile raw log audits into read-only markdown lists, interactive diagnostics dashboards, or JSON parameters. Deliver clear cost audits to investors, directors, or team leads without sharing credentials."
          visual={
            <MockCard className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <span className="text-[10px] font-mono text-zinc-500">SHARE DIAGNOSTICS</span>
                <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-emerald-500" />
                  Link Sharing Enabled
                </span>
              </div>
              <div className="flex items-center gap-2 border border-border bg-zinc-950 p-2.5 rounded-lg">
                <div className="text-[11px] font-mono text-zinc-400 overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                  https://credlens.com/audit/acme-labs-849a
                </div>
                <button
                  onClick={handleCopy}
                  aria-label="Copy sharing link to clipboard"
                  className={`h-7.5 px-3 rounded text-[10px] font-mono border transition-all duration-150 cursor-pointer shrink-0 ${
                    copied
                      ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
              <div className="text-[10px] text-zinc-500 leading-normal">
                Any person with this link can view the read-only audit recommendations and metrics summary. Log files and workspace keys are completely stripped from the report.
              </div>
            </MockCard>
          }
        />

      </Container>
    </SectionWrapper>
  );
}
