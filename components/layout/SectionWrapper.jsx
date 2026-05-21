import React from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * SectionWrapper wraps individual logical pages or block sections,
 * applying responsive section padding and optional border breaks.
 */
export default function SectionWrapper({
  children,
  className = '',
  as: Component = 'section',
  borderBottom = false,
  ...props
}) {
  return (
    <Component
      className={twMerge(
        'section-spacing w-full',
        borderBottom && 'border-b border-border',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
