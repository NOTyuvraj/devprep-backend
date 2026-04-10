import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
  confidence: { type: Number, min: 1, max: 5, required: true },
  timesReviewed: { type: Number, default: 0 },
  easinessFactor: { type: Number, default: 2.5 },
  interval: { type: Number, default: 1 },
  nextReviewDate: { type: Date, default: Date.now },
  history: [{
    confidence: Number,
    reviewedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model("Problem", problemSchema);