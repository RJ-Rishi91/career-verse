# Decision Log and R&D Workspace

## 1. Purpose

This document protects settled design decisions while leaving room for
evidence-based R&D. Update it as research or implementation clarifies
the design. Do not treat a proposal as approved until the project owner
confirms it.

## 2. Confirmed decisions from Rounds 1--16

### Product and experience

-   Audience includes employees and general learners.
-   Both entertainment and communication learning are core purposes.
-   Browser-first, mobile-friendly, English-language product.
-   Visual-novel presentation with portraits/expressions and animations.
-   Hybrid business simulation and narrative experience.
-   Typical session: 10--20 minutes.
-   No runtime AI in MVP.
-   MVP-first development.
-   Monetization undecided.

### Modes and consequences

-   One persistent career mode; no separate practice mode.
-   Review-only replayability; replay must not alter persistent state or
    farm rewards.
-   Major decisions are irreversible after confirmation.
-   Career history, client losses, incidents, demotions, and outcomes
    persist.
-   Recovery is earned and contextual; it does not erase the original
    event.
-   No exploit-based score/reward manipulation.

### Choices and branching

-   2--4 options per decision.
-   One option shown at a time.
-   Player accepts/commits or rejects to see the next; rejected choices
    cannot be revisited.
-   Preview/confirmation before irreversible commitment.
-   Hybrid story persistence with meaningful branch consequences.
-   Deterministic authored branch graph with reusable paths.
-   Brief reaction after choices and detailed coaching/scorecard after
    calls.

### Client systems

-   Distinct client profiles and persistent memory/history.
-   Separate trust, respect, and anger metrics.
-   Client-specific starting values.
-   Weighted account health with critical-risk rules.
-   Green/amber/red status with accessibility-safe labels.
-   Client thoughts unlock through trust/EI/career progress and provide
    clues, not answers.
-   Each client has instruction, status update, and feedback/escalation
    calls.

### Career and content

-   Thirty levels in the full vision.
-   Levels 1--10 detailed first; 11--30 initially high-level.
-   Client counts: L1=3, L2=4, L3=5, L4=8, L5--30=10.
-   Boss/capstone mission every level.
-   Leadership begins progressively before Level 10; full accountability
    at Level 10.
-   Career ladder progresses from VA through senior/specialist, Team
    Leader, Manager, Senior Manager, and Domain Head; exact titles can
    be finalized.
-   Promotions require multiple gates; XP alone is insufficient.
-   Demotion/review is based on severity and sustained performance, not
    arbitrary random punishment.
-   Multiple endings based on accumulated career history.

### Learning and domains

-   7Cs: Clear, Concise, Concrete, Correct, Coherent, Complete,
    Courteous.
-   7Cs scored individually with weights and critical-failure rules.
-   Communication quality and business effectiveness scored separately.
-   Multiple reasonable responses can earn partial credit.
-   Contextual vocabulary and email interpretation are integrated.
-   Insurance first; role/authority and accuracy guardrails mandatory.
-   Market sequence: US, Canada, UK, Austria, unlocked through
    story/business events.

### Rewards and social

-   XP combines completion credit and performance bonus.
-   Performance-based coins and evidence-based badges.
-   Limited streak freezes; one qualifying activity/day.
-   Cosmetics plus limited utility; no pay-to-win.
-   Freelancers, if implemented, only assist eligible routine work and
    never remove accountability.
-   Notifications are opt-in (Round 16 final decision supersedes the
    earlier daily-default suggestion).
-   Social features are post-MVP. Friends later retain their own
    careers; subordinate tasks may grant bounded XP.

### Technical and UX

-   Custom backend, database-driven content, deterministic graph,
    configurable rules.
-   Server-authoritative career state with local cache/session recovery.
-   Transactional/idempotent decisions and rewards.
-   Least privilege and privacy-minimal analytics.
-   Automated and manual tests; staged release; strict acceptance gates.
-   Basic private admin/content workflow in MVP.
-   Draft → review → publish with validation.
-   Progressive navigation unlocks.
-   Premium business-simulation/visual-novel look, bright accents,
    distinct minimal portraits.
-   Keyboard navigation, focus indicators, adjustable text, reduced
    motion, non-color-only status.
-   Modern major browsers; performance budgets measured.
-   Opt-in feedback.

## 3. Open implementation questions (not blockers for writing the brief)

These require recommendations or validation, not another broad
questionnaire: 1. Exact frontend/backend/database stack. 2. Hosting
provider and deployment region. 3. Initial 7C weights and other scoring
weights. 4. Account-health thresholds and critical-risk overrides. 5. XP
curve, coin prices, streak limits, and item balance. 6. Exact career
titles and level-by-level promotion gates. 7. What happens if every
sequential option is rejected. 8. Concrete performance budgets after
choosing stack and target devices. 9. Scope and localization approach
for Austria. 10. Exact content schema and admin tooling scope. 11. How
to balance 36 client-cycle calls and three boss missions within the MVP
schedule.

## 4. Research backlog

When researching a topic, write the question, why it matters, evidence,
recommendation, impact, and status.

Suggested research workstreams: - **Choice UX:** Test whether sequential
accept/reject choices are understandable and engaging on desktop and
mobile. - **Branching architecture:** Compare deterministic graph models
and content versioning approaches. - **Learning effectiveness:**
Identify useful ways to teach and assess 7Cs without reducing realistic
work to a quiz. - **Insurance accuracy:** Validate early scenarios with
a qualified domain reviewer. - **Progression balance:** Model XP, coins,
level gates, recovery, and promotion thresholds. - **Accessibility:**
Review keyboard, focus, contrast, reduced-motion, and mobile interaction
requirements. - **Privacy/security:** Determine appropriate minimal
analytics, retention, account deletion, and secure state handling. -
**Production effort:** Estimate authoring and QA effort for 36 calls
plus three boss missions.

## 5. Research note template

Copy this block for each investigation:

### Research item: \[Title\]

-   **Question:**
-   **Why it matters:**
-   **Current confirmed requirement:**
-   **Sources/evidence:**
-   **Options compared:**
-   **Trade-offs:**
-   **Recommendation:**
-   **Impact on MVP:**
-   **Risks/unknowns:**
-   **Status:** Research needed / Proposed / Approved / Rejected
-   **Owner/date:**

## 6. Change log template

  ------------------------------------------------------------------------------------------------
  Date         Change/proposal   Why         Impact                        Status      Approved by
  ------------ ----------------- ----------- ----------------------------- ----------- -----------
  YYYY-MM-DD   Describe change   Evidence or MVP/content/data/scoring/UX   Proposed    Pending
                                 rationale                                             

  ------------------------------------------------------------------------------------------------

## 7. R&D output standard

For each major recommendation, Claude should deliver: 1. Short executive
conclusion. 2. Evidence and sources when research is needed. 3. Options
and trade-offs. 4. Recommended choice. 5. MVP vs post-MVP impact. 6.
Risks and mitigations. 7. Implementation implications. 8. Acceptance
criteria or test cases. 9. Proposed decision-log update (not silently
treated as approved).
