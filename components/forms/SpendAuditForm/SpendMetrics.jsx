import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Layers, CreditCard, ShieldCheck } from 'lucide-react';
import FormField from './FormField';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Pricing plan options
const PLANS = [
  {
    id: 'pay_as_you_go',
    title: 'Pay-as-you-go',
    desc: 'Variable API pricing based on token consumption (e.g. OpenAI/Anthropic keys)',
    icon: CreditCard
  },
  {
    id: 'fixed_subscription',
    title: 'Fixed Subscription',
    desc: 'Flat monthly tiers or fixed bundles with prepaid usage thresholds',
    icon: Layers
  },
  {
    id: 'custom_enterprise',
    title: 'Enterprise Contract',
    desc: 'Negotiated high-volume annual contracts, dedicated VPC routers',
    icon: ShieldCheck
  }
];

// Team size options
const TEAM_SIZES = ['1-5', '6-20', '21-50', '50+'];

export default function SpendMetrics() {
  const { watch, setValue, register, formState: { errors } } = useFormContext();
  
  // Watch fields
  const currentPlan = watch('plan');
  const currentSpend = watch('monthlySpend') || 1000;
  const currentTeamSize = watch('teamSize');

  const handlePlanSelect = (planId) => {
    setValue('plan', planId, { shouldValidate: true, shouldDirty: true });
  };

  const handleTeamSizeSelect = (size) => {
    setValue('teamSize', size, { shouldValidate: true, shouldDirty: true });
  };

  // Sync range slider (up to 100k cap for slider visual representation)
  const handleSliderChange = (e) => {
    const value = Number(e.target.value);
    setValue('monthlySpend', value, { shouldValidate: true, shouldDirty: true });
  };

  // Raw number input handler
  const handleInputChange = (e) => {
    const value = e.target.value === '' ? '' : Number(e.target.value);
    setValue('monthlySpend', value, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-250">
      
      {/* 1. Plan Selection */}
      <FormField
        label="AI Pricing Model"
        description="Choose how you primarily settle invoices for these models. This helps us optimize credit usage and commit tiers."
        error={errors.plan}
      >
        <div className="flex flex-col gap-2 mt-2">
          {PLANS.map((plan) => {
            const isSelected = currentPlan === plan.id;
            const Icon = plan.icon;
            
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => handlePlanSelect(plan.id)}
                className={cn(
                  "flex items-start text-left p-3 rounded-lg border transition-all duration-150 group cursor-pointer select-none",
                  isSelected
                    ? "bg-zinc-900 border-zinc-200 shadow-[0_0_12px_rgba(255,255,255,0.04)]"
                    : "bg-zinc-950/40 border-border/60 hover:bg-zinc-950 hover:border-zinc-800"
                )}
              >
                <div className={cn(
                  "mr-3 flex h-7 w-7 items-center justify-center rounded-lg border bg-background transition-colors",
                  isSelected ? "bg-zinc-950 border-zinc-700 text-white" : "border-border/40 text-muted-foreground group-hover:text-zinc-300"
                )}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5 flex-1 pr-2">
                  <h4 className={cn(
                    "text-xs font-semibold transition-colors duration-100",
                    isSelected ? "text-white" : "text-zinc-300 group-hover:text-white"
                  )}>
                    {plan.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground leading-normal font-normal">
                    {plan.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </FormField>

      {/* 2. Monthly Spend (Synced inputs) */}
      <FormField
        label="Estimated Monthly AI Spend ($)"
        description="Your approximate aggregate API billing or model subscription overhead across tools."
        error={errors.monthlySpend}
      >
        <div className="space-y-4 mt-2 p-4 rounded-lg border border-border/50 bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono font-medium">$</span>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 5000"
                value={currentSpend === '' ? '' : currentSpend}
                onChange={handleInputChange}
                className="pl-7 h-9 border-border bg-background/50 text-xs placeholder:text-zinc-650 focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="text-[10px] font-mono text-muted-foreground px-2 bg-secondary/80 border border-border/50 h-8 flex items-center rounded-md shrink-0">
              USD / Month
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min={100}
              max={100000}
              step={100}
              value={currentSpend > 100000 ? 100000 : currentSpend || 100}
              onChange={handleSliderChange}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-zinc-200 transition-all"
              style={{
                background: `linear-gradient(to right, #fff 0%, #fff ${Math.min(100, ((currentSpend - 100) / 99900) * 100)}%, #27272a ${Math.min(100, ((currentSpend - 100) / 99900) * 100)}%, #27272a 100%)`
              }}
            />
            <div className="flex justify-between text-[9px] font-mono text-muted-foreground px-0.5">
              <span>$100</span>
              <span>$25k</span>
              <span>$50k</span>
              <span>$75k</span>
              <span>$100k+</span>
            </div>
          </div>
        </div>
      </FormField>

      {/* 3. Team Size Selector */}
      <FormField
        label="Engineering Team Size"
        description="The size of your developer workforce actively requesting model credentials."
        error={errors.teamSize}
      >
        <div className="grid grid-cols-4 gap-1.5 mt-2 bg-zinc-950/60 p-1 rounded-lg border border-border/50">
          {TEAM_SIZES.map((size) => {
            const isSelected = currentTeamSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => handleTeamSizeSelect(size)}
                className={cn(
                  "py-1.5 rounded-md text-[11px] font-medium transition-all text-center cursor-pointer select-none",
                  isSelected
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-white hover:bg-zinc-900/50"
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </FormField>

    </div>
  );
}
