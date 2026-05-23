import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

console.log('--- START API ROUTES INTEGRATION TEST SUITE ---');

// 1. Manually parse env file
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

// 2. Setup DB connection with fallback
const { default: dbConnect } = await import('../lib/db.js');
let db;
try {
  db = await dbConnect();
  console.log('✓ Success: Connected to MongoDB (Primary).');
} catch (err) {
  console.log('⚠ Warning: Connection to primary MONGODB_URI failed. Trying local fallback...');
  try {
    // Override MONGODB_URI env to local fallback so all subsequent dbConnect() calls resolve to it
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/credlens_test';
    // Clear mongoose global cache
    global.mongoose = { conn: null, promise: null };
    // Connect using the standard dbConnect helper
    db = await dbConnect();
    console.log('✓ Success: Connected to local fallback MongoDB.');
  } catch (fallbackErr) {
    console.error('✗ Failure: Failed to connect to MongoDB. Make sure MongoDB is running.');
    console.error(fallbackErr);
    process.exit(1);
  }
}

// Dynamically import Mongoose models & Route Handlers
const { POST: createAudit } = await import('../app/api/audit/route.js');
const { GET: getAudit } = await import('../app/api/audit/[id]/route.js');
const { POST: createLead, GET: getLeads } = await import('../app/api/leads/route.js');
const { default: Audit } = await import('../models/Audit.js');
const { default: Lead } = await import('../models/Lead.js');

