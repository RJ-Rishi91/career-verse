# 01 · Master Build Prompt (single pass)

**CareerVerse v1.0 · Final · 2026-10-26**

> **Give this whole file to Antigravity as one task.** Build the complete product in one continuous run. There are no phases and no review stops: you keep working through the **Build Loop** (§3) until every item in the **Release Checklist** (§20) passes. Ask the owner only if you are truly blocked; otherwise decide, log the decision in `BUILD_LOG.md`, make it configurable in the Command Center, and continue.
>
> This is the authoritative build task. Docs `02`–`07` are consistent with it; if anything ever disagrees, this file wins and the other doc gets corrected.

---

## 0. What you are building

**CareerVerse** is a browser-first, mobile-friendly career simulation. Players start as a **Trainee Associate** at an insurance agency and rise through **8 levels** to **Manager** by handling client calls, email missions and, later, a team. Every reply is chosen from authored options, shown one at a time, and is **final**. The game teaches clear, accurate, professional communication (the 7Cs) and sound judgment within one's authority.

You will deliver, in one run:
1. The complete player app: every page in §10, phone and desktop.
2. Database-backed accounts: sign up, verify, log in, log out, log out everywhere, recovery, 2FA for admins.
3. The complete game: all systems in §8 working for all 8 levels.
4. The **Master Admin Command Center** with all-commander access and a versioned tweak facility (§11).
5. Tests, seed data, deployment configuration and runbooks (§17–§19).

---

## 1. Repository inputs (already present; use them)

| Path | Use |
|---|---|
| `AGENTS.md` | Hard rules and definition of done |
| `docs/02_PRODUCT_AND_GAME_DESIGN.md` | What the product is and why |
| `docs/03_DESIGN_SYSTEM.md`, `tokens/tokens.css`, `tokens/tokens.json` | The visual system. Don't invent colours, radii or type sizes. |
| `docs/04_FRONTEND_SPEC.md` | Layout bands, call state machine, API contract, UI states, Lottie catalogue, component map, acceptance tests |
| `docs/05_DATABASE.md`, `db/schema.sql` | **The database:** 55 tables, constraints, append-only triggers, views. Tested on PostgreSQL 16. |
| `db/seed.sql`, `db/tests/smoke.sql` | Generated reference data and integrity tests (both pass) |
| `docs/06_CONTENT_AUTHORING_GUIDE.md` | Scenario format, 7C rubric, critical flags, tags, guardrails, review and publish |
| `docs/07_DECISION_LOG.md` | Decisions (confirmed, default, open, superseded) |
| `setup/game/*.json` | **Complete game setup** for all 8 levels (§7) |
| `content/schema/scenario.schema.json`, `content/scenarios/*.json` | Scenario format and the fully written Level 1 (11 scenarios) |
| `tools/validate-content.mjs`, `tools/build-seed.mjs` | Validator and seed builder (no dependencies) |
| `setup/.env.example`, `setup/docker-compose.yml` | Environment and local services (Postgres 16, Mailpit) |
| `design/prototype/` | Runnable reference for layout and behaviour (phone + desktop, greetings, leaderboard). Port behaviour and look; don't port its client-side scoring. |
| `design/maps/` | Pages, question and qualifier maps |
| `lottie/`, `assets/` | Six Lottie animations, brand mark, **100 badge SVGs** (`assets/badges/<id>.svg`), 15 portrait SVGs |

---

## 2. Owner decisions (approved 2026-10-26) and proposal status

These are recorded in `docs/07_DECISION_LOG.md`. Keep that file updated with any new decision or default you introduce.

| # | Decision |
|---|---|
| D1 | Build the **whole app in one go**; no phased MVP. |
| D2 | **8 levels.** |
| D3 | Ladder: **Trainee Associate → Associate → Senior Associate → Executive Associate → Assistant Team Lead (ATL) → Team Lead (TL) → Manager (probationary, L7) → Manager (L8).** All titles editable in admin. |
| D4 | **Database-backed accounts** with log in and log out. |
| D5 | **Master Admin Command Center** with all-commander access and a live tweak facility. |
| D6 | **Duolingo as inspiration** for the learning loop and motivation (§9), within this product's rules. |
| D7 | Team leadership starts at **ATL (Level 5)**. |
| D8 | Adopt **P3** (seeded option order) and **P4** (exhaustion rule). |
| D9 | **100 badges** across 12 categories, including streak badges at 3, 7, 14, **30, 60, 90, 180 (six months) and 365 days (one year)**. |
| D10 | **Appreciation:** client thank-you notes and recommendations, mentor and agency shout-outs, teammate thanks, **Top Voice** (monthly, LinkedIn-style), **Employee of the Month**, and preset peer **kudos**. |
| D11 | **Time-aware greetings** in the player's local time ("Up late, {name}?", "Early bird, {name}.", "Night owl mode, {name}."), plus contextual greetings. |
| D12 | A **leaderboard: top 30** (weekly, monthly, all-time). This supersedes the earlier "no leaderboards" rule, with the guardrails in §8.17. |

Switchable in the Command Center (`feature_flags`). Build both behaviours; defaults shown (see `docs/07_DECISION_LOG.md` §3):
- **P1** failure policy: default **probation → 2 remediation calls → boss variant**; alternative "rank vs chapter".
- **P2** lock-in: default **every decision** opens the lock-in sheet; alternative "consequential only".
- **P5** rubric fields: stored and shown to authors. **P6** `users.org_id` exists, no tenancy UI. **P7** cobalt accent, editable in Theme.

---

## 3. The Build Loop (how you work)

Repeat until the Release Checklist (§20) is fully green:

