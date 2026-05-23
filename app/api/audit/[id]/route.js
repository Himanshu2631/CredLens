import { NextResponse } from 'next/server.js';
import mongoose from 'mongoose';
import dbConnect from '../../../../lib/db.js';
import Audit from '../../../../models/Audit.js';

/**
 * GET handler to retrieve a specific audit report.
 * Supports retrieval via MongoDB ObjectId or by sparse unique shareToken.
 * Enforces isPublic restriction when accessed via shareToken.
 * 
 * @param {Request} request 
 * @param {Object} context 
 * @returns {NextResponse}
 */
export async function GET(request, { params }) {
  try {
    // 1. Establish database connection
    try {
      await dbConnect();
    } catch (dbErr) {
      console.error('[API Audit GET] Database connection failure:', dbErr);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
    }

    // 2. Resolve dynamic route params (context.params is a Promise in Next.js 15+)
    const { id } = await params;

    if (!id || typeof id !== 'string' || !id.trim()) {
      return NextResponse.json(
        { error: 'Missing or invalid audit report identifier.' },
        { status: 400 }
      );
    }

    // 3. Query document by MongoDB ObjectId or public shareToken
    let audit = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      audit = await Audit.findById(id);
    } else {
      audit = await Audit.findOne({ shareToken: id });
      
      // If found by shareToken, enforce isPublic sharing configuration
      if (audit && !audit.isPublic) {
        return NextResponse.json(
          { error: 'This audit report is private.' },
          { status: 403 }
        );
      }
    }

    // 4. Handle document not found
    if (!audit) {
      return NextResponse.json(
        { error: 'Audit report not found.' },
        { status: 404 }
      );
    }

    // 5. Return success response
    return NextResponse.json(audit, { status: 200 });
  } catch (error) {
    console.error('[API Audit GET] Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error retrieving audit report.' },
      { status: 500 }
    );
  }
}
