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

router.get("/preview/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);
  const due = await getDueProblems(user._id);

  const problemList = due.map(p =>
    `<li><a href="${p.url}">${p.title}</a> — ${p.topic} (${p.difficulty})</li>`
  ).join("");

  res.send(`
    <h2>Your Daily Revision List 🧠</h2>
    <p>You have <strong>${due.length}</strong> problems due:</p>
    <ul>${problemList}</ul>
  `);
});

router.get("/insights", authMiddleware, getInsights);

export default router;