```
1. PICK   the next unfinished module from §6 (respect "depends on").
2. SPEC   write its acceptance tests first (unit + integration + e2e where relevant).
3. BUILD  implement the smallest slice that can pass them.
4. GATE   run the full gate suite:
            pnpm typecheck && pnpm lint
            pnpm test           (unit + integration, includes engine tests)
            pnpm content:validate   (node tools/validate-content.mjs)
            pnpm db:smoke       (psql -f db/tests/smoke.sql against a fresh DB)
            pnpm e2e            (Playwright, phone 390×844 and desktop 1440×900)
            pnpm a11y           (axe-core on every route: zero serious/critical)
            pnpm audit:ai       (fails if any AI SDK is installed or any AI domain is requested)
5. FIX    if any gate fails: read the failure, fix the cause (not the test), go to 4.
6. RECORD append to BUILD_LOG.md: module, what changed, decisions/defaults, tests added.
7. NEXT   mark the module done in BUILD_LOG.md and go to 1.
When all modules are done: run the Regression Loop: full gate suite + the end-to-end
career run (§17.4) on a fresh database; fix and repeat until two consecutive clean runs.
```

Rules of the loop:
- Never disable, skip or weaken a test to get green. Never mark a module done with a failing gate.
- If a requirement is unclear: choose the safest default consistent with §4, put it behind config, log it, continue.
- Keep `/src/engine` pure (no framework, no DB imports) so it's unit-tested and reused by the admin simulator.
- Commit after every green loop with a message naming the module.

---

## 4. Non-negotiables

1. **No AI at runtime.** No LLM/AI SDK, model call, embedding, or generated dialogue, scoring, reactions, coaching, images or audio, anywhere. All content is authored and stored in the database.
2. **Deterministic.** Same career seed + content version + rules version + choices = same outcome.
3. **Server-authoritative.** Only the server computes scores, XP, coins, badges, meters, gates, promotions and unlocks.
4. **No undo.** One non-review attempt per scenario; one decision per node; idempotency keys; optimistic version checks. Refresh, back, retries, double-clicks and multiple tabs cannot reverse or duplicate anything. (Already enforced by `db/schema.sql`.)
5. **Permanent history.** Append-only events. Recovery and admin actions add events; nothing is deleted or rewritten, including by master admins.
6. **Honest saving.** "Saved" only after a confirmed durable write; an uncertain state while unknown.
7. **Insurance guardrails.** Never teach or present committing beyond authority, confirming coverage, binding, claim approval or premium outcomes. Scenarios are educational simulations, not advice. Critical flags exist for these.
8. **Accessibility.** Keyboard, visible focus, 4.5:1 contrast, status never by colour alone, reduced motion, 44px targets, 200% text.
9. **Privacy.** Minimal data; no dialogue text in analytics; opt-in reminders and feedback; export and delete.
10. **No pay-to-win, no real money, no ads.** Coins are earned only.

---

## 5. Stack and project shape

Developer recommendation; verify current stable versions at build time and pin exact versions.

- **TypeScript (strict)**, **Next.js App Router**, **React**, server actions/route handlers.
- **PostgreSQL 16** using `db/schema.sql` as the source. ORM: Prisma or Drizzle, introspected from the schema. Constraints, partial unique indexes and append-only triggers must exist in migrations (raw SQL if needed).
- **Auth:** DB sessions as §12. Use a maintained library that supports email/password, DB sessions, verification, reset and TOTP, or implement directly. Check maintenance status first; log the choice.
- **Zod** for every input; types generated from or aligned with `content/schema/scenario.schema.json`.
- **Styling:** CSS variables from `tokens/tokens.css`; CSS Modules or Tailwind configured from `tokens/tokens.json`; container queries for layout bands.
- **Animation:** `lottie-web` light SVG player (pinned) + CSS transitions; files from `/lottie`.
- **Email:** transport abstraction; dev = Mailpit; outbox table + worker.
- **Jobs:** a cron/worker process for scheduled jobs (§8.13).
- **Testing:** Vitest, Playwright, axe-core. **Package manager:** pnpm.
- **Forbidden:** AI/LLM SDKs, ad/social SDKs, analytics capturing free text.

```
/app/(public)       /app/(player)       /app/(admin)/admin
/src/engine         pure game engine (scoring, meters, health, gates, xp, streak, quests, delegation, endings, option order)
/src/server         db, auth, permissions, services per module, audit, jobs, email
/src/content        loader, validator (wraps tools/validate-content.mjs rules), publisher
/src/ui             component library from docs/04 §8
/db                 schema.sql, migrations, seed.sql, tests
/setup/game         game setup JSON (seed source; admin edits live in the DB afterwards)
/content            authored scenarios (seed source)
/tests              unit, integration, e2e, a11y
```

Scripts to provide: `setup` (install + compose up + migrate + seed), `dev`, `build`, `start`, `worker`, `test`, `e2e`, `a11y`, `typecheck`, `lint`, `content:validate`, `content:seed` (rebuild seed + load), `db:smoke`, `admin:bootstrap`, `audit:ai`.

---

## 6. Module catalogue (everything that makes it complete)

Build all of these. "Tables" refers to `db/schema.sql`.

