import Problem from "../models/problem.model.js";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const analyzeWeakness = async (userId) => {
  const problems = await Problem.find({ userId });
  if (problems.length < 3) return "Add at least 3 problems to get AI insights.";

  const summary = problems.map(p =>
    `Title: ${p.title}, Topic: ${p.topic}, Difficulty: ${p.difficulty}, Confidence: ${p.confidence}/5, Reviews: ${p.timesReviewed}`
  ).join("\n");

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "user",
        content: `You are a coding interview coach. Analyze this student's LeetCode practice data and give specific, actionable advice in 3-5 sentences. Focus on weak topics and patterns.\n\nData:\n${summary}\n\nGive honest, direct feedback. Mention specific topics they struggle with and what to focus on next.`
      }
    ],
    max_tokens: 300,
  });

  return response.choices[0].message.content.trim();
};