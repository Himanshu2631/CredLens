import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Premium progress indicator for the multi-step form.
 * Combines absolute positioning, transition states, and visual cues
 * to represent onboarding steps in a polished startup design language.
 */
export default function FormProgressBar({ currentStep, steps }) {
  return (
    <div className="w-full select-none py-1">
      <div className="relative flex items-center justify-between w-full">
        {/* Background track line */}
        <div className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-zinc-800/80 rounded-full" />

        {/* Active progress track indicator */}
        <div
          className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-white transition-all duration-500 ease-out rounded-full"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isCompleted = currentStep > idx;
          const isActive = currentStep === idx;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              {/* Step indicator node */}
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold font-mono transition-all duration-300",
                  isCompleted
                    ? "bg-white border-white text-black shadow-sm"
                    : isActive
                    ? "bg-zinc-950 border-white text-white shadow-[0_0_12px_rgba(255,255,255,0.2)] scale-105"
                    : "bg-zinc-950 border-border/80 text-zinc-500"
                )}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3 stroke-[2.5]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              
              {/* Step Title Label */}
              <span
                className={cn(
                  "absolute top-7 whitespace-nowrap text-[9px] font-bold tracking-widest uppercase transition-all duration-200",
                  isActive
                    ? "text-white"
                    : isCompleted
                    ? "text-zinc-300"
                    : "text-zinc-500"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Visual buffer beneath the progress bar to avoid overlapping the form fields */}
      <div className="h-5" />
    </div>
  );
}
