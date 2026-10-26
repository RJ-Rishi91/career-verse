# 03 · Design System

**CareerVerse v1.0 · Final · 2026-10-26**
**Runnable reference:** `design/prototype/index.html` (responsive, interactive, no AI)
**Use:** Build every screen from this file. When a screen isn't drawn in the prototype, compose it from the tokens, components and templates below. Don't invent new colours, radii or type sizes.

---

## 1. Direction in one paragraph

Bright, young, corporate. A white, airy workspace that looks like a modern professional tool (think a good fintech or productivity app), made playful by **people, not decoration**: every client owns a pastel colour that follows them everywhere, and their portrait reacts to what you say. One cobalt accent marks progress. Big serif headlines speak to the player in plain sentences built from real game state ("Morning, Alex. Marcus needs his COI by 3:00 PM."). No gradients, glows, emoji or neon.

**Design principles**
1. The client is the colour. Pastel tints identify people; chrome stays neutral.
2. Progress is the accent. Cobalt only on XP, trust and 7C ratings, plus at most one control.
3. Say it in a sentence. Each screen opens with one headline that states the situation.
4. Numbers are type, not tiles. Large regular-weight figures; no icon bubbles.
5. Honest states. Never show "Saved" before the server confirms. Never imply undo.

---

## 2. Tokens

```css
:root {
  /* Ground and surfaces */
  --ground:   #FFFFFF;   /* page / sheet */
  --chrome:   #F4F6FA;   /* app frame, top bar, panels */
  --raised:   #FFFFFF;   /* row cards inside panels */
  --track:    #E3E7EF;   /* progress tracks, dividers on chrome */
  --border:   #E6E9F0;   /* 1px card edges */
  --rule:     #EEF1F6;   /* dividers inside white cards */
  --off:      #D5DAE3;   /* inactive pips, empty segments */

  /* Ink */
  --ink:      #14161C;   /* text, primary button fill */
  --ink-2:    #3D4250;   /* secondary body text */
  --muted:    #5B6170;   /* labels, meta (4.5:1 on chrome) */

  /* Accent: progress only */
  --accent:   #2459E0;   /* cobalt */

  /* Meaning */
  --positive: #1E7A4C;   --pill-pos-bg: #DCFAE5;  --pill-pos-ink: #04250E;
  --warning:  #92400E;   --pill-warn-bg: #FFF4D6; --pill-warn-ink: #7A3E00;
  --negative: #B42318;   --pill-neg-bg: #FDECEA;  --pill-neg-ink: #7A1D14;
  --neutral-pill-bg: #E3E7EF; --neutral-pill-ink: #3D4250;
  --anger:    #C2410C;   /* the anger meter only */

  /* Client identity tints (stable per client, never used as data colours) */
  --tint-blue:  #DCE8FF; --tint-blue-ink:  #1F3F8F;   /* e.g. Marcus */
  --tint-coral: #FFE3DA; --tint-coral-ink: #8A2E12;   /* e.g. Dana */
  --tint-mint:  #D6F3E6; --tint-mint-ink:  #0D5A3A;   /* e.g. Priya */
  --tint-butter:#FFF0C2; --tint-butter-ink:#7A3E00;   /* rewards, badges, rules */
  /* More clients: pick hues at least 60° apart, no violet. Candidates: sky #D9F1FB, sand #F3E7D3 */

  /* Shape */
  --radius-panel: 22px;   --radius-card: 14px;   --radius-sheet: 26px;
  --radius-pill: 999px;   --radius-frame: 16px;

  /* Space (4px base) */
  --gap: 16px;  --pad-panel: 20px;  --pad-page-mobile: 16px;  --pad-page-desktop: 24px;

  /* Elevation: only things that float */
  --shadow-float: 0 2px 8px rgba(20,22,28,.06);      /* dialogue bubble */
  --shadow-sheet: 0 -8px 24px rgba(20,22,28,.12);    /* bottom sheet */
  --shadow-dialog: 0 16px 40px rgba(20,22,28,.18);   /* desktop modal */
  --scrim: rgba(20,22,28,.40);

  /* Type */
  --font-sans:  "Instrument Sans", Inter, system-ui, sans-serif;
  --font-serif: "Instrument Serif", Georgia, serif;
}
```

