# UC 00.3 — Required Profile + Extensions

## Purpose
Ensure every authenticated user has a profile record in `pii.user_profile`, and enforce a blocking profile-setup gate before using the app.

## Story 00.6 — Profile bootstrap (idempotent)
As the system, I want to ensure a profile record exists for the authenticated user.

### Acceptance Criteria
- On first call to GET /profile (or during auth bootstrap), system ensures:
  - pii.user_profile row exists for user_id
- If it exists, do nothing (idempotent)
- Creation does NOT set required fields; profile may begin as incomplete

## Story 00.7 — Profile setup (blocking gate)
As a user, I must complete required profile fields before using the main app.

### Required fields
- first_name, last_name
- mobile
- zipcode
- birth_month (1–12), birth_year (reasonable bounds)

### Acceptance Criteria
- GET /profile returns:
  - profile fields
  - is_complete boolean derived from required fields
  - display_name (defaults to first_name if missing once completed)
  - handle (generated once completed; unique)
- PATCH /profile updates allowed fields
- Clients must gate entry to main app if is_complete=false (Profile Setup screen)
- display_name is optional:
  - if user omits it on completion, system sets display_name = first_name
- handle is auto-generated on completion:
  - sanitized lowercase(first_name)
  - if collision: append 3-digit discriminator with retries
  - unique constraint enforced

### Tests (Gherkin)
Scenario: Profile completion generates defaults and handle
  Given I am authenticated and my profile is incomplete
  When I submit required fields without display_name
  Then my profile is_complete is true
  And display_name equals first_name
  And handle is set and unique

Scenario: Two users with same first_name get unique handles
  Given two authenticated users with first_name "Patrick"
  When both complete profile
  Then their handles are different and unique

## Story 00.8 — Profile extensions (key/value properties)
As a user, I want to store additional profile info without changing core schema.

### Acceptance Criteria
- Support key/value properties:
  - key (namespaced): prefs.*, onboarding.*, notifications.*, community.*
  - value_json (json)
- Endpoints:
  - PUT /profile/properties/{key} sets value
  - DELETE /profile/properties/{key} removes value
- Only allow allowlisted keys (list maintained in spec or config)
- Must be tenant-isolated

## Security notes
- No PHI/health journaling data in profile or properties
- Treat profile data as PII; restrict access accordingly