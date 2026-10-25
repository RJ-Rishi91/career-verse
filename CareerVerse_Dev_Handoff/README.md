# CareerVerse — Developer Handoff

Everything needed to start building the CareerVerse MVP: the product docs, the visual system, a runnable responsive prototype, Lottie animations, sample content and the maps. **No AI dependency anywhere.**

## Start here

1. Open `design/prototype/index.html` in a browser (double-click works; no server needed). Play the call with Marcus. On a wide screen, use the **Layout** switch (bottom right) to compare Phone and Desktop. "Reset demo" starts over.
2. Read `AGENTS.md`: the rules a coding agent (Antigravity) must follow.
3. Read the docs in order: `docs/README_START_HERE.md`, then `01`–`10`.

## What's inside

```
CareerVerse_Dev_Handoff/
├── README.md                    ← this file
├── AGENTS.md                    ← rules and build order for the coding agent
├── docs/
│   ├── README_START_HERE.md     ← original project workspace guide
│   ├── 01…07_*.md               ← product, gameplay, content, architecture, UX, roadmap, decision log
│   ├── MASTER_PROJECT_BRIEF.md  ← full consolidated spec (source of truth with 07)
│   ├── 08_DESIGN_BRIEF.md       ← visual system: tokens, type, components, states, motion
│   ├── 09_FRONTEND_SPEC.md      ← routes, layout bands, call state machine, API shape, tests
│   └── 10_OPEN_PROPOSALS.md     ← proposals awaiting approval (do not build as confirmed)
├── design/
│   ├── prototype/               ← runnable, responsive, interactive (vanilla HTML/CSS/JS)
│   │   ├── index.html  styles.css  app.js  data.js  tokens.css  animations.js
│   │   └── vendor/lottie_light.min.js (lottie-web 5.12.2, MIT)
│   ├── maps/                    ← pages-map.html, question-map.html, qualifier-map.html
│   └── canvas-source/           ← design canvas source files (reference only)
├── tokens/
│   ├── tokens.css               ← canonical CSS variables
│   └── tokens.json              ← same values for Tailwind/theme config
├── lottie/                      ← 6 Lottie JSON animations + catalogue
├── assets/
│   ├── brand/mark.svg
│   ├── badges/straight-shooter.svg
│   └── portraits/               ← 3 clients × 5 expressions (placeholder art, flat style)
└── content/
    ├── schema/scenario.schema.json
    ├── scenarios/L1_MARCUS_STATUS_UPDATE.json
    ├── clients.json
    └── rules.config.json        ← placeholder numbers
```

## What the prototype demonstrates

- Phone and desktop layouts from one codebase (container queries).
- Desk → call → lock-in → saving → reaction → second decision (branches on your first reply) → scorecard → rewards → back to desk, with the desk, clients and history updated.
- One reply at a time, skipped replies gone, "Last option" rule, seeded option order.
- Deterministic scoring: 7Cs per reply, separate business score, critical-mistake cap, recovery paths, XP/coins, evidence-based badge.
- Honest save states and Lottie moments, with reduced-motion fallbacks.

## Known gaps (by design)

- No backend: commits are simulated with a 750 ms delay. Production must follow `docs/09_FRONTEND_SPEC.md` §4–5.
- Only one scenario is playable; Dana's call is shown but disabled.
- Inbox, journal, shop, settings, auth and onboarding are specified (`08` §14, `09` §2) but not built.
- Fonts load from Google Fonts; self-host them in production. Offline, the prototype falls back to system fonts.
- Portrait art is placeholder; final art needs the 5-expression set per character.
- All thresholds and rewards are placeholders until playtesting.
