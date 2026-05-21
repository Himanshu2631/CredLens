import React from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * ContentWrapper controls the layout composition of contents inside sections,
 * implementing responsive column grids and unified layout gaps.
 */
export default function ContentWrapper({
  children,
  className = '',
  cols = 1,
  ...props
}) {
  const colClasses = {
    1: 'grid grid-cols-1',
    2: 'grid grid-cols-1 md:grid-cols-2 gap-8',
    3: 'grid grid-cols-1 md:grid-cols-3 gap-8',
    12: 'grid grid-cols-1 lg:grid-cols-12 gap-8',
  };

  return (
    <div
      className={twMerge(
        colClasses[cols] || colClasses[1],
        'items-start w-full',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
