# Master Project Brief: Business Communication Career Simulator

**Version:** 1.0 --- Consolidated from Game Design Rounds 1--16\
**Status:** Developer-ready product specification; unspecified
implementation choices are labelled as recommendations.\
**Product type:** Browser-first, mobile-friendly, deterministic
narrative business simulation with communication-learning mechanics.

------------------------------------------------------------------------

## 1. Executive Summary

Build a polished, English-language, browser-based business simulation in
which the player begins as a Virtual Assistant (VA) in a professional
services environment and progresses through a persistent career toward
senior leadership and ultimately Domain Head. The game combines
visual-novel storytelling, client relationship management, realistic
workplace communication, insurance-operations scenarios, career
progression, and consequential decisions.

The product must feel like a business simulation---not a generic
multiple-choice quiz. Players manage client accounts, handle
instructions and updates, interpret emails, make decisions under
pressure, receive feedback, build a professional portfolio, and earn
promotions based on both communication quality and business outcomes.

**The MVP must contain no runtime AI.** Dialogue, client reactions,
branching, scoring, coaching, rewards, and outcomes are deterministic
and authored in advance. The system may use reusable content templates
and configurable rules, but gameplay outcomes must not depend on a
generative model.

### Product principles

1.  **One persistent career.** There is one ongoing career mode. Do not
    add a separate practice mode or a replay path that can alter career
    history.
2.  **Consequences matter.** Committed major decisions, client losses,
    incidents, demotions, and career outcomes persist. Recovery is
    possible only through defined in-world actions and never erases
    history.
3.  **Communication and business effectiveness are distinct.** A
    polished response that causes a business problem must not receive a
    high overall result merely because it sounds professional.
4.  **Explainable scoring.** Scores, client reactions, promotions,
    demotions, rewards, and account-health changes must be explainable
    to the player.
5.  **Realistic professional drama.** Use recurring clients, distinct
    personalities, strategic rivals, shifting account priorities, and a
    persistent narrative arc.
6.  **Progressive complexity.** Teach mechanics when they become
    relevant. Navigation and systems unlock as the player advances.
7.  **Accessible, responsive interaction.** Support desktop and mobile
    browsers, keyboard navigation, adjustable text size, clear focus
    states, and status communication that does not rely on color alone.
8.  **No pay-to-win design.** Monetization is undecided. Purchases or
    consumables must never undo consequential decisions or guarantee
    career success.

------------------------------------------------------------------------

## 2. Product Scope and Audience

### 2.1 Audience

-   Employees who want to strengthen workplace communication.
-   General learners interested in a career/business simulation.
-   Primary scenario audience: professionals supporting US and Canadian
    insurance agencies, especially insurance VAs and business-process
    support teams.
-   English proficiency may vary from beginner/A2 through advanced/B2
    and above. The game should teach through context rather than assume
    fluent business English.

### 2.2 Platform

-   Browser-first web application.
-   Mobile-friendly and responsive, with adaptive layouts.
-   Support current major versions of Chrome, Edge, Firefox, and Safari,
    subject to a developer-defined support matrix.
-   English is the product language for MVP.

### 2.3 Experience format

-   Text-driven visual novel.
-   Character portraits with distinct expressions and
    lightweight/rich-but-non-blocking animations.
-   Dialogue panels, client/account dashboard, mission/task views, email
    interpretation, scorecards, career journal, and progressive
    navigation.
-   Optional audio may be supported later; it is not required for the
    MVP.

------------------------------------------------------------------------

## 3. MVP Versus Post-MVP

### 3.1 MVP: required

The MVP is a **complete vertical slice with three polished playable
levels**, not merely a clickable UI prototype. It must demonstrate the
complete core loop from onboarding through client calls, feedback,
account changes, rewards, career progress, and persistence.

Required MVP capabilities:

-   Email-based account creation and authentication, including account
    recovery/password reset or an equivalent secure recovery path.
-   Player-defined name and basic cosmetic identity; core capabilities
    are progression-based.
-   One persistent career state per account.
-   Interactive onboarding/tutorial that introduces the first call,
    choices, score feedback, and client dashboard progressively.
-   Three polished levels with authored dialogue and deterministic
    branches.
-   Client assignment/instruction call → work-status update call →
    feedback/escalation call for every client.
-   Client dashboard with profiles, relationship metrics, account
    status, open tasks, deadlines, history, and next actions.
-   Sequential, irreversible response-choice interaction with preview
    and confirmation.
-   7Cs communication scoring, other communication dimensions, business
    effectiveness, critical-failure rules, contextual client reactions,
    and post-call coaching.
-   XP, coins, badges, streak rules, level gates, and limited
    cosmetic/utility shop.
-   A boss/capstone mission for each level.
-   Persistent career journal and consequence history.
-   Database-driven authored content and deterministic branch graph.
-   Server-authoritative save state and transactional decisions, with
    local cache/session recovery for interrupted connections.
-   Basic private admin/content workflow, including draft/review/publish
    status and validation checks before publication.
-   Privacy-minimal analytics and opt-in feedback collection.
-   Automated and manual tests, staged release, and strict acceptance
    gates.
-   Accessibility basics described in Section 13.
-   No social features, no AI-generated runtime content, no full
    leadership/sales system, and no monetization dependency.

### 3.2 MVP client counts and content volume

The full-game design sets these client counts:

  ------------------------------------------------------------------------
  Level          Assigned clients Required core calls   Minimum
                                  per client            client-cycle calls
  ------------- ----------------- --------------------- ------------------
  1                             3 Instruction, status   9
                                  update,               
                                  feedback/escalation   

  2                             4 Instruction, status   12
                                  update,               
                                  feedback/escalation   

  3                             5 Instruction, status   15
                                  update,               
                                  feedback/escalation   

  **Total**                **12** **Three calls per     **36**
                                  client**              
  ------------------------------------------------------------------------

Every level also has a boss/capstone mission. The 36-call content
requirement is a meaningful MVP production risk. **Do not silently
reduce the selected client counts.** Control effort through concise
calls, reusable dialogue/branch templates, common system components, and
selective branch reuse. Keep each playable session within the intended
10--20-minute range by distributing work across sessions, preserving
progress, and using short individual interactions. If product
stakeholders later choose to reduce the MVP content volume, that would
be a scope change requiring explicit approval.

