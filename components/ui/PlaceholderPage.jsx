'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import SectionWrapper from '@/components/layout/SectionWrapper';
import Container from '@/components/layout/Container';
import { Button } from '@/components/ui/button';
import Badge from '@/components/ui/Badge';

/**
 * Reusable premium placeholder page component for upcoming platform features.
 * Features grid backgrounds, status indicator badges, and upcoming list item telemetry.
 *
 * @param {string} title - Page header title
 * @param {string} description - Explanation of the tool's purpose
 * @param {React.ComponentType} icon - Lucide React Icon Component
 * @param {Array<string>} features - List of upcoming highlights
 */
export default function PlaceholderPage({ title, description, icon: Icon, features = [] }) {
  return (
    <PageContainer className="relative overflow-hidden">
      {/* Visual background accents: grid patterns and ambient glows */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#09090b_1px,transparent_1px),linear-gradient(to_bottom,#09090b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" 
        aria-hidden="true"
      />
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" 
        aria-hidden="true"
      />

      <SectionWrapper className="pt-20 pb-24 relative z-10 flex-1 flex items-center">
        <Container className="max-w-xl mx-auto text-center space-y-8">
          
          {/* Status Badge */}
          <div className="flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Badge variant="muted" dot={true} className="border-emerald-500/20 bg-emerald-950/10 text-emerald-400 font-mono tracking-wider text-[10px] uppercase py-1 px-3">
              Feature Pipeline
            </Badge>
          </div>

          {/* Central Visual Icon & Glow */}
          <div className="flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-400">
            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur-md group-hover:blur-lg transition-all duration-300" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 text-emerald-400">
                {Icon && <Icon className="h-6 w-6 stroke-[1.75]" />}
              </div>
            </div>
          </div>

          {/* Typography Narrative */}
          <div className="space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-white">
              {title}
            </h1>
            <p className="text-zinc-400 text-xs md:text-sm leading-[1.6] font-normal max-w-md mx-auto">
              {description}
            </p>
          </div>

          {/* Roadmap Highlights Ledger */}
          {features.length > 0 && (
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-5 text-left space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-600 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-zinc-800/50 pb-2.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                  Proposed Capability Ledger
                </span>
              </div>
              <ul className="space-y-3.5">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500/80 shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-zinc-300 text-xs leading-relaxed font-normal">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions CTA Section */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 animate-in fade-in slide-in-from-bottom-3 duration-700">
            <Link href="/" passHref legacyBehavior>
              <Button
                as="a"
                variant="outline"
                size="sm"
                className="h-9 gap-2 text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-white border-zinc-800/80 bg-zinc-950 hover:bg-zinc-900 w-full sm:w-auto"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Auditor
              </Button>
            </Link>
            <Button
              variant="default"
              size="sm"
              className="h-9 text-xs font-mono uppercase tracking-wider w-full sm:w-auto shadow-[0_1px_2px_rgba(255,255,255,0.05)]"
              onClick={() => alert("Thank you for your interest! We have noted your request for this feature.")}
            >
              Request Beta Access
            </Button>
          </div>

        </Container>
      </SectionWrapper>
    </PageContainer>
  );
}
