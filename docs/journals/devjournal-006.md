# Dev Journal #006 — Fix /profile 500s (PII schema + missing row handling)
## Context
/profile was returning 500 locally: first for schema permission/cache issues, then PGRST errors when no row existed. API calls were targeting `user_profile` with `.single()` and default schema, so missing rows or schema access caused failures.
## Decision(s)
- Query `pii.user_profile` and `pii.user_profile_properties` explicitly via `schema("pii")` across profile service methods.
- Remove `.single()` in `get_profile`; treat no rows as `None` rather than 500.
- Router now bootstraps when no profile exists and returns 200 with `is_complete=false` instead of 500.
- Tests updated with schema-aware fakes and a bootstrap/missing-profile assertion; HS256 flag test tightened.
## Rationale
- Aligns with Epic 00 PII isolation in `pii.*`.
- Avoids PostgREST “0 rows” and “permission denied” errors becoming 500s.
- Keeps UX stable: missing profile returns an incomplete profile instead of failing.
## Alternatives Considered
- Creating a public.user_profile for testing: rejected (breaks PII isolation).
- Silencing errors without fixing schema targeting: rejected (would mask real issues).
## Constraints / Gotchas
- Supabase project must expose/allow the `pii` schema and apply the migration.
- KMS dependency still required for real runs; fakes used only in tests.
## Follow-ups / TODOs
- None; monitor for additional schema-related access issues in Supabase environments.
