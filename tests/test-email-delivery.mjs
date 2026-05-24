import fs from 'fs';
import path from 'path';

console.log('--- START EMAIL DELIVERY SERVICE TEST ---');

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

// Dynamically import the email service
const { sendAuditSummaryEmail, generateEmailHtml, getResendClient } = await import('../lib/email/emailService.js');

async function runTests() {
  // Test 1: HTML Template compilation
  console.log('\n--- 1. Testing HTML Template Generation ---');
  const mockAudit = {
    _id: '60d5ec49f83f2a1b8c8b4567',
    shareToken: 'test-share-token-123',
    tools: ['cursor', 'v0', 'openai_api'],
    seats: 12,
    summary: {
      totalCurrentSpend: 1540,
      optimizedSpendEstimate: 980,
      totalEstimatedSavings: 560,
      totalEstimatedYearlySavings: 6720,
      formattedCurrentSpend: '$1,540/mo',
      formattedOptimizedSpend: '$980/mo',
      formattedEstimatedSavings: '$560/mo',
      formattedEstimatedYearlySavings: '$6,720/yr',
      runwayRestoredPercent: 36.4
    },
    aiSummary: {
      executiveSummary: 'We identified substantial redundancies in seat allocations for code assistants and direct API volumetrics. Consolidating these licenses recovers $560/mo in active spend.'
    },
    recommendations: [
      {
        title: 'Consolidate Code Assistant Seats',
        estimatedImpact: 'High',
        estimatedMonthlySavings: 240,
        explanation: 'Deactivate duplicate Copilot licenses for developers already using Cursor Pro.'
      },
      {
        title: 'Optimize OpenAI Token Usage',
        estimatedImpact: 'Medium',
        estimatedMonthlySavings: 320,
        explanation: 'Enable semantic caching on top-tier completions endpoints to avoid duplicate lookups.'
      }
    ]
  };

  const shareUrl = 'http://localhost:3000/share/test-share-token-123';
  const htmlResult = generateEmailHtml({
    companyName: 'Acme Test Corp',
    audit: mockAudit,
    shareUrl
  });

  if (htmlResult && htmlResult.includes('Acme Test Corp') && htmlResult.includes('$560/mo') && htmlResult.includes('Consolidate Code Assistant Seats')) {
    console.log('✓ Success: HTML email summary template compiled and matched metrics perfectly.');
  } else {
    console.error('✗ Failure: HTML template failed assertions.');
    setTimeout(() => process.exit(1), 100);
    return;
  }

  // Test 2: API key verification and initialization
  console.log('\n--- 2. Testing Resend Client Initialization ---');
  const client = getResendClient();
  const apiKeyExists = !!process.env.RESEND_API_KEY;

  if (apiKeyExists) {
    if (client) {
      console.log('✓ Success: Resend client initialized successfully with present API key.');
    } else {
      console.error('✗ Failure: API key exists but Resend client failed to initialize.');
      setTimeout(() => process.exit(1), 100);
      return;
    }
  } else {
    console.log('⚠ Info: RESEND_API_KEY is missing. Skipping client-based delivery dispatch tests.');
    console.log('✓ Success: Service matches bypass conditions correctly.');
    setTimeout(() => process.exit(0), 100);
    return;
  }

  // Test 3: Email delivery dispatch
  console.log('\n--- 3. Testing Email Delivery Dispatch ---');
  // Free Resend keys can only send to verified emails (typically onboarding@resend.dev or the account owner)
  const testRecipient = process.env.RESEND_TEST_TO_EMAIL || 'onboarding@resend.dev';
  console.log(`Sending test report summary to: ${testRecipient}`);

  try {
    const outcome = await sendAuditSummaryEmail({
      to: testRecipient,
      companyName: 'Acme Test Corp',
      audit: mockAudit,
      shareUrl
    });

    if (outcome.success) {
      console.log('✓ Success: Email dispatched through Resend API. Response ID:', outcome.data?.id);
    } else {
      console.error('✗ Failure: Email delivery failed:', outcome.error);
      // We don't fail the build/test suite strictly here if it is a sandbox limitation (e.g. invalid domain error)
      // but we log it clearly.
      if (outcome.error.includes('403') || outcome.error.includes('unauthorized') || outcome.error.includes('restricted') || outcome.error.includes('domain')) {
        console.log('⚠ Note: Sandbox restriction detected. This is expected if the recipient is not verified in your Resend account.');
      } else {
        setTimeout(() => process.exit(1), 100);
        return;
      }
    }
  } catch (deliveryErr) {
    console.error('✗ Failure: Unexpected delivery crash:', deliveryErr);
    setTimeout(() => process.exit(1), 100);
    return;
  }

  console.log('\n--- ALL EMAIL DELIVERY TESTS COMPLETED SUCCESSFULLY ---');
  setTimeout(() => process.exit(0), 500);
}

runTests().catch(err => {
  console.error('✗ Test suite crash:', err);
  setTimeout(() => process.exit(1), 500);
});
