// import mongoose from "mongoose";

// export const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.DB_URI!);
//     console.log("✅ MongoDB connected");
//   } catch (error) {
//     console.error("❌ MongoDB connection failed", error);
//     process.exit(1);
//   }
// };

import mongoose from "mongoose";

export const connectDB = async () => {
  // Destructure required environment variables
  const {
    MONGO_USER,
    MONGO_PASSWORD,
    MONGO_CLUSTER,
    MONGO_DB,
    MONGO_OPTIONS,
  } = process.env;

  // Validate required variables early (fail fast)
  if (!MONGO_USER || !MONGO_PASSWORD || !MONGO_CLUSTER || !MONGO_DB) {
    throw new Error(
      "Missing MongoDB environment variables. Check MONGO_USER, MONGO_PASSWORD, MONGO_CLUSTER, and MONGO_DB."
    );
  }

  // Build MongoDB connection URI from modular parts
  const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_CLUSTER}/${MONGO_DB}${
    MONGO_OPTIONS ? `?${MONGO_OPTIONS}` : ""
  }`;

  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(uri);
    console.log("✅ MongoDB Atlas connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed", error);
    process.exit(1);
  }
};

