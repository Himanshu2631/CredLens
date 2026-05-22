import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Mask credentials in Mongo connection string for logging.
 */
function maskConnectionString(uri) {
  try {
    const url = new URL(uri);
    if (url.username || url.password) {
      url.username = '***';
      url.password = '***';
    }
    return url.toString();
  } catch (e) {
    // Fallback regex masking for mongodb+srv URIs which URL might fail to parse cleanly
    return uri.replace(/\/\/(.*):(.*)@/, '//***:***@');
  }
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage in development.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Bind connection lifecycle listeners once globally
if (!global.mongooseRegistered) {
  mongoose.connection.on('connected', () => {
    console.log('[Database] Mongoose connected to MongoDB.');
  });
  mongoose.connection.on('error', (err) => {
    console.error('[Database] Mongoose connection error:', err);
  });
  mongoose.connection.on('disconnected', () => {
    console.log('[Database] Mongoose disconnected from MongoDB.');
  });
  global.mongooseRegistered = true;
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    };

    const maskedUri = maskConnectionString(MONGODB_URI);
    console.log(`[Database] Connecting to MongoDB: ${maskedUri}`);

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    const maskedUri = maskConnectionString(MONGODB_URI);
    console.error(`[Database] Error connecting to MongoDB (${maskedUri}):`, e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
