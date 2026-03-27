# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository Overview

**Ignite Health Now** is a health and wellness journaling platform with:
- Cross-platform mobile app (Flutter)
- Unified API backend (Python/FastAPI)
- Web portal (Next.js)

**Critical**: This repository follows a **spec-first development model**. All specs are the canonical source of truth.

## Spec-First Development Model (MANDATORY)

### Source of Truth Hierarchy
1. **Specs** in `spec/` folder (highest authority)
2. GitHub Issues (execution slices only)
3. Code (implements specs)
4. Conversations (lowest authority)

**If there is any conflict, specs always win.**

### Required Workflow for ANY Task

When implementing a GitHub Issue:

1. **Read the issue** and identify referenced spec files
2. **Navigate to spec folder**:
   - Read the epic `README.md` 
   - Read the specific use case (`uc-*.md`)
3. **Implement only what is explicitly defined**
   - Do NOT guess missing behavior
   - Do NOT implement adjacent stories
   - Do NOT "improve" UX without spec changes
4. **Write/update tests** that map to acceptance criteria
5. **Stop when done** - do not continue to next issue automatically

### Handling Ambiguity (CRITICAL)

If anything is unclear, missing, or contradictory:

❌ **NEVER** guess or invent requirements  
✅ **ALWAYS**:
1. Stop implementation
2. Propose a spec change (diff or markdown update)
3. Wait for confirmation before proceeding

### Scope Control

You are **NOT allowed** to:
- Refactor unrelated code
- Add new endpoints not in the issue
- Add new tables, fields, or events without spec updates
- Rename things for "cleanliness"

Implement the **smallest valid implementation** that satisfies acceptance criteria.

## Architecture Constraints (Hard Rules)

### Technology Stack
- **Auth**: Supabase Auth (passkeys preferred)
- **Backend**: Python/FastAPI
- **Mobile**: Flutter (iOS + Android)
- **Web**: Next.js
- **Database**: Supabase Postgres with RLS
- **Storage**: Google Cloud Storage
- **Async**: Pub/Sub
- **Compute**: Cloud Run

### Design Principles
- **Thin clients**: UI rendering + basic validation only
- **Server-side logic**: All business rules enforced in API
- **Data isolation**: PII separated from health data (`pii.*` schema vs journaling tables)
- **Time-anchored data**: All entries have `occurred_at`, `date_anchor`, timezone-aware timestamps
- **One entry per day per journal type**

### Security & Privacy
- JWT validation via Supabase JWKS
- RLS enforced in database
- HIPAA-ready posture
- No diagnostic or prescriptive claims

## Spec File Locations

### Core Specs
- Product overview: `spec/ignite-health-spec-v1.md`
- Spec workflow guide: `spec/README.md`
- Architecture: `spec/architecture/`
  - Application architecture: `spec/architecture/application-architecture.md`
  - Cloud infrastructure: `spec/architecture/cloud-infrastructure.md`

### Epics & Use Cases
Located in `spec/epics/`:

**Epic 00 — Foundation & Authentication** (REQUIRED FIRST)
- `epic-00-foundation-auth/README.md`
- `epic-00-foundation-auth/uc-01-register-login.md`
- `epic-00-foundation-auth/uc-02-api-auth.md`
- `epic-00-foundation-auth/uc-03-profile.md`

**Epic 01 — Daily Health Journaling**
- `epic-01-daily-health-journaling/README.md`
- `epic-01-daily-health-journaling/uc-01-morning-checkin.md`
- `epic-01-daily-health-journaling/uc-02-evening-checkin.md`
- `epic-01-daily-health-journaling/uc-03-daily-timeline-review.md`
- `epic-01-daily-health-journaling/uc-04-edit-delete-entries.md`

Additional epics (02-08) exist for future implementation.

## Testing Requirements

- Tests **must** directly map to acceptance criteria in specs
- Prefer unit + integration tests
- Do NOT add snapshot tests unless specified in spec
- Failing tests = incomplete implementation

## Data Principles

### Time Anchoring
- All journal entries have `occurred_at` and `date_anchor` fields
- Timezone-aware timestamps required
- One entry per day per journal type (Morning/Evening)

### Draft Management
- Drafts stored in same tables as submitted entries (via status flags)
- Draft cleanup runs daily
- Remove drafts older than 36 hours

### PII Isolation
- User identity data in `pii.user_profile` table
- Health/journal data must NEVER be in `pii.*` tables
- User ID from Supabase Auth links identity to health records

## Stopping Condition

When issue acceptance criteria are satisfied:
1. **Stop**
2. **Summarize** what was done
3. **Reference**:
   - Issue number
   - Spec file(s)
   - Tests added

**Do NOT** continue to next issue automatically.

## When You Are Unsure

**Stop and ask.**

Silence or assumptions are considered failures in this repository.
