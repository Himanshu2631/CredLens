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
    console.log('✓ Success: Connected to MongoDB (Primary).');
  } catch (err) {
    console.log('⚠ Warning: Connection to primary MONGODB_URI failed. Trying local fallback...');
    try {
      process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/credlens_test';
      global.mongoose = { conn: null, promise: null };
      db = await dbConnect();
      console.log('✓ Success: Connected to local fallback MongoDB.');
    } catch (fallbackErr) {
      console.error('✗ Failure: Failed to connect to MongoDB (both primary and local fallback failed). Make sure MongoDB is running.');
      console.error(fallbackErr);
      process.exit(1);
    }
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
      
      // Verify future sharing token generation
      if (queriedAudit.shareToken && typeof queriedAudit.shareToken === 'string') {
        console.log(`✓ Success: Auto-generated shareToken detected: ${queriedAudit.shareToken}`);
      } else {
        console.error('✗ Failure: shareToken was not automatically generated on Audit');
        process.exit(1);
      }

      // Verify schema version defaults
      if (queriedAudit.schemaVersion === 1) {
        console.log('✓ Success: schemaVersion is 1.');
      } else {
        console.error('✗ Failure: schemaVersion mismatch:', queriedAudit.schemaVersion);
        process.exit(1);
      }

      // Verify categorySavings rollup cache populated by pre-save hook
      const redundancySavings = queriedAudit.categorySavings.get('redundancy');
      if (redundancySavings === 150) {
        console.log(`✓ Success: categorySavings rollup cache populated correctly (redundancy: $${redundancySavings})`);
      } else {
        console.error('✗ Failure: categorySavings rollup cache mismatch:', queriedAudit.categorySavings);
        process.exit(1);
      }
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
      auditId: testAuditId,
      teamSize: 15,
      auditHistory: [testAuditId],
      status: 'converted',
      ownerId: 'user_98765',
      metadata: { utm_source: 'google', cohort: 'q2_2026' }
    });

    const savedLead = await validLead.save();
    testLeadId = savedLead._id;
    console.log('✓ Success: Saved valid Lead document linked to Audit ID');

    // 4.5 Query and populate relations
    const queriedLead = await Lead.findById(testLeadId).populate('auditId').populate('auditHistory');
    if (queriedLead && queriedLead.email === 'alice.johnson@example.com' && queriedLead.auditId && queriedLead.auditId.projectName === TEST_PROJECT_NAME) {
      console.log('✓ Success: Queried Lead, confirmed email auto-lowercased, and successfully populated associated Audit details');
      
      // Verify optional teamSize field
      if (queriedLead.teamSize === 15) {
        console.log('✓ Success: Lead teamSize is 15.');
      } else {
        console.error('✗ Failure: Lead teamSize mismatch:', queriedLead.teamSize);
        process.exit(1);
      }

      // Verify custom status enum
      if (queriedLead.status === 'converted') {
        console.log('✓ Success: Lead status enum set to converted.');
      } else {
        console.error('✗ Failure: Lead status mismatch:', queriedLead.status);
        process.exit(1);
      }

      // Verify auditHistory array referencing Audit
      if (queriedLead.auditHistory && queriedLead.auditHistory.length === 1 && queriedLead.auditHistory[0].projectName === TEST_PROJECT_NAME) {
        console.log('✓ Success: Lead auditHistory is populated correctly.');
      } else {
        console.error('✗ Failure: Lead auditHistory mismatch/empty:', queriedLead.auditHistory);
        process.exit(1);
      }

      // Verify metadata Map
      if (queriedLead.metadata.get('utm_source') === 'google') {
        console.log('✓ Success: Lead metadata Map stored and accessed correctly.');
      } else {
        console.error('✗ Failure: Lead metadata mismatch:', queriedLead.metadata);
        process.exit(1);
      }
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
