'use client';

import React from 'react';
import MetricItem from './MetricItem';
import RecommendationCard from './RecommendationCard';
import Badge from '@/components/ui/Badge';

/**
 * AuditPreviewCard shows a screenshot-grade financial summary.
 * Utilizes reusable MetricItem, RecommendationCard, and Badge subcomponents.
 */
export default function AuditPreviewCard() {
  const recommendations = [
    {
      id: 1,
      title: 'Consolidate Coding Assistant Seats',
      description: 'Duplicate Cursor and GitHub Copilot licenses active across engineering team. Standardizing onto a single provider saves duplicate costs.',
      provider: 'openai',
      impact: 'High',
      savings: '$1,850/mo',
      savingsColor: 'text-emerald-400'
    },
    {
      id: 2,
      title: 'Consolidate Claude Team Seats',
      description: '4 Anthropic seat licenses show zero keyboard activity in 30 days, overlapping with active ChatGPT enterprise accounts.',
      provider: 'anthropic',
      impact: 'Medium',
      savings: '$680/mo',
      savingsColor: 'text-zinc-300'
    },
    {
      id: 3,
      title: 'Downgrade Unused Design Accounts',
      description: 'Downgrade Midjourney seats. 3 creator licenses are on the Pro Tier but have run zero generation tasks for 2 billing periods.',
      provider: 'midjourney',
      impact: 'Low',
      savings: '$180/mo',
      savingsColor: 'text-zinc-400'
    }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto rounded-xl border border-border/80 bg-card/65 backdrop-blur-md overflow-hidden shadow-[0_24px_48px_-12px_rgba(0,0,0,0.7)] text-left select-none animate-fade-in">
      
      {/* Card Header metadata bar */}
      <div className="flex items-center justify-between border-b border-border/60 bg-zinc-950/40 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">AUDIT PREVIEW</span>
          <span className="h-1 w-1 rounded-full bg-zinc-700" />
          <span className="text-xs text-zinc-300 font-medium">AcmeLabs_May_Audit.json</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" dot>
            Analysis Complete
          </Badge>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/60 border-b border-border/60 bg-zinc-950/20">
        
        {/* Metric 1 */}
        <MetricItem
          label="Current Monthly Spend"
          value="$14,240"
          subtext="Across 8 configured platforms"
        />

        {/* Metric 2 */}
        <MetricItem
          label="Optimized Monthly Spend"
          value="$11,530"
          valueClassName="text-white"
          subtext={
            <span className="text-zinc-400 font-medium flex items-center gap-1">
              <span className="text-emerald-400 font-mono">-$2,710</span> savings identified
            </span>
          }
        />

        {/* Metric 3 */}
        <MetricItem
          label="Runway Restored"
          value="19.1%"
          valueClassName="text-emerald-400"
          subtext="Avg. payback period: < 24 hours"
          className="bg-zinc-900/35"
        />

      </div>

      {/* Action Items List */}
      <div className="p-5 md:p-6">
        <h4 className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase mb-4">
          Targeted Optimizations ({recommendations.length})
        </h4>
        
        <div className="space-y-3.5">
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              title={rec.title}
              description={rec.description}
              provider={rec.provider}
              savings={rec.savings}
              savingsColor={rec.savingsColor}
              impact={rec.impact}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