### 3.3 Post-MVP: planned, not required to launch MVP

-   Expansion to all 30 levels, with the first 10 designed in detail and
    Levels 11--30 initially sketched at high level.
-   Additional markets and country-specific orientation: US first, then
    Canada, UK, Austria, unlocked through story and business events.
    Austria requires a separate review of local business, language, and
    domain assumptions.
-   Full leadership progression and systems: team profiles, delegation,
    coaching, capacity planning, meetings, retention, pipeline, pitches,
    bounded negotiation, and strategic trade-offs.
-   Advanced sales and account-growth missions.
-   Full international travel/expansion animations and market-specific
    content.
-   Social features: leaderboards, challenges, teams, gifting,
    cooperative missions, and subordinate/friend tasks. Friends must
    retain their own independent careers; a player who becomes a leader
    may invite friends as subordinates and assign optional bonus tasks
    that can earn bounded XP. This is future functionality, not MVP.
-   More levels, client archetypes, recurring cast, rivals, story arcs,
    endings, and curated scenario expansions.
-   Optional audio and pronunciation/listening features.
-   More complete private admin/CMS and editorial analytics.
-   Monetization, only after a separate product decision; do not build a
    pay-to-win economy.
-   Advanced events, streak recovery, and additional shop items as
    validated by playtesting.

------------------------------------------------------------------------

## 4. Core Gameplay Loop

The main loop should be consistent and satisfying:

1.  **Review goals:** Show current career objective, level requirements,
    active client risks, deadlines, and any available missions.
2.  **Prepare:** Review relevant client history, instructions, email,
    task context, and vocabulary hints.
3.  **Communicate:** Handle a client call or related written
    communication using a sequence of authored decisions.
4.  **React:** Show the client's immediate reaction after each committed
    choice. The reaction should be contextual, concise, and grounded in
    the client's profile and account state.
5.  **Coach:** After the call, show a detailed scorecard and explain why
    choices helped or hurt.
6.  **Update the business state:** Update tasks, deadlines, client
    trust/respect/anger, account health, open incidents, and future
    missions according to deterministic rules.
7.  **Earn and progress:** Award completion XP plus performance bonuses,
    coins, evidence-based badges, and streak credit where applicable.
8.  **Review portfolio:** Show green/amber/red account status, risks,
    next actions, and career gates.
9.  **Continue the narrative:** Use the outcomes to shape later calls,
    boss missions, rival interactions, promotions, and endings.

The experience should balance story, work simulation, and learning. A
typical session should be designed for 10--20 minutes, with save/resume
so players can spread a level across multiple sessions.

------------------------------------------------------------------------

## 5. Career Structure and Level Design

### 5.1 Full vision: 30 levels

The complete career progresses from individual contributor to Domain
Head. Recommended high-level ladder:

  -----------------------------------------------------------------------
  Levels                  Career phase            Core focus
  ----------------------- ----------------------- -----------------------
  1--5                    VA / Individual         Reliable execution,
                          Contributor             clear communication,
                                                  insurance workflow
                                                  basics, task ownership

  6--9                    Senior VA / Specialist  Complex accounts, peer
                          / Emerging Lead         support,
                                                  prioritization, early
                                                  leadership
                                                  responsibilities

  10                      Major leadership        Full leadership
                          transition              accountability begins;
                                                  capstone tests
                                                  communication,
                                                  judgment, and
                                                  responsibility

  11--20                  Team Leader / Manager   Coaching, delegation,
                          progression             workload management,
                                                  client retention,
                                                  meetings, team
                                                  performance

  21--29                  Senior Manager / Senior Portfolio strategy,
                          Leadership              account growth, risk
                                                  decisions, cross-market
                                                  management

  30                      Domain Head             Business growth,
                                                  strategic accounts,
                                                  international
                                                  expansion, commercial
                                                  and people leadership
  -----------------------------------------------------------------------

**Developer recommendation:** Finalize exact job titles and the
competencies required for each rank during content planning. The ladder
above preserves the chosen progression without pretending exact titles
were already finalized.

Leadership starts progressively before Level 10; Level 10 is the point
of full accountability, not the first time the player encounters
leadership.

### 5.2 Level structure

-   There are 30 levels in the full vision.
-   Design Levels 1--10 in detail first; sketch Levels 11--30 at high
    level and author them after validation.
-   Every level has a boss/capstone mission, with varied content and a
    level-specific competency focus.
-   A level gate can require completion, performance thresholds, career
    competencies, portfolio health, objectives, and a review/boss
    mission.
-   XP alone cannot promote a player.
-   Level difficulty combines introduction of new skills with increasing
    complexity in known skills.
-   Early levels include quotes, policy documents, renewals,
    certificates of insurance (COIs), claims coordination,
    documentation, and progress updates.
-   Conflicts become more likely after Level 3.
-   Problem-solving and emotional-intelligence demands increase after
    Level 4.
-   Level 8 introduces creative/critical thinking and important
    decisions.
-   Leadership responsibilities are introduced progressively before
    Level 10.
-   The full career should contain multiple end states, determined by
    accumulated outcomes and final performance, not a last-minute
    isolated choice.

### 5.3 Client counts by level

Preserve the selected full-game rules:

-   Level 1: 3 clients.
-   Level 2: 4 clients.
-   Level 3: 5 clients.
-   Level 4: 8 clients.
-   Levels 5--30: 10 clients per level.

Each client's core cycle contains: 1. Instruction/assignment call. 2.
Work-status update call. 3. Feedback/escalation call.

Additional calls may be authored for complex incidents, major
relationship changes, or important story beats. Email missions should be
integrated into the client cycle rather than treated as a disconnected
feature.

### 5.4 Boss missions

Every level ends with a capstone/boss mission that combines relevant
skills. Boss missions may involve: - A high-stakes client
conversation. - An unresolved incident or escalation. - Multiple account
priorities. - A manager or leadership review. - A pitch, retention, or
strategy decision at later levels. - A multi-step communication and
business judgment challenge.

