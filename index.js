import "./config/env.js";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import problemRoutes from "./routes/problem.route.js";
import aiRoutes from "./routes/ai.route.js";
import { startCronJobs } from "./services/cron.service.js";
import { sendDailyDigest } from "./services/email.service.js";
import User from "./models/user.model.js";

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://devprep-backend-jze5.onrender.com/api",
    ],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/ai", aiRoutes);
app.get("/cron/daily-digest", async (req, res) => {
  const { key } = req.query;

  if (key !== process.env.CRON_SECRET) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const users = await User.find({ emailDigest: true });

    for (const user of users) {
      await sendDailyDigest(user._id);
    }

    res.send(`Digest sent to ${users.length} users`);
  } catch (err) {
    res.status(500).send("Cron failed");
  }
});
app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();
    startCronJobs();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
};

startServer();