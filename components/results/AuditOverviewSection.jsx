'use client';

import React, { useState, useMemo } from 'react';
import { Copy, Share2, FileDown, Check, Layers, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PRICING_REGISTRY } from '@/data/pricing';
import { formatCurrency, localizeText } from '@/lib/currency';
import { generateAuditPDF } from '@/lib/pdfBuilder';
import { generateAuditCSV } from '@/lib/csvBuilder';

/**
 * Helper to dynamically scan text for currency values and percentages,
 * wrapping them in clean inline monospaced badges for structural emphasis.
 * 
 * @param {string} text 
 * @returns {React.ReactNode}
 */
export function highlightTelemetryText(text) {
  if (!text || typeof text !== 'string') return text;
  
  // Regular expression to match:
  // - currency like $100, $1,500/mo, $2,450/seat, $0, etc.
  // - percentage rates like 20%, 15.5%
  const regex = /(\$\d{1,3}(?:,\d{3})*(?:\/\w+)?|\d+(?:\.\d+)?%)/g;
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    if (regex.test(part)) {
      return (
        <span 
          key={index} 
          className="font-mono bg-zinc-950 border border-zinc-800/80 px-1.5 py-0.5 rounded text-white text-[11px] font-semibold select-all mx-0.5"
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

/**
 * AuditOverviewSection — a polished, startup-grade financial SaaS reporting panel.
 * 
 * Design Philosophy:
 *   - Stripe-like minimalism: high density, clear typography, dark mode values.
 *   - Trustworthy presentation: avoids hyper-exaggerated marketing visuals.
 *   - Structure: Executive Narrative → 3+2 Metrics Grid → Spend Breakdown Bar → Share/Export Actions.
 * 
 * @param {Object} summary         — The `summary` object from formatAuditReport()
 * @param {Array}  recommendations — Array of recommendations
 * @param {Object} formData        — Form configuration state containing selected tools and seat count
 * @param {string} auditDate       — Pre-formatted audit date string
 */
export default function AuditOverviewSection({ summary, recommendations = [], formData, auditDate = 'Recent', aiSummary, currency = 'USD' }) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [isGeneratingCSV, setIsGeneratingCSV] = useState(false);
  const [csvError, setCsvError] = useState(null);

  const handleDownloadCSV = () => {
    setIsGeneratingCSV(true);
    setCsvError(null);
    try {
      generateAuditCSV({
        summary,
        recommendations,
        formData,
        auditDate,
        currency
      });
    } catch (err) {
      console.error('[CredLens] CSV generation failed:', err);
      setCsvError('Export failed. Please try again.');
      setTimeout(() => setCsvError(null), 5000);
    } finally {
      setIsGeneratingCSV(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    setPdfError(null);
    try {
      await generateAuditPDF({
        summary,
        recommendations,
        formData,
        auditDate,
        aiSummary,
        currency,
        shareId: formData?.shareToken || summary?.shareToken || formData?._id
      });
    } catch (err) {
      console.error('[CredLens] PDF generation failed:', err);
      setPdfError('Export failed. Please try again.');
      setTimeout(() => setPdfError(null), 5000);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Client-side debugging: Log the source of the audit summary
  React.useEffect(() => {
    if (aiSummary) {
      console.log(`[CredLens Debug] Rendering summary. Provider: "${aiSummary.provider}"`);
      if (aiSummary.debugProvider) {
        console.log(`[CredLens Debug] Target Provider: "${aiSummary.debugProvider}"`);
      }
      if (aiSummary.debugError) {
        console.warn(`[CredLens Debug] AI Summary Error: "${aiSummary.debugError}"`);
      }
      console.log(`[CredLens Debug] Summary text:`, aiSummary.executiveSummary);
    } else {
      console.log('[CredLens Debug] Rendering static fallback summary (No AI summary provided).');
    }
  }, [aiSummary]);

  const isRealAi = aiSummary && aiSummary.provider !== 'mock';
  const hasSavings = summary.totalEstimatedSavings > 0;
  const toolCount = formData?.tools?.length ?? 0;

  // Resolve audited tools with plan details from the pricing registry
  const auditedTools = useMemo(() => {
    return (formData?.tools || []).map(toolId => {
      const tool = PRICING_REGISTRY[toolId];
      const planId = formData?.toolPlans?.[toolId];
      const planName = tool?.plans?.[planId]?.name || planId || 'Default';
      return {
        id: toolId,
        name: tool?.name || toolId,
        plan: planName
      };
    });
  }, [formData]);

  // Copy plain text summary to clipboard
  const handleCopySummary = () => {
    const toolsStr = auditedTools.map(t => `${t.name} (${t.plan})`).join(', ');
    let text = `CREDLENS AI SPEND OPTIMIZATION AUDIT REPORT
Generated: ${auditDate}
Audited Coverage: ${toolCount} Tools (${toolsStr})
Team Seat Count: ${formData?.seats || 1} seats

FINANCIAL AUDIT RESULTS:
---------------------------------------------
Current Monthly AI Spend:   ${formatCurrency(summary.totalCurrentSpend, currency)}
Optimized Monthly Spend:    ${formatCurrency(summary.optimizedSpendEstimate, currency)}
Estimated Monthly Savings:  ${hasSavings ? formatCurrency(summary.totalEstimatedSavings, currency, 'mo') : formatCurrency(0, currency, 'mo')}
Estimated Annual Savings:   ${hasSavings ? formatCurrency(summary.totalEstimatedYearlySavings, currency, 'yr') : formatCurrency(0, currency, 'yr')}
Runway Overhead Reduced:    ${hasSavings ? summary.runwayRestoredPercent : 0}%
---------------------------------------------
Baseline Subscriptions:    ${formatCurrency(summary.subscriptionCost || 0, currency, 'mo')}
Volumetric API Spend:       ${formatCurrency(summary.apiSpend || 0, currency, 'mo')}`;

    if (aiSummary?.executiveSummary) {
      text += `\n\nAI EXECUTIVE SUMMARY:\n${localizeText(aiSummary.executiveSummary, currency)}`;
    }
    if (aiSummary?.keyInsights && aiSummary.keyInsights.length > 0) {
      text += `\n\nKEY INSIGHTS:\n` + aiSummary.keyInsights.map((ins, i) => `${i + 1}. ${localizeText(ins, currency)}`).join('\n');
    }
    if (aiSummary?.runwayImpact) {
      text += `\n\nRUNWAY IMPACT:\n${localizeText(aiSummary.runwayImpact, currency)}`;
    }

    text += `\n\nThis report is generated by the CredLens Audit Engine. Recommendations are advisory.`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Real share URL generation based on backend shareToken or MongoDB _id
  const shareId = formData?.shareToken || summary?.shareToken || formData?._id;
  
  const handleShareReport = () => {
    if (!shareId) {
      // No token or ID available — audit was run in browser-only fallback mode
      console.warn('[CredLens] Share unavailable: audit not persisted to database.');
      return;
    }
    
    const url = `${window.location.origin}/share/${shareId}`;
    navigator.clipboard.writeText(url).then(() => {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    });
  };

  // Calculate Subscription vs API allocation percentages
  const spendBreakdown = useMemo(() => {
    const subCost = summary.subscriptionCost || 0;
    const apiCost = summary.apiSpend || 0;
    const total = subCost + apiCost;
    if (total === 0) return { subPercent: 50, apiPercent: 50, hasData: false };
    const subPercent = Math.round((subCost / total) * 100);
    return {
      subPercent,
      apiPercent: 100 - subPercent,
      hasData: true
    };
  }, [summary]);

  return (
    <div className="border-b border-border/50 bg-zinc-950/20 p-5 md:p-6 space-y-6">
      
      {/* ── 1. Executive Narrative Summary ── */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
              {isRealAi ? 'AI Generated Audit Summary' : 'Executive Summary'}
            </span>
            {aiSummary?.debugError && (
              <span className="text-[10px] font-mono text-red-400 bg-red-950/30 border border-red-900/30 px-1.5 py-0.5 rounded cursor-help" title={aiSummary.debugError}>
                AI Error: {aiSummary.debugError.length > 50 ? `${aiSummary.debugError.substring(0, 47)}...` : aiSummary.debugError}
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950/50 border border-border/20 px-2 py-0.5 rounded">
            Audit Date: {auditDate}
          </span>
        </div>
        
        <p className="text-zinc-300 text-xs md:text-sm leading-[1.65] max-w-3xl font-normal">
          {aiSummary?.executiveSummary ? (
            highlightTelemetryText(localizeText(aiSummary.executiveSummary, currency))
          ) : (
            <>
              Based on an analysis of <strong className="text-white font-medium">{toolCount} active AI tools</strong> and a team size of <strong className="text-white font-medium">{formData?.seats || 1}</strong>, we identified <strong className="text-emerald-400 font-medium">{hasSavings ? formatCurrency(summary.totalEstimatedSavings, currency) : formatCurrency(0, currency)}</strong> in potential monthly spend optimization. Addressing these issues consolidates your run-rate from <strong className="text-zinc-400 font-medium">{formatCurrency(summary.totalCurrentSpend, currency, 'mo')}</strong> to <strong className="text-white font-medium">{formatCurrency(summary.optimizedSpendEstimate, currency, 'mo')}</strong>, recovering <strong className="text-emerald-400 font-medium">{hasSavings ? summary.runwayRestoredPercent : 0}%</strong> of active AI spend and securing <strong className="text-emerald-400 font-medium">{hasSavings ? formatCurrency(summary.totalEstimatedYearlySavings, currency, 'yr') : formatCurrency(0, currency, 'yr')}</strong> in annualized runway.
            </>
          )}
        </p>

        {/* ── Key Insights Ledger ── */}
        {aiSummary?.keyInsights && aiSummary.keyInsights.length > 0 && (
          <div className="mt-5 pt-4 border-t border-border/10 space-y-3">
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block mb-1">
              Key Insights & Observations
            </span>
            <div className="space-y-2">
              {aiSummary.keyInsights.map((insight, idx) => (
                <div 
                  key={idx} 
                  className="group/insight flex items-start gap-3.5 text-zinc-400 hover:text-zinc-200 transition-colors duration-150 py-2 border-b border-border/10 last:border-0"
                >
                  <span className="flex items-center justify-center h-4.5 w-4.5 rounded font-mono text-[9px] font-bold bg-zinc-950 border border-zinc-800/80 text-zinc-500 group-hover/insight:text-emerald-400 group-hover/insight:border-emerald-950/60 transition-colors shrink-0 select-none">
                    0{idx + 1}
                  </span>
                  <span className="leading-relaxed flex-1 text-xs">
                    {highlightTelemetryText(localizeText(insight, currency))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 2. Financial Metrics Grid (3+2 Layout) ── */}
      <div className="space-y-4">
        {/* Top Tier: Primary Row (3 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border border-border/40 rounded-lg overflow-hidden bg-zinc-950/40">
          
          {/* Current Spend */}
          <div className="group/tile flex flex-col gap-1 p-4 border-b sm:border-b-0 sm:border-r border-border/30 hover:bg-zinc-900/10 transition-colors select-none">
            <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase flex items-center gap-1">
              Current Monthly Spend
            </span>
            <div className="text-lg md:text-xl font-semibold tracking-tight text-zinc-400 tabular-nums">
              {formatCurrency(summary.totalCurrentSpend, currency)}
            </div>
            <span className="text-[10.5px] text-zinc-500">
              Active operating baseline
            </span>
          </div>

          {/* After Optimization */}
          <div className="group/tile flex flex-col gap-1 p-4 border-b sm:border-b-0 sm:border-r border-border/30 hover:bg-zinc-900/10 transition-colors select-none">
            <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
              Target Monthly Spend
            </span>
            <div className="text-lg md:text-xl font-semibold tracking-tight text-white tabular-nums">
              {formatCurrency(summary.optimizedSpendEstimate, currency)}
            </div>
            <span className="text-[10.5px] text-zinc-500">
              Post-optimization target
            </span>
          </div>

          {/* Monthly Savings */}
          <div className="group/tile flex flex-col gap-1 p-4 hover:bg-zinc-900/10 transition-colors select-none">
            <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
              Net Monthly Savings
            </span>
            <div className={cn(
              "text-lg md:text-xl font-semibold tracking-tight tabular-nums",
              hasSavings ? "text-emerald-400" : "text-zinc-500"
            )}>
              {hasSavings ? formatCurrency(summary.totalEstimatedSavings, currency, 'mo') : formatCurrency(0, currency, 'mo')}
            </div>
            <span className="text-[10.5px] text-zinc-500">
              {hasSavings ? `${summary.runwayRestoredPercent}% overhead reduction` : 'Stack fully optimized'}
            </span>
          </div>
        </div>

        {/* Bottom Tier: Secondary Row (2 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Annual Impact (Hero Card) */}
          <div className={cn(
            "rounded-lg p-5 flex flex-col justify-between border select-none transition-all duration-200",
            hasSavings 
              ? "bg-emerald-950/5 border-emerald-900/30 shadow-[inset_0_1px_1px_rgba(16,185,129,0.05)] hover:border-emerald-800/40" 
              : "bg-zinc-900/10 border-border/40 hover:border-zinc-800"
          )}>
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block">
                Annual Runway Impact
              </span>
              <div className={cn(
                "text-2xl md:text-3xl font-semibold tracking-tight tabular-nums",
                hasSavings ? "text-emerald-400" : "text-zinc-400"
              )}>
                {hasSavings ? formatCurrency(summary.totalEstimatedYearlySavings, currency, 'yr') : formatCurrency(0, currency, 'yr')}
              </div>
            </div>
            <p className="mt-3.5 text-[11.5px] text-zinc-500 leading-relaxed font-normal">
              {aiSummary?.runwayImpact ? (
                highlightTelemetryText(localizeText(aiSummary.runwayImpact, currency))
              ) : hasSavings ? (
                "This is the annualized capital recovery available to extend runway or reinvest in core software capabilities."
              ) : (
                "No redundancies detected. Your subscription plans match team seat allocations and API configurations."
              )}
            </p>
          </div>

          {/* Audit Coverage (Audit Scope Card) */}
          <div className="rounded-lg p-5 border border-border/40 bg-zinc-900/10 hover:border-zinc-800 transition-colors flex flex-col justify-between select-none">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block">
                Audit Scope Coverage
              </span>
              <div className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-300 tabular-nums">
                {toolCount} Tool{toolCount !== 1 ? 's' : ''}
              </div>
            </div>

            {/* List of audited badges */}
            <div className="mt-4 flex flex-wrap gap-1.5 max-h-[56px] overflow-y-auto pr-1 select-none">
              {auditedTools.map((t) => (
                <span 
                  key={t.id}
                  title={`Tool: ${t.name} (Plan: ${t.plan})`}
                  className="inline-flex items-center rounded bg-zinc-950/60 border border-border/60 hover:border-zinc-700 px-2 py-0.5 text-[8.5px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-help"
                >
                  {t.name}
                  <span className="mx-1.5 text-zinc-500">·</span>
                  <span className="text-zinc-400">{t.plan}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Spend Breakdown Visualizer ── */}
      <div className="space-y-3 pt-4 border-t border-border/20">
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase">
          <span className="flex items-center gap-1.5">
            <Layers className="h-3 w-3" />
            Spend Distribution Breakdown
          </span>
          <span className="text-zinc-500">
            Subscriptions vs APIs
          </span>
        </div>

        {/* Stacked bar */}
        <div className="h-2.5 w-full rounded-full overflow-hidden bg-zinc-900 border border-zinc-800/60 flex p-[1px]">
          {spendBreakdown.hasData ? (
            <>
              <div 
                className="bg-zinc-400 h-full rounded-l-full transition-all duration-300" 
                style={{ width: `${spendBreakdown.subPercent}%` }}
                title={`Subscriptions: ${spendBreakdown.subPercent}%`}
              />
              <div 
                className="bg-zinc-600 h-full rounded-r-full transition-all duration-300 -ml-[1px]" 
                style={{ width: `${spendBreakdown.apiPercent}%` }}
                title={`API Volumetrics: ${spendBreakdown.apiPercent}%`}
              />
            </>
          ) : (
            <div className="w-full h-full bg-zinc-950 rounded-full" />
          )}
        </div>

        {/* Breakdown subtext labels */}
        <div className="flex items-center justify-between text-[10px] select-none">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
              Subscriptions: <strong className="text-zinc-300 tabular-nums font-semibold">{formatCurrency(summary.subscriptionCost || 0, currency, 'mo')}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
              APIs: <strong className="text-zinc-300 tabular-nums font-semibold">{formatCurrency(summary.apiSpend || 0, currency, 'mo')}</strong>
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 flex items-center gap-1">
            <Info className="h-2.5 w-2.5" />
            Telemetry models synchronized hourly
          </span>
        </div>
      </div>

      {/* ── 4. Actionable Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/20">
        
        {/* Active Clipboard Functions */}
        <div className="flex items-center gap-2">
          {/* Copy Report */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCopySummary}
            className="h-8 gap-1.5 text-[10px] uppercase font-mono tracking-wider border border-border hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:outline-none"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                Copied Report
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy Summary
              </>
            )}
          </Button>

          {/* Share link */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleShareReport}
            disabled={!shareId}
            title={!shareId ? 'Share unavailable — audit was not saved to database' : 'Copy shareable link'}
            className="h-8 gap-1.5 text-[10px] uppercase font-mono tracking-wider border border-border hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {shared ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                Link Copied
              </>
            ) : (
              <>
                <Share2 className="h-3 w-3" />
                Share Report
              </>
            )}
          </Button>
        </div>

        {/* Future Scalability Placeholders (Muted) */}
        <div className="flex items-center gap-1.5 select-none">
          {pdfError && (
            <span className="text-[9px] font-mono text-red-400 bg-red-950/20 border border-red-900/30 px-2 py-0.5 rounded animate-pulse shrink-0">
              {pdfError}
            </span>
          )}
          {csvError && (
            <span className="text-[9px] font-mono text-red-400 bg-red-950/20 border border-red-900/30 px-2 py-0.5 rounded animate-pulse shrink-0">
              {csvError}
            </span>
          )}

          {/* CSV Export */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleDownloadCSV}
            disabled={isGeneratingCSV}
            className="h-8 gap-1.5 text-[10px] uppercase font-mono tracking-wider border border-border hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isGeneratingCSV ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-emerald-400" />
                Generating...
              </>
            ) : (
              <>
                <FileDown className="h-3 w-3" />
                Export CSV
              </>
            )}
          </Button>

          {/* PDF Export */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="h-8 gap-1.5 text-[10px] uppercase font-mono tracking-wider border border-border hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-emerald-400" />
                Generating...
              </>
            ) : (
              <>
                <FileDown className="h-3 w-3" />
                PDF Report
              </>
            )}
          </Button>
        </div>
      </div>
      
    </div>
  );
}
