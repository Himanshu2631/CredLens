import React from 'react';

/**
 * PageContainer provides the top-level page wrapper that ensures proper height,
 * flex structure, and default background colors.
 */
export default function PageContainer({ children, className = '', ...props }) {
  return (
    <div
      className={`flex-1 flex flex-col w-full bg-background min-h-screen ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
