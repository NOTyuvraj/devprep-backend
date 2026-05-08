import nodemailer from "nodemailer";
import { getDueProblems } from "./problem.service.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendDailyDigest = async (user) => {
  try {
    if (!user || !user.emailDigest) {
      return;
    }

    const due = await getDueProblems(user._id);

    if (!due || due.length === 0) {
      console.log(`No due problems for ${user.email}`);
      return;
    }

    const problemList = due
      .map(
        (p) => `
        <li>
          <a href="${p.url}">
            ${p.title}
          </a>
          — ${p.topic} (${p.difficulty})
        </li>
      `,
      )
      .join("");

    const unsubscribeLink =
      `${process.env.APP_URL}` + `/api/email/unsubscribe?user=${user._id}`;

    await transporter.sendMail({
      from: `"DevPrep" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `DevPrep — ${due.length} problems to review today`,
      html: `
        <div style="font-family:sans-serif;">
          <h2>Your Daily Revision List 🧠</h2>

          <p>
            You have
            <strong>${due.length} problems</strong>
            due for review today.
          </p>

          <ul>
            ${problemList}
          </ul>

          <p>
            Stay consistent. Every review counts.
          </p>

          <hr />

          <p style="font-size:12px;color:#666;">
            Don't want these emails?
            <a href="${unsubscribeLink}">
              Unsubscribe
            </a>
          </p>

          <p>— DevPrep</p>
        </div>
      `,
    });

    console.log(`Email sent to ${user.email}`);
  } catch (err) {
    console.error(`Email failed for ${user?.email}`);

    console.error(err.message);
  }
};
