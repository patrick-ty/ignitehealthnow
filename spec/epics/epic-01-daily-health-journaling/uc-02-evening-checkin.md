# Use Case 2 — Evening Check-In

## Story 2.1 — Start Evening Check-In from Add button
**As a user**, I want to start my Evening Check-In easily so I can reflect on my day before sleep.

### Acceptance Criteria
- Add action includes “Evening Check-In”
- Date defaults to today (timezone-aware)
- If none exists for today, create entry with `status = DRAFT` and launch step 1

## Story 2.2 — Enforce “one Evening Check-In per day”
**As a user**, I should not be able to create more than one Evening Check-In for the same day.

### Acceptance Criteria
- If entry exists for selected date:
  - If `DRAFT`, resume wizard
  - If `SUBMITTED`, open view mode with option to edit (per edit rules)

## Story 2.3 — Evening Check-In date picker (any past date + recall warning)
**As a user**, I want to select a date for my Evening Check-In so I can log missed days responsibly.

### Acceptance Criteria
- User may select any past date
- If selected date ≤ (today − 2 days):
  - show recall warning
  - require acknowledgement
  - mark entry as retrospective

## Story 2.4 — Reflection-first wizard flow
**As a user**, I want to reflect on how my day felt before diving into symptoms.

### Acceptance Criteria
- Wizard starts with reflection prompts (overall day, mood, energy)
- Physical/symptom questions follow

## Story 2.5 — Capture symptoms & signals
**As a user**, I want to log physical, emotional, and mental symptoms from the day.

### Acceptance Criteria
- Structured scales used where possible
- Optional free-text notes allowed
- Signals stored in normalized signal tables

## Story 2.6 — Save progress per step (draft persistence)
**As a user**, I want my answers saved as I go.

### Acceptance Criteria
- Answers persist after each step
- User can exit and resume later

## Story 2.7 — Review & submit Evening Check-In
**As a user**, I want to review my responses before submitting.

### Acceptance Criteria
- Review step summarizes key responses
- Submit sets status to `SUBMITTED`
- Entry appears in daily timeline

## Story 2.8 — Draft cleanup (36 hours)
**As a system**, I want stale Evening Check-In drafts cleaned up automatically.

### Acceptance Criteria
- Scheduled job deletes drafts older than 36 hours
- Submitted entries are never deleted

## Story 2.9 — Retrospective flags available for analytics and UI
**As a system**, I want backdated Evening Check-Ins clearly flagged.

### Acceptance Criteria
- Persist `days_late`, `recall_type`, and acknowledgement flag
- Analytics and charts can filter retrospective data