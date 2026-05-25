import React from 'react';
import DashboardClient from '@/components/dashboard/DashboardClient';

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

export default async function DashboardPage() {
  const data = await getDashboardData();

  return <DashboardClient data={data} />;
}
