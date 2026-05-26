import React from 'react';
import { Activity, CheckCircle2, Flame, UserCheck, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Map icon key strings (from the server-serialized payload) back to components.
 * Next.js RSCs pass data as JSON — we can't serialize React components,
 * so iconKey is a plain string and this map handles the lookup client-side.
 */
const ICON_MAP = {
  CheckCircle2,
  Flame,
  UserCheck,
  ShieldAlert,
};

/**
 * InsightFeed — Operational activity timeline derived from real audit data.
 *
 * @param {{ id, type, title, description, timestamp, iconKey, color }[]} events
 */
export default function InsightFeed({ events = [] }) {
  return (
    <div className="rounded-xl border border-border/50 bg-zinc-950/30 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/20 pb-3">
        <Activity className="h-4 w-4 text-zinc-400" />
        <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
          Cost Optimization Activity Feed
        </span>
      </div>

      {events.length === 0 ? (
        <p className="text-[12.5px] text-zinc-500 py-4 text-center">
          Activity feed will populate after your first saved audit.
        </p>
      ) : (
        /* Activity Timeline */
        <div className="relative pl-4 space-y-5 border-l border-zinc-900/80 mt-1">
          {events.map((event) => {
            const Icon = ICON_MAP[event.iconKey] || CheckCircle2;
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
                    <h4 className="text-[12.5px] font-semibold text-zinc-200 leading-normal pr-2">
                      {event.title}
                    </h4>
                    <span className="text-[9px] font-mono text-zinc-500 shrink-0">
                      {event.timestamp}
                    </span>
                  </div>
                  <p className="text-[12px] text-zinc-400 leading-relaxed font-normal">
                    {event.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
