import React from 'react';
import dbConnect from '@/lib/db';
import Audit from '@/models/Audit';
import { deriveDashboardMetrics } from '@/lib/dashboard/metrics';
import DashboardClient from '@/components/dashboard/DashboardClient';

export const dynamic = 'force-dynamic';

/**
 * Fetch the derived dashboard payload directly server-side from MongoDB.
 * Direct database access avoids loopback HTTP fetch issues, port mismatches,
 * and eliminates network overhead.
 */
async function getDashboardData() {
  try {
    await dbConnect();

    const audit = await Audit.findOne({})
      .sort({ createdAt: -1 })
      .select(
        'tools toolPlans seats inactiveSeats monthlySpend summary recommendations projectName createdAt aiSummary'
      )
      .lean();

    if (!audit) {
      return { empty: true };
    }

    const payload = deriveDashboardMetrics(audit);
    // Ensure all props are JSON-serializable plain objects across the RSC boundary
    return JSON.parse(JSON.stringify({ empty: false, ...payload }));
  } catch (err) {
    console.error('[Dashboard] Error retrieving dashboard data:', err);
    return { empty: true, error: true };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return <DashboardClient data={data} />;
}

