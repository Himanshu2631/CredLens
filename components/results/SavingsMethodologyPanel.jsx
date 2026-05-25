'use client';

import React from 'react';
import { 
  HelpCircle, 
  Layers, 
  Users, 
  GitMerge, 
  TrendingDown, 
  Sparkles 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const METHODOLOGIES = [
  {
    icon: Layers,
    title: 'Duplicate Subscription Detection',
    description: 'Scans tools across identical categories to pinpoint licensing overlaps and redundant platform instances.',
  },
  {
    icon: Users,
    title: 'Inactive Seat Analysis',
    description: 'Projects seat usage baselines against active user directories to identify bloated seat count tiers.',
  },
  {
    icon: GitMerge,
    title: 'Provider Overlap Heuristics',
    description: 'Analyzes API consumption across overlapping providers (e.g. OpenAI vs Anthropic) to optimize baseline capacity.',
  },
  {
    icon: TrendingDown,
    title: 'Pricing Benchmark Logic',
    description: 'Cross-checks subscription intervals and team tiers against SaaS catalogs to recommend optimal billing cycles.',
  },
  {
    icon: Sparkles,
    title: 'Optimization Scoring Methodology',
    description: 'Grades recommendations based on immediate monthly cash recovery relative to integration disruption risk.',
  },
];

/**
 * SavingsMethodologyPanel — a secondary context panel that explains
 * how savings are calculated by the CredLens Spend Audit Engine.
 * 
 * Styled as a sleek, premium side panel supporting the primary audit results.
 */
export default function SavingsMethodologyPanel() {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/60 bg-card/30 p-5 space-y-4 backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.25)]',
        'animate-in fade-in slide-in-from-bottom-2 duration-300'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-3.5 border-b border-border/20">
        <HelpCircle className="h-4 w-4 text-emerald-500" strokeWidth={2} />
        <h3 className="text-[10px] font-mono tracking-widest text-zinc-300 uppercase">
          Savings Methodology
        </h3>
      </div>

      {/* Intro text */}
      <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
        The CredLens Spend Intelligence engine analyzes active software deployments against real-time billing structures using five core diagnostic heuristics:
      </p>

      {/* List items */}
      <div className="space-y-3.5 pt-1.5">
        {METHODOLOGIES.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx}
              className="group flex gap-3 text-left transition-colors duration-150 py-1.5"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-zinc-950 border border-zinc-800/80 group-hover:border-emerald-950/60 transition-colors">
                <Icon className="h-3 w-3 text-zinc-500 group-hover:text-emerald-400 transition-colors" strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-semibold text-zinc-300 group-hover:text-white transition-colors leading-tight">
                  {item.title}
                </h4>
                <p className="text-[10.5px] text-zinc-500 leading-normal font-normal">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust Signoff */}
      <div className="pt-2.5 border-t border-border/10 flex items-center justify-between text-[9px] font-mono text-zinc-500">
        <span>Deterministic Rule System</span>
        <span>v3.0.2 Stable</span>
      </div>
    </div>
  );
}
