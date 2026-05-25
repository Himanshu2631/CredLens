import React from 'react';
import Link from 'next/link';
import Container from './Container';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-background py-8 md:py-12 transition-colors duration-300">
      <Container>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left copyright and brand details */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-white tracking-wider">CREDLENS</span>
              <span className="text-[10px] text-muted-foreground font-mono px-1.5 py-0.5 rounded bg-card border border-border">
                v0.1.0-alpha
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              AI-first subscription & API cost auditing for high-growth startups.
            </p>
          </div>

          {/* Right link lists and status */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="#" className="text-xs text-muted-foreground hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-white transition-colors">
              Security
            </Link>
            <Link href="/docs" className="text-xs text-muted-foreground hover:text-white transition-colors">
              Docs
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono ml-0 md:ml-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              All Systems Operational
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-zinc-600">
            &copy; {currentYear} CredLens Inc. All rights reserved.
          </p>
          <p className="text-[11px] text-zinc-600 font-mono">
            Optimizing startup margins one API request at a time.
          </p>
        </div>
      </Container>
    </footer>
  );
}
