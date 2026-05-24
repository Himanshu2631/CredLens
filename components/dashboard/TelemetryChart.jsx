import React from 'react';
import { Cpu } from 'lucide-react';

/**
 * TelemetryChart - AI provider cost allocation visualizer.
 *
 * @param {{ name, percent, spend, color, trend }[]} providers  Derived from audit data
 * @param {string} totalSpend  Formatted total spend string (e.g. "$1,540/mo")
 */
export default function TelemetryChart({ providers = [], totalSpend = '—' }) {
  return (
    <div className="rounded-xl border border-border/50 bg-zinc-950/30 p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border/20 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-zinc-400" />
          <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
            AI Provider Spend Allocation
          </span>
        </div>
        <span className="text-xs font-mono font-semibold text-white">
          Total: {totalSpend}
        </span>
      </div>

      {providers.length === 0 ? (
        <p className="text-[11px] text-zinc-500 py-4 text-center">
          No provider data available for this audit.
        </p>
      ) : (
        <>
          {/* Stacked Progress Bar Chart */}
          <div className="space-y-2">
            <div className="h-4 w-full rounded-full overflow-hidden flex bg-zinc-900 border border-zinc-800/40">
              {providers.map((prov, idx) => (
                <div
                  key={idx}
                  style={{ width: `${prov.percent}%` }}
                  className={`${prov.color} h-full transition-all duration-300 hover:opacity-90`}
                  title={`${prov.name}: ${prov.percent}% (${prov.spend})`}
                />
              ))}
            </div>
          </div>

          {/* Legend & Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {providers.map((prov, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2 rounded-lg border border-transparent hover:border-border/30 hover:bg-zinc-900/10 transition-all duration-150"
              >
                {/* Color Swatch */}
                <span className={`h-2.5 w-2.5 rounded-sm ${prov.color} shrink-0 mt-1`} />

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-zinc-300 truncate">
                      {prov.name}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                      {prov.percent}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-zinc-500">
                    <span>{prov.spend}</span>
                    <span>{prov.trend}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
