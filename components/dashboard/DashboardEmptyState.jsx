import React from 'react';
import { BarChart2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

/**
 * DashboardEmptyState — shown when no audits have been saved to MongoDB yet.
 * Explains what the dashboard does and points the user to the audit form.
 */
export default function DashboardEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center space-y-6">
      {/* Icon block */}
      <div className="h-14 w-14 rounded-xl bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-center">
        <BarChart2 className="h-6 w-6 text-zinc-500" />
      </div>

      {/* Headline */}
      <div className="space-y-2 max-w-sm">
        <h2 className="text-sm font-semibold text-zinc-200">
          No audit data yet
        </h2>
        <p className="text-xs text-zinc-500 leading-relaxed">
          The dashboard populates after your first saved audit report.
          Run an AI spend audit, save it with your business email, and your
          real metrics will appear here automatically.
        </p>
      </div>

      {/* CTA */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-900 hover:border-zinc-700 hover:text-white transition-all duration-150"
      >
        Run your first audit
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
