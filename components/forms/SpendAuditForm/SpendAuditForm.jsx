'use client';

import React, { useState, useEffect } from 'react';
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

export default function SpendAuditForm({ onSubmitSuccess }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize React Hook Form with default values
  const methods = useForm({
    resolver: zodResolver(spendAuditFormSchema),
    mode: 'onTouch',
    defaultValues: {
      tools: [],
      toolPlans: {},
      monthlySpend: 1000,
      seats: 1,
      useCase: undefined,
      optimizationGoal: ''
    }
  });

  const { handleSubmit, trigger, reset, watch } = methods;
  
  // Watch all form inputs
  const formValues = watch();

  // Step 1: Hydrate form state and step from localStorage after mount to prevent SSR mismatch
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedState = localStorage.getItem('credlens_spend_audit_flow');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed && typeof parsed === 'object') {
          if (parsed.formData) {
            // Re-populate all inputs safely
            reset(parsed.formData);
          }
          if (typeof parsed.currentStep === 'number') {
            // Restore previous progress step
            setCurrentStep(parsed.currentStep);
          }
        }
      }
    } catch (e) {
      console.error('[CredLens] Failed to load persisted form state:', e);
    }
  }, [reset]);

  // Step 2: Auto-save form values and step index on state change (client-only)
  useEffect(() => {
    if (!isMounted) return;
    try {
      const stateToPersist = {
        formData: formValues,
        currentStep: currentStep
      };
      localStorage.setItem('credlens_spend_audit_flow', JSON.stringify(stateToPersist));
    } catch (e) {
      console.error('[CredLens] Failed to save form state to localStorage:', e);
    }
  }, [formValues, currentStep, isMounted]);

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
      reset({
        tools: [],
        toolPlans: {},
        monthlySpend: 1000,
        seats: 1,
        useCase: undefined,
        optimizationGoal: ''
      });
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
