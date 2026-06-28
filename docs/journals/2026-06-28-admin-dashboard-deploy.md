# Session Journal — Admin Dashboard (first slice) build, local e2e, and deploy

**Date:** 2026-06-28
**Scope:** Stood up the standalone admin dashboard (`admin/`) + `/admin/*` API, verified end-to-end locally against real Supabase, and deployed to Cloud Run.

---

## 1. What shipped

A standalone Next.js admin app (`admin/`, separate Cloud Run service) gated by an
email allowlist, with a live **Content & Social** kanban backed by new `/admin/*`
endpoints in the unified FastAPI, an embedded Advocate launcher, a **Dashboard**
landing (placeholder content), and a header profile/sign-out menu.

Built via Subagent-Driven Development (16-task plan, `.superpowers/sdd/progress.md`),
then polished and deployed interactively.

### Live services
| Service | Revision | URL |
|---|---|---|
| `ignitehealth-api` | `ignitehealth-api-00009-lbc` (image `sha256:c67d451…`) | https://api.ignitehealthnow.com |
| `ignitehealth-admin` (new) | `ignitehealth-admin-00001-q7r` | https://ignitehealth-admin-h6nxnovkfa-uc.a.run.app |

### Custom domain
- `admin.ignitehealthnow.com` → domain mapping **created**; `admin` CNAME already `ghs.googlehosted.com` so the managed **cert is provisioning** (usable via the run.app URL meanwhile).

---

## 2. Deploy steps performed (all ✓)
1. **Supabase migration** `0002_admin_content_posts.sql` applied to project `arxcpgonhrhdpzhgwexj` (via SQL editor). Table exists, RLS on, 0 rows.
2. **API rebuilt + redeployed** with the `/admin` router + the datetime fix. `ADMIN_EMAILS=carolyn@ignitehealthnow.com,patrick.ty@ignitedigitallabs.com` merged via `--update-env-vars '^|^…'` (pipe delimiter — value contains `@`/`,`). All existing env/secrets preserved.
3. **Admin Cloud Run service** built + deployed via `infra/scripts/deploy_admin.py` (bakes `NEXT_PUBLIC_API_URL=https://api.ignitehealthnow.com` + Supabase config; aborts if project ≠ `arxcpgonhrhdpzhgwexj`).
4. **CORS** merged (no replace) — `CORS_ORIGINS` now: `app.ignitehealthnow.com`, `admin.ignitehealthnow.com`, both web run.app URLs, both admin run.app URLs.
5. **Domain mapping** `admin.ignitehealthnow.com` → `ignitehealth-admin`.
6. **Admin accounts** provisioned in Supabase: `carolyn@ignitehealthnow.com` created; `patrick.ty@ignitedigitallabs.com` password reset. Temp passwords in gitignored `admin/.admin-credentials.local` (rotate before prod).

### Verification (prod)
- `api.ignitehealthnow.com/health` → 200; `/admin/me` (no token) → 403 (router present); `/admin/content/posts` → 403.
- Carolyn token → prod `/admin/me` → `{admin:true}`; `/admin/content/posts` → `{posts:[]}` (table reachable).
- CORS preflight from the admin origin → 200 with `access-control-allow-origin`.
- Admin service `/login` → 200; unauth `/` → 307 → `/login`.
- **Prod content-lifecycle smoke** (Carolyn token): create → draft, approve+schedule → **scheduled** (the datetime-fix path), then row deleted. Table clean.

---

## 3. Bug found + fixed via local e2e (`a050bbb`)
Testing the board against **real Supabase** (not the in-memory fake) surfaced:
`TypeError: Object of type datetime is not JSON serializable` in `approve_post`/`update_post`
— a raw `datetime` (`scheduled_for`) went into the PostgREST payload. `InMemoryContentRepository`
stored it fine so **unit tests passed**; only the live Supabase path failed. Fixed by ISO-serializing
`datetime`/`date` in `SupabaseContentRepository.create/update`, with a regression test (fake PostgREST
client requiring a JSON-serializable payload). API suite: 46/46.

## 4. Post-plan polish (committed)
- `f0e4b9f` — removed the self-register link from the admin login (admins are allowlist-provisioned).
- `1a7eadd` — **Dashboard** landing at `/` + streamlined 2-item icon nav (Dashboard + Content & Social); removed the 6 "Soon" placeholders, the `/`→`/content` redirect, and the `[slug]` coming-soon route; proxy gates `/` and `/content`.
- `2f27a3c` — header **profile menu** with sign-out (`POST /api/auth/signout`).
- `e4e621e` — added `admin/public/robots.txt` (noindex) so the Docker build's `public` COPY succeeds (the scaffold had no `public/`).

---

## 5. Follow-ups
- **`app.ignitehealthnow.com` DNS typo (web, not admin):** its CNAME points to **`gas`**.googlehosted.com instead of **`ghs`**.googlehosted.com → cert never provisioned → TLS failures (looks like a 404). **Fix at the registrar:** change `app` CNAME to `ghs.googlehosted.com` (matching `api`/`admin`).
- **`admin.ignitehealthnow.com` cert** is provisioning — recheck with `curl https://admin.ignitehealthnow.com/login` until 200.
- **Rotate temp admin passwords** before prod (`admin/.admin-credentials.local`). Note: patrick.ty's temp was exposed in a Playwright snapshot via browser autofill during verification — rotate it.
- **Brand asset:** `admin/public/brand/knot-white.png` is missing (404 → BrandLogo placeholder fallback); drop the real asset when available (same TODO as web).
- The final whole-branch review ran at `cb9ef23`; the post-review commits (datetime fix + UI polish + robots) are test/prod-verified but not formally re-reviewed.
- Dashboard content is **placeholder** (static sample data) — wire to real analytics in a later slice.