| # | Module | Responsibilities | Tables | Depends on |
|---|---|---|---|---|
| 1 | **Platform** | Project setup, env loading, DB client, error handling, logging, secure headers, rate limiter | — | — |
| 2 | **UI kit** | Components from `docs/04` §8, tokens, layout shells (brand bar, view bar, sidebar, bottom nav), Lottie wrapper with reduced motion, toasts, sheets/dialogs, forms with visible labels | — | 1 |
| 3 | **Auth** | Sign up, verify email, log in, log out, log out everywhere, forgot/reset, lockout, sessions, CSRF | users, sessions, auth_tokens, login_attempts | 1 |
| 4 | **Roles & permissions** | Role checks on every server action; permission matrix from `role_permissions`; MFA for admins | role_permissions, user_mfa | 3 |
| 5 | **Profile & settings** | Display name, avatar, daily goal, timezone, accessibility (text size, reduced motion, sound off), reminders opt-in, quiet hours | player_profiles | 3 |
| 6 | **Config service** | Read the active published version of each config kind; cache; version pinning per call | config_versions, feature_flags, levels | 1 |
| 7 | **Content service** | Load scenarios/characters; serve only the visible option; validator; publish/retire workflow; dev auto-publish flag | characters, scenarios, scenario_versions, glossary_terms | 6 |
| 8 | **Game engine** (pure) | Option order, scoring, caps, recovery, meters, account/portfolio/team health, gates, XP/coins, streak, quests, badges, delegation, endings | — | — |
| 9 | **Career service** | Create career (seed), level progress, journal, career reset (archive + new) | careers, level_progress, career_events | 6, 8 |
| 10 | **Call service** | State machine (`docs/04` §4), reveal-next, commit transaction, uncertain-state recovery, review mode (read-only) | call_attempts, decisions, scorecards, client_relationships, incidents, career_events, idempotency_keys | 7, 8, 9 |
| 11 | **Rewards & economy** | Ledger-based XP/coins, award-once, balances cache, purchase flow | reward_ledger, careers | 10 |
| 12 | **Progression** | Gate checks, boss unlock, review, promotion ceremony, probation, remediation, boss variant, demotion | level_progress, careers, career_events | 10, 11 |
| 13 | **Path & desk** | Career Path home, desk, next action, deadlines | (reads) | 9–12 |
| 14 | **Clients** | List, profile, history, thoughts unlock | client_relationships, characters | 10 |
| 15 | **Inbox & email missions** | Email list; mission flow using the call engine with an email presentation | scenarios (email_mission) | 10 |
| 16 | **Streaks & daily goal** | Local-day tracking, freezes, calendar | streaks, streak_days | 11 |
| 17 | **Quests** | Seeded daily assignment, progress, claim | quest_templates, quest_assignments | 11, 16 |
| 18 | **Badges** | Evaluate criteria after scorecards and events; tiers; evidence | badges, badge_awards | 10 |
| 19 | **Shop & inventory** | Cosmetics, freezes (capped), equip | shop_items, inventory | 11 |
| 20 | **Glossary** | Terms met in calls; Leitner spaced repetition; capped XP toward daily goal | glossary_progress | 7, 11 |
| 21 | **Team (L5–8)** | Roster, member profiles, delegation board (deterministic outcomes), coaching and 1:1 via call engine, team health | career_team_members, delegations, delegation_tasks | 10, 12 |
| 22 | **Endings** | Deterministic ending selection after the L8 finale; ending screen | endings, careers | 12 |
| 23 | **Onboarding** | Welcome flow, practice decision (not saved), meet Rosa, first call with tips | player_profiles | 5, 10 |
| 24 | **Notifications** | Opt-in reminder emails respecting quiet hours; email outbox worker | email_outbox | 3, 5 |
| 25 | **Announcements & feedback** | In-app notices; opt-in feedback after calls | announcements, feedback | 3 |
| 26 | **Privacy** | Data export (JSON), account deletion with grace period | data_requests | 3 |
| 27 | **Analytics** | Privacy-minimal events; admin dashboards and funnels | analytics_events, views | 1 |
| 28 | **Command Center** | All admin pages (§11), simulator, adjustments, audit | all + audit_log | 4, 6, 7, 8 |
| 29 | **Jobs** | Scheduled jobs (§8.13) | various | 16, 17, 24, 26 |
| 30 | **Ops** | Health endpoint, backups doc, CI pipeline, deployment config, runbooks | — | all |
| 31 | **Greetings** | Time-band + context greeting and game-state subline per §8.15; admin-editable lines | greeting_lines, config (greetings) | 5, 6 |
| 32 | **Appreciation** | Client, mentor, agency and teammate notes from triggers; appreciation wall; inbox delivery; coins | appreciation_templates, appreciations | 10, 14, 21 |
| 33 | **Recognition** | Monthly Top Voice (general + categories), Employee of the Month, leaderboard finishes; revocation with reason | recognitions | 11, 35 |
| 34 | **Kudos** | Preset peer kudos with limits; hide; badges | kudos_types, kudos, kudos_hidden | 35 |
| 35 | **Leaderboard** | Career Points ledger, live snapshots, period freeze, opt-in public handle, moderation | points_ledger, leaderboard_periods, leaderboard_entries, leaderboard_exclusions, blocked_handle_words | 10, 11 |

---

## 7. Game setup (provided: load it, don't redesign it)

All in `setup/game/` and loaded into the DB by `db/seed.sql`. After seeding, **the DB is the source of truth** and the Command Center edits it (versioned).

| File | Contents |
|---|---|
| `levels.json` | 8 levels: titles, client counts (3, 4, 5, 8, 10, 10, 10, 10), team sizes (0,0,0,0,2,4,8,10), XP thresholds (500 → 12,000), gates, skills, unlocks, boss ids, promotion messages |
| `rules.json` | 7C weights (Correct 1.5×), level cuts, critical flags + severity, cap 40, recovery, account/portfolio/team health formulas and thresholds, thought unlocks, meter limits, anger cooldown, probation policy, option-order seed, lock-in policy |
| `economy.json` | Base XP by scenario type, performance bonus, level multipliers, glossary XP cap, coins, daily goal sizes, streak and freeze rules, quests per day |
| `unlocks.json` | When each navigation item appears |
| `flags.json` | Feature flags incl. P1/P2 switches and dev auto-publish |
| `theme.json` | Accent and client tint pairs (with contrast rule) |
| `permissions.json` | Role → permissions (`master_admin: *`) |
| `cast.json` | Rosa Delgado (mentor, L1–4), Grace Okafor (agency owner, L7–8), Devon Park (rival) |
| `clients.json` | **60 clients** across 8 levels with persona, preferences, trigger, thoughts, portrait parameters, starting meters |
| `teammates.json` | **10 teammates** joining at L5–L8 with skill, reliability, workload, morale |
| `call_slots.json` | **282 scenario slots**: 180 client calls, 57 email missions, 8 bosses, 8 boss variants, 16 remediation calls, 12 team scenarios, onboarding. Order on the Path and prerequisites. |
| `badges.json` | **100 badges** in 12 categories: communication 24 (7Cs × 3 tiers + Master Communicator I–III), problem solving 6, relationships 8, integrity 7, reliability 4, insurance craft 7, **streaks 8 (3, 7, 14, 30, 60, 90, 180, 365 days)**, progression 9, leadership 7, appreciation 10, leaderboard 3, habits 7. Criteria use the closed vocabulary in `badge_metrics.json`. |
| `tags.json` | Option skill tags (e.g. `asked_clarifying`, `fallback_plan`, `stayed_in_authority`) and scenario topic tags (e.g. `coi`, `renewal`, `claim`) that badges and Top Voice categories read |
| `appreciation.json` | 32 client templates (4 triggers × 8 persona styles), 8 mentor/agency shout-outs, 4 teammate thanks, Top Voice rules, Employee of the Month rules, 6 kudos types and limits |
| `greetings.json` | 7 time bands covering 24 hours, 25 band lines, 12 context lines, priority, selection and wellbeing rules |
| `leaderboard.json` | Top 30, periods, Career Points formula, daily cap, ties, opt-in visibility, snapshots, moderation |
| `quests.json` (14), `shop.json` (11), `endings.json` (4), `glossary.json` (30 terms), `delegation_tasks.json` (12) | |

