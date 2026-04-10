import express from "express";
import { getInsights } from "../controllers/ai.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { sendDailyDigest } from "../services/email.service.js";

const router = express.Router();

router.get("/test-email", authMiddleware, async (req, res) => {
  try {
    await sendDailyDigest(req.user.userId);
    res.json({ message: "Email sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/insights", authMiddleware, getInsights);

export default router;