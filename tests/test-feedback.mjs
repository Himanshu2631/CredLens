import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

console.log('--- START FEEDBACK DATABASE & API TEST SUITE ---');

// Load environment variables from .env.local
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envFileContent = fs.readFileSync(envPath, 'utf8');
    envFileContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const parts = trimmed.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join('=').trim();
          process.env[key] = value;
        }
      }
    });
    console.log('✓ Success: Loaded .env.local');
  } else {
    console.log('⚠ Warning: .env.local not found. Using system environment variables.');
  }
} catch (e) {
  console.error('✗ Failure loading environment variables:', e);
}

// Dynamically import dependencies
const { default: dbConnect } = await import('../lib/db.js');
const { default: Feedback } = await import('../models/Feedback.js');
const { POST: createFeedbackApi } = await import('../app/api/feedback/route.js');

async function runTests() {
  let db;
  try {
    db = await dbConnect();
    console.log('✓ Success: Connected to MongoDB.');
  } catch (err) {
    console.error('✗ Failure: Failed to connect to MongoDB.', err);
    setTimeout(() => process.exit(1), 100);
    return;
  }

  const TEST_NAME = `Feedback Test User`;
  let testFeedbackId = null;
  let apiTestFeedbackId = null;

  try {
    console.log('\n--- 1. Validation Constraints Tests ---');

    // 1.1 Empty Name
    try {
      const invalid = new Feedback({
        name: '',
        email: 'test@example.com',
        message: 'Valid message'
      });
      await invalid.validate();
      console.error('✗ Failure: Empty name should have failed validation.');
      setTimeout(() => process.exit(1), 100);
      return;
    } catch (e) {
      console.log('✓ Success: Empty name correctly blocked.');
    }

    // 1.2 Invalid email format
    try {
      const invalid = new Feedback({
        name: TEST_NAME,
        email: 'invalid-email-format',
        message: 'Valid message'
      });
      await invalid.validate();
      console.error('✗ Failure: Invalid email should have failed validation.');
      setTimeout(() => process.exit(1), 100);
      return;
    } catch (e) {
      console.log('✓ Success: Invalid email format correctly blocked.');
    }

    // 1.3 Empty Message
    try {
      const invalid = new Feedback({
        name: TEST_NAME,
        email: 'test@example.com',
        message: ''
      });
      await invalid.validate();
      console.error('✗ Failure: Empty message should have failed validation.');
      setTimeout(() => process.exit(1), 100);
      return;
    } catch (e) {
      console.log('✓ Success: Empty message correctly blocked.');
    }

    console.log('\n--- 2. Storage and Retrieval Tests ---');

    // 2.1 Save valid feedback
    const validFeedback = new Feedback({
      name: TEST_NAME,
      email: 'FEEDBACK.USER@example.com', // Test lowercasing trigger
      message: 'This is a test feedback message about CredLens.',
    });

    const saved = await validFeedback.save();
    testFeedbackId = saved._id;
    console.log('✓ Success: Persisted valid Feedback document to MongoDB.');

    // 2.2 Retrieve and assert parameters
    const queried = await Feedback.findById(testFeedbackId);
    if (
      queried &&
      queried.name === TEST_NAME &&
      queried.email === 'feedback.user@example.com' &&
      queried.message === 'This is a test feedback message about CredLens.'
    ) {
      console.log('✓ Success: Queried Feedback and verified stored properties matched (including lowercasing).');
    } else {
      console.error('✗ Failure: Retrieved Feedback values mismatch.', queried);
      setTimeout(() => process.exit(1), 100);
      return;
    }

    console.log('\n--- 3. API Endpoint Integration Tests ---');
    const apiPayload = {
      name: 'API Tester',
      email: 'api.tester@example.com',
      message: 'Great job on the cost audit features!'
    };

    const req = new Request('http://localhost/api/feedback', {
      method: 'POST',
      body: JSON.stringify(apiPayload),
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await createFeedbackApi(req);
    if (res.status === 201) {
      const data = await res.json();
      apiTestFeedbackId = data.feedback?._id;
      console.log(`✓ Success: API returned 201 Created. Feedback ID: ${apiTestFeedbackId}`);
      if (data.feedback?.name === 'API Tester' && data.feedback?.email === 'api.tester@example.com') {
        console.log('✓ Success: API response contains correct feedback object.');
      } else {
        console.error('✗ Failure: API response properties mismatch:', data);
        setTimeout(() => process.exit(1), 100);
        return;
      }
    } else {
      console.error(`✗ Failure: API POST /api/feedback returned status ${res.status}`);
      console.error(await res.text());
      setTimeout(() => process.exit(1), 100);
      return;
    }

  } finally {
    console.log('\n--- 4. Test Data Cleanup ---');
    if (testFeedbackId) {
      await Feedback.deleteOne({ _id: testFeedbackId });
      console.log('✓ Success: Deleted test Feedback document.');
    }
    if (apiTestFeedbackId) {
      await Feedback.deleteOne({ _id: apiTestFeedbackId });
      console.log('✓ Success: Deleted API test Feedback document.');
    }

    await mongoose.disconnect();
    console.log('[Database] Mongoose connection closed.');
  }

  console.log('\n--- ALL FEEDBACK DATABASE & API TESTS PASSED ---');
  setTimeout(() => process.exit(0), 500);
}

runTests().catch(err => {
  console.error('✗ Unhandled crash:', err);
  setTimeout(() => process.exit(1), 500);
});
