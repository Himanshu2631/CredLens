/**
 * lib/dashboard/intelligence.js
 *
 * Overlap detection, severity scoring, and insight generation for the
 * Cost Optimization Dashboard.
 *
 * Design principle: this module reads the stored `recommendations` and the
 * raw `tools` array from a saved audit. It NEVER re-runs financial math —
 * all dollar figures come from what the rulesEngine already computed and
 * persisted. This avoids duplicating calculation logic and keeps the
 * dashboard layer as a pure "interpreter" of existing audit results.
 */

// ---------------------------------------------------------------------------
// Overlap Catalog
// Defines every known tool-pair overlap pattern with context for display.
// Financial impact is always sourced from the stored recommendations, not
// calculated here. The catalog only supplies display copy and metadata.
// ---------------------------------------------------------------------------

const OVERLAP_CATALOG = [
  {
    id: 'cursor-copilot',
    tools: ['cursor', 'copilot'],
    category: 'coding_assistant',
    severity: 'high',
    title: 'Code Assistant Seat Overlap Detected',
    description:
      'Cursor and GitHub Copilot both provide AI-assisted code completion. ' +
      'Running both simultaneously means your team is paying for duplicate inline suggestions. ' +
      'Consolidating onto Cursor eliminates redundant Copilot licenses.',
    ruleId: 'rule-copilot-cursor-overlap',
    overlappingCapability: 'AI code completion',
    consolidateTo: 'Cursor Pro',
  },
  {
    id: 'chatgpt-claude',
    tools: ['chatgpt', 'claude'],
    category: 'conversational_ai',
    severity: 'medium',
    title: 'Dual Conversational AI Subscriptions Active',
    description:
      'ChatGPT and Claude serve overlapping general-purpose AI chat use cases. ' +
      'Unless workloads are intentionally split by task type, one subscription is redundant. ' +
      'Standardizing to a single provider simplifies billing and improves governance.',
    ruleId: 'rule-general-chat-overlap',
    overlappingCapability: 'General-purpose AI chat',
    consolidateTo: 'Primary provider by use case',
  },
  {
    id: 'chatgpt-gemini',
    tools: ['chatgpt', 'gemini'],
    category: 'conversational_ai',
    severity: 'medium',
    title: 'ChatGPT + Gemini Workspace Overlap',
    description:
      'ChatGPT and Gemini Workspace both cover general AI assistance and writing tasks. ' +
      'Teams integrated with Google Workspace should consolidate on Gemini to avoid double billing.',
    ruleId: 'rule-general-chat-overlap',
    overlappingCapability: 'AI writing & analysis',
    consolidateTo: 'Gemini (if Google Workspace) or ChatGPT',
  },
  {
    id: 'claude-gemini',
    tools: ['claude', 'gemini'],
    category: 'conversational_ai',
    severity: 'low',
    title: 'Claude + Gemini Workspace Overlap',
    description:
      'Claude and Gemini both handle long-context document tasks and general reasoning. ' +
      'Evaluating primary workload type can reduce subscriptions to one provider.',
    ruleId: 'rule-general-chat-overlap',
    overlappingCapability: 'Long-context reasoning',
    consolidateTo: 'Gemini (Workspace integration) or Claude',
  },
  {
    id: 'openai-anthropic-api',
    tools: ['openai_api', 'anthropic_api'],
    category: 'api_duplication',
    severity: 'medium',
    title: 'Dual API Providers Without Defined Routing',
    description:
      'OpenAI API and Anthropic API are both active. Without explicit model routing by task type ' +
      '(e.g. Claude for long-context, GPT-4o for tool-use), teams often duplicate calls. ' +
      'Defining a routing strategy reduces per-token costs significantly.',
    ruleId: null,
    overlappingCapability: 'Foundation model API access',
    consolidateTo: 'Route by task type',
  },
  {
    id: 'chatgpt-claude-gemini',
    tools: ['chatgpt', 'claude', 'gemini'],
    category: 'conversational_ai',
    severity: 'high',
    title: 'Three Conversational AI Subscriptions Detected',
    description:
      'ChatGPT, Claude, and Gemini Workspace are all active simultaneously. ' +
      'This is the highest-cost redundancy pattern in AI tooling — eliminating two of three ' +
      'subscriptions can recover significant monthly runway.',
    ruleId: 'rule-general-chat-overlap',
    overlappingCapability: 'AI chat & reasoning',
    consolidateTo: 'One primary provider',
  },
];

// ---------------------------------------------------------------------------
// Severity Scoring
// ---------------------------------------------------------------------------

const SEVERITY_WEIGHTS = { high: 3, medium: 2, low: 1 };

