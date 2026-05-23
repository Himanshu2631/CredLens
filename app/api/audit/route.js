import { NextResponse } from 'next/server.js';
import dbConnect from '../../../lib/db.js';
import Audit from '../../../models/Audit.js';
import { runSpendAudit } from '../../../lib/audit/rulesEngine.js';
import { generateAuditSummary } from '../../../lib/ai/aiService.js';

export async function POST(request) {
  try {
    // 1. Establish database connection
    try {
      await dbConnect();
    } catch (dbErr) {
      console.error('[API Audit] Database connection failure:', dbErr);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
    }

    // 2. Parse payload
    let body;
    try {
      body = await request.json();
    } catch (parseErr) {
      return NextResponse.json(
        { error: 'Invalid JSON request payload.' },
        { status: 400 }
      );
    }

    const {
      projectName,
      tools,
      toolPlans,
      seats,
      inactiveSeats,
      monthlySpend,
      useCase,
      optimizationGoal,
      isPublic,
      ownerId,
      metadata
    } = body;

    // 3. Validation
    if (!projectName || typeof projectName !== 'string' || !projectName.trim()) {
      return NextResponse.json(
        { error: 'Project name is required and must be a valid string.' },
        { status: 400 }
      );
    }
    if (projectName.length > 100) {
      return NextResponse.json(
        { error: 'Project name cannot exceed 100 characters.' },
        { status: 400 }
      );
    }

    if (seats === undefined || seats === null || typeof seats !== 'number' || seats < 1) {
      return NextResponse.json(
        { error: 'Seats is required and must be a number greater than or equal to 1.' },
        { status: 400 }
      );
    }

    if (monthlySpend === undefined || monthlySpend === null || typeof monthlySpend !== 'number' || monthlySpend < 0) {
      return NextResponse.json(
        { error: 'Monthly spend is required and must be a non-negative number.' },
        { status: 400 }
      );
    }

    if (!useCase || typeof useCase !== 'string') {
      return NextResponse.json(
        { error: 'Use case is required.' },
        { status: 400 }
      );
    }

    if (!optimizationGoal || typeof optimizationGoal !== 'string') {
      return NextResponse.json(
        { error: 'Optimization goal is required.' },
        { status: 400 }
      );
    }

    if (isPublic !== undefined && isPublic !== null && typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { error: 'isPublic must be a boolean.' },
        { status: 400 }
      );
    }

    if (ownerId !== undefined && ownerId !== null && typeof ownerId !== 'string') {
      return NextResponse.json(
        { error: 'ownerId must be a string.' },
        { status: 400 }
      );
    }

    // 4. Run rules engine calculations
    const auditResult = runSpendAudit({
      projectName,
      tools: tools || [],
      toolPlans: toolPlans || {},
      seats,
      inactiveSeats: inactiveSeats || 0,
      monthlySpend,
      useCase,
      optimizationGoal
    });

    // 4.5. Run AI summary generator (provider-agnostic, falls back to Mock builder on any error)
    const aiSummary = await generateAuditSummary({
      projectName,
      seats,
      monthlySpend,
      useCase,
      optimizationGoal,
      summary: auditResult.summary,
      recommendations: auditResult.recommendations
    });

    // 5. Create and save Mongoose document
    const newAudit = new Audit({
      projectName,
      tools: tools || [],
      toolPlans: toolPlans || {},
      seats,
      inactiveSeats: inactiveSeats || 0,
      monthlySpend,
      useCase,
      optimizationGoal,
      summary: auditResult.summary,
      recommendations: auditResult.recommendations,
      recommendationExplanations: auditResult.recommendationExplanations,
      aiSummary,
      isPublic: isPublic !== undefined ? isPublic : false,
      ownerId: ownerId || null,
      metadata: metadata || {}
    });

    await newAudit.save();

    // 6. Return response
    return NextResponse.json(newAudit, { status: 201 });
  } catch (error) {
    console.error('[API Audit] Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error evaluating or storing audit.' },
      { status: 500 }
    );
  }
}
