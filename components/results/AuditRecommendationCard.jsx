'use client';

import React from 'react';
import { ChevronDown, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProviderIcon from '@/components/audit/ProviderIcon';
import ImpactBadge from './ImpactBadge';

/**
 * Category label — maps rule category to a short, human-readable label
 * that scans like a financial line-item type, not a tech tag.
 */
const CATEGORY_LABELS = {
  redundancy: 'Overlap',
  'tier-mismatch': 'Plan Tier',
  'usage-efficiency': 'API Efficiency',
  governance: 'Governance',
  underutilization: 'Underuse',
};

/**
 * Left accent color per impact level — a single 2px border stripe on the
 * card's left edge. This is how Linear signals issue priority in its list view:
 * color on the leftmost edge, not a background flood.
 */
const IMPACT_ACCENT = {
  High: 'border-l-emerald-500/60',
  Medium: 'border-l-amber-500/40',
  Low: 'border-l-zinc-700/60',
};

/**
 * AuditRecommendationCard — a single expandable recommendation row.
 *
 * Design principles:
 *
 * COLLAPSED STATE — built for scanning, not reading:
 *   [Icon] [Title + Category tag]          [Savings] [Impact] [▼]
 *   Left-aligned identity, right-aligned financial signal.
 *   The explanation one-liner is hidden to keep the list tight.
 *   Savings is the primary right-side number — it's why the user is here.
 *
 * EXPANDED STATE — built for understanding, not impressing:
 *   One paragraph of "Why This Matters" reasoning.
 *   A numbered checklist of concrete steps to implement.
 *   A compact savings math footer showing monthly / annual / the logic.
 *   No decorative elements — the content is the design.
 *
 * @param {Object} recommendation  A single item from auditResult.recommendations[]
 * @param {number} index           0-based position for staggered CSS animation delay
 */
export default function AuditRecommendationCard({ recommendation, index = 0 }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isReviewed, setIsReviewed] = React.useState(false);

  const {
    title,
    explanation,
    whyItMatters,
    estimatedImpact = 'Low',
    estimatedSavings,
    actionableSteps = [],
    provider,
    category,
  } = recommendation;

  const hasSavings = (estimatedSavings?.monthly ?? 0) > 0;
  const categoryLabel = CATEGORY_LABELS[category] ?? category ?? null;
  const accentClass = IMPACT_ACCENT[estimatedImpact] ?? IMPACT_ACCENT.Low;

  return (
    <div
      className={cn(
        // Base card shell
        'group relative rounded-lg border-l-2 border border-border/40 bg-card/60',
        'transition-all duration-200 ease-out',
        // Left accent stripe
        accentClass,
        // Hover / open states
        isExpanded
          ? 'border-border/60 bg-zinc-950/50 shadow-[0_2px_12px_rgba(0,0,0,0.25)]'
          : 'hover:border-border/60 hover:bg-zinc-950/40',
        isReviewed && 'opacity-50 saturate-50 hover:opacity-75'
      )}
      style={{ animationDelay: `${index * 55}ms` }}
    >
      {/* ── Collapsed Row ─────────────────────────────────────────────────────
          Always visible. Must communicate the full recommendation value at a
          glance: what tool, what kind of fix, and how much it saves.
      ────────────────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsExpanded((p) => !p)}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} recommendation: ${title}${isReviewed ? ' (Reviewed)' : ''}`}
        className={cn(
          'flex w-full items-center gap-3.5 px-4 py-3.5 text-left',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded-lg',
          'cursor-pointer'
        )}
      >
        {/* Provider icon — visual anchor for the tool this affects */}
        <ProviderIcon provider={provider} />

        {/* Identity column — title + category tag */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              "text-[12.5px] font-semibold leading-none transition-colors",
              isReviewed ? "line-through text-zinc-500" : "text-zinc-100 group-hover:text-white"
            )}>
              {title}
            </span>
            {categoryLabel && (
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-600 border border-zinc-800/80 rounded px-1 py-0.5 shrink-0">
                {categoryLabel}
              </span>
            )}
          </div>
          {/* Explanation one-liner — shown collapsed so the list stays readable,
              but at a lighter weight than the title so it doesn't compete. */}
          <p className={cn(
            "text-[11px] leading-snug line-clamp-1 pr-2 transition-colors",
            isReviewed ? "text-zinc-600" : "text-zinc-500"
          )}>
            {explanation}
          </p>
        </div>

        {/* Financial signal cluster — right-aligned, always visible */}
        <div className="flex items-center gap-2.5 shrink-0 pl-1">
          {hasSavings ? (
            <div className="text-right">
              <div className="text-[12px] font-mono font-semibold text-emerald-400 tabular-nums leading-none">
                {estimatedSavings.formattedMonthly}
              </div>
              <div className="text-[9px] font-mono text-zinc-700 mt-0.5">
                {estimatedSavings.formattedYearly}/yr
              </div>
            </div>
          ) : (
            /* Governance / operational recs that have no direct $ savings */
            <span className="text-[10px] font-mono text-zinc-600">Operational</span>
          )}
          <ImpactBadge impact={estimatedImpact} />
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 text-zinc-600 transition-transform duration-200 shrink-0',
              isExpanded && 'rotate-180'
            )}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* ── Expanded Detail Panel ──────────────────────────────────────────────
          Rendered below the collapsed row with a smooth entry animation.
          Three sections in order: why → how → math.
          Each section has a clear mono label heading, then the content.
          No decorative borders between sections — whitespace is the separator.
      ────────────────────────────────────────────────────────────────────── */}
      {isExpanded && (
        <div
          className={cn(
            'px-4 pb-5 space-y-5',
            'animate-in fade-in slide-in-from-top-1 duration-200 ease-out'
          )}
        >
          {/* Divider between collapsed row and detail body */}
          <div className="border-t border-border/30" />

          {/* Section 1: Why This Matters ─────────────────────────────────── */}
          <div className="space-y-2">
            <SectionLabel>Why this matters</SectionLabel>
            <p className="text-[12px] text-zinc-400 leading-[1.65] max-w-prose">
              {whyItMatters}
            </p>
          </div>

          {/* Section 2: Actionable Steps ─────────────────────────────────── */}
          {actionableSteps.length > 0 && (
            <div className="space-y-2.5">
              <SectionLabel>How to fix it</SectionLabel>
              <ol className="space-y-2.5">
                {actionableSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {/* Step number — uses the same subtle zinc palette as the
                        rest of the card so it doesn't shout over the content */}
                    <span
                      aria-hidden="true"
                      className="mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-[9px] font-mono font-medium text-zinc-500"
                    >
                      {i + 1}
                    </span>
                    <span className="text-[12px] text-zinc-400 leading-[1.6]">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Section 3: Savings Breakdown ────────────────────────────────── */}
          {hasSavings && (
            <div className="pt-1">
              <SectionLabel>Estimated savings</SectionLabel>
              <div className="mt-2 flex flex-wrap items-start gap-5">
                {/* Monthly */}
                <SavingsStat
                  label="Per month"
                  value={estimatedSavings.formattedMonthly}
                  highlight
                />
                {/* Annual */}
                <SavingsStat
                  label="Per year"
                  value={estimatedSavings.formattedYearly}
                />
                {/* Savings math logic — the "show your work" line */}
                {estimatedSavings.logic && (
                  <div className="flex-1 min-w-0 border-l border-border/30 pl-5 hidden sm:block">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-700 block mb-1">
                      Calculation
                    </span>
                    <p className="text-[10px] font-mono text-zinc-600 leading-relaxed">
                      {estimatedSavings.logic}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CTA affordance — keeps the card actionable without being pushy */}
          <div className="pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsReviewed((r) => !r);
              }}
              aria-label={isReviewed ? "Mark recommendation as active" : "Mark recommendation as reviewed"}
              className={cn(
                "inline-flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider py-1 px-2 rounded border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-900 cursor-pointer transition-colors duration-150",
                isReviewed 
                  ? "text-emerald-400 border-emerald-950/60 bg-emerald-950/20 hover:text-emerald-300 hover:bg-emerald-950/40" 
                  : "text-zinc-500 border-zinc-800 bg-zinc-900/30 hover:text-zinc-300 hover:bg-zinc-900/60"
              )}
            >
              {isReviewed ? (
                <>
                  <span>Reviewed</span>
                  <Check className="h-2.5 w-2.5 text-emerald-400" aria-hidden="true" />
                </>
              ) : (
                <>
                  <span>Mark as reviewed</span>
                  <ArrowRight className="h-2.5 w-2.5" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────────
   Tiny presentational primitives used only inside this file.
   Keeping them local avoids importing bloat for single-use patterns.
────────────────────────────────────────────────────────────────────────── */

/** Section label — mono uppercase, no decoration. Used as a micro-heading. */
function SectionLabel({ children }) {
  return (
    <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-600">
      {children}
    </span>
  );
}

/** A single savings stat column: label + mono value. */
function SavingsStat({ label, value, highlight = false }) {
  return (
    <div>
      <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-700 mb-0.5">
        {label}
      </span>
      <span
        className={cn(
          'font-mono font-semibold tabular-nums text-sm leading-none',
          highlight ? 'text-emerald-400' : 'text-emerald-400/70'
        )}
      >
        {value}
      </span>
    </div>
  );
}
