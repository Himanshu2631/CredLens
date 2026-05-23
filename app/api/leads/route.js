import { NextResponse } from 'next/server.js';
import mongoose from 'mongoose';
import dbConnect from '../../../lib/db.js';
import Lead from '../../../models/Lead.js';
import Audit from '../../../models/Audit.js';

export async function POST(request) {
  try {
    // 1. Establish database connection
    try {
      await dbConnect();
    } catch (dbErr) {
      console.error('[API Leads] Database connection failure:', dbErr);
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
      companyName,
      contactName,
      email,
      phone,
      activeSpend,
      auditId,
      teamSize,
      metadata
    } = body;

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

    if (!contactName || typeof contactName !== 'string' || !contactName.trim()) {
      return NextResponse.json(
        { error: 'Contact name is required.' },
        { status: 400 }
      );
    }
    if (contactName.length > 100) {
      return NextResponse.json(
        { error: 'Contact name cannot exceed 100 characters.' },
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

    if (phone !== undefined && phone !== null && typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'Phone must be a valid string.' },
        { status: 400 }
      );
    }
    if (phone && phone.length > 20) {
      return NextResponse.json(
        { error: 'Phone number cannot exceed 20 characters.' },
        { status: 400 }
      );
    }

    if (activeSpend !== undefined && activeSpend !== null) {
      if (typeof activeSpend !== 'number' || activeSpend < 0) {
        return NextResponse.json(
          { error: 'Active spend must be a non-negative number.' },
          { status: 400 }
        );
      }
    }

    if (teamSize !== undefined && teamSize !== null) {
      if (typeof teamSize !== 'number' || teamSize < 1) {
        return NextResponse.json(
          { error: 'Team size must be a number greater than or equal to 1.' },
          { status: 400 }
        );
      }
    }

    // 4. Validate Audit ID if provided
    let verifiedAuditId = null;
    if (auditId) {
      if (!mongoose.Types.ObjectId.isValid(auditId)) {
        return NextResponse.json(
          { error: 'Invalid associated audit ID format.' },
          { status: 400 }
        );
      }
      
      const auditExists = await Audit.exists({ _id: auditId });
      if (!auditExists) {
        return NextResponse.json(
          { error: 'The associated audit record was not found.' },
          { status: 404 }
        );
      }
      verifiedAuditId = auditId;
    }

    // 5. Save the lead
    const newLead = new Lead({
      companyName,
      contactName,
      email,
      phone: phone || '',
      activeSpend: activeSpend || 0,
      auditId: verifiedAuditId,
      teamSize: teamSize !== undefined ? teamSize : null,
      auditHistory: verifiedAuditId ? [verifiedAuditId] : [],
      metadata: metadata || {}
    });

    await newLead.save();

    // 6. Return response
    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.error('[API Leads] Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error storing lead information.' },
      { status: 500 }
    );
  }
}

/**
 * GET handler to retrieve leads.
 * If ?email=email@example.com query parameter is provided, returns that single lead.
 * Otherwise, returns all leads sorted descending by creation date.
 * Populates linked Audit relationships (auditId and auditHistory) for both paths.
 * 
 * @param {Request} request 
 * @returns {NextResponse}
 */
export async function GET(request) {
  try {
    // 1. Establish database connection
    try {
      await dbConnect();
    } catch (dbErr) {
      console.error('[API Leads GET] Database connection failure:', dbErr);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
    }

    // 2. Parse search query parameters
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    // 3. Conditional search or listing
    if (email) {
      const lead = await Lead.findOne({ email: email.toLowerCase().trim() })
        .populate('auditId')
        .populate('auditHistory');
      
      if (!lead) {
        return NextResponse.json(
          { error: 'Lead not found.' },
          { status: 404 }
        );
      }
      return NextResponse.json(lead, { status: 200 });
    }

    // Retrieve all leads for admin dashboard / CRM sync
    const leads = await Lead.find({})
      .populate('auditId')
      .populate('auditHistory')
      .sort({ createdAt: -1 });

    return NextResponse.json(leads, { status: 200 });
  } catch (error) {
    console.error('[API Leads GET] Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error retrieving lead information.' },
      { status: 500 }
    );
  }
}
