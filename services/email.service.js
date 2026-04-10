import nodemailer from "nodemailer";
import User from "../models/user.model.js";
import { getDueProblems } from "./problem.service.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendDailyDigest = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.emailDigest) return;

  const due = await getDueProblems(userId);
  if (due.length === 0) return;

  const problemList = due.map(p =>
    `<li><a href="${p.url}">${p.title}</a> — ${p.topic} (${p.difficulty})</li>`
  ).join("");

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `DevPrep — ${due.length} problems to review today`,
    html: `
      <h2>Your Daily Revision List 🧠</h2>
      <p>You have <strong>${due.length} problems</strong> due for review today:</p>
      <ul>${problemList}</ul>
      <p>Stay consistent. Every review counts.</p>
      <p>— DevPrep</p>
    `,
  });
};