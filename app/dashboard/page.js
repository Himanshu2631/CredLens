'use client';

import React from 'react';
import { 
  TrendingDown, 
  Activity, 
  DollarSign, 
  Users, 
  Zap, 
  Clock 
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import SectionWrapper from '@/components/layout/SectionWrapper';
import Container from '@/components/layout/Container';
import ContentWrapper from '@/components/layout/ContentWrapper';
import Badge from '@/components/ui/Badge';

// Modular Dashboard Subcomponents
import MetricCard from '@/components/dashboard/MetricCard';
import TelemetryChart from '@/components/dashboard/TelemetryChart';
import RedundancyAlerts from '@/components/dashboard/RedundancyAlerts';
import InsightFeed from '@/components/dashboard/InsightFeed';

export default function DashboardPage() {
  const lastUpdated = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });

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
                <Badge variant="success" dot={true} className="border-emerald-500/20 bg-emerald-950/10 text-emerald-400 font-mono text-[9px] uppercase tracking-wider py-0.5 px-2">
                  Telemetry Active
                </Badge>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Cost Optimization Dashboard
              </h1>
              <p className="text-zinc-400 text-xs font-normal">
                Analyze AI subscription utilization directories, active burn-rates, and track optimization performance metrics.
              </p>
            </div>
            
            {/* Status indicators */}
            <div className="flex items-center gap-3 self-start md:self-center bg-zinc-900/30 border border-zinc-800/60 rounded-lg px-3 py-1.5 shrink-0">
              <Clock className="h-3.5 w-3.5 text-zinc-500" />
              <span className="text-[10px] font-mono text-zinc-400">
                Last Updated: <span className="text-zinc-200">{lastUpdated}</span>
              </span>
            </div>
          </div>

          {/* Metric Cards Grid - 4 KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Cost Efficiency Score"
              value="84.2%"
              trend="+4.2%"
              trendType="positive"
              description="Calculated based on license utilization and prompt caching settings."
              icon={TrendingDown}
            />
            <MetricCard
              title="Estimated Monthly Savings"
              value="$1,440"
              trend="-12.5%"
              trendType="positive"
              description="Active run-rate overhead reductions across all audited AI accounts."
              icon={DollarSign}
            />
            <MetricCard
              title="Annual Runway Recovery"
              value="$17,280"
              trend="+14.4%"
              trendType="positive"
              description="Cumulative runway extension based on active deactivations."
              icon={Zap}
            />
            <MetricCard
              title="Workspace Seat Efficiency"
              value="91.5%"
              trend="+1.8%"
              trendType="positive"
              description="Roster ratio of active workspace tokens to registered seat pools."
              icon={Users}
            />
          </div>

          {/* Dashboard Layout Content */}
          <ContentWrapper cols={12} className="gap-6">
            {/* Left side: Telemetry Distribution and Redundancy Alerts */}
            <div className="col-span-12 lg:col-span-7 space-y-6">
              <TelemetryChart />
              <RedundancyAlerts />
            </div>

            {/* Right side: Insights & Activity Logs */}
            <div className="col-span-12 lg:col-span-5">
              <InsightFeed />
            </div>
          </ContentWrapper>

        </Container>
      </SectionWrapper>
    </PageContainer>
  );
}
