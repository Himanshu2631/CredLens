'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import AuditMetricTile from './AuditMetricTile';

/**
 * SummaryMetricsRow — the 4-KPI financial summary strip.
 *
 * Layout:
 *   Mobile  (< 640px): 2 columns × 2 rows
 *   Tablet+ (≥ 640px): 4 columns × 1 row
 *
 * Visual hierarchy of the four metrics is intentional:
 *
 *  1. Current Spend    — neutral zinc-300, provides baseline context
 *  2. After Optimization — white, slightly emphasized as the target
 *  3. Monthly Savings  — emerald, the delta; meaningful if > 0
 *  4. Annual Impact    — emerald + faint bg accent, the "why act now" number
 *
 * The annual savings tile gets a subtle background tint to distinguish it
 * as the primary business-impact number — the one a CFO or founder focuses on.
 *
 * @param {Object} summary — The `summary` object from formatAuditReport()
 */
export default function SummaryMetricsRow({ summary }) {
  const hasSavings = summary.totalEstimatedSavings > 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-border/50">

      {/* 1. Current Monthly Spend ── context baseline */}
      <AuditMetricTile
        label="Current Spend"
        value={summary.formattedCurrentSpend}
        subtext={summary.subscriptionCost > 0 ? 'Subscriptions & API' : 'Across selected tools'}
        valueClass="text-zinc-300"
        className="border-b sm:border-b-0 border-r border-border/40"
      />

      {/* 2. Optimized Monthly Spend ── post-fix target */}
      <AuditMetricTile
        label="After Optimization"
        value={summary.formattedOptimizedSpend}
        subtext={hasSavings ? 'Projected state' : 'No changes needed'}
        valueClass="text-white"
        className="border-b sm:border-b-0 sm:border-r border-border/40"
      />

      {/* 3. Monthly Savings ── the actionable delta */}
      <AuditMetricTile
        label="Monthly Savings"
        value={hasSavings ? summary.formattedEstimatedSavings : '$0/mo'}
        subtext={
          hasSavings
            ? `${summary.runwayRestoredPercent}% cost reduction`
            : 'Stack already lean'
        }
        valueClass={hasSavings ? 'text-emerald-400' : 'text-zinc-600'}
        className="border-r border-border/40"
      />

      {/* 4. Annual Impact ── the hero number; why act now */}
      <AuditMetricTile
        label="Annual Impact"
        value={hasSavings ? summary.formattedEstimatedYearlySavings : '$0/yr'}
        subtext={hasSavings ? 'Recoverable runway' : '—'}
        valueClass={hasSavings ? 'text-emerald-400' : 'text-zinc-600'}
        className={cn(hasSavings && 'bg-emerald-950/10')}
      />
    </div>
  );
}
