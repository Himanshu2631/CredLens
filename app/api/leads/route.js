import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';
import Audit from '@/models/Audit';

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
      auditId
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
      auditId: verifiedAuditId
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
