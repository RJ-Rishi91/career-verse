# Gameplay and Career Systems

## 1. Main gameplay loop

1.  Review career goals, client risks, deadlines, and available
    missions.
2.  Prepare using client history, instructions, email, and relevant
    vocabulary.
3.  Handle a call or written communication through authored decisions.
4.  See a short contextual client reaction after each committed
    response.
5.  Receive detailed post-call coaching and a scorecard.
6.  Update client metrics, account status, tasks, deadlines, and
    incident history.
7.  Earn completion XP plus performance bonuses, coins, badges, and
    streak credit.
8.  Review portfolio health and next actions.
9.  Continue the persistent narrative and career.

Target session length: 10--20 minutes. Support save/resume across
sessions.

## 2. Client-cycle structure

Each client has: 1. Instruction/assignment call. 2. Work-status update
call. 3. Feedback/escalation call.

Additional calls can be added for complex incidents and major story
beats. Email missions belong inside the client cycle.

Full-game client counts: - Level 1: 3. - Level 2: 4. - Level 3: 5. -
Level 4: 8. - Levels 5--30: 10 per level.

## 3. Sequential choices and irreversible decisions

Each decision has 2--4 authored options, presented one at a time. The
player can commit to the current option or reject it to reveal the next
option. Rejected options cannot be revisited. An irreversible commitment
requires a preview/confirmation step. Once committed, the decision
cannot be undone.

Important implementation edge case: define deterministic behavior if all
options are rejected. Developer recommendation: either make the final
remaining option the only commit-able choice or provide an appropriate
explicit "take no action/escalate" option. Test comprehension with
first-time users. Do not introduce a hidden backtracking route.

Prevent refresh, multiple tabs, retries, or browser navigation from
undoing a committed decision or awarding duplicate rewards.

## 4. Client personas and relationship metrics

Client profiles should include: - Communication style and preferred
detail level. - Motivations, priorities, expectations, and triggers. -
Deadline sensitivity and urgency. - Account importance. - Prior
interaction and incident history. - Likely misunderstandings and
relevant domain context.

Track separate metrics on a 0--10 scale unless later validated
otherwise: - Trust: confidence in honesty, accuracy, and reliability. -
Respect: perceived professionalism, ownership, competence, and
judgment. - Anger: current frustration/escalation.

Initial values are scenario-specific. Ordinary interactions produce
gradual changes; major incidents may produce larger changes. Metrics
influence one another through explicit rules.

## 5. Client and portfolio dashboard

Show: - Client profile and communication preferences. - Green/amber/red
status with text labels/icons as well as color. - Trust, respect, anger,
importance, and risk. - Pending tasks, deadlines, incidents, and next
actions. - Recent interaction history and consequential decisions. -
Plain-language explanation of status changes.

Portfolio health combines weighted client/account measures with
critical-risk overrides. Inputs include relationship metrics, work
quality, deadline adherence, unresolved incidents/severity, account
importance, and client-specific modifiers.

## 6. Career progression

Thirty-level vision: - Levels 1--5: VA/individual contributor. - Levels
6--9: senior VA/specialist/emerging lead. - Level 10: full leadership
accountability transition. - Levels 11--20: Team Leader/Manager
progression. - Levels 21--29: senior leadership. - Level 30: Domain
Head.

Leadership begins progressively before Level 10. Every level has a
varied boss/capstone mission. Promotion gates may include completion,
performance, competencies, objectives, portfolio health, and a
review/boss mission. XP alone cannot promote.

Demotion may follow severe incidents, sustained poor performance,
account losses, failed leadership objectives, or a critical event
triggering review. Rules must be deterministic and explainable. Badges
and completed milestones remain recorded after demotion.

## 7. Scoring

Score separately: 1. Communication quality. 2. Business/task
effectiveness. 3. Role/career competencies.

Communication framework: 7Cs---Clear, Concise, Concrete, Correct,
Coherent, Complete, Courteous. Evaluate each C individually using
configurable weights and critical-failure rules.

Additional dimensions can include grammar, tone, empathy, comprehension,
problem-solving, client outcome, and career competencies.

One response may be best, but multiple legitimate responses can receive
partial credit. A polished response that causes a material business
problem must not receive a high overall score. Scores and rules must be
explainable.

## 8. XP, coins, badges, streaks

-   XP = base completion XP + performance-based bonus.
-   Use a gradually rising XP curve.
-   XP alone cannot promote.
-   Coins are earned through performance and in-world activity.
-   Badges are based on evidence of skill, not repetition or purchases.
-   One qualifying activity per day can count toward a streak.
-   Streak freezes are limited and capped.
-   Reminders are opt-in, configurable, and easy to disable.

Example badges: Problem Solver, Conflict Handling King, Master
Persuader, Master Negotiator, Master Presenter.

## 9. Shop and utility rules

Allowed direction: - Cosmetics and rank-unlocked avatar looks. - Capped
streak freezes. - Limited temporary support/assistance. - Carefully
controlled small boosts. - Potential limited anger-reduction item, only
if its effect is transparent and balanced. - Freelancers may help with
eligible routine tasks, but cannot make critical judgments or remove
player accountability.

Consumables cannot reverse committed decisions, erase incidents,
automatically restore lost clients, or guarantee promotion. No
pay-to-win. Any avatar trust effect should be tiny (proposed maximum
+1--2%) and preferably cosmetic-only if fairness testing supports that.

## 10. Failure and earned recovery

Severity categories should distinguish: - Minor mistake: coaching and
small changes. - Material but recoverable issue: incident record and
corrective task. - Severe incident: significant account risk, formal
review, possible loss/demotion depending on context. - Irreversible
business outcome: persists even if later actions create new
opportunities.

Recovery actions may include acknowledging the error, correcting the
issue, gathering missing facts, escalating appropriately, providing a
realistic timeline, and following through. Recovery is never guaranteed
and never deletes history.

## 11. Narrative and replayability

Use a persistent story arc, player-defined display identity, recurring
core cast, strategic rivals, professional drama, a career journal, and
multiple end states based on accumulated history.

Replayability is review-only: players can review completed content and
outcomes, but cannot replay to alter the persistent career or farm
rewards. There is no separate practice mode in MVP.

## 12. Post-MVP leadership and commercial systems

-   Meetings and decision-driven leadership.
-   Delegation using complexity, competency, workload, reliability,
    deadline, and supervision needs.
-   Distinct team-member profiles.
-   Diagnose → coach → follow up.
-   Capacity planning.
-   Client retention and recovery.
-   Lead pipeline and prospect discovery.
-   Pitching, value explanation, objection handling, bounded
    negotiation, and next steps.
-   Strategic trade-offs and international expansion.
-   Friends may later retain their own careers while receiving optional
    subordinate tasks that award bounded XP; social is not MVP.
