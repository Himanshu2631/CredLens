import React from 'react';
import { TrendingDown, DollarSign, Users, Zap, Clock } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import SectionWrapper from '@/components/layout/SectionWrapper';
import Container from '@/components/layout/Container';
import ContentWrapper from '@/components/layout/ContentWrapper';
import Badge from '@/components/ui/Badge';

// Dashboard sub-components
import MetricCard from '@/components/dashboard/MetricCard';
import TelemetryChart from '@/components/dashboard/TelemetryChart';
import RedundancyAlerts from '@/components/dashboard/RedundancyAlerts';
import InsightFeed from '@/components/dashboard/InsightFeed';
import DashboardEmptyState from '@/components/dashboard/DashboardEmptyState';

/**
 * Fetch the derived dashboard payload from the API route.
 * Runs server-side — no MongoDB credentials or driver code in the page.
 * cache: 'no-store' ensures every page load gets fresh data from the DB.
 */
async function getDashboardData() {
  try {
    // In Next.js App Router, relative fetch URLs require the full origin.
    // VERCEL_URL covers production; localhost covers dev.
    const base =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

    const res = await fetch(`${base}/api/dashboard`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('[Dashboard] API responded with status', res.status);
      return null;
    }

    return res.json();
  } catch (err) {
    console.error('[Dashboard] Failed to fetch dashboard data:', err);
    return null;
  }
}

/**
 * Format a Date (or ISO string) for the "Last Updated" badge.
 */
function formatLastUpdated(createdAt) {
  if (!createdAt) return 'No audit saved yet';
  return new Date(createdAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  // Determine render mode
  const isEmpty = !data || data.empty === true || data.error;

  // Destructure derived data (safe defaults if somehow missing)
  const {
    metricCards = {},
    providers = [],
    totalSpend = '—',
    alerts = [],
    riskMatrix = [],
    events = [],
    auditMeta = {},
  } = isEmpty ? {} : data;

  const lastUpdated = isEmpty
    ? 'No audit yet'
    : formatLastUpdated(auditMeta.createdAt);

  return (
    <PageContainer className="relative overflow-hidden bg-zinc-950">
      {/* Background Grid Accent */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#09090b_1px,transparent_1px),linear-gradient(to_bottom,#09090b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      <SectionWrapper className="pt-10 pb-20 relative z-10">
        <Container className="max-w-5xl mx-auto space-y-8">

          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge
                  variant={isEmpty ? 'secondary' : 'success'}
                  dot={!isEmpty}
                  className={
                    isEmpty
                      ? 'border-zinc-700/40 bg-zinc-900/20 text-zinc-500 font-mono text-[9px] uppercase tracking-wider py-0.5 px-2'
                      : 'border-emerald-500/20 bg-emerald-950/10 text-emerald-400 font-mono text-[9px] uppercase tracking-wider py-0.5 px-2'
                  }
                >
                  {isEmpty ? 'Awaiting First Audit' : 'Live Data'}
                </Badge>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Cost Optimization Dashboard
              </h1>
              <p className="text-zinc-400 text-xs font-normal">
                {isEmpty
                  ? 'Save your first audit report to activate real-time spend intelligence.'
                  : `Showing data from audit on ${lastUpdated}${auditMeta.projectName ? ` — ${auditMeta.projectName}` : ''}.`}
              </p>
            </div>

            {/* Last Updated indicator */}
            <div className="flex items-center gap-3 self-start md:self-center bg-zinc-900/30 border border-zinc-800/60 rounded-lg px-3 py-1.5 shrink-0">
              <Clock className="h-3.5 w-3.5 text-zinc-500" />
              <span className="text-[10px] font-mono text-zinc-400">
                Last Audit: <span className="text-zinc-200">{lastUpdated}</span>
              </span>
            </div>
          </div>

          {/* Empty State — no audits in DB */}
          {isEmpty ? (
            <DashboardEmptyState />
          ) : (
            <>
              {/* Metric Cards Grid — 4 live KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Cost Efficiency Score"
                  value={metricCards.efficiencyScore ?? '—'}
                  trend={metricCards.raw?.efficiencyScore > 0 ? `${metricCards.raw.efficiencyScore.toFixed(1)}% optimized` : undefined}
                  trendType="positive"
                  description="Percentage of current spend that can be eliminated based on audit recommendations."
                  icon={TrendingDown}
                />
                <MetricCard
                  title="Estimated Monthly Savings"
                  value={metricCards.monthlySavings ?? '—'}
                  trendType="positive"
                  description="Total potential run-rate savings identified across all audited AI accounts."
                  icon={DollarSign}
                />
                <MetricCard
                  title="Annual Runway Recovery"
                  value={metricCards.annualRunway ?? '—'}
                  trendType="positive"
                  description="Cumulative runway extension if all audit recommendations are applied."
                  icon={Zap}
                />
                <MetricCard
                  title="Workspace Seat Efficiency"
                  value={metricCards.seatEfficiency ?? '—'}
                  trendType={metricCards.raw?.seatEfficiency < 90 ? 'negative' : 'positive'}
                  description="Ratio of active to registered seats across your audited tool stack."
                  icon={Users}
                />
              </div>

              {/* Dashboard Layout Content */}
              <ContentWrapper cols={12} className="gap-6">
                {/* Left: Telemetry Distribution + Redundancy Alerts */}
                <div className="col-span-12 lg:col-span-7 space-y-6">
                  <TelemetryChart providers={providers} totalSpend={totalSpend} />
                  <RedundancyAlerts alerts={alerts} riskMatrix={riskMatrix} />
                </div>

                {/* Right: Insights & Activity */}
                <div className="col-span-12 lg:col-span-5">
                  <InsightFeed events={events} />
                </div>
              </ContentWrapper>
            </>
          )}

        </Container>
      </SectionWrapper>
    </PageContainer>
  );
}