Boss missions should be varied, but use a consistent evaluation
structure so outcomes are explainable and testable.

------------------------------------------------------------------------

## 6. Calls, Choices, and Irreversible Decisions

### 6.1 Call design

Every call should have: - Purpose and business context. - Caller/client
identity and communication profile. - Relevant history and prior
decisions. - Clear task objective and any role/authority constraints. -
A sequence of scenario-driven decision points. - Immediate client
reaction after each committed response. - State updates caused by the
response. - Post-call scorecard, coaching, and next actions.

Dialogue length should vary naturally by context. Avoid forcing every
call to have the same number of turns. Decision count is scenario-led.

### 6.2 Choice rules

-   Each decision has **2--4 authored response options**.
-   Show **one option at a time**.
-   Choices are presented sequentially. The player may commit to the
    displayed option or reject it to reveal the next candidate. A
    rejected candidate cannot be revisited.
-   Before an irreversible choice is committed, show a clear
    preview/confirmation step that communicates the meaningful
    consequence category without revealing hidden scoring or spoiling
    the story.
-   Once committed, a decision cannot be undone.
-   The player must not be able to manipulate scores by refreshing,
    opening multiple tabs, resubmitting, or exploiting the back button.
-   Branches should be major where meaningful, but use reusable branch
    nodes and templates to keep authoring and testing manageable.
-   Different options can earn different amounts of credit. There may be
    one best response, but multiple responses can be reasonable and
    receive partial credit.
-   A response that is polished but causes a material business problem
    must not receive a high overall score.

**Developer recommendation --- choice-state edge case:** Define a
deterministic end state for when the player rejects every displayed
candidate. A reasonable implementation is to make the final remaining
candidate the only commit-able option, or offer a clearly labelled "take
no action/escalate" option when it is appropriate to the scenario. Do
not add an implicit undo or backtracking route. Document the selected
interaction clearly in onboarding and test it with users, because
sequential accept/reject differs from a conventional multiple-choice
interface.

### 6.3 Immediate reaction and call summary

After each committed choice: - Display a short, context-specific client
reaction. - Update visible metrics only when appropriate; avoid
overwhelming the player with a full dashboard after every sentence. -
Reveal thoughts only to the extent unlocked by trust, emotional
intelligence, or career skill. Thoughts are clues, not answer keys.

After each call: - Provide detailed coaching. - Show score breakdown and
business outcome. - Explain critical mistakes and why they matter. -
Record any new incidents, tasks, deadlines, and relationship changes. -
State the next useful action.

------------------------------------------------------------------------

## 7. Client Profiles, Relationships, and Portfolio Health

### 7.1 Distinct client personas

Each client should have structured, deterministic attributes: -
Communication style and preferred level of detail. - Motivations and
business priorities. - Expectations and tolerance for delay. - Common
triggers and escalation thresholds. - Urgency and deadline
sensitivity. - Account value/importance. - History of prior interactions
and incidents. - Relevant domain knowledge and likely misunderstandings.

Client personalities should feel distinct without relying on
stereotypes. Client reactions must be explainable by personality,
urgency, issue severity, prior decisions, account history, and business
context.

### 7.2 Relationship metrics

Track independent but interconnected metrics, each on a 0--10 scale
unless a developer-recommended alternative is approved:

-   **Trust:** confidence that the player will be honest, accurate, and
    dependable.
-   **Respect:** perceived professionalism, competence, ownership, and
    judgment.
-   **Anger:** current frustration or emotional escalation.

Starting values are scenario-specific. Ordinary interactions should
change metrics gradually; major incidents may cause larger changes. The
metrics must influence one another through explicit rules, not be
collapsed into one hidden number.

### 7.3 Client dashboard

The dashboard should show: - Client profile and communication
preferences. - Green / amber / red account status, with text labels and
icons in addition to color. - Trust, respect, and anger. - Account
importance and current risk. - Pending tasks, deadlines, unresolved
incidents, and next actions. - Recent interaction history and key
decisions. - Status explanations, not just raw numbers.

### 7.4 Account-health calculation

Account health is a weighted result influenced by: - Trust, respect, and
anger. - Work quality and correctness. - Deadline adherence. -
Unresolved incidents and severity. - Client/account importance. -
Client-specific modifiers and hard-risk conditions.

Use configurable weights and thresholds. Critical events can override a
favorable average and move an account to amber/red. Portfolio health
should combine a weighted portfolio score with critical-risk rules. Do
not assume one bad interaction automatically loses an account;
distinguish recoverable mistakes from severe incidents.

**Developer recommendation:** Start with provisional thresholds in
configuration, not hard-coded code. Calibrate them with playtesting and
ensure the UI explains each status change.

### 7.5 Client thoughts

Client thoughts unlock progressively through trust,
emotional-intelligence development, and career progression. Thoughts
should: - Provide partial context or clues. - Never directly reveal the
correct response. - Reflect the client's plausible mental state. - Be
authored content, not generated at runtime.

------------------------------------------------------------------------

## 8. Communication Learning Framework

### 8.1 The 7Cs

Evaluate each response against: 1. **Clear** --- easy to understand. 2.
**Concise** --- no unnecessary wording. 3. **Concrete** --- specific,
observable details rather than vague wording. 4. **Correct** ---
accurate grammar, facts, terminology, and commitments. 5. **Coherent**
--- logical structure and flow. 6. **Complete** --- includes the
information/action needed. 7. **Courteous** --- respectful and
appropriate tone.

The system should check each C individually, then calculate a weighted
score. Apply critical-failure rules where a mistake creates material
risk. A single best answer may exist, but reasonable alternatives should
receive partial credit.

### 8.2 Additional communication dimensions

Score these separately from the 7Cs: - Grammar and language control. -
Tone and professionalism. - Empathy and emotional intelligence. -
Listening/comprehension, where represented by authored choices. -
Problem-solving and judgment. - Business effectiveness and task
completion. - Client/account outcome. - Role-specific career
competencies.

Present both the dimension-level breakdown and a combined result. Do not
let high language scores hide a serious operational failure.

### 8.3 Coaching

