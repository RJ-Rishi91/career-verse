# Technical Architecture and Engineering Requirements

## 1. Confirmed architecture direction

-   Custom backend.
-   Database-driven authored content.
-   Deterministic scenario graph.
-   Configurable scoring/rules.
-   Server-authoritative persistent state.
-   Hybrid save: server source of truth plus local cache/session
    recovery.
-   Transactional decisions.
-   Least-privilege security.
-   Privacy-minimal analytics.
-   Automated and manual testing.
-   Staged deployment.
-   Basic private admin workflow in MVP.

The exact stack is delegated to the developer.

## 2. Developer recommendation

Consider a maintainable TypeScript frontend, custom API/backend, and
relational database such as PostgreSQL. React/Next.js is one possible
frontend choice, not a locked requirement. The selected stack should be
justified against maintainability, team skill, hosting cost, security,
deployment simplicity, and transaction requirements.

A document database is also possible if it preserves transactional
integrity, versioning, queryability, and consistent career-state
updates.

## 3. Logical components

1.  Responsive frontend.
2.  Authentication/account recovery.
3.  Career/game-state API.
4.  Scenario/content delivery.
5.  Deterministic rules/scoring engine.
6.  Transactional decision processor.
7.  Persistence/database.
8.  Privacy-minimal analytics and opt-in feedback.
9.  Private content admin and publishing workflow.
10. Logging, monitoring, backups, and deployment pipeline.

## 4. Authoritative state

The server is authoritative for: - Committed/rejected decisions. -
Client relationships and account status. - Incidents and consequence
history. - Scores and scorecards. - XP, coins, badges, streaks,
promotions, demotions, level completion. - Career journal and endings. -
Active content/rules version.

The frontend may cache UI state, but must not independently award
rewards or modify career outcomes.

## 5. Transactional decision commit

For each decision: 1. Authenticate and authorize the user. 2. Verify
active career/session and expected current node/version. 3. Verify the
option is valid and available. 4. Verify it was not already committed or
rejected. 5. Apply effects in a transaction. 6. Record the decision and
effects in an immutable event history. 7. Award eligible rewards once.
8. Return authoritative state.

Use idempotency keys or equivalent duplicate-request protection. Handle
concurrent tabs, stale requests, and retries. Do not let client-provided
scores or balances be trusted.

## 6. Session recovery

-   Server is source of truth.
-   Local cache supports responsiveness and interrupted sessions.
-   On reconnect, reconcile from server state; do not overwrite newer
    server state with stale cache.
-   If a commit result is unknown, query authoritative state before
    retrying.
-   Test interruptions during dialogue, confirmation, commit, scorecard,
    and level transition.
-   Display "saved" only after durable server confirmation.

## 7. Deterministic content graph

Each node should have a stable ID, type, version, prerequisites,
content, options if applicable, and next-state rules. Use typed effect
data or approved rule identifiers rather than arbitrary executable code
in content records. Validate all graph references before publishing.

Scenario/content changes must be versioned. A new version must not
silently change the meaning of decisions already committed by a player.

## 8. Suggested domain entities

-   User and auth reference.
-   PlayerProfile.
-   CareerState.
-   CareerEvent/immutable event history.
-   Client.
-   ClientRelationship.
-   Account and incidents.
-   Mission.
-   ScenarioVersion.
-   ScenarioNode.
-   ChoiceOption.
-   ScoreRuleSet.
-   CallAttempt.
-   DecisionRecord.
-   Scorecard.
-   RewardLedger.
-   BadgeAward.
-   VocabularyItem and VocabularyProgress.
-   CareerJournalEntry.
-   FeedbackSubmission.
-   AdminUser and PublishAudit.

Names and normalization are implementation choices; concepts and
integrity guarantees are requirements.

## 9. Scenario schema example

Illustrative only; adapt to the chosen storage format:

``` json
{
  "scenario_id": "L1_CLIENT_A_UPDATE",
  "version": 1,
  "level": 1,
  "client_id": "CLIENT_A",
  "scenario_type": "status_update_call",
  "learning_objectives": ["clear_updates", "complete_information", "courteous_tone"],
  "business_objective": "Give a truthful update on an outstanding quote",
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
  ]
}
```

Do not treat this as the final schema. Validate types, effect bounds,
node reachability, scoring completeness, and approved rule identifiers.

## 10. Admin/content lifecycle

Use draft → review → publish. MVP requires a basic private workflow; a
full CMS can follow later.

Validation should catch: - Missing required fields. - Invalid or missing
node targets. - Unreachable nodes. - Duplicate IDs. - Invalid option
counts (2--4). - Missing learning objectives or scoring metadata. -
Missing critical-failure rules. - Broken prerequisites. - Unversioned
changes to published content.

Record who reviewed/published and when. Drafts must not be playable.
Published versions should be immutable; retire rather than silently
mutate them.

## 11. Authentication, security, privacy

-   Email authentication and account recovery.
-   Least-privilege roles and server-side authorization.
-   Secure transport, secret management, and secure session/token
    handling.
-   Data minimization; avoid collecting unnecessary sensitive data.
-   Privacy-minimal analytics and opt-in feedback.
-   Retention, deletion, backup, and account-closure procedures.
-   Rate limits and abuse protection.
-   Audit logs for admin publishing and consequential state changes.
-   No social-data collection in MVP.

## 12. Analytics

Measure only what supports product quality and learning: - Onboarding
completion. - Mission start/completion and abandonment. - Call
completion. - Scorecard views. - Level completion/progression gates. -
Choice-interface errors. - Save/reconnect outcomes and technical
errors. - Optional consent-based feedback.

Do not use analytics as a hidden scoring input or collect unnecessary
dialogue/free text.

## 13. Technical non-negotiables

-   Deterministic MVP outcomes.
-   No runtime AI.
-   Server-authoritative committed state.
-   No undo after decision commit.
-   Idempotent rewards.
-   Versioned content/rules.
-   Explainable score and relationship changes.
-   Secure role separation.
-   Recoverable connection interruptions.
