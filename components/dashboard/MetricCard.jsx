import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * MetricCard - A polished, reusable KPI card for dashboard telemetry.
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Primary metric value
 * @param {string} [props.trend] - Optional trend label (e.g. "+12.3%")
 * @param {'positive' | 'negative' | 'neutral'} [props.trendType] - Impact type for styling
 * @param {string} props.description - Explanatory subtitle
 * @param {React.ComponentType} [props.icon] - Optional icon component
 */
export default function MetricCard({
  title,
  value,
  trend,
  trendType = 'neutral',
  description,
  icon: Icon
}) {
  const isPositive = trendType === 'positive';
  const isNegative = trendType === 'negative';

  return (
    <div className="group relative rounded-xl border border-border/50 bg-zinc-950/30 p-5 transition-all duration-200 hover:border-zinc-800/80 hover:bg-zinc-950/50">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
          {title}
        </span>
        {Icon && (
          <Icon className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-white">
          {value}
        </span>
        
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium font-mono",
              isPositive && "bg-emerald-950/20 text-emerald-400 border border-emerald-900/30",
              isNegative && "bg-red-950/20 text-red-400 border border-red-900/30",
              !isPositive && !isNegative && "bg-zinc-900/40 text-zinc-400 border border-zinc-800/50"
            )}
          >
            {isPositive && <ArrowUpRight className="h-2.5 w-2.5" />}
            {isNegative && <ArrowDownRight className="h-2.5 w-2.5" />}
            {trend}
          </span>
        )}
      </div>

      <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">
        {description}
      </p>
    </div>
  );
}