Coaching must be: - Specific to the selected response and its outcome. -
Constructive and non-shaming. - Linked to the relevant skill or 7C. -
Clear about what worked, what did not, and why. - Actionable, with a
suggested alternative or a rule the player can apply next time. -
Consistent with the scenario's actual authority and business rules.

### 8.4 Vocabulary mastery

Teach vocabulary in context through: - Client calls and emails. - A
personal vocabulary collection/glossary. - Short recall challenges. -
Examples and usage notes. - Later reuse in new scenarios.

Do not reward obscure or "difficult" words merely because they sound
professional. Favor accurate, clear workplace language.

### 8.5 Email interpretation

Email missions should ask players to: - Identify sender intent. -
Extract facts, deadlines, requests, and constraints. - Detect missing
information or risk. - Select a suitable response or next action. -
Avoid making unauthorized promises. - Preserve the email's place in the
client's ongoing account history.

### 8.6 Country and accent context

The product is English-language. The initial market focus is the US,
followed by Canada; UK and Austria are planned later in the story.
Country-specific content should teach contextual expectations, phrasing,
etiquette, and terminology with realistic exceptions rather than
simplistic national stereotypes. Short orientation modules should
precede market-specific missions.

------------------------------------------------------------------------

## 9. Scoring, Progression, Rewards, and Economy

### 9.1 Score model

Use a configurable weighted-hybrid model. Keep at least three result
categories separate: 1. Communication quality. 2. Business/task
effectiveness. 3. Career/role competencies.

A combined score may be displayed, but critical failures override high
averages where appropriate. All score calculations and thresholds should
be deterministic and server-authoritative.

**Developer recommendation:** Keep weights in a versioned rules
configuration. Do not lock numerical weights until representative
scenarios have been playtested.

### 9.2 XP

-   Award base XP for completing eligible activities.
-   Add performance-based XP bonuses.
-   Use a gradual rising XP curve as levels advance.
-   Completion alone does not guarantee promotion.
-   Promotions require multiple gates: level requirements, performance,
    competencies, objectives, portfolio health, and a review/boss
    mission as applicable.
-   XP cannot erase poor outcomes or substitute for role competence.

### 9.3 Coins and shop

The chosen model is cosmetic plus limited utility: - Avatar cosmetics
and rank-unlocked appearance options. - Capped streak freezes. - Limited
temporary support/assistance. - Carefully controlled small boosts where
appropriate. - Limited-use anger-reduction item, for example a temporary
5% reduction, only if the effect can be clearly and fairly defined. -
Freelancers may help with eligible routine tasks only; they cannot
complete critical judgment calls or remove the player's accountability.

Rules: - Consumables are capped and cannot reverse committed decisions,
erase incident history, restore a lost client automatically, or
guarantee a promotion. - No pay-to-win advantage. - Cosmetic effects on
trust must be tiny, with a maximum proposed effect of +1--2%, and should
preferably be cosmetic-only if testing shows fairness concerns. - Coins
are earned through performance bonuses and in-world activities. Do not
make purchases a substitute for skill.

### 9.4 Streaks and reminders

-   One qualifying activity per day counts toward a streak.
-   Limited streak freezes are available.
-   Streak rules should be flexible but bounded.
-   Notifications/reminders are **opt-in**, with configurable frequency
    and a simple opt-out.
-   Do not make reminders coercive or shame-based.

### 9.5 Badges

Badges are awarded for evidence of skill, not just activity volume.
Examples: - Problem Solver. - Conflict Handling King. - Master
Persuader. - Master Negotiator. - Master Presenter.

Each badge needs a deterministic achievement rule, evidence criteria,
and a record in the career journal. Avoid awarding a badge solely for
spending coins or repeating an easy action.

### 9.6 Promotion and demotion

Promotion uses combined gates: completion, performance, career
competencies, objectives, portfolio status, and reviews/boss missions.
XP alone is insufficient.

Demotion is review-based and may be triggered by: - A severe incident. -
Sustained poor performance. - Significant client/account losses. -
Failed leadership objectives. - A critical event that initiates a formal
review.

Rules must be deterministic and explainable. Earned badges and completed
milestones remain recorded even after demotion. Career rank and client
outcomes remain persistent.

------------------------------------------------------------------------

## 10. Failure, Consequences, and Recovery

### 10.1 Contextual seriousness

Use severity categories, for example: - **Minor mistake:** coaching and
small score/relationship change. - **Material but recoverable issue:**
incident recorded; additional corrective task or client follow-up
required. - **Severe incident:** major account risk, formal review,
possible client loss or demotion depending on context. - **Irreversible
business outcome:** the original outcome persists, even if later
recovery creates a new opportunity.

Exact severity definitions must be authored per scenario and configured,
not inferred by a generative model.

### 10.2 Earned recovery

Recovery can involve: - Owning the error. - Providing a corrective
action and realistic timeline. - Seeking missing information. -
Escalating within authority. - Following through on commitments. -
Repairing the relationship over subsequent interactions.

Recovery is not guaranteed. It can improve future outcomes, but cannot
erase prior decisions, incidents, or client losses. A recovered account
must retain its history.

### 10.3 No undo and anti-exploit

-   Major decisions are irreversible after confirmation.
-   Do not allow replay to change the persistent career state.
-   Prevent double submissions, duplicate rewards, refresh exploits, and
    conflicting state writes.
-   Record consequential events in an auditable history.
-   Save/load should resume the current committed state, not roll back
    decisions.

------------------------------------------------------------------------

## 11. Narrative and World Design

### 11.1 Story structure

-   Persistent narrative arc across levels.
-   Player-defined name and cosmetic identity.
-   Core career capabilities are determined by progression, not by an
    unrestricted class/build system.
-   Recurring core cast, clients, colleagues, managers, and strategic
    rivals.
-   Professional drama grounded in client needs, delivery pressure,
    mistakes, competition, account risk, and career opportunity.
-   Multiple end states based on accumulated performance and decisions.
-   Full career journal showing missions, decisions, incidents, client
    history, promotions, demotions, badges, and recovery actions.

### 11.2 Review-only replayability

Players may review completed content, decisions, scorecards, and career
history. Review/replay must not alter the persistent career state or
allow the player to farm rewards. Do not create a separate practice mode
or alternate persistent career mode in the MVP.