/**
 * Scores the overall overlap severity for a detected overlap pattern.
 * Higher score = higher dashboard priority.
 *
 * @param {string} severity  'high' | 'medium' | 'low'
 * @param {number} monthlySavings  Dollar impact (0 if unknown)
 * @returns {number}  0–10 priority score
 */
export function scoreOverlapSeverity(severity, monthlySavings = 0) {
  const base = (SEVERITY_WEIGHTS[severity] || 1) * 2;        // 2–6 from severity
  const savingsBoost = Math.min(monthlySavings / 200, 4);    // 0–4 from dollar impact
  return Math.min(base + savingsBoost, 10);
}

/**
 * Derives a 0–100 optimization score representing how much of the current
 * spend is recoverable based on the audit's identified savings.
 *
 * @param {number} totalSavings   Monthly savings identified
 * @param {number} currentSpend   Current monthly spend baseline
 * @param {number} recCount       Number of recommendations fired
 * @returns {number}  Optimization score (0–100)
 */
export function scoreOptimization(totalSavings, currentSpend, recCount) {
  if (!currentSpend || currentSpend <= 0) return 0;

  const savingsPct = Math.min((totalSavings / currentSpend) * 100, 60); // Cap at 60
  const recBonus = Math.min(recCount * 3, 20);                           // Up to 20 bonus
  const raw = savingsPct + recBonus;
  return Math.round(Math.min(raw, 100));
}

// ---------------------------------------------------------------------------
// Overlap Detection
// ---------------------------------------------------------------------------

/**
 * Detects which overlap patterns are present based on the audit's tool list.
 * Returns overlaps sorted by priority (3-tool patterns first, then severity).
 *
 * @param {string[]} tools  Tool IDs from the audit
 * @returns {Object[]}      Matched catalog entries with presence flag
 */
export function detectToolOverlaps(tools) {
  if (!tools || !tools.length) return [];

  const toolSet = new Set(tools);

  return OVERLAP_CATALOG
    .filter((overlap) =>
      // All tools in this overlap pattern must be present in the audit
      overlap.tools.every((t) => toolSet.has(t))
    )
    .filter((overlap, idx, arr) => {
      // De-duplicate: if a 3-tool pattern matches, suppress 2-tool subsets
      const toolsSorted = [...overlap.tools].sort().join(',');
      const isSupersetPresent = arr.some(
        (other) =>
          other.id !== overlap.id &&
          other.tools.length > overlap.tools.length &&
          overlap.tools.every((t) => other.tools.includes(t))
      );
      return !isSupersetPresent;
    })
    .sort((a, b) => {
      // 3-tool patterns first, then by severity weight
      const lenDiff = b.tools.length - a.tools.length;
      if (lenDiff !== 0) return lenDiff;
      return (SEVERITY_WEIGHTS[b.severity] || 1) - (SEVERITY_WEIGHTS[a.severity] || 1);
    });
}

// ---------------------------------------------------------------------------
// Dynamic Redundancy Alerts
// ---------------------------------------------------------------------------

/**
 * Builds rich redundancy alert entries combining:
 * 1. Detected tool overlap patterns (structural, from the tools array)
 * 2. Stored high-priority recommendations (financial, from the rulesEngine)
 *
 * Financial figures always come from the stored recommendations — never
 * re-calculated here. Pattern detection from tools covers cases where a
 * rule fired but the recommendation phrasing isn't overlap-specific.
 *
 * @param {Object} audit  Lean Mongoose audit document
 * @returns {{ id, title, description, impact, severity, source }[]}
 */
export function deriveSmartRedundancyAlerts(audit) {
  const tools = audit.tools || [];
  const recs = audit.recommendations || [];

  // Build a recommendation lookup keyed by rule ID for quick enrichment
  const recByRuleId = {};
  recs.forEach((r) => {
    if (r.id) recByRuleId[r.id] = r;
  });

  const alerts = [];

  // 1. Overlap-based alerts: detected from the tools array, enriched with
  //    saved savings figures where a matching recommendation exists.
  const detectedOverlaps = detectToolOverlaps(tools);

  detectedOverlaps.forEach((overlap) => {
    const matchedRec = overlap.ruleId ? recByRuleId[overlap.ruleId] : null;
    const impact = matchedRec
      ? (matchedRec.estimatedSavings?.formattedMonthly || `$${matchedRec.estimatedMonthlySavings || 0}/mo savings`)
      : 'Consolidation opportunity';
    const impactRaw = matchedRec
      ? (matchedRec.estimatedSavings?.monthly || matchedRec.estimatedMonthlySavings || 0)
      : null;

    alerts.push({
      id: `overlap-${overlap.id}`,
      title: overlap.title,
      description: overlap.description,
      impact,
      impactRaw,
      severity: overlap.severity,
      source: 'overlap',
    });
  });

  // 2. High-priority recommendations that aren't already covered by an overlap
  //    (e.g. oversized enterprise plans, API strategy issues)
  const overlapRuleIds = new Set(
    detectedOverlaps.map((o) => o.ruleId).filter(Boolean)
  );

  recs
    .filter((r) => r.priority === 'high' && !overlapRuleIds.has(r.id))
    .slice(0, 2) // Cap to avoid noise
    .forEach((r, idx) => {
      alerts.push({
        id: r.id || `rec-high-${idx}`,
        title: r.title,
        description: r.whyItMatters || r.explanation || r.description || '',
        impact: r.estimatedSavings?.formattedMonthly || `$${r.estimatedMonthlySavings || 0}/mo savings`,
        impactRaw: r.estimatedSavings?.monthly || r.estimatedMonthlySavings || 0,
        severity: 'high',
        source: 'recommendation',
      });
    });

  // Sort: overlap-detected alerts first (more specific), then by severity
  alerts.sort((a, b) => {
    if (a.source === 'overlap' && b.source !== 'overlap') return -1;
    if (b.source === 'overlap' && a.source !== 'overlap') return 1;
    return (SEVERITY_WEIGHTS[b.severity] || 1) - (SEVERITY_WEIGHTS[a.severity] || 1);
  });

  return alerts.slice(0, 4); // Max 4 alerts
}

