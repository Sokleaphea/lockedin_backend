import "dotenv/config";
import express from "express";
import authRoute from "./routes/auth.route";
import passwordRoute from "./routes/password.route";
import todoRoutes from "./routes/todo.route";
import pomodoroRoutes from "./routes/pomodoro.routes";
import { connectDB } from "./config/db";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Server is working!");
});

app.use("/api/auth", authRoute);
app.use("/api/password", passwordRoute);
app.use("/api/todo", todoRoutes);
app.use("/api/pomodoro", pomodoroRoutes); // ✅ THIS WAS MISSING

(async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server failed to start", err);
    process.exit(1);
  }
})();
