// import dotenv from "dotenv";
// dotenv.config();
// import express from "express";
// import authRoute from "./routes/auth.route";
// import passwordRoute from "./routes/password.route";
// import { connectDB } from "./config/db";

// const app = express();
// const PORT = 3000;

// app.get("/", (req, res) => {
//   res.send("🚀 Server is working!");
// });

// app.use(express.json());

// app.use("/api/auth", authRoute);
// app.use("/api/password", passwordRoute);


// (async () => {
//   await connectDB();
//   app.listen(PORT, () => {
//     console.log(`✅ Server running at http://localhost:${PORT}`);
//   });
// })();

import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoute from "./routes/auth.route";
import passwordRoute from "./routes/password.route";
import { connectDB } from "./config/db";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("🚀 Server is working!");
});

app.use("/api/auth", authRoute);
app.use("/api/password", passwordRoute);

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
