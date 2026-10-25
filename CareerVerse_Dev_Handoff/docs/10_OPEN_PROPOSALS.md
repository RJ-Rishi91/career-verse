# Open Proposals (not approved)

**Status:** Proposed · pending owner approval. Nothing here changes a confirmed requirement until it is recorded as approved in `07_DECISION_LOG_AND_RND.md`. Developers must build to the confirmed requirement until then.

| # | Proposal | Current confirmed requirement | Why | Affects | Status |
|---|---|---|---|---|---|
| P1 | Separate career **rank** from content **chapter**. Demotion or a failed gate changes rank/standing and adds a probation flag; content keeps moving forward. | Levels gate content; demotion possible; replay is review-only. | A failed gate or demotion currently leaves no playable content. | Data model, progression, content | Proposed |
| P2 | **Tiered lock-in.** Only decisions flagged `consequential` open the lock-in sheet; routine replies commit on "Say this". | Every irreversible decision needs preview/confirmation. | ~150 confirmations across 36 calls trains players to click through. | UX, content schema (`consequential`) | Proposed. Build with every decision consequential until approved. |
| P3 | **Seeded option order** per career + node, served by the server. | Option order unspecified. | A fixed order teaches "the best is last". | Content delivery, QA (deterministic per seed) | Proposed (prototype implements it) |
| P4 | **Exhaustion rule:** show "option n of N"; last option labelled and must be said; authors guarantee one defensible option. | Open decision #7. | Deterministic, no hidden backtracking. | UX, content validation | Proposed (prototype implements it) |
| P5 | **Anchored 7C rubric** (0–3 per C with example phrases); only relevant Cs scored per decision. | 7Cs scored individually with weights. | Consistency between authors; lower authoring cost. | Scoring, content | Proposed |
| P6 | Reserve an **`org_id`** in the schema now. | Audience: employees and general learners. | B2B (training firms) may be the stronger market; retrofitting tenancy is costly. | Data model only | Proposed |
| P7 | **Cobalt accent** `#2459E0` instead of the taste kit's deep teal. | Palette recommended, not locked. | Owner asked for bright. | Visual only | Proposed |
