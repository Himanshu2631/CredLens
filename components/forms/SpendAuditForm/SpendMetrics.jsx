import React from 'react';
import { useFormContext } from 'react-hook-form';
import FormField from './FormField';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function SpendMetrics() {
  const { watch, setValue, formState: { errors } } = useFormContext();
  
  // Watch fields
  const currentSpend = watch('monthlySpend') || 1000;
  const currentSeats = watch('seats') || 1;

  // Monthly Spend input/slider updates
  const handleSliderChange = (e) => {
    const value = Number(e.target.value);
    setValue('monthlySpend', value, { shouldValidate: true, shouldDirty: true });
  };

  const handleInputChange = (e) => {
    const value = e.target.value === '' ? '' : Number(e.target.value);
    setValue('monthlySpend', value, { shouldValidate: true, shouldDirty: true });
  };

  // Seat counter stepper updates
  const handleDecrementSeats = () => {
    const nextVal = Math.max(1, currentSeats - 1);
    setValue('seats', nextVal, { shouldValidate: true, shouldDirty: true });
  };

  const handleIncrementSeats = () => {
    const nextVal = currentSeats + 1;
    setValue('seats', nextVal, { shouldValidate: true, shouldDirty: true });
  };

  const handleSeatsChange = (e) => {
    const value = e.target.value === '' ? '' : Math.floor(Number(e.target.value));
    setValue('seats', value, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-250">
      
      {/* 1. Monthly Spend Slider + Text input */}
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
                aria-invalid={errors.monthlySpend ? "true" : "false"}
                className={cn(
                  "pl-7 h-9 border-border bg-background/50 text-xs placeholder:text-zinc-650 focus-visible:ring-1 focus-visible:ring-ring",
                  errors.monthlySpend && "border-red-500/25 focus-visible:ring-red-500/30"
                )}
              />
            </div>
            <div className="text-[10px] font-mono text-muted-foreground px-2 bg-secondary/80 border border-border/50 h-8 flex items-center rounded-md shrink-0">
              USD / Month
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min={10}
              max={100000}
              step={10}
              value={currentSpend > 100000 ? 100000 : currentSpend || 10}
              onChange={handleSliderChange}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-zinc-200 transition-all"
              style={{
                background: `linear-gradient(to right, #fff 0%, #fff ${Math.min(100, ((currentSpend - 10) / 99990) * 100)}%, #27272a ${Math.min(100, ((currentSpend - 10) / 99990) * 100)}%, #27272a 100%)`
              }}
            />
            <div className="flex justify-between text-[9px] font-mono text-muted-foreground px-0.5">
              <span>$10</span>
              <span>$25k</span>
              <span>$50k</span>
              <span>$75k</span>
              <span>$100k+</span>
            </div>
          </div>
        </div>
      </FormField>

      {/* 2. Custom Seats Stepper */}
      <FormField
        label="Number of Seats / Team Members"
        description="Specify the count of user licenses, developer workspaces, or active developer accounts."
        error={errors.seats}
      >
        <div className="flex items-center gap-3 mt-2">
          {/* Stepper Wrapper */}
          <div className={cn(
            "flex items-center bg-zinc-950/60 rounded-lg border p-1 w-full max-w-[160px] transition-all",
            errors.seats 
              ? "border-red-500/25 focus-within:border-red-500/40" 
              : "border-border/50 focus-within:border-zinc-500"
          )}>
            <button
              type="button"
              onClick={handleDecrementSeats}
              disabled={currentSeats <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 bg-background text-zinc-400 hover:text-white hover:bg-zinc-900 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer font-mono font-medium text-xs select-none"
            >
              —
            </button>
            <input
              type="number"
              value={currentSeats === '' ? '' : currentSeats}
              onChange={handleSeatsChange}
              aria-invalid={errors.seats ? "true" : "false"}
              className="w-full text-center bg-transparent border-0 text-xs font-semibold text-white focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={handleIncrementSeats}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 bg-background text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all cursor-pointer font-mono font-medium text-xs select-none"
            >
              +
            </button>
          </div>
          
          <span className="text-[11px] text-muted-foreground font-medium">
            {currentSeats === 1 ? 'Active User license' : 'Active User licenses'}
          </span>
        </div>
      </FormField>

    </div>
  );
}
