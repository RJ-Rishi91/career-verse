# CareerVerse --- Project Workspace

**Working title:** CareerVerse --- Business Communication Simulator\
**Project type:** Browser-first, mobile-friendly business career
simulation\
**Status:** Discovery and R&D; requirements consolidated from Game
Design Rounds 1--16.

## Purpose of this folder

This folder is the shared working context for product research, game
design, technical planning, and implementation. Use it to continue R&D
without repeatedly re-asking settled questions or accidentally changing
confirmed requirements.

## Read order

1.  `01_PRODUCT_VISION_AND_SCOPE.md` --- product intent, audience, MVP
    boundary.
2.  `02_GAMEPLAY_AND_CAREER_SYSTEMS.md` --- core loop, client
    relationships, career, scoring, consequences, economy.
3.  `03_SCENARIO_CONTENT_AND_LEARNING.md` --- scenario writing,
    communication framework, insurance guardrails, content workflow.
4.  `04_TECHNICAL_ARCHITECTURE.md` --- system architecture, persistence,
    deterministic branches, data model, security.
5.  `05_UX_VISUAL_DESIGN_AND_ACCESSIBILITY.md` --- visual direction,
    navigation, choices, accessibility.
6.  `06_ROADMAP_TESTING_AND_ACCEPTANCE.md` --- implementation sequence
    and release gates.
7.  `07_DECISION_LOG_AND_RND.md` --- confirmed decisions, open
    implementation questions, and research log.
8.  `MASTER_PROJECT_BRIEF.md` --- full consolidated developer-ready
    specification.

## Instructions for Claude

Act as a multidisciplinary product and engineering partner: game systems
designer, learning-experience designer, technical architect, UX
reviewer, and research analyst.

### Operating rules

-   Treat the master brief and decision log as the current source of
    truth.
-   Preserve confirmed requirements unless the project owner explicitly
    approves a change.
-   Clearly label statements as **Confirmed requirement**, **Developer
    recommendation**, **Research finding**, or **Open decision**.
-   Do not invent that the owner has approved a suggestion.
-   Do not start another broad questionnaire when a reasonable
    recommendation can be made. Ask only when a missing decision blocks
    useful work.
-   When conducting research, distinguish verified facts from
    assumptions and cite current, credible sources for claims that
    depend on external information.
-   Compare options against the project's constraints: no runtime AI in
    MVP, deterministic gameplay, server-authoritative state,
    irreversible decisions, maintainable scope, mobile responsiveness,
    accessibility, privacy, and cost.
-   Prefer small, testable deliverables over abstract discussion. When
    proposing architecture, include trade-offs, failure modes, and
    acceptance criteria.
-   Avoid scope creep. Put optional features in post-MVP unless the
    owner approves them for MVP.
-   Never weaken the no-undo rule or let consumables erase consequential
    career history.
-   Do not use runtime generative AI for player dialogue, scoring,
    client reactions, or coaching in the MVP.
-   Do not frame the product as an insurance-advice tool. Scenarios are
    educational simulations and must respect role/authority boundaries.

## Change-control protocol

When suggesting a change to an established decision: 1. Identify the
current requirement. 2. Explain the problem or evidence motivating the
change. 3. Present the proposed change and its trade-offs. 4. State
whether it affects MVP scope, data model, content, scoring, or
persistence. 5. Record it in `07_DECISION_LOG_AND_RND.md` as a proposal
until approved.

## Project goal

Build a polished, believable career simulation where communication skill
and sound business judgment drive progress. The MVP should be a
complete, playable three-level vertical slice, not a static mock-up or
generic quiz.
