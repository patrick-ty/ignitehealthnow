# Authentication & JWT Validation

## Purpose
Document the canonical authentication and JWT verification posture so future changes do not weaken security or drift from Epic 00 intent. This defines what is accepted, what is rejected, and why.

## Identity Provider
- Supabase Auth is the sole system of record for identity.
- Only JWTs issued by Supabase are accepted by the API.

## Token Verification Strategy
- RS256 is the required/default algorithm.
- JWKS are fetched from Supabase (`{SUPABASE_URL}/auth/v1/keys`) and cached with a bounded TTL.
- `kid` is used to select the correct key; missing/unknown `kid` → unauthorized.
- No local public keys are checked into the repo; JWKS is the source of truth.

## HS256 Handling (Explicitly Gated)
- HS256 is **not** accepted by default.
- HS256 is only allowed when **both** are true:
  - `allow_hs256_fallback = true`
  - `SUPABASE_JWT_SECRET` is configured
- Purpose: legacy/local dev compatibility only.
- Risk: leaving HS256 enabled unintentionally increases attack surface; keep it off in production.
- Local/dev note: when HS256 fallback is explicitly enabled with the shared secret, Supabase-issued HS256 access tokens are accepted for local testing. Production posture remains RS256 via JWKS.

## Uniform Authorization Failures
- All auth failures return 401 Unauthorized with a generic message.
- No differentiation between invalid/expired token, unknown `kid`, or unsupported algorithm.
- Rationale: prevents token oracle/probing and avoids leakage of validation details.

## Threats Explicitly Mitigated
- Algorithm confusion attacks.
- Key confusion / misuse of wrong key material.
- Token probing or enumeration via differentiated errors.
- Information leakage through verbose auth error messages.

## Non-Goals
- No role/permission system (yet).
- No custom token issuance.
- No API-side session state.

## Relationship to Specs & Code
- UC 00.2 — API Authentication defines behavioral expectations.
- `api/app/services/auth.py` implements these rules.
- `docs/journals/devjournal-003.md` records implementation history (non-authoritative).
