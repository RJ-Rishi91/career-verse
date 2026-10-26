# 06 · Content Authoring Guide

**CareerVerse v1.0 · Final · 2026-10-26**
How to write, check and publish scenarios and the other authored content: appreciation notes, greetings and badges. Level 1 (`content/scenarios/`) is the worked example of everything here.

---

## 1. What you author

| Content | Where it lives (seed source) | Edited after launch in |
|---|---|---|
| Scenarios (calls, emails, bosses, team, remediation, onboarding) | `content/scenarios/<ID>.json` | `/admin/content` |
| Scenario slots: order, prerequisites, objective | `setup/game/call_slots.json` | `/admin/content` |
| Characters (clients, teammates, cast) | `setup/game/clients.json`, `teammates.json`, `cast.json` | `/admin/characters` |
| Appreciation templates | `setup/game/appreciation.json` | `/admin/appreciation` |
| Greeting lines | `setup/game/greetings.json` | `/admin/greetings` |
| Badges, quests, shop, endings, glossary, delegation tasks | `setup/game/*.json` | `/admin/...` |

After seeding, the **database** is the source of truth. The JSON files are the starting point and the format reference.

## 2. Scenario anatomy

```json
{
  "scenario_id": "L1_MARCUS_STATUS_UPDATE",
  "version": 1, "status": "draft | in_review | published | retired",
  "level": 1, "client_id": "marcus-bell", "scenario_type": "status_update_call",
  "tags": ["coi", "deadline", "carrier"],
  "learning_objectives": ["clear_updates", "concrete_timelines"],
  "business_objective": "One sentence: what a good outcome is.",
  "title": "...", "teaser": "...",
  "known_facts": [{ "time": "9:40", "text": "COI request sent to the carrier" }],
  "rule_of_thumb": "Fact, then status, then the next step with a time.",
  "base_meters": { "trust": 5, "respect": 5, "anger": 6 },
  "opening_node_id": "d1",
  "review": { "domain_reviewer": null, "communication_reviewer": null, "reviewed_at": null, "notes": "" },
  "nodes": [{
    "node_id": "d1", "type": "decision", "speaker": "client", "consequential": true,
    "presentation": "sequential_commit",
    "line": "What the speaker says.",
    "options": [{
      "option_id": "A", "text": "The reply the player can say.",
      "reaction": "What the speaker says back.", "expression": "relieved",
      "next_node_id": "d2_plan", "ends_call": false,
      "effects": {
        "relationship": { "trust": 1, "respect": 2, "anger": -1 },
        "communication_7c": { "clear": 3, "concise": 2, "concrete": 3, "correct": 3, "coherent": 3, "complete": 2, "courteous": 1 },
        "business": 3
      },
      "critical_flags": [], "recovery": false, "tags": ["stayed_in_authority"],
      "coaching": { "worked": "...", "next": "...", "why": "..." }
    }]
  }]
}
```

**Shape rules:**
- 2–4 options per decision.
- 2–3 decisions per call.
- Bosses have 3 decisions.
- Every path must reach an ending option.
- A good default pattern:
  - `d1` has 3 options: the best reply, a plausible but flawed one, and a poor or critical one.
  - The best reply leads to `d2_good`; the others lead to repair nodes, where one option is a **recovery**.

**IDs and types:**
- IDs are `L<level>_<UPPER_SNAKE>` and must match a slot in `call_slots.json`.
- Expressions: `neutral`, `worried`, `pleased`, `relieved`, `frustrated`.
- Speakers: `client`, `mentor`, `executive`, `teammate`, `system`.

## 3. The 7C rubric (score each reply 0–3)

| C | 3 · Strong | 2 · Good | 1 · Needs work | 0 · Missing |
|---|---|---|---|---|
| **Clear** | Plain words, one idea per sentence | Mostly plain; one fuzzy phrase | Listener has to work to follow | Confusing or misleading |
| **Concise** | No wasted words | One sentence could go | Padding or repetition | Rambling or evasive |
| **Concrete** | Real facts, times, owners | Some specifics, some vague words | Mostly vague ("soon", "looking into it") | No facts at all |
| **Correct** | Accurate and within authority | Accurate with a loose phrase | Shaky or partly wrong | Wrong, or beyond authority (usually also a critical flag) |
| **Coherent** | Past → present → next, in order | Mostly ordered | Jumps around | Contradicts itself |
| **Complete** | Everything needed to act | Missing a fallback or detail | Missing the next step | Leaves the listener stuck |
| **Courteous** | Acknowledges the person and the pressure | Polite but brisk | Cold or defensive | Dismissive or rude |

**Business level (0–3):** 3 = protects the client and agency and moves the work forward; 2 = acceptable, with a small risk or gap; 1 = weak, no harm done; 0 = creates risk or harm.

**Relationship effects:** integers from −3 to +3 per meter per reply. A short-term "pleasing" overpromise may raise trust now (realistic). The critical flag and the incident carry the real cost.

## 4. Critical flags and recovery

