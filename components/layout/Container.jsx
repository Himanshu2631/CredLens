import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * A reusable layout container that enforces horizontal margins, max-widths, and padding.
 * Designed to maintain strict visual alignment across all pages.
 */
export default function Container({
  children,
  className,
  as: Component = 'div',
  ...props
}) {
  return (
    <Component
      className={twMerge(
        'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