Fonts (Google Fonts): `Instrument Sans` 400/500/600 and `Instrument Serif` regular + italic.

---

## 3. Typography

| Role | Mobile | Desktop | Face / weight | Notes |
|---|---|---|---|---|
| Screen headline (greeting, verdict, client name) | 32/1.08 | 48/1.05 | Serif 400 | One per screen. A sentence from game state. Tracking −0.01em. |
| Sheet / modal title | 28/1.1 | 32/1.1 | Serif 400 | "Say this to Marcus?" |
| Section title | 14/600 | 14/600 | Sans | Sentence case, never uppercase. Count in grey after it. |
| Card title | 19/600 | 28/600 | Sans | Next-call headline. Tracking −0.01em. |
| Choice text | 18/1.45 | 20/1.45 | Sans 400 | In curly quotes. |
| Dialogue line | 16/1.45 | 18/1.45 | Sans 400 | |
| Body | 15/1.5 | 15/1.5 | Sans 400 | Coaching, descriptions. |
| UI / rows | 14 | 14 | Sans 400–600 | |
| Label / meta | 12–13 | 12–13 | Sans 400 | `--muted`. Never below 12. |
| Big figure | 24–36 | 32–40 | Sans 400 | `tabular-nums`. Unit as a smaller grey suffix: `84 /100`. |
| Quote / client thought | 24/1.2 | 26/1.2 | Serif italic | |

Rules: max two faces. The serif only for headlines, titles and client thoughts. Every number uses `font-variant-numeric: tabular-nums`.

---

## 4. Colour rules

- **Accent budget:** cobalt appears on progress (XP bar, trust meter, 7C segments, current choice pip, history dots for calls) and nowhere in navigation or buttons.
- **Primary action:** near-black pill (`--ink`) with white text. One per view. Secondary: `#E3E7EF` pill with ink text.
- **Good / bad, not up / down:** a change is green when it helps the player (trust up, anger down) and red when it hurts. Zero change shows nothing.
- **Status always has a word:** On track (green pill), Watch (amber pill), At risk (red pill). Never colour alone.
- **Client tints** fill that client's hero panel, call stage, avatar circle and next-call card. Their darker ink colour is for text on the tint.
- **Mood on the call stage:** the stage tint changes with the client's reaction: blue (neutral), mint (relieved), coral (frustrated). Always paired with the portrait's expression and an `aria-label`.

---

## 5. Layout

### Breakpoints
| Band | Width | Shell |
|---|---|---|
| Phone | ≤ 640 | Top bar 56px + bottom nav (4 tabs). Panels stack. |
| Tablet | 641–1100 | Top bar; panels two-up where each stays ≥ 340px. |
| Desktop | ≥ 1101 | L-frame: 228px sidebar on `--chrome`, content on a white sheet inset 8px right/bottom, radius 16, 1px border. |

### Mobile shell
- Top bar 56px on `--chrome`: back/pause (44px hit), title + subline, one status or action on the right.
- Page padding 16px. Panel gap 16px. Bottom nav: Desk, Clients, Inbox, Journal. Active tab = `#EEF1F6` pill + ink label; others grey.
- Primary button full width, 48–52px tall, near the thumb.

### Desktop shell
- Sidebar: product mark + name, nav rows 36px (active row `#E3E7EF`, ink, 600), player card at the bottom.
- Sheet content: centred column, max 1100px, top padding 56px for headline screens.
- Rows of panels use flex-wrap with spans that line up (4 × ¼, then ¾ + ¼, then ½ + ½).
- Call screen: three columns: brief (280) · stage + choice (fluid) · relationship and progress (260).

---

## 6. Components

