// SM-2 Algorithm
export const calculateNextReview = (confidence, easinessFactor, interval, timesReviewed) => {
  let newEF = easinessFactor + (0.1 - (5 - confidence) * (0.08 + (5 - confidence) * 0.02));
  if (newEF < 1.3) newEF = 1.3;

  let newInterval;
  if (confidence < 3) {
    newInterval = 1; // failed — review tomorrow
  } else if (timesReviewed === 0) {
    newInterval = 1;
  } else if (timesReviewed === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(interval * newEF);
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return { newEF, newInterval, nextReviewDate };
};