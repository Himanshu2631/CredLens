/**
 * Quick MongoDB connectivity test.
 * Run with: node tests/test-db-connection.mjs
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const uri = process.env.MONGODB_URI;

console.log('--- MongoDB Connection Test ---');
console.log('MONGODB_URI defined:', !!uri);
console.log('URI prefix:', uri ? uri.substring(0, 30) + '...' : 'MISSING');

if (!uri) {
  console.error('ERROR: MONGODB_URI is not set in .env.local');
  process.exit(1);
}

try {
  console.log('\nAttempting connection...');
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 10000,
  });
  
  console.log('✅ Connected successfully!');
  console.log('   Host:', conn.connection.host);
  console.log('   Database:', conn.connection.name);
  console.log('   ReadyState:', conn.connection.readyState);
  
  // Check if there are any existing audits
  const collections = await conn.connection.db.listCollections().toArray();
  console.log('   Collections:', collections.map(c => c.name).join(', ') || '(none)');
  
  // Try to count audit documents
  const auditCount = await conn.connection.db.collection('audits').countDocuments();
  console.log('   Audit documents:', auditCount);
  
  await mongoose.disconnect();
  console.log('\n✅ Test passed. MongoDB is accessible.');
} catch (err) {
  console.error('\n❌ Connection FAILED:', err.message);
  console.error('   Full error:', err.name);
  
  if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
    console.error('   → DNS resolution failed. Check your internet connection or cluster hostname.');
  } else if (err.message.includes('Authentication failed') || err.message.includes('auth')) {
    console.error('   → Authentication failed. Check username and password in MONGODB_URI.');
  } else if (err.message.includes('IP') || err.message.includes('whitelist')) {
    console.error('   → Your IP may not be whitelisted in MongoDB Atlas Network Access.');
  } else if (err.message.includes('timed out') || err.message.includes('ETIMEDOUT')) {
    console.error('   → Connection timed out. Check Atlas Network Access — your current IP may not be whitelisted.');
  }
  
  process.exit(1);
}
