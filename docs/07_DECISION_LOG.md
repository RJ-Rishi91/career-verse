# 07 · Decision Log

**CareerVerse v1.0 · Final · 2026-10-26**
The single record of what's decided, what's switchable, what's still open, and what has been superseded. When something changes, add a row to §6 and update the relevant section. Never delete history.

Labels: **Confirmed** (owner decision) · **Default** (developer default, switchable or tunable in the Command Center) · **Open** (needs an owner decision or evidence).

---

## 1. Owner decisions, 2026-10-26 (Confirmed)

| # | Decision |
|---|---|
| D1 | Build the **whole app in one go** (no phased MVP), using the single-pass build prompt (`01`). |
| D2 | **8 levels.** |
| D3 | Ladder: **Trainee Associate → Associate → Senior Associate → Executive Associate → Assistant Team Lead → Team Lead → Manager (probationary) → Manager.** |
| D4 | **Database-backed accounts:** sign up, verify, log in, log out, log out everywhere, recovery; 2FA for admins. |
| D5 | **Master Admin Command Center** with all-commander access and a versioned tweak facility. |
| D6 | **Duolingo-inspired** learning loop and motivation, within CareerVerse's rules (`02` §11). |
| D7 | Team leadership starts at **Level 5 (ATL)**. |
| D8 | **Seeded option order** per career and node; **"option n of N"**, the last option must be said. |
| D9 | **100 badges** in 12 categories, including streak badges at **30, 60, 90, 180 and 365 days** (plus 3, 7 and 14). |
| D10 | **Appreciation and recognition:** client thank-you notes and recommendations, mentor and agency shout-outs, teammate thanks, **Top Voice** (monthly, LinkedIn-style), **Employee of the Month**, preset **kudos**. |
| D11 | **Time-aware greetings** in the player's local time, with context lines. |
| D12 | **Leaderboard, top 30** (weekly, monthly, all-time). Opt-in, quality-based Career Points, daily cap. |

## 2. Foundational decisions still in force (Confirmed, from the original requirement rounds)

**Product**
- Audience: employees and general learners. Entertainment and communication learning are both core.
- Browser-first, mobile-friendly, English. Visual-novel presentation with portraits and expressions.
- Business simulation plus narrative. Sessions of 10–20 minutes.
- **No runtime AI.**
- Monetization undecided. No real money or ads in v1.0.

**Consequences**
- One persistent career. No practice mode that changes the career. Replay is review-only.
- Committed decisions are irreversible. History, incidents, demotions and outcomes persist.
- Recovery is earned and never erases the original event. No exploits.

**Choices**
- 2–4 options per decision, shown one at a time. A skipped option is gone.
- A preview or confirmation before committing.
- A deterministic, authored branch graph.
- A brief reaction after each reply; a detailed scorecard after each call.

**Clients**
- Distinct profiles with persistent history.
- Separate trust, respect and anger, with client-specific starting values.
- Weighted account health with critical overrides.
- On track / Watch / At risk, always with a text label.
- Thoughts are clues, not answers.
- Instruction, status update and feedback calls per client.

**Career**
- A boss every level. Promotion needs several gates; XP alone never promotes.
- Demotion depends on severity and sustained performance.
- Multiple endings drawn from your whole history.
- Client counts L1 = 3, L2 = 4, L3 = 5, L4 = 8, then 10 per level.

**Learning**
- The 7Cs, scored individually with weights and critical rules.
- Communication and business scored separately. Partial credit.
- Vocabulary and email interpretation integrated.
- Insurance first, with mandatory authority and accuracy guardrails.

**Rewards**
- XP = completion + performance. Coins from performance.
- Evidence-based badges.
- Limited streak freezes; one qualifying activity per day.
- Cosmetics and limited utility. No pay-to-win.
- Notifications opt-in.

**Technical and UX**
- Custom backend; content and rules in the database.
- Server-authoritative state. Transactional, idempotent decisions and rewards.
- Least privilege. Privacy-minimal analytics.
- Draft → review → publish, with validation.
- Progressive navigation.
- Accessibility: keyboard, focus, text size, reduced motion, status never by colour alone.
- Performance budgets measured. Opt-in feedback.

