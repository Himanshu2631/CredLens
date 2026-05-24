import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Audit from '@/models/Audit';
import { deriveDashboardMetrics } from '@/lib/dashboard/metrics';

/**
 * GET /api/dashboard
 *
 * Returns a fully derived dashboard payload from the latest saved audit.
 * Returns { empty: true } if no audits exist in the database yet.
 */
export async function GET() {
  try {
    await dbConnect();

    // Fetch the most recently created audit — lean() returns a plain JS object
    // which is what deriveDashboardMetrics expects (no Mongoose methods needed).
    const audit = await Audit.findOne({})
      .sort({ createdAt: -1 })
      .select(
        'tools toolPlans seats inactiveSeats monthlySpend summary recommendations projectName createdAt'
      )
      .lean();

    if (!audit) {
      return NextResponse.json({ empty: true }, { status: 200 });
    }

    const payload = deriveDashboardMetrics(audit);

    return NextResponse.json({ empty: false, ...payload }, { status: 200 });
  } catch (err) {
    console.error('[API /dashboard] Error fetching dashboard data:', err);
    return NextResponse.json(
      { error: 'Failed to load dashboard data.' },
      { status: 500 }
    );
  }
}
