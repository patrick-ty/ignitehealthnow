# Auth & Data Provider Contract — the seam that makes Supabase→GCP seamless

**Date:** 2026-06-26
**Status:** Contract spec. The current team builds to it now (on Supabase); the **gcp-auth dev** builds GCP adapters to the *same* interfaces later. Cutover = flip a config flag, all tests green, zero feature-code changes.
**Companion:** `2026-06-26-supabase-to-gcp-migration-design.md` (the runbook — *how* to swap). This doc is the *interface* both providers implement.

## 1. Why this exists

We are staying on Supabase now and moving to GCP (Identity Platform + Cloud SQL) later (memory `project_auth_migration_plan`). To make that swap painless, the app must depend on **provider-agnostic interfaces (ports)**, not on Supabase directly. Then:

- Today: Supabase **adapters** satisfy the ports.
- Later: the gcp-auth dev writes GCP **adapters** that satisfy the *same* ports.
- Cutover: select the GCP adapters via config. Feature code, business logic, and UI never change.

**Acceptance test for "seamless":** with the GCP adapters selected and the test DB pointed at Cloud SQL, the **entire existing test suite passes and no feature/business/UI file is touched.** If a swap requires editing feature code, the seam leaked — fix the seam, not the feature.

## 2. The ports (what every provider must implement)

### Port A — Token verification (API)
The API turns a request credential into a verified identity. Nothing downstream knows the provider.

```
interface TokenVerifier:
    verify(token: str) -> AuthClaims        # raises AuthError on invalid/expired

AuthClaims = { user_id: str, email: str | None }   # user_id = opaque provider UID
```
- **Supabase adapter (now):** RS256 via JWKS at `{supabase_url}/auth/v1/keys`, issuer/aud per Supabase. (Today's `services/auth.py` becomes this adapter.)
- **GCP adapter (later):** RS256 via Google secure-token JWKS, issuer `https://securetoken.google.com/<project>`, `aud=<project>`.
- Selected by `AUTH_PROVIDER=supabase|gcp` (config). The auth middleware depends only on `TokenVerifier`.

### Port B — Identity convention (everywhere)
- `user_id` is an **opaque UUID-shaped string** taken from the token's `sub`. No code parses it, assumes it indexes a provider auth table, or handles a provider-specific user object.
- **No foreign key to any provider auth table.** Every table stores `user_id uuid NOT NULL` + index, nothing more. Account-deletion cascade is **app-managed**, not a DB FK.

### Port C — User directory (admin ops)
For the profile service's display-name/avatar sync and account deletion.

```
interface UserDirectory:
    set_display_metadata(user_id: str, display_name: str, avatar_key: str) -> None
    delete_user(user_id: str) -> None
```
- **Supabase adapter (now):** `auth.admin.update_user_by_id` (today's `_sync_auth_metadata`).
- **GCP adapter (later):** Firebase Admin SDK `set_custom_user_claims` / `update_user` / `delete_user`.
- The profile service depends on `UserDirectory`, not on a Supabase client.

### Port D — Data access (API)
- Access Postgres through a thin **repository/store layer using psycopg + `DATABASE_URL`** — **never the Supabase client SDK.**
- **Key fact:** Supabase exposes a *direct Postgres connection string*. Connecting with psycopg works against Supabase Postgres **today** and Cloud SQL **tomorrow** with **no code change — only `DATABASE_URL` differs.** The RAG `cloud_functions/rag/core/store.py` is the reference implementation.
- Acceptance: repointing `DATABASE_URL` at Cloud SQL (+ the FK-less migration) requires zero data-layer edits.

### Port E — Client auth (web + mobile)
Feature/UI code calls an auth interface, never `@supabase/*` or `firebase` directly.

```
# Web (TS)
interface AuthClient:
    signIn(email, password) ; signUp(...) ; signOut()
    getIdToken() -> string                       # Bearer token for API calls
    onAuthState(cb)                              # client reactive state
# Web SSR (server)
    getServerSession() -> { user_id } | null     # for layout/middleware gating
    getServerToken() -> string | null            # token to call the API from the server

# Mobile (Dart) — AuthService abstraction (partially exists today)
    signIn / signUp / signOut / currentSession / getIdToken
```
- **Supabase adapters (now):** `@supabase/ssr` (web), `supabase_flutter` (mobile).
- **GCP adapters (later):** Firebase JS SDK + `next-firebase-auth-edge` (web SSR session cookies), `firebase_auth` (mobile).
- Acceptance: swapping the adapter touches only the adapter module + DI wiring — no screen, route, or feature component changes.

## 3. What the current team does NOW (cheap — this *is* building to the spec)

These create the seam while still on Supabase. They are small and mostly mechanical:

1. **API:** introduce `TokenVerifier` interface; make the auth middleware depend on it; move today's logic into `SupabaseTokenVerifier`. Add the `AUTH_PROVIDER` config switch (only `supabase` wired now).
2. **API:** introduce `UserDirectory` interface; move `_sync_auth_metadata` (and a `delete_user`) behind a `SupabaseUserDirectory`.
3. **API (the one real refactor):** move profile data access off the **Supabase client** onto **psycopg + `DATABASE_URL`** against Supabase's direct Postgres connection (mirror RAG `store.py`). This also deletes the `bytea` hex/base64 workaround (psycopg handles `bytea ↔ bytes` natively). After this, the data layer is already provider-agnostic.
4. **Web:** wrap auth behind an `AuthClient` interface (Supabase adapter); features/pages import the interface, not `@supabase/*`.
5. **Mobile:** keep feature code depending on the existing `AuthService` abstraction (Supabase adapter); don't let screens import `supabase_flutter` directly.
6. **Schema:** all new tables use `user_id uuid` + index, **no FK to `auth.users`** (matches the RAG migration convention). New migrations are numbered by a single owner.

> Doing #1–#6 as you build is the whole game: it keeps the future swap localized to *adapters*.

## 4. What the gcp-auth dev delivers LATER (built to §2)

- `IdentityPlatformTokenVerifier` (Port A), `FirebaseUserDirectory` (Port C), web `FirebaseAuthClient` + SSR session via `next-firebase-auth-edge` (Port E), mobile Firebase `AuthService` adapter (Port E).
- Cloud SQL provisioning + `DATABASE_URL` (Port D needs no code, just the new connection string + FK-less migration).
- The `AUTH_PROVIDER=gcp` wiring + DI selection.
- **Definition of done:** with `AUTH_PROVIDER=gcp` and `DATABASE_URL`→Cloud SQL, the full existing test suite passes and **no feature/business/UI file changed** in the diff. User import handled via `firebase auth:import` (bcrypt). See the runbook for sequencing/estimates (~2–3 weeks).

## 5. Guardrails (how the seam leaks — watch for these in review)

- A feature importing `@supabase/*` / `supabase_flutter` / `firebase` directly → must go through the Port E adapter.
- New code reading the Supabase user object or assuming `auth.users` exists → violates Port B (use the opaque `user_id` only).
- A new table with `references auth.users(id)` → violates Port B.
- New data access via the Supabase client instead of psycopg → violates Port D.
- Business logic calling `auth.admin.*` directly → must go through Port C.

Any of these in a PR = block; route it through the port instead.
