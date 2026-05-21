'use client';

import React, { useState } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import SectionWrapper from '@/components/layout/SectionWrapper';
import ContentWrapper from '@/components/layout/ContentWrapper';
import Container from '@/components/layout/Container';
import Hero from '@/components/sections/Hero';
import AuditForm from '@/components/forms/AuditForm';
import { OPTIMIZATION_RULES } from '@/data/rules';
import { AlertCircle, Terminal, HelpCircle, Code, Database } from 'lucide-react';

export default function Home() {
  const [activeAudit, setActiveAudit] = useState(null);

  const handleAuditSubmit = (formData) => {
    setActiveAudit(formData);
  };

  return (
    <PageContainer>
      {/* Hero Section */}
      <Hero />

      {/* Main Workspace Section */}
      <SectionWrapper id="audit-workspace" className="pt-12 scroll-mt-20">
        <Container>
          <ContentWrapper cols={12}>
            {/* Left Panel: Audit Configuration Form */}
            <div className="lg:col-span-5 space-y-6">
              <AuditForm onSubmitSuccess={handleAuditSubmit} />

              {/* Platform Constraints Callout */}
              <div className="rounded-xl border border-border bg-card/30 p-4 space-y-2">
                <div className="flex items-center gap-2 text-body-premium font-medium text-zinc-300">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  Scope Architecture Reminder
                </div>
                <p className="text-muted-premium">
                  Database queries, backend routes, and background queue workers are mocked or stubbed. In the next phase, submitting this form will dispatch an API request to trigger the Mongoose ingestion pipelines.
                </p>
              </div>
            </div>

            {/* Right Panel: Architecture Inspector & Mock Run Output */}
            <div className="lg:col-span-7 space-y-6">
              {/* Live State Inspector */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-premium font-mono">Active State Inspector</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {activeAudit ? 'STATUS: INGEST_READY' : 'STATUS: WAITING_FOR_INPUT'}
                  </span>
                </div>

                <div className="p-5 font-mono text-xs text-muted-foreground bg-background/25 min-h-[160px] flex flex-col justify-between">
                  {activeAudit ? (
                    <div className="space-y-4">
                      <p className="text-muted-foreground text-[11px]">
                        {/* Form submitted. Ready to create Mongoose records in Atlas...*/}
                      </p>
                      <pre className="text-emerald-400 bg-background p-3 rounded-lg border border-border overflow-x-auto text-[11px]">
                        {JSON.stringify(
                          {
                            event: 'SUBMIT_AUDIT_REQUEST',
                            timestamp: new Date().toISOString(),
                            payload: {
                              projectName: activeAudit.projectName,
                              monthlyBudget: Number(activeAudit.monthlyBudget),
                              primaryProvider: activeAudit.primaryProvider,
                              fileName: activeAudit.fileName,
                            },
                            dbAction: 'await Audit.create(payload)'
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-8 space-y-2">
                      <Code className="h-5 w-5 text-zinc-700" />
                      <p className="text-muted-foreground text-[11px]">
                        Submit the configuration form on the left to populate the simulated payload inspect state.
                      </p>
                    </div>
                  )}

                  <div className="border-t border-border/60 mt-4 pt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Database className="h-3 w-3" /> Schema: models/Audit.js
                    </span>
                    <span>Collection: audits</span>
                  </div>
                </div>
              </div>

              {/* Static Optimization Rules Catalog */}
              <div id="rules-catalog" className="scroll-mt-20 rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-body-premium font-medium text-white flex items-center gap-2">
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    Audit Engine Rules (Static Config)
                  </h3>
                  <p className="text-muted-premium">
                    These cost saving rules are imported from <code className="text-zinc-350 font-mono text-[10px]">data/rules.js</code> and map logs to recommendations.
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
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${rule.impact === 'high'
                            ? 'bg-red-950/20 text-red-400 border border-red-900/30'
                            : rule.impact === 'medium'
                              ? 'bg-amber-950/20 text-amber-400 border border-amber-900/30'
                              : 'bg-secondary text-muted-foreground border border-border/30'
                          }`}>
                          {rule.impact} saving
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
            </div>
          </ContentWrapper>
        </Container>
      </SectionWrapper>
    </PageContainer>
  );
}
