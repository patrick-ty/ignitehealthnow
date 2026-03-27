# Epic 1 — Use Case 1: Morning Check-In (Wizard)

## Purpose
Capture the user’s starting state for the day with a human-friendly wizard: greeting/state first, then deeper questions. Structured data suitable for analytics.

## Preconditions
- User authenticated
- Timezone/locale set

## Key Constraints
- Only one Morning Check-In per user per calendar day (`date_anchor`)
- Date picker defaults to Today; any past date may be selected
- If selected date is older than yesterday (2+ days ago):
  - show recall warning
  - require acknowledgement to proceed
  - mark entry as retrospective for analytics
- Drafts stored via status and cleaned up if stale (>36h)
- “Older than yesterday” means selected `date_anchor` ≤ (today − 2 days) in the user’s timezone.

---

## Story 1.1 — Start Morning Check-In from Add button
**As a user**, I want to start my Morning Check-In from a clear “Add” action so I can begin logging with minimal friction.

### Acceptance Criteria
- Add action includes “Morning Check-In”
- Date defaults to today (timezone-aware)
- If none exists for today, create entry with `status = DRAFT` and launch step 1

### Tests
```gherkin
Scenario: Start Morning Check-In for today when none exists
  Given I am logged in
  And I have no Morning Check-In for today
  When I tap Add and select Morning Check-In
  Then a new draft Morning Check-In is created for today
  And the wizard opens on step 1
```

---

## Story 1.2 — Enforce “one Morning Check-In per day”
**As a user**, I should not be able to create a second Morning Check-In for the same day.

### Acceptance Criteria
- If entry exists for today:
  - If `DRAFT`, resume wizard at last saved step
  - If `SUBMITTED`, open view mode with option to edit (per edit rules)
- No “Create another” option for the same day

### Tests
```gherkin
Scenario: Open existing submitted entry instead of creating a second
  Given I already submitted today’s Morning Check-In
  When I select Morning Check-In again
  Then I see the existing entry
  And I cannot create another for today
```

---

## Story 1.3 — Morning Check-In date picker (any past date + recall warning)
**As a user**, I want to select a date for my Morning Check-In so I can log missed days, with guardrails that protect data quality.

### Acceptance Criteria
- Date selector defaults to Today
- User may select any past date (yesterday, last week, etc.)
- Selecting a date:
  - If entry exists for that date:
    - If `DRAFT`, resume wizard at last saved step
    - If `SUBMITTED`, open view mode with option to edit (per edit rules)
  - If no entry exists for that date:
    - Create a new `DRAFT` and open step 1
- If selected date is **older than yesterday** (2+ days ago):
  - Show a warning explaining recall accuracy concerns
  - Require explicit user acknowledgement to proceed
  - Persist flags so the entry is identifiable as retrospective (for analytics/ML)
- If selected date is **older than yesterday** (2+ days ago):
  - “Older than yesterday” is evaluated as `date_anchor` ≤ (today − 2 days) in the user’s timezone
### Tests
```gherkin
Scenario: Select a past date older than yesterday requires acknowledgement
  Given I am logged in
  When I select a date 7 days in the past for Morning Check-In
  Then I see a recall warning explaining potential inaccuracy
  And I must acknowledge to continue
  And the system creates/resumes the entry for that date with retrospective flags

Scenario: Select yesterday does not require the retrospective warning
  Given I am logged in
  When I select yesterday for Morning Check-In
  Then I can create or resume the entry without the retrospective acknowledgement gate
```

---

## Story 1.4 — Wizard structure: greeting questions first
**As a user**, I want the Morning Check-In to start with “how do you feel” before sleep details.

### Acceptance Criteria
- The first wizard step(s) are greeting/state questions
- Sleep questions appear after greeting steps

---

## Story 1.5 — Save progress per step (draft persistence)
**As a user**, I want my answers saved as I go.

### Acceptance Criteria
- Answers are saved after each step (or on Next)
- User can exit and resume later the same day with prior answers populated

---

## Story 1.6 — Photo capture (0–5 photos) inside Morning Check-In
**As a user**, I want to optionally add up to 5 photos during the Morning Check-In.

### Acceptance Criteria
- User may add 0–5 photos
- Permissions denied does not block completion
- Photos are linked to entry

---

## Story 1.7 — Review & submit Morning Check-In
**As a user**, I want to review my answers and submit my Morning Check-In.

### Acceptance Criteria
- Review step shows key responses and attached photos
- Submit changes status to `SUBMITTED`
- Entry appears in the daily timeline

---

## Story 1.8 — Draft cleanup (36 hours)
**As a system**, I want stale drafts cleaned up daily.

### Acceptance Criteria
- Scheduled job runs daily
- Deletes `DRAFT` entries older than 36 hours
- Does not delete `SUBMITTED` entries
- Cascades to dependent data (signals/assets) or otherwise prevents orphans

### Tests
```gherkin
Scenario: Delete stale drafts older than 36 hours
  Given a draft older than 36 hours
  When the cleanup job runs
  Then the draft and dependent records are deleted
```
---

## Story 1.9 — Retrospective flags available for analytics and UI
**As a system**, I want backdated entries clearly flagged so charts, correlations, and AI summaries can protect users from skewed data.

### Acceptance Criteria
- Entry captures retrospective metadata, including:
  - `days_late` (integer; difference between `created_at` date and `date_anchor`)
  - `recall_type` enum (e.g., `SAME_DAY`, `NEXT_DAY`, `RETROSPECTIVE`)
  - `acknowledged_recall_warning` boolean
- UI and reporting layers can filter on these flags
- Default analytics views may optionally exclude retrospective entries (toggle in Epic 6)

### Notes
- Exact field names can evolve, but the capability must exist.