import React from 'react';
import ProviderIcon from './ProviderIcon';
import { cn } from '@/lib/utils';

/**
 * Reusable recommendation details row.
 * Displays a provider logo mark, description copy, localized saving rates, and color-coded impact pills.
 */
export default function RecommendationCard({
  title,
  description,
  provider,
  savings,
  savingsColor = 'text-zinc-300',
  impact = 'Low', // 'High' | 'Medium' | 'Low'
  className = ''
}) {
  const impactStyles = {
    High: 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/30',
    Medium: 'bg-zinc-800/40 text-zinc-300 border border-border/30',
    Low: 'bg-zinc-900 text-zinc-500 border border-zinc-800'
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-lg border border-border/40 bg-zinc-950/30 hover:border-border hover:bg-zinc-950/50 transition-all duration-200 select-none",
        className
      )}
    >
      {/* Detail Area */}
      <div className="flex items-start gap-3">
        <ProviderIcon provider={provider} />
        <div className="space-y-1 text-left">
          <div className="text-xs font-semibold text-zinc-200">{title}</div>
          <p className="text-[11px] leading-relaxed text-zinc-500 max-w-md">{description}</p>
        </div>
      </div>
      
      {/* Pricing/Impact pill column */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-0 border-border/20 pt-2 sm:pt-0 gap-2 shrink-0">
        <div className={cn("text-[12px] font-mono font-semibold", savingsColor)}>
          {savings}
        </div>
        <div
          className={cn(
            "text-[10px] px-1.5 py-0.5 rounded font-mono font-medium tracking-wide uppercase",
            impactStyles[impact] || impactStyles.Low
          )}
        >
          {impact} Impact
        </div>
      </div>
    </div>
  );
}
