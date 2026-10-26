# 02 · Product and Game Design

**CareerVerse v1.0 · Final · 2026-10-26**
This document is the single product reference. It replaces the earlier product, gameplay, content, architecture, UX and roadmap documents and the old master brief. Exact formulas and build instructions live in `01_MASTER_BUILD_PROMPT.md`; this document explains **what** the product is and **why**.

---

## 1. Product in one paragraph

CareerVerse is a browser-first, mobile-friendly career simulation in English. The player starts as a **Trainee Associate** at an insurance agency and rises through **8 levels** to **Manager** by handling client calls, email missions and, from Level 5, a team. Every reply is chosen from authored options, shown one at a time, and is **final**. Clients remember what you said. The game teaches clear, accurate, professional communication (the 7Cs) and sound judgment within your authority. It's equal parts entertainment and learning, with no AI at runtime.

## 2. Audience and purpose

- **Audience:** working employees and general learners, including people building workplace English and people new to insurance operations or service roles.
- **Purpose:** entertainment and communication learning are both core. Neither is allowed to become a quiz or a chore.
- **Sessions:** 10–20 minutes, made of 3–5 minute calls.
- **Platforms:** modern major browsers on desktop and mobile. No native app.
- **Language:** English (US first; Canadian clients appear in the roster).

## 3. Presentation

A premium business-simulation and visual-novel look. The frame is a bright, young, corporate workspace (white with soft blue-grey panels, one cobalt accent for progress, near-black primary buttons). Its personality comes from **people**: each client has a pastel identity colour and a flat portrait with five expressions (neutral, worried, pleased, relieved, frustrated) that react to your replies. See `03_DESIGN_SYSTEM.md`.

## 4. Career ladder (8 levels)

| Level | Title | Clients | Team | What you learn | Capstone (boss) |
|---|---|---|---|---|---|
| 1 | Trainee Associate | 3 | — | Clear status updates, asking for missing information, staying within authority | First review with Rosa |
| 2 | Associate | 4 | — | Certificates, renewals, deadlines, email missions | A renewal at risk |
| 3 | Senior Associate | 5 | — | Claims coordination, carriers and adjusters, incomplete facts | The incomplete claim |
| 4 | Executive Associate | 8 | — | De-escalation, empathy under pressure, prioritising several accounts | Two escalations at once |
| 5 | Assistant Team Lead (ATL) | 10 | 2 | Delegating routine work, quality checks, covering gaps | A teammate's error |
| 6 | Team Lead (TL) | 10 | 4 | Coaching (diagnose, coach, follow up), workload balance, feedback | The hard day |
| 7 | Manager (probationary) | 10 | 8 | Capacity planning, retention conversations, reporting upward | Quarterly review with Grace |
| 8 | Manager | 10 | 10 | Account recovery, strategic trade-offs, judgment under pressure | The finale |

Titles, counts, thresholds and gates are seed defaults that can be edited in the Command Center. **XP alone never promotes.** Promotion needs every required node complete, the XP threshold, portfolio health Good or better, no open severe incident and a passed boss (plus team health from Level 5). The career ends with one of several **endings** chosen from your whole history.

### Cast
- **Rosa Delgado:** your Team Lead and mentor in Levels 1–4. Her rule: *fact, then status, then the next step with a time.*
- **Grace Okafor:** the agency owner, in Levels 7–8.
- **Devon Park:** a fellow associate and friendly rival.
- **60 clients** across the 8 levels (agency staff who rely on you). Each has a persona style (direct, warm, detail, anxious, skeptical, busy, formal or collaborative), preferences, a trigger, and thoughts that unlock with trust.
- **10 teammates** from Level 5, each with skill, reliability, workload and morale.

## 5. How a call works

1. A pre-call **brief**: the client, the goal, what you know.
2. The client speaks.
3. You see **one reply at a time**, labelled "option n of N". You can say it, or skip to the next. **Skipped replies never come back.** The last option must be said. The order is seeded per career, so the best reply isn't always last.
4. Before a reply is committed, the **lock-in sheet** shows it and warns that it can't be taken back. (Whether every decision or only big decisions get the sheet is a switch in the Command Center; the default is every decision.)
5. The server saves the reply. Only then does the UI say "Saved".
6. The client **reacts**: a line, an expression, and changes to trust, respect and anger.
7. After 2–3 decisions, the **scorecard** shows communication (the 7Cs) and business scores separately, coaching (what worked, what to try next, why it mattered) and a rule of thumb. Then **rewards**.

