import "dotenv/config";
import express from "express";
import cors from "cors";
import "./config/cloudinary";
import authRoute from "./routes/auth.route";
import passwordRoute from "./routes/password.route";
import todoRoutes from "./routes/todo.route";
import settingRoute from "./routes/setting.route";
import pomodoroRoutes from "./routes/pomodoro.route";
import flashcardRoutes from "./routes/flashcard.route";
import aiRoute from "./routes/ai.route";
import followRoute from "./routes/follow.route";
import { connectDB } from "./config/db";
import { swaggerSpec } from "./config/swagger";
import swaggerUi from "swagger-ui-express";
import privateChatRoute from "./routes/privatechat.route";
import booksRoute from "./routes/books.route";

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS before routes
app.use(cors({
  origin: ["http://localhost:58016", "http://localhost:3000", "http://localhost:50816"], // Support multiple origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
}));

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("🚀 Server is working!");
});

app.use("/api/auth", authRoute);
app.use("/api/password", passwordRoute);
app.use("/api/todo", todoRoutes);
app.use("/api/pomodoro", pomodoroRoutes);
app.use("/api/setting", settingRoute);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/ai", aiRoute);
app.use("/api/follow", followRoute);
app.use("/api/privatechat", privateChatRoute);
app.use("/api/books", booksRoute);


(async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
      console.log("Groq key loaded:", process.env.GROQ_API_KEY?.slice(0, 6));

    });
  } catch (err) {
    console.error("❌ Server failed to start", err);
    process.exit(1);
  }
})();