### 11.3 Business events and pitches

At later levels, major events introduce new prospects, business pitches,
account growth, or international opportunities. Pitch simulations should
evaluate: - Discovery and understanding of the prospect. - Suitability
of the proposed solution. - Clear value explanation. - Handling
objections. - Realistic and authorized commitments. - Agreement on next
steps.

A poor pitch may lose a prospect or damage standing. Recovery can create
future opportunities but cannot undo the original outcome.

### 11.4 International expansion

The story unlocks new markets through referrals, business events, and
senior-level decisions. Travel can be represented with plane/travel
animations and a market-orientation sequence. New markets introduce
terminology, expectations, clients, and objectives.

Planned sequence: US → Canada → UK → Austria. Treat exact timing as a
content-planning recommendation, not a finalized schedule.

------------------------------------------------------------------------

## 12. Leadership and Business Management (Post-MVP)

The full game must eventually cover leadership in depth, but the
advanced systems are not required for MVP beyond light foreshadowing and
basic career progression.

### 12.1 Leadership mechanics

-   Meetings that require decisions, prioritization, and clear
    follow-through.
-   Delegation based on task complexity, teammate competency, workload,
    reliability, deadline, and required supervision.
-   Distinct team-member profiles.
-   Coaching using diagnose → coach → follow up.
-   Capacity planning and workload management.
-   Accountability for reasonable decisions, without punishing the
    player for unforeseeable information.
-   Poor delegation can damage delivery or contribute to client loss,
    depending on context.

### 12.2 Client retention and recovery

-   Relationship repair and client-retention plans.
-   Recovery is possible but not guaranteed.
-   Track what the player promised, what was delivered, and whether
    follow-up occurred.
-   Do not automatically restore a lost account simply because the
    player completes a generic recovery task.

### 12.3 Sales and growth

-   Lead pipeline with clear stages.
-   Discovery, value proposition, objection handling, and next-step
    agreement.
-   Negotiation limited by authorized trade-offs and business
    constraints.
-   Strategic decisions with visible trade-offs between growth, risk,
    workload, and client satisfaction.
-   Domain Head gameplay focuses on business growth, lead conversion,
    account retention, strategic accounts, and international expansion.

### 12.4 Friends and subordinate tasks

Future social design: - A leader may invite friends as subordinates. -
Each friend retains their own independent career. - The leader can
assign optional bonus tasks/tests. - Completing these tasks can grant
bounded XP. - Any leaderboards/challenges should emphasize skill and
achievements, not time spent or money spent. - This entire social system
is post-MVP.

------------------------------------------------------------------------

## 13. UX, Visual Design, and Accessibility

### 13.1 Visual direction

-   Blend a premium business simulation with a visual novel.
-   Base palette recommendation: navy, white, and slate, with
    bright/catchy teal, electric blue, coral, and gold accents.
-   Minimal character portraits should still have distinct identities,
    silhouettes, and expressions.
-   Rich animations are welcome, but never block a decision, delay
    accessibility controls, or make interaction timing-sensitive.
-   Use consistent typography, spacing, button states, dialogue bubbles,
    cards, scorecards, and status labels.

### 13.2 Navigation

Use **progressive unlocks**: - Keep a persistent navigation framework. -
Reveal features when the player has learned or unlocked them. - Avoid
showing many locked systems at the beginning. - Introduce calls first,
then metrics/dashboard details, emails, quests, leadership, and
international systems as relevant.

### 13.3 Choice and confirmation UI

-   One option visible at a time.
-   Clear accept/commit and reject/next-option actions.
-   Preview/confirmation before an irreversible commitment.
-   Confirmation must describe the action and consequence category in
    plain language.
-   Never imply that a choice can be undone if it cannot.
-   Show saving/sync status honestly; never display "saved" before the
    server confirms the durable write.

### 13.4 Accessibility

Use WCAG-inspired practices; formal certification is not an MVP
requirement unless separately agreed: - Readable text and adjustable
text size. - Keyboard navigation for all critical interactions. -
Visible focus indicators. - Semantic controls and accessible labels. -
Sufficient contrast. - Do not rely on color alone for green/amber/red
status. - Reduced-motion support. - Avoid time pressure for reading or
choosing unless a future scenario explicitly requires it and offers an
accessible alternative. - Ensure animations do not hide dialogue or
status updates.

### 13.5 Save, loading, and error states

-   Use subtle, clear save/loading/error states.
-   Provide a recoverable session after connection interruption.
-   Distinguish local cached state from server-confirmed state.
-   If a decision commit is uncertain due to network interruption, query
    the server for the authoritative result before allowing another
    submission.
-   Preserve already committed state and avoid duplicate rewards.

------------------------------------------------------------------------

## 14. Technical Architecture

The user selected a custom backend, database-driven content,
deterministic branching, configurable scoring rules,
server-authoritative persistence, least-privilege security, and a hybrid
save strategy. Exact stack is intentionally delegated to the developer.

### 14.1 Recommended architecture (not a locked requirement)

**Developer recommendation:** Use a maintainable TypeScript web stack
with a responsive component-based frontend, a custom API/backend, and a
relational database such as PostgreSQL. A framework such as
React/Next.js is one viable option, but the developer may choose an
equivalent stack based on team capability, hosting cost, and deployment
needs.

A relational model is a good fit for users, career state, clients,
account metrics, missions, decisions, scoring rules, reward ledger, and
audit history. If the developer chooses a document database, they must
still preserve transactionality, versioning, queryability, and integrity
constraints.

Suggested logical components: 1. Responsive web frontend. 2.
Authentication and account recovery. 3. Career/game-state API. 4.
Scenario/content delivery service. 5. Deterministic rules/scoring
engine. 6. Transactional decision processor. 7. Persistence/database
layer. 8. Minimal analytics and opt-in feedback. 9. Private
admin/content publishing interface. 10. Logging, monitoring, backups,
and deployment pipeline.

### 14.2 Deterministic content graph

-   Store authored scenario content in the database.
-   Represent branches as a deterministic graph of nodes and
    transitions.
-   Each node has a stable identifier, type, content version,
    prerequisites, options, and next-state rules.
-   Every response option has deterministic effects and may lead to one
    or more next nodes.
