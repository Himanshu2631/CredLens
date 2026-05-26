'use client';

import React, { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import SectionWrapper from '@/components/layout/SectionWrapper';
import ContentWrapper from '@/components/layout/ContentWrapper';
import Container from '@/components/layout/Container';
import Hero from '@/components/sections/Hero';
import SocialProof from '@/components/sections/SocialProof';
import Features from '@/components/sections/Features';
import HowItWorks from '@/components/sections/HowItWorks';
import CTA from '@/components/sections/CTA';
import SpendAuditForm from '@/components/forms/SpendAuditForm/SpendAuditForm';
import AuditResultsPanel from '@/components/results/AuditResultsPanel';
import AuditOverviewSkeleton from '@/components/results/AuditOverviewSkeleton';
import SavingsMethodologyPanel from '@/components/results/SavingsMethodologyPanel';
import { OPTIMIZATION_RULES } from '@/data/rules';
import { runSpendAudit } from '@/lib/audit/rulesEngine';
import { createSpendAudit } from '@/lib/api';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [activeAudit, setActiveAudit] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load audit state from localStorage after mount to prevent SSR mismatch
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      try {
        const savedAudit = localStorage.getItem('credlens_active_audit');
        if (savedAudit) {
          setActiveAudit(JSON.parse(savedAudit));
        }
      } catch (e) {
        console.error('[CredLens] Failed to load persisted active audit:', e);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const [auditError, setAuditError] = useState(null);

  // Run the audit engine dynamically via backend API and store full response.
  // Falls back to browser execution gracefully if database connection is unreachable.
  const handleAuditSubmit = async (formData) => {
    setAuditError(null);
    setIsGenerating(true);
    try {
      const savedAudit = await createSpendAudit({
        projectName: `${formData.useCase || 'Startup'}_AI_Audit`,
        tools: formData.tools,
        toolPlans: formData.toolPlans,
        seats: formData.seats,
        monthlySpend: formData.monthlySpend,
        useCase: formData.useCase,
        optimizationGoal: formData.optimizationGoal,
      });

      const auditData = {
        ...formData,
        _id: savedAudit._id,
        shareToken: savedAudit.shareToken,
        submittedAt: savedAudit.createdAt,
        auditResult: savedAudit
      };

      setActiveAudit(auditData);
      try {
        localStorage.setItem('credlens_active_audit', JSON.stringify(auditData));
        localStorage.setItem('credlens_latest_audit_id', savedAudit._id);
        window.dispatchEvent(new Event('credlens_audit_updated'));
      } catch (e) {
        console.error('[CredLens] Failed to save active audit to localStorage:', e);
      }
      
      // Force next.js to refresh the router and clear prefetch caches
      try {
        router.refresh();
      } catch (routerErr) {
        console.warn('[CredLens] Failed to refresh router:', routerErr);
      }
      
      document.getElementById('audit-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      console.warn('[CredLens] Persistence failed, running browser fallback:', err);
      
      try {
        const auditResult = runSpendAudit(formData);
        const auditData = {
          ...formData,
          submittedAt: new Date().toISOString(),
          auditResult
        };
        setActiveAudit(auditData);
        setAuditError('Running in local offline mode. Report is viewable but was not persisted.');
        document.getElementById('audit-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (fallbackErr) {
        setAuditError(err.message || 'Failed to process spend audit. Please check your network connection.');
        throw err;
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Clear audit state to return to the idle/form state
  const handleAuditReset = () => {
    setActiveAudit(null);
    try {
      localStorage.removeItem('credlens_active_audit');
    } catch (e) {
      console.error('[CredLens] Failed to remove active audit from localStorage:', e);
    }
  };

  return (
    <PageContainer>
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Main Audit Workspace — Placed high up to establish the audit flow as the dominant narrative */}
      <SectionWrapper
        id="audit-workspace"
        className="py-20 md:py-24 scroll-mt-20 border-b border-border/30 bg-zinc-950/5 relative"
      >
        <Container className="space-y-12">
          {/* Section Introduction */}
          <div className="max-w-xl mx-auto text-center space-y-3">
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase bg-emerald-950/10 border border-emerald-900/30 px-3 py-1 rounded-full">
              Interactive Ingest Portal
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Run a Live AI Spend Audit
            </h2>
            <p className="text-zinc-400 text-xs md:text-sm font-normal leading-relaxed">
              Configure your tools, active pricing plans, and seat assignments. Our cost intelligence engine will identify redundancies, licensing mismatches, and inactive seat leaks.
            </p>
          </div>

          <ContentWrapper cols={12} className="gap-8 md:gap-10 pt-4">

            {/* Left Column: Configuration Form + Architecture Note */}
            <div className="col-span-12 lg:col-span-5 space-y-6">
              {auditError && (
                <div className="rounded-xl border border-amber-950/20 bg-amber-950/5 p-4 text-xs text-amber-500 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                  <div>
                    <strong className="font-semibold block mb-0.5">Audit Environment Notice</strong>
                    {auditError}
                  </div>
                </div>
              )}
              
              <SpendAuditForm onSubmitSuccess={handleAuditSubmit} />

              {/* Data & Privacy Note */}
              <div className="rounded-xl border border-border bg-card/30 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                  <AlertCircle className="h-4 w-4 text-zinc-500" />
                  Data & Privacy
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed font-normal">
                  Audits run securely inside your browser session. Stack setups and calculated recommendations are saved to MongoDB to support report sharing and CRM sync.
                </p>
              </div>

              {/* Supporting Savings Heuristics & Methodology */}
              {isMounted && activeAudit && (
                <SavingsMethodologyPanel />
              )}
            </div>

            {/* Right Column: Results Panel or Rules Catalog */}
            <div className="col-span-12 lg:col-span-7 space-y-6">
              {isGenerating ? (
                /* ── Loading Skeleton State ── */
                <AuditOverviewSkeleton />
              ) : isMounted && activeAudit ? (
                /* ── Live Audit Results ── */
                <AuditResultsPanel
                  auditResult={activeAudit.auditResult}
                  formData={activeAudit}
                  onReset={handleAuditReset}
                />
              ) : (
                /* ── Idle: Static Optimization Rules Catalog ── */
                <div
                  id="rules-catalog"
                  className="scroll-mt-20 rounded-xl border border-border/80 bg-zinc-950/30 p-6 space-y-6 backdrop-blur-sm shadow-[0_12px_24px_-10px_rgba(0,0,0,0.5)]"
                >
                  <div className="space-y-2">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                      <HelpCircle className="h-3.5 w-3.5 text-zinc-500" />
                      Audit Engine Rules ({OPTIMIZATION_RULES.length})
                    </h3>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
                      CredLens evaluates your AI subscription stack against a specialized registry of optimization rules to pinpoint cost redundancies, license tier mismatches, and inactive seat leaks.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {OPTIMIZATION_RULES.map((rule) => (
                      <div
                        key={rule.id}
                        className="group rounded-lg border border-border/40 bg-zinc-950/40 p-4 hover:border-border/80 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                            {rule.provider} / {rule.category}
                          </span>
                          <span
                            className={`text-[8.5px] font-mono uppercase px-1.5 py-0.5 rounded font-medium border ${
                              rule.impact === 'high'
                                ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30'
                                : rule.impact === 'medium'
                                ? 'bg-amber-950/20 text-amber-400 border-amber-900/30'
                                : 'bg-zinc-900/40 text-zinc-400 border-zinc-800/40'
                            }`}
                          >
                            {rule.impact} impact
                          </span>
                        </div>
                        <h4 className="mt-3 text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                          {rule.title}
                        </h4>
                        <p className="mt-1.5 text-[10.5px] text-zinc-400 leading-relaxed font-normal">
                          {rule.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </ContentWrapper>
        </Container>
      </SectionWrapper>

      {/* 3. How It Works Section */}
      <HowItWorks />

      {/* 4. Feature Highlights Section */}
      <Features />

      {/* 5. Social Proof Section */}
      <SocialProof />

      {/* 6. Final Call to Action */}
      <CTA />
    </PageContainer>
  );
}
