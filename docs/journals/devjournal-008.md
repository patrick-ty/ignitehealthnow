# Dev Journal #008 — UI Identity Contract + System Avatar Picker
## Context
We needed to lock UI identity to the Profile DB (no email/auth metadata) and add a deterministic avatar picker using system assets. This also required API validation and UI wiring so the header/avatar are stable across refreshes and missing profile data.

## Decision(s)
- Enforced a Profile-DB-only identity contract in both API models/services and the web AppShell.
- Added deterministic system avatars (0–11) and an avatar picker in Profile Setup.
- Persisted `avatar_url` in the Profile DB with strict validation against system asset paths.

## Rationale
- Prevent PII leakage (email, auth metadata) into UI.
- Ensure cross-platform consistency for identity and avatars.
- Provide a stable, deterministic avatar when profile data is missing.

## Alternatives Considered
- Using Supabase auth metadata for UI identity: rejected (violates Profile DB source of truth).
- Random avatar assignment on each request: rejected (not deterministic).
- Upload-based avatar flow: deferred (out of scope).

## Constraints / Gotchas
- API validation must only allow `/avatars/system/avatar-{0..11}.png`.
- Web must not call extra APIs for greeting beyond the single `/profile` fetch.
- Lint/test gates must stay green across API + web.

## Follow-ups / TODOs
- Consider adding an explicit profile avatar upload flow (storage-backed) in a future epic.
