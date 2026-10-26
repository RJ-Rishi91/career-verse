# 04 · Frontend Specification

**CareerVerse v1.0 · Final · 2026-10-26**
**Reads with:** `01_MASTER_BUILD_PROMPT.md` (pages, systems, Release Checklist), `03_DESIGN_SYSTEM.md` (look and components), `05_DATABASE.md` (data).
**Reference build:** `design/prototype/` (vanilla HTML/CSS/JS). It shows behaviour and layout; it is **not** production code. Its "server" is a 750 ms timeout and it scores locally.

---

## 1. Non-negotiables for the frontend

1. **No runtime AI.** No LLM SDKs, AI APIs, embeddings, or generated text, images or audio anywhere in the client or server. All dialogue, reactions, scoring and coaching come from authored content and deterministic rules.
2. **Server-authoritative.** The client renders state the server returns. It never computes authoritative scores, XP, coins, badges or meters. 
3. **No undo.** No back-navigation, refresh, second tab or retry can reverse a committed reply or award a reward twice.
4. **Honest saving.** "Saved" appears only after the server confirms the durable write.
5. **Accessible and responsive** per `03_DESIGN_SYSTEM.md` §5 and §11.

### Dependency allowlist (frontend)
| Purpose | Allowed | Notes |
|---|---|---|
| UI framework | React + TypeScript with Next.js App Router (recommended) | Verify and pin current stable versions (decision log O1). |
| Routing | Framework router (e.g. Next.js App Router or React Router) | |
| Styling | CSS with the tokens in `/tokens` (CSS variables), CSS Modules or Tailwind configured from `tokens.json` | Container queries are used for layout bands. |
| Animation | `lottie-web` (light SVG player) and CSS transitions | Pin an exact version. The prototype vendors 5.12.2. |
| Data fetching | Fetch or a small query library (e.g. TanStack Query) | Must support idempotency keys and refetch-on-reconnect. |
| Testing | Vitest/Jest, Playwright, axe-core | |
| **Not allowed** | Any AI/LLM SDK, analytics that record dialogue text, ad SDKs, social SDKs, free-text player messaging | Formal scope change required. |

---

## 2. Routes and shells

The full route list is in `01_MASTER_BUILD_PROMPT.md` §10 (public, onboarding, player) and §11 (Command Center). Shell rules:

| Route group | Phone shell | Desktop shell |
|---|---|---|
| Path, desk, clients list, inbox list, leaderboard, journal, achievements, quests, shop, profile | Brand top bar + bottom nav (Path · Clients · Inbox · Leaderboard, + Team from Level 5) | Sidebar + sheet |
| Call, email mission, boss, scorecard, rewards, promotion ceremony, review mode | View bar (pause/back, title, save state); no bottom nav | **Focus mode:** no sidebar; call uses brief · stage · relationship columns |
| Client profile, team member, email detail | View bar | Sidebar; list + detail split |
| Auth, onboarding, ending, coming soon | No navigation | Centred column |
| `/admin/*` | Usable on tablet; desktop-first | Admin sidebar; dense tables |

Navigation items stay **hidden** until unlocked (`setup/game/unlocks.json`), never shown disabled.

## 3. Layout bands

Layout responds to the **container** width of the app frame, not the window, so it also works inside embeds and the prototype's preview frame.

| Band | Container width | Behaviour |
|---|---|---|
| Phone | < 641px | Single column; KPIs 2 × 2; brief collapses into a `<details>`; meters inside the call stage; lock-in is a bottom sheet. |
| Tablet | 641–1099px | KPIs 4 across; desk panels two-up; otherwise phone patterns. |
| Desktop | ≥ 1100px | Sidebar (228px) on desk and clients; focus mode on call, score and rewards; lock-in is a centred dialog; call uses brief · stage · relationship columns. |

```css
.frame { container: cv / inline-size; }
@container cv (min-width: 1100px) { /* desktop rules */ }
```

---

## 4. The call state machine

States per decision node. Mirrors `design/maps/question-map.html`.

