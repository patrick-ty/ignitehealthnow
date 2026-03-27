# Dev Journal #007 — Fix profile update bytea payload encoding
## Context
Profile updates were failing with a 500 error: "Object of type bytes is not JSON serializable". Supabase updates were sending raw bytes for the encrypted `*_enc` columns, which the JSON encoder could not serialize.

## Decision(s)
- Encode encrypted payloads as Postgres bytea literals (`\\x...`) before sending them to Supabase.
- Accept both `\\x` bytea strings and base64 when reading encrypted columns, while continuing to decrypt as before.

## Rationale
- Supabase expects JSON-safe values for updates; raw bytes cannot be serialized.
- `bytea` literals are a native Postgres-compatible wire format and avoid changing the encryption envelope format.

## Alternatives Considered
- Base64 encoding at the DB boundary only: rejected; added ambiguity for bytea input and was less aligned with Postgres conventions.
- Switching to a JSONB column: rejected; breaks the Epic 00 `bytea` schema.

## Constraints / Gotchas
- Encryption and decryption must remain service-layer only; the DB never sees plaintext.
- KMS still required for real encryption; this change only fixes payload serialization.

## Follow-ups / TODOs
- None; monitor for any Supabase bytea edge cases in production.
