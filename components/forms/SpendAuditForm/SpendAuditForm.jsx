'use client';

import React, { useState } from 'react';
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

  // Initialize React Hook Form
  const methods = useForm({
    resolver: zodResolver(spendAuditFormSchema),
    mode: 'onTouch', // Validates on field touch for early feedback
    defaultValues: {
      tools: [],
      plan: undefined,
      monthlySpend: 1000,
      teamSize: undefined,
      useCase: undefined,
      optimizationGoal: ''
    }
  });

  const { handleSubmit, trigger, reset, formState: { errors } } = methods;

  // Handle forward navigation with validation triggers
  const handleNext = async () => {
    let fieldsToValidate = [];
    if (currentStep === 0) {
      fieldsToValidate = ['tools'];
    } else if (currentStep === 1) {
      fieldsToValidate = ['plan', 'monthlySpend', 'teamSize'];
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
    
    // Simulate premium pipeline analysis
    await new Promise((resolve) => setTimeout(resolve, 1800));
    
    setIsSubmitting(false);

    if (onSubmitSuccess) {
      onSubmitSuccess({
        ...data,
        submittedAt: new Date().toISOString()
      });
    }

    // Reset flow and form states
    setCurrentStep(0);
    reset({
      tools: [],
      plan: undefined,
      monthlySpend: 1000,
      teamSize: undefined,
      useCase: undefined,
      optimizationGoal: ''
    });
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
            Map your LLM tool stack, pricing tiers, and primary models to scan for token leaks.
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
              className="h-9 px-4 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back
            </Button>
          ) : (
            <div /> // Empty block to align Next/Submit button to the right
          )}

          {/* Next / Submit Trigger */}
          {currentStep < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="h-9 px-4 text-xs font-semibold bg-primary hover:bg-zinc-200 cursor-pointer ml-auto"
            >
              Continue
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-5 text-xs font-semibold bg-primary hover:bg-zinc-200 cursor-pointer ml-auto"
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
