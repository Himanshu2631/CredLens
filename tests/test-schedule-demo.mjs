import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

console.log('--- START SCHEDULE DEMO DATABASE & API TEST SUITE ---');

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
const { default: DemoRequest } = await import('../models/DemoRequest.js');
const { POST: createDemoRequestApi } = await import('../app/api/schedule-demo/route.js');

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

  const TEST_NAME = `Demo Test Lead`;
  let testDemoId = null;
  let apiTestDemoId = null;

  try {
    console.log('\n--- 1. Validation Constraints Tests ---');

    // 1.1 Empty Name
    try {
      const invalid = new DemoRequest({
        contactName: '',
        email: 'demo@example.com',
        companyName: 'Test Company'
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
      const invalid = new DemoRequest({
        contactName: TEST_NAME,
        email: 'invalid-email-format',
        companyName: 'Test Company'
      });
      await invalid.validate();
      console.error('✗ Failure: Invalid email should have failed validation.');
      setTimeout(() => process.exit(1), 100);
      return;
    } catch (e) {
      console.log('✓ Success: Invalid email format correctly blocked.');
    }

    // 1.3 Empty Company Name
    try {
      const invalid = new DemoRequest({
        contactName: TEST_NAME,
        email: 'demo@example.com',
        companyName: ''
      });
      await invalid.validate();
      console.error('✗ Failure: Empty company name should have failed validation.');
      setTimeout(() => process.exit(1), 100);
      return;
    } catch (e) {
      console.log('✓ Success: Empty company name correctly blocked.');
    }

    // 1.4 Invalid Team Size (Less than 1)
    try {
      const invalid = new DemoRequest({
        contactName: TEST_NAME,
        email: 'demo@example.com',
        companyName: 'Test Company',
        teamSize: 0
      });
      await invalid.validate();
      console.error('✗ Failure: Team size of 0 should have failed validation.');
      setTimeout(() => process.exit(1), 100);
      return;
    } catch (e) {
      console.log('✓ Success: Invalid team size correctly blocked.');
    }

    // 1.5 Negative Monthly Spend
    try {
      const invalid = new DemoRequest({
        contactName: TEST_NAME,
        email: 'demo@example.com',
        companyName: 'Test Company',
        monthlySpend: -100
      });
      await invalid.validate();
      console.error('✗ Failure: Negative monthly spend should have failed validation.');
      setTimeout(() => process.exit(1), 100);
      return;
    } catch (e) {
      console.log('✓ Success: Negative monthly spend correctly blocked.');
    }

    console.log('\n--- 2. Storage and Retrieval Tests ---');

    // 2.1 Save valid demo request
    const validDemo = new DemoRequest({
      contactName: TEST_NAME,
      email: 'DEMO.USER@example.com', // Test lowercasing trigger
      companyName: 'Demo Corp',
      useCase: 'Interested in optimizing OpenAI subscription models.',
      teamSize: 15,
      monthlySpend: 4500,
      providers: ['OpenAI', 'Anthropic']
    });

    const saved = await validDemo.save();
    testDemoId = saved._id;
    console.log('✓ Success: Persisted valid DemoRequest document to MongoDB.');

    // 2.2 Retrieve and assert parameters
    const queried = await DemoRequest.findById(testDemoId);
    if (
      queried &&
      queried.contactName === TEST_NAME &&
      queried.email === 'demo.user@example.com' &&
      queried.companyName === 'Demo Corp' &&
      queried.useCase === 'Interested in optimizing OpenAI subscription models.' &&
      queried.teamSize === 15 &&
      queried.monthlySpend === 4500 &&
      queried.providers.includes('OpenAI') &&
      queried.providers.includes('Anthropic') &&
      queried.status === 'pending'
    ) {
      console.log('✓ Success: Queried DemoRequest and verified stored properties matched (including lowercasing).');
    } else {
      console.error('✗ Failure: Retrieved DemoRequest values mismatch.', queried);
      setTimeout(() => process.exit(1), 100);
      return;
    }

    console.log('\n--- 3. API Endpoint Integration Tests ---');
    const apiPayload = {
      contactName: 'API Lead Tester',
      email: 'api.demo@example.com',
      companyName: 'API Tech Inc',
      useCase: 'Need billing logs analysis demo.',
      teamSize: 50,
      monthlySpend: 12000,
      providers: ['Google', 'DeepSeek', 'Other']
    };

    const req = new Request('http://localhost/api/schedule-demo', {
      method: 'POST',
      body: JSON.stringify(apiPayload),
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await createDemoRequestApi(req);
    if (res.status === 201) {
      const data = await res.json();
      apiTestDemoId = data.request?._id;
      console.log(`✓ Success: API returned 201 Created. Demo Request ID: ${apiTestDemoId}`);
      if (
        data.request?.contactName === 'API Lead Tester' &&
        data.request?.email === 'api.demo@example.com' &&
        data.request?.companyName === 'API Tech Inc' &&
        data.request?.teamSize === 50 &&
        data.request?.monthlySpend === 12000 &&
        data.request?.providers?.includes('Google')
      ) {
        console.log('✓ Success: API response contains correct demo request object.');
      } else {
        console.error('✗ Failure: API response properties mismatch:', data);
        setTimeout(() => process.exit(1), 100);
        return;
      }
      
      // Log email delivery report from API
      if (data.emailSent) {
        console.log('✓ Success: Email confirmation was marked as sent successfully by the API.');
      } else {
        console.log(`⚠ Notice: Email confirmation was bypassed or failed. Error: ${data.emailError}`);
      }
    } else {
      console.error(`✗ Failure: API POST /api/schedule-demo returned status ${res.status}`);
      console.error(await res.text());
      setTimeout(() => process.exit(1), 100);
      return;
    }

  } finally {
    console.log('\n--- 4. Test Data Cleanup ---');
    if (testDemoId) {
      await DemoRequest.deleteOne({ _id: testDemoId });
      console.log('✓ Success: Deleted test DemoRequest document.');
    }
    if (apiTestDemoId) {
      await DemoRequest.deleteOne({ _id: apiTestDemoId });
      console.log('✓ Success: Deleted API test DemoRequest document.');
    }

    await mongoose.disconnect();
    console.log('[Database] Mongoose connection closed.');
  }

  console.log('\n--- ALL SCHEDULE DEMO DATABASE & API TESTS PASSED ---');
  setTimeout(() => process.exit(0), 500);
}

runTests().catch(err => {
  console.error('✗ Unhandled crash:', err);
  setTimeout(() => process.exit(1), 500);
});
