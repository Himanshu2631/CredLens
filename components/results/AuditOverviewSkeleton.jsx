'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, SlidersHorizontal, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const LOADING_PHASES = [
  { text: 'Ingesting stack configurations...', delay: 0 },
  { text: 'Evaluating cost leakage rules...', delay: 2500 },
  { text: 'Synthesizing AI executive summary...', delay: 5000 }
];

export default function AuditOverviewSkeleton() {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const timers = LOADING_PHASES.map((phase, index) => {
      if (index === 0) return null;
      return setTimeout(() => {
        setPhaseIndex(index);
      }, phase.delay);
    }).filter(Boolean);

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className={cn(
        'rounded-xl border border-border/60 bg-card overflow-hidden select-none',
        'shadow-[0_4px_24px_rgba(0,0,0,0.35)] animate-pulse'
      )}
    >
      {/* ── 1. Status header metadata bar ── */}
      <div className="flex items-center justify-between border-b border-border/50 bg-zinc-950/50 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-500" />
          <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
            {LOADING_PHASES[phaseIndex].text}
          </span>
        </div>
        <div className="h-4.5 w-16 bg-zinc-800/40 rounded" />
      </div>

      {/* ── 2. Report Summary pulsing skeleton ── */}
      <div className="border-b border-border/50 bg-zinc-950/20 p-5 md:p-6 space-y-6">
        {/* Executive summary paragraph skeleton */}
        <div className="space-y-3">
          <div className="h-3 w-28 bg-zinc-800/40 rounded" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-zinc-800/40 rounded" />
            <div className="h-4 w-[92%] bg-zinc-800/40 rounded" />
            <div className="h-4 w-[65%] bg-zinc-800/40 rounded" />
          </div>
          
          {/* Key Insights ledger skeletons */}
          <div className="mt-6 pt-5 border-t border-border/10 space-y-3">
            <div className="h-2.5 w-20 bg-zinc-800/40 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="flex gap-2.5 bg-zinc-950/30 border border-border/10 rounded p-3 h-14">
                  <div className="h-3 w-5 bg-zinc-850 rounded shrink-0 mt-0.5" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-2.5 w-[90%] bg-zinc-800/30 rounded" />
                    <div className="h-2 w-[60%] bg-zinc-800/20 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. Metrics grid skeletons ── */}
        <div className="space-y-4 pt-3">
          {/* 3-column primary strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 border border-border/20 rounded-lg overflow-hidden bg-zinc-950/40 h-20">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="flex flex-col justify-center gap-1.5 p-4 border-b sm:border-b-0 sm:border-r last:border-0 border-border/20">
                <div className="h-2 w-24 bg-zinc-800/40 rounded" />
                <div className="h-4.5 w-16 bg-zinc-800/60 rounded" />
              </div>
            ))}
          </div>

          {/* 2-column secondary grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((idx) => (
              <div key={idx} className="rounded-lg p-5 border border-border/20 bg-zinc-900/10 h-24 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="h-2 w-24 bg-zinc-800/40 rounded" />
                  <div className="h-5 w-20 bg-zinc-850/50 rounded" />
                </div>
                <div className="h-3 w-[80%] bg-zinc-800/20 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. Spend breakdown bar skeleton ── */}
        <div className="space-y-3 pt-3 border-t border-border/20">
          <div className="flex items-center justify-between">
            <div className="h-2 w-32 bg-zinc-800/40 rounded" />
            <div className="h-2 w-24 bg-zinc-800/30 rounded" />
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-800/35" />
          <div className="flex justify-between items-center text-[10px]">
            <div className="flex gap-4">
              <div className="h-3 w-28 bg-zinc-800/20 rounded" />
              <div className="h-3 w-24 bg-zinc-800/20 rounded" />
            </div>
            <div className="h-3 w-28 bg-zinc-800/20 rounded" />
          </div>
        </div>

        {/* ── 5. Action toolbar skeletons ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/20">
          <div className="flex items-center gap-2">
            <div className="h-8 w-28 bg-zinc-900 border border-border/20 rounded" />
            <div className="h-8 w-28 bg-zinc-900 border border-border/20 rounded" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-20 bg-zinc-950/20 border border-zinc-900/30 rounded" />
            <div className="h-5 w-20 bg-zinc-950/20 border border-zinc-900/30 rounded" />
          </div>
        </div>
      </div>

      {/* ── 6. Chrome Recommendations list layout header skeleton ── */}
      <div className="p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3 w-3 text-zinc-700 animate-pulse" />
            <div className="h-2.5 w-24 bg-zinc-800/30 rounded" />
          </div>
        </div>
        <div className="space-y-2.5">
          {[1, 2].map((idx) => (
            <div key={idx} className="h-16 rounded-lg border border-border/25 bg-card/40 flex items-center justify-between px-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-7 w-7 rounded bg-zinc-800/40 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 w-[50%] bg-zinc-800/40 rounded" />
                  <div className="h-2 w-[35%] bg-zinc-800/20 rounded" />
                </div>
              </div>
              <div className="h-4.5 w-16 bg-zinc-850/50 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* ── 7. Chrome Footer skeleton ── */}
      <div className="border-t border-border/40 px-5 py-3 flex items-center justify-between bg-zinc-950/20">
        <div className="h-2 w-32 bg-zinc-850/40 rounded" />
        <div className="h-2 w-48 bg-zinc-850/40 rounded" />
      </div>
    </div>
  );
}
