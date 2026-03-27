# Dev Journal #005 — Local Auth 401s & HS256 Fallback Guidance

## Context
Web login succeeded, but API calls to `/me` and `/profile` were returning 401 locally. Supabase access tokens are HS256 by default; the API is RS256-first with HS256 behind a gated fallback. Local runs need clear guidance to avoid auth failures.

## Decision(s)
- Keep RS256/JWKS as the canonical/default validation path.
- Allow HS256 only when `ALLOW_HS256_FALLBACK=true` and `SUPABASE_JWT_SECRET` are set in `api/.env.local`, for local/dev use.
- No code changes required; document the local HS256 fallback expectations and ensure tests cover gating behavior.
  - Verified `AuthService.verify_token` already branches RS256 via JWKS and HS256 via gated secret; HS256 remains reachable only when explicitly enabled.

## Rationale
- Aligns with the intended security posture (RS256 in production) while allowing realistic local testing with Supabase’s default HS256 tokens.
- Avoids inventing a new auth path or relaxing uniform 401 behavior.

## Alternatives Considered
- Switching Supabase to issue RS256 locally: possible but more setup friction; deferred.
- Accepting HS256 unconditionally: rejected (security regression).

## Constraints / Gotchas
- Ensure `ALLOW_HS256_FALLBACK` and `SUPABASE_JWT_SECRET` are loaded when running the API locally; otherwise HS256 tokens will 401.
- Env file must be in `api/.env.local` (or env vars set) when starting uvicorn from `api/`.
- Web client already sends the Supabase access_token; failures are API-side auth, not missing headers.

## Follow-ups / TODOs
- None beyond keeping the documentation in sync if auth posture changes.