Branches are authored and deterministic: what you said decides the next node. A **critical mistake** (e.g. promising beyond your authority, confirming coverage that only the carrier can confirm) caps the business score and opens an incident. A **recovery** later in the same call is rewarded and recorded, but history keeps both.

## 6. Client systems

- **Meters per client:** trust, respect, anger (0–10), with client-specific starting values.
- **Account health:** weighted from the meters, giving **On track / Watch / At risk**, always shown with a text label. An open severe incident forces At risk.
- **Portfolio health:** importance-weighted across your clients. It's a promotion gate.
- **Client cycle:** every client has an instruction call, a status-update call and a feedback call. From Level 2, email missions sit inside the cycle.
- **Thoughts:** clues (never answers) that unlock at trust 6 and trust 8.
- **History:** a permanent timeline per client.

## 7. The loops

| Loop | Length | What happens |
|---|---|---|
| Reply | Seconds | Line → reveal → say → reaction |
| Call | 3–5 min | Brief → decisions → scorecard → rewards |
| Session | 10–20 min | Greeting → daily goal ring → 2–4 nodes → quests tick → streak extends |
| Client | Days | Instruction → status update → feedback; relationship and thoughts evolve |
| Level | Weeks | Path complete → gates → boss → review → promotion ceremony (or probation) |
| Career | Months | 8 titles → team from Level 5 → finale → ending |
| Meta | Ongoing | 100 badges, appreciation, Top Voice, leaderboard, quests, glossary, review mode |

## 8. Consequences, failure and recovery

- **No undo.** One attempt per scenario. Committed replies, incidents, demotions and outcomes persist.
- **Recovery is earned:** a correction on the call, a turnaround with a client, a remediation path. It adds to history and never erases it.
- **Failure (default policy):** a failed boss or gate leads to **probation** at the same title, then 2 remediation calls, then a **boss variant**. A second failed probation or two open severe incidents leads to demotion by one title. The policy is switchable in the Command Center.
- **Review mode:** replay any completed call read-only, with the best path and coaching. It earns nothing and changes nothing.

## 9. Learning design

- **The 7Cs:** Clear, Concise, Concrete, Correct, Coherent, Complete, Courteous. Each is scored 0–3 per reply against an anchored rubric (`06_CONTENT_AUTHORING_GUIDE.md`), weighted (Correct 1.5×), with critical-failure rules.
- **Two scores:** communication quality and business effectiveness are always separate.
- **Partial credit:** several reasonable replies can score well; the best reply isn't the only acceptable one.
- **Recognition, honestly framed:** players choose among authored replies, so the game builds the ability to *recognise and choose* effective communication. Marketing must not claim it teaches free writing.
- **Vocabulary and email:** a personal glossary built from terms met in calls, practised with spaced repetition. Email missions train reading for intent, facts and risk.
- **Coaching voice:** what worked first, then one thing to try next, then why it mattered.

## 10. Insurance domain and guardrails

- **Domain:** insurance agency operations: certificates of insurance, endorsements, renewals, claims, carriers, underwriters, adjusters.
- **Role:** the player works for agencies and never acts beyond that role's authority.
- **Guardrails:**
  - Never teach or present binding coverage, confirming coverage, approving claims or promising premiums as acceptable.
  - Scenarios are educational simulations, not insurance advice.
  - Every scenario needs insurance subject-matter review before it's published.
- **Markets:** the US first, with Canadian clients in the roster. UK and Austria are future content expansions; localisation scope is an open question.

## 11. Motivation (Duolingo-inspired, CareerVerse-shaped)

**Adopted:**
- The **Career Path** home: a vertical trail of nodes per level, with a boss and a promotion milestone.
- Bite-sized calls and instant feedback.
- Celebration screens.
- A daily goal (Light 1, Steady 2 or Driven 4 per day).
- Streaks with limited freezes, and a streak calendar.
- Daily quests.
- A mentor character and a recurring cast.
- Tiered achievements.
- Opt-in reminders.
- An opt-in **top 30 leaderboard**.

