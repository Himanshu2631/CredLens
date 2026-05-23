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
import { OPTIMIZATION_RULES } from '@/data/rules';
import { runSpendAudit } from '@/lib/audit/rulesEngine';
import { createSpendAudit } from '@/lib/api';
import { AlertCircle, HelpCircle } from 'lucide-react';

export default function Home() {
  const [activeAudit, setActiveAudit] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

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
      } catch (e) {
        console.error('[CredLens] Failed to save active audit to localStorage:', e);
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
      {/* Hero */}
      <Hero />

      {/* Social Proof */}
      <SocialProof />

      {/* Feature Highlights */}
      <Features />

      {/* How It Works */}
      <HowItWorks />

      {/* ── Main Audit Workspace ─────────────────────────────────────────────── */}
      <SectionWrapper
        id="audit-workspace"
        className="pt-12 scroll-mt-20 border-b border-border/30 bg-zinc-950/5"
      >
        <Container>
          <ContentWrapper cols={12}>

            {/* Left Column: Configuration Form + Architecture Note */}
            <div className="lg:col-span-5 space-y-6">
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

              {/* Platform scope reminder — honest engineering callout */}
              <div className="rounded-xl border border-border bg-card/30 p-4 space-y-2">
                <div className="flex items-center gap-2 text-body-premium font-medium text-zinc-300">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  Data Persistence
                </div>
                <p className="text-muted-premium">
                  Audit reports are evaluated securely. Stack setups, calculated savings, and 
                  recommendations are saved to MongoDB Atlas to support report sharing and CRM linking.
                </p>
              </div>
            </div>

            {/* Right Column: Results Panel or Rules Catalog */}
            <div className="lg:col-span-7 space-y-6">
              {isMounted && activeAudit ? (
                /* ── Live Audit Results ──────────────────────────────────────── */
                <AuditResultsPanel
                  auditResult={activeAudit.auditResult}
                  formData={activeAudit}
                  onReset={handleAuditReset}
                />
              ) : (
                /* ── Idle: Static Optimization Rules Catalog ─────────────────── */
                <div
                  id="rules-catalog"
                  className="scroll-mt-20 rounded-xl border border-border bg-card p-6 space-y-4"
                >
                  <div className="space-y-1">
                    <h3 className="text-body-premium font-medium text-white flex items-center gap-2">
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      Audit Engine Rules
                    </h3>
                    <p className="text-muted-premium">
                      These optimization rules are evaluated against your configured tools and spend
                      profile. Submit the form to run a live analysis.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {OPTIMIZATION_RULES.map((rule) => (
                      <div
                        key={rule.id}
                        className="group rounded-lg border border-border bg-background/20 p-3 hover:border-border/80 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                            {rule.provider} / {rule.category}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-medium border ${
                              rule.impact === 'high'
                                ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30'
                                : rule.impact === 'medium'
                                ? 'bg-amber-950/20 text-amber-400 border-amber-900/30'
                                : 'bg-secondary text-muted-foreground border-border/30'
                            }`}
                          >
                            {rule.impact} impact
                          </span>
                        </div>
                        <h4 className="mt-2 text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">
                          {rule.title}
                        </h4>
                        <p className="mt-1 text-[10px] text-muted-foreground leading-normal">
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

      {/* Final CTA */}
      <CTA />
    </PageContainer>
  );
}
