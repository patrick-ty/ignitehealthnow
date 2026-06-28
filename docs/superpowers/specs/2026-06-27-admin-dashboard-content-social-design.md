# Admin Dashboard — First Slice: Shell + Access Gate + Content & Social + Embedded Advocate

**Date:** 2026-06-27
**Status:** Approved design — ready for implementation planning
**Scope:** First slice of the IgniteHealthNow admin dashboard. A new standalone Next.js app
(`ignitehealth-admin`) at `admin.ignitehealthnow.com` containing: a gated admin shell, a live
**Content & Social** screen backed by the unified API, and the embedded **Advocate** AI chat.

---

## 1. Goal

Stand up a separate, admin-gated marketing-ops dashboard whose first working screen — **Content &
Social** — lets an admin create, edit, approve/reject, and schedule social post drafts against live
data served by the unified API, with the consumer **Advocate** chat embedded as an operator tool.

Everything ships **fully isolated inside `ignitehealthnow-2025` + Supabase project
`arxcpgonhrhdpzhgwexj`** — **zero contact with the `evogolfplatform` project** or any evogolf
resource.

## 2. Context & key findings

- The web app (`web/`) is Next.js 16 (App Router, Tailwind v4) on Cloud Run `ignitehealth-web`, with
  a brand design system, Supabase auth (`AuthClient` adapter), `proxy.ts` route protection, and a
  thin `lib/api/client.ts` calling the unified FastAPI.
- The unified FastAPI (`api/`) holds all business logic; clients are thin. Routers today:
  `health`, `profile`, `chat`. Auth is a Supabase-JWT middleware.
- **No role/admin concept exists** in auth or the profile model today.
- `admin.ignitehealthnow.com` DNS/domain-mapping was pre-staged but has no service yet.
- **The `cloud_functions/marketing_agent_*` dirs are EvoGolf's marketing agents, not
  IgniteHealthNow's** — they are entangled with `evogolfplatform` (Firestore, Pub/Sub topics,
  service account `analytics-api-client@evogolfplatform`, secrets, `deploy.sh --project=evogolfplatform`)
  **and** with EvoGolf brand/content (golf-analytics prompts, `brand.py` "Evogolf brand voice",
  email `EvoGolf <hello@evogolf.ai>` / `agents@evogolf.ai`, `PATRICK_EMAIL=patrick@evogolf.ai`,
  listening keyword `"evogolf"`). **Decision: leave these dirs entirely untouched** — not deployed,
  not repointed, not deleted. Re-founding them as IgniteHealthNow agents is a separate future
  initiative (its own brainstorm/spec).
- **Data store decision:** per the documented project plan (*stay on Supabase for now to ship; build
  provider-agnostic; migrate to GCP later*), the Content & Social store is a **Supabase Postgres
  table** owned by the API behind a provider-agnostic repository interface — **no Firestore is
  introduced** in this slice.

## 3. Global Constraints

- **Isolation (hard):** No resource, credential, project ID, domain, email address, Pub/Sub topic,
  service account, or data may reference or touch `evogolfplatform` / `evogolf.ai`. All new
  resources live in `ignitehealthnow-2025` and Supabase project `arxcpgonhrhdpzhgwexj`.
- **Thin client / API trust boundary:** all business logic and the admin access decision live in the
  unified API. The admin frontend holds no secrets beyond the build-time `NEXT_PUBLIC_*` and the
  user's Supabase session.
- **Build-time config is baked:** `NEXT_PUBLIC_*` are Docker build args; the admin image bakes
  `NEXT_PUBLIC_API_URL=https://api.ignitehealthnow.com` and Supabase `arxcpgonhrhdpzhgwexj`
  (URL + anon key). A guarded build script must **abort if the resolved Supabase project ≠
  `arxcpgonhrhdpzhgwexj`**.
- **Light theme only.** Brand tokens and fonts match `web/` exactly (IBM Plex Sans/Serif/Mono;
  accent `#2E96CE`, brand-now `#7FB539`, ink `#102A3A`, etc.).
- **Advocate PHI rule:** conversation state is never persisted to `localStorage`; the only allowed
  key is the non-PHI hint flag `ihn.advocate.seen`. Advocate must never name/cite "the book" or
  "the framework".
- **GCP guardrails:** never change global `gcloud` config; pass `--project ignitehealthnow-2025`
  per command; never run destructive `gcloud` against `evogolfplatform`. A bash hook blocks commands
  referencing `.env` — read env via file tools or a script that opens the file internally.
- **Provider-agnostic data + auth:** the content store sits behind a `ContentRepository` interface;
  auth continues through the existing `AuthClient` adapter pattern so a later GCP migration is a
  localized change.

## 4. Architecture

### 4.1 Repository layout

A new top-level `admin/` directory, sibling to `web/`, is its own Next.js 16 / Tailwind v4 app.

