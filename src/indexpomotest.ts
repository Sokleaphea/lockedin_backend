import express from "express";
import { connectDB } from "./config/pomotest";
import pomodoroRoutes from "./routes/pomodoro.routes"; // adjust path if needed

const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_CLUSTER,
  MONGO_DB,
  MONGO_OPTIONS,
} = process.env;

const MONGO_URI = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_CLUSTER}/${MONGO_DB}?${MONGO_OPTIONS}`;


const app = express();
const PORT = 3000;

// middleware to parse JSON
app.use(express.json());

// routes
app.use("/api/pomodoro", pomodoroRoutes);

// connect DB
connectDB();

// start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
