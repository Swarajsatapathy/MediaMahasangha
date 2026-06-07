import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
    lastError: "",
  };
}

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    cached.lastError = "MONGODB_URI is not set";
    throw new Error("MONGODB_URI is not set");
  }

  try {
    if (!cached.promise) {
      console.log("Connecting to MongoDB...");

      cached.promise = mongoose.connect(uri, {
        dbName: "odmm-proper",
        bufferCommands: false,
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 15000,
      });
    }

    cached.conn = await cached.promise;
    cached.lastError = "";

    console.log(`MongoDB connected: ${cached.conn.connection.host}`);

    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    cached.lastError = error.message || "Unknown MongoDB connection error";

    console.error("MongoDB connection error:", cached.lastError);

    throw error;
  }
};

export const getDbStatus = () => ({
  isConnected: mongoose.connection.readyState === 1,
  state: mongoose.connection.readyState,
  lastError: cached.lastError,
});