**Carried over from `web/` by copy** (separate-app choice; a shared `packages/ui` package is an
explicit later-slice follow-up). Each copied file gets a one-line header comment noting its origin
(`// Copied from web/<path> — see spec 2026-06-27-admin-dashboard. TODO: extract shared packages/ui.`):

- Brand: `globals.css` tokens, Tailwind/PostCSS config, `components/brand/BrandLogo`.
- Auth/data libs: `lib/auth/*`, `lib/supabase/*`, `lib/api/client.ts`, `proxy.ts`.
- Advocate: `components/advocate/{AdvocateLauncher,AdvocatePanel,prompts,advocateMarkdown}`.

The mockup's `DCLogic` single-file prototype is a **visual/layout reference only** — re-implemented
as real React components, not ported as a runtime.

### 4.2 Components (admin app)

- `AdminShell` — sidebar/topnav chrome (brand header, nav groups), mounts `AdvocateLauncher` and the
  page header. Modeled on `web/components/layout/AppShell` but admin-nav.
- `app/(admin)/layout.tsx` — server layout: resolves session, calls `GET /admin/me`, redirects
  unauthed → `/login` and authed-non-admin → a "No access" page; renders `AdminShell` for admins.
- `app/login/page.tsx` + auth pages — ported two-panel login against the same Supabase project; the
  admin session cookie is scoped to the admin subdomain (no cross-subdomain SSO in this slice).
- Content & Social: `app/(admin)/content/page.tsx` + `components/content/{ContentBoard,
  ContentColumn,ContentCard,ContentComposer}`.
- Other nav items (Today/Overview/Programs/Members/Reports/Settings) render a simple "Coming soon"
  placeholder screen.

### 4.3 API additions (unified FastAPI)

- `api/app/routers/admin.py` — `GET /admin/me`, `GET/POST /admin/content/posts`,
  `PATCH /admin/content/posts/{id}`, `POST /admin/content/posts/{id}/approve`,
  `POST /admin/content/posts/{id}/reject`. All behind the existing Supabase-JWT auth middleware.
- `api/app/services/admin_content.py` — business logic over a `ContentRepository`.
- `api/app/repositories/content_repository.py` — `ContentRepository` protocol +
  `SupabaseContentRepository` implementation (service-role client). The protocol is the seam for a
  future Cloud SQL swap.
- `api/app/models/admin.py` — `AdminMe`, `AdminContentPost`, `AdminContentCreate`,
  `AdminContentUpdate`, `AdminContentApprove` Pydantic models.
- `ADMIN_EMAILS` added to `api/app/core/config.py` (comma-separated; parsed to a normalized set).

## 5. Access gate

- `GET /admin/me` → `{ "admin": bool, "email": str }`. The authed user's email (from the verified
  Supabase JWT) is compared, lowercased/trimmed, against the `ADMIN_EMAILS` allowlist. Non-admins
  get `admin: false` (HTTP 200, not 403 — the client decides UX).
- Every `/admin/content/*` endpoint additionally enforces admin membership server-side and returns
  **403** for non-admins (defense in depth — the gate is not just the `/admin/me` UX check).
- Admin app `proxy.ts` protects all `(admin)` routes (redirect unauthed → `/login`). The server
  layout performs the admin check via `/admin/me`.

## 6. Content & Social — data contract

### 6.1 `AdminContentPost`

| field | type | notes |
|---|---|---|
| `id` | string (uuid) | server-generated |
| `channel` | enum | `instagram` \| `x` \| `linkedin` \| `facebook` |
| `caption` | string | required |
| `hashtags` | string[] | may be empty |
| `status` | enum | `draft` \| `review` \| `scheduled` \| `published` |
| `scheduled_for` | ISO datetime \| null | required when `status=scheduled` |
| `source` | string \| null | freeform provenance note |
| `ai` | bool | author was AI (always `false` in this slice — manual authoring only) |
| `why_it_works` | string \| null | optional rationale |
| `created_at` | ISO datetime | server-set |
| `updated_at` | ISO datetime | server-set |

Kanban columns map 1:1 to `status`. `email`/`blog` channels from the mockup are **deferred** (email
is a separate agent/model in a later slice).

### 6.2 Endpoints

- `GET /admin/content/posts` → `{ posts: AdminContentPost[] }` (flat; client groups by `status`).
- `POST /admin/content/posts` (`AdminContentCreate`: channel, caption, hashtags?, source?,
  why_it_works?, status? default `draft`) → created `AdminContentPost`. Composer "new post".
- `PATCH /admin/content/posts/{id}` (`AdminContentUpdate`: any of channel/caption/hashtags/
  scheduled_for/source/why_it_works) → updated post. Composer "save".
