import {
  addProblem, getProblems, getDueProblems,
  reviewProblem, getStats
} from "../services/problem.service.js";

export const add = async (req, res) => {
  try {
    const problem = await addProblem(req.user._id, req.body);
    res.status(201).json({ problem });
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to add problem" });
  }
};

export const getAll = async (req, res) => {
  try {
    const problems = await getProblems(req.user._id);
    res.json({ problems });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch problems" });
  }
};

export const getDue = async (req, res) => {
  try {
    const problems = await getDueProblems(req.user._id);
    res.json({ problems });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch due problems" });
  }
};

export const review = async (req, res) => {
  try {
    const { confidence } = req.body;
    if (!confidence) return res.status(400).json({ message: "Confidence required" });
    const problem = await reviewProblem(req.user._id, req.params.id, confidence);
    res.json({ problem });
  } catch (err) {
    res.status(400).json({ message: err.message || "Review failed" });
  }
};

export const stats = async (req, res) => {
  try {
    const data = await getStats(req.user._id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};