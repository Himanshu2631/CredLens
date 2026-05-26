'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, Loader2, Mail, User, MessageSquare } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { createFeedback } from '@/lib/api';
import { cn } from '@/lib/utils';

/**
 * FeedbackModal - A polished modal for gathering user feedback on the CredLens platform.
 * Syncs seamlessly with the MongoDB database using a custom Next.js API endpoint.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Determines if the modal is shown
 * @param {Function} props.onClose - Dismissal callback triggered by clicking close or backdrop
 */
export default function FeedbackModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errors, setErrors] = useState({ name: '', email: '', message: '' });

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

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    if (errors.message) {
      setErrors((prev) => ({ ...prev, message: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Client-side validation
    const tempErrors = { name: '', email: '', message: '' };
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

    if (!message.trim()) {
      tempErrors.message = 'Please enter your feedback message.';
      isValid = false;
    } else if (message.length > 2000) {
      tempErrors.message = 'Message cannot exceed 2000 characters.';
      isValid = false;
    }

    if (!isValid) {
      setErrors(tempErrors);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setErrors({ name: '', email: '', message: '' });

    try {
      const data = await createFeedback({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });

      if (!data.emailSent) {
        throw new Error(data.emailError || 'Feedback saved to database, but failed to send email notification to admin.');
      }

      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      console.error('[Feedback] Submission failure:', err);
      setErrorMsg(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccess(false);
    setErrorMsg('');
    setErrors({ name: '', email: '', message: '' });
    setName('');
    setEmail('');
    setMessage('');
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
        aria-labelledby="feedback-modal-title"
      >
        {/* Glow Container - clips the background glow to the card boundaries */}
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-500/10 rounded-full blur-[60px]" />
        </div>

        {/* Close button X */}
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500 rounded p-0.5 z-20"
          aria-label="Close feedback modal"
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
              <h3 id="feedback-modal-title" className="text-base font-semibold text-white">
                Feedback Received
              </h3>
              <p className="text-xs text-zinc-400 max-w-[280px] leading-relaxed">
                Thank you for helping us improve CredLens! Our product team has received your submission.
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
          /* Feedback Input Form */
          <form onSubmit={handleSubmit} className="relative space-y-5 z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block">
                  Platform Feedback
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" title="Active Focus" />
              </div>
              <h3 id="feedback-modal-title" className="text-base font-semibold text-white tracking-tight">
                Submit Product Feedback
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Have a feature request, found a bug, or want to share thoughts? We want to hear from you.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {/* Name */}
              <div className="space-y-1">
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Your Name"
                    aria-label="Your Name"
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

              {/* Message */}
              <div className="space-y-1">
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-zinc-500 pointer-events-none" aria-hidden="true" />
                  <textarea
                    placeholder="What is on your mind?..."
                    aria-label="Feedback Message"
                    value={message}
                    onChange={handleMessageChange}
                    disabled={isSubmitting}
                    rows={4}
                    className={cn(
                      "w-full min-h-[120px] bg-zinc-950/50 border rounded pl-10 pr-4 py-3.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors resize-none disabled:opacity-50 leading-relaxed",
                      errors.message 
                        ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500" 
                        : "border-border/80 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                    )}
                    required
                  />
                </div>
                {errors.message && (
                  <div className="text-[10px] text-red-400 flex items-center gap-1.5 mt-1 animate-in fade-in duration-150">
                    <span className="h-1 w-1 rounded-full bg-red-400" />
                    {errors.message}
                  </div>
                )}
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
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
