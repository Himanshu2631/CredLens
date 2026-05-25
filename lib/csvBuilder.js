import { convertAmount } from '@/lib/currency';

/**
 * Escapes characters for clean CSV formatting.
 * Handles commas, double-quotes, and newlines by enclosing inside double quotes
 * and escaping inner double-quotes.
 *
 * @param {any} val 
 * @returns {string} Escaped string
 */
function escapeCSVField(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates and downloads a clean, spreadsheet-friendly Spend Optimization CSV.
 * Includes metadata summary block, tools stack registry, and fully itemized action recommendations.
 *
 * @param {Object} options
 * @param {Object} options.summary           - Audit summary object
 * @param {Array}  options.recommendations   - List of recommendations
 * @param {Object} options.formData          - Initial audit form data
 * @param {string} options.auditDate         - Pre-formatted audit date string
 * @param {string} [options.currency]        - Selected currency: 'USD' | 'INR'
 */
export function generateAuditCSV({
  summary,
  recommendations = [],
  formData = {},
  auditDate = 'Recent',
  currency = 'USD'
}) {
  const lines = [];

  // Local helper to add a line to the CSV array
  const pushRow = (...fields) => {
    lines.push(fields.map(escapeCSVField).join(','));
  };

  // 1. Report Header Section
  pushRow("CREDLENS AI SPEND OPTIMIZATION AUDIT REPORT");
  pushRow("Report Generated:", auditDate);
  pushRow("Project / Startup:", formData.projectName || "Active Workspace");
  pushRow("Team Seat Size:", `${formData.seats || 1} seats`);
  pushRow("Selected Report Currency:", currency);
  pushRow("");

  // 2. Financial Summary Block
  pushRow("FINANCIAL RUN-RATE SUMMARY");
  pushRow("Metric Item", "Value (USD)", "Value (INR)");
  pushRow("Current Monthly Spend", summary.totalCurrentSpend || 0, convertAmount(summary.totalCurrentSpend || 0, 'INR'));
  pushRow("Target Monthly Spend", summary.optimizedSpendEstimate || 0, convertAmount(summary.optimizedSpendEstimate || 0, 'INR'));
  pushRow("Net Monthly Savings", summary.totalEstimatedSavings || 0, convertAmount(summary.totalEstimatedSavings || 0, 'INR'));
  pushRow("Annual Runway Recovery", summary.totalEstimatedYearlySavings || 0, convertAmount(summary.totalEstimatedYearlySavings || 0, 'INR'));
  pushRow("Runway Overhead Reduced", `${summary.runwayRestoredPercent || 0}%`, `${summary.runwayRestoredPercent || 0}%`);
  pushRow("Subscription Cost Baseline", summary.subscriptionCost || 0, convertAmount(summary.subscriptionCost || 0, 'INR'));
  pushRow("Volumetric API Spend", summary.apiSpend || 0, convertAmount(summary.apiSpend || 0, 'INR'));
  pushRow("");

  // 3. Audited Tool Coverage List
  pushRow("AUDITED TOOLS COVERAGE");
  pushRow("Tool Identifier", "Plan Name");
  const toolsList = formData.tools || [];
  if (toolsList.length === 0) {
    pushRow("None", "N/A");
  } else {
    toolsList.forEach((toolId) => {
      const planName = formData.toolPlans?.[toolId] || 'Default';
      pushRow(toolId, planName);
    });
  }
  pushRow("");

  // 4. Tabular Action Items Table
  pushRow("ITEMIZED OPTIMIZATION ACTION ITEMS");
  pushRow(
    "Priority ID",
    "Recommendation Title",
    "Category",
    "Impact Level",
    "Monthly Savings (USD)",
    "Annual Savings (USD)",
    "Monthly Savings (INR)",
    "Annual Savings (INR)",
    "Why It Matters",
    "Implementation Checklist",
    "Calculation Logic"
  );

  if (recommendations.length === 0) {
    pushRow("N/A", "No redundancies detected. Stack is fully optimized.", "", "", 0, 0, 0, 0, "", "", "");
  } else {
    recommendations.forEach((rec, idx) => {
      const monthlyUSD = rec.estimatedSavings?.monthly || 0;
      const yearlyUSD = rec.estimatedSavings?.yearly || (monthlyUSD * 12);
      const monthlyINR = convertAmount(monthlyUSD, 'INR');
      const yearlyINR = convertAmount(yearlyUSD, 'INR');

      const checklistStr = (rec.actionableSteps || [])
        .map((step, sIdx) => `[${sIdx + 1}] ${step}`)
        .join('; ');

      pushRow(
        idx + 1,
        rec.title,
        rec.category || 'general',
        rec.estimatedImpact || 'Low',
        monthlyUSD,
        yearlyUSD,
        monthlyINR,
        yearlyINR,
        rec.whyItMatters || rec.explanation || '',
        checklistStr,
        rec.estimatedSavings?.logic || ''
      );
    });
  }

  // Compile lines and create standard Blob download trigger
  const csvContent = lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const formattedProjectName = (formData.projectName || 'workspace')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `CredLens-Audit-Report-${formattedProjectName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
