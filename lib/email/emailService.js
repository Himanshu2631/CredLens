import { Resend } from 'resend';

/**
 * Lazy initialization of Resend client to avoid module-load crashes
 * if the API key is missing or invalid.
 */
let resendInstance = null;

/**
 * Initializes and returns the Resend client instance.
 * Returns null if the RESEND_API_KEY is not defined.
 * 
 * @returns {Resend|null}
 */
export function getResendClient() {
  if (resendInstance) return resendInstance;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Email Service] Warning: RESEND_API_KEY is not defined in environment variables. Email delivery is bypassed.');
    return null;
  }

  try {
    resendInstance = new Resend(apiKey);
    return resendInstance;
  } catch (error) {
    console.error('[Email Service] Failed to initialize Resend client:', error);
    return null;
  }
}

/**
 * Generates clean, responsive HTML for the CredLens spend optimization summary email.
 * 
 * @param {Object} params
 * @param {string} params.companyName Name of the company/startup
 * @param {Object} params.audit Audit document containing summary statistics and recommendations
 * @param {string} params.shareUrl Secure absolute URL to access the full report
 * @returns {string} Fully structured HTML content with inline CSS
 */
export function generateEmailHtml({ companyName, audit, shareUrl }) {
  const summary = audit.summary || {};
  const aiSummary = audit.aiSummary || {};
  
  // Format savings statistics
  const currentSpend = summary.formattedCurrentSpend || `$${(summary.totalCurrentSpend || 0).toLocaleString()}/mo`;
  const optimizedSpend = summary.formattedOptimizedSpend || `$${(summary.optimizedSpendEstimate || 0).toLocaleString()}/mo`;
  const monthlySavings = summary.formattedEstimatedSavings || `$${(summary.totalEstimatedSavings || 0).toLocaleString()}/mo`;
  const yearlySavings = summary.formattedEstimatedYearlySavings || `$${(summary.totalEstimatedYearlySavings || 0).toLocaleString()}/yr`;
  const runwayRestored = typeof summary.runwayRestoredPercent === 'number' ? summary.runwayRestoredPercent.toFixed(1) : '0.0';
  
  // Format executive narrative fallback
  const execSummary = aiSummary.ai_audit_summary || aiSummary.executiveSummary || 
    `Based on an analysis of ${audit.tools?.length || 0} active AI tools and a team size of ${audit.seats || 1}, we identified ${monthlySavings} in potential monthly spend optimization. Consolidating your run-rate will recover ${runwayRestored}% of active AI spend and secure ${yearlySavings} in annualized runway.`;

  // Format top recommendations (max 3)
  const topRecsHtml = (audit.recommendations || [])
    .slice(0, 3)
    .map((rec) => {
      const savings = rec.estimatedMonthlySavings || rec.estimatedSavings?.monthly || 0;
      const formattedRecSavings = savings > 0 ? `$${savings.toLocaleString()}/mo` : 'Varies';
      const explanationText = rec.explanation || rec.description || '';
      
      let impactColor = '#2563eb'; // blue for low
      if (rec.estimatedImpact === 'High') impactColor = '#dc2626'; // red
      else if (rec.estimatedImpact === 'Medium') impactColor = '#d97706'; // amber

      return `
        <div style="margin-bottom: 16px; padding: 12px; border-left: 3px solid #10b981; background-color: #f9fafb; border-radius: 4px;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #111827;">${rec.title}</h4>
          <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.5; color: #4b5563;">${explanationText}</p>
          <div style="font-size: 11px; font-weight: 500; color: #6b7280; font-family: monospace;">
            Impact: <span style="color: ${impactColor}; font-weight: 600;">${rec.estimatedImpact || 'High'}</span> | Est. Savings: <strong style="color: #10b981;">${formattedRecSavings}</strong>
          </div>
        </div>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Spend Optimization Audit - ${companyName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #f3f4f6;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <span style="font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #6b7280; font-family: monospace;">CredLens AI Audit</span>
                    <h1 style="margin: 4px 0 0 0; font-size: 20px; font-weight: 700; color: #111827;">Spend Optimization Report</h1>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 4px; padding: 4px 8px; font-size: 11px; font-weight: 600; color: #047857; font-family: monospace;">SYNCED</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #1f2937;">
                Hello,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #374151;">
                We have analyzed the AI subscription and API spend profile for <strong>${companyName}</strong>. Below is a financial summary of the optimization audit and key recommendations to reduce operating overhead and extend your runway.
              </p>
              
              <!-- Metrics Cards Grid -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                <tr>
                  <td width="48%" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 16px; text-align: left; vertical-align: top;">
                    <span style="display: block; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #166534; margin-bottom: 4px;">Est. Monthly Savings</span>
                    <strong style="display: block; font-size: 22px; font-weight: 700; color: #15803d;">${monthlySavings}</strong>
                    <span style="display: block; font-size: 11px; color: #166534; margin-top: 4px;">${runwayRestored}% overhead reduction</span>
                  </td>
                  <td width="4%">&nbsp;</td>
                  <td width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; text-align: left; vertical-align: top;">
                    <span style="display: block; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #334155; margin-bottom: 4px;">Est. Yearly Savings</span>
                    <strong style="display: block; font-size: 22px; font-weight: 700; color: #1e293b;">${yearlySavings}</strong>
                    <span style="display: block; font-size: 11px; color: #475569; margin-top: 4px;">Annualized impact</span>
                  </td>
                </tr>
              </table>

              <!-- Financial Breakdown Summary -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px; border: 1px solid #f3f4f6; border-radius: 6px; overflow: hidden;">
                <tr style="background-color: #fafafa;">
                  <td style="padding: 10px 14px; font-size: 11px; font-weight: 600; color: #4b5563; text-transform: uppercase; border-bottom: 1px solid #f3f4f6;">Metric</td>
                  <td align="right" style="padding: 10px 14px; font-size: 11px; font-weight: 600; color: #4b5563; text-transform: uppercase; border-bottom: 1px solid #f3f4f6;">Value</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6;">Current Monthly Spend</td>
                  <td align="right" style="padding: 10px 14px; font-size: 13px; font-weight: 500; color: #374151; border-bottom: 1px solid #f3f4f6; font-family: monospace;">${currentSpend}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6;">Target Optimized Spend</td>
                  <td align="right" style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #111827; border-bottom: 1px solid #f3f4f6; font-family: monospace;">${optimizedSpend}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; font-size: 13px; color: #374151;">Audited AI Tools count</td>
                  <td align="right" style="padding: 10px 14px; font-size: 13px; color: #374151; font-family: monospace;">${audit.tools?.length || 0}</td>
                </tr>
              </table>
              
              <!-- Executive Narrative -->
              <h3 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #4b5563;">Executive Narrative</h3>
              <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.6; color: #374151; background-color: #fafafa; border: 1px solid #f3f4f6; border-radius: 6px; padding: 14px;">
                ${execSummary}
              </p>
              
              <!-- Recommendations -->
              ${topRecsHtml ? `
              <h3 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #4b5563;">Top Actionable Recommendations</h3>
              <div style="margin-bottom: 28px;">
                ${topRecsHtml}
              </div>
              ` : ''}
              
              <!-- Button CTA -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 10px 0;">
                    <a href="${shareUrl}" target="_blank" style="display: inline-block; background-color: #18181b; color: #ffffff; border: 1px solid #27272a; border-radius: 6px; padding: 12px 24px; font-size: 14px; font-weight: 600; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">View Full Interactive Report</a>
                  </td>
                </tr>
              </table>
              
              <!-- Footer Note -->
              <p style="margin: 28px 0 0 0; font-size: 11px; line-height: 1.5; color: #9ca3af; text-align: center;">
                This diagnostic report is advisory. To manage or review your active optimization tasks, please access the platform.
              </p>
            </td>
          </tr>
          
          <!-- Bottom Border / Footer block -->
          <tr>
            <td style="background-color: #fafafa; border-top: 1px solid #f3f4f6; padding: 16px 32px; text-align: center;">
              <span style="font-size: 11px; font-family: monospace; color: #9ca3af;">CredLens Audit Engine &middot; AI Spend Optimization</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Sends a professional spend audit summary email to the specified address.
 * 
 * @param {Object} params
 * @param {string} params.to Destination email address
 * @param {string} params.companyName Company name for personalization
 * @param {Object} params.audit Audit document (with summary and recommendations)
 * @param {string} params.shareUrl Absolute shareable report URL
 * @returns {Promise<{success: boolean, error?: string, data?: any}>} Delivery outcome
 */
export async function sendAuditSummaryEmail({ to, companyName, audit, shareUrl }) {
  const resend = getResendClient();
  if (!resend) {
    return {
      success: false,
      error: 'Resend API key missing or initialization failed.',
    };
  }

  if (!to || typeof to !== 'string' || !to.includes('@')) {
    return {
      success: false,
      error: 'Invalid recipient email address.',
    };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'CredLens <onboarding@resend.dev>';
  const htmlContent = generateEmailHtml({ companyName, audit, shareUrl });

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to.trim().toLowerCase()],
      subject: `AI Spend Audit Report for ${companyName}`,
      html: htmlContent,
    });

    if (error) {
      console.error('[Email Service] Resend API error:', error);
      return {
        success: false,
        error: error.message || JSON.stringify(error),
      };
    }

    console.log(`[Email Service] Audit summary successfully dispatched to ${to}. ID: ${data?.id}`);
    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error('[Email Service] Unexpected mail delivery exception:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred during email delivery.',
    };
  }
}

/**
 * Sends a notification email with product feedback details to the admin recipient.
 * 
 * @param {Object} params
 * @param {string} params.name Submitter's name
 * @param {string} params.email Submitter's email
 * @param {string} params.message Feedback body message
 * @returns {Promise<{success: boolean, error?: string, data?: any}>} Delivery outcome
 */
export async function sendFeedbackEmail({ name, email, message }) {
  const resend = getResendClient();
  if (!resend) {
    return {
      success: false,
      error: 'Resend API key missing or initialization failed.',
    };
  }

  const adminEmail = 'himanshusengar235@gmail.com';
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'CredLens <onboarding@resend.dev>';
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'UTC' }) + ' UTC';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Product Feedback Received</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #f3f4f6; background-color: #18181b;">
              <span style="font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #a1a1aa; font-family: monospace;">CredLens Admin Alerts</span>
              <h1 style="margin: 4px 0 0 0; font-size: 20px; font-weight: 700; color: #ffffff;">New Product Feedback</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 6px; border-collapse: separate;">
                <tr>
                  <td width="30%" style="padding: 12px; font-size: 13px; font-weight: 600; color: #4b5563; border-bottom: 1px solid #e5e7eb; background-color: #fafafa;">Submitter Name</td>
                  <td style="padding: 12px; font-size: 13px; color: #111827; border-bottom: 1px solid #e5e7eb;">${name}</td>
                </tr>
                <tr>
                  <td width="30%" style="padding: 12px; font-size: 13px; font-weight: 600; color: #4b5563; border-bottom: 1px solid #e5e7eb; background-color: #fafafa;">Business Email</td>
                  <td style="padding: 12px; font-size: 13px; color: #111827; border-bottom: 1px solid #e5e7eb;">
                    <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td width="30%" style="padding: 12px; font-size: 13px; font-weight: 600; color: #4b5563; background-color: #fafafa;">Timestamp</td>
                  <td style="padding: 12px; font-size: 13px; color: #111827; font-family: monospace;">${timestamp}</td>
                </tr>
              </table>

              <h3 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #4b5563;">Message Details</h3>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1f2937; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; white-space: pre-wrap;">${message}</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; border-top: 1px solid #e5e7eb; padding: 16px 32px; text-align: center;">
              <span style="font-size: 11px; font-family: monospace; color: #9ca3af;">CredLens Audit Engine &middot; Feedback Pipeline</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [adminEmail],
      replyTo: email.trim().toLowerCase(),
      subject: `[CredLens Feedback] New message from ${name}`,
      html: htmlContent,
    });

    if (error) {
      console.error('[Email Service] Resend API error sending feedback notification:', error);
      return {
        success: false,
        error: error.message || JSON.stringify(error),
      };
    }

    console.log(`[Email Service] Feedback notification email successfully dispatched to ${adminEmail}. ID: ${data?.id}`);
    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error('[Email Service] Unexpected feedback mail delivery exception:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred during feedback email delivery.',
    };
  }
}

/**
 * Generates clean, premium HTML for the SaaS Subscription Hub beta access confirmation email.
 * 
 * @param {Object} params
 * @param {string} params.companyName
 * @param {number|null} params.teamSize
 * @returns {string} Fully structured HTML content
 */
export function generateBetaConfirmationEmailHtml({ companyName, teamSize }) {
  const teamSizeText = teamSize ? ` (Team size: ${teamSize})` : '';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CredLens Closed Beta Early Access Request</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #f3f4f6;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <span style="font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #6b7280; font-family: monospace;">CredLens SaaS Hub</span>
                    <h1 style="margin: 4px 0 0 0; font-size: 20px; font-weight: 700; color: #111827;">Beta Access Confirmed</h1>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 4px 8px; font-size: 11px; font-weight: 600; color: #166534; font-family: monospace;">QUEUE ACTIVE</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #1f2937;">
                Hello,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #374151;">
                We have registered your request for the <strong>SaaS Subscription Hub</strong> closed beta for <strong>${companyName}</strong>${teamSizeText}. Your position in the queue is confirmed.
              </p>
              
              <!-- Value Prop Box -->
              <div style="margin-bottom: 28px; padding: 20px; background-color: #fafafa; border: 1px solid #f3f4f6; border-radius: 6px;">
                <h3 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #4b5563;">Beta Platform Capabilities</h3>
                
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding-bottom: 12px; vertical-align: top;">
                      <strong style="font-size: 13px; color: #111827; display: block;">Workspace Sync</strong>
                      <span style="font-size: 12px; color: #4b5563; line-height: 1.4;">Sync with Slack and Google Workspace directories to detect licensing seat discrepancies automatically.</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 12px; vertical-align: top;">
                      <strong style="font-size: 13px; color: #111827; display: block;">AI Redundancy Detection</strong>
                      <span style="font-size: 12px; color: #4b5563; line-height: 1.4;">Uncover duplicate tools, overlapping functionality, and orphan accounts across team compartments.</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="vertical-align: top;">
                      <strong style="font-size: 13px; color: #111827; display: block;">Renewal Alerting</strong>
                      <span style="font-size: 12px; color: #4b5563; line-height: 1.4;">Proactive slack warnings 14 days before billing events to help you right-size license pools before cards are charged.</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- What happens next -->
              <h3 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #4b5563;">Cohort Rollovers</h3>
              <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.6; color: #374151;">
                We are admitting new startups in weekly cohorts starting next month. When your slot opens, you will receive an invitation containing a secure OAuth connector to sync your directories and generate your baseline license mapping.
              </p>
              
              <!-- Footer Note -->
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #4b5563;">
                Best regards,<br>
                <strong>The CredLens Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Bottom Border / Footer block -->
          <tr>
            <td style="background-color: #fafafa; border-top: 1px solid #f3f4f6; padding: 16px 32px; text-align: center;">
              <span style="font-size: 11px; font-family: monospace; color: #9ca3af;">CredLens Audit Engine &middot; AI Spend Optimization</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
 </body>
</html>
  `;
}

/**
 * Dispatches a professional confirmation email for beta access.
 * 
 * @param {Object} params
 * @param {string} params.to
 * @param {string} params.companyName
 * @param {number|null} params.teamSize
 * @returns {Promise<{success: boolean, error?: string, data?: any}>} Delivery outcome
 */
export async function sendBetaConfirmationEmail({ to, companyName, teamSize }) {
  const resend = getResendClient();
  if (!resend) {
    return {
      success: false,
      error: 'Resend API key missing or initialization failed.',
    };
  }

  if (!to || typeof to !== 'string' || !to.includes('@')) {
    return {
      success: false,
      error: 'Invalid recipient email address.',
    };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'CredLens <onboarding@resend.dev>';
  const htmlContent = generateBetaConfirmationEmailHtml({ companyName, teamSize });

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to.trim().toLowerCase()],
      subject: `Beta Confirmation: SaaS Subscription Hub`,
      html: htmlContent,
    });

    if (error) {
      console.error('[Email Service] Resend API error sending beta confirmation:', error);
      return {
        success: false,
        error: error.message || JSON.stringify(error),
      };
    }

    console.log(`[Email Service] Beta confirmation successfully dispatched to ${to}. ID: ${data?.id}`);
    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error('[Email Service] Unexpected beta mail delivery exception:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred during email delivery.',
    };
  }
}

