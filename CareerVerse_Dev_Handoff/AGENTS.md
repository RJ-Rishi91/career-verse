# Instructions for the coding agent (Antigravity)

If your Antigravity workspace supports a rules or instructions file, point it at this file. Otherwise paste this file into the first task.

## Role
Build the CareerVerse MVP frontend (and, when asked, the backend) from this repository. Act as a careful senior engineer: small, testable steps; no scope creep.

## Sources of truth (in priority order)
1. `docs/MASTER_PROJECT_BRIEF.md` and `docs/07_DECISION_LOG_AND_RND.md`: confirmed requirements.
2. `docs/08_DESIGN_BRIEF.md` and `tokens/`: the visual system. Do not invent colours, sizes or radii.
3. `docs/09_FRONTEND_SPEC.md`: routes, state machine, API shape, tests.
4. `design/prototype/`: behaviour and layout reference. Port behaviour; don't copy its local scoring into production.
5. `docs/10_OPEN_PROPOSALS.md`: **not approved.** Don't implement a proposal as if confirmed unless the owner says so; where noted, build to the current rule.

## Hard rules
- **No AI dependencies.** Do not add any LLM/AI SDK, API key, model call, embedding, or generated content. Dialogue, reactions, scores and coaching come only from `content/` and deterministic rules.
- **Server-authoritative state.** The client never decides scores, XP, coins, badges, meters, promotions or unlocks.
- **No undo.** Committed replies are final. Protect against refresh, back, double-click, retries and multiple tabs (idempotency keys, version checks).
- **Honest saving.** Show "Saved" only after the server confirms.
- **Insurance guardrails.** Never write UI or content that confirms coverage, binding, claim approval or premiums beyond the VA's authority. Scenarios are educational simulations.
- **Accessibility.** Keyboard access, visible focus, 4.5:1 text contrast, non-colour status, reduced motion, 44px touch targets.
- **Privacy.** Analytics are privacy-minimal and never record dialogue text.

## Recommended stack (developer recommendation, not locked)
TypeScript, React 18 with Next.js (App Router), CSS Modules or Tailwind configured from `tokens/tokens.json`, `lottie-web` light player, PostgreSQL with an append-only event table, Playwright + axe-core for tests. Confirm with the owner before committing to it.

## Build order
1. Project setup, tokens, fonts (self-hosted), base layout with the container-query bands.
2. Shared components from `09_FRONTEND_SPEC.md` §8, each with keyboard and reduced-motion support.
3. Desk and Clients screens against mocked API responses shaped per §5.
4. Call screen and state machine (§4), including saving, uncertain and offline states.
5. Scorecard and rewards rendering server-provided results.
6. Content loader + validator for `content/schema/scenario.schema.json` (links, reachability, option counts, 7C completeness, reviewer sign-off).
7. Backend: auth, career state, transactional commit with idempotency, scoring engine from `content/rules.config.json`.
8. Playwright tests from `09_FRONTEND_SPEC.md` §10 green on phone and desktop.

## Definition of done for any screen
Matches `08_DESIGN_BRIEF.md`; works at 390px and 1440px without horizontal scroll; all states in `09` §6 implemented; keyboard and screen-reader checked; no console errors; no new dependency outside the allowlist; tests added.
