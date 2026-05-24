import { NextResponse } from 'next/server.js';
import dbConnect from '../../../lib/db.js';
import BetaRequest from '../../../models/BetaRequest.js';
import { sendBetaConfirmationEmail } from '../../../lib/email/emailService.js';

export async function POST(request) {
  try {
    // 1. Establish database connection
    try {
      await dbConnect();
    } catch (dbErr) {
      console.error('[API Beta Request] Database connection failure:', dbErr);
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

    const { companyName, email, teamSize, featureKey } = body;

    // 3. Validation
    if (!companyName || typeof companyName !== 'string' || !companyName.trim()) {
      return NextResponse.json(
        { error: 'Company name is required.' },
        { status: 400 }
      );
    }
    if (companyName.length > 100) {
      return NextResponse.json(
        { error: 'Company name cannot exceed 100 characters.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Email address is required.' },
        { status: 400 }
      );
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    let parsedTeamSize = null;
    if (teamSize !== undefined && teamSize !== null && teamSize !== '') {
      parsedTeamSize = Number(teamSize);
      if (isNaN(parsedTeamSize) || parsedTeamSize < 1) {
        return NextResponse.json(
          { error: 'Team size must be a number greater than or equal to 1.' },
          { status: 400 }
        );
      }
    }

    // 4. Create and Save BetaRequest
    const newRequest = new BetaRequest({
      companyName: companyName.trim(),
      email: email.trim().toLowerCase(),
      teamSize: parsedTeamSize,
      featureKey: featureKey || 'subscription_hub',
    });

    await newRequest.save();

    console.log(`[API Beta Request] New beta registration received for ${companyName} (${email})`);

    // 4.5 Send early access confirmation email via Resend (fault-tolerant)
    let emailSent = false;
    let emailError = null;
    try {
      const emailResult = await sendBetaConfirmationEmail({
        to: email.trim(),
        companyName: companyName.trim(),
        teamSize: parsedTeamSize
      });
      emailSent = emailResult.success;
      emailError = emailResult.error || null;
    } catch (emailErr) {
      console.error('[API Beta Request] Failed to execute email dispatch flow:', emailErr);
      emailError = emailErr.message || 'Unknown email dispatch error.';
    }

    // 5. Return success response with email sent confirmation
    return NextResponse.json(
      { success: true, request: newRequest, emailSent, emailError },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API Beta Request] Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error storing beta request.' },
      { status: 500 }
    );
  }
}
