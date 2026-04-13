import "./config/env.js";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import problemRoutes from "./routes/problem.route.js";
import aiRoutes from "./routes/ai.route.js";
import { sendDailyDigest } from "./services/email.service.js";
import User from "./models/user.model.js";
import emailRoutes from "./routes/email.route.js";

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://dev-prep-black.vercel.app",
      "chrome-extension://bnllfonofnnfbhficcjkekalgogookda"
    ],
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/email", emailRoutes);

app.get("/cron/daily-digest", async (req, res) => {
  const { key } = req.query;

  if (key !== process.env.CRON_SECRET) {
    return res.status(401).send("Unauthorized");
  }

  console.log("Daily digest cron triggered:", new Date().toISOString());

  try {
    const users = await User.find({ emailDigest: true });

    await Promise.all(
      users.map((user) => sendDailyDigest(user._id))
    );

    console.log(`Digest sent to ${users.length} users`);

    res.json({
      success: true,
      users: users.length,
    });
  } catch (err) {
    console.error("Cron failed:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
};

startServer();