-   Use reusable branch nodes where possible, but keep meaningful
    consequences explicit.
-   Avoid relying on hidden front-end-only state for outcomes.
-   Scenario changes must be versioned. A new published content version
    must not silently change the meaning of a decision already committed
    by a player.

### 14.3 Server-authoritative state

The server is the source of truth for: - Committed choices. - Client
relationships and account status. - Incidents and consequence history. -
Scores and scorecards. - XP, coins, badges, streaks, level completion,
promotion/demotion. - Career journal and endings. - Content version
assigned to an active session.

The client may cache non-authoritative state for responsiveness, but
cannot independently award rewards or change career outcomes.

### 14.4 Transactional decisions and idempotency

Each decision commit should: 1. Validate the authenticated user and
active career. 2. Validate scenario/session version and current expected
node. 3. Confirm the selected option is available and not previously
rejected/committed. 4. Apply state changes in a transaction. 5. Record
the decision and resulting effects in the career journal/audit history.
6. Award eligible rewards once. 7. Return the authoritative new state.

Use idempotency keys or equivalent protections so retries do not
duplicate rewards or state changes. Handle concurrent tabs and duplicate
requests safely. Reject stale submissions with a clear recovery path.

### 14.5 Hybrid save and interruption recovery

-   Server-side save is authoritative.
-   Local cache may preserve recent UI state and improve resume
    experience.
-   On reconnect, reconcile with server state; never overwrite a newer
    server decision with stale local state.
-   If the commit result is unknown, fetch authoritative state before
    retrying.
-   Support interruption during dialogue, choice confirmation, scorecard
    display, and level transition.

### 14.6 Configurable scoring and rules

-   Keep 7C weights, dimension weights, critical-failure conditions,
    relationship effects, account thresholds, XP curves, rewards,
    promotion gates, and demotion rules configurable.
-   Version rules so old active sessions remain interpretable.
-   Store the rule/content version used to produce each consequential
    result.
-   Include explanations for score and state changes in content or rule
    metadata.

### 14.7 Suggested core entities/data model

The developer may adapt this schema, but the concepts must be
represented:

-   `User`: identity, auth reference, preferences, consent flags.
-   `PlayerProfile`: display name, avatar cosmetics, onboarding status.
-   `CareerState`: current level/rank, XP, coins, streak, current
    mission, state version.
-   `CareerEvent`: immutable event history for decisions, incidents,
    rewards, promotions, demotions, and client changes.
-   `Client`: stable client identity and authored profile.
-   `ClientRelationship`: trust, respect, anger, current status, history
    reference.
-   `Account`: importance, health, risk state, tasks, deadlines,
    incidents.
-   `Mission`: level, objective, prerequisites, boss/capstone flag,
    completion rules.
-   `ScenarioVersion`: content version, status
    (draft/review/published/retired), authoring metadata.
-   `ScenarioNode`: dialogue/email/instruction/decision/feedback node.
-   `ChoiceOption`: text, eligibility, deterministic effects, next node,
    scoring metadata.
-   `ScoreRuleSet`: versioned weights, critical rules, scoring
    dimensions.
-   `CallAttempt`: current/finished call state, content version, result
    reference.
-   `DecisionRecord`: selected option, rejected options, timestamp,
    idempotency key, effects.
-   `Scorecard`: dimension scores, 7C scores, critical flags, business
    outcome, coaching.
-   `RewardLedger`: XP/coin changes with source and idempotency
    reference.
-   `BadgeAward`: badge evidence and timestamp.
-   `VocabularyItem` / `VocabularyProgress`: term, context,
    definition/example, recall history.
-   `CareerJournalEntry`: readable narrative history linked to immutable
    events.
-   `FeedbackSubmission`: optional user-submitted feedback with consent.
-   `AdminUser` / `PublishAudit`: least-privilege admin access and
    publishing history.

### 14.8 Suggested scenario content shape

The exact serialization is a developer choice. Each scenario should
support fields equivalent to:

``` json
{
  "scenario_id": "L1_CLIENT_A_UPDATE",
  "version": 1,
  "level": 1,
  "client_id": "CLIENT_A",
  "scenario_type": "status_update_call",
  "learning_objectives": ["clear_updates", "complete_information", "courteous_tone"],
  "business_objective": "Give a truthful update on an outstanding quote",
  "prerequisites": ["L1_CLIENT_A_INSTRUCTION_COMPLETE"],
  "opening_node_id": "opening",
  "nodes": [
    {
      "node_id": "opening",
      "type": "dialogue",
      "speaker": "client",
      "text": "Can you tell me where the quote stands?",
      "next_node_id": "decision_1"
    },
    {
      "node_id": "decision_1",
      "type": "decision",
      "presentation": "sequential_commit",
      "options": [
        {
          "option_id": "A",
          "text": "I'll check the status and confirm the expected timeline.",
          "effects": {
            "communication": {"clear": 1, "complete": 0.5},
            "business": {"accuracy": 1},
            "relationship": {"trust": 0.2, "respect": 0.1}
          },
          "critical_flags": [],
          "next_node_id": "reaction_A"
        }
      ]
    }
  ],
  "post_call": {
    "scorecard_template": "CALL_STANDARD_V1",
    "coaching_template": "UPDATE_CALL_COACHING_V1",
    "completion_rule": "call_completed"
  }
}
```

This JSON is illustrative only. The developer must validate the final
schema and avoid storing executable arbitrary code in content records.
Effects should reference approved rule identifiers or typed data, not
unrestricted code.

### 14.9 Admin content lifecycle

Use **draft → review → publish**: - Draft content is not available to
players. - Required fields must be present before review. - Validation
checks must detect missing node targets, unreachable nodes, invalid
option counts, duplicate IDs, missing scoring metadata, missing learning
objectives, missing critical-mistake rules, and broken prerequisites. -
Review must verify domain accuracy, communication quality, scoring
fairness, branching logic, accessibility, and insurance authority
guardrails. - Publish creates an immutable content version. - Retire old
content without silently altering already committed history. - Record
who reviewed/published and when. - MVP needs a basic private admin
workflow; a polished full CMS can follow post-MVP.

