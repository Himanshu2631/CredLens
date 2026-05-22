import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Bot, Cpu, GitFork, Image, MessageCircle } from 'lucide-react';
import FormField from './FormField';
import { cn } from '@/lib/utils';

// Primary use-case options
const USE_CASES = [
  {
    id: 'production_llms',
    title: 'Production Core LLM',
    desc: 'High-volume user-facing chat, parsing, and structured generation API calls',
    icon: Bot
  },
  {
    id: 'prototyping_rd',
    title: 'R&D / Prototyping',
    desc: 'Internal experimentations, pipeline evaluations, and developer notebooks',
    icon: Cpu
  },
  {
    id: 'agentic_workflows',
    title: 'Agentic Workflows',
    desc: 'Autonomous multi-step loops, tools calling, and long-running state machine graphs',
    icon: GitFork
  },
  {
    id: 'image_media',
    title: 'Creative / Media Gen',
    desc: 'Asset generation using diffusion models, GPU clusters, and style embeddings',
    icon: Image
  },
  {
    id: 'customer_support',
    title: 'Support Automation',
    desc: 'RAG search agents, knowledge base indexing, and ticket classification',
    icon: MessageCircle
  }
];

export default function UseCaseSelection() {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const currentUseCase = watch('useCase');

  const handleUseCaseSelect = (useCaseId) => {
    setValue('useCase', useCaseId, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-250">
      
      {/* 1. Primary Use-case Card Radio Group */}
      <FormField
        label="Primary AI Use-Case"
        description="Choose the dominant architectural pattern for your AI usage."
        error={errors.useCase}
      >
        <div className="flex flex-col gap-2 mt-2">
          {USE_CASES.map((uc) => {
            const isSelected = currentUseCase === uc.id;
            const Icon = uc.icon;

            return (
              <button
                key={uc.id}
                type="button"
                onClick={() => handleUseCaseSelect(uc.id)}
                className={cn(
                  "flex items-start text-left p-3 rounded-lg border transition-all duration-150 group cursor-pointer select-none",
                  isSelected
                    ? "bg-zinc-900 border-zinc-200 shadow-[0_0_12px_rgba(255,255,255,0.04)]"
                    : "bg-zinc-950/40 border-border/60 hover:bg-zinc-950 hover:border-zinc-800"
                )}
              >
                <div className={cn(
                  "mr-3 flex h-7 w-7 items-center justify-center rounded-lg border bg-background transition-colors",
                  isSelected ? "bg-zinc-950 border-zinc-700 text-white" : "border-border/40 text-muted-foreground group-hover:text-zinc-350"
                )}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5 flex-1 pr-2">
                  <h4 className={cn(
                    "text-xs font-semibold transition-colors duration-100",
                    isSelected ? "text-white" : "text-zinc-300 group-hover:text-white"
                  )}>
                    {uc.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground leading-normal font-normal">
                    {uc.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </FormField>

      {/* 2. Target Optimization Goal Textarea */}
      <FormField
        label="Target Optimization Goals (Optional)"
        description="What specific objective are you aiming to solve? (e.g. prompt token caching, rate-limit pooling, routing models)"
        error={errors.optimizationGoal}
      >
        <textarea
          id="optimizationGoal"
          placeholder="e.g. Reduce Anthropic prompt caching overhead, find cold vector search indexes..."
          rows={2}
          className="w-full mt-2 rounded-lg border border-border bg-background/50 px-3 py-2 text-xs text-zinc-300 placeholder:text-zinc-650 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring transition-colors outline-none resize-none"
          {...register('optimizationGoal')}
        />
      </FormField>

    </div>
  );
}
