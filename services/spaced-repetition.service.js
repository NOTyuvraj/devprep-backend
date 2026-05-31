// SM-2 Based Spaced Repetition

export const calculateNextReview = (
  confidence,
  easinessFactor,
  interval,
  timesReviewed
) => {
  // Calculate new easiness factor
  let newEF =
    easinessFactor +
    (0.1 - (5 - confidence) * (0.08 + (5 - confidence) * 0.02));

  if (newEF < 1.3) newEF = 1.3;
  if (newEF > 2.5) newEF = 2.5; // cap EF at 2.5

  let newInterval;

  if (confidence < 3) {
    // Failed review — full reset per SM-2 spec
    newEF = 2.5;
    newInterval = 1;
  } else if (timesReviewed === 0) {
    // First time seeing this problem
    newInterval = 1;
  } else if (timesReviewed === 1) {
    // Second review
    newInterval = 6;
  } else {
    // Subsequent reviews — grow interval by easiness factor
    newInterval = Math.round(interval * newEF);
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  // Set to start of that day so due problems show up correctly
  nextReviewDate.setHours(0, 0, 0, 0);

  return {
    newEF,
    newInterval,
    nextReviewDate,
  };
};