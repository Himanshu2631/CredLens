import { NextResponse } from 'next/server.js';
import dbConnect from '../../../lib/db.js';
import Feedback from '../../../models/Feedback.js';

export async function POST(request) {
  try {
    // 1. Establish database connection
    try {
      await dbConnect();
    } catch (dbErr) {
      console.error('[API Feedback] Database connection failure:', dbErr);
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

    const { name, email, message } = body;

    // 3. Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required.' },
        { status: 400 }
      );
    }
    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Name cannot exceed 100 characters.' },
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

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required.' },
        { status: 400 }
      );
    }
    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message cannot exceed 2000 characters.' },
        { status: 400 }
      );
    }

    // 4. Create and Save Feedback document
    const newFeedback = new Feedback({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });

    await newFeedback.save();

    console.log(`[API Feedback] New product feedback received from ${name} (${email})`);

    // 5. Return success response
    return NextResponse.json(
      { success: true, feedback: newFeedback },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API Feedback] Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error storing feedback.' },
      { status: 500 }
    );
  }
}