**Authored content:** all 11 Level 1 scenarios are fully written (`content/scenarios/`), status `in_review` (awaiting insurance-domain review). Every other slot is a **draft scaffold**. Requirements:
- Drafts are never playable. In development, `DEV_AUTOPUBLISH_IN_REVIEW=true` makes `in_review` content playable so Level 1 can be tested end to end.
- When a player reaches content that isn't published, show **"Next chapter coming soon"** and keep the career intact.
- Build the admin **authoring tools** so the remaining 271 slots can be written, reviewed and published without code changes.
- You may draft scenario text for Levels 2–8 inside the CMS to speed authoring, but it must stay `draft`, pass the validator, and get human domain review before publishing. Nothing is generated at runtime.

---

## 8. Game systems and loops

### 8.1 The loops (what keeps players coming back)
| Loop | Length | Cycle |
|---|---|---|
| **Reply loop** | Seconds | See client line → reveal options one by one → say one → client reacts, meters move |
| **Call loop** | 3–5 min | Brief → 2–3 decisions → scorecard (7Cs + business + coaching) → rewards |
| **Session loop** | 10–20 min | Open Path → daily goal ring → 2–4 nodes → quests tick → streak extends |
| **Client loop** | Days | Instruction → status update → feedback per client; relationship and thoughts evolve |
| **Level loop** | Weeks | Clear all required nodes → gates → boss → review → promotion ceremony (or probation → remediation → boss variant) |
| **Career loop** | Months | 8 titles → team from L5 → finale → ending chosen from your whole history |
| **Meta loop** | Ongoing | Badges (tiers), quests, streak calendar, shop cosmetics, glossary recall, review mode |

### 8.2 Call engine
Implements `docs/04_FRONTEND_SPEC.md` §4 and `design/maps/question-map.html`. The server sends only the visible option. Option order: `seededOrder(n, career.seed + ':' + scenarioId + ':' + nodeId)` using FNV-1a hash → mulberry32 → Fisher–Yates (same as `design/prototype/app.js`). The last option is labelled and must be said. Lock-in per P2 flag. Commit = one transaction: check session, attempt `row_version`, node, option index; insert decision; update meters (clamped 0–10, max delta 3); open incidents for critical flags (severity from rules; a recovery on the same call downgrades severe → major, both recorded); append events; return the full state. Pause/resume at the same node and index. Review mode replays read-only and writes nothing.

### 8.3 Scoring (per call, server)
- 7C average per C across decisions → level: Strong ≥ 2.5, Good ≥ 1.5, else Needs work.
- Communication = Σ(weight × avg) / Σweights / 3 × 100.
- Business = mean(business levels) / 3 × 100; any critical flag → min(business, cap).
- Coaching: "worked" from the best-ranked chosen option, "next" from the worst, "why" from the critical option if any, else the worst. Rank = business + mean(7C).
- Store `rules_version` and `content_version` on the scorecard. **Never recompute** after a rules change.

### 8.4 Relationships, health, incidents
- Account health = 100 × (0.4·trust + 0.3·respect + 0.3·(10 − anger)) / 10. On track ≥ 70, Watch ≥ 40, else At risk; an open severe incident forces At risk.
- Portfolio health = importance-weighted mean of account health (low 1, medium 2, high 3). Good ≥ 65, Fair ≥ 45.
- Thoughts unlock at trust 6 and at trust 8 (+ Courteous average ≥ 2).
- Anger cools by 1 per local day without contact (job).

### 8.5 Economy
XP = round(base_by_type × level_multiplier) + round(bonus_max × (communication + business) / 200). Coins = base + round(bonus_max × business / 100); boss and promotion bonuses. All via `reward_ledger` (award once). Balances cached on `careers` and checked against `v_wallet_check` nightly.

### 8.6 Progression
Gates per level (`levels.gates`): all required nodes, XP ≥ threshold, portfolio ≥ Good, no open severe incident, boss passed; L5+ team health ≥ Good. **XP alone never promotes.** Boss unlocks when its prerequisites are complete. Boss pass = communication ≥ 60 and business ≥ 60 and no unrecovered critical flag (config). Promotion → ceremony page, title change, unlocks, coins bonus. Failure → P1 policy (default probation: 2 remediation calls, then boss variant; second failed probation or two open severe incidents → demotion by one title; config).

### 8.7 Streaks and daily goal
Local day by profile timezone. One qualifying activity (call, email mission or boss) extends the streak. A missed day consumes a freeze if held (max 2), else resets. Daily goal: light 1, steady 2, driven 4 activities; glossary rounds add XP toward the goal only (capped).

### 8.8 Quests
3 per local day, chosen deterministically from eligible templates (`min_level`, weight) seeded by `career.seed + date`. Progress from events; claim grants the reward once.

### 8.9 Badges (100)
- Criteria: `{"all":[{"metric","op":"gte","value"}]}`. Metric keys come only from `setup/game/badge_metrics.json`; parameters follow a colon (e.g. `c7_strong_calls:concrete`, `option_tag:fallback_plan`, `scenario_tag_calls_comm85:claim`, `longest_streak_days`).
- Implement every metric in the engine as a pure aggregate over career events, scorecards, decisions (with option tags), relationships, streaks, recognitions, kudos and leaderboard finishes.
- Evaluate after each scorecard, event or job that can change a metric. Award once and store the evidence (scenario ids, values, dates).
- Display: `/achievements` grouped by category, with progress toward the next tier. Hidden badges (e.g. Comeback) show as "Secret" until earned. Rarity labels: common, rare, epic.
- Streak badges at 30, 60, 90, 180 and 365 days each get a full-screen celebration (`confetti` once) and a mentor shout-out at 30 days.

