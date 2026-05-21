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
  className = ''
}) {
  const textOrder = reverse ? 'lg:order-last' : '';
  const visualOrder = reverse ? 'lg:order-first' : '';

  return (
    <div
      className={cn(
        "grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center",
        className
      )}
    >
      {/* Text/Header Area */}
      <div className={cn("lg:col-span-5 space-y-4", textOrder)}>
        <SectionHeader
          badge={badge}
          title={title}
          description={description}
        />
      </div>
      {/* Visual representation Area */}
      <div className={cn("lg:col-span-7 flex justify-center", visualOrder)}>
        {visual}
      </div>
    </div>
  );
}
