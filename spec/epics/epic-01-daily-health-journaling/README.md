# Ignite Health — Specs (Source of Truth)

This folder is the canonical source of truth for Ignite Health product behavior, rules, and delivery.

If there is any conflict between:
- GitHub Issues
- Code
- Conversations or assumptions

The specs in this folder win.

---

## What’s in this folder

### Product specification (start here)
ignite-health-spec-v1.md

This document defines:
- product vision and goals
- guiding principles
- non-negotiable constraints
- high-level feature areas

All epics and stories must align with this document.

---

### Architecture & platform
architecture/

This folder contains:
- application architecture
- cloud/platform architecture
- environment strategy
- security and data boundary decisions

Architecture documents define how the system is built and deployed.
They do not redefine product behavior.

---

### Epics, use cases, and user stories
epics/

This is where day-to-day product development happens.

Each epic folder contains:
- README.md — epic-wide rules and invariants
- uc-*.md — concrete use cases and user stories with acceptance criteria

Epic README files define shared rules (for example: draft lifecycle, backdating).
Use case files define what the user does and what the system must do.

---

## Spec-first development workflow (required)

This project follows a spec-first development model.

1. Specs define behavior
2. GitHub Issues slice execution
3. Code implements specs
4. Tests validate acceptance criteria

GitHub Issues are execution tickets, not requirements documents.

---

## How to implement a GitHub issue (for humans and AI agents)

For any GitHub Issue:

1. Open the issue  
   Read the title and body.  
   Identify referenced spec file(s).

2. Open the referenced spec  
   Navigate to the epic folder.  
   Read the relevant use case file.  
   Locate the exact story and acceptance criteria.

3. Implement only what is defined  
   Do not invent requirements.  
   Do not implement adjacent stories “while you’re here”.

4. Write or update tests  
   Tests must map to acceptance criteria.  
   Use unit, integration, or E2E tests as appropriate.

5. Handle ambiguity correctly  
   If behavior is unclear or missing:  
   update the spec first, then implement.

6. Deliver via PR  
   PR must reference:
   - issue number(s)
   - spec file(s)
   - summary of changes
   - tests added or updated

---

## Rules to prevent drift

- Do not duplicate full requirements into GitHub Issues
- Do not change behavior without updating specs
- Do not resolve ambiguity by guessing
- If an issue conflicts with a spec, the spec wins

---

## Epic 1 — Daily Health Journaling

Primary working epic:
- epics/epic-01-daily-health-journaling/README.md
- epics/epic-01-daily-health-journaling/uc-01-morning-checkin.md
- epics/epic-01-daily-health-journaling/uc-02-evening-checkin.md
- epics/epic-01-daily-health-journaling/uc-03-daily-timeline-review.md
- epics/epic-01-daily-health-journaling/uc-04-edit-delete-entries.md

Backdating, draft lifecycle, and retrospective analytics flags are defined at the epic README level and apply to all related stories.