import express from "express";
import User from "../models/user.model.js";

const router = express.Router();

router.get("/unsubscribe", async (req, res) => {
  try {
    const { user } = req.query;

    if (!user) return res.status(400).send("Invalid request");

    await User.findByIdAndUpdate(user, { emailDigest: false });

    res.send(`
      <h2>You have been unsubscribed</h2>
      <p>You will no longer receive DevPrep daily digest emails.</p>
    `);
  } catch (err) {
    res.status(500).send("Error unsubscribing");
  }
});

router.get("/preview/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);

  if (!user) return res.status(404).send("User not found");

  const due = await getDueProblems(user._id);

  const problemList = due
    .map(
      (p) =>
        `<li><a href="${p.url}">${p.title}</a> — ${p.topic} (${p.difficulty})</li>`,
    )
    .join("");

  res.send(`
    <h2>Your Daily Revision List 🧠</h2>
    <p>You have <strong>${due.length}</strong> problems due today:</p>
    <ul>${problemList}</ul>
  `);
});

export default router;
