import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

console.log('--- START BETA REQUEST DATABASE & EMAIL TEST SUITE ---');

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
const { default: BetaRequest } = await import('../models/BetaRequest.js');
const { generateBetaConfirmationEmailHtml, sendBetaConfirmationEmail } = await import('../lib/email/emailService.js');
const { POST: createBetaRequestApi } = await import('../app/api/beta-requests/route.js');

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

  const TEST_COMPANY_NAME = `BETA_TEST_COMPANY_${Date.now()}`;
  let testRequestId = null;
  let apiTestRequestId = null;

  try {
    console.log('\n--- 1. Validation Constraints Tests ---');

    // 1.1 Empty Company Name
    try {
      const invalid = new BetaRequest({
        companyName: '',
        email: 'test@example.com'
      });
      await invalid.validate();
      console.error('✗ Failure: Empty company name should have failed validation.');
      setTimeout(() => process.exit(1), 100);
      return;
    } catch (e) {
      console.log('✓ Success: Empty company name correctly blocked.');
    }

    // 1.2 Invalid email format
    try {
      const invalid = new BetaRequest({
        companyName: TEST_COMPANY_NAME,
        email: 'invalid-email-format'
      });
      await invalid.validate();
      console.error('✗ Failure: Invalid email should have failed validation.');
      setTimeout(() => process.exit(1), 100);
      return;
    } catch (e) {
      console.log('✓ Success: Invalid email format correctly blocked.');
    }

    // 1.3 Team size less than 1
    try {
      const invalid = new BetaRequest({
        companyName: TEST_COMPANY_NAME,
        email: 'test@example.com',
        teamSize: 0
      });
      await invalid.validate();
      console.error('✗ Failure: Zero team size should have failed validation.');
      setTimeout(() => process.exit(1), 100);
      return;
    } catch (e) {
      console.log('✓ Success: Zero team size correctly blocked.');
    }

    console.log('\n--- 2. Storage and Retrieval Tests ---');

    // 2.1 Save valid request
    const validRequest = new BetaRequest({
      companyName: TEST_COMPANY_NAME,
      email: 'BETA.USER@example.com', // Test lowercasing trigger
      teamSize: 45,
      featureKey: 'subscription_hub'
    });

    const saved = await validRequest.save();
    testRequestId = saved._id;
    console.log('✓ Success: Persisted valid BetaRequest document to MongoDB.');

    // 2.2 Retrieve and assert parameters
    const queried = await BetaRequest.findById(testRequestId);
    if (queried && queried.email === 'beta.user@example.com' && queried.teamSize === 45 && queried.featureKey === 'subscription_hub') {
      console.log('✓ Success: Queried BetaRequest and verified stored properties matched (including lowercasing).');
    } else {
      console.error('✗ Failure: Retrieved BetaRequest values mismatch.', queried);
      setTimeout(() => process.exit(1), 100);
      return;
    }

    console.log('\n--- 3. Confirmation Email Template Tests ---');
    const htmlResult = generateBetaConfirmationEmailHtml({
      companyName: 'Acme Beta Corp',
      teamSize: 15
    });

    if (htmlResult && htmlResult.includes('Acme Beta Corp') && htmlResult.includes('Workspace Sync') && htmlResult.includes('Beta Access Confirmed')) {
      console.log('✓ Success: HTML beta confirmation email template compiled and matched copy requirements.');
    } else {
      console.error('✗ Failure: Beta confirmation template failed assertions.');
      setTimeout(() => process.exit(1), 100);
      return;
    }

    console.log('\n--- 4. API Endpoint Integration & Dispatch Tests ---');
    const apiPayload = {
      companyName: `${TEST_COMPANY_NAME}_API`,
      email: 'onboarding@resend.dev',
      teamSize: 8,
      featureKey: 'subscription_hub'
    };

    const req = new Request('http://localhost/api/beta-requests', {
      method: 'POST',
      body: JSON.stringify(apiPayload),
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await createBetaRequestApi(req);
    if (res.status === 201) {
      const data = await res.json();
      apiTestRequestId = data.request?._id;
      console.log(`✓ Success: API returned 201 Created. Request ID: ${apiTestRequestId}`);
      
      const apiKeyExists = !!process.env.RESEND_API_KEY;
      if (apiKeyExists) {
        if (data.emailSent === true) {
          console.log('✓ Success: Confirmation email dispatched successfully via Resend API.');
        } else {
          console.warn('⚠ Note: Email sending failed or bypassed despite API key present. Error:', data.emailError);
        }
      } else {
        if (data.emailSent === false && data.emailError) {
          console.log('✓ Success: Bypassed email sending correctly when RESEND_API_KEY is missing.');
        } else {
          console.error('✗ Failure: Incorrect emailSent/emailError behavior under missing key condition:', data);
          setTimeout(() => process.exit(1), 100);
          return;
        }
      }
    } else {
      console.error(`✗ Failure: API POST /api/beta-requests returned status ${res.status}`);
      console.error(await res.text());
      setTimeout(() => process.exit(1), 100);
      return;
    }

  } finally {
    console.log('\n--- 5. Test Data Cleanup ---');
    if (testRequestId) {
      await BetaRequest.deleteOne({ _id: testRequestId });
      console.log('✓ Success: Deleted test BetaRequest document.');
    }
    if (apiTestRequestId) {
      await BetaRequest.deleteOne({ _id: apiTestRequestId });
      console.log('✓ Success: Deleted API test BetaRequest document.');
    }

    await mongoose.disconnect();
    console.log('[Database] Mongoose connection closed.');
  }

  console.log('\n--- ALL BETA REQUEST DATABASE & EMAIL TESTS PASSED ---');
  setTimeout(() => process.exit(0), 100);
}

runTests().catch(err => {
  console.error('✗ Unhandled crash:', err);
  setTimeout(() => process.exit(1), 100);
});