| Flag | Use when the reply… | Severity |
|---|---|---|
| `commit_beyond_authority` | Promises something only someone else can do (adding an additional insured, promising a price or a date the carrier controls) | Severe |
| `confirmed_unverified_coverage` | Says something is covered or approved when only the carrier or adjuster can decide | Severe |
| `misstated_fact` | States something untrue (e.g. "all three quotes are in") | Major |
| `breached_privacy` | Shares another client's information | Severe |
| `abusive_tone` | Insults or belittles | Major |

A critical flag caps the business score and opens an incident. Mark the correcting option in a repair node with `"recovery": true`. Recovery downgrades the incident from severe to major, and both are kept in history.

## 5. Tags

- **Option tags** (`setup/game/tags.json → option_tags`) mark the skill a reply shows. Badges read them, for example `fallback_plan` (Plan B), `stayed_in_authority` (Boundary Keeper), `asked_clarifying` (The Right Question), `early_warning`, `promised_controlled_time`, `escalated_correctly`, `owned_mistake`, `empathy_first`, `root_cause`.
- **Scenario tags** (`scenario_tags`) mark the topic: `coi`, `renewal`, `claim`, `carrier`, `deadline`, `premium`, `feedback`, `team`, `finale`. Top Voice categories and craft badges read them.
- Tag only what the reply clearly demonstrates.

## 6. Coaching voice

- **worked:** what the player did well. Always find something true.
- **next:** one concrete change for next time.
- **why:** the business or relationship reason, in one or two sentences.

Write in plain verbs and sentence case, without blame. Keep each part to 25 words or fewer.

## 7. Insurance guardrails (every scenario)

- The player works for agencies. They can **request** an endorsement, a quote or a claim action; they can't **grant** one.
- Never present binding, confirming coverage, approving a claim or setting a premium as the right answer.
- Describing factual differences between quotes is fine. Recommending coverage is advice beyond the role.
- Use real trade terms correctly (see the glossary). If unsure, mark the scenario for the domain reviewer.
- Characters, companies and events are fictional. Avoid stereotypes. Persona style is independent of name or origin.

## 8. Persona styles (match client lines and notes to them)

| Style | Wants | Trigger |
|---|---|---|
| direct | Bottom line first, exact times | Vague answers |
| warm | Small talk, the why, email recaps | Premium surprises |
| detail | Documents, formal tone | Anything not in writing |
| anxious | Facts that reassure, frequent updates | Silence |
| skeptical | Evidence, sources | Sales-sounding lines |
| busy | Two-line messages, options | Being asked twice |
| formal | Courteous openings, titles | Casual tone |
| collaborative | Thinking together, being asked | One-way updates |

## 9. Appreciation templates

- **Client templates:** one per trigger × persona style. The triggers are `feedback_excellent`, `trust_9`, `turnaround` and `cycle_clean`.
- **Placeholders** (only these): `{player_first}` `{client_first}` `{client_full}` `{client_company}` `{topic}` `{c7}` `{task}` `{teammate_first}`.
- **Tone:** specific and human. The note names what the player did, never generic praise.

## 10. Greetings

- Lines must be 80 characters or fewer, written per time band (`up_late`, `early_bird`, `morning`, `midday`, `afternoon`, `evening`, `night_owl`) or per context (`first_session`, `promoted_today`, `streak_milestone_today`, `top_voice_month`, `comeback`, `monday_morning`, `friday_afternoon`, `weekend`).
- Use `{name}`. Keep it friendly and short.
- **Never** celebrate late-night play. Up-late lines can acknowledge it, and the subline suggests rest.

## 11. Badges

- Criteria use only the metrics in `setup/game/badge_metrics.json`, as `{"all":[{"metric","op":"gte","value"}]}`.
- **Tier ladders:** about 1–5, then 5–25, then 10–60.
- Secret badges reward discovery (e.g. Comeback).
- Art goes in `assets/badges/<id>.svg` (medal template; tier ring colour; category glyph).

## 12. Review and publish

1. **Write:** in `/admin/content` (or the JSON during the build), set the status to `draft`.
2. **Validate:** the validator must show zero errors. Locally, run `node tools/validate-content.mjs`.
3. **Communication review:** check the 7C and business levels against the rubric, the coaching and the tone.
4. **Domain review:** an insurance expert checks accuracy and authority boundaries and signs off in `review`.
5. **Publish:** only with both sign-offs. It becomes playable, and future attempts use the new version.
6. **Retire:** not delete. Players who already played keep their record.

## 13. Pre-publish checklist

- [ ] The objective is clear in one sentence, and every path ends.
- [ ] The best reply isn't the longest one, and a flawed reply isn't obviously silly.
- [ ] At least one recovery path follows each poor or critical reply.
- [ ] All seven Cs and the business level are scored against the rubric.
- [ ] Critical flags are on every authority or coverage overstep.
- [ ] Tags are accurate, and coaching is complete for every option.
- [ ] Trade terms are correct, with domain reviewer sign-off.
- [ ] The validator is green.
