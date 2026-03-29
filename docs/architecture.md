# IgniteHealthNow — System Architecture

## Overview

IgniteHealthNow is a multi-platform health journaling system for hypothyroid patients. The system consists of:

1. **Unified REST API** — FastAPI (Python 3.14), deployed on GCP Cloud Run at `api.ignitehealthnow.com`
2. **Flutter Mobile App** — iOS + Android, primary user interface
3. **Next.js Web App** — Patient web access + Provider portal with role-based access
4. **Supabase** — PostgreSQL database with RLS, authentication provider
5. **GCP Services** — Cloud KMS (encryption), Cloud Storage (photos/assets), Cloud Run (API hosting)

## Principles

- **One API, all clients** — Flutter and Next.js both consume the same REST API. No BFF pattern.
- **Thin clients** — All business logic lives in the API. Clients render UI, handle local state, and delegate to the API.
- **Spec-first** — Specs in `spec/` and `docs/` are the source of truth. Code implements specs, not the reverse.
- **Journal types are independent** — Each journal type has its own table, API endpoints, and field config. Check-ins are orchestrators that compose journals.
- **Patient-controlled data** — Patients own their data. Providers only see data patients explicitly grant access to.

## Data Flow

```
Flutter App / Next.js Web
    │
    ├── Auth ──────────► Supabase Auth (JWT tokens)
    │
    └── All other calls ► FastAPI REST API (api.ignitehealthnow.com)
                             │
                             ├── Validates JWT (RS256/JWKS from Supabase)
                             ├── Business logic + validation
                             ├── PII encryption via GCP KMS
                             └── Supabase Postgres (RLS enforced)
                                  │
                                  ├── pii schema (encrypted profile data)
                                  └── public schema (journal data, RLS per user)
```

## Authentication Flow

1. User signs up/in via Supabase Auth (email/password, future: passkeys)
2. Supabase issues a JWT (RS256 signed)
3. Client stores the JWT and sends it as `Authorization: Bearer <token>` on all API calls
4. FastAPI middleware validates JWT via Supabase JWKS endpoint
5. User ID extracted from JWT `sub` claim, used for RLS enforcement
6. Profile bootstrapped on first API call (idempotent)

## Flutter App Architecture

```
mobile/lib/
├── app.dart                     # MaterialApp, GoRouter, ProviderScope
├── config/
│   ├── env.dart                 # Environment config (Supabase URL, API URL)
│   └── constants.dart           # App-wide constants
├── models/                      # Freezed data classes
├── providers/                   # Riverpod providers (state + async)
├── services/                    # API client, auth, local storage
├── screens/                     # Screen widgets (one per route)
├── widgets/                     # Reusable UI components
└── theme/                       # ThemeData, colors, typography
```

**State Management:** Riverpod
- `AsyncNotifierProvider` for API-backed state (profile, journal data)
- `StateNotifierProvider` for local UI state (form values, navigation)
- Providers are the single source of truth; widgets rebuild reactively

**Navigation:** GoRouter with shell route for bottom nav
- Auth guard redirects to login if no session
- Profile gate redirects to profile setup if incomplete

**HTTP Client:** Dio with interceptor for JWT injection
- Base URL from env config
- Auth interceptor reads token from Supabase session
- Error interceptor maps API errors to typed exceptions

**Local Storage:** Hive for offline drafts and cached data
- Journal drafts saved per-card as user progresses
- Synced to API when connectivity available

## API Architecture (Existing)

- FastAPI 0.115.0, Python 3.14, Poetry
- Supabase client SDK for DB access
- JWT validation via python-jose (RS256/JWKS + HS256 dev fallback)
- PII encryption via GCP KMS envelope encryption
- RLS policies enforce per-user data isolation

**Existing endpoints:**
- `GET /health` — public health check
- `GET /me` — current user identity (authenticated)
- `GET /profile` — get/bootstrap profile (authenticated)
- `PATCH /profile` — update profile (authenticated)
- `PUT /profile/properties/{key}` — set property (authenticated)
- `DELETE /profile/properties/{key}` — delete property (authenticated)

**To be added:** Journal endpoints per the design spec.

## Database

- **pii schema** — encrypted user profile data (first_name, last_name, mobile, zipcode)
- **public schema** — journal data (per-journal-type tables), check-in orchestrator status
- **RLS** — all tables enforce `auth.uid() = user_id`

## Environments

| Environment | API | Database | Auth |
|---|---|---|---|
| Local dev | localhost:8000 | Supabase cloud (dev project) | Supabase Auth |
| Staging | api-staging.ignitehealthnow.com | Supabase cloud (staging) | Supabase Auth |
| Production | api.ignitehealthnow.com | Supabase cloud (prod) | Supabase Auth |

## Security

- JWT validation on every authenticated request
- PII encrypted at rest via GCP KMS (envelope encryption)
- RLS enforces per-user data isolation at database level
- No PII in logs (structured logging with user_id context var)
- CORS restricted to known origins
- HIPAA-aware posture (see spec/architecture/07-5-security-hipaa-ready-posture.md)
