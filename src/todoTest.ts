import express from "express";
import todoRoutes from "./routes/todo.route";
import { connectDB } from "./config/todo.db";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Todo server is working!");
});

app.use("/api", todoRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
  });
});
