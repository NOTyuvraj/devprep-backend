import mongoose from "mongoose";
import Problem from "../models/problem.model.js";
import { calculateNextReview } from "./spaced-repetition.service.js";

export const addProblem = async (userId, data) => {
  const { title, url, topic, difficulty, confidence } = data;
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const existing = await Problem.findOne({ userId: userObjectId, url });

  if (existing) {
    const { newEF, newInterval, nextReviewDate } = calculateNextReview(
      confidence,
      existing.easinessFactor,
      existing.interval,
      existing.timesReviewed
    );

    existing.confidence = confidence;
    existing.easinessFactor = newEF;
    existing.interval = newInterval;
    existing.nextReviewDate = nextReviewDate;
    existing.timesReviewed += 1;
    existing.history.push({ confidence, reviewedAt: new Date() });

    return await existing.save();
  }

  const { newEF, newInterval, nextReviewDate } = calculateNextReview(
    confidence, 2.5, 1, 0
  );

  const problem = await Problem.create({
    userId: userObjectId,
    title,
    url,
    topic,
    difficulty,
    confidence,
    easinessFactor: newEF,
    interval: newInterval,
    nextReviewDate,
    timesReviewed: 1,
    history: [{ confidence, reviewedAt: new Date() }],
  });

  return problem;
};

export const getProblems = async (userId) => {
  return await Problem.find({
    userId: new mongoose.Types.ObjectId(userId),
  }).sort({ nextReviewDate: 1 });
};

export const getDueProblems = async (userId) => {
  return await Problem.find({
    userId: new mongoose.Types.ObjectId(userId),
    nextReviewDate: { $lte: new Date() },
  }).sort({ nextReviewDate: 1 });
};

export const reviewProblem = async (userId, problemId, confidence) => {
  const problem = await Problem.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    _id: problemId,
  });
  if (!problem) throw new Error("Problem not found");

  const { newEF, newInterval, nextReviewDate } = calculateNextReview(
    confidence,
    problem.easinessFactor,
    problem.interval,
    problem.timesReviewed
  );

  problem.confidence = confidence;
  problem.easinessFactor = newEF;
  problem.interval = newInterval;
  problem.nextReviewDate = nextReviewDate;
  problem.timesReviewed += 1;
  problem.history.push({ confidence, reviewedAt: new Date() });

  await problem.save();
  return problem;
};

export const getStats = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const problems = await Problem.find({ userId: userObjectId });
  const due = await getDueProblems(userId);

  const topicMap = {};
  problems.forEach((p) => {
    if (!topicMap[p.topic]) topicMap[p.topic] = { total: 0, avgConfidence: 0 };
    topicMap[p.topic].total += 1;
    topicMap[p.topic].avgConfidence += p.confidence;
  });

  const weakTopics = Object.entries(topicMap)
    .map(([topic, data]) => ({
      topic,
      total: data.total,
      avgConfidence: +(data.avgConfidence / data.total).toFixed(2),
    }))
    .sort((a, b) => a.avgConfidence - b.avgConfidence)
    .slice(0, 5);

  return {
    totalProblems: problems.length,
    dueToday: due.length,
    weakTopics,
  };
};