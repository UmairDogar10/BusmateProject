import mongoose from "mongoose";
import { env } from "./env";

const MONGODB_URI = env.mongodbUri;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    const { connection } = cached.conn;
    console.log("[MongoDB] Connected", {
      database: connection.name,
      host: connection.host,
      readyState: connection.readyState, // 1 = connected
    });
  } catch (e) {
    cached.promise = null;
    console.error(
      "[MongoDB] Connection failed:",
      e instanceof Error ? e.message : e,
    );
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