### 8.10 Team (L5–8)
Teammates join per `teammates.json` level. Delegation outcome (deterministic): score = skill + reliability − workload/2; success if ≥ complexity + 2, partial if within 2, else returned. Outcomes adjust workload/morale and may affect client meters. Coaching and 1:1s use the call engine with teammates as speakers and update morale/skill. Team health = 100 × (0.5·morale + 0.3·reliability + 0.2·(10 − workload)) / 10 averaged.

### 8.11 Endings
After the L8 finale, check endings by `priority`; the first whose `rule` matches the career aggregates wins.

### 8.12 Glossary
Terms are added when first met in a call. Leitner boxes 1–5 with due dates (1, 2, 4, 8, 16 days). A round = up to 10 due cards.

### 8.13 Scheduled jobs
Every job is idempotent and logged.
- **Every 15 minutes:**
  - Streak rollover and quest assignment for players whose local midnight has passed.
  - Email outbox send, with retries.
  - Leaderboard live snapshot for the weekly, monthly and all-time boards.
- **Daily:**
  - Anger cooldown.
  - Session and token cleanup.
  - Deletion executor after the grace period.
  - Wallet and points integrity check.
  - Analytics rollups.
- **Monday 00:00 UTC:** freeze last week's board, award `top_30` / `podium` / `number_one` badges and `leaderboard_finish` recognitions, then open the new weekly period.
- **1st of the month 00:00 UTC:** freeze the monthly board, award **Top Voice** (general and categories) and **Employee of the Month** per title group, and deliver the agency notes.

### 8.14 Appreciation
- **Client triggers** (`appreciation.json → client_triggers`):
  - `feedback_excellent`: a feedback call with communication ≥ 85 and business ≥ 90.
  - `trust_9`: the first time a client reaches trust 9 (a recommendation).
  - `turnaround`: a client goes from At risk to On track.
  - `cycle_clean`: a client's 3-call cycle finishes with no incidents.
- **Template choice:** by trigger and the client's `persona.style`. Placeholders are filled from the allowed list only.
- **Once-only:** each note is delivered once, keyed by (career, trigger, source_ref). Notes arrive in the inbox as an "Appreciation" item, appear on the profile's **appreciation wall**, and grant the template's coins.
- **Mentor and agency shout-outs:** first Strong on any C, first Master Communicator, first recovery, boss passed, 30-day streak, promotions to Level 5 and Level 7, Top Voice.
- **Teammate thanks (Level 5+):** after a successful delegation, a strong coaching call, a workload rebalance, or a one-to-one.
- **Privacy:** players can hide a note from their wall. History keeps it.

