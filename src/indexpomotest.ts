import express from "express";
import { connectDB } from "./config/pomotest";
import pomodoroRoutes from "./routes/pomodoro.routes"; // adjust path if needed

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
