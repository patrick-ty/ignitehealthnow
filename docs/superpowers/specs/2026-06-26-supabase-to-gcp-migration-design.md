# Supabase → GCP Migration — Design Spec

**Date:** 2026-06-26
**Status:** Approved design (pending user review of this doc), execution deferred — runs as a parallel thread, owned by a dedicated dev
**Related:** memory `project_auth_migration_plan`, `project_founding_principle`; `docs/superpowers/specs/2026-06-25-rag-cloud-function-design.md`

## 1. Purpose & Scope

Move the platform off Supabase onto a consolidated GCP stack so PHI processing lives under a **single cloud, single BAA, single IAM**. This is a full takeover: **auth and data both leave Supabase**.

- **Auth:** Supabase Auth → **GCP Identity Platform** (enterprise tier of Firebase Auth; JWT issuer, MFA-capable).
- **Data (incl. PHI):** Supabase Postgres → **Cloud SQL for PostgreSQL** (with `pgvector`).
- Everything else is already GCP (Cloud Run, Vertex AI, KMS, GCS, Pub/Sub, Secret Manager) and is unaffected.

**Why now is deferred but planned:** the team chose to ship app functionality first (memory `project_auth_migration_plan`). This migration runs on a **separate thread/dev**, in parallel with feature work, against the contract in §6.

