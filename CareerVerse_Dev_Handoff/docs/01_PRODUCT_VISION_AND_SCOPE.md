# Product Vision and Scope

## 1. Product summary

CareerVerse is a browser-first, mobile-friendly business career
simulator combining visual-novel storytelling, realistic workplace
communication, insurance-business scenarios, persistent client
relationships, and career progression. The player begins as a Virtual
Assistant (VA) and progresses toward leadership and, in the full vision,
Domain Head.

The game must feel like a business simulation---not a generic
multiple-choice quiz. Players handle assignments, status updates,
emails, client concerns, operational risks, account relationships, and
career decisions. They learn by making decisions, seeing realistic
consequences, and receiving useful coaching.

## 2. Product goals

-   Make workplace communication practice engaging through narrative and
    meaningful consequences.
-   Develop the ability to communicate clearly, concisely, concretely,
    correctly, coherently, completely, and courteously.
-   Combine communication quality with business effectiveness and
    role-specific judgment.
-   Simulate persistent client relationships and account-health
    decisions.
-   Show a credible career path from individual contributor to
    leadership.
-   Deliver a maintainable, content-driven platform that can expand from
    three MVP levels to a 30-level career.

## 3. Audience

-   Employees improving workplace communication.
-   General learners interested in professional skills and business
    simulations.
-   Initial scenario focus: virtual assistants supporting US and
    Canadian insurance agencies.
-   English proficiency should accommodate learners from approximately
    A2 through B2 and above through contextual scaffolding.

## 4. Product principles

1.  One persistent career mode.
2.  Committed major decisions cannot be undone.
3.  Recovery is earned and does not erase history.
4.  Communication quality and business effectiveness are scored
    separately.
5.  Scores and outcomes are deterministic and explainable.
6.  Player-facing content is authored in advance; no runtime AI in MVP.
7.  Progressive unlocks introduce systems when relevant.
8.  Accessibility and mobile responsiveness are core requirements.
9.  No pay-to-win mechanics.
10. Insurance scenarios must respect authority and accuracy guardrails.

## 5. Platform and presentation

-   Browser-first; mobile-friendly and responsive.
-   English-language MVP.
-   Text-driven visual novel with character portraits, expressions, and
    lightweight/rich-but-non-blocking animation.
-   Optional audio is not required for MVP.
-   Current major browsers supported through a developer-defined support
    matrix.

## 6. MVP definition

The MVP is a complete vertical slice containing three polished playable
levels. It must demonstrate onboarding, client-cycle calls, choices,
reactions, scoring, coaching, account updates, career state, rewards,
boss missions, and persistence.

### Required MVP capabilities

-   Email authentication and account recovery.
-   Player-defined display name and basic avatar/cosmetic identity.
-   One persistent career.
-   Progressive onboarding.
-   Three polished levels.
-   Client counts: Level 1 = 3 clients; Level 2 = 4; Level 3 = 5.
-   Every client receives an instruction call, a work-status update
    call, and a feedback/escalation call.
-   36 client-cycle calls across the first three levels, plus one
    boss/capstone mission per level.
-   Sequential choice interface, preview/confirmation, irreversible
    commits.
-   Client dashboard and persistent client history.
-   7Cs scoring, communication dimensions, business effectiveness,
    critical-failure rules, and post-call coaching.
-   XP, coins, badges, streaks, and a limited cosmetic/utility shop.
-   Career journal and consequence history.
-   Deterministic scenario graph and database-driven authored content.
-   Server-authoritative state, transactional decisions, idempotency,
    and interrupted-session recovery.
-   Basic private draft/review/publish content workflow with validation.
-   Privacy-minimal analytics and opt-in feedback.
-   Automated and manual testing; staged release.

### MVP exclusions

-   Runtime AI or AI-generated dialogue/scoring/coaching.
-   Social features and subordinate/friend tasks.
-   Full leadership-management, delegation, sales pipeline, negotiation,
    and strategic systems.
-   Full 30-level content production.
-   Full international expansion.
-   Monetization.
-   A separate practice mode or replay that changes career state.

## 7. Full-game vision

Thirty levels: - Levels 1--5: VA/individual contributor. - Levels 6--9:
senior VA/specialist/emerging lead. - Level 10: full leadership
accountability transition. - Levels 11--20: Team Leader/Manager
progression. - Levels 21--29: senior leadership. - Level 30: Domain
Head.

Design Levels 1--10 in detail first; sketch Levels 11--30 at high level,
then author them after validation.

Planned later systems include leadership, team management, retention,
business development, international markets (US, Canada, UK, Austria),
social features, optional audio, more narrative arcs, and multiple
endings.

## 8. Content volume risk

The 36 required client-cycle calls and three boss missions make the MVP
a substantial content effort. Do not silently reduce client counts. Use
reusable templates, concise dialogue, shared branch nodes, and
save/resume to manage scope and session length.

## 9. Monetization

Undecided and out of MVP scope. Any future model must not undermine fair
progression or turn purchases into a substitute for communication skill.
