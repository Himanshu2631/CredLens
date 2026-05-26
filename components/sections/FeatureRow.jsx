import React from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import { cn } from '@/lib/utils';

/**
 * Reusable layout row for product features.
 * Automatically aligns content and visual representations, supporting reversed grid order.
 */
export default function FeatureRow({
  badge,
  title,
  description,
  visual,
  reverse = false,
  className = '',
  children
}) {
  const textOrder = reverse ? 'lg:order-last' : '';
  const visualOrder = reverse ? 'lg:order-first' : '';

  return (
    <div
      className={cn(
        "grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center",
        className
      )}
    >
      {/* Text/Header Area */}
      <div className={cn("lg:col-span-6 space-y-4", textOrder)}>
        <SectionHeader
          badge={badge}
          title={title}
          description={description}
        />
        {children}
      </div>
      {/* Visual representation Area */}
      <div
        className={cn(
          "lg:col-span-6 flex justify-center",
          reverse ? "lg:justify-end" : "lg:justify-start",
          visualOrder
        )}
      >
        {visual}
      </div>
    </div>
  );
}
