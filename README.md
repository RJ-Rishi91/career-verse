# CareerVerse — Virtual Assistant English & Business Career Simulation Game

[![Deploy to GitHub Pages](https://github.com/RJ-Rishi91/career-verse/actions/workflows/deploy.yml/badge.svg)](https://github.com/RJ-Rishi91/career-verse/actions/workflows/deploy.yml)
[![Live on career-verse.onerishi.in](https://img.shields.io/badge/Live-career--verse.onerishi.in-blue)](https://career-verse.onerishi.in)

> **Live Production URL:** [https://career-verse.onerishi.in](https://career-verse.onerishi.in)  
> **GitHub Pages Backup URL:** [https://rj-rishi91.github.io/career-verse/](https://rj-rishi91.github.io/career-verse/)

CareerVerse is an interactive web app simulation game where players step into the shoes of a Virtual Assistant (VA) navigating high-stakes corporate communication, client relationship management, and regulatory boundaries in an insurance agency setting.

---

## Architecture & Tech Stack (MERN)

- **Frontend:** React 18 + TypeScript + Vite
  - Designed for dual form factors: **Mobile-friendly UI** (Phone band < 641px) and **Desktop-friendly UI** (Desktop band ≥ 1100px) with responsive container queries (`@container cv`).
  - Google Fonts: `Instrument Sans` and `Instrument Serif`.
  - Design tokens from `08_DESIGN_BRIEF.md` and `tokens.json`.
  - Smooth vector Lottie animations (`lottie-web` SVG player): `saving-dots`, `success-check`, `call-pulse`, `badge-burst`, `confetti`, `xp-spark`.
  - Interactive Layout Switcher (`Auto`, `Phone (390px)`, `Desktop (1280px)`, `Reset Demo`) for instant layout evaluation on any screen.
  - Hosted on **GitHub Pages** with custom domain `career-verse.onerishi.in`.
- **Backend:** Node.js + Express + TypeScript
  - Server-authoritative state machine, transactional decision commit with idempotency keys (`Idempotency-Key` UUID).
  - Deterministic 7Cs scoring engine (Clear, Concise, Concrete, Correct, Coherent, Complete, Courteous).
  - Ready for 1-click deployment on **Render** (via `render.yaml` or `Dockerfile`).
- **Database:** MongoDB & Mongoose
  - Supports **MongoDB Atlas** in production and local MongoDB (`mongodb://localhost:27017/careerverse`).
  - Automatic in-memory persistence fallback if MongoDB is temporarily offline during development.

---

## Game Loops & Screens

1. **Desk Screen (`#/desk`):**
   - Dynamic morning greeting based on active scenario and client status.
   - 4-KPI strip: XP progress to Level 2, Calls completed, Portfolio health, Streak days.
   - Next call card: Marcus Bell status update with pulsing avatar ring, goal, and skill tags.
   - Clients summary with real-time trust meters and status pills (`On track`, `Watch`, `At risk`).
   - Promotion review gates (Calls complete, XP threshold, Portfolio health, Boss review).
   - Today section with call tasks and agency inbox messages.

2. **Call Screen (`#/call`):**
   - View bar with pause button and live saving indicator ("Saving…" / "Saved").
   - **Mobile UI:** Single column with collapsible brief, 236px stage with mood tint, portrait, floating meters card, overlapping dialogue bubble, choice panel with option pips, and lock-in bottom sheet.
   - **Desktop UI:** Focus mode with 3 columns:
     - Left (280px): Call brief (goal, what you know timeline, client preferences).
     - Center: 320px Stage with mood tint, portrait, dialogue bubble, and choice panel.
     - Right (260px): Real-time relationship meters with deltas + call progress counter.
   - Consequential decision lock-in sheet / modal warning: *"Once it's said, it can't be taken back."*
   - Strict sequential presentation (server sends only visible option). Skipped options are gone.
   - Reaction state with mood transition, portrait expression update, relationship deltas, and toast confirmation.

3. **Scorecard Screen (`#/score`):**
   - Communication score /100 and Business score /100 (capped at 40 if a critical boundary error occurs).
   - Incident alert box for mistakes beyond authority.
   - Complete 7Cs breakdown table with 3-segment progress bars, level pills (`Strong`, `Good`, `Needs work`), and explanation why.
   - Coach's notes: What worked, Try next time, Why it mattered, and Rule of thumb.
   - Client account impact card with trust/respect/anger deltas.

4. **Rewards Screen (`#/rewards`):**
   - Straight Shooter badge celebration with burst & confetti Lottie animations.
   - Animated XP progress bar filling up with XP spark animation.
   - Coins gain, streak increment, calls count.
   - Up next teaser card for Dana Whitfield.

5. **Clients Screen (`#/clients` and `#/client/:id`):**
   - Full client roster (Marcus Bell, Dana Whitfield, Priya Raman).
   - Desktop 2-column split (list on left, detail on right); mobile transitions to detail with back button.
   - Hero header with client tint, role, status pill, and reactive portrait.
   - **Overview Tab:** Relationship meters, "What client is thinking" (unlocked at Trust ≥ 6), Preferences chips, and 3-call client cycle.
   - **History Tab:** Permanent immutable event timeline of calls, emails, and account records.

---

## Running Locally

### 1. Prerequisites
- Node.js v18+ (tested on Node v22)
- npm v9+
- Optional: MongoDB running locally or a MongoDB Atlas URI

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Start Backend & Frontend Concurrently
```bash
npm run dev
```
- Client runs on `http://localhost:5173`
- Server runs on `http://localhost:5001`
- Proxies `/api` requests to backend automatically.

Alternatively, run them separately:
```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend
npm run dev:client
```

---

## Deploying to Production

### 1. Frontend to GitHub Pages
The frontend is already configured to publish to GitHub Pages with the custom domain `career-verse.onerishi.in`.

To deploy manually at any time:
```bash
npm run deploy:gh-pages
```
Or push to `main` — the included GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically builds and deploys to the `gh-pages` branch.

### 2. Backend to Render
1. Push this repository to GitHub.
2. Log into [Render](https://render.com) and create a **New Web Service** pointing to this repository.
3. Configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. In **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: your MongoDB Atlas connection string (`mongodb+srv://...`)
5. Once deployed, set `VITE_API_URL` in `client/.env.production` (or GitHub Actions secret) to your Render backend URL (e.g. `https://careerverse-api.onrender.com/api`).
