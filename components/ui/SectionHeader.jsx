import React from 'react';
import Badge from './Badge';
import { cn } from '@/lib/utils';

/**
 * Reusable section heading wrapper for landing page layouts.
 * Establishes typography hierarchy, spacing, and optional badge styling.
 */
export default function SectionHeader({
  badge,
  badgeVariant = 'default',
  badgeDot = false,
  title,
  description,
  align = 'left', // 'left' | 'center'
  className = '',
  titleClassName = '',
  descriptionClassName = ''
}) {
  return (
    <div
      className={cn(
        "space-y-4",
        align === 'center' ? "text-center flex flex-col items-center" : "",
        className
      )}
    >
      {badge && (
        <Badge variant={badgeVariant} dot={badgeDot}>
          {badge}
        </Badge>
      )}
      
      <h3
        className={cn(
          "text-section tracking-tight text-white",
          titleClassName
        )}
      >
        {title}
      </h3>
      
      {description && (
        <p
          className={cn(
            "text-zinc-400 text-xs md:text-sm leading-relaxed",
            align === 'center' ? "max-w-md" : "max-w-xl",
            descriptionClassName
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
