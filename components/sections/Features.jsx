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
    <SectionWrapper className="border-b border-border/30 bg-zinc-950/25">
      <Container className="space-y-24 md:space-y-36">

        {/* Feature 1: API Cost Insights & Visibility */}
        <FeatureRow
          badge="API Cost Insights"
          title="Granular model execution telemetry"
          description="Audit token usage, cache hit rates, and prompt/completion payloads down to the exact millisecond. Identify unclosed LLM agent loops, duplicate threads, and high-latency cycles that inflate your production bills."
          visual={
            <MockCard className="font-mono text-[11px] text-zinc-400">
              <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-[10px] text-zinc-500">anomaly_detector.js</span>
                </div>
                <span className="text-[9px] text-zinc-600">Cost Alert: Leak Detected</span>
              </div>
              <pre className="text-zinc-400 leading-normal space-y-1">
                <div>{`{`}</div>
                <div className="pl-4">{`"model": "`}
                  <span className="text-zinc-200 font-semibold">gpt-4o</span>{`",`}
                </div>
                <div className="pl-4">{`"tokens": {`}</div>
                <div className="pl-8">{`"prompt": 8192,`}</div>
                <div className="pl-8">{`"completion": 4096`}</div>
                <div className="pl-4">{`},`}</div>
                <div className="pl-4">{`"billing_cost": "`}
                  <span className="text-red-400 font-semibold">$0.09000</span>{`",`}
                </div>
                <div className="pl-4">{`"execution_loop": "`}
                  <span className="text-red-400 font-medium">RECURSIVE_THREAD_LEAK</span>{`"`}
                </div>
                <div>{`}`}</div>
              </pre>
              <div className="mt-4 pt-3 border-t border-border/40 text-[9px] text-zinc-500 flex justify-between">
                <span>Ingest Stream: API Proxy Logs</span>
                <span className="text-red-400 font-semibold">Leak Impact: -$1,850/mo</span>
              </div>
            </MockCard>
          }
        />

        {/* Feature 2: Subscription Consolidation */}
        <FeatureRow
          badge="Seat Audit Optimization"
          title="Unify and prune software seats"
          description="Consolidate overlapping AI applications. Our telemetry engine parses seat engagement logs across tools like Claude Team, ChatGPT Enterprise, and Midjourney to flag seats with zero activity in the last 60 days."
          reverse
          visual={
            <MockCard>
              <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
                <span className="text-[10px] font-mono text-zinc-500">SEAT AUDITING & MATCHING</span>
                <span className="text-[9px] font-mono text-zinc-600">Workspace: Acme Design</span>
              </div>
              <div className="space-y-3">
                {/* Active Member Row */}
                <div className="flex items-center justify-between p-2.5 rounded border border-border/30 bg-zinc-950/40">
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] text-zinc-300 font-semibold">
                      JD
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">Jane Doe</div>
                      <div className="text-[9px] text-zinc-500 font-mono">Product Design</div>
                    </div>
                  </div>
                  <div className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950/25 border border-emerald-900/30 text-emerald-450">
                    Active on Figma & Midjourney
                  </div>
                </div>

                {/* Inactive Member Row with Flag */}
                <div className="flex items-center justify-between p-2.5 rounded border border-red-900/30 bg-red-950/5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 font-semibold">
                      MW
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-zinc-350">Mark Wu</div>
                      <div className="text-[9px] text-zinc-500 font-mono">Marketing Lead</div>
                    </div>
                  </div>
                  <div className="text-[9px] font-mono px-2 py-0.5 rounded bg-red-950/40 border border-red-900/40 text-red-400">
                    Zero Activity (62 Days)
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 flex justify-between items-center">
                <span className="text-[9px] text-zinc-500 font-mono">2 Inactive seats found</span>
                <span className="text-[9px] font-semibold text-emerald-450 uppercase">Saving: $120/mo</span>
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
                <span className="text-[9px] font-mono text-emerald-450 flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-emerald-500" />
                  Link Sharing Enabled
                </span>
              </div>
              <div className="flex items-center gap-2 border border-border bg-zinc-950 p-2.5 rounded-lg">
                <div className="text-[11px] font-mono text-zinc-400 overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                  https://credlens.com/audit/acme-labs-849a
                </div>
                <button className="h-7.5 px-3 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer shrink-0">
                  Copy Link
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