| Component | Spec |
|---|---|
| **Panel** | `--chrome` fill, radius 22, padding 20, no border, no shadow. Title row: section title left, "View all" or meta right. |
| **Row card** | White, 1px `--border`, radius 14, height 63px (52 for compact lists). Avatar or label left, two-line text, one pill or figure right. |
| **KPI strip** | One container (`--chrome` or white with border), split by 1px dividers into 2–4 cells. Label 12–13 grey above a 22–40px figure. No icons. |
| **Pill / chip** | Height ~22, radius 999, 12px/500, pale tint + dark ink of the same hue. `white-space: nowrap`. One status pill per row. |
| **Primary button** | Pill, `--ink` fill, white 15/600, min height 44 (desktop) / 48 (mobile). Optional trailing arrow icon. |
| **Secondary button** | Pill, `#E3E7EF`, ink text. Disabled: `#EEF1F6` fill, `#8A90A0` text. |
| **Progress bar** | 6–8px track `--track`, radius 999, fill `--accent`. Label and figure above. |
| **Relationship meter** | Label left, `delta value/10` right, 6px bar below. Trust = accent, Respect = ink, Anger = `--anger`. |
| **7C row** | Name · 3-segment bar (filled with accent per level) · level pill (Strong green, Good neutral, Needs work amber). Desktop adds a one-line reason. |
| **Dialogue bubble** | White, 1px border, radius 18, `--shadow-float`, overlaps the stage bottom by 18–24px. Speaker name 12/600 in the client's ink colour. |
| **Call stage** | Client tint, radius 22, 236px (mobile) / 320px (desktop) tall, portrait anchored bottom. Mobile places meters in a white card inside the stage. |
| **Choice card** | Panel. Header "Your reply · option n of N" + pips (current 20×6 accent, past grey, future `--off`). Quote text. Buttons: Next option (secondary) + Say this (primary). Hint line under. |
| **Lock-in sheet** | Mobile: bottom sheet, radius 26 top, handle, serif title, quoted reply on `--chrome`, consequence sentence ending in bold "can't be taken back", buttons Not yet / Lock it in. Desktop: centred modal, max 520px. |
| **Tabs** | Segmented pill on `--chrome`; active segment white with 1px border and ink text. Never accent-filled. |
| **Timeline** | 10px dot (accent for calls, grey for system events), 1px rail, when · kind in grey, title 15/600, detail 14. Footer note: history is permanent. |
| **Coaching block** | Three labelled paragraphs: What worked (green label), Try next time (amber), Why it mattered (blue ink). Then a white "Rule of thumb" card with a serif line. |
| **Badge** | Round medal: white ring with ink stroke, butter centre, ink pictogram, two ribbon tails (cobalt + navy). Shown on a full butter field. |
| **Avatar** | Circle, client tint, initials 600 in tint ink. Sizes 32 / 38 / 44 / 96. |
| **Product mark** | Cobalt speech bubble with a white upward chevron (talk + career climb). 28px in shells. |

---

## 6b. Recognition components

| Component | Spec |
|---|---|
| **Greeting headline** | Serif display line from §8.15 of the master prompt (e.g. "Up late, Alex?") + game-state subline in sans. Max 80 characters. |
| **Badge medal** | `assets/badges/<id>.svg`: white ring with ink stroke, tier ring (bronze `#C98A4B`, silver `#8E99AA`, gold `#D9A62E`; single badges cobalt; legendary gold), category glyph in ink, cobalt/navy ribbons. Locked: 40% opacity + "x of y" progress. Secret: plain ring with "?" until earned. |
| **Achievements grid** | Grouped by category; 4 columns on phone, 8 on desktop; name under medal (13px, 2 lines max); tap opens a sheet with description, criteria progress and evidence. |
| **Leaderboard row** | Row card 60px: rank (podium ranks in ink 600), avatar, handle + optional Top Voice pill, title · top badge (hidden on phone), CP right-aligned (tabular), Kudos button (secondary, 36px) or "Sent" pill. "You" row: 1.5px cobalt border on `#F5F8FF`. |
| **Join card** | Butter tint panel explaining what is shown and never shown; primary "Join as {handle}". |
| **Appreciation card** | Client tint background; title with star glyph; serif quote (22px); sender + coins meta. On the wall: masonry of cards, newest first; hide control. |
| **Top Voice mark** | Warning-palette pill "Top Voice" on rows; on profile a card: "Top Voice · October 2026" with the Top Voice medal. |
| **Kudos sheet** | Bottom sheet / dialog: six preset chips (44px), remaining count, Cancel. No text field. |

## 7. Character portraits

