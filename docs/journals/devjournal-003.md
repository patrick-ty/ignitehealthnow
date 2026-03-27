# Dev Journal #003 - Epic 00 / Story 00.1 Supabase Auth Configuration

**Date:** 2026-01-17  
**Scope:** GitHub Issue #25 — Configure Supabase Auth and JWT validation for API (UC 00.1/00.2)

---

## What was implemented
- Added JWKS-based Supabase JWT validation with fallback to the Supabase JWT secret; caches keys and uses the project’s `/auth/v1/keys` endpoint (api/app/services/auth.py).
- Updated auth tests covering JWKS verification, secret fallback, missing `sub`, and invalid token handling (api/tests/test_auth_service.py).
- Ensured settings/env include Supabase URL/JWT secret already present; no schema changes required.
- Added config flag `ALLOW_HS256_FALLBACK` (default off). HS256 tokens are rejected unless explicitly enabled; RS256/JWKS remains the default path.
  - If enabled, HS256 requires a configured Supabase JWT secret; otherwise HS256 requests are rejected.
  - RS256 validation fixed to use Supabase JWKS (kid-matched, RSA key material) with a single generic 401 on failures; HS256 remains gated by the config flag.
  - Enforced RS256-only for Supabase tokens; any non-RS256 alg is rejected with a generic 401 to keep the surface strict.
  - Simplified AuthService branches: RS256 → JWKS, HS256 → gated secret, everything else → generic 401 (no unreachable branches).

## Why
- Story 00.1/00.2 requires API compatibility with Supabase-issued JWTs. JWKS support keeps verification aligned with Supabase’s signing keys and future key rotation while maintaining secret fallback for HS256 tokens.
- The HS256 flag exists to reduce surface area in production while keeping a controlled fallback for dev/test if needed.

## Constraints / Gotchas
- JWKS fetch errors fall back to the shared JWT secret to avoid hard failures in dev/test; production should keep KMS/network stable.
- Audience check remains disabled per spec (Supabase may omit/alter aud); signature/expiry still enforced.
- Tests mock JWKS fetch; no live Supabase dependency.
