'use client';

import React from 'react';
import { Activity } from 'lucide-react';
import PlaceholderPage from '@/components/ui/PlaceholderPage';

export default function DashboardPage() {
  const features = [
    'Multi-organization cost rollup charts with instant stack breakdowns.',
    'Daily API usage trackers & volumetric token caching efficiency counters.',
    'Runway projections, threshold alerts, and automated budget notifications.'
  ];

  return (
    <PlaceholderPage
      title="Cost Optimization Dashboard"
      description="Monitor real-time cost savings telemetry, audit historical run-rate trends, and project extended runway gains in one consolidated viewport."
      icon={Activity}
      features={features}
    />
  );
}