```
choose ──Next option──▶ choose (idx+1)            guard: idx < n-1
choose ──Say this────▶ confirm                    if node.consequential
choose ──Say this────▶ saving                     if !node.consequential
confirm ─Not yet─────▶ choose (same idx)
confirm ─Lock it in──▶ saving
saving ──server OK───▶ reacted                    render server state; toast "Said, and saved to your career"
saving ──timeout/net─▶ uncertain                  never retry blindly
uncertain ─GET state─▶ reacted | choose           whatever the server says happened
reacted ─Continue────▶ choose (next node)         next node chosen by the committed option
reacted ─Continue────▶ scorecard                  if option ends the call
```

Rules:
- Options appear one at a time, in a **server-provided order** (seeded per career + node). Skipped options are gone.
- On the last option, "Next option" is disabled and labelled "Last option".
- While `saving` or `uncertain`, both choice buttons are disabled and the reason is shown in the choice panel.
- Pause returns to the desk; the call resumes at the same node and option index (server keeps it).
- `Esc` and clicking the scrim close the lock-in sheet (same as "Not yet"). Focus moves to "Lock it in" when the sheet opens and returns to "Say this" when it closes.

---

## 5. API contract (recommended shape)

All writes carry an `Idempotency-Key` header (UUID generated once per user action, reused on retry). All responses return the full authoritative call state so the UI can re-render from it.

```http
GET  /api/career                         → CareerState (player, clients, unlocks, nextActions)
GET  /api/calls/:scenarioId              → CallState (node, visibleOption, optionIndex, optionCount, meters, phase)
POST /api/calls/:scenarioId/reveal-next  { nodeId, optionIndex }            → CallState
POST /api/calls/:scenarioId/commit       { nodeId, optionId, optionIndex }  → CallState + reaction
GET  /api/calls/:scenarioId/scorecard    → Scorecard (computed server-side)
POST /api/calls/:scenarioId/collect      → RewardResult (awarded once)
```

`CallState` (example):
```json
{
  "scenarioId": "L1_MARCUS_STATUS_UPDATE",
  "contentVersion": 1,
  "nodeId": "d1",
  "phase": "choose",
  "optionIndex": 0,
  "optionCount": 3,
  "visibleOption": { "optionId": "B", "text": "I sent the request…" },
  "clientLine": "The GC needs that certificate…",
  "meters": { "trust": 5, "respect": 5, "anger": 6 },
  "consequential": true,
  "expression": "worried"
}
```

The server sends **only the visible option**, never the full option list, so a player can't inspect upcoming replies.

Error handling: `409 Conflict` (stale node or option index) → refetch `CallState` and re-render. `5xx` or network loss during commit → state `uncertain` → `GET` before allowing another commit.

---

## 6. UI states checklist (every screen)

| State | Where | Required |
|---|---|---|
| Loading | Any fetch > 1s | Skeleton rows on `--chrome`; nothing for < 300ms |
| Saving | Top bar + choice panel | `saving-dots` Lottie + "Saving…"; buttons disabled |
| Saved | Top bar | Green dot + "Saved" after server confirm |
| Uncertain commit | Choice panel | "Checking whether your reply was saved…"; no retry button until resolved |
| Offline | Top bar | Amber pill "Reconnecting"; choices disabled with reason |
| Error | Inline | What happened + one action ("Try again"); never blames the player |
| Empty | Panel | Frame stays; one sentence + next action |
| Locked feature | Navigation | Hidden until unlocked |

---

## 7. Animation catalogue (Lottie + CSS)

| Name | File | Trigger | Loop | Size | Reduced motion |
|---|---|---|---|---|---|
| Success check | `lottie/success-check.json` | Server confirms a commit (toast) | No | 32px in toast | Show final frame |
| Saving dots | `lottie/saving-dots.json` | Write pending | Yes | 30 × 10 | Static first frame |
| Call pulse | `lottie/call-pulse.json` | Next-call card while a call is waiting | Yes | Portrait + 44px each side | Static frame |
| Badge burst | `lottie/badge-burst.json` | Badge earned, behind badge art | No | 300px | Not shown (final frame is empty) |
| Confetti | `lottie/confetti.json` | Badge earned, over hero, 250ms delay | No | Fills hero | Not shown |
| XP spark | `lottie/xp-spark.json` | XP figure on rewards, 900ms delay | No | 28px | Not shown |
| XP fill (CSS) | — | Rewards bar from old to new XP | No | — | Jump to final width |
| Stage tint (CSS) | — | Client mood changes after a reply | No | — | Instant |

