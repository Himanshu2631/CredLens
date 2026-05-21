'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// Form validation schema using Zod
const auditFormSchema = z.object({
  projectName: z
    .string()
    .min(2, { message: 'Project or startup name must be at least 2 characters.' })
    .max(50, { message: 'Project name must not exceed 50 characters.' }),
  monthlyBudget: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Monthly budget must be a positive number.',
    }),
  primaryProvider: z.enum(['all', 'openai', 'anthropic', 'other'], {
    required_error: 'Please select a primary provider.',
  }),
});

export default function AuditForm({ onSubmitSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileAttached, setFileAttached] = useState(false);
  const [fileName, setFileName] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(auditFormSchema),
    defaultValues: {
      projectName: '',
      monthlyBudget: '1000',
      primaryProvider: 'all',
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileAttached(true);
    } else {
      setFileName('');
      setFileAttached(false);
    }
  };

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    // Simulate API delay - Day 1 setup only
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    
    if (onSubmitSuccess) {
      onSubmitSuccess({
        ...data,
        fileName: fileName || 'simulated_usage.csv',
      });
    }
    
    // Reset form and file state
    reset();
    setFileName('');
    setFileAttached(false);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6 rounded-xl border border-border bg-card p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
    >
      <div className="space-y-2">
        <h2 className="text-body-premium font-medium text-white">Configure Cost Audit</h2>
        <p className="text-muted-premium">
          Enter project parameters and attach your usage files (or simulated logs) to audit your expenses.
        </p>
      </div>

      <div className="space-y-4">
        {/* Project Name */}
        <div className="space-y-2">
          <Label htmlFor="projectName" className="text-muted-premium font-medium text-muted-foreground">
            Startup / Project Name
          </Label>
          <Input
            id="projectName"
            placeholder="e.g. Acme AI"
            className="h-9 border-border bg-background text-xs placeholder:text-zinc-650 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
            {...register('projectName')}
          />
          {errors.projectName && (
            <span className="flex items-center gap-1 text-[11px] text-red-400 font-medium">
              <AlertCircle className="h-3 w-3" />
              {errors.projectName.message}
            </span>
          )}
        </div>

        {/* Monthly Budget & Provider Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="monthlyBudget" className="text-muted-premium font-medium text-muted-foreground">
              Monthly Spend Limit ($)
            </Label>
            <Input
              id="monthlyBudget"
              type="number"
              placeholder="e.g. 5000"
              className="h-9 border-border bg-background text-xs placeholder:text-zinc-650 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
              {...register('monthlyBudget')}
            />
            {errors.monthlyBudget && (
              <span className="flex items-center gap-1 text-[11px] text-red-400 font-medium">
                <AlertCircle className="h-3 w-3" />
                {errors.monthlyBudget.message}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryProvider" className="text-muted-premium font-medium text-muted-foreground">
              Target Provider
            </Label>
            <select
              id="primaryProvider"
              className="flex w-full rounded-md border border-border bg-background px-3 py-1.5 h-9 text-xs text-zinc-300 ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              {...register('primaryProvider')}
            >
              <option value="all">All Providers (Consolidated)</option>
              <option value="openai">OpenAI API</option>
              <option value="anthropic">Anthropic API</option>
              <option value="other">Other SaaS / LLMs</option>
            </select>
            {errors.primaryProvider && (
              <span className="flex items-center gap-1 text-[11px] text-red-400 font-medium">
                <AlertCircle className="h-3 w-3" />
                {errors.primaryProvider.message}
              </span>
            )}
          </div>
        </div>

        {/* Drag and Drop File Upload Skeleton */}
        <div className="space-y-2">
          <Label className="text-muted-premium font-medium text-muted-foreground">Upload Usage Logs (CSV / JSON)</Label>
          <div className="relative flex flex-col items-center justify-center border border-dashed border-border bg-background/20 hover:bg-background/60 hover:border-zinc-700 transition-all rounded-lg p-6 text-center cursor-pointer group">
            <input
              type="file"
              accept=".csv,.json"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary border border-border text-muted-foreground group-hover:text-white transition-colors">
                {fileAttached ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                ) : (
                  <UploadCloud className="h-4 w-4" />
                )}
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-zinc-300">
                  {fileAttached ? fileName : 'Click or drag files here'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {fileAttached ? 'File ready for audit parsing' : 'Supports standard exports from OpenAI or Stripe'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-9 bg-primary text-primary-foreground hover:bg-zinc-200 text-xs font-medium transition-all"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            Analyzing Logs...
          </>
        ) : (
          'Generate Spend Audit'
        )}
      </Button>
    </form>
  );
}
