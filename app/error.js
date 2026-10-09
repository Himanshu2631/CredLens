'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import Container from '@/components/layout/Container';
import SectionWrapper from '@/components/layout/SectionWrapper';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error('[CredLens] Client/Server runtime error caught:', error);
  }, [error]);

  return (
    <PageContainer className="relative overflow-hidden bg-zinc-950 min-h-[70vh] flex items-center justify-center">
      <SectionWrapper className="py-20 relative z-10 w-full">
        <Container className="max-w-md mx-auto text-center space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-900/40 bg-red-950/20 text-red-400">
            <AlertTriangle className="h-6 w-6 stroke-[1.75]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Temporary Loading Error
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
              We encountered an issue loading this view. You can reload the state or return to the audit console.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => reset()}
              className="w-full sm:w-auto h-9 px-4 text-xs font-mono uppercase tracking-wider gap-2 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reload Page
            </Button>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md border border-zinc-800 bg-zinc-900/40 text-xs font-mono uppercase tracking-wider text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Audit Console
            </Link>
          </div>
        </Container>
      </SectionWrapper>
    </PageContainer>
  );
}
