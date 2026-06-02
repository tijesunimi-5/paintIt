import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/paintit_feedback";

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

// 1. Extend the global globalThis type matrix via clean interface declarations
declare global {
  // eslint-disable-next-line no-var
  var mongooseCached:
    | {
        conn: mongoose.Connection | null;
        promise: Promise<mongoose.Connection> | null;
      }
    | undefined;
}

// 2. Safely initialize global reference variables without using any type leaks
let cached = globalThis.mongooseCached;

if (!cached) {
  cached = globalThis.mongooseCached = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<mongoose.Connection> {
  // Defensive fall-through check for caching matrices
  if (!cached) {
    cached = { conn: null, promise: null };
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => m.connection);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: unknown) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