### Out of scope
- The HIPAA BAA / plan procurement (separate compliance track — but the migration's whole point is to enable the single-GCP-BAA posture).
- AlloyDB (start on Cloud SQL; revisit only if vector/analytics scale demands it).
- Serving Claude via Vertex (related consolidation, separate decision).
- New product features (the parallel feature thread owns those).

## 2. Target Architecture

```
Clients (Flutter mobile, Next.js web)
   │  sign-in via Identity Platform SDK  →  Identity Platform (JWT issuer)
   │  Bearer <Firebase ID token>
   ▼
API (FastAPI, Cloud Run)
   • validates Firebase ID token (issuer securetoken.google.com/<project>,
     aud=<project>, JWKS from Google) → opaque user_id (the Firebase UID)
   • all business logic; data access via psycopg → Cloud SQL
   ▼
Cloud SQL for PostgreSQL (private IP, CMEK)
   • pii schema (KMS-encrypted profile)   • rag schema (pgvector, RLS+audit)
   • public/app schema (journals etc.)
```

No Supabase anywhere. The RAG cloud function (already psycopg + `DATABASE_URL`) simply points at Cloud SQL.

## 3. Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Auth provider | GCP Identity Platform | GCP-native; standard JWTs; MFA/SAML; user import tooling |
| Data tier | Cloud SQL for PostgreSQL + pgvector | Drop-in for existing Postgres schema; CMEK; private IP; one BAA with GCP |
| User key | **Firebase UID** as the opaque `user_id` (UUID-shaped string) | Same role Supabase `auth.users.id` played; clients/API already treat it as opaque |
| FK to `auth.users` | **Removed** everywhere | Identity Platform users do not live in your Postgres; `user_id` becomes a plain indexed column; cascade-on-delete handled by the app |
| Web SSR session | Firebase **session cookies** (Admin SDK) + Edge verification (`next-firebase-auth-edge` or `jose`) | Replaces `@supabase/ssr`'s auto-managed session; the biggest net-new piece |
| User migration | `firebase auth:import` with bcrypt hashes | Supabase stores bcrypt → users migrate **without** password resets |
| DB driver | psycopg3 (sync) + connection pool, via Cloud SQL connector | Same pattern as RAG `store.py`; replaces the Supabase client |

## 4. Component-by-Component Changes

### 4.1 API — JWT validation (`api/app/services/auth.py`, `core/config.py`)
- Swap JWKS source + claims: Supabase (`{supabase_url}/auth/v1/keys`, RS256) → Google Secure Token (`https://www.googleapis.com/.../securetoken@system`, RS256), issuer `https://securetoken.google.com/<project>`, `aud=<project>`.
- The RS256/JWKS verification *pattern already exists* — this is a source/claims swap, not new architecture. Drop the HS256 fallback.
- Config: replace `supabase_*` with `gcp_project`, Identity Platform settings; `DATABASE_URL` now points at Cloud SQL (via Secret Manager).
- **Est: ~1 day incl. tests.**

### 4.2 API — data access (`api/app/services/profile.py`)
- Rewrite ~6 Supabase-client operations (select handle, get profile, bootstrap insert, update, upsert property, delete property) to **parameterized psycopg SQL** + a shared connection pool (mirror RAG `store.py`).
- **`bytea` handling simplifies:** the `_encode_bytea`/`_coerce_bytea` hex/base64 dance exists to work around PostgREST's JSON encoding; psycopg round-trips `bytea ↔ bytes` natively — delete the workaround.
- **KMS envelope encryption is DB-agnostic — untouched.** This is the part that mattered; it carries over clean.
- `_sync_auth_metadata` (Supabase Auth Admin API) → **Firebase Admin SDK** (`set_custom_user_claims` / `update_user`) for display_name/avatar.
- Tests: `test_profile_encryption` / `test_profile_avatar_validation` currently stub the Supabase client → move to a fake DB layer or a gated real-Postgres fixture (same approach as RAG store tests).
- **Est: ~3–4 days incl. test refactor.**

### 4.3 Database migrations (`spec/migrations/`)
- New migration: provision schemas on Cloud SQL; **drop the `references auth.users(id)` FK** in `pii.user_profile` (and the `rag` tables) — `user_id` becomes `uuid NOT NULL` + index, no FK.
- App-managed cascade: when Identity Platform deletes a user (or via an admin action), the API deletes the user's rows.
- `pgvector` extension enabled on Cloud SQL (Cloud SQL supports it).
- **Est: ~0.5 day** (+ data migration below if/when there's data).

### 4.4 RAG cloud function
- **Minimal:** new Cloud SQL `DATABASE_URL` (Secret Manager) + the FK-less `02_rag_schema.sql`. The function is already psycopg/pgvector and provider-agnostic.
- **Est: ~0.5 day.**

### 4.5 Web — auth + SSR session (`web/`)
- Replace `lib/supabase/{server,client}.ts` with Firebase client SDK + Admin SDK init + a session helper.
- **Session-cookie bridge:** `/api/auth/session` route — client signs in (Firebase SDK) → posts ID token → Admin SDK `createSessionCookie()` → httpOnly cookie; rewire `/api/auth/signout`.
- **Middleware (`proxy.ts`):** replace `supabase.auth.getUser()` gate with Edge-compatible session-cookie verification (`next-firebase-auth-edge` strongly recommended to handle the Edge/Admin-SDK runtime wrinkle).
- **`(app)/layout.tsx`:** replace `supabase.auth.getSession()`; obtain a token the API accepts and Bearer it to `/profile` (decision: send the Firebase **ID token**; document the server→API token path).
- Rewrite `login` / `register` / `forgot-password` pages to Firebase SDK calls. **Remove the hardcoded test credential in `login/page.tsx`.**
- **Est: ~4–6 days** (≈3 with `next-firebase-auth-edge`). **This is the largest/riskiest item** — `@supabase/ssr` gives session-cookie storage + auto-refresh for free; Firebase makes you build it.

### 4.6 Mobile — auth (`mobile/lib/`)
- Replace `supabase_flutter` with `firebase_auth` + `firebase_core`; rewrite `services/auth_service.dart`, `providers/auth_provider.dart`, `models/auth_state.dart`; update `api_client.dart` to attach the Firebase ID token.
- Login/register/profile-setup/session/password-reset. Foundation-only surface today.
- **Est: ~2–3 days.**

### 4.7 Data migration (only if real data exists at cutover)
- At foundation stage there may be little/no real data → a **clean cutover** (recreate schema on Cloud SQL, no data move) is ideal.
- If data exists: export `pii.user_profile` + `user_profile_properties` (+ any app tables) → import into Cloud SQL; migrate users via `firebase auth:import` (bcrypt). PHI data movement is a **compliance event** — do it under the BAA, document it. **Strong preference: migrate before real PHI/users land** (memory `project_auth_migration_plan`).

### 4.8 Infra / provisioning
- Cloud SQL instance (private IP, CMEK, automated backups); Cloud SQL connector from Cloud Run; Identity Platform enabled (email/password provider, MFA policy); DB connection string in Secret Manager (per env); service-account IAM.
- Dev + prod (env-aware naming per `spec/architecture/04-2-environment-strategy.md`).
- **Est: ~1–2 days.**

**Total: ~2–3 weeks, one dev.**

## 5. Sequencing (within the migration thread)

1. **Foundation first:** provision Cloud SQL + Identity Platform (dev); land the new DB-access layer (psycopg pool) and the API JWT-validation swap behind the existing API contract.
2. Profile-service rewrite + migrations (FK-less) + RAG `DATABASE_URL` swap.
3. Clients: web SSR auth, then mobile auth.
4. Cutover/data migration (prefer clean cutover at foundation stage).
5. Decommission Supabase.

## 6. Contract for Parallel Work (this is what keeps the feature thread from colliding)

Both threads MUST honor:
- **`user_id` is an opaque UUID string from the validated JWT.** No code assumes Supabase internals or that the user exists in Postgres.
- **Data isolation is the explicit `WHERE user_id = $1` SQL filter** (RAG `store.py` is the model). Do **not** rely on Supabase `auth.uid()` RLS as the only layer; new tables get plain `user_id uuid` + index, **no FK to `auth.users`**.
- **Auth is centralized** — one JWT-validation point in the API (the swap surface). No feature wires directly to Supabase-only auth surfaces (auth-admin metadata, `@supabase/ssr` helpers).
- **New data access uses the psycopg/repository pattern**, not the Supabase client, so the migration doesn't have to rewrite feature code.
- **Migration file numbering** in `spec/migrations/` is coordinated (single owner assigns numbers) to avoid collisions.

If both threads honor this, the migration is a localized swap of (auth source + DB driver) and **no feature work is invalidated**.

## 7. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Web SSR session on Firebase (Edge runtime; server→API token) | Use `next-firebase-auth-edge`; decide ID-token-to-API path early; spike it first |
| Parallel-thread collision on DB layer | The §6 contract; migration dev lands the psycopg DB layer + numbering convention before feature thread writes new services |
| PHI data movement at cutover | Prefer clean cutover before real PHI; if not, do it under BAA as a documented compliance event |
| Identity Platform availability/region / CMEK setup | Verify region + CMEK in provisioning step (1–2 day infra task) |
| Hardcoded test cred in `login/page.tsx` | Removed during web auth rewrite |

## 8. Handoff Notes (for the dev taking this over)

- **Start here:** read this spec + memory `project_auth_migration_plan` + the RAG spec (the psycopg/`store.py` pattern you'll mirror).
- **Build order:** §5. **Don't break the §6 contract** — it's what lets the feature thread run in parallel.
- **The API is the boundary:** clients are thin; almost all real change is in the API (auth validation + data layer) + the web/mobile auth wiring. Business endpoints/shapes shouldn't change, so the feature thread keeps working against the same API contract while you swap internals.
- **Test parity:** keep the existing API test suite green throughout; refactor the profile tests to the gated-real-Postgres pattern (RAG store tests are the template).
- **Estimate:** ~2–3 weeks; the web SSR piece (§4.5) is the long pole — spike it first to de-risk.
- A task-by-task implementation plan (the executable handoff) follows this spec.
