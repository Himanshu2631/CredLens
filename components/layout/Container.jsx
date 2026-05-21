import React from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * A reusable layout container that enforces horizontal margins, max-widths, and padding.
 * Maps to the unified container-padding utility in globals.css.
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
        'mx-auto w-full max-w-7xl container-padding',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
