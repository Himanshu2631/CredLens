import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Cpu, 
  Settings, 
  Share2, 
  ArrowLeft 
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import SectionWrapper from '@/components/layout/SectionWrapper';
import Container from '@/components/layout/Container';
import ContentWrapper from '@/components/layout/ContentWrapper';
import Badge from '@/components/ui/Badge';

export default function DocsPage() {
  const docSections = [
    {
      icon: BookOpen,
      title: 'Platform Overview',
      subtitle: 'What is CredLens?',
      description: 'CredLens is an AI-first cost intelligence platform designed for high-growth startups to audit active SaaS licensing and volumetric API integrations. By comparing employee activity profiles and API token usage logs against tool pricing registries, it isolates duplicate software allocations and over-provisioned subscription pools.'
    },
    {
      icon: Cpu,
      title: 'Audited Tool Coverage',
      subtitle: 'Supported AI Infrastructure & Assistants',
      description: 'CredLens profiles high-cost developer models and workspace assistant packages including: OpenAI (ChatGPT Plus/Team/Enterprise & model APIs), Anthropic (Claude Pro & API endpoints), Google Gemini (Workspace & APIs), and Specialized Software (Cursor Pro, GitHub Copilot, and v0.dev front-end accounts).'
    },
    {
      icon: Settings,
      title: 'Audit Engine Rules',
      subtitle: 'Spend Diagnostic Logic',
      description: 'Potential savings are evaluated programmatically using four cost diagnostic heuristics: Inactive Seats (flagging users inactive for 30+ days), Provider Overlap (detecting duplicate tools like Cursor + Copilot on the same team), Tier Mismatches (scaling down underutilized Enterprise plans), and API Routing Efficiency.'
    },
    {
      icon: Share2,
      title: 'Collaboration & Reports',
      subtitle: 'SaaS Sharing & Verification Workflows',
      description: 'Distribute findings across departments cleanly: share credential-safe, read-only dashboard links stripped of sensitive passwords/tokens; export printer-friendly, light-mode PDF reports localized in USD or INR; or download spreadsheet-ready CSV sheets for ledger import.'
    }
  ];

  return (
    <PageContainer className="relative overflow-hidden bg-zinc-950">
      {/* Background Decorative Grid and Glow */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#09090b_1px,transparent_1px),linear-gradient(to_bottom,#09090b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" 
        aria-hidden="true"
      />
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" 
        aria-hidden="true"
      />

      <SectionWrapper className="pt-16 pb-24 relative z-10">
        <Container className="max-w-5xl mx-auto space-y-12">
          
          {/* Back Button Link */}
          <div className="flex items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Auditor
            </Link>
          </div>

          {/* Hero Section */}
          <div className="space-y-4 max-w-2xl">
            <div className="flex">
              <Badge variant="success" dot={true} className="border-emerald-500/20 bg-emerald-950/10 text-emerald-400 font-mono tracking-wider text-[10px] uppercase py-1 px-3">
                Help Center
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white leading-tight">
              Documentation & Guides
            </h1>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-normal">
              Learn how the CredLens spend audit engine inspects subscription plans, optimizes API configurations, and restores runway margins.
            </p>
          </div>

          {/* Grid Layout of Help Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {docSections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <div 
                  key={idx}
                  className="group rounded-xl border border-zinc-900 bg-zinc-950/60 p-6 space-y-4 hover:border-zinc-800 transition-all duration-200 shadow-sm"
                >
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-950 text-zinc-400 group-hover:text-emerald-400 transition-colors">
                    <Icon className="h-5 w-5 stroke-[1.75]" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block">
                      {section.subtitle}
                    </span>
                    <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-[1.65] font-normal">
                      {section.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Callout Info */}
          <div className="rounded-xl border border-zinc-900 bg-zinc-950/30 p-5 text-center max-w-xl mx-auto space-y-2 select-none">
            <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block">
              Still have integration questions?
            </span>
            <p className="text-xs text-zinc-400">
              Submit product feedback or request dedicated enterprise API connections using our feedback portal in the navigation header.
            </p>
          </div>

        </Container>
      </SectionWrapper>
    </PageContainer>
  );
}
