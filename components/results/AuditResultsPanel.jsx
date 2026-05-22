'use client';

import React, { useState, useMemo } from 'react';
import { RotateCcw, CheckCircle2, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import SummaryMetricsRow from './SummaryMetricsRow';
import AuditRecommendationCard from './AuditRecommendationCard';
import AuditEmptyState from './AuditEmptyState';

/**
 * Priority sort order: High → Medium → Low → anything else.
 */
const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };

/**
 * Filter tabs for the recommendation list.
 * 'All' always shows everything; the others filter by estimatedImpact.
 */
const FILTER_TABS = ['All', 'High', 'Medium', 'Low'];

/**
 * AuditResultsPanel — the live audit report rendered after form submission.
 *
 * Sections (top → bottom):
 *   1. Report header   — status badge, tool count, date, re-run button
 *   2. Summary metrics — 4-KPI financial summary strip
 *   3. Filter tabs     — All / High / Medium / Low
 *   4. Recommendations — sorted and filtered recommendation cards
 *   5. Report footer   — engine attribution + subscription baseline
 *
 * All data sourced from runSpendAudit() — zero hardcoded values.
 *
 * @param {Object}   auditResult — Return value of runSpendAudit()
 * @param {Object}   formData    — Raw form state from SpendAuditForm
 * @param {Function} onReset     — Clears audit state, returns to the form
 */
export default function AuditResultsPanel({ auditResult, formData, onReset }) {
  const { summary, recommendations = [] } = auditResult;

  const [activeFilter, setActiveFilter] = useState('All');

  // Sort by priority first, then filter
  const sorted = useMemo(
    () =>
      [...recommendations].sort(
        (a, b) =>
          (PRIORITY_ORDER[a.estimatedImpact] ?? 3) -
          (PRIORITY_ORDER[b.estimatedImpact] ?? 3)
      ),
    [recommendations]
  );

  const filtered = useMemo(
    () =>
      activeFilter === 'All'
        ? sorted
        : sorted.filter((r) => r.estimatedImpact === activeFilter),
    [sorted, activeFilter]
  );

  // Counts per priority for the filter tab badges
  const counts = useMemo(
    () =>
      FILTER_TABS.slice(1).reduce(
        (acc, level) => {
          acc[level] = recommendations.filter((r) => r.estimatedImpact === level).length;
          return acc;
        },
        { All: recommendations.length }
      ),
    [recommendations]
  );

  const toolCount = formData?.tools?.length ?? 0;
  const submittedAt = formData?.submittedAt;
  const auditDate = useMemo(() => {
    if (!submittedAt) return 'Recent';
    return new Date(submittedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [submittedAt]);

  const hasSavings = summary.totalEstimatedSavings > 0;

  return (
    <div
      className={cn(
        'rounded-xl border border-border/60 bg-card overflow-hidden',
        'shadow-[0_4px_24px_rgba(0,0,0,0.35)]',
        'animate-in fade-in slide-in-from-bottom-2 duration-300'
      )}
    >
      {/* ── 1. Report Header ──────────────────────────────────────────────────
          Status + metadata on the left, reset action on the right.
          Kept deliberately small — this is navigation chrome, not content.
      ─────────────────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border/50 bg-zinc-950/50 px-5 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2} />
            <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
              Audit Complete
            </span>
          </div>
          <span className="h-3 w-px bg-border/60 shrink-0" aria-hidden="true" />
          <span className="text-[10px] font-mono text-zinc-600 truncate">
            {toolCount} tool{toolCount !== 1 ? 's' : ''} audited · {auditDate}
          </span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-7 gap-1.5 text-[10px] text-zinc-600 hover:text-zinc-300 shrink-0"
        >
          <RotateCcw className="h-3 w-3" />
          Re-run
        </Button>
      </div>

      {/* ── 2. Summary Metrics Strip ─────────────────────────────────────────
          4-KPI row. Carries the "what this audit found" headline numbers.
      ─────────────────────────────────────────────────────────────────────── */}
      <SummaryMetricsRow summary={summary} />

      {/* ── 3 & 4. Recommendations ───────────────────────────────────────────
          Header row with filter tabs, then the recommendation list.
      ─────────────────────────────────────────────────────────────────────── */}
      <div className="p-5 md:p-6 space-y-4">

        {/* Section header + filter tabs */}
        <div className="flex items-center justify-between gap-3">
          {/* Section heading */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3 w-3 text-zinc-700" aria-hidden="true" />
            <h3 className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase">
              {hasSavings
                ? `${recommendations.length} Optimization${recommendations.length !== 1 ? 's' : ''}`
                : 'Optimization Review'}
            </h3>
          </div>

          {/* Filter tabs — scoped to this panel, not page-level nav */}
          {recommendations.length > 0 && (
            <div
              role="tablist"
              aria-label="Filter recommendations by priority"
              className="flex items-center gap-1"
            >
              {FILTER_TABS.map((tab) => {
                const count = tab === 'All' ? recommendations.length : counts[tab] ?? 0;
                const isActive = activeFilter === tab;
                if (tab !== 'All' && count === 0) return null;

                return (
                  <button
                    key={tab}
                    role="tab"
                    type="button"
                    aria-selected={isActive}
                    onClick={() => setActiveFilter(tab)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded px-2 py-1 text-[9px] font-mono uppercase tracking-wider border transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer',
                      isActive
                        ? 'bg-zinc-800 text-zinc-200 border-zinc-700'
                        : 'bg-transparent text-zinc-600 border-transparent hover:text-zinc-400 hover:border-zinc-800'
                    )}
                  >
                    {tab}
                    <span
                      className={cn(
                        'tabular-nums',
                        isActive ? 'text-zinc-400' : 'text-zinc-700'
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Recommendation list */}
        {filtered.length > 0 ? (
          <div className="space-y-2.5">
            {filtered.map((rec, i) => (
              <AuditRecommendationCard
                key={rec.id}
                recommendation={rec}
                index={i}
              />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <AuditEmptyState />
        ) : (
          /* Filtered to zero — different from no recommendations at all */
          <div className="py-8 text-center">
            <p className="text-[11px] text-zinc-600">
              No {activeFilter.toLowerCase()} impact recommendations in this audit.
            </p>
            <button
              type="button"
              onClick={() => setActiveFilter('All')}
              className="mt-2 text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer underline underline-offset-2"
            >
              Show all
            </button>
          </div>
        )}
      </div>

      {/* ── 5. Report Footer ─────────────────────────────────────────────────
          Intentionally low-contrast. Engineering accountability line.
      ─────────────────────────────────────────────────────────────────────── */}
      <div className="border-t border-border/40 px-5 py-3 flex items-center justify-between bg-zinc-950/20">
        <span className="text-[9px] font-mono text-zinc-700">
          CredLens Audit Engine · Rules v3
        </span>
        {summary.subscriptionCost > 0 && (
          <span className="text-[9px] font-mono text-zinc-700 tabular-nums">
            ${summary.subscriptionCost.toLocaleString()}/mo subscription baseline
          </span>
        )}
      </div>
    </div>
  );
}
