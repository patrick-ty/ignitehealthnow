# Ignite Health — Specs (Source of Truth)

This folder is the **canonical source of truth** for Ignite Health product behavior, rules, and delivery.

If there is any conflict between:
- GitHub Issues
- Code
- Conversations

👉 **The specs in this folder win.**

---

## What’s in this folder

### 1) Product overview (start here)
- `ignite-health-spec-v1.md`  
  Product vision, scope, constraints, and guiding principles.

### 2) Architecture & platform
- `architecture/`  
  Application + cloud architecture, environments, security boundaries, and operational design.

> Note: If you have a “Platform & Environment Spec” doc (e.g., the Cloud Run + Supabase + Pub/Sub + GCS blueprint), it belongs here.

### 3) Epics, use cases, and user stories
- `epics/`  
  The day-to-day working specs used to build the product.

Each epic folder contains:
- `README.md` — epic-wide rules/invariants
- `uc-*.md` — use cases and user stories with acceptance criteria

Example:
epics/epic-01-daily-health-journaling/
├── README.md
├── uc-01-morning-checkin.md
├── uc-02-evening-checkin.md
├── uc-03-daily-timeline-review.md
└── uc-04-edit-delete-entries.md

### 4) UI / mockups / interactive prototypes (supporting artifacts)
If present, these may live under one of the following (choose one convention and stick to it):
- `ui/` (recommended for HTML mockups, wireframes, screenshots)
- `prototypes/` (recommended for interactive HTML flows)
- `design/` (recommended if you later add Figma exports)

These artifacts are **supporting references**. The **written spec** remains the source of truth, but mockups help clarify intent and flow.

### 5) Frameworks and reference material
If present, store supporting strategy/framework docs here (or under a subfolder like `reference/`):
- canonical journal framework summaries
- tracking frameworks
- question banks and field dictionaries

---

## Standard development workflow (for humans and AI agents)

This project follows a **spec-first development model**:

1. Specs define behavior and rules  
2. GitHub Issues reference specs and slice work  
3. Code implements specs  
4. Tests validate acceptance criteria

Issues are **execution tickets**, not requirements documents. The canonical behavior always lives in the spec. Any non-trivial implementation should result in a devjournal entry (see `AGENT_INSTRUCTIONS.md`), and linking the journal in PR descriptions is encouraged.

---

## How to implement an issue (required process)

For **any GitHub Issue**:

1. Open the issue  
   - Read title and body  
   - Identify referenced spec file(s)

2. Open the spec  
   - Navigate to the exact epic + use case  
   - Read the relevant story and acceptance criteria

3. Implement **only** what is defined  
   - Do not invent requirements  
   - Do not implement adjacent stories “while you’re there”

4. Write/Update tests  
   - Tests must map to acceptance criteria  
   - Use unit, integration, or E2E tests as appropriate

5. Handle ambiguity correctly  
   - If something is unclear/missing:
     - update the spec first (PR)
     - then implement

6. Deliver via PR  
   - PR must reference:
     - Issue number(s)
     - Spec file(s)
     - Summary of implementation
     - Tests added/updated

---

## Rules to prevent drift
- Do **not** duplicate full requirements into GitHub Issues
- Do **not** change behavior without updating specs
- Do **not** resolve ambiguity by guessing
- If issue text conflicts with spec text → **spec wins**

---

## Epic 00 quick links (REQUIRED FIRST)
All other epics assume Epic 00 is implemented.

- `epics/epic-00-foundation-auth/README.md`
- `epics/epic-00-foundation-auth/uc-01-register-login.md`
- `epics/epic-00-foundation-auth/uc-02-api-auth.md`
- `epics/epic-00-foundation-auth/uc-03-profile.md`

---

## Epic 1 quick links
- `epics/epic-01-daily-health-journaling/README.md`
- `epics/epic-01-daily-health-journaling/uc-01-morning-checkin.md`
- `epics/epic-01-daily-health-journaling/uc-02-evening-checkin.md`
- `epics/epic-01-daily-health-journaling/uc-03-daily-timeline-review.md`
- `epics/epic-01-daily-health-journaling/uc-04-edit-delete-entries.md`

---

### Development journal
Engineering decisions and implementation context are recorded in:
- `docs/devjournal-XXX.md`

This is a supporting artifact and does not override specs.
