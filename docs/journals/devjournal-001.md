# Dev Journal #001 - Project Initialization & Epic 00 Backend

**Date:** 2026-01-16  
**Session:** Initial setup + FastAPI backend for Epic 00 (Foundation & Authentication)

---

## Context

Started building Ignite Health Now from scratch - a spec-first health journaling platform with:
- Cross-platform mobile (Flutter)
- Web portal (Next.js)
- Unified API (Python/FastAPI)
- Supabase for auth + database
- Google Cloud Run for deployment

**Critical principle:** Specs in `spec/` folder are the source of truth. This is NOT a code-first project.

---

## What We Built

### 1. Project Structure

Created monorepo structure:
```
/api          - FastAPI backend
/web          - Next.js (not started)
/mobile       - Flutter (not started)
/workers      - Background workers (not started)
/infra        - Deployment configs (not started)
/spec         - Product specs (already existed)
/docs         - Dev journals
```

### 2. FastAPI Backend (Epic 00)

**Tech Stack:**
- FastAPI 0.115.0
- Poetry for dependency management (chose over uv for better ecosystem support)
- Supabase client for database
- python-jose for JWT verification
- asyncpg for direct DB access (if needed)

**Structure:**
```
api/
├── app/
│   ├── core/           # Config, logging, settings
│   ├── middleware/     # JWT auth, request context
│   ├── models/         # Pydantic models
│   ├── routers/        # API endpoints
│   ├── services/       # Business logic
│   └── main.py         # FastAPI app
├── tests/              # (TODO)
├── schema.sql          # Database schema
├── pyproject.toml      # Poetry config
└── .env.local          # Secrets (gitignored)
```

**Endpoints Implemented:**
- `GET /health` - Public health check
- `GET /me` - Protected identity endpoint (returns user_id from JWT)
- `GET /profile` - Get profile (bootstraps if missing)
- `PATCH /profile` - Update profile
- `PUT /profile/properties/{key}` - Set key-value property
- `DELETE /profile/properties/{key}` - Delete property

---

## Database Design Decisions

### Schema: `pii.user_profile`

**Final Structure:**
```sql
create table pii.user_profile (
  user_id uuid primary key references auth.users(id),
  first_name text,
  last_name text,
  mobile text,
  zipcode text,
  birth_month integer check (1-12),
  birth_year integer check (1900 to current year),
  display_name text,
  handle text,
  created_at timestamptz,
  updated_at timestamptz
);
```

**Key Decisions:**

1. **NO `email` column**
   - **Why:** Supabase Auth is the system of record for email
   - **Benefit:** Avoids data duplication and drift
   - **How to get email:** Extract from JWT claims or query Supabase Auth when needed

2. **All fields nullable**
   - **Why:** Allows profile bootstrapping immediately on signup
   - **Spec compliance:** Spec says fields are "required (blocking gate)" but enforced at app/API level, not DB constraint
   - **Benefit:** More flexible onboarding flow

3. **Birth year constraint uses `extract(year from now())`**
   - **Why:** Upper bound of 2100 was arbitrary and too permissive
   - **Benefit:** Prevents invalid future dates automatically

4. **Partial unique index on handle**
   - **Why:** Handle can be NULL initially (generated when profile completes)
   - **SQL:** `create unique index user_profile_handle_unique on pii.user_profile(handle) where handle is not null`
   - **Benefit:** Uniqueness enforced only when handle exists

5. **NO database trigger for handle generation**
   - **Initial attempt:** Created trigger to auto-generate handle + display_name
   - **Problem:** Business logic in DB is hard to test, debug, maintain
   - **Decision:** Keep generation in API (`profile_service.py`)
   - **Benefit:** Testable, flexible, follows "thin database" principle

### RLS Policies

All policies use `to authenticated` and include both `USING` and `WITH CHECK` clauses:
```sql
create policy user_profile_update_own on pii.user_profile
for update to authenticated
using (auth.uid() = user_id)       -- who can UPDATE
with check (auth.uid() = user_id); -- what values allowed after UPDATE
```

**Why WITH CHECK matters:** Without it, a user could theoretically change `user_id` to someone else's ID during update.

---

## Handle Generation Logic

**Location:** `api/app/services/profile.py` - `generate_unique_handle()`

