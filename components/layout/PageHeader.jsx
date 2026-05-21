import React from 'react';

/**
 * PageHeader is a reusable container for the top section of layout content pages.
 * Handles headings, alignment, margins, and supports action slot components.
 */
export default function PageHeader({
  title,
  description,
  actions,
  className = '',
}) {
  return (
    <div className={`border-b border-zinc-900 pb-5 pt-8 sm:flex sm:items-center sm:justify-between sm:space-x-5 ${className}`}>
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-xs text-zinc-400 max-w-2xl leading-relaxed">
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
