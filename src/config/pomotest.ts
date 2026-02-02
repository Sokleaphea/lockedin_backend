import mongoose from "mongoose";

export async function connectDB() {
  await mongoose.connect("mongodb://127.0.0.1:27017/lockedin");
  console.log("MongoDB connected");
}