**Algorithm:**
1. Sanitize `first_name`: lowercase, remove non-alphanumeric → base
2. Try base handle first
3. If collision: append 3-digit random discriminator (000-999)
4. Retry up to 10 times
5. Fail if can't find unique handle

**Called when:** Profile update makes it "complete" (all required fields filled) AND handle is NULL

**Display name default:** Set to `first_name` if user doesn't provide one

---

## Technical Challenges & Solutions

### 1. Poetry + Python 3.14 + asyncpg

**Problem:** Initial install failed - asyncpg 0.29.0 couldn't build C extensions on Python 3.14

**Error:**
```
error: call to undeclared function '_PyInterpreterState_GetConfig'
PEP517 build failed
```

**Solution:** Updated to asyncpg 0.30.0 which has prebuilt wheels for Python 3.14

**Lesson:** Bleeding edge Python versions can break native extensions. Always check for wheel availability.

### 2. Database Connection Issues

**Problem:** `setup_db.py` script failed with `socket.gaierror: nodename nor servname provided`

**Root cause:** Unclear (DNS resolution issue?)

**Workaround:** Applied schema manually via Supabase SQL Editor instead of script

**Decision:** For now, schema applied manually. Can revisit automated migrations later if needed.

### 3. Email Field Duplication

**Problem:** Originally included `email` in `pii.user_profile` 

**Issue:** Creates data drift with Supabase Auth (source of truth)

**Solution:** Removed email column entirely. API can extract email from JWT or query Supabase Auth API when needed.

---

## Authentication Flow

**JWT Verification:**
- Middleware: `app/middleware/auth.py` - `get_current_user_id()`
- Uses `python-jose` to decode JWT with Supabase JWT secret
- Extracts `user_id` from `sub` claim
- Sets in context var for structured logging

**Protected endpoints:**
```python
@router.get("/profile")
async def get_profile(user_id: str = Depends(get_current_user_id)):
    # user_id is verified and extracted from JWT
```

**Why not JWKS?** 
- Initially planned to fetch public keys via JWKS endpoint
- Simplified to symmetric key verification (Supabase JWT secret)
- Works for single Supabase project
- Could upgrade to JWKS if multi-tenant later

---

## Configuration Management

**Environment variables:**
- `SUPABASE_URL` - Project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side privileged key
- `SUPABASE_JWT_SECRET` - For token verification
- `DATABASE_URL` - Direct Postgres connection (for migrations)

**Storage:** `.env.local` files (gitignored)

**Loading:** `pydantic-settings` BaseSettings with automatic env parsing

**CORS:** Currently allows `localhost:3000` (web) and `localhost:8081` (mobile) for development

---

## Testing Status

**Unit tests:** TODO  
**Integration tests:** TODO  
**Manual testing:** ✅ Health endpoint works

**Next steps for testing:**
- Mock Supabase client
- Test JWT verification
- Test profile CRUD operations
- Test handle generation collision handling

---

## What's NOT Done Yet

1. Password recovery flow (UC 04) - endpoints exist but not fully implemented
2. Tests (Epic 00 acceptance criteria)
3. Email extraction from JWT (currently returns null)
4. Web client (Next.js)
5. Mobile client (Flutter)
6. Deployment configs
7. CI/CD pipeline

---

## Open Questions / Future Decisions

1. **Should we add email to profile response?**
   - Can extract from JWT claims
   - Or query Supabase Auth API
   - Which is better?

2. **Migration strategy?**
   - Currently manual SQL via Supabase dashboard
   - Should we use a migration tool (Alembic, etc.)?

3. **Logging strategy for production?**
   - Currently JSON structured logs
   - Need to integrate with Cloud Logging when deployed?

4. **Handle generation: what if 10 retries fail?**
   - Currently raises ValueError
   - Should we have a fallback strategy? (append timestamp, UUID suffix?)

---

## Commands Cheat Sheet

```bash
# API Development
cd api
poetry install                    # Install dependencies
poetry run uvicorn app.main:app --reload  # Run dev server
poetry run pytest                 # Run tests (when written)

# Database
# Apply schema: Use Supabase SQL Editor (manual for now)
```

---

## Resources

- Epic 00 Spec: `spec/epics/epic-00-foundation-auth/`
- Architecture: `spec/architecture/`
- WARP Rules: `WARP.md`