### 14.10 Authentication, security, privacy

-   Email authentication with account recovery.
-   Least-privilege roles; player accounts cannot call admin operations.
-   Server-side authorization for every career-state change.
-   Protect secrets, use secure transport, and follow secure
    session/token practices.
-   Minimize collected personal data; do not collect unnecessary
    demographic or sensitive information.
-   Analytics should be privacy-minimal and avoid capturing unnecessary
    dialogue/free text.
-   Feedback collection is opt-in.
-   Define retention, deletion, backup, and account-closure procedures
    before public launch.
-   Never trust client-provided scores, balances, account health, or
    career rank.
-   Rate-limit sensitive endpoints and protect against brute-force and
    abuse.
-   Log consequential administrative actions and high-impact career
    changes.
-   No social data collection in MVP.

### 14.11 Analytics

Use privacy-minimal product analytics focused on whether the game is
understandable and educational: - Onboarding completion. - Mission
start/completion. - Call completion and abandonment. - Time-to-complete
at an aggregate level. - Choice-interface errors and recovery events. -
Scorecard views. - Level completion and progression gates. - Technical
errors and save/reconnect outcomes. - Optional, consent-based feedback.

Avoid unnecessary personal profiling. Analytics must not become a hidden
scoring input.

------------------------------------------------------------------------

## 15. Insurance Domain Guardrails

The initial scenarios are insurance-first. Plausible tasks include: -
Quote creation/status. - Policy issuance and renewals. - Certificates of
Insurance (COIs). - Policy documents and endorsements. - Claims
coordination and verification. - Documentation review. - Carrier,
client/POC, adjuster, insured, and agency communications. - Premium,
policy modification, and process questions.

### Mandatory guardrails

-   Do not teach the player to make commitments outside their role or
    authority.
-   Do not represent uncertain coverage, claim approval, policy
    issuance, premium, or binding status as confirmed.
-   Teach players to verify information, state what is known, identify
    missing facts, and escalate when required.
-   Use explicit role and authority boundaries in the scenario content.
-   Distinguish a process update from a binding or coverage decision.
-   Domain-specific terminology and workflows must be reviewed by a
    knowledgeable insurance subject-matter reviewer before publication.
-   Avoid presenting the game as professional legal, insurance, or
    compliance advice.

------------------------------------------------------------------------

## 16. Testing and Quality Assurance

Testing must combine automated and manual validation.

### 16.1 Automated tests

-   Unit tests for 7C scoring, weighted scoring, critical failures,
    relationship changes, account-health calculation, XP/coin rewards,
    promotion/demotion gates, and badge eligibility.
-   Graph validation for missing targets, cycles where prohibited,
    unreachable nodes, invalid prerequisites, and malformed content.
-   Integration tests for authentication, saving, session recovery,
    decision commits, idempotency, reward ledger, and content
    versioning.
-   End-to-end tests for a complete level, including all client cycles,
    boss mission, scorecards, account updates, and career progression.
-   Security tests for authorization, stale submissions, concurrent
    requests, and tampering.
-   Accessibility checks for keyboard navigation, focus, contrast, text
    scaling, and status announcements.

### 16.2 Manual playtesting

-   Test on desktop and mobile.
-   Test interrupted connections at multiple points, especially during a
    decision commit.
-   Test the sequential accept/reject interaction with first-time users.
-   Test beginner and stronger English readers for comprehension.
-   Review whether coaching is useful, not shaming, and consistent with
    the scenario.
-   Verify that different choices produce understandable consequences.
-   Check that a poor response does not automatically cause
    disproportionate failure.
-   Confirm that the three MVP levels feel like a coherent business
    simulation rather than a repetitive quiz.
-   Review all insurance content for accuracy and authority boundaries.

### 16.3 Content quality checklist

Every scenario must include: - Learning objectives. - Business objective
and intended outcome. - Required context and prerequisites. - Client
profile and relevant history. - All dialogue/email text. - Decision
options and next-node references. - 7C and other scoring metadata. -
Critical mistakes and severity. - Relationship/account effects. -
Coaching and explanation. - Completion criteria and rewards. -
Accessibility review. - Insurance/domain review where applicable. -
Version and reviewer metadata.

------------------------------------------------------------------------

## 17. Deployment, Performance, and Operational Readiness

-   Use staged deployment: development → test/staging → limited release
    → broader launch.
-   Define rollback and database migration procedures.
-   Maintain backups and verify restoration.
-   Monitor availability, API errors, save failures, and content
    publishing failures.
-   Provide a basic support/reporting path.
-   Establish measurable performance budgets before release.

**Developer recommendation --- initial performance targets:** Set and
test a practical budget for first-load performance, route transitions,
dialogue rendering, API latency, and recovery. As a starting point, aim
for a usable first interactive screen on a typical supported mobile
connection within roughly 3 seconds, keep ordinary UI transitions
near-instant, and make server-confirmed decisions return quickly enough
not to disrupt conversation flow. Treat these as provisional engineering
targets to validate against the chosen stack and deployment region, not
as already approved product requirements.

------------------------------------------------------------------------

## 18. MVP Acceptance Criteria

The MVP is not ready to release until all mandatory criteria below pass.

### Core experience

-   A new user can create an account, recover access, complete
    onboarding, and start a career.
-   The player can complete all three MVP levels and their boss
    missions.
-   Levels 1--3 include the required 3, 4, and 5 clients respectively,
    each with instruction, update, and feedback/escalation calls.
-   Each level contains realistic, authored branches and a coherent
    narrative progression.
-   Each choice has 2--4 options and uses the specified sequential
    interaction.
-   Irreversible decisions have a preview/confirmation step and cannot
    be undone after commitment.
-   Every completed call provides a scorecard and actionable coaching.

### State and scoring

-   The 7Cs are individually evaluated and shown.
-   Communication quality and business effectiveness are separately
    scored.
-   Critical-failure rules work even when other scores are high.
-   Trust, respect, anger, client status, portfolio health, tasks,
    deadlines, and incident history update deterministically.
-   Account status uses weighted metrics and critical-risk overrides.
-   Career state, decisions, scores, rewards, and journal persist across
    devices/sessions.
