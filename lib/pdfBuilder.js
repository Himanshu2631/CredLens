import { convertAmount, formatCurrency, localizeText } from '@/lib/currency';

/**
 * Programmatically builds and downloads a professional Spend Audit Report PDF.
 * Uses client-side jsPDF with automatic page-wrapping and multi-page overflow control.
 *
 * @param {Object} options
 * @param {Object} options.summary           - Audit summary object
 * @param {Array}  options.recommendations   - List of recommendations
 * @param {Object} options.formData          - Initial audit form data
 * @param {string} options.auditDate         - Pre-formatted audit date string
 * @param {Object} [options.aiSummary]       - Optional AI narrative block
 * @param {string} [options.currency]        - Selected currency: 'USD' | 'INR'
 * @param {string} [options.shareId]         - Stored audit ID / token for sharing
 */
export async function generateAuditPDF({
  summary,
  recommendations = [],
  formData = {},
  auditDate = 'Recent',
  aiSummary = null,
  currency = 'USD',
  shareId = null
}) {
  // Dynamically import jsPDF on demand to keep bundle sizes optimized
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageHeight = 297;
  const pageWidth = 210;
  const margin = 20;
  const usableWidth = pageWidth - (margin * 2); // 170mm
  let currentY = margin;

  // Standard PDF fonts don't render the Unicode '₹' symbol correctly without embedded custom fonts.
  // To avoid swelling the bundle size, we format with standard ISO currency symbols (e.g., 'INR' or '$').
  const formatPDFCurrency = (usdVal, overridePeriod = '') => {
    if (currency === 'INR') {
      const converted = convertAmount(usdVal, 'INR');
      const formattedNum = new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
      }).format(converted);
      return `INR ${formattedNum}${overridePeriod ? '/' + overridePeriod : ''}`;
    } else {
      const converted = convertAmount(usdVal, 'USD');
      const formattedNum = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
      }).format(converted);
      return `$${formattedNum}${overridePeriod ? '/' + overridePeriod : ''}`;
    }
  };

  // Localize text descriptions, converting any standard '$' occurrences to PDF-safe INR representation
  const localizePDFText = (text) => {
    if (!text || typeof text !== 'string') return text;
    if (currency === 'USD') return text;

    // Matches standard dollar strings like $150, $1,500, $1.2k, $5M
    const regex = /\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?)([kKmM]?)/g;
    return text.replace(regex, (match, numberStr, suffix) => {
      let usdVal = parseFloat(numberStr.replace(/,/g, ''));
      if (isNaN(usdVal)) return match;
      if (suffix) {
        const lower = suffix.toLowerCase();
        if (lower === 'k') usdVal *= 1000;
        else if (lower === 'm') usdVal *= 1000000;
      }
      const converted = convertAmount(usdVal, 'INR');
      const formattedNum = new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
      }).format(converted);
      return `INR ${formattedNum}`;
    });
  };

  // Page tracking helper to create programmatic page breaks
  const checkPageBreak = (neededHeight) => {
    if (currentY + neededHeight > pageHeight - margin - 15) {
      doc.addPage();
      currentY = margin;
      drawSubpageHeader();
    }
  };

  const drawSubpageHeader = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(113, 113, 122); // zinc-500
    doc.text('CredLens Spend Optimization Report', margin, currentY - 5);
    
    doc.setDrawColor(228, 228, 237); // zinc-200
    doc.setLineWidth(0.2);
    doc.line(margin, currentY - 3, pageWidth - margin, currentY - 3);
    
    currentY += 5;
  };

  // ── FIRST PAGE ───────────────────────────────────────────────────────────

  // 1. Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(24, 24, 27); // zinc-900 (charcoal)
  doc.text('CREDLENS', margin, currentY);
  currentY += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.text('AI SPEND OPTIMIZATION REPORT', margin, currentY);
  currentY += 8;

  // Solid header line
  doc.setDrawColor(24, 24, 27);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  // 2. Metadata Grid Table
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(39, 39, 42); // zinc-800

  const col1X = margin;
  const col2X = margin + 85;

  // Left column metadata
  doc.setFont('helvetica', 'bold');
  doc.text('Project / Startup:', col1X, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(formData.projectName || 'Active Workspace', col1X + 32, currentY);

  // Right column metadata
  doc.setFont('helvetica', 'bold');
  doc.text('Audit Date:', col2X, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(auditDate, col2X + 22, currentY);

  currentY += 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Audited Coverage:', col1X, currentY);
  doc.setFont('helvetica', 'normal');
  const toolCount = formData.tools?.length || 0;
  doc.text(`${toolCount} AI Tools`, col1X + 32, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('Team Seat Size:', col2X, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formData.seats || 1} seats`, col2X + 22, currentY);

  currentY += 5;

  if (shareId) {
    doc.setFont('helvetica', 'bold');
    doc.text('Report Link:', col1X, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(37, 99, 235); // blue-600 (clickable link color)
    const reportUrl = `${window.location.origin}/share/${shareId}`;
    doc.textWithLink(reportUrl, col1X + 32, currentY, { url: reportUrl });
    doc.setTextColor(39, 39, 42); // reset color
  } else {
    doc.setFont('helvetica', 'bold');
    doc.text('Persistence:', col1X, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text('Local Session (Not Persisted)', col1X + 32, currentY);
  }

  currentY += 10;

  // 3. Financial Metrics Box Grid
  doc.setDrawColor(228, 228, 237); // zinc-200
  doc.setLineWidth(0.2);
  doc.setFillColor(250, 250, 250); // zinc-50
  doc.rect(margin, currentY, usableWidth, 26, 'FD');

  const boxW = usableWidth / 4;
  const paddingY = currentY + 6;

  // Box 1: Current Spend
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(113, 113, 122); // zinc-500
  doc.text('CURRENT MONTHLY', margin + 5, paddingY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(63, 63, 70); // zinc-700
  doc.text(formatPDFCurrency(summary.totalCurrentSpend), margin + 5, paddingY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Baseline operating rate', margin + 5, paddingY + 11);

  // Box 2: Target Spend
  doc.setFontSize(7.5);
  doc.setTextColor(113, 113, 122);
  doc.text('TARGET MONTHLY', margin + boxW + 5, paddingY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(24, 24, 27); // zinc-900
  doc.text(formatPDFCurrency(summary.optimizedSpendEstimate), margin + boxW + 5, paddingY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Post-optimization target', margin + boxW + 5, paddingY + 11);

  // Box 3: Monthly Savings
  doc.setFontSize(7.5);
  doc.setTextColor(113, 113, 122);
  doc.text('NET MONTHLY SAVINGS', margin + (boxW * 2) + 5, paddingY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const hasSavings = summary.totalEstimatedSavings > 0;
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.text(
    hasSavings ? formatPDFCurrency(summary.totalEstimatedSavings) : '$0',
    margin + (boxW * 2) + 5,
    paddingY + 6
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(113, 113, 122);
  doc.text(
    hasSavings ? `${summary.runwayRestoredPercent}% reduction` : 'Fully optimized',
    margin + (boxW * 2) + 5,
    paddingY + 11
  );

  // Box 4: Annual Savings
  doc.setFontSize(7.5);
  doc.setTextColor(113, 113, 122);
  doc.text('ANNUAL SAVINGS', margin + (boxW * 3) + 5, paddingY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.text(
    hasSavings ? formatPDFCurrency(summary.totalEstimatedYearlySavings) : '$0',
    margin + (boxW * 3) + 5,
    paddingY + 6
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(113, 113, 122);
  doc.text('Total capital recovery', margin + (boxW * 3) + 5, paddingY + 11);

  // Vertical delimiters
  doc.setDrawColor(228, 228, 237);
  doc.line(margin + boxW, currentY, margin + boxW, currentY + 26);
  doc.line(margin + (boxW * 2), currentY, margin + (boxW * 2), currentY + 26);
  doc.line(margin + (boxW * 3), currentY, margin + (boxW * 3), currentY + 26);

  currentY += 36;

  // 4. Executive Summary Narrative
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(24, 24, 27);
  doc.text('EXECUTIVE NARRATIVE SUMMARY', margin, currentY);
  currentY += 4;

  doc.setDrawColor(228, 228, 237);
  doc.line(margin, currentY, margin + 40, currentY);
  currentY += 5;

  let narrativeStr = '';
  if (aiSummary?.executiveSummary) {
    narrativeStr = localizePDFText(aiSummary.executiveSummary);
  } else {
    // Fallback standard text
    narrativeStr = `Based on an analysis of ${toolCount} active AI tools and a team size of ${formData.seats || 1}, we identified ${hasSavings ? formatPDFCurrency(summary.totalEstimatedSavings) : '$0'} in potential monthly spend optimization. Addressing these issues consolidates your run-rate from ${formatPDFCurrency(summary.totalCurrentSpend, 'mo')} to ${formatPDFCurrency(summary.optimizedSpendEstimate, 'mo')}, recovering ${hasSavings ? summary.runwayRestoredPercent : 0}% of active AI spend and securing ${hasSavings ? formatPDFCurrency(summary.totalEstimatedYearlySavings, 'yr') : '$0'} in annualized runway.`;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(63, 63, 70); // zinc-700
  const narrativeLines = doc.splitTextToSize(narrativeStr, usableWidth);
  const narrativeH = narrativeLines.length * 4.8;
  doc.text(narrativeLines, margin, currentY);
  currentY += narrativeH + 8;

  // 5. Key Insights Block
  if (aiSummary?.keyInsights && aiSummary.keyInsights.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(24, 24, 27);
    doc.text('KEY OBSERVATIONS & INSIGHTS', margin, currentY);
    currentY += 4;

    doc.setDrawColor(228, 228, 237);
    doc.line(margin, currentY, margin + 40, currentY);
    currentY += 5;

    aiSummary.keyInsights.forEach((insight, idx) => {
      const formattedInsight = localizePDFText(insight);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(16, 185, 129); // emerald-500
      const indexStr = `0${idx + 1}.`;
      doc.text(indexStr, margin, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(63, 63, 70); // zinc-700
      const insightLines = doc.splitTextToSize(formattedInsight, usableWidth - 10);
      doc.text(insightLines, margin + 8, currentY);
      
      currentY += (insightLines.length * 4.5) + 3;
    });

    currentY += 5;
  }

  // 6. Spend Allocation bar
  const subCost = summary.subscriptionCost || 0;
  const apiCost = summary.apiSpend || 0;
  const totalSpend = subCost + apiCost;

  if (totalSpend > 0) {
    checkPageBreak(35);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(24, 24, 27);
    doc.text('SPEND DISTRIBUTION PROFILE', margin, currentY);
    currentY += 4;

    doc.setDrawColor(228, 228, 237);
    doc.line(margin, currentY, margin + 40, currentY);
    currentY += 5;

    // Draw stacked bar
    const barHeight = 6;
    const subPct = subCost / totalSpend;
    const apiPct = apiCost / totalSpend;

    const subWidth = usableWidth * subPct;
    const apiWidth = usableWidth * apiPct;

    // Subscription segment (zinc-500)
    doc.setFillColor(113, 113, 122);
    doc.rect(margin, currentY, subWidth, barHeight, 'F');

    // API segment (zinc-300)
    doc.setFillColor(212, 212, 216);
    doc.rect(margin + subWidth, currentY, apiWidth, barHeight, 'F');

    currentY += barHeight + 5;

    // Legend
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    
    // Subscriptions dot & label
    doc.setFillColor(113, 113, 122);
    doc.rect(margin, currentY - 2, 2.5, 2.5, 'F');
    doc.setTextColor(63, 63, 70);
    doc.text(`Subscriptions: ${formatPDFCurrency(subCost, 'mo')} (${Math.round(subPct * 100)}%)`, margin + 5, currentY);

    // APIs dot & label
    doc.setFillColor(212, 212, 216);
    doc.rect(margin + 80, currentY - 2, 2.5, 2.5, 'F');
    doc.setTextColor(63, 63, 70);
    doc.text(`API Volumetrics: ${formatPDFCurrency(apiCost, 'mo')} (${Math.round(apiPct * 100)}%)`, margin + 85, currentY);

    currentY += 12;
  }

  // ── SECOND PAGE & ONWARDS: RECOMMENDATIONS ────────────────────────────────

  if (recommendations.length > 0) {
    checkPageBreak(50); // Ensure header prints correctly if we add a page

    // If we haven't broken pages yet, add one now so recommendations start on page 2
    if (currentY < 180) {
      doc.addPage();
      currentY = margin;
      drawSubpageHeader();
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(24, 24, 27);
    doc.text('RECOMMENDED SPEND OPTIMIZATIONS', margin, currentY);
    currentY += 4;

    doc.setDrawColor(24, 24, 27);
    doc.setLineWidth(0.4);
    doc.line(margin, currentY, margin + 40, currentY);
    currentY += 6;

    recommendations.forEach((rec, idx) => {
      // Approximate height check: header (10) + matters (15) + steps (20) + savings (10) + spacers (15) = ~70mm
      checkPageBreak(70);

      // Card boundary box
      const cardStartY = currentY;
      doc.setDrawColor(228, 228, 237);
      doc.setLineWidth(0.25);
      doc.setFillColor(255, 255, 255);
      
      // Draw temporary card background (we will outline it after calculations)
      currentY += 4;

      // Card Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(24, 24, 27);
      const titleText = `${idx + 1}. ${rec.title}`;
      doc.text(titleText, margin + 4, currentY);

      // Right-aligned savings badge
      if (rec.estimatedSavings?.monthly > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(16, 185, 129); // emerald-500
        const savingsText = `+ ${formatPDFCurrency(rec.estimatedSavings.monthly, 'mo')}`;
        doc.text(savingsText, pageWidth - margin - 4, currentY, { align: 'right' });
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(113, 113, 122);
        doc.text('Governance', pageWidth - margin - 4, currentY, { align: 'right' });
      }

      currentY += 5;

      // Small category tag
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(113, 113, 122);
      const categoryLabel = rec.category ? rec.category.toUpperCase().replace('-', ' ') : 'STRATEGY';
      doc.text(`CATEGORY: ${categoryLabel}  |  IMPACT: ${rec.estimatedImpact || 'LOW'}`, margin + 4, currentY);
      
      currentY += 5;

      // Why this matters text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(63, 63, 70);
      doc.text('Why this matters:', margin + 4, currentY);
      currentY += 3.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(82, 82, 91); // zinc-600
      const whyItMattersLines = doc.splitTextToSize(localizePDFText(rec.whyItMatters || rec.explanation), usableWidth - 10);
      doc.text(whyItMattersLines, margin + 4, currentY);
      currentY += (whyItMattersLines.length * 4.3) + 4;

      // Actionable steps
      if (rec.actionableSteps && rec.actionableSteps.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(63, 63, 70);
        doc.text('Implementation steps:', margin + 4, currentY);
        currentY += 3.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(82, 82, 91);

        rec.actionableSteps.forEach((step, stepIdx) => {
          const stepLines = doc.splitTextToSize(`[ ]  ${localizePDFText(step)}`, usableWidth - 14);
          doc.text(stepLines, margin + 6, currentY);
          currentY += (stepLines.length * 4.2) + 1.5;
        });

        currentY += 2.5;
      }

      // Savings calculations
      if (rec.estimatedSavings?.logic) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(113, 113, 122);
        doc.text('Savings Calculation Math:', margin + 4, currentY);
        currentY += 3.5;

        doc.setFont('courier', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(82, 82, 91);
        const mathLines = doc.splitTextToSize(localizePDFText(rec.estimatedSavings.logic), usableWidth - 10);
        doc.text(mathLines, margin + 4, currentY);
        currentY += (mathLines.length * 3.8) + 4;
      }

      // Draw the final card bounding border box
      const cardHeight = currentY - cardStartY;
      doc.rect(margin, cardStartY, usableWidth, cardHeight, 'S');

      // Left-side accent line per card depending on priority
      doc.setLineWidth(1.2);
      if (rec.estimatedImpact === 'High') {
        doc.setDrawColor(16, 185, 129); // emerald green
      } else if (rec.estimatedImpact === 'Medium') {
        doc.setDrawColor(245, 158, 11); // amber
      } else {
        doc.setDrawColor(113, 113, 122); // zinc
      }
      doc.line(margin, cardStartY, margin, currentY);

      currentY += 8; // margin between recommendation cards
    });
  }

  // ── FINAL PASS: FOOTERS ──────────────────────────────────────────────────

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Page Footer Border Line
    doc.setDrawColor(228, 228, 237); // zinc-200
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

    // Footer Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(113, 113, 122); // zinc-500
    doc.text('This report is generated by the CredLens Spend Engine. Recommendations are advisory.', margin, pageHeight - 11);
    
    // Right-aligned page numbers
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 11, { align: 'right' });
  }

  // Trigger browser download
  const formattedProjectName = (formData.projectName || 'workspace')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  doc.save(`CredLens-Audit-Report-${formattedProjectName}.pdf`);
}
