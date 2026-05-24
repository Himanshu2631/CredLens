/**
 * lib/dashboard/metrics.js
 *
 * Pure utility functions for deriving all dashboard metrics from a saved
 * audit document. Keeping derivation logic here (not in the API route or
 * page component) means every calculation is testable and the API route
 * stays thin.
 */

// ---------------------------------------------------------------------------
// Provider Mapping
// Maps pricing registry tool IDs → display provider buckets with visual style
// ---------------------------------------------------------------------------
const PROVIDER_MAP = {
  openai_api:   { bucket: 'OpenAI',       color: 'bg-white' },
  chatgpt:      { bucket: 'OpenAI',       color: 'bg-white' },
  copilot:      { bucket: 'OpenAI',       color: 'bg-white' },
  claude:       { bucket: 'Anthropic',    color: 'bg-zinc-400' },
  anthropic_api:{ bucket: 'Anthropic',    color: 'bg-zinc-400' },
  gemini:       { bucket: 'Google',       color: 'bg-zinc-600' },
  cursor:       { bucket: 'Specialized',  color: 'bg-zinc-800' },
  v0_dev:       { bucket: 'Specialized',  color: 'bg-zinc-800' },
};

const PROVIDER_DISPLAY_NAMES = {
  OpenAI:      'OpenAI (API & Enterprise)',
  Anthropic:   'Anthropic (Claude API)',
  Google:      'Google Gemini (Workspace & API)',
  Specialized: 'Specialized Providers',
};

const PROVIDER_COLORS = {
  OpenAI:      'bg-white',
  Anthropic:   'bg-zinc-400',
  Google:      'bg-zinc-600',
  Specialized: 'bg-zinc-800',
};

const PROVIDER_ORDER = ['OpenAI', 'Anthropic', 'Google', 'Specialized'];

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Format a number as a compact USD string.
 * @param {number} n
 * @returns {string}
 */
