import React from 'react';

/**
 * PageHeader is a reusable container for the top section of layout content pages.
 * Handles headings, alignment, margins, and supports action slot components.
 * Configured with global typography utility overrides for strict styling consistency.
 */
export default function PageHeader({
  title,
  description,
  actions,
  className = '',
}) {
  return (
    <div className={`border-b border-border pb-5 pt-8 sm:flex sm:items-center sm:justify-between sm:space-x-5 ${className}`}>
      <div className="min-w-0 flex-1">
        <h1 className="text-section">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-subtitle max-w-3xl">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="mt-4 flex flex-shrink-0 sm:mt-0 sm:ml-4 items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
