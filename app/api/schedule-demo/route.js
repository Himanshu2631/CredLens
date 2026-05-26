import { NextResponse } from 'next/server.js';
import dbConnect from '../../../lib/db.js';
import DemoRequest from '../../../models/DemoRequest.js';
import { sendDemoConfirmationEmail } from '../../../lib/email/emailService.js';

export async function POST(request) {
  try {
    // 1. Establish database connection
    try {
      await dbConnect();
    } catch (dbErr) {
      console.error('[API Demo Request] Database connection failure:', dbErr);
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

    const { contactName, email, companyName, useCase, teamSize, monthlySpend, providers } = body;

    // 3. Validation
    if (!contactName || typeof contactName !== 'string' || !contactName.trim()) {
      return NextResponse.json(
        { error: 'Full name is required.' },
        { status: 400 }
      );
    }
    if (contactName.length > 100) {
      return NextResponse.json(
        { error: 'Name cannot exceed 100 characters.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Business email is required.' },
        { status: 400 }
      );
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid business email address.' },
        { status: 400 }
      );
    }

    if (!companyName || typeof companyName !== 'string' || !companyName.trim()) {
      return NextResponse.json(
        { error: 'Company or team name is required.' },
        { status: 400 }
      );
    }
    if (companyName.length > 100) {
      return NextResponse.json(
        { error: 'Company name cannot exceed 100 characters.' },
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

    let parsedMonthlySpend = null;
    if (monthlySpend !== undefined && monthlySpend !== null && monthlySpend !== '') {
      parsedMonthlySpend = Number(monthlySpend);
      if (isNaN(parsedMonthlySpend) || parsedMonthlySpend < 0) {
        return NextResponse.json(
          { error: 'Estimated monthly spend must be a non-negative number.' },
          { status: 400 }
        );
      }
    }

    // 4. Create and Save DemoRequest
    const newDemoRequest = new DemoRequest({
      contactName: contactName.trim(),
      email: email.trim().toLowerCase(),
      companyName: companyName.trim(),
      useCase: (useCase || '').trim(),
      teamSize: parsedTeamSize,
      monthlySpend: parsedMonthlySpend,
      providers: Array.isArray(providers) ? providers : [],
    });

    await newDemoRequest.save();

    console.log(`[API Demo Request] New demo request received from ${contactName} at ${companyName} (${email})`);

    // 4.5 Send Demo scheduling confirmation email via Resend
    let emailSent = false;
    let emailError = null;
    try {
      const emailResult = await sendDemoConfirmationEmail({
        to: email.trim(),
        contactName: contactName.trim(),
        companyName: companyName.trim(),
        useCase: useCase
      });
      emailSent = emailResult.success;
      emailError = emailResult.error || null;
    } catch (emailErr) {
      console.error('[API Demo Request] Failed to execute email dispatch flow:', emailErr);
      emailError = emailErr.message || 'Unknown email dispatch error.';
    }

    // 5. Return success response
    return NextResponse.json(
      { success: true, request: newDemoRequest, emailSent, emailError },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API Demo Request] Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error storing demo request.' },
      { status: 500 }
    );
  }
}
