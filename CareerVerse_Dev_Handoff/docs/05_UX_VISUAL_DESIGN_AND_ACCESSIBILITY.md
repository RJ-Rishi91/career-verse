# UX, Visual Design, and Accessibility

## 1. Visual direction

Blend a premium business simulation with a visual novel. Suggested
palette: - Base: navy, white, slate. - Accents: bright teal, electric
blue, coral, gold.

These are recommendations rather than locked brand colors. The interface
should feel bright and engaging without becoming visually noisy.

Character portraits can be minimal, but must have distinct identities
and expressions. Use consistent dialogue panels, typography, spacing,
cards, buttons, scorecards, and status treatments.

## 2. Interaction style

-   Visual-novel dialogue with speaker identity and expression.
-   Client calls are text-driven.
-   Show concise contextual reactions after committed responses.
-   Give a detailed scorecard after each call.
-   Keep animation rich but non-blocking; no animation should prevent
    reading or decision-making.
-   Audio is optional and not required for MVP.

## 3. Progressive navigation

Use a persistent navigation framework but reveal systems progressively.
Avoid showing a large collection of locked features at the beginning.

Recommended introduction order: 1. First client call and response
choice. 2. Immediate reaction and scorecard. 3. Client metrics and
dashboard. 4. Email and vocabulary missions. 5. Quests, rewards, and
streaks. 6. Leadership and team systems when unlocked. 7. International
systems when unlocked.

## 4. Irreversible choice UI

-   Display one candidate response at a time.
-   Clearly label commit/accept and reject/next.
-   Preview the action before irreversible commitment.
-   Confirm the commitment in plain language.
-   Explain consequence categories without spoiling hidden scores or
    narrative outcomes.
-   Never imply the action can be undone.
-   Make the no-backtracking rule understandable before the first
    consequential choice.

The sequential accept/reject model is unusual compared with conventional
multiple choice. Prototype and test it early. Ensure keyboard and mobile
users can understand the current candidate, rejection state, and
remaining choices.

## 5. Dashboard and status design

Show account status as green/amber/red, but always include a text label
and/or icon. Include relationship metrics, account risk, open tasks,
deadlines, incidents, history, and next actions. Use contextual
explanations for state changes.

## 6. Accessibility

Use WCAG-inspired practices: - Readable text and adjustable text size. -
Keyboard access for all critical interactions. - Visible focus
indicators. - Semantic controls and accessible labels. - Sufficient
contrast. - No color-only status communication. - Reduced-motion
support. - Animations must not hide dialogue or critical state. - Avoid
reading/decision time limits unless a future scenario explicitly
requires them and an accessible alternative is available.

Formal WCAG certification is not currently a requirement unless
separately agreed.

## 7. Responsive behavior

-   Support desktop and mobile browsers.
-   Keep dialogue, choices, and scorecards readable on narrow screens.
-   Avoid hover-only functionality.
-   Make primary actions easy to reach on touch screens.
-   Prevent portrait/dialogue layouts from pushing choices below an
    unusable scroll region.
-   Preserve state through orientation changes and reconnects.

## 8. Save/loading/error UX

Use subtle but honest states: - Saving/pending. - Server-confirmed
saved. - Connection interrupted. - Reconnecting/reconciling. - Action
result confirmed. - Recoverable error.

Never show a save confirmation before the server confirms the durable
write. If a commit is uncertain, retrieve authoritative state before
allowing another attempt.
