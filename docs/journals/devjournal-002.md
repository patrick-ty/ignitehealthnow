# Dev Journal #002 - Epic 00 Freeze: Auth, Profile, PII & Handles

**Date:** 2026-01-17  
**Scope:** Finalize Epic 00 (Auth + Profile) with KMS-backed PII encryption and handle policy

---

## What Was Completed
- Supabase Auth confirmed as the system of record; API validates JWTs issued by Supabase (no shadow auth).
- Profile gate enforced before main app access; dashboard/profile routes require a complete profile.
- Profile data persisted in `pii` schema with RLS policies applied (self-read/write only).
- PII fields encrypted at the service layer with envelope encryption and stored in `*_enc` columns.
- Handle/display_name logic updated to be plaintext, API-owned, and compliant with new policy.
- Tests added/updated for encryption roundtrip, profile read/write parity, handle uniqueness, and config failure paths.
- Epic 00 is now complete and frozen; further work moves to Epic 01.

## Database & PII Design Decisions
- PII isolated in `pii.*` to constrain blast radius and clarify ownership boundaries.
- Encrypted at rest (KMS envelope): `first_name`, `last_name`, `mobile`, `zipcode`.
- Not encrypted: `handle`, `display_name`, `birth_year` (needed in plaintext for UX/filters and low sensitivity).
- `birth_month` and full DOB intentionally excluded to avoid unnecessary identifiers and reduce risk surface.
- Encryption handled in the API service layer (not DB views/triggers) to keep logic testable and avoid DB key dependency.
- Handle generation remains API-only; DB enforces uniqueness via partial unique index but does not generate values.

## Handle & Display Name Policy
- Name-derived handles rejected to avoid leaking PII into public identifiers.
- Handle format: `<allowlisted_word><5 digits>`; words come from curated allowlist plus denylist/reserved filters loaded from resource files.
- External word lists: `api/app/resources/handle_allowlist.txt`, `handle_denylist.txt`, `handle_reserved.txt`.
- `display_name` is plaintext, optional, and defaults to the handle—never to decrypted names.
- Users may choose to enter PII into `display_name` explicitly, preserving user agency while reducing default exposure.
- This approach limits liability and prevents implicit PII leakage while keeping community identity usable.

## Security & Privacy Posture
- Envelope encryption with Google Cloud KMS: per-field DEK (AES-GCM), wrapped by KMS KEK, versioned envelope stored as `bytea`.
- Only sensitive fields are encrypted to balance performance and usability; handles/display_name stay plaintext for UX and lookup.
- RLS + API JWT validation provide tenant isolation: DB enforces `auth.uid() = user_id`; API enforces Supabase-issued tokens.
- Posture targets HIPAA awareness: minimal necessary PII, encryption where needed, no plaintext leakage in logs.

## Alternatives Considered (and Rejected)
- DB-level encryption triggers: rejected (hard to test, DB would need key access, less observable).
- Name-based handles: rejected (PII leakage risk).
- Storing full DOB / birth_month: rejected (unneeded identifier; reduces privacy).
- Encrypting all profile fields: rejected (handle/display_name must remain plaintext for UX; over-encryption hurts usability).
- Letting users pick handles freely in v1: rejected (risk of collisions, profanity, impersonation).

## Known Limitations & Follow-Ups
- Handle is not user-editable in v1.
- Wordlists require periodic review to stay clean and relevant.
- Community UX not yet implemented (future epic).
- Legal/privacy policy language still pending and must be drafted.

## Status
- Epic 00 is complete and frozen (Auth + Profile + PII + handle policy).
- Auth/profile layer is locked; further changes require spec updates.
- Next work starts in Epic 01 (Daily Health Journaling).
