import React from 'react';
import { ShieldAlert, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * RedundancyAlerts - Active seat/tool redundancy warnings and optimization risk matrix.
 *
 * @param {{ id, title, description, impact, severity }[]} alerts     High-priority recommendations
 * @param {{ action, risk, impact, savings, color }[]}     riskMatrix  All recommendations as risk rows
 */
export default function RedundancyAlerts({ alerts = [], riskMatrix = [] }) {
  return (
    <div className="space-y-6">
      {/* 1. Redundancy Alerts Box */}
      <div className="rounded-xl border border-border/50 bg-zinc-950/30 p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/20 pb-3">
          <ShieldAlert className="h-4 w-4 text-zinc-400" />
          <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
            Active Redundancy Warnings
          </span>
        </div>

        {alerts.length === 0 ? (
          <p className="text-[11px] text-zinc-500 py-2 text-center">
            No high-priority redundancies detected in the latest audit.
          </p>
        ) : (
          <div className="space-y-3.5">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 rounded-lg border border-zinc-900 bg-zinc-950/40 p-4"
              >
                <AlertTriangle className={cn(
                  "h-4 w-4 shrink-0 mt-0.5",
                  alert.severity === 'high' ? 'text-red-400' : 'text-amber-400'
                )} />

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <h4 className="text-xs font-semibold text-zinc-200 truncate">
                      {alert.title}
                    </h4>
                    <span className="text-[10px] font-mono font-medium text-emerald-400 shrink-0 self-start sm:self-center">
                      {alert.impact}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {alert.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Risk Indicators Matrix */}
      <div className="rounded-xl border border-border/50 bg-zinc-950/30 p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/20 pb-3">
          <Info className="h-4 w-4 text-zinc-400" />
          <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
            Optimization Action Risk Profile
          </span>
        </div>

        {riskMatrix.length === 0 ? (
          <p className="text-[11px] text-zinc-500 py-2 text-center">
            No recommendations available yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead>
                <tr className="border-b border-zinc-900/60">
                  <th className="pb-2.5 text-[9px] font-mono uppercase tracking-wider text-zinc-500">Action Item</th>
                  <th className="pb-2.5 text-[9px] font-mono uppercase tracking-wider text-zinc-500">Risk Profile</th>
                  <th className="pb-2.5 text-[9px] font-mono uppercase tracking-wider text-zinc-500">Resource Impact</th>
                  <th className="pb-2.5 text-[9px] font-mono uppercase tracking-wider text-zinc-500 text-right">Monthly Savings</th>
                </tr>
              </thead>
              <tbody>
                {riskMatrix.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-zinc-900/30 last:border-0 hover:bg-zinc-900/10 transition-colors"
                  >
                    <td className="py-3 text-xs font-medium text-zinc-300">
                      {item.action}
                    </td>
                    <td className="py-3 text-xs">
                      <span className="text-[10px] font-mono text-zinc-400">
                        {item.risk}
                      </span>
                    </td>
                    <td className="py-3 text-xs">
                      <span className={cn(
                        "text-[9px] font-mono uppercase px-2 py-0.5 rounded border",
                        item.color
                      )}>
                        {item.impact}
                      </span>
                    </td>
                    <td className="py-3 text-xs font-mono font-semibold text-emerald-400 text-right">
                      {item.savings}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