-   Refresh, duplicate submissions, multiple tabs, or retries cannot
    duplicate rewards or undo decisions.
-   Network interruption does not cause a contradictory career state.

### Economy and progression

-   XP, coins, badges, streaks, shop items, and level gates follow
    configurable rules.
-   XP alone cannot promote the player.
-   Consumables cannot reverse committed decisions or guarantee success.
-   The career journal records consequential events.

### Content and admin

-   Draft content cannot be played.
-   Content cannot be published while required validation checks fail.
-   Published content is versioned and immutable for active/committed
    history.
-   Admin operations are protected by least-privilege access.
-   Insurance-domain guardrails are reviewed and present in the scenario
    workflow.

### Accessibility, security, and operations

-   Critical interactions are keyboard-accessible and have visible focus
    indicators.
-   Text scaling is supported and status is not color-only.
-   Reduced-motion support is available for meaningful animations.
-   Privacy-minimal analytics and opt-in feedback operate as specified.
-   Automated and manual test suites pass the agreed release gates.
-   Staging deployment, backup/restore, error monitoring, and rollback
    procedures are documented.

------------------------------------------------------------------------

## 19. Recommended Implementation Roadmap

This is a proposed sequence, not an additional user decision.

### Phase 1 --- Product and rules foundation

-   Finalize scenario schema and state machine.
-   Define initial 7C/communication/business scoring configuration.
-   Define account-health, relationship, XP, coin, badge, and level-gate
    rules as versioned configuration.
-   Define exact Level 1--3 objectives and client roster.
-   Review insurance workflows and role boundaries.

### Phase 2 --- Architecture and persistence

-   Implement authentication and account recovery.
-   Implement database, career state, event history, reward ledger, and
    content versioning.
-   Implement transactional/idempotent decision commits and session
    recovery.
-   Build a minimal client dashboard and save/load flow.

### Phase 3 --- Core playable vertical slice

-   Implement visual-novel dialogue and sequential choices.
-   Implement confirmation UI and irreversible decision state machine.
-   Implement deterministic branch graph, immediate reactions,
    scorecards, and coaching.
-   Implement client relationship metrics and account-health dashboard.
-   Implement XP, coins, badges, level gates, and boss mission
    framework.

### Phase 4 --- MVP content and admin workflow

-   Author and validate all required Level 1--3 client cycles and boss
    missions.
-   Implement draft/review/publish workflow and graph validation.
-   Conduct insurance-domain review and communication-learning review.
-   Add vocabulary and email content where needed to support the core
    cycle.

### Phase 5 --- Quality, accessibility, and release

-   Run automated unit/integration/end-to-end tests.
-   Conduct manual usability testing, including sequential-choice
    comprehension.
-   Test mobile/desktop, interruption recovery, accessibility, and
    security.
-   Deploy to staging, resolve blockers, and run a limited release.
-   Collect optional feedback and prioritize evidence-based fixes.

### Phase 6 --- Post-MVP expansion

-   Expand toward 10 detailed levels and a high-level 30-level career
    map.
-   Add advanced leadership, team management, business development, and
    international markets.
-   Add social systems only after core retention and learning value are
    validated.
-   Revisit monetization only through a separate product decision.

------------------------------------------------------------------------

## 20. Open Technical Decisions and Explicit Developer Recommendations

The following were not locked by the user. The developer should choose
and document them rather than treating them as established decisions:

1.  **Exact technology stack:** choose a maintainable, cost-effective
    browser stack and custom backend. TypeScript frontend plus API and
    PostgreSQL is one recommendation, not a mandate.
2.  **Hosting and deployment provider:** select based on cost, security,
    backups, regional latency, and operational simplicity.
3.  **Exact scoring weights:** make configurable; establish initial
    values through representative scenario testing.
4.  **Exact account-health thresholds:** configurable and tested; use
    clear hard-risk overrides.
5.  **Exact XP curve, coin prices, and reward amounts:** configure and
    tune through playtesting; prevent farming and pay-to-win outcomes.
6.  **Exact career titles and promotion thresholds:** preserve the
    30-level ladder and gradual leadership progression, then specify
    measurable competency gates.
7.  **Choice exhaustion behavior:** choose and test the deterministic
    behavior when all sequential options are rejected. Do not allow
    backtracking or accidental irreversible commitment.
8.  **Performance budgets:** define concrete targets for the selected
    stack and supported devices; suggested targets in Section 17 are
    provisional.
9.  **Austria localization/domain scope:** decide how much local-market
    content is appropriate before implementation; do not assume that
    English-only content fully represents Austrian insurance workflows.
10. **Monetization:** undecided and out of MVP scope.
11. **Full admin CMS:** MVP requires a private draft/review/publish
    workflow; more sophisticated authoring tools may follow later.
12. **Exact content authoring volume:** preserve the selected client
    counts. The 36 client-cycle calls plus three level capstones make
    MVP content production substantial; use reusable templates without
    reducing requirements silently.

------------------------------------------------------------------------

## 21. Final Build Instructions for the Developer

Build the smallest polished implementation that genuinely demonstrates
the complete game loop---not a generic quiz, static prototype, or mock
dashboard. Keep the MVP deliberately narrow in systems, but do not
compromise the agreed core rules.

Prioritize, in order: 1. Correct, persistent, irreversible career state.
2. Deterministic scenario graph and validated content. 3. Strong
client-cycle simulation with distinct personas. 4. Fair, explainable
communication and business scoring. 5. Useful coaching and meaningful
consequences. 6. Readable, accessible visual-novel interaction. 7.
Reliable saves, session recovery, and security. 8. A complete
three-level vertical slice. 9. A clean architecture that supports the
future 30-level career without requiring a rewrite.

All gameplay content, decisions, reactions, scoring, coaching, rewards,
and outcomes in the MVP must be authored and deterministic. Do not add
runtime AI, hidden score manipulation, replay-to-undo behavior, or
social features to the MVP without a formal scope change.

When a requirement is unspecified, make a pragmatic developer
recommendation, document it, and keep it configurable wherever it
affects gameplay balance. Preserve the player's history, explain
consequences, and ensure that communication skill and sound business
judgment---not spending or exploiting the interface---drive success.
