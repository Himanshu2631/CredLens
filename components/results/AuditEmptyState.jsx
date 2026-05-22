'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

/**
 * AuditEmptyState — shown when runSpendAudit() returns 0 recommendations.
 *
 * This is a positive outcome, not an error. The copy reflects that clearly:
 * "Your AI stack looks lean" rather than "No results found."
 *
 * The 4 summary metrics are still rendered above this — zero recommendations
 * doesn't mean zero spend, it means the spend is already well-optimized.
 */
export default function AuditEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-900/40 bg-emerald-950/20">
        <CheckCircle2 className="h-5 w-5 text-emerald-500" strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-300">
          Your AI stack looks lean.
        </p>
        <p className="text-[11px] text-zinc-600 max-w-xs leading-relaxed">
          No significant optimization opportunities were found based on your
          current configuration. This means your tool selection, plan tiers,
          and seat counts are well-matched to your team size.
        </p>
      </div>
    </div>
  );
}
