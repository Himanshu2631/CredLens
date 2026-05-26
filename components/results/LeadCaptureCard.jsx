'use client';

import React, { useState } from 'react';
import { Mail, Building, Loader2, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createLead } from '@/lib/api';

/**
 * LeadCaptureCard — a polished, high-converting startup lead acquisition block.
 * Links the active audit report to a company profile and email address.
 * 
 * @param {string} auditId     — The ObjectId of the persisted Audit report
 * @param {number} teamSize    — Pre-populated seat count from the audit
 * @param {number} activeSpend — Pre-populated monthly spend from the audit
 */
/**
 * Read the persisted audit link state from localStorage once.
 * Using lazy initializers avoids calling setState inside a useEffect,
 * which would trigger a cascading re-render cycle.
 */
function readLinkedState(auditId) {
  if (!auditId || typeof window === 'undefined') {
    return { isLinked: false, emailSentStatus: null, linkedEmail: '' };
  }
  try {
    const linkedAudits = localStorage.getItem('credlens_linked_audits');
    if (!linkedAudits) return { isLinked: false, emailSentStatus: null, linkedEmail: '' };

    const parsed = JSON.parse(linkedAudits);
    if (!parsed.includes(auditId)) return { isLinked: false, emailSentStatus: null, linkedEmail: '' };

    const emailStatuses = localStorage.getItem('credlens_email_statuses');
    const emailSentStatus = emailStatuses
      ? (JSON.parse(emailStatuses)[auditId] || 'success')
      : null;

    const linkedEmails = localStorage.getItem('credlens_linked_emails');
    const linkedEmail = linkedEmails
      ? (JSON.parse(linkedEmails)[auditId] || '')
      : '';

    return { isLinked: true, emailSentStatus, linkedEmail };
  } catch (e) {
    console.error('[LeadCaptureCard] Failed to read linked audits from storage:', e);
    return { isLinked: false, emailSentStatus: null, linkedEmail: '' };
  }
}

export default function LeadCaptureCard({ auditId, teamSize, activeSpend }) {
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Lazy initializers read localStorage exactly once on mount — no effect, no re-render.
  const [isLinked, setIsLinked] = useState(() => readLinkedState(auditId).isLinked);
  const [emailSentStatus, setEmailSentStatus] = useState(() => readLinkedState(auditId).emailSentStatus);
  const [linkedEmail, setLinkedEmail] = useState(() => readLinkedState(auditId).linkedEmail);

  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!email || !email.trim()) {
      setErrorMsg('Please enter a valid business email.');
      return;
    }
    if (!companyName || !companyName.trim()) {
      setErrorMsg('Please enter your company name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await createLead({
        companyName: companyName.trim(),
        email: email.trim(),
        auditId: auditId || null,
        teamSize: teamSize || null,
        activeSpend: activeSpend || 0,
        contactName: 'Startup Operator',
        metadata: { source: 'post_audit_card' }
      });

      const sentStatus = res.emailSent ? 'success' : 'failed';
      setEmailSentStatus(sentStatus);
      setLinkedEmail(email.trim());
      setIsLinked(true);

      // Record this auditId as linked in localStorage so they don't see the form on reload
      try {
        const linkedAudits = localStorage.getItem('credlens_linked_audits');
        const parsed = linkedAudits ? JSON.parse(linkedAudits) : [];
        if (!parsed.includes(auditId)) {
          parsed.push(auditId);
          localStorage.setItem('credlens_linked_audits', JSON.stringify(parsed));
        }

        const emailStatuses = localStorage.getItem('credlens_email_statuses') || '{}';
        const parsedStatuses = JSON.parse(emailStatuses);
        parsedStatuses[auditId] = sentStatus;
        localStorage.setItem('credlens_email_statuses', JSON.stringify(parsedStatuses));

        const linkedEmails = localStorage.getItem('credlens_linked_emails') || '{}';
        const parsedEmails = JSON.parse(linkedEmails);
        parsedEmails[auditId] = email.trim();
        localStorage.setItem('credlens_linked_emails', JSON.stringify(parsedEmails));
      } catch (storageErr) {
        console.error('[LeadCaptureCard] Failed to save linked status to storage:', storageErr);
      }
    } catch (err) {
      console.error('[LeadCaptureCard] Save lead failed:', err);
      setErrorMsg(err.message || 'Failed to save lead info. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/share/${auditId}` : '';

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // If already linked, render a polished success state
  if (isLinked) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/20 pb-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-zinc-200">
                Audit Report Persisted Successfully
              </h4>
              <p className="text-[12.5px] text-zinc-400 leading-normal max-w-md">
                Your AI spend optimization stack is now synced to MongoDB and secure sharing is enabled.
              </p>
            </div>
          </div>
          <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/20 px-2.5 py-1 rounded border border-emerald-900/30 self-start md:self-center shrink-0">
            Synced & Active
          </div>
        </div>

        {/* Email Notification Status */}
        <div className="rounded border border-border/30 bg-zinc-900/20 p-3.5 flex items-start gap-3">
          {emailSentStatus === 'success' ? (
            <>
              <Mail className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-zinc-200 block">
                  Report Summary Emailed
                </span>
                <p className="text-[12px] text-zinc-400 leading-normal">
                  A professional PDF-grade audit summary has been sent successfully to <strong className="text-zinc-300 font-semibold">{linkedEmail || 'your email'}</strong>.
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-zinc-200 block">
                  Email Notification Pending / Bypassed
                </span>
                <p className="text-[12px] text-zinc-400 leading-normal">
                  The report saved successfully, but the email summary could not be sent (Resend key missing or sandbox limitation). You can still share this audit using the secure link below.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Share Link copy block */}
        <div className="space-y-2">
          <label className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase block">
            Secure Shareable Report Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-zinc-950/50 border border-border/60 rounded px-3 py-1.5 text-[11px] font-mono text-zinc-300 outline-none select-all"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleCopyLink}
              className="h-8 gap-1.5 text-[10px] uppercase font-mono tracking-wider px-3 border border-border hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If the audit was run offline (no auditId returned from backend), show a disabled capture card
  if (!auditId) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border/80 bg-zinc-900/10 p-5 space-y-4">
      <div className="space-y-1">
        <h4 className="text-xs font-semibold text-zinc-200">
          Save Report & Lock in Savings
        </h4>
        <p className="text-[12.5px] text-zinc-400 leading-normal">
          Persist your report permanently in MongoDB to get a secure share link, track optimization progress, 
          and receive updates when AI API pricing changes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Company Name Input */}
          <div className="relative">
            <Building className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <input
              type="text"
              placeholder="Company Name"
              aria-label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-zinc-950/50 border border-border/80 rounded px-9 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
              required
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            <input
              type="email"
              placeholder="Business Email"
              aria-label="Business Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-zinc-950/50 border border-border/80 rounded px-9 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
              required
            />
          </div>
        </div>

        {errorMsg && (
          <div className="text-[10px] text-red-400 flex items-center gap-1.5 pt-0.5">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {errorMsg}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-8 text-[10px] uppercase font-mono tracking-wider px-4 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                Saving Info...
              </>
            ) : (
              'Save & Link Report'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
