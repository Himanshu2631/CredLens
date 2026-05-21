'use client';

import React from 'react';

// Handcrafted SVG brand indicators for providers to avoid package overhead
const ProviderIcon = ({ provider }) => {
  if (provider === 'openai') {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current stroke-[1.8]">
          <circle cx="12" cy="12" r="8" className="opacity-30" />
          <path d="M12 2v20M2 12h20" strokeDasharray="1 1" />
          <circle cx="12" cy="12" r="3" className="fill-zinc-950 stroke-current" />
        </svg>
      </div>
    );
  }
  if (provider === 'anthropic') {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-250">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current stroke-[1.8]">
          <path d="M4 20L12 4l8 16M6 16h12" />
        </svg>
      </div>
    );
  }
  // Default/Midjourney
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current stroke-[1.8]">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
  );
};

export default function AuditPreviewCard() {
  const recommendations = [
    {
      id: 1,
      title: 'Optimize API Ingestion',
      description: 'Consolidate raw OpenAI assistant threads. 14 unclosed session loops are leaking token cycles in production worker threads.',
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
    <div className="w-full max-w-3xl mx-auto rounded-xl border border-border/80 bg-card/65 backdrop-blur-md overflow-hidden shadow-[0_24px_48px_-12px_rgba(0,0,0,0.7)] text-left select-none">
      
      {/* Card Header metadata bar */}
      <div className="flex items-center justify-between border-b border-border/60 bg-zinc-950/40 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">AUDIT PREVIEW</span>
          <span className="h-1 w-1 rounded-full bg-zinc-700" />
          <span className="text-xs text-zinc-350 font-medium">AcmeLabs_May_Audit.json</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded bg-emerald-950/25 border border-emerald-900/35 px-2 py-0.5 text-[9px] font-medium text-emerald-450 uppercase">
            <span className="h-1 w-1 rounded-full bg-emerald-500" />
            Analysis Complete
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/60 border-b border-border/60 bg-zinc-950/20">
        
        {/* Metric 1 */}
        <div className="p-5 md:p-6 space-y-1">
          <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">Current Monthly Spend</span>
          <div className="text-lg md:text-xl font-semibold text-zinc-200">$14,240</div>
          <span className="text-[10px] text-zinc-500 block">Across 8 configured platforms</span>
        </div>

        {/* Metric 2 */}
        <div className="p-5 md:p-6 space-y-1">
          <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">Optimized Monthly Spend</span>
          <div className="text-lg md:text-xl font-semibold text-white">$11,530</div>
          <span className="text-[10px] text-zinc-400 block font-medium flex items-center gap-1">
            <span className="text-emerald-400">-$2,710</span> savings identified
          </span>
        </div>

        {/* Metric 3 */}
        <div className="p-5 md:p-6 space-y-1 bg-zinc-955/35">
          <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">Runway Restored</span>
          <div className="text-lg md:text-xl font-semibold text-emerald-400">19.1%</div>
          <span className="text-[10px] text-zinc-500 block">Avg. payback period: &lt; 24 hours</span>
        </div>

      </div>

      {/* Action Items List */}
      <div className="p-5 md:p-6">
        <h4 className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase mb-4">Targeted Optimizations ({recommendations.length})</h4>
        
        <div className="space-y-3.5">
          {recommendations.map((rec) => (
            <div 
              key={rec.id} 
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-lg border border-border/40 bg-zinc-950/30 hover:border-border hover:bg-zinc-950/50 transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <ProviderIcon provider={rec.provider} />
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-zinc-200">{rec.title}</div>
                  <p className="text-[10px] leading-relaxed text-zinc-500 max-w-md">{rec.description}</p>
                </div>
              </div>
              
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-0 border-border/20 pt-2 sm:pt-0 gap-2 shrink-0">
                <div className={`text-[12px] font-mono font-semibold ${rec.savingsColor}`}>
                  {rec.savings}
                </div>
                <div className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium tracking-wide uppercase ${
                  rec.impact === 'High' 
                    ? 'bg-emerald-950/20 text-emerald-450 border border-emerald-900/30'
                    : rec.impact === 'Medium'
                      ? 'bg-zinc-850/40 text-zinc-350 border border-border/30'
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                }`}>
                  {rec.impact} Impact
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