Implementation (React example):
```tsx
import lottie from 'lottie-web/build/player/lottie_light';
useEffect(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const anim = lottie.loadAnimation({ container: ref.current!, renderer: 'svg', loop: loop && !reduce, autoplay: !reduce, animationData });
  if (reduce) anim.addEventListener('DOMLoaded', () => anim.goToAndStop(loop ? 0 : animationData.op - 1, true));
  return () => anim.destroy();
}, []);
```
Lottie elements are `aria-hidden="true"`; the meaning is always in text next to them.

---

## 8. Component map (prototype → production)

Recognition components (badge medal, leaderboard row, appreciation card, kudos sheet, greeting headline) are specified in `03_DESIGN_SYSTEM.md` §6b.


| Prototype markup | Production component | Props (minimum) |
|---|---|---|
| `.bar`, `.bar--brand` | `TopBar`, `ViewBar` | title, sub, backHref, backKind, saveState |
| `.sidebar` | `Sidebar` | active, unlocks, player |
| `.bottomnav` | `BottomNav` | active, unlocks, inboxCount |
| `.panel` | `Panel` | title, count, action, tint |
| `.row` | `RowCard` | leading, title, sub, meta, status |
| `.kpis/.kpi` | `KpiStrip` | items[] |
| `.pill--*` | `StatusPill` | status: ok \| watch \| risk \| neutral |
| `.meter` | `RelationshipMeter` | label, value, delta, tone |
| `portrait()` | `Portrait` | characterId, expression, size, background |
| `.stage` + `.line` | `CallStage`, `DialogueBubble` | client, expression, line |
| `.choice` | `ChoiceCard` | option, index, count, phase, onNext, onSay |
| `.scrim/.sheet` | `LockInSheet` | open, optionText, clientName, onCancel, onConfirm |
| `.split`, `.c7` | `ScoreSplit`, `C7Row` | scores; name, level, reason |
| `.coach` | `CoachNotes` | worked, next, why, rule |
| `.reward-hero` | `RewardHero` | badge \| null |
| `.timeline__item` | `TimelineItem` | when, kind, title, detail |
| `.toast` | `Toast` | text, animation |

---

## 9. Content contract

- Schema: `content/schema/scenario.schema.json`. All 11 Level 1 scenarios validate against it. Authoring rules: `06_CONTENT_AUTHORING_GUIDE.md`.
- Characters, levels, rules and every slot: `setup/game/`. Validate with `node tools/validate-content.mjs`.
- Before publish, a validator must check: schema, every `next_node_id` exists, every node is reachable from `opening_node_id`, 2–4 options per decision, all seven 7C levels present, coaching present, and insurance-reviewer sign-off in `review`.

---

## 10. Acceptance tests to automate (Playwright)

1. Desk → Take the call → Next option ×2 → "Last option" is disabled.
2. Say this → lock-in opens → Esc closes it → same option still shown.
3. Lock it in → "Saving…" visible, buttons disabled → "Saved" only after the mocked server responds.
4. Commit request fails (mock 503) → UI shows "Checking whether your reply was saved…" and issues a GET before any retry.
5. Double-click "Lock it in" → exactly one commit request with one idempotency key.
6. Reload during `reacted` → same reaction and meters render from the server.
7. Back button after commit does not show the pre-commit option as choosable.
8. Critical path (overpromise) → scorecard shows the incident notice and a business score ≤ 40.
9. Rewards: collecting twice (two tabs) awards XP once.
10. Phone (390px) and desktop (1440px): no horizontal scroll; every action reachable by keyboard; axe-core reports no serious violations.
11. `prefers-reduced-motion: reduce`: no Lottie plays; all information still present.
12. Network: no requests to any AI provider domain (assert via request interception allowlist).