### 8.15 Greetings
- **Time bands:** compute from the profile timezone (refreshed from the browser's `Intl` timezone at each login). The 7 bands cover 24 hours:
  - up late 00:00–04:59
  - early bird 05:00–07:59
  - morning 08:00–11:59
  - midday 12:00–13:59
  - afternoon 14:00–17:59
  - evening 18:00–21:59
  - night owl 22:00–23:59
- **Context lines override band lines** in this priority order:
  1. first session
  2. promoted today
  3. streak milestone today
  4. Top Voice this month
  5. comeback (7+ days away)
  6. Monday morning
  7. Friday afternoon
  8. weekend
- **Line choice:** `hash(userId + localDate + key) mod n`. Deterministic and stable for the band; no AI.
- **Second line:** comes from game state (next deadline, streak at risk, a quest close to done).
- **Wellbeing:** in the up-late band, the second line suggests one short call and then rest. No badge or reward is ever given for late-night play.
- **Where it shows:** as the serif headline on `/path` and `/desk`. Lines are editable in the admin console.

### 8.16 Recognition: Top Voice and Employee of the Month
- **Top Voice (monthly, threshold-based):** everyone who qualifies gets it, like LinkedIn's Top Voice.
  - **General:** ≥ 12 scored calls, average communication ≥ 85, average business ≥ 80, no unrecovered critical flags, Courteous average ≥ 2.5.
  - **Categories:** Claims, Renewals and Certificates (by scenario tag, ≥ 5 calls, average communication ≥ 88); Leadership (team scenarios, ≥ 3 calls, ≥ 85).
  - **Display:** "Top Voice · October 2026" or "Top Voice in Claims · October 2026" on the profile, the leaderboard row and the appreciation wall. 100 coins.
  - A master admin can revoke it, with a reason (audited).
- **Employee of the Month:**
  - Goes to #1 by monthly Career Points within each title group (Levels 1–2, 3–4, 5–6, 7–8), among leaderboard participants.
  - Ties go to the higher average communication, then to whoever reached the points first.
  - Announced by Grace Okafor. 150 coins.

### 8.17 Leaderboard: top 30 (with guardrails)
- **Career Points (CP)** per scorecard = round(((communication + business) / 2) × type weight).
  - Type weights are in `leaderboard.json`; boss missions count 2×, email missions 0.6×.
  - An unrecovered critical mistake halves the points.
  - **Only the first 4 scorecards per local day count**, so grinding can't win. Review mode and onboarding earn 0.
  - Points are written to `points_ledger`, once per scorecard.
- **Periods:** weekly (resets Monday 00:00 UTC, the default view), monthly, all-time. Each shows the **top 30**.
- **Ties:** higher average communication, then whoever reached the points first.
- **Opt-in only** (`player_profiles.leaderboard_opt_in`):
  - Prompted after the first promotion and on the leaderboard page.
  - The public handle defaults to first name + last initial. It's editable, case-insensitively unique, checked against the blocked-words list, and can't contain emails or URLs.
  - Shown on a row: rank, handle, avatar, title, CP, top badge, Top Voice marker.
  - Never shown: email, full name (unless the player chose it as their handle), or anyone outside the top 30.
  - Every participant always sees **their own rank** and how many CP they need to reach #30.
- **Moderation:** admins can hide a player (`leaderboard_exclusions`) or rename a handle. Both are audited.
- **Kudos:** preset types only (no free text), 3 per day, one per recipient per week, only between opted-in players, never to yourself. Recipients can hide a kudos.

---

## 9. Duolingo-inspired experience

Take the **learning loop and motivation**, not the look. Don't copy Duolingo's brand, mascot, colours, illustrations or sounds.

**Adopt:**
- **The leaderboard** (top 30, opt-in, quality-based Career Points, daily cap). This is now an owner decision, D12.
- **The Career Path** home: a vertical trail per level, nodes grouped by client, a boss node, and a promotion milestone with the next title.
- **Bite-sized calls.**
- **Instant feedback** after every reply.
- **A lesson-complete celebration.**
- **A daily goal** with a progress ring.
- **Streaks and freezes,** with a streak calendar.
- **Daily quests.**
- **A mentor character** (Rosa) and a recurring cast.
- **Tiered achievements.**
- **Gentle, opt-in reminders.**

**Adapt** (because there's no undo):
- **Review mode:** read-only replays.
- **Glossary recall:** affects only XP toward the daily goal, capped.
- **"Lessons learned"** in the journal.

**Reject:**
- Hearts or energy limits.
- Promotion and demotion leagues, and social feeds.
- Paid currency or paid streak repair.
- Ads.
- Retrying a call to improve the score.

---

## 10. Pages (build all; phone 390px + desktop 1440px; all states)

**Public:**
- `/`: landing
- `/signup`, `/login`, `/verify-email`, `/forgot-password`, `/reset-password`
- `/legal/terms`, `/legal/privacy`: placeholder text, owner to supply

**Onboarding:** `/welcome`
1. Name and avatar.
2. Daily goal.
3. How it works, with a practice decision from `L1_ONBOARDING_PRACTICE` (not saved).
4. Meet Rosa.
5. The first call, with tips.

**Player pages:**

| Route | Page |
|---|---|
| `/path` | Home: Career Path, daily goal ring, streak, coins, quests, title progress |
| `/desk` | Today: next call, deadlines, inbox, portfolio KPIs |
| `/call/[id]` | Call screen, with the lock-in sheet and saving, uncertain and offline states |
| `/call/[id]/score` | Scorecard |
| `/call/[id]/rewards` | Rewards |
| `/boss/[level]` | Boss mission |
| `/review/[level]` | Level review result |
| `/promotion/[level]` | Promotion ceremony |
| `/clients`, `/clients/[id]` | Client list; client profile with Overview / History |
| `/inbox`, `/inbox/[id]` | Inbox; email mission |
| `/glossary` | Glossary and recall rounds |
| `/journal` | Career journal, including "Lessons learned" |
| `/achievements` | Badges: 100 in 12 categories, with tier progress, secret badges and rarity |
| `/leaderboard` | Top 30: This week, This month, All time; your position; join card; kudos |
| `/appreciation` | Appreciation wall: client notes, shout-outs, Top Voice and Employee of the Month cards; hide option |
| `/quests` | Daily quests |
| `/team`, `/team/[id]`, `/team/delegate` | Team roster, member profile, delegation board (from Level 5) |
| `/review-mode/[attemptId]` | Read-only replay |
| `/shop` | Shop |
| `/profile` | Profile, with the streak calendar and title history |
| `/settings` | Account (password, sessions, log out everywhere), goal, notifications, accessibility, privacy (export, delete) |
| `/ending` | Career ending |
| `/coming-soon` | Shown when the next content isn't published yet |

Log out sits in the profile menu and in settings.

**Navigation** is revealed per `unlocks.json`: Path · Clients · Inbox · **Leaderboard**, then Team from Level 5. The profile menu holds Profile, Journal, Achievements, Appreciation, Quests, Shop, Settings (including the public handle, the leaderboard opt-in and the kudos opt-in) and Log out.

**Command Center:** see §11.

---

## 11. Master Admin Command Center (`/admin`)

**Pages:**

| Route | Page |
|---|---|
| `/admin` | Overview |
| `/admin/users`, `/admin/users/[id]` | Users |
| `/admin/careers/[id]` | Career inspector and adjustments |
| `/admin/levels` | Ladder and gates |
| `/admin/rules` | Rules and economy, with the simulator |
| `/admin/content` | Scenarios list |
| `/admin/content/[id]` | Scenario editor: form + JSON, graph view, validator report, preview player, review and publish, version history |
| `/admin/characters` | Clients, teammates, cast |
| `/admin/badges`, `/admin/quests`, `/admin/shop`, `/admin/endings`, `/admin/glossary`, `/admin/delegation` | Definitions and criteria |
| `/admin/greetings` | Greeting lines by band and context, with a preview at any hour |
| `/admin/appreciation` | Templates by trigger and persona style; Top Voice and Employee of the Month rules; awarded recognitions with revoke |
| `/admin/leaderboard` | Live and frozen boards, recompute a snapshot, exclusions, handle renames, kudos reports |
| `/admin/flags` | Feature flags |
| `/admin/theme` | Theme, with a contrast guard |
| `/admin/announcements` | Announcements |
| `/admin/feedback` | Feedback |
| `/admin/analytics` | Analytics: funnel by level, completion, drop-off, average scores, incidents, save errors |
| `/admin/audit` | Audit log |
| `/admin/admins` | Admins and roles |
| `/admin/system` | Health, versions, backups, config export/import |

**All-commander access (`master_admin`; other roles get subsets via `role_permissions`):**
- **People:**
  - Search, view, suspend or unsuspend, force log out, send a reset email, verify email.
  - Change roles, with an MFA re-prompt.
  - Export data, or delete an account (typed confirmation).
  - Read-only "view as" mode, bannered and audited.
  - No password viewing. No acting as a user.
- **Tweak facility:**
  - Every tunable is a versioned config. Edit → draft → **simulate** (the pure engine replays sample careers and anonymised real choice histories, and shows the impact on statuses, gates and XP) → publish (MFA re-prompt).
  - Re-activating an old version creates a new copy of it.
  - Changes apply to future calls only.
- **Content:**
  - Draft → in review (domain + communication reviewers) → published → retired.
  - The validator blocks publishing on any error.
- **Commander adjustments to careers:**
  - Grant or revoke XP or coins.
  - Award or revoke a badge.
  - Set meters.
  - Lock or unlock a level.
  - Start or end probation.
  - Promote or demote.
  - Reset a streak.
  - Reset a career (archives the old one and creates a new one).
  
  Each adjustment needs a reason, is written as an `admin_adjustment` event (the player's journal shows "Adjusted by support" with a summary), never deletes or edits earlier events, and is logged in `audit_log` with before/after values.
- **Safety:**
  - MFA is mandatory for admins.
  - Admin sessions expire after 12 hours.
  - Typed confirmation for destructive actions.
  - Admin routes are marked noindex.

---

## 12. Accounts and sessions

- **Sign up:**
  - Passwords hashed with Argon2id.
  - Email verification is required unless the dev flag is set.
  - Generic error messages.
- **Log in:**
  - Creates a DB session (the table stores a hash of the random token).
  - The cookie is `HttpOnly`, `Secure`, `SameSite=Lax`.
  - 30-day rolling session, 14 days idle.
  - Rate limits per IP and per email; lockout after 8 failures.
- **Log out:** deletes the session row and clears the cookie.
- **Log out everywhere:** deletes all of the user's sessions.
- **Password reset:**
  - Single-use tokens, stored hashed, valid for 60 minutes.
  - A reset revokes all sessions.
- **Master admin bootstrap:** `pnpm admin:bootstrap` reads `MASTER_ADMIN_EMAIL` and prints a one-time setup link. On first login the admin sets a password and enrols TOTP. No hard-coded credentials.
- **Protection:** CSRF tokens on mutations; Zod validation on every input; server-side authorization on every action.
- **Account deletion:** soft delete with a 14-day grace period, then personal data is removed. Anonymised aggregates may remain.

---

## 13. Database

Use `db/schema.sql` as-is. Extend it only with migrations that keep every constraint and trigger. Key guarantees (tested by `db/tests/smoke.sql`):
- Append-only `career_events`, `decisions`, `scorecards`, `reward_ledger`, `audit_log`.
- One non-review attempt per scenario.
- One decision per node.
- Idempotent events.
- Rewards once per source.
- Meter bounds.
- One published version per scenario and per config kind.
- One live career per user.

Add indexes as profiling shows. Add `db/tests/` integration tests for every service that writes.

---

## 14. API surface (server actions or route handlers)

Every mutation follows the same steps: authenticate → authorize → validate → check `row_version` → run a transaction → append events → return authoritative state. Every mutation carries an `Idempotency-Key`.

- **Auth:** `auth.signup/login/logout/logoutAll/verify/forgot/reset/mfa.enrol/mfa.verify`
- **Player:**
  - `career.get`, `path.get`, `desk.get`
  - `call.get/revealNext/commit/scorecard/collect`, `review.get`
  - `boss.start`, `progression.check`
  - `clients.list/get`, `inbox.list/get`
  - `glossary.round/answer`
  - `quests.get/claim`
  - `shop.list/buy/equip`
  - `team.get/delegate/resolve`
  - `profile.update`, `settings.update`
  - `privacy.export/delete`
  - `feedback.submit`
- **Admin:**
  - `admin.users.*`, `admin.careers.adjust`
  - `admin.config.draft/simulate/publish/activateCopy`
  - `admin.content.save/validate/submitReview/approve/publish/retire/preview`
  - `admin.characters.*`, `admin.defs.*` (badges, quests, shop, endings, glossary, delegation)
  - `admin.flags.set`, `admin.theme.publish`, `admin.announce.*`
  - `admin.audit.query`, `admin.system.*`

Error codes:
- `409` stale version → client refetches.
- Network failure during a commit → the client enters the uncertain state and fetches before allowing a retry.

---

## 15. Design, motion, copy

Follow `docs/03_DESIGN_SYSTEM.md` exactly, and port components from `design/prototype/`.

**New screens to design in that system:**
- **Career Path:**
  - Nodes are 56px circles joined by a 4px track.
  - Done nodes show an ink check on white with the score tier.
  - The current node has a cobalt ring and `call-pulse`.
  - Locked nodes are drawn in `--off`.
  - The boss node is larger, with a medal glyph.
  - The promotion milestone is a butter-tint card showing the next title.
- **Promotion ceremony:** a butter field, the title set in the display serif, `confetti` playing once.
- **Daily goal ring:** a cobalt arc on `--track`.
- **Quests:** row cards with progress bars.
- **Streak calendar:** a 7-column grid.
- **Team roster:** includes morale and workload meters.
- **Delegation board:** three columns: To assign · With teammate · Done.
- **Admin console:** neutral and dense; tables with right-aligned numbers; no decorative colour.

**Motion and sound:**
- Lottie animations per `docs/04` §7.
- Sound off by default.

**Copy:**
- Use the voice in `03` §12.
- Errors explain what happened and how to fix it.
- Empty states lead to the next action.

---

## 16. Security and privacy checklist

- OWASP Top 10 review.
- Rate limits.
- Secure headers and a CSP that allows only your own origin, plus fonts if self-hosted.
- Secrets only in env.
- Encryption at rest for TOTP secrets.
- Dependency audit.
- No PII in logs.
- Analytics props whitelisted.
- Export endpoint authenticated and rate-limited.
- Admin actions audited.

---

## 17. Testing

1. **Unit (engine, all deterministic):**
   - Option order, scoring, cap, recovery downgrade.
   - Meters and clamps.
   - Health formulas.
   - Gates, boss pass, probation and demotion.
   - XP and coins.
   - Streaks and freezes across timezones.
   - Quest seeding.
   - Badge criteria: every metric in `badge_metrics.json`, and every one of the 100 badges reachable by some fixture career.
   - Greeting band and context selection across timezones and DST, including the up-late wellbeing line.
   - Career Points with the daily cap and the critical halving; leaderboard ties.
   - Top Voice and Employee of the Month qualification.
   - Appreciation triggers, each once only.
   - Delegation outcomes.
   - Ending selection.
   - Simulator parity with live scoring.
2. **Integration:**
   - All auth flows, including lockout and reset revoking sessions.
   - Permissions on every admin action.
   - Idempotent commit and concurrent tabs.
   - Config versioning: old scorecards stay unchanged.
   - Content publish and retire.
   - Adjustments create both an event and an audit row.
   - Every scheduled job is idempotent.
3. **E2E (Playwright, phone and desktop):**
   - The 12 tests in `docs/04` §10.
   - Onboarding through to the first call.
   - Log in and log out.
   - Forgot and reset password.
   - Master admin: bootstrap, edit the critical cap, simulate, publish; a new call uses the new cap while old scorecards don't change.
   - Force logout.
   - "Coming soon" when content isn't published.
   - Leaderboard: join, handle validation, own rank shown outside the top 30, kudos limits, admin hide.
   - A client thank-you note after an excellent feedback call appears in the inbox and on the appreciation wall.
   - Greetings at mocked times: 02:00 "Up late", 06:00 early bird, 23:00 night owl.
   - Month-end job awards Top Voice and Employee of the Month on fixture data.
4. **Full career run (Regression Loop):**
   - On a fresh DB with dev auto-publish, play all of Level 1 through the boss to promotion to Associate.
   - Repeat with a critical path → incident → probation → remediation (using test fixtures for the remediation scenarios) → boss variant.
   - Then use admin adjustments to jump to Levels 5 and 8 and verify the team screens, delegation, the finale gating and the ending selection, using test fixture scenarios.
5. **Accessibility:** axe on every route; a keyboard-only run of the call flow.
6. **AI audit:** `pnpm audit:ai` fails on any AI SDK in the lockfile or any request to a known AI API domain during e2e.

---

## 18. Rollout plan (environments and go-live)

1. **Environments:**
   - **Local:** docker compose.
   - **Staging:** production-like, seeded, dev auto-publish **off**.
   - **Production.**
2. **Infrastructure** (owner chooses providers; document the choices in `docs/RUNBOOK.md`):
   - Managed PostgreSQL 16 with daily backups and point-in-time recovery.
   - Node hosting for the app and the worker.
   - An email provider (SPF/DKIM/DMARC).
   - Object storage for data exports.
   - Error monitoring and uptime checks.
3. **CI/CD:** on every push, run the full gate suite. On main, build → migrate staging → seed reference data (idempotent upsert) → smoke + e2e on staging → manual promote to production → migrate → health check.
4. **Database rollout:** forward-only migrations; a rollback plan per migration; a backup before every production migration; restore drill documented and tested on staging.
5. **Content rollout:** the domain reviewer signs off Level 1 → publish on staging → playtest → publish on production. Later levels go out the same way; players waiting see "coming soon".
6. **Go-live checklist:**
   - Master admin bootstrapped with MFA.
   - Legal pages supplied.
   - Registration flag set.
   - Email deliverability verified.
   - Backups verified.
   - Monitoring alerts routed.
   - Accessibility and security checklists signed.
   - Analytics dashboards live.
   - Support contact set.
7. **After launch:**
   - Tune with the simulator, never ad hoc.
   - Weekly review of the funnel, drop-off, incidents and feedback.
   - Content cadence: one level per release.
   - The incident response runbook covers DB, auth and email outages, and a commit-error spike.

---

## 19. Deliverables at the end of the run

1. The working app, the worker and all scripts.
2. Migrations, plus the updated `db/seed.sql`.
3. All tests, green.
4. A `README.md` with setup steps.
5. `docs/RUNBOOK.md`: deploy, backup and restore, incidents, admin bootstrap.
6. `docs/ADMIN_GUIDE.md`: how to tune, author, review, publish and adjust (build on `docs/06_CONTENT_AUTHORING_GUIDE.md`).
7. `BUILD_LOG.md`: every module, decision and default.
8. An updated `docs/07_DECISION_LOG.md`.
9. Screenshots of every page at 390px and 1440px in `docs/screens/`.

---

## 20. Release Checklist (the loop ends only when every box is true)

- [ ] All 35 modules in §6 are implemented and marked done in `BUILD_LOG.md`.
- [ ] Every page in §10 and §11 exists, works at 390px and 1440px, and implements all the states in `docs/04` §6.
- [ ] Sign up, verify, log in, log out, log out everywhere, reset and lockout all work and are tested.
- [ ] Master admin bootstrap with MFA works, and every commander action creates both an event and an audit row.
- [ ] Config edit → simulate → publish works, and past scorecards are unchanged.
- [ ] Content CMS: create, validate, review, publish and retire all work, and drafts are never playable.
- [ ] A full Level 1 career run passes, and the probation path passes.
- [ ] Team (Level 5+) and ending selection are verified with fixtures.
- [ ] All 100 badges are evaluable and each is shown with its art. The streak badges at 30, 60, 90, 180 and 365 days are verified.
- [ ] Appreciation (client, mentor, agency, teammate), Top Voice, Employee of the Month and kudos work, each once only, and are audited where an admin is involved.
- [ ] Greetings are correct for all 7 bands and the context overrides in the player's local time.
- [ ] The top 30 leaderboard works: opt-in, daily cap, weekly freeze with awards, own rank, moderation.
- [ ] `pnpm typecheck`, `lint`, `test`, `content:validate`, `db:smoke`, `e2e`, `a11y` and `audit:ai` are all green on two consecutive fresh runs.
- [ ] There are no console errors and no serious or critical axe violations.
- [ ] The runbook, admin guide, README, build log, decision log and screenshots are delivered.

## 21. Do not
- Add AI dependencies or generate content at runtime.
- Delete or rewrite history (players, admins or jobs).
- Recompute past outcomes after a rules change.
- Make drafts playable outside the dev flag.
- Copy Duolingo's brand, mascot, art or sounds.
- Build hearts, promotion/demotion leagues, social feeds, free-text messaging between players, paid currency or ads.
- Reward or nudge late-night play.
- Hard-code secrets or credentials.
- Weaken tests to get green.
