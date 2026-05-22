import React from 'react';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Reusable wrapper for form inputs to handle consistent layout,
 * labels, descriptions, validation states, and error alerts.
 */
export default function FormField({
  label,
  error,
  description,
  required,
  children,
  className = '',
  htmlFor,
}) {
  return (
    <div className={cn("space-y-1.5 w-full", className)}>
      {label && (
        <Label htmlFor={htmlFor} className="text-zinc-300 font-medium text-[13px] flex items-center">
          {label}
          {required && <span className="text-zinc-500 ml-1 font-mono">*</span>}
        </Label>
      )}
      
      {description && (
        <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
          {description}
        </p>
      )}
      
      <div className="relative mt-1">
        {children}
      </div>
      
      {error && (
        <div className="flex items-center gap-1 text-[11px] text-red-400 font-medium mt-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{typeof error === 'string' ? error : error.message}</span>
        </div>
      )}
    </div>
  );
}
