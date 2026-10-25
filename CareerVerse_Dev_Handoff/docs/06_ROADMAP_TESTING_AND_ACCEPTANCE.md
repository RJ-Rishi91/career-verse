# Roadmap, Testing, and Acceptance Criteria

## 1. Suggested roadmap

### Phase 1 --- Product and rules foundation

-   Finalize scenario schema and choice state machine.
-   Define initial scoring, critical-failure, relationship,
    account-health, XP, coin, badge, and level-gate configuration.
-   Define Level 1--3 objectives and client roster.
-   Review insurance workflow and authority boundaries.

### Phase 2 --- Architecture and persistence

-   Authentication and account recovery.
-   Database, career state, event history, reward ledger, content
    versioning.
-   Transactional/idempotent decision commits.
-   Session recovery and client dashboard.

### Phase 3 --- Playable vertical slice

-   Visual-novel dialogue and sequential choices.
-   Preview/confirmation and irreversible decision processor.
-   Deterministic branch graph.
-   Client reactions, scoring, coaching, relationship metrics, account
    health.
-   XP, coins, badges, level gates, boss-mission framework.

### Phase 4 --- MVP content and admin

-   Author Level 1--3 client cycles and boss missions.
-   Implement draft/review/publish and graph validation.
-   Conduct insurance-domain and communication-learning reviews.
-   Integrate emails and vocabulary where appropriate.

### Phase 5 --- QA and release

-   Automated and manual tests.
-   Desktop/mobile and accessibility testing.
-   Connection interruption, idempotency, and security tests.
-   Staging release, fixes, limited release, optional feedback.

### Phase 6 --- Post-MVP expansion

-   Expand first 10 levels in detail, then build out 30-level career.
-   Add advanced leadership, business development, and international
    markets.
-   Add social features only after validating core product value.
-   Consider monetization only through a separate product decision.

## 2. Automated testing

Unit tests: - 7C scoring and weighted scoring. - Critical-failure
overrides. - Relationship changes and account-health calculation. - XP,
coins, streaks, badges. - Promotion/demotion gates. - Recovery and
severity rules.

Graph/content tests: - Missing targets and broken prerequisites. -
Unreachable nodes and invalid cycles where prohibited. - Duplicate
IDs. - Invalid option counts. - Missing
scoring/coaching/critical-failure metadata. - Content version
compatibility.

Integration and end-to-end tests: - Authentication and account
recovery. - Full client cycle and level completion. - Boss missions and
career progression. - Transactional decision commits and idempotency. -
Reward ledger and journal. - Content publishing and validation. -
Save/reconnect behavior. - Security/authorization and concurrent
submissions.

## 3. Manual playtesting

Test: - Desktop and mobile. - First-time comprehension of sequential
accept/reject choices. - Network interruption at every important state
transition. - Learners with different English proficiency. - Whether
coaching is actionable and non-shaming. - Whether consequences feel
understandable and proportionate. - Whether client personas feel
distinct. - Whether the MVP feels like a business simulation rather than
a repetitive quiz. - Insurance accuracy and role/authority limits.

## 4. Release acceptance criteria

### Core gameplay

-   User can register, recover access, complete onboarding, and start a
    career.
-   All three MVP levels and their boss missions are playable.
-   Level 1 contains 3 clients, Level 2 contains 4, Level 3 contains 5.
-   Every client has instruction, update, and feedback/escalation calls.
-   Choices have 2--4 options and use the sequential interaction.
-   Irreversible choices require preview/confirmation and cannot be
    undone.
-   Every completed call gives a scorecard and actionable coaching.

### Scoring and persistence

-   The 7Cs are individually evaluated.
-   Communication and business effectiveness are separate dimensions.
-   Critical-failure rules override high averages when configured.
-   Client metrics, account health, tasks, deadlines, incidents, and
    history update deterministically.
-   State persists across sessions/devices.
-   Refreshes/retries/multiple tabs cannot duplicate rewards or reverse
    decisions.
-   Interrupted connections reconcile to authoritative server state.

### Economy and progression

-   XP, coins, badges, streaks, shop items, and level gates follow
    configurable rules.
-   XP alone cannot promote.
-   Consumables cannot undo decisions or guarantee success.
-   Career journal records consequential events.

### Content and operations

-   Draft content is not playable.
-   Invalid content cannot publish.
-   Published content is versioned.
-   Admin access uses least privilege.
-   Backup/restore, monitoring, staging, and rollback are documented.

### Accessibility and privacy

-   Keyboard navigation, focus indicators, readable adjustable text, and
    non-color status cues work.
-   Reduced motion is supported.
-   Analytics are privacy-minimal and feedback is opt-in.
-   Automated and manual release gates pass.

## 5. Performance and operations

Define measurable performance budgets for the selected stack and target
devices. Provisional starting recommendation: first interactive screen
within roughly 3 seconds on a typical supported mobile connection;
ordinary UI transitions should feel near-instant; decision commits
should return quickly enough not to disrupt dialogue. Validate these
targets through measurement; they are not confirmed fixed requirements.

Use staged deployment, documented rollback, database migration
procedures, backups, restoration tests, and monitoring for API errors,
save failures, and publishing failures.