// ---------------------------------------------------------------------------
// Dynamic Risk Matrix
// ---------------------------------------------------------------------------

/**
 * Builds the optimization action risk matrix from all recommendations,
 * scored and sorted by opportunity size and action feasibility.
 *
 * @param {Object} audit
 * @returns {{ action, risk, impact, savings, color }[]}
 */
export function deriveSmartRiskMatrix(audit) {
  const recs = audit.recommendations || [];

  const RISK_STYLES = {
    high:   'text-emerald-400 border-emerald-950/40 bg-emerald-950/10',
    medium: 'text-amber-400 border-amber-950/40 bg-amber-950/10',
    low:    'text-zinc-400 border-zinc-800/40 bg-zinc-900/20',
  };

  // Category → implementation risk (higher savings categories tend to be lower risk)
  const CATEGORY_RISK = {
    redundancy:       'Low Risk',
    'tier-mismatch':  'Low Risk',
    underutilization: 'Low Risk',
    'usage-efficiency': 'Medium Risk',
    governance:       'Medium Risk',
  };

  const IMPACT_LABELS = {
    high:   'High Impact',
    medium: 'Medium Impact',
    low:    'Low Impact',
  };

  // Sort by monthly savings descending for the risk matrix (biggest wins first)
  return [...recs]
    .sort((a, b) => {
      const sa = a.estimatedSavings?.monthly || a.estimatedMonthlySavings || 0;
      const sb = b.estimatedSavings?.monthly || b.estimatedMonthlySavings || 0;
      return sb - sa;
    })
    .slice(0, 5)
    .map((r) => {
      const priority = r.priority || 'medium';
      const savings = r.estimatedSavings?.formattedMonthly || `$${r.estimatedMonthlySavings || 0}/mo`;
      const risk = CATEGORY_RISK[r.category] || 'Medium Risk';
      return {
        action: r.title,
        risk,
        impact: IMPACT_LABELS[priority] || 'Medium Impact',
        savings,
        savingsRaw: r.estimatedSavings?.monthly || r.estimatedMonthlySavings || 0,
        color: RISK_STYLES[priority] || RISK_STYLES.medium,
      };
    });
}

// ---------------------------------------------------------------------------
// Dynamic Activity Feed
// ---------------------------------------------------------------------------

/**
 * Generates a contextual, audit-grounded activity event feed.
 *
 * Events are derived from:
 *  - Detected tool overlaps (structural findings)
 *  - Stored recommendations (financial findings)
 *  - Seat utilization data
 *  - Audit completion metadata
 *
 * No fabricated events — every entry refers to something that actually
 * appears in the audit.
 *
 * @param {Object}   audit
 * @param {Object[]} detectedOverlaps  Pre-computed from detectToolOverlaps()
 * @returns {{ id, type, title, description, timestamp, iconKey, color }[]}
 */
