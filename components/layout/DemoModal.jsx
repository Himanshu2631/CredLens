'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, Loader2, Mail, User, Building, MessageSquare, Users, DollarSign } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { createDemoRequest } from '@/lib/api';
import { cn } from '@/lib/utils';

/**
 * DemoModal - A polished modal for booking personalization demos on the CredLens platform.
 * Syncs seamlessly with the MongoDB database using a custom Next.js API endpoint.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Determines if the modal is shown
 * @param {Function} props.onClose - Dismissal callback triggered by clicking close or backdrop
 */
export default function DemoModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [message, setMessage] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [monthlySpend, setMonthlySpend] = useState('');
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errors, setErrors] = useState({ name: '', email: '', companyName: '' });

  if (!isOpen) return null;

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: '' }));
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  const handleCompanyChange = (e) => {
    setCompanyName(e.target.value);
    if (errors.companyName) {
      setErrors((prev) => ({ ...prev, companyName: '' }));
    }
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Client-side validation
    const tempErrors = { name: '', email: '', companyName: '' };
    let isValid = true;

    if (!name.trim()) {
      tempErrors.name = 'Please enter your name.';
      isValid = false;
    } else if (name.length > 100) {
      tempErrors.name = 'Name cannot exceed 100 characters.';
      isValid = false;
    }

    if (!email.trim()) {
      tempErrors.email = 'Please enter your business email.';
      isValid = false;
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email.trim())) {
        tempErrors.email = 'Please enter a valid business email.';
        isValid = false;
      }
    }

    if (!companyName.trim()) {
      tempErrors.companyName = 'Please enter your company or team name.';
      isValid = false;
    } else if (companyName.length > 100) {
      tempErrors.companyName = 'Company name cannot exceed 100 characters.';
      isValid = false;
    }

    if (!isValid) {
      setErrors(tempErrors);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setErrors({ name: '', email: '', companyName: '' });

    try {
      const data = await createDemoRequest({
        contactName: name.trim(),
        email: email.trim(),
        companyName: companyName.trim(),
        useCase: message.trim(),
        teamSize: teamSize ? Number(teamSize) : null,
        monthlySpend: monthlySpend ? Number(monthlySpend) : null,
        providers: selectedProviders,
      });

      setSuccess(true);
      setName('');
      setEmail('');
      setCompanyName('');
      setMessage('');
      setTeamSize('');
      setMonthlySpend('');
      setSelectedProviders([]);
    } catch (err) {
      console.error('[DemoModal] Submission failure:', err);
      setErrorMsg(err.message || 'Failed to submit demo request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccess(false);
    setErrorMsg('');
    setErrors({ name: '', email: '', companyName: '' });
    setName('');
    setEmail('');
    setCompanyName('');
    setMessage('');
    setTeamSize('');
    setMonthlySpend('');
    setSelectedProviders([]);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleResetAndClose}
      />

      {/* Modal Card Shell */}
      <div 
        className="relative w-full max-w-[420px] max-h-[90vh] overflow-y-auto bg-zinc-950 border border-zinc-800/80 rounded-xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-modal-title"
      >
        {/* Glow Container - clips the background glow to the card boundaries */}
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px]" />
        </div>

        {/* Close button X */}
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500 rounded p-0.5 z-20"
          aria-label="Close demo modal"
        >
          <X className="h-4 w-4" />
        </button>

        {success ? (
          /* Success Screen Feedback */
          <div className="relative flex flex-col items-center justify-center text-center py-10 space-y-5 animate-in fade-in duration-300 z-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-950/20 border border-emerald-900/40 text-emerald-400">
              <CheckCircle2 className="h-7 w-7 stroke-[1.75]" />
            </div>
            <div className="space-y-2">
              <h3 id="demo-modal-title" className="text-base font-semibold text-white">
                Demo Request Received
              </h3>
              <p className="text-xs text-zinc-400 max-w-[280px] leading-relaxed">
                Thank you for scheduling a demo! We've sent a confirmation email, and our onboarding team will be in touch shortly.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetAndClose}
              className={cn(
                buttonVariants({ variant: 'default', size: 'default' }),
                "mt-4 h-9 text-[10px] uppercase font-mono tracking-wider px-6 cursor-pointer"
              )}
            >
              Done
            </button>
          </div>
        ) : (
          /* Demo Scheduling Form */
          <form onSubmit={handleSubmit} className="relative space-y-5 z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block">
                  Private Session
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" title="Active Focus" />
              </div>
              <h3 id="demo-modal-title" className="text-base font-semibold text-white tracking-tight">
                Schedule Cost Optimization Demo
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Let us review your stack, optimize your pricing plan mappings, and secure your monthly API margins.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {/* Name */}
              <div className="space-y-1">
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Your Full Name"
                    aria-label="Your Full Name"
                    value={name}
                    onChange={handleNameChange}
                    disabled={isSubmitting}
                    className={cn(
                      "w-full bg-zinc-950/50 border rounded pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 outline-none transition-colors disabled:opacity-50",
                      errors.name 
                        ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500" 
                        : "border-border/80 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                    )}
                    required
                  />
                </div>
                {errors.name && (
                  <div className="text-[10px] text-red-400 flex items-center gap-1.5 mt-1 animate-in fade-in duration-150">
                    <span className="h-1 w-1 rounded-full bg-red-400" />
                    {errors.name}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" aria-hidden="true" />
                  <input
                    type="email"
                    placeholder="Business Email"
                    aria-label="Business Email"
                    value={email}
                    onChange={handleEmailChange}
                    disabled={isSubmitting}
                    className={cn(
                      "w-full bg-zinc-950/50 border rounded pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 outline-none transition-colors disabled:opacity-50",
                      errors.email 
                        ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500" 
                        : "border-border/80 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                    )}
                    required
                  />
                </div>
                {errors.email && (
                  <div className="text-[10px] text-red-400 flex items-center gap-1.5 mt-1 animate-in fade-in duration-150">
                    <span className="h-1 w-1 rounded-full bg-red-400" />
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Company */}
              <div className="space-y-1">
                <div className="relative flex items-center">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Company / Team Name"
                    aria-label="Company Name"
                    value={companyName}
                    onChange={handleCompanyChange}
                    disabled={isSubmitting}
                    className={cn(
                      "w-full bg-zinc-950/50 border rounded pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 outline-none transition-colors disabled:opacity-50",
                      errors.companyName 
                        ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500" 
                        : "border-border/80 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                    )}
                    required
                  />
                </div>
                {errors.companyName && (
                  <div className="text-[10px] text-red-400 flex items-center gap-1.5 mt-1 animate-in fade-in duration-150">
                    <span className="h-1 w-1 rounded-full bg-red-400" />
                    {errors.companyName}
                  </div>
                )}
              </div>

              {/* Team Size & Estimated Monthly AI Spend */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="relative flex items-center">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" aria-hidden="true" />
                    <input
                      type="number"
                      placeholder="Team Size"
                      aria-label="Team Size"
                      value={teamSize}
                      onChange={(e) => setTeamSize(e.target.value)}
                      disabled={isSubmitting}
                      min="1"
                      className="w-full bg-zinc-950/50 border border-border/80 rounded pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="relative flex items-center">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" aria-hidden="true" />
                    <input
                      type="number"
                      placeholder="Monthly Spend"
                      aria-label="Estimated Monthly AI Spend"
                      value={monthlySpend}
                      onChange={(e) => setMonthlySpend(e.target.value)}
                      disabled={isSubmitting}
                      min="0"
                      className="w-full bg-zinc-950/50 border border-border/80 rounded pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Active AI Providers */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block">
                  Active AI Providers
                </span>
                <div className="flex flex-wrap gap-2">
                  {['OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'Other'].map((prov) => {
                    const isSelected = selectedProviders.includes(prov);
                    return (
                      <button
                        key={prov}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => {
                          setSelectedProviders((prev) =>
                            prev.includes(prov)
                              ? prev.filter((p) => p !== prov)
                              : [...prev, prov]
                          );
                        }}
                        className={cn(
                          "px-2.5 py-1 text-[11px] font-medium rounded border transition-colors cursor-pointer disabled:opacity-50 select-none",
                          isSelected
                            ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400 font-semibold"
                            : "bg-zinc-900/30 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                        )}
                      >
                        {prov}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-zinc-500 pointer-events-none" aria-hidden="true" />
                  <textarea
                    placeholder="Notes, team size, spend, or goals... (optional)"
                    aria-label="Use Case Message"
                    value={message}
                    onChange={handleMessageChange}
                    disabled={isSubmitting}
                    rows={3}
                    className="w-full min-h-[90px] bg-zinc-950/50 border border-border/80 rounded pl-10 pr-4 py-3.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors resize-none disabled:opacity-50 leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="text-[10px] text-red-400 flex items-center gap-1.5 pt-0.5">
                <span className="h-1 w-1 rounded-full bg-red-400" />
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                buttonVariants({ variant: 'default', size: 'default' }),
                "w-full h-9.5 text-[10px] uppercase font-mono tracking-wider cursor-pointer mt-1"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Scheduling Demo...
                </>
              ) : (
                'Schedule Demo'
              )}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
