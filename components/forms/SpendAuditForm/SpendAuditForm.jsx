'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';

import { spendAuditFormSchema } from './schema';
import FormProgressBar from './FormProgressBar';
import ToolSelection from './ToolSelection';
import SpendMetrics from './SpendMetrics';
import UseCaseSelection from './UseCaseSelection';
import { Button } from '@/components/ui/button';

// Onboarding Steps
const STEPS = [
  { id: 0, label: 'Tool Stack' },
  { id: 1, label: 'Metrics' },
  { id: 2, label: 'Intent' }
];

/**
 * Default form values — used both for initial render and post-submit reset.
 */
const DEFAULT_FORM_VALUES = {
  tools: [],
  toolPlans: {},
  monthlySpend: 1000,
  seats: 1,
  useCase: undefined,
  optimizationGoal: ''
};

/**
 * Read the persisted form state from localStorage exactly once.
 * Called via lazy useState initializers so it runs synchronously on the client
 * before first paint — no effect or setState inside an effect is needed.
 */
function readPersistedState() {
  if (typeof window === 'undefined') {
    return { formData: DEFAULT_FORM_VALUES, currentStep: 0 };
  }
  try {
    const saved = localStorage.getItem('credlens_spend_audit_flow');
    if (!saved) return { formData: DEFAULT_FORM_VALUES, currentStep: 0 };
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object') {
      return { formData: DEFAULT_FORM_VALUES, currentStep: 0 };
    }
    return {
      formData: parsed.formData ?? DEFAULT_FORM_VALUES,
      currentStep: typeof parsed.currentStep === 'number' ? parsed.currentStep : 0
    };
  } catch {
    return { formData: DEFAULT_FORM_VALUES, currentStep: 0 };
  }
}

export default function SpendAuditForm({ onSubmitSuccess }) {
  // Lazy initializers read localStorage exactly once on mount — no effect, no re-render.
  const [currentStep, setCurrentStep] = useState(() => readPersistedState().currentStep);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useRef tracks mount — mutating a ref never triggers a re-render and is not
  // flagged by react-hooks/set-state-in-effect.
  const isMountedRef = useRef(false);

  // Initialize React Hook Form with persisted or default values.
  // Calling readPersistedState() here is safe — it's synchronous and
  // the result is memoized by useForm (called only once on mount).
  const methods = useForm({
    resolver: zodResolver(spendAuditFormSchema),
    mode: 'onTouch',
    defaultValues: readPersistedState().formData
  });

  const { handleSubmit, trigger, reset, getValues } = methods;

  // Mark as mounted on first run. No setState — avoids react-hooks/set-state-in-effect.
  useEffect(() => {
    isMountedRef.current = true;
  }, []);

  // Auto-save form values and step index when the step changes (client-only).
  // Uses getValues() — a pure snapshot read with no re-render side-effects.
  // This avoids the react-compiler incompatibility warning that watch() triggers.
  useEffect(() => {
    if (!isMountedRef.current) return;
    try {
      localStorage.setItem(
        'credlens_spend_audit_flow',
        JSON.stringify({ formData: getValues(), currentStep })
      );
    } catch (e) {
      console.error('[CredLens] Failed to save form state to localStorage:', e);
    }
  }, [currentStep, getValues]);

  // Handle forward navigation with validation triggers per step
  const handleNext = async () => {
    let fieldsToValidate = [];
    if (currentStep === 0) {
      fieldsToValidate = ['tools', 'toolPlans'];
    } else if (currentStep === 1) {
      fieldsToValidate = ['monthlySpend', 'seats'];
    }

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(STEPS.length - 1, prev + 1));
    }
  };

  // Handle backward navigation
  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  // Submit consolidated form data
  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (onSubmitSuccess) {
        await onSubmitSuccess({
          ...data,
          submittedAt: new Date().toISOString()
        });
      }

      // Clear local storage key on successful submission so they start fresh next time
      try {
        localStorage.removeItem('credlens_spend_audit_flow');
      } catch (e) {
        console.error('[CredLens] Failed to clear local storage key:', e);
      }

      // Reset flow and form states
      setCurrentStep(0);
      reset(DEFAULT_FORM_VALUES);
    } catch (err) {
      console.error('[SpendAuditForm] Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render active step component
  const renderActiveStep = () => {
    switch (currentStep) {
      case 0:
        return <ToolSelection />;
      case 1:
        return <SpendMetrics />;
      case 2:
        return <UseCaseSelection />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-6 rounded-xl border border-border bg-card p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
      >
        {/* Form Identity */}
        <div className="space-y-1">
          <h2 className="text-body-premium font-medium text-white flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-zinc-400" />
            AI Spend Optimizer
          </h2>
          <p className="text-muted-premium">
            Map your subscriptions, license seats, and workloads to scan for seat redundancy and token bloating.
          </p>
        </div>

        {/* Stepper Progress Indicator */}
        <FormProgressBar currentStep={currentStep} steps={STEPS} />

        {/* Step Body Content */}
        <div className="min-h-[220px]">
          {renderActiveStep()}
        </div>

        {/* Action Controls Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/40 gap-3">
          {/* Back Button (Hidden on first step) */}
          {currentStep > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {/* Next / Submit Trigger */}
          {currentStep < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="ml-auto"
            >
              Continue
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="ml-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Generating Audit Report...
                </>
              ) : (
                'Generate Spend Audit'
              )}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
