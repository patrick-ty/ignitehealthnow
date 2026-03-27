# UC 00.2 — API Authentication (Supabase JWT)

## Purpose
The unified API (FastAPI) must authenticate requests using Supabase JWTs and expose minimal identity endpoints.

## Key Constraints (Non-Negotiable)

- The API MUST authenticate requests using Supabase-issued JWTs
- JWT validation MUST occur on every protected request
- RS256 tokens MUST be validated using Supabase JWKS
- HS256 tokens MUST be rejected by default
- HS256 validation MAY be enabled only via explicit configuration for legacy or development scenarios
- When HS256 validation is enabled, the Supabase JWT secret MUST be used
- Token validation failures MUST return a generic 401 response
- Error responses MUST NOT leak token contents or validation details
- See [Authentication & JWT Validation](../../architecture/authentication-and-jwt-validation.md) for the canonical architecture rules.

## Story 00.3 — Public health endpoint
As a system, I want a public health check endpoint.

### Acceptance Criteria
- GET /health returns 200 and basic status payload
- No auth required

## Story 00.4 — Protected identity endpoint
As a user, I want the API to recognize my identity when authenticated.

### Acceptance Criteria
- GET /me requires Authorization: Bearer <jwt>
- If no token: 401
- If invalid/expired token: 401
- If valid token: 200 and returns at minimum:
  - user_id (UUID)
  - email (if available from token claims; optional)
- JWT validation: accept **RS256 only** via Supabase JWKS (`/auth/v1/keys`); **HS256 is rejected by default** and may only be enabled explicitly for local/dev via config (never as the default posture).

## Story 00.5 — Request context propagation
As a system, I want downstream handlers to access the authenticated user_id.

### Acceptance Criteria
- Auth layer extracts user_id and makes it available to handlers (dependency / middleware)
- Structured logs include user_id (when present)
- No PHI or large tokens are logged

## Tests
- Unit tests for JWT verification logic (JWKS fetching mocked)
- Integration tests for /me unauthorized vs authorized behavior
- HS256 tokens are only accepted when explicitly enabled in config; RS256/JWKS is the default path.