export function deriveSmartInsightEvents(audit, detectedOverlaps = []) {
  const events = [];
  const recs = audit.recommendations || [];
  const tools = audit.tools || [];
  const summary = audit.summary || {};
  const auditDate = audit.createdAt ? new Date(audit.createdAt) : new Date();
  const relTime = formatRelativeTime(auditDate);

  // ── Event 1: Audit completed (always present) ──────────────────────────
  const totalSavings =
    summary.formattedEstimatedSavings || formatCompactUSD(summary.totalEstimatedSavings || 0);
  const recCount = recs.length;

  events.push({
    id: 'evt-audit-complete',
    type: 'milestone',
    title: 'Spend audit completed',
    description: `Analyzed ${tools.length} AI tool${tools.length !== 1 ? 's' : ''} across your stack. ` +
      `${recCount} optimization recommendation${recCount !== 1 ? 's' : ''} generated, ` +
      `${totalSavings}/mo in potential savings identified.`,
    timestamp: relTime,
    iconKey: 'CheckCircle2',
    color: 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30',
  });

  // ── Event 2: Most impactful overlap detected (if any) ──────────────────
  if (detectedOverlaps.length > 0) {
    const topOverlap = detectedOverlaps[0]; // Already sorted by priority
    const overlapTools = topOverlap.tools
      .map((t) => TOOL_DISPLAY_NAMES[t] || t)
      .join(' + ');
    events.push({
      id: `evt-overlap-${topOverlap.id}`,
      type: 'warning',
      title: `${overlapTools} overlap detected`,
      description:
        `Both tools serve overlapping "${topOverlap.overlappingCapability}" workloads. ` +
        `Consolidating eliminates redundant subscription costs.`,
      timestamp: relTime,
      iconKey: 'ShieldAlert',
      color: topOverlap.severity === 'high'
        ? 'text-red-400 bg-red-950/20 border-red-900/30'
        : 'text-amber-400 bg-amber-950/20 border-amber-900/30',
    });
  } else {
    // No overlaps — check for highest-priority recommendation instead
    const highRec = recs.find((r) => r.priority === 'high');
    if (highRec) {
      events.push({
        id: 'evt-high-rec',
        type: 'warning',
        title: highRec.title,
        description: highRec.estimatedImpact || highRec.whyItMatters || '',
        timestamp: relTime,
        iconKey: 'ShieldAlert',
        color: 'text-red-400 bg-red-950/20 border-red-900/30',
      });
    }
  }

  // ── Event 3: Seat utilization summary ─────────────────────────────────
  const totalSeats = audit.seats || 0;
  const inactiveSeats = audit.inactiveSeats || 0;
  if (totalSeats > 1) {
    const activeSeats = totalSeats - inactiveSeats;
    const seatRec = recs.find((r) => r.id === 'rule-unused-seats');
    const savingsNote = seatRec
      ? ` Deactivation saves ${seatRec.estimatedSavings?.formattedMonthly || `$${seatRec.estimatedMonthlySavings || 0}/mo`}.`
      : '';

    events.push({
      id: 'evt-seat-audit',
      type: 'sync',
      title: 'Seat utilization profiled',
      description:
        `${activeSeats} of ${totalSeats} registered seat${totalSeats !== 1 ? 's' : ''} are active` +
        (inactiveSeats > 0
          ? `. ${inactiveSeats} inactive seat${inactiveSeats !== 1 ? 's' : ''} flagged for deactivation.${savingsNote}`
          : '. No inactive seats detected.'),
      timestamp: relTime,
      iconKey: 'UserCheck',
      color: 'text-zinc-400 bg-zinc-900/40 border-zinc-800/40',
    });
  }

  // ── Event 4: Second overlap or medium recommendation ───────────────────
  const secondOverlap = detectedOverlaps[1];
  if (secondOverlap) {
    const tools2 = secondOverlap.tools
      .map((t) => TOOL_DISPLAY_NAMES[t] || t)
      .join(' + ');
    events.push({
      id: `evt-overlap2-${secondOverlap.id}`,
      type: 'spike',
      title: `${tools2} workspace overlap`,
      description: `${secondOverlap.overlappingCapability} covered by both tools. ` +
        `Standardizing to one provider reduces complexity and billing overhead.`,
      timestamp: relTime,
      iconKey: 'Flame',
      color: 'text-amber-400 bg-amber-950/20 border-amber-900/30',
    });
  } else {
    // No second overlap — use a medium recommendation or API provider note
    const medRec = recs.find((r) => r.priority === 'medium');
    if (medRec) {
      events.push({
        id: 'evt-med-rec',
        type: 'spike',
        title: medRec.title,
        description: medRec.estimatedImpact || medRec.whyItMatters || medRec.explanation || '',
        timestamp: relTime,
        iconKey: 'Flame',
        color: 'text-amber-400 bg-amber-950/20 border-amber-900/30',
      });
    }
  }

  return events.filter(Boolean).slice(0, 4);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const TOOL_DISPLAY_NAMES = {
  chatgpt:      'ChatGPT',
  claude:       'Claude',
  cursor:       'Cursor',
  copilot:      'GitHub Copilot',
  gemini:       'Gemini',
  openai_api:   'OpenAI API',
  anthropic_api:'Anthropic API',
  v0_dev:       'v0.dev',
};

function formatCompactUSD(n) {
  if (!n || n <= 0) return '$0';
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}

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
