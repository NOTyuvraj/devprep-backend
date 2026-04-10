import "./config/env.js";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import problemRoutes from "./routes/problem.route.js";
import aiRoutes from "./routes/ai.route.js";
import { startCronJobs } from "./services/cron.service.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/ai", aiRoutes);
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