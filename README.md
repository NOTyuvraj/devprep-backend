# DevPrep 🧠

A full-stack DSA preparation app that uses **spaced repetition** to help you retain LeetCode solutions long-term.

🌐 **Live:** [dev-prep-black.vercel.app](https://dev-prep-black.vercel.app)

---

## Features

- **Google OAuth + JWT Auth** — Sign in with Google or email/password
- **Chrome Extension** — Detects the active LeetCode problem and saves it with a confidence score (1–5)
- **SM-2 Spaced Repetition** — Schedules each problem's next review date based on your confidence score
- **Daily Email Digest** — Sends a personalized email every morning with problems due for review
- **AI Insights** — Analyzes your weak topics using Groq LLaMA and gives actionable feedback
- **Dashboard** — Visualizes weak topics by confidence, shows due problems, and tracks total progress

---

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | Passport.js, JWT, Google OAuth 2.0 |
| AI | Groq SDK (LLaMA) |
| Email | Nodemailer + Gmail |
| Cron | cron-job.org → REST endpoint |
| Frontend | React + Vite, Recharts |
| Extension | Chrome Extension (Manifest V3) |
| Deployment | Render (backend), Vercel (frontend) |

---

## Architecture

```
Chrome Extension
      │  (Bearer JWT)
      ▼
Express REST API  ──►  MongoDB Atlas
      │
      ├── Google OAuth 2.0 (Passport)
      ├── SM-2 Algorithm (spaced repetition)
      ├── Groq AI (insights)
      └── Nodemailer (daily digest)
            ▲
     cron-job.org (daily trigger)
```

---

## How Spaced Repetition Works

Each saved problem runs through the **SM-2 algorithm**:

- Confidence score **1–2** → review again tomorrow
- Confidence score **3** → review in a few days
- Confidence score **4–5** → interval grows exponentially (weeks/months)

The easiness factor adjusts over time based on your performance, making it harder to forget problems you've struggled with.

---

## Project Structure

```
devprep-backend/
├── config/          # DB, env, Passport setup
├── controllers/     # Route handlers
├── middleware/      # JWT auth middleware
├── models/          # Mongoose schemas
├── routes/          # Express routers
├── services/        # Business logic (SM-2, email, AI, cron)
├── utils/           # Token generation
├── validators/      # Input validation
└── devprep-extension/  # Chrome extension source
```

---

## Local Setup

```bash
git clone https://github.com/NOTyuvraj/devprep-backend
cd devprep-backend
npm install
```

Create `config/config.env`:

```env
MONGO_URI=
JWT_SECRET=
SESSION_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
CLIENT_URL=http://localhost:5173
GROQ_API_KEY=
EMAIL_USER=
EMAIL_PASS=
CRON_SECRET=
APP_URL=http://localhost:5001
```

```bash
npm run dev
```

---

## Chrome Extension Setup

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `devprep-extension/` folder
4. Navigate to any LeetCode problem page
5. Log in via the web app → copy your token from the Dashboard → paste it into the extension

---

## Deployment

| Service | Platform |
|---|---|
| Backend | [Render](https://render.com) (free tier) |
| Frontend | [Vercel](https://vercel.com) (free tier) |
| Cron | [cron-job.org](https://cron-job.org) (free) |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier) |

---

## Author

**Yuvraj** — [github.com/NOTyuvraj](https://github.com/NOTyuvraj)