## 3. Proposals: final status

| # | Proposal | Status |
|---|---|---|
| P1 | Failure policy | **Default:** probation → 2 remediation calls → boss variant; demotion after a second failed probation or two open severe incidents. Alternative "rank vs chapter" behind a flag. |
| P2 | Lock-in sheet on every decision vs consequential only | **Default:** every decision. Alternative behind a flag. |
| P3 | Seeded option order | **Confirmed** (D8) |
| P4 | Option exhaustion rule | **Confirmed** (D8) |
| P5 | Anchored 7C rubric | **Default:** rubric in `06` §3; tunable weights. |
| P6 | Reserved `org_id` | **Default:** nullable column, no tenancy UI. |
| P7 | Cobalt accent `#2459E0` | **Default:** editable in Theme (the design-taste kit's alternative was deep teal `#1B6E66`). |

## 4. Tunable defaults (Default; edit in the Command Center, versioned)

All are placeholders until playtesting.
- 7C weights (Correct 1.5×) and level cuts (Strong ≥ 2.5, Good ≥ 1.5).
- Critical cap: 40.
- Account health cut-offs: On track ≥ 70, Watch ≥ 40.
- Portfolio Good ≥ 65. Team health Good ≥ 65.
- XP thresholds per level: 500 / 1,100 / 1,900 / 3,200 / 4,800 / 6,800 / 9,200 / 12,000.
- Base XP by scenario type, level multipliers, coins, shop prices.
- Freezes: hold 2 at most, price 60.
- Quests: 3 per day.
- Top Voice: ≥ 12 calls, communication 85, business 80, Courteous 2.5.
- Employee of the Month title groups.
- Career Points weights; daily cap of 4.
- Greeting lines and bands.
- Thought unlocks: trust 6 and trust 8.
- Anger cooldown: 1 per day.

## 5. Open (needs an owner decision or evidence)

| # | Topic |
|---|---|
| O1 | Final stack versions and auth library (the agent verifies and pins them at build time; recommended TypeScript, Next.js, PostgreSQL 16). |
| O2 | Hosting provider, region, email provider, error monitoring. |
| O3 | Legal text: terms and privacy policy. |
| O4 | An insurance subject-matter reviewer for every scenario before publishing (Level 1 is ready for review). |
| O5 | Who writes Levels 2–8 (271 draft slots), and on what schedule. |
| O6 | Final character art: a 5-expression set per character in the flat style. |
| O7 | Monetization model (none in v1.0). |
| O8 | Localisation approach for future UK and Austria content. |
| O9 | Whether Night Owl or other time-of-day badges should ever exist (currently excluded for wellbeing; Early Bird exists). |
| O10 | Performance budgets per target device (starting target: first interactive ≈ 3s on a mid-range phone). |

## 6. Superseded (history)

| Earlier | Replaced by |
|---|---|
| 30-level vision; Levels 1–10 detailed first | 8 levels (D2) |
| Ladder VA → … → Senior Manager → Domain Head | Trainee Associate → … → Manager (D3) |
| MVP of 3 levels, vertical slice, phased roadmap | Whole app in one build (D1) |
| Leadership from Level 10 | From Level 5 (D7) |
| "Basic private admin workflow" | Master Admin Command Center (D5) |
| Social features post-MVP; no leaderboards | Opt-in top 30 leaderboard and preset kudos now; friends and feeds still out (D12) |
| 24 badges | 100 badges (D9) |
| Market sequence US → Canada → UK → Austria inside the career | US first with Canadian clients; UK and Austria as future expansions (O8) |
| Freelancers as a shop utility | Out of scope for v1.0 |
| Docs 01–07, the old master brief, 08 design brief, 09 frontend spec, 10 open proposals | v1.0 docs 01–07 |

## 7. Change log

| Date | Change | By |
|---|---|---|
| 2026-10-26 | v1.0 bundle: decisions D1–D12 recorded; proposals settled; docs consolidated into 01–07 | Owner + developer |