**Adapted:**
- Practice becomes **review mode**.
- Vocabulary practice becomes **glossary recall**, which counts toward the daily goal only.
- Mistakes are collected in the journal's "Lessons learned".

**Rejected:**
- Hearts or energy limits.
- Promotion and demotion leagues.
- Social feeds.
- Free-text messages between players.
- Paid currency.
- Ads.
- Retrying a call to improve the score.

Duolingo's look, mascot, art and sounds are not copied.

## 12. Recognition and community

- **100 badges** in 12 categories, including streak badges at 3, 7, 14, **30, 60, 90, 180 and 365 days**, Master Communicator, Problem Solver, Trusted, Straight Shooter, Coach and more. Badges are evidence-based, tiered and sometimes secret.
- **Appreciation:**
  - Client thank-you notes and recommendations, written to match each client's persona.
  - Shout-outs from the mentor and the agency owner.
  - Thanks from teammates.
  - All of these appear on an appreciation wall.
- **Top Voice:** a monthly recognition for everyone who qualifies, LinkedIn-style, with category versions (Claims, Renewals, Certificates, Leadership).
- **Employee of the Month:** one per title group.
- **Kudos:** six preset types (no free text), 3 per day, one per person per week, only between opted-in players.
- **Leaderboard:** the top 30 for the week, the month and all time.
  - Ranks by **Career Points**, which reward quality.
  - Only the first 4 calls a day count.
  - Opt-in, under a public handle.
  - Every player always sees their own rank.
- **Greetings:** written lines matched to the player's local time ("Up late, Alex?", "Early bird, Alex.", "Night owl mode, Alex."), with context lines for comebacks, promotions and streak milestones. Late at night the subline suggests one call and then rest. **Late-night play is never rewarded.**

## 13. Economy

XP is completion credit plus a performance bonus. Coins come from performance, quests and recognitions. The shop sells cosmetics (outfits, desk themes, title frames) and capped streak freezes. **Nothing affects scores, meters, gates or history.** No real money and no ads in v1.0. Monetization is undecided.

## 14. Admin and operations

A private **Master Admin Command Center**:
- **People:** manage users and careers.
- **Tuning:** every rule and number lives in a versioned config, with simulate-before-publish. Changes apply to future calls only.
- **Content:** a CMS with a branch graph view, preview, and draft → review → publish.
- **Recognition and moderation:** recognitions and the leaderboard.
- **Records:** every admin action is audited. Career adjustments are added as events, never by rewriting history.

## 15. Privacy and accessibility

- **Privacy:**
  - Minimal data.
  - No dialogue text in analytics.
  - Reminders, feedback, the leaderboard and kudos are all opt-in.
  - Data export and account deletion.
- **Accessibility:**
  - Keyboard access and visible focus.
  - 4.5:1 text contrast.
  - Status never shown by colour alone.
  - Adjustable text size (up to 200%).
  - Reduced motion.
  - 44px touch targets.

## 16. Content status (v1.0)

- **Level 1 is fully written:** 11 scenarios, awaiting insurance-domain review.
- **Levels 2–8:** 271 draft slots. Clients, objectives, order and prerequisites are all defined; the scenarios themselves are written in the CMS.
- Drafts are never playable. Players who reach unwritten content see "Next chapter coming soon" and keep their progress.

## 17. Suggested success measures (to validate after launch)

These are suggestions, not targets backed by evidence:
- Level completion and drop-off per node.
- Day-7 and day-30 return rates.
- Change in average communication score across a player's first 20 calls.
- Incident rate per level.
- Share of players who opt in to the leaderboard.
- Accessibility issues reported.

## 18. Out of scope for v1.0

- Runtime AI.
- Native apps.
- Real-money purchases or ads.
- Free-text player messaging and social feeds.
- Friends and shared careers.
- Freelancers.
- UK and Austria content.
- Multi-tenant organisations (the `org_id` field is reserved, but there's no UI for it).
