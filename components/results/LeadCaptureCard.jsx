'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Building, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
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
export default function LeadCaptureCard({ auditId, teamSize, activeSpend }) {
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLinked, setIsLinked] = useState(false);

  // Check if this specific audit report is already linked to a lead in localStorage
  useEffect(() => {
    if (!auditId) return;
    try {
      const linkedAudits = localStorage.getItem('credlens_linked_audits');
      if (linkedAudits) {
        const parsed = JSON.parse(linkedAudits);
        if (parsed.includes(auditId)) {
          setTimeout(() => {
            setIsLinked(true);
          }, 0);
        }
      }
    } catch (e) {
      console.error('[LeadCaptureCard] Failed to read linked audits from storage:', e);
    }
  }, [auditId]);

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
      await createLead({
        companyName: companyName.trim(),
        email: email.trim(),
        auditId: auditId || null,
        teamSize: teamSize || null,
        activeSpend: activeSpend || 0,
        contactName: 'Startup Operator',
        metadata: { source: 'post_audit_card' }
      });

      setIsLinked(true);

      // Record this auditId as linked in localStorage so they don't see the form on reload
      try {
        const linkedAudits = localStorage.getItem('credlens_linked_audits');
        const parsed = linkedAudits ? JSON.parse(linkedAudits) : [];
        if (!parsed.includes(auditId)) {
          parsed.push(auditId);
          localStorage.setItem('credlens_linked_audits', JSON.stringify(parsed));
        }
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

  // If already linked, render a polished success state
  if (isLinked) {
    return (
      <div className="rounded-lg border border-emerald-900/30 bg-emerald-950/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-zinc-200">
              Audit Report Successfully Linked
            </h4>
            <p className="text-[11px] text-zinc-400 leading-normal max-w-md">
              Your AI optimization stack has been synced with MongoDB. You can now use the &quot;Share Report&quot; 
              link to share your diagnostic results.
            </p>
          </div>
        </div>
        <div className="text-[10px] font-mono text-zinc-500 bg-zinc-950/40 px-2.5 py-1 rounded border border-border/20 self-start sm:self-center">
          Persisted & Synced
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
        <p className="text-[11px] text-zinc-400 leading-normal">
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