async function runApiTests() {
  // Store generated IDs for validation and cleanup
  let testAuditId = null;
  let testShareToken = null;
  let privateAuditId = null;
  let privateShareToken = null;
  let testLeadId = null;
  const testEmail = `lead_${Date.now()}@example.com`;

  try {
    console.log('\n--- 1. POST /api/audit (Create Audit) ---');
    const auditPayload = {
      projectName: `API_TEST_PROJ_${Date.now()}`,
      tools: ['cursor', 'copilot'],
      toolPlans: { cursor: 'pro', copilot: 'business' },
      seats: 10,
      inactiveSeats: 2,
      monthlySpend: 400,
      useCase: 'coding',
      optimizationGoal: 'savings',
      isPublic: true,
      ownerId: 'owner_abc123',
      metadata: { source: 'integration_test', env: 'testing' }
    };

    const auditReq = new Request('http://localhost/api/audit', {
      method: 'POST',
      body: JSON.stringify(auditPayload),
      headers: { 'Content-Type': 'application/json' }
    });

    const auditRes = await createAudit(auditReq);
    if (auditRes.status === 201) {
      console.log('✓ Success: API returned 201 Created.');
      const data = await auditRes.json();
      testAuditId = data._id;
      testShareToken = data.shareToken;

      if (data.isPublic === true && data.ownerId === 'owner_abc123') {
        console.log('✓ Success: isPublic and ownerId fields saved correctly.');
      } else {
        console.error('✗ Failure: isPublic/ownerId storage failed:', data);
        process.exit(1);
      }

      if (data.categorySavings && data.categorySavings.redundancy > 0) {
        console.log(`✓ Success: categorySavings rollup cache automatically computed: ${JSON.stringify(data.categorySavings)}`);
      } else {
        console.error('✗ Failure: categorySavings rollup cache failed.');
        process.exit(1);
      }
    } else {
      console.error(`✗ Failure: POST /api/audit returned status ${auditRes.status}`);
      console.error(await auditRes.text());
      process.exit(1);
    }

    console.log('\n--- 2. GET /api/audit/[id] (Retrieve Audit by ObjectId) ---');
    const getByIdReq = new Request(`http://localhost/api/audit/${testAuditId}`);
    const getByIdContext = { params: Promise.resolve({ id: testAuditId.toString() }) };
    const getByIdRes = await getAudit(getByIdReq, getByIdContext);

    if (getByIdRes.status === 200) {
      const data = await getByIdRes.json();
      if (data._id === testAuditId && data.projectName.startsWith('API_TEST_PROJ_')) {
        console.log('✓ Success: Correctly retrieved Audit report by Mongoose ObjectId.');
      } else {
        console.error('✗ Failure: Retrieved Audit report fields mismatch.');
        process.exit(1);
      }
    } else {
      console.error(`✗ Failure: GET /api/audit/[id] returned status ${getByIdRes.status}`);
      process.exit(1);
    }

    console.log('\n--- 3. GET /api/audit/[id] (Retrieve Audit by shareToken) ---');
    const getByTokenReq = new Request(`http://localhost/api/audit/${testShareToken}`);
    const getByTokenContext = { params: Promise.resolve({ id: testShareToken }) };
    const getByTokenRes = await getAudit(getByTokenReq, getByTokenContext);

    if (getByTokenRes.status === 200) {
      const data = await getByTokenRes.json();
      if (data._id === testAuditId && data.shareToken === testShareToken) {
        console.log('✓ Success: Correctly retrieved public Audit report by shareToken.');
      } else {
        console.error('✗ Failure: shareToken retrieval returned incorrect document.');
        process.exit(1);
      }
    } else {
      console.error(`✗ Failure: GET /api/audit/[id] by shareToken returned status ${getByTokenRes.status}`);
      process.exit(1);
    }

    console.log('\n--- 4. GET /api/audit/[id] (Retrieve Private Audit by shareToken blocks with 403) ---');
    // Save a private audit
    const privateAuditPayload = {
      projectName: 'API_TEST_PRIVATE',
      tools: ['cursor'],
      toolPlans: { cursor: 'pro' },
      seats: 5,
      inactiveSeats: 0,
      monthlySpend: 100,
      useCase: 'coding',
      optimizationGoal: 'savings',
      isPublic: false
    };
    
    const privateAuditReq = new Request('http://localhost/api/audit', {
      method: 'POST',
      body: JSON.stringify(privateAuditPayload),
      headers: { 'Content-Type': 'application/json' }
    });
    
    const privateAuditRes = await createAudit(privateAuditReq);
    if (privateAuditRes.status === 201) {
      const data = await privateAuditRes.json();
      privateAuditId = data._id;
      privateShareToken = data.shareToken;
    } else {
      console.error('✗ Failure: Could not save private audit setup.');
      process.exit(1);
    }

    const getPrivateReq = new Request(`http://localhost/api/audit/${privateShareToken}`);
    const getPrivateContext = { params: Promise.resolve({ id: privateShareToken }) };
    const getPrivateRes = await getAudit(getPrivateReq, getPrivateContext);

    if (getPrivateRes.status === 403) {
      const data = await getPrivateRes.json();
      if (data.error === 'This audit report is private.') {
        console.log('✓ Success: Accessing private Audit report by shareToken correctly blocked with 403 Forbidden.');
      } else {
        console.error('✗ Failure: Forbidden response structure mismatch:', data);
        process.exit(1);
      }
    } else {
      console.error(`✗ Failure: Accessing private Audit by token returned unexpected status ${getPrivateRes.status} (expected 403)`);
      process.exit(1);
    }

    console.log('\n--- 5. POST /api/leads (Create Lead with teamSize & auditHistory) ---');
    const leadPayload = {
      companyName: 'Acme API Corp',
      contactName: 'Alice Apier',
      email: testEmail,
      phone: '+18885551212',
      activeSpend: 1500,
      auditId: testAuditId,
      teamSize: 25,
      metadata: { utm_medium: 'cpc', lead_source: 'api_test' }
    };

    const leadReq = new Request('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify(leadPayload),
      headers: { 'Content-Type': 'application/json' }
    });

    const leadRes = await createLead(leadReq);
    if (leadRes.status === 201) {
      const data = await leadRes.json();
      testLeadId = data._id;
      if (data.teamSize === 25 && data.auditHistory.includes(testAuditId)) {
        console.log('✓ Success: Lead saved with teamSize and audit added to auditHistory.');
      } else {
        console.error('✗ Failure: Lead API field mapping failed:', data);
        process.exit(1);
      }
    } else {
      console.error(`✗ Failure: POST /api/leads returned status ${leadRes.status}`);
      console.error(await leadRes.text());
      process.exit(1);
    }

    console.log('\n--- 6. GET /api/leads?email=... (Retrieve Lead by email) ---');
    const getLeadByEmailReq = new Request(`http://localhost/api/leads?email=${encodeURIComponent(testEmail)}`);
    // Pass it to route GET handler (NextUrl is parsed by searchParams)
    getLeadByEmailReq.nextUrl = new URL(`http://localhost/api/leads?email=${encodeURIComponent(testEmail)}`);
    const getLeadByEmailRes = await getLeads(getLeadByEmailReq);

    if (getLeadByEmailRes.status === 200) {
      const data = await getLeadByEmailRes.json();
      if (data._id === testLeadId && data.email === testEmail.toLowerCase() && data.auditId._id === testAuditId && data.auditHistory[0]._id === testAuditId) {
        console.log('✓ Success: Retrieved Lead details by email query with fully populated Audit references.');
      } else {
        console.error('✗ Failure: Querying Lead by email fields/populates mismatch:', data);
        process.exit(1);
      }
    } else {
      console.error(`✗ Failure: GET /api/leads?email=... returned status ${getLeadByEmailRes.status}`);
      process.exit(1);
    }

    console.log('\n--- 7. GET /api/leads (List all Leads) ---');
    const getAllLeadsReq = new Request('http://localhost/api/leads');
    getAllLeadsReq.nextUrl = new URL('http://localhost/api/leads');
    const getAllLeadsRes = await getLeads(getAllLeadsReq);

    if (getAllLeadsRes.status === 200) {
      const data = await getAllLeadsRes.json();
      if (Array.isArray(data) && data.length > 0 && data[0]._id === testLeadId) {
        console.log(`✓ Success: Retrieved all leads as array, sorting verified correctly (newest lead first).`);
      } else {
        console.error('✗ Failure: Leads listing array empty or sorting incorrect.');
        process.exit(1);
      }
    } else {
      console.error(`✗ Failure: GET /api/leads returned status ${getAllLeadsRes.status}`);
      process.exit(1);
    }

  } finally {
    // 8. Cleanup Database Test Data
    console.log('\n--- 8. API Test Cleanup ---');
    if (testAuditId) {
      await Audit.deleteOne({ _id: testAuditId });
      console.log('✓ Cleaned up test audit report');
    }
    if (privateAuditId) {
      await Audit.deleteOne({ _id: privateAuditId });
      console.log('✓ Cleaned up test private audit report');
    }
    if (testLeadId) {
      await Lead.deleteOne({ _id: testLeadId });
      console.log('✓ Cleaned up test lead capture');
    }
    await mongoose.disconnect();
    console.log('[Database] Mongoose connection closed.');
  }

  console.log('\n--- API ROUTES INTEGRATION TEST SUITE PASSED ---');
  process.exit(0);
}

runApiTests().catch(err => {
  console.error('Unhandled rejection during API route tests:', err);
  process.exit(1);
});
