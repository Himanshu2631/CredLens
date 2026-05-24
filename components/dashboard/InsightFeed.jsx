import React from 'react';
import { Activity, Bell, Flame, CheckCircle2, UserCheck, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * InsightFeed - A high-fidelity operational activity feed for cost optimization telemetry.
 */
export default function InsightFeed() {
  const events = [
    {
      id: 'evt-1',
      type: 'milestone',
      title: 'GPT-4 Enterprise pool optimization applied',
      description: 'Downgraded 8 inactive slots to Developer tiers. Staged monthly savings of $960 locked.',
      timestamp: '2 hours ago',
      icon: CheckCircle2,
      color: 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30'
    },
    {
      id: 'evt-2',
      type: 'spike',
      title: 'API Burn-Rate Threshold Warning',
      description: 'Anthropic completions endpoints spike detected. Claude 3.5 Sonnet token volumes increased 34% in the last 24h.',
      timestamp: '5 hours ago',
      icon: Flame,
      color: 'text-red-400 bg-red-950/20 border-red-900/30'
    },
    {
      id: 'evt-3',
      type: 'sync',
      title: 'Slack Workspace synchronization completed',
      description: 'Audited 42 users. Identified 3 workspace members with active seats who have been deactivated in active directory.',
      timestamp: '1 day ago',
      icon: UserCheck,
      color: 'text-zinc-400 bg-zinc-900/40 border-zinc-800/40'
    },
    {
      id: 'evt-4',
      type: 'warning',
      title: 'Orphaned v0.dev subscriptions flagged',
      description: '2 active v0.dev enterprise subscriptions identified with zero seat usage logs over the past 30 days.',
      timestamp: '3 days ago',
      icon: ShieldAlert,
      color: 'text-amber-400 bg-amber-950/20 border-amber-900/30'
    }
  ];

  return (
    <div className="rounded-xl border border-border/50 bg-zinc-950/30 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/20 pb-3">
        <Activity className="h-4 w-4 text-zinc-400" />
        <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
          Cost Optimization Activity Feed
        </span>
      </div>

      {/* Activity Timeline */}
      <div className="relative pl-4 space-y-5 border-l border-zinc-900/80 mt-1">
        {events.map((event) => {
          const Icon = event.icon;
          return (
            <div key={event.id} className="relative space-y-1.5">
              {/* Event Dot Icon Wrapper */}
              <span className={cn(
                "absolute -left-[25px] top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border text-[10px]",
                event.color
              )}>
                <Icon className="h-3 w-3" />
              </span>

              {/* Text Layout */}
              <div className="space-y-1">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-1">
                  <h4 className="text-[11px] font-semibold text-zinc-200 leading-normal pr-2">
                    {event.title}
                  </h4>
                  <span className="text-[9px] font-mono text-zinc-500 shrink-0">
                    {event.timestamp}
                  </span>
                </div>
                <p className="text-[10.5px] text-zinc-400 leading-relaxed font-normal">
                  {event.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
