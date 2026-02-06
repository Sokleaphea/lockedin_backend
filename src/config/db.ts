import mongoose from "mongoose";

export const connectDB = async () => {
  const { MONGO_URI } = process.env;

  // Fail fast if URI is missing
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Atlas connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed", error);
    process.exit(1);
  }
};
