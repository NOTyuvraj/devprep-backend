import { analyzeWeakness } from "../services/ai.service.js";

export const getInsights = async (req, res) => {
  try {
    const insights = await analyzeWeakness(req.user._id);
    res.json({ insights });
  } catch (err) {
    res.status(500).json({ message: "AI analysis failed" });
  }
};