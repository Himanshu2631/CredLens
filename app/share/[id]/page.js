'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import Container from '@/components/layout/Container';
import SectionWrapper from '@/components/layout/SectionWrapper';
import AuditResultsPanel from '@/components/results/AuditResultsPanel';
import AuditOverviewSkeleton from '@/components/results/AuditOverviewSkeleton';
import { getSpendAudit } from '@/lib/api';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ShareReportPage() {
  const params = useParams();
  const id = params?.id;

  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    let active = true;
    async function loadAudit() {
      try {
        setLoading(true);
        setError(null);
        const data = await getSpendAudit(id);
        if (active) {
          setAudit(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to retrieve the shared audit report.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAudit();

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <PageContainer>
      <SectionWrapper className="pt-8 pb-16">
        <Container className="max-w-4xl mx-auto space-y-6">
          {/* Header Back Button */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Audit tool
            </Link>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded">
              Shared Diagnostic Report
            </span>
          </div>

          {loading ? (
            <AuditOverviewSkeleton />
          ) : error ? (
            <div className="rounded-xl border border-red-950/20 bg-red-950/5 p-8 text-center space-y-4">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-red-900/40 bg-red-950/20">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="text-sm font-semibold text-zinc-200">
                  Failed to Load Report
                </h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {error}
                </p>
              </div>
              <div>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-xs font-mono uppercase tracking-wider text-zinc-200 border border-border hover:bg-zinc-800 transition-colors"
                >
                  Create new audit
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 text-[11px] text-zinc-400 flex items-center justify-between">
                <span>
                  You are viewing a shared snapshot of the <strong>{audit.projectName || 'AI'}</strong> spend audit.
                </span>
                <span className="font-mono text-[9px] uppercase bg-zinc-900 px-1.5 py-0.5 rounded border border-border text-zinc-400">
                  Read Only
                </span>
              </div>
              <AuditResultsPanel
                auditResult={{
                  summary: {
                    totalCurrentSpend: audit.summary?.totalCurrentSpend || audit.monthlySpend,
                    totalEstimatedSavings: audit.summary?.totalEstimatedSavings || 0,
                    totalOptimizedSpend: audit.summary?.totalOptimizedSpend || audit.monthlySpend,
                    formattedCurrentSpend: audit.summary?.formattedCurrentSpend || `$${audit.monthlySpend.toLocaleString()}/mo`,
                    formattedOptimizedSpend: audit.summary?.formattedOptimizedSpend || `$${audit.monthlySpend.toLocaleString()}/mo`,
                    formattedEstimatedSavings: audit.summary?.formattedEstimatedSavings || '$0/mo',
                    formattedEstimatedYearlySavings: audit.summary?.formattedEstimatedYearlySavings || '$0/yr',
                    runwayRestoredPercent: audit.summary?.runwayRestoredPercent || 0,
                    subscriptionCost: audit.summary?.subscriptionCost || 0,
                    apiSpend: audit.summary?.apiSpend || 0,
                  },
                  recommendations: audit.recommendations || [],
                  aiSummary: audit.aiSummary,
                }}
                formData={{
                  tools: audit.tools,
                  toolPlans: audit.toolPlans,
                  seats: audit.seats,
                  submittedAt: audit.createdAt,
                }}
                onReset={null} // Hides the re-run button for shared views
              />
            </div>
          )}
        </Container>
      </SectionWrapper>
    </PageContainer>
  );
}
