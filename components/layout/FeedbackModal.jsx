'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Loader2, Mail, User, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createFeedback } from '@/lib/api';

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

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter your business email.');
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid business email.');
      return;
    }
    if (!message.trim()) {
      setErrorMsg('Please enter your feedback message.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await createFeedback({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleResetAndClose}
      />

      {/* Modal Card Shell */}
      <div 
        className="relative w-full max-w-md bg-zinc-950 border border-zinc-800/80 rounded-xl p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
      >
        {/* Close button X */}
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500 rounded p-0.5"
          aria-label="Close feedback modal"
        >
          <X className="h-4 w-4" />
        </button>

        {success ? (
          /* Success Screen Feedback */
          <div className="flex flex-col items-center justify-center text-center py-6 space-y-4 animate-in fade-in duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950/20 border border-emerald-900/40 text-emerald-400">
              <CheckCircle2 className="h-6 w-6 stroke-[1.75]" />
            </div>
            <div className="space-y-1">
              <h3 id="feedback-modal-title" className="text-sm font-semibold text-white">
                Feedback Received
              </h3>
              <p className="text-xs text-zinc-400 max-w-[280px] leading-relaxed">
                Thank you for helping us improve CredLens! Our product team has received your submission.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleResetAndClose}
              className="mt-2 h-9 text-[10px] uppercase font-mono tracking-wider px-6 cursor-pointer"
            >
              Done
            </Button>
          </div>
        ) : (
          /* Feedback Input Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block">
                Platform Feedback
              </span>
              <h3 id="feedback-modal-title" className="text-sm font-semibold text-white">
                Submit Product Feedback
              </h3>
              <p className="text-xs text-zinc-400 leading-normal">
                Have a feature request, found a bug, or want to share thoughts? We want to hear from you.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Name */}
              <div className="relative flex items-center">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Your Name"
                  aria-label="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-zinc-950/50 border border-border/80 rounded pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors disabled:opacity-50"
                  required
                />
              </div>

              {/* Email */}
              <div className="relative flex items-center">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" aria-hidden="true" />
                <input
                  type="email"
                  placeholder="Business Email"
                  aria-label="Business Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-zinc-950/50 border border-border/80 rounded pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors disabled:opacity-50"
                  required
                />
              </div>

              {/* Message */}
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3.5 h-3.5 w-3.5 text-zinc-500 pointer-events-none" aria-hidden="true" />
                <textarea
                  placeholder="What is on your mind?..."
                  aria-label="Feedback Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting}
                  rows={4}
                  className="w-full bg-zinc-950/50 border border-border/80 rounded pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors resize-none disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <div className="text-[10px] text-red-400 flex items-center gap-1.5 pt-0.5">
                <span className="h-1 w-1 rounded-full bg-red-400" />
                {errorMsg}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-9 text-[10px] uppercase font-mono tracking-wider cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
