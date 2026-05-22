import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

console.log('--- START BACKEND DATABASE & VALIDATION TEST SUITE ---');

// 1. Manually parse .env.local for local testing
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
    console.log('⚠ Warning: .env.local not found. Using current environment variables.');
  }
} catch (e) {
  console.error('✗ Failure loading env:', e);
}

// Dynamically import database utilities after environment variables are parsed
const { default: dbConnect } = await import('../lib/db.js');
const { default: Audit } = await import('../models/Audit.js');
const { default: Lead } = await import('../models/Lead.js');

async function runTests() {
  let db;
  try {
    console.log('\n--- 1. MongoDB Connection Test ---');
    db = await dbConnect();
    console.log('✓ Success: Connected to MongoDB.');
  } catch (err) {
    console.error('✗ Failure: Failed to connect to MongoDB. Make sure MongoDB is running.');
    console.error(err);
    process.exit(1);
  }

  // Define unique identifiers for cleanup
  const TEST_PROJECT_NAME = `TEST_PROJECT_${Date.now()}`;
  const TEST_COMPANY_NAME = `TEST_COMPANY_${Date.now()}`;
  let testAuditId = null;
  let testLeadId = null;

  try {
    console.log('\n--- 2. Audit Model Validation Tests ---');
    
    // 2.1 Test invalid validation (empty name)
    try {
      const invalidAudit = new Audit({
        projectName: '',
        seats: 2,
        monthlySpend: 200,
        useCase: 'coding',
        optimizationGoal: 'savings'
      });
      await invalidAudit.validate();
      console.error('✗ Failure: Empty project name should have failed validation');
      process.exit(1);
    } catch (e) {
      console.log('✓ Success: Empty project name correctly blocked by validation');
    }

    // 2.2 Test invalid validation (negative seats)
    try {
      const invalidAudit = new Audit({
        projectName: TEST_PROJECT_NAME,
        seats: -5,
        monthlySpend: 200,
        useCase: 'coding',
        optimizationGoal: 'savings'
      });
      await invalidAudit.validate();
      console.error('✗ Failure: Negative seats should have failed validation');
      process.exit(1);
    } catch (e) {
      console.log('✓ Success: Negative seats correctly blocked by validation');
    }

    // 2.3 Test invalid validation (negative spend)
    try {
      const invalidAudit = new Audit({
        projectName: TEST_PROJECT_NAME,
        seats: 2,
        monthlySpend: -100,
        useCase: 'coding',
        optimizationGoal: 'savings'
      });
      await invalidAudit.validate();
      console.error('✗ Failure: Negative spend should have failed validation');
      process.exit(1);
    } catch (e) {
      console.log('✓ Success: Negative spend correctly blocked by validation');
    }

    // 2.4 Save valid Audit
    console.log('\n--- 3. Audit Model Storage & Query Tests ---');
    const validAudit = new Audit({
      projectName: TEST_PROJECT_NAME,
      tools: ['cursor', 'copilot'],
      toolPlans: { cursor: 'pro', copilot: 'business' },
      seats: 5,
      inactiveSeats: 1,
      monthlySpend: 350,
      useCase: 'coding',
      optimizationGoal: 'performance',
      summary: {
        totalCurrentSpend: 350,
        optimizedSpendEstimate: 200,
        totalEstimatedSavings: 150,
        totalEstimatedYearlySavings: 1800,
        formattedCurrentSpend: '$350/mo',
        formattedOptimizedSpend: '$200/mo',
        formattedEstimatedSavings: '$150/mo',
        formattedEstimatedYearlySavings: '$1,800/yr',
        runwayRestoredPercent: 42.8,
        subscriptionCost: 200,
        apiSpend: 150,
        apiAllocation: { openai_api: 150 },
        totalPotentialSavings: 150,
        optimizedMonthlySpend: 200,
        totalPotentialYearlySavings: 1800,
        currentMonthlySpend: 350
      },
      recommendations: [{
        id: 'rule-copilot-cursor-overlap',
        provider: 'copilot',
        category: 'redundancy',
        title: 'Consolidate Code Assistant Seats',
        explanation: 'Deactivate GitHub Copilot licenses for team members already using Cursor.',
        whyItMatters: 'Cursor contains its own autocomplete.',
        estimatedImpact: 'High',
        estimatedSavings: {
          monthly: 150,
          yearly: 1800,
          formattedMonthly: '$150/mo',
          formattedYearly: '$1,800/yr',
          logic: 'Cancel Copilot'
        },
        actionableSteps: ['Deactivate seats'],
        priority: 'high',
        estimatedMonthlySavings: 150,
        estimatedYearlySavings: 1800,
        optimizedMonthlyCost: 0,
        currentMonthlyCost: 150,
        savingsLogic: 'Cancel Copilot'
      }],
      recommendationExplanations: {
        'rule-copilot-cursor-overlap': {
          title: 'Consolidate Code Assistant Seats',
          summary: 'Deactivate GitHub Copilot licenses for team members already using Cursor.',
          impact: 'High'
        }
      }
    });

    const savedAudit = await validAudit.save();
    testAuditId = savedAudit._id;
    console.log('✓ Success: Saved valid Audit document to MongoDB');

    // 2.5 Query saved Audit
    const queriedAudit = await Audit.findById(testAuditId);
    if (queriedAudit && queriedAudit.projectName === TEST_PROJECT_NAME && queriedAudit.summary.totalEstimatedSavings === 150) {
      console.log('✓ Success: Queried Audit and verified stored metrics matching engine outputs');
    } else {
      console.error('✗ Failure: Queried Audit metrics mismatch:', queriedAudit);
      process.exit(1);
    }

    console.log('\n--- 4. Lead Model Validation Tests ---');

    // 4.1 Empty Company Name
    try {
      const invalidLead = new Lead({
        companyName: '',
        contactName: 'Alice',
        email: 'alice@example.com'
      });
      await invalidLead.validate();
      console.error('✗ Failure: Empty company name should have failed validation');
      process.exit(1);
    } catch (e) {
      console.log('✓ Success: Empty company name correctly blocked');
    }

    // 4.2 Invalid Email format
    try {
      const invalidLead = new Lead({
        companyName: TEST_COMPANY_NAME,
        contactName: 'Alice',
        email: 'alice-invalid-email-format'
      });
      await invalidLead.validate();
      console.error('✗ Failure: Invalid email format should have failed validation');
      process.exit(1);
    } catch (e) {
      console.log('✓ Success: Invalid email format correctly blocked');
    }

    // 4.3 Negative Active Spend
    try {
      const invalidLead = new Lead({
        companyName: TEST_COMPANY_NAME,
        contactName: 'Alice',
        email: 'alice@example.com',
        activeSpend: -500
      });
      await invalidLead.validate();
      console.error('✗ Failure: Negative activeSpend should have failed validation');
      process.exit(1);
    } catch (e) {
      console.log('✓ Success: Negative activeSpend correctly blocked');
    }

    // 4.4 Save valid Lead with Audit reference
    console.log('\n--- 5. Lead Model Storage & Relationship Tests ---');
    const validLead = new Lead({
      companyName: TEST_COMPANY_NAME,
      contactName: 'Alice Johnson',
      email: 'ALICE.JOHNSON@example.com', // Test lowercasing trigger
      phone: '+15555555',
      activeSpend: 1200,
      auditId: testAuditId
    });

    const savedLead = await validLead.save();
    testLeadId = savedLead._id;
    console.log('✓ Success: Saved valid Lead document linked to Audit ID');

    // 4.5 Query and populate relations
    const queriedLead = await Lead.findById(testLeadId).populate('auditId');
    if (queriedLead && queriedLead.email === 'alice.johnson@example.com' && queriedLead.auditId && queriedLead.auditId.projectName === TEST_PROJECT_NAME) {
      console.log('✓ Success: Queried Lead, confirmed email auto-lowercased, and successfully populated associated Audit details');
    } else {
      console.error('✗ Failure: Relationship querying verification failed:', queriedLead);
      process.exit(1);
    }

  } finally {
    // 6. Cleanup
    console.log('\n--- 6. Test Data Cleanup ---');
    if (testAuditId) {
      await Audit.deleteOne({ _id: testAuditId });
      console.log('✓ Success: Cleaned up test Audit document');
    }
    if (testLeadId) {
      await Lead.deleteOne({ _id: testLeadId });
      console.log('✓ Success: Cleaned up test Lead document');
    }

    // Disconnect mongoose to let the test process terminate cleanly
    await mongoose.disconnect();
    console.log('[Database] Mongoose connection closed.');
  }

  console.log('\n--- TEST SUITE COMPLETE: ALL BACKEND DATABASE TESTS PASSED ---');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Unhandled rejection in test run:', err);
  process.exit(1);
});