function formatUSD(n) {
  if (!n || n <= 0) return '$0';
  if (n >= 1000) {
    return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  }
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

/**
 * Format a number as a percentage string (0 decimal places).
 * @param {number} n  Value between 0–100
 * @returns {string}
 */
function formatPct(n) {
  return `${Math.round(Math.max(0, Math.min(100, n)))}%`;
}

/**
 * Clamp a value between min and max.
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// ---------------------------------------------------------------------------
// 1. Metric Cards
// ---------------------------------------------------------------------------

/**
 * Derives the 4 KPI metric card values from the latest audit.
 *
 * @param {Object} audit  - Lean Mongoose document (Audit model)
 * @returns {{ monthlySavings, annualRunway, efficiencyScore, seatEfficiency }}
 */
export function deriveMetricCards(audit) {
  const summary = audit.summary || {};

  // Monthly savings — directly from the audit engine output
  const monthlySavings = summary.totalEstimatedSavings || 0;

  // Annual runway recovery — simple ×12
  const annualRunway = monthlySavings * 12;

  // Cost efficiency score: how much of the spend is being optimized away
  // Formula: (savings / currentSpend) × 100, clamped 0–100
  const currentSpend = summary.totalCurrentSpend || summary.currentMonthlySpend || 1;
  const efficiencyScore = clamp((monthlySavings / currentSpend) * 100, 0, 100);

  // Seat efficiency: active seats / total seats × 100
  const totalSeats = audit.seats || 1;
  const inactiveSeats = audit.inactiveSeats || 0;
  const activeSeats = totalSeats - inactiveSeats;
  const seatEfficiency = clamp((activeSeats / totalSeats) * 100, 0, 100);

  return {
    monthlySavings: formatUSD(monthlySavings),
    annualRunway: formatUSD(annualRunway),
    efficiencyScore: formatPct(efficiencyScore),
    seatEfficiency: formatPct(seatEfficiency),
    // Raw values for trend calculations
    raw: { monthlySavings, annualRunway, efficiencyScore, seatEfficiency },
  };
}

// ---------------------------------------------------------------------------
// 2. Provider Allocation (TelemetryChart)
// ---------------------------------------------------------------------------

/**
 * Derives the AI provider spend allocation from the audit's selected tools
 * and monthly spend figure.
 *
 * Allocates the reported monthlySpend proportionally across provider buckets
 * based on how many tools belong to each provider. When no tools are selected
 * we return an empty array.
 *
 * @param {Object} audit
 * @returns {{ name: string, percent: number, spend: string, color: string }[]}
 */
export function deriveProviderAllocation(audit) {
  const tools = audit.tools || [];
  const totalSpend = audit.monthlySpend || audit.summary?.totalCurrentSpend || 0;

  if (!tools.length || totalSpend <= 0) return [];

  // Count tool weight per provider bucket
  const bucketWeights = {};
  tools.forEach((toolId) => {
    const mapping = PROVIDER_MAP[toolId];
    const bucket = mapping ? mapping.bucket : 'Specialized';
    bucketWeights[bucket] = (bucketWeights[bucket] || 0) + 1;
  });

  const totalWeight = Object.values(bucketWeights).reduce((a, b) => a + b, 0);

  // Build sorted provider entries (in display order, skip empty buckets)
  return PROVIDER_ORDER
    .filter((bucket) => bucketWeights[bucket] > 0)
    .map((bucket) => {
      const weight = bucketWeights[bucket] || 0;
      const percent = Math.round((weight / totalWeight) * 100);
      const spendAmt = (weight / totalWeight) * totalSpend;
      return {
        name: PROVIDER_DISPLAY_NAMES[bucket],
        percent,
        spend: formatUSD(spendAmt),
        color: PROVIDER_COLORS[bucket],
        trend: 'Current audit',
      };
    });
}

// ---------------------------------------------------------------------------
// 3. Redundancy Alerts (RedundancyAlerts)
// ---------------------------------------------------------------------------

/**
 * Derives active redundancy alerts from high-priority recommendations.
 *
 * @param {Object} audit
 * @returns {{ id, title, description, impact, severity }[]}
 */
export function deriveRedundancyAlerts(audit) {
  const recs = audit.recommendations || [];

  return recs
    .filter((r) => r.priority === 'high')
    .slice(0, 3) // Cap at 3 alerts for readability
    .map((r, idx) => ({
      id: r.id || `alert-${idx}`,
      title: r.title,
      description: r.whyItMatters || r.explanation || r.description || '',
      impact: r.estimatedSavings?.formattedMonthly || `$${r.estimatedMonthlySavings || 0}/mo savings`,
      severity: 'high',
    }));
}

/**
 * Derives the risk matrix rows from all recommendations.
 *
 * @param {Object} audit
 * @returns {{ action, risk, impact, savings, color }[]}
 */
export function deriveRiskMatrix(audit) {
  const recs = audit.recommendations || [];

  const RISK_STYLES = {
    high:   'text-emerald-400 border-emerald-950/40 bg-emerald-950/10',
    medium: 'text-amber-400 border-amber-950/40 bg-amber-950/10',
    low:    'text-zinc-400 border-zinc-800/40 bg-zinc-900/20',
  };

  const IMPACT_LABELS = {
    high:   'High Impact',
    medium: 'Medium Impact',
    low:    'Low Impact',
  };

  const RISK_LABELS = {
    high:   'Low Risk',    // High savings = straightforward action
    medium: 'Medium Risk',
    low:    'Low Risk',
  };

  return recs
    .slice(0, 5) // Top 5 only
    .map((r) => {
      const priority = r.priority || 'medium';
      const savings = r.estimatedSavings?.formattedMonthly || `$${r.estimatedMonthlySavings || 0}/mo`;
      return {
        action: r.title,
        risk: RISK_LABELS[priority] || 'Medium Risk',
        impact: IMPACT_LABELS[priority] || 'Medium Impact',
        savings,
        color: RISK_STYLES[priority] || RISK_STYLES.medium,
      };
    });
}

// ---------------------------------------------------------------------------
// 4. Insight Feed (InsightFeed)
// ---------------------------------------------------------------------------

/**
 * Derives a timestamped insight event feed from real audit metadata.
 * Events are grounded in the actual audit — no fabricated content.
 *
 * @param {Object} audit
 * @returns {{ id, type, title, description, timestamp, iconKey, color }[]}
 */
export function deriveInsightEvents(audit) {
  const events = [];
  const recs = audit.recommendations || [];
  const tools = audit.tools || [];
  const summary = audit.summary || {};
  const auditDate = audit.createdAt ? new Date(audit.createdAt) : new Date();

  // Format relative time string
  const relTime = formatRelativeTime(auditDate);

  // Event 1: Audit completed — always present
  const totalSavings = summary.formattedEstimatedSavings || formatUSD(summary.totalEstimatedSavings || 0);
  events.push({
    id: 'evt-audit-complete',
    type: 'milestone',
    title: 'Spend audit completed',
    description: `Analyzed ${tools.length} AI tool${tools.length !== 1 ? 's' : ''} across your stack. ${totalSavings}/mo in potential savings identified and locked.`,
    timestamp: relTime,
    iconKey: 'CheckCircle2',
    color: 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30',
  });

  // Event 2: High-priority recommendation (if any)
  const highRec = recs.find((r) => r.priority === 'high');
  if (highRec) {
    events.push({
      id: 'evt-high-priority',
      type: 'warning',
      title: highRec.title,
      description: highRec.estimatedImpact || highRec.whyItMatters || '',
      timestamp: relTime,
      iconKey: 'ShieldAlert',
      color: 'text-red-400 bg-red-950/20 border-red-900/30',
    });
  }

  // Event 3: Seat utilization summary (if inactive seats present or estimated)
  const inactiveSeats = audit.inactiveSeats || 0;
  const totalSeats = audit.seats || 0;
  if (totalSeats > 1) {
    const activeSeats = totalSeats - inactiveSeats;
    events.push({
      id: 'evt-seat-audit',
      type: 'sync',
      title: 'Seat utilization profiled',
      description: `${activeSeats} of ${totalSeats} registered seats are active${inactiveSeats > 0 ? `. ${inactiveSeats} inactive seat${inactiveSeats !== 1 ? 's' : ''} flagged for deactivation.` : '. No inactive seats detected.'}`,
      timestamp: relTime,
      iconKey: 'UserCheck',
      color: 'text-zinc-400 bg-zinc-900/40 border-zinc-800/40',
    });
  }

  // Event 4: Medium-priority recommendation (if any, and different from high)
  const medRec = recs.find((r) => r.priority === 'medium' && r.id !== highRec?.id);
  if (medRec) {
    events.push({
      id: 'evt-medium-rec',
      type: 'spike',
      title: medRec.title,
      description: medRec.estimatedImpact || medRec.explanation || '',
      timestamp: relTime,
      iconKey: 'Flame',
      color: 'text-amber-400 bg-amber-950/20 border-amber-900/30',
    });
  }

  return events.slice(0, 4);
}

// ---------------------------------------------------------------------------
// 5. Top-level orchestrator
// ---------------------------------------------------------------------------

/**
 * Derives the complete dashboard payload from a single audit document.
 * This is the only function the API route needs to call.
 *
 * @param {Object} audit  Lean Mongoose document
 * @returns {Object}      Full dashboard payload
 */
export function deriveDashboardMetrics(audit) {
  const metricCards = deriveMetricCards(audit);
  const providers = deriveProviderAllocation(audit);
  const alerts = deriveRedundancyAlerts(audit);
  const riskMatrix = deriveRiskMatrix(audit);
  const events = deriveInsightEvents(audit);

  const totalSpend = audit.summary?.totalCurrentSpend || audit.monthlySpend || 0;

  return {
    metricCards,
    providers,
    totalSpend: formatUSD(totalSpend) + '/mo',
    alerts,
    riskMatrix,
    events,
    auditMeta: {
      auditId: audit._id?.toString() || '',
      projectName: audit.projectName || 'Unknown Project',
      tools: audit.tools || [],
      seats: audit.seats || 0,
      createdAt: audit.createdAt || null,
      recommendationCount: (audit.recommendations || []).length,
    },
  };
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function formatRelativeTime(date) {
  const now = Date.now();
  const diffMs = now - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
