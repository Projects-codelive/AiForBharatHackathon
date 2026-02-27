/**
 * MongoDB connection utility using Mongoose.
 * Caches the connection in development to avoid hot-reload reconnects.
 */
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in your .env.local file.");
}

// Extend the global type to include our mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    console.log("🟢 [MongoDB] Using existing cached connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Obfuscate the URI for logging
    const safeUri = MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
    console.log(`🟡 [MongoDB] Attempting to connect to: ${safeUri}`);

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log("🟢 [MongoDB] Successfully connected!");
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("🟢 [MongoDB] Connection promise resolved");
  } catch (e) {
    cached.promise = null;
    console.error("🔴 [MongoDB] Connection FAILED:");
    console.error(e);
    throw e;
  }

  return cached.conn;
}
