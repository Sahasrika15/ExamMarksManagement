// lib/db.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Extend the global type
declare global {
  // eslint-disable-next-line no-var, no-unused-vars
  var mongoose: any;
}

let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
if (global.mongoose) {
  cached = global.mongoose;
} else {
  cached = { conn: null, promise: null };
  global.mongoose = cached;
}

export async function connectToDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    console.log("Connecting to MongoDB...");
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "ExamMarksManagement",
      bufferCommands: false,
    } as mongoose.ConnectOptions);
  }

  cached.conn = await cached.promise;

  console.log("✅ Connected to MongoDB");
  return cached.conn;
}
