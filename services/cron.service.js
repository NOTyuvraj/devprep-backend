import cron from "node-cron";
import User from "../models/user.model.js";
import { sendDailyDigest } from "./email.service.js";

export const startCronJobs = () => {
  // Every day at 8:00 AM
  cron.schedule("* * * * *", async () => {
    console.log("Running daily digest cron job...");
    try {
      const users = await User.find({ emailDigest: true });
      for (const user of users) {
        await sendDailyDigest(user._id);
      }
      console.log(`Digest sent to ${users.length} users`);
    } catch (err) {
      console.error("Cron job failed:", err.message);
    }
  });

  console.log("Cron jobs started");
};