- Flat vector busts, no outlines, built on a 64×64 grid; shown at 64, 104, 150, 208–300px.
- Each recurring character needs: distinct silhouette (hair shape), skin tone, clothing colour, and their tint as background.
- **Required expressions per character:** neutral, worried, pleased, relieved, frustrated (5). Expressions change only brows and mouth so they swap without layout shift.
- Every portrait carries `role="img"` and an `aria-label` describing the mood ("Marcus looks relieved").
- Placeholder art on the canvas is a stand-in. Commission or draw the final set in this exact flat style.

---

## 8. Icons

Outline icons, 1.6–2px stroke, 16px in desktop nav, 20px in mobile nav, 16–18px inline, grey (`--muted` / `--ink-2`). One set throughout (Lucide matches well). Never inside coloured circles or squares. Icon-only buttons need an `aria-label`.

---

## 9. States

| State | Treatment |
|---|---|
| Saving | Grey dot + "Saving…" in the top bar. Buttons that commit are disabled. |
| Saved | Green dot + "Saved" only after the server confirms the write. |
| Offline / reconnecting | Amber pill "Reconnecting" in the top bar; choices disabled with the reason in the hint line. |
| Uncertain commit | Full-width notice in the choice area: "Checking whether your reply was saved…" Fetch server state before allowing another tap. |
| Error | Inline red-ink sentence with a retry action. Never blames the player. |
| Empty | Keep the panel frame; one sentence in the trade's words plus the next action ("No emails yet. Your first one arrives after Marcus's call."). No illustrations. |
| Loading | Skeleton rows in `--chrome` for anything over 1s; nothing under 300ms. |
| Locked feature | Hidden until unlocked (progressive navigation), not shown greyed out. |

---

## 10. Motion

Durations 150–250ms for UI, 350–500ms for meter and stage-tint changes, ~1.1s for the XP fill on the reward screen. Easing `cubic-bezier(.2,.8,.2,1)`. Animate only opacity, transform, width of bars and background colour. Every animation has a `prefers-reduced-motion: reduce` fallback with no movement. Nothing blocks reading or choosing.

**Lottie animations** (files in `/lottie`, catalogue in `lottie/README.md`, rendered with `lottie-web` light SVG player): `success-check` (reply saved), `saving-dots` (pending write), `call-pulse` (next call waiting), `badge-burst` + `confetti` (badge earned, once), `xp-spark` (XP gained). Lottie is decoration on top of an honest UI state: the text label must always say the same thing without the animation.

---

## 11. Accessibility checklist

- Text contrast ≥ 4.5:1 (12px labels included); large figures ≥ 3:1.
- Touch targets ≥ 44px. Visible focus: 2px cobalt outline, 2px offset.
- Real `<button>`, `<a>`, `<input>` + `<label>`; dialogs use `role="dialog"` + `aria-modal`; tabs use `role="tab"` + `aria-selected`.
- Status and deltas never by colour alone (word, sign or icon too).
- Text resizes to 200% without losing actions. No time limits on reading or choosing.

---

## 12. Voice in the UI

Plain, warm, specific. Use the trade's words: COI, endorsement, carrier, underwriter, renewal. Buttons are verbs: "Take the call", "Say this", "Lock it in", "See how you did", "Collect rewards". Coaching never shames: say what worked first. Never "OK", "Submit" or "Proceed".

---

## 13. Don't

Gradients, glows, glass, neon, dark navy themes, emoji, violet or indigo, icons in tinted bubbles, sparklines on numbers, uppercase tracked labels, accent-coloured nav or tabs, a "Saved" that the server hasn't confirmed, anything that suggests a decision can be undone, and coloured status without a word.

---

## 14. Pages

The authoritative page list is `01_MASTER_BUILD_PROMPT.md` §10 (player and public) and §11 (Command Center).

**Drawn in `design/prototype/`:** Career desk, Client call + lock-in, Scorecard, Rewards, Clients list + profile, Leaderboard (with kudos), and greetings on the desk.

**Build from templates:**

| Page type | Template |
|---|---|
| Auth (sign up, log in, reset) | Centred 400px column, serif headline, labelled inputs, near-black primary button |
| Onboarding | Call template with Rosa as the speaker; the practice decision isn't saved |
| Career Path | Trail of 56px nodes on a 4px track (done: check + tier; current: cobalt ring + `call-pulse`; locked: `--off`; boss: larger node with a medal; promotion milestone: butter card) |
| Promotion ceremony | Butter field, title in the display serif, `confetti` once |
| Inbox / email mission | Row-card list; desktop list + detail; email in a white card; choice card for the reply |
| Journal / appreciation wall | Timeline component; appreciation cards in a masonry layout |
| Achievements | Badge grid (§6b) |
| Quests / streak calendar | Row cards with progress bars; 7-column calendar |
| Team / delegation | Row cards with morale and workload meters; three columns: To assign · With teammate · Done |
| Shop / settings / profile | Row cards; label above field; panels |
| Command Center | App-screen rules: neutral, dense tables, right-aligned numbers, no decorative colour |

---

## 15. Maps (text versions; drawn versions in `design/maps/`)

### Pages
```mermaid
flowchart LR
  A[Sign up / log in] --> B[Onboarding] --> P[Career Path]
  P --> D[Desk]
  P --> L1[Pre-call brief] --> L2[Call] --> L3[Lock-in sheet] --> L4[Reaction] --> L5[Scorecard] --> L6[Rewards] --> P
  P --> BO[Boss] --> RV[Level review] --> PR[Promotion ceremony]
  RV --> PB[Probation → remediation → boss variant]
  P --> C1[Clients]:::later --> C2[Client profile + history]
  P --> I1[Inbox]:::later --> I2[Email mission]
  P --> LB[Leaderboard top 30]:::later
  P --> T1[Team]:::later --> T2[Delegation board]
  P --> ME[Profile menu] --> J[Journal] & AC[Achievements] & AP[Appreciation wall] & Q[Quests] & SH[Shop] & ST[Settings]
  PR --> EN[Ending after Level 8]
  classDef later stroke-dasharray: 5 5
```

### Question flow in one call
```mermaid
flowchart TD
  A[Pre-call brief] --> B[Client speaks]
  B --> C[Show option n of N]
  C --> D{Say this?}
  D -- no --> E{Options left?}
  E -- yes --> C
  E -- no --> F[Last option: must be said]
  D -- yes --> G{Lock-in policy}
  F --> G
  G -- sheet --> H[Lock-in sheet]
  H -- Not yet --> C
  H -- Lock it in --> I[Commit: server transaction]
  G -- direct --> I
  I --> J[Reaction: face, line, meters]
  J --> K{More decisions?}
  K -- yes, node set by reply --> B
  K -- no --> L[Scorecard] --> M[Rewards, appreciation, badges]
```
Default lock-in policy: every decision opens the sheet. "Consequential only" is a Command Center switch.

### Qualifiers (defaults; tunable)
| Qualifier | Rule | Outcome |
|---|---|---|
| Promotion | All required nodes, XP threshold (500 → 12,000), portfolio Good+, no open severe incident, boss passed; team health Good+ from Level 5 | Promoted, or probation |
| Account status | 100 × (0.4·trust + 0.3·respect + 0.3·(10 − anger)) / 10; severe incident → At risk | On track 70+ · Watch 40–69 · At risk under 40 |
| Score cap | Critical flag on a chosen reply | Business ≤ 40, incident logged |
| Client thoughts | Trust 6; trust 8 + Courteous average ≥ 2 | Clue on the profile |
| Streak | One qualifying activity per local day; freeze covers 1 day; hold 2 at most | +1, kept, or reset |
| Top Voice | Monthly: ≥ 12 calls, communication 85, business 80, no unrecovered critical, Courteous 2.5 | Recognition + 100 coins |
| Leaderboard | CP = (communication + business) / 2 × type weight; first 4 per day count | Top 30 weekly, monthly, all-time |
| Feature unlocks | Clients after 1st scorecard; Inbox and Glossary at Level 2; Team at Level 5; Shop after 1st promotion | Tab appears with a one-line intro |

---

## 16. Defaults you can change in the Command Center

- Accent colour (default cobalt `#2459E0`; the taste kit's alternative is deep teal `#1B6E66`).
- Lock-in policy (default: every decision).
- Client tint palette (contrast-checked).
- All thresholds above.

Final character art (a 5-expression set per character) is an open item in `07_DECISION_LOG.md`.