- `POST /admin/content/posts/{id}/approve` (`AdminContentApprove`: `edited_caption?`,
  `scheduled_for?`) → transitions `draft`/`review` → `scheduled` (sets `scheduled_for`) or, if no
  time given, → `review`→ stays for scheduling. Concrete transition rules:
  - `draft` + no time → `review`
  - `draft`/`review` + `scheduled_for` → `scheduled`
- `POST /admin/content/posts/{id}/reject` → transitions any non-published status → `draft` (returns
  the post to authoring). (No hard delete in this slice.)

Actual *publishing* (`published`) is **out of scope** — there is no publish pipeline in this slice;
the column is readable but the UI does not execute a publish. `published` rows can exist via seed
data for visual completeness.

### 6.3 Storage

Supabase table `admin_content_posts` (snake_case columns matching the contract; `hashtags` as
`text[]`; `status`/`channel` as text with app-level enum validation). Accessed only by the API via
the service-role client through `SupabaseContentRepository`. A SQL migration file is added under
`api/` (alongside `schema.sql`).

## 7. Content & Social — screen behavior

- Four-column kanban (`draft`/`review`/`scheduled`/`published`) rendered from `GET …/posts`.
- `ContentComposer` slide-over: create (new post) and edit (open a card). Fields: channel selector,
  caption textarea, hashtags, optional source/why-it-works, schedule (date-time when moving to
  scheduled). Save → `POST` or `PATCH`.
- Card actions: **Approve & schedule** (opens composer's schedule step or approves with a chosen
  time → `approve`), **Reject** (→ `reject`), **Edit** (open composer).
- **Optimistic UI:** card moves/edits apply immediately and **roll back on API error**, surfacing an
  inline error toast/banner. Loading and empty states for each column.

## 8. Embedded Advocate

Ported `AdvocateLauncher` + `AdvocatePanel` + `prompts` + `advocateMarkdown`, mounted as the last
child in `AdminShell`. Reuses `api.chat` (no backend change). Same PHI rule (no persistence beyond
`ihn.advocate.seen`) and the no-book/framework guardrail.

## 9. Deploy & infra

- `admin/Dockerfile` + `admin/cloudbuild.admin.yaml` (mirrors `web/`), Artifact Registry image
  `…/ignitehealth/ignitehealth-admin`.
- Cloud Run service `ignitehealth-admin` (`us-central1`, `--allow-unauthenticated`), runtime SA
  `ignitehealth-run@ignitehealthnow-2025`.
- Domain mapping: `gcloud beta run domain-mappings create --service ignitehealth-admin --domain
  admin.ignitehealthnow.com --region us-central1 --project ignitehealthnow-2025` (DNS CNAME →
  `ghs.googlehosted.com.` already pre-staged).
- API CORS: **merge-add** `https://admin.ignitehealthnow.com` to `CORS_ORIGINS` via
  `--update-env-vars '^@^CORS_ORIGINS=[…]'` (never `--set-env-vars`, which wipes other env/secrets).
- API deploy: redeploy `ignitehealth-api` with `ADMIN_EMAILS` set (via `--update-env-vars`) and the
  new admin routers.
- Guarded admin build script (mirrors `scratchpad/deploy_web.py`): reads
  `admin/.env.development.local` internally, **aborts if Supabase project ≠ `arxcpgonhrhdpzhgwexj`**,
  bakes `NEXT_PUBLIC_API_URL=https://api.ignitehealthnow.com`.

## 10. Testing

- **API (pytest, mirrors `api/tests/test_chat_router.py`):**
  - `/admin/me`: admin email → `admin:true`; non-admin → `admin:false`.
  - `/admin/content/*`: list/create/edit/approve/reject against a **fake in-memory
    `ContentRepository`** (no live Supabase); 403 for non-admin on each content endpoint.
  - Pure mapper `record → AdminContentPost` and the approve/reject transition rules get direct unit
    tests.
- **Admin app:**
  - Unit-test pure helpers (admin-guard resolution, status→column mapping, optimistic-update reducer).
  - One Playwright happy-path smoke: login → `/content` board renders → approve a card → card moves
    column. Kept light, matching the repo's current test depth.

## 11. Out of scope (explicit later slices)

Members (Supabase profiles), Programs/cohorts, Overview/Reports analytics, `email`/`blog` content
channels, an actual publish pipeline, re-founding the EvoGolf agents as IgniteHealthNow agents,
cross-subdomain SSO, and extracting a shared `packages/ui`.

## 12. Risks & mitigations

- **Brand/auth/api duplication** between `web/` and `admin/`. Mitigated by origin-noting copied files
  and tracking the `packages/ui` extraction as a named follow-up. Acceptable cost of the
  separate-app choice.
- **No real admin RBAC yet.** The email allowlist is a deliberate first-slice simplification;
  migrating to profile roles / custom claims is a future slice. Enforced server-side so it is a real
  gate, not just UI.
- **Supabase as the content store** is the tier slated for eventual GCP migration. The
  `ContentRepository` seam keeps that swap localized.
