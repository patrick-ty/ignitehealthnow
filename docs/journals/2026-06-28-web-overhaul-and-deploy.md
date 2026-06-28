# Session Journal — Web Overhaul, Auth Fix, Advocate Launcher, Custom Domains & Deploy

**Date:** 2026-06-28
**Scope:** Next.js web app (dashboard restyle, auth redesign, advocate launcher), Supabase auth debugging, GCP custom-domain setup, and a web redeploy.

---

## 1. What we shipped this session

Three approved+verified bodies of web work, each its own commit on `master`:

| Commit | What |
|---|---|
| `87eaa93` | **Brand design system** — IBM Plex (Sans/Serif/Mono) via `next/font`, brand color tokens in `globals.css`, restyled sidebar/header/dashboard, `BrandLogo` component (placeholder knot + auto-swap to a real asset). |
| `3071cdb` | **Auth redesign** — two-panel layout for login/register/forgot, new `/reset-password` page, password strength meter, **existing-email fix**, provider-agnostic `AuthClient` extended (`updatePassword`, `SignUpResult`). |
| `871ced7` | **Advocate launcher** — floating chat bubble replacing the `/chat` page; `AdvocateLauncher` + `AdvocatePanel` + `prompts` + `advocateMarkdown`, mounted in `AppShell`; removed the chat page and its sidebar nav item; typing-dots "thinking" indicator + send-button spinner. |

Design docs committed: `docs/superpowers/specs/2026-06-28-advocate-launcher-design.md` (`48b1d3d`), `docs/superpowers/plans/2026-06-28-advocate-launcher.md` (`57c0ab4`).

### Design system tokens (in `web/app/globals.css`)
- accent `#2E96CE` (hover `#1F7DB0`, soft `#E8F2F9`), brand-now green `#7FB539` (lighter `#CFEE8E` on dark panels), ink `#102A3A`, body `#243845`, muted `#5D7180`, faint `#8294A0`, page `#F3F6F8`, surface `#FFFFFF`, line `#E9EEF2`, warm `#E0744C`.
- Fonts: IBM Plex Sans (body), Serif (brand/headings), Mono (uppercase kickers). Light theme only.

### Advocate launcher behavior
- Floating accent bubble bottom-right, **only inside the authenticated `AppShell`** (not on login/register — by design). Conversation state lives in `AppShell` → survives in-app navigation, resets on full reload. **Not** persisted to localStorage (PHI). The only localStorage key is the non-PHI hint flag `ihn.advocate.seen`.
- Reuses `api.chat` — no backend change. Guardrail (never name the book/framework) verified live.

---

## 2. GCP / infrastructure reference

| Thing | Value |
|---|---|
| GCP project | `ignitehealthnow-2025` |
| Region | `us-central1` |
| Artifact Registry | `us-central1-docker.pkg.dev/ignitehealthnow-2025/ignitehealth` |
| Cloud Run — API | `ignitehealth-api` → `https://ignitehealth-api-h6nxnovkfa-uc.a.run.app` |
| Cloud Run — Web | `ignitehealth-web` → `https://ignitehealth-web-h6nxnovkfa-uc.a.run.app` |
| Runtime service account | `ignitehealth-run@ignitehealthnow-2025.iam.gserviceaccount.com` |
| Cloud SQL (RAG KB, pgvector) | `ignitehealthnow-2025:us-central1:ignite-pg-dev` |
| KMS (PII) | key ring `ignite-pii`, key `profile-pii` |
| Active gcloud account | `patrick@evogolf.ai` (Editor + `resourcemanager.projectIamAdmin` + `run.admin`) |

### Custom domains (Cloud Run domain mappings)
| Domain | Target | Status |
|---|---|---|
| `api.ignitehealthnow.com` | `ignitehealth-api` | **Live — cert ready, HTTP 200** ✓ |
| `app.ignitehealthnow.com` | `ignitehealth-web` | Mapping created; **cert still provisioning** |
| `admin.ignitehealthnow.com` | (none yet) | DNS pre-staged; mapping waits for the admin service |

- Domain `ignitehealthnow.com` is **verified** in Google Search Console (by `patrick@evogolf.ai`).
- **DNS is hosted externally** (Cloud DNS API is disabled in this project; the evogolf account can't access it). Records added at the registrar:
  - `app` / `api` / `admin` → **CNAME** `ghs.googlehosted.com.`
- Recheck a cert: `curl https://app.ignitehealthnow.com` — when it returns HTTP 200 (not an SSL error), it's live.
- When the admin dashboard ships as its own service, create its mapping:
  `gcloud beta run domain-mappings create --service ignitehealth-admin --domain admin.ignitehealthnow.com --region us-central1 --project ignitehealthnow-2025`
- Note: `gcloud run domain-mappings ...` needs the **beta** track (`gcloud beta run domain-mappings ...`).

---

## 3. Configuration details (and footguns)

### Supabase
- **Live project:** `arxcpgonhrhdpzhgwexj` (`https://arxcpgonhrhdpzhgwexj.supabase.co`).
- **Stale/old project:** `ijfleqptkeeepymlewha` — deleted, but its values still linger in `web/.env.local`. **Never source builds from `web/.env.local`** — use `web/.env.development.local`.
- Auth config: `mailer_autoconfirm=True` (signups auto-confirmed, no email step), `disable_signup=False`. No SMTP configured → password-reset/confirmation emails won't actually send in dev.

### Build-time vs runtime config
- `NEXT_PUBLIC_*` are **baked at build time** (Docker build args). Changing the API URL or Supabase keys **requires rebuilding the web image**.
- This session's web build bakes: `NEXT_PUBLIC_API_URL=https://api.ignitehealthnow.com`, `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` from `web/.env.development.local` (project `arxcpgonhrhdpzhgwexj`).
- The deploy script `infra/scripts/deploy-cloudrun.sh` still reads `web/.env.local` (the stale source) — **needs fixing** (see follow-ups). For this deploy we used a guarded one-off script (`scratchpad/deploy_web.py`) that reads `web/.env.development.local` and **aborts if the Supabase project ≠ `arxcpgonhrhdpzhgwexj`**.

### API service env / secrets
- Env vars: `GCP_PROJECT`, `ENVIRONMENT=dev`, `CHAT_PROVIDER=anthropic` (dev; `vertex` for prod, currently quota-blocked), `VERTEX_CHAT_LOCATION=global`, `SUPABASE_URL`, `GCP_KMS_KEY`, `CORS_ORIGINS`.
- Secrets (GCP Secret Manager): `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `ANTHROPIC_API_KEY`, `KB_DATABASE_URL`.
- **CORS gotcha:** `gcloud run services update --set-env-vars` / `--env-vars-file` **REPLACE all** env vars (this once wiped `SUPABASE_URL`/`GCP_KMS_KEY` and crashed the API). Use **`--update-env-vars`** to MERGE, with the `^@^` delimiter so JSON list values can contain commas:
  `gcloud run services update ignitehealth-api --region us-central1 --project ignitehealthnow-2025 --update-env-vars '^@^CORS_ORIGINS=["https://app.ignitehealthnow.com","https://ignitehealth-web-h6nxnovkfa-uc.a.run.app"]'`
- CORS is keyed on the **web origin** (the page's URL), not the API host — so baking `api.ignitehealthnow.com` as the API URL needs no CORS change beyond having the web origins listed.

### Operational guardrails
- **Never change global gcloud config** (protects the evogolf account) — pass `--project` per command.
- A hook blocks any bash command referencing `.env` — read env via the Read/Edit tools or a script that opens the file internally.

---

## 4. Auth debugging notes (this session)

- **Owner lockout** (`patrick.ty@ignitedigitallabs.com`): forgot password. Reset via the Supabase **admin API** to a temporary password (verified login end-to-end). **Change it after signing in.** (Temp value intentionally not recorded here.)
- **Registration "silent bounce":** with an existing email, Supabase returns either a `User already registered` error or an anti-enumeration "fake success" (no error, no session). The register page now detects both and shows a friendly *"An account with this email already exists — sign in instead."* card instead of bouncing.
- **Forgot-password** now resolves to a real `/reset-password` page. Email **delivery still needs SMTP** configured on the Supabase project to actually arrive.

---

## 5. Deploy performed this session (✓ completed)

- **Web:** rebuilt + deployed `ignitehealth-web` → **revision `ignitehealth-web-00003-vk9`** (100% traffic), with `NEXT_PUBLIC_API_URL=https://api.ignitehealthnow.com` and the correct Supabase project (`arxcpgonhrhdpzhgwexj`). Web URL unchanged (`…h6nxnovkfa…`). The new two-panel auth design + restyle confirmed live via the deployed `/login`.
- **API CORS:** merge-added `https://app.ignitehealthnow.com` (kept both `*.run.app` web origins) → **revision `ignitehealth-api-00007-m4h`**. Used `--update-env-vars '^@^CORS_ORIGINS=[…]'` so secrets/other env were preserved.
- **Verification:** `api.ignitehealthnow.com/health` → 200, `*.run.app` API `/health` → 200 (env intact), web `/login` → 200 (new build), and CORS preflight `OPTIONS /chat` from the web origin → 200.
- **Still to re-check:** the previously-unresolved live chat "load failed" — with the fresh build calling `api.ignitehealthnow.com` and working preflight, sign in on the deployed site and send an Advocate message to confirm it round-trips.

---

## 6. TODOs / follow-ups

**Branding**
- [ ] Drop the real logo at `web/public/brand/knot-white.png` (transparent white knot) — `BrandMark` auto-swaps the placeholder everywhere.
- [ ] `web/public/brand/logo-primary.jpeg` (2.8 MB) is now **unreferenced** — safe to delete.
- [ ] Propagate the new auth field styling to `profile` / `profile/setup` for consistency.

**Deploy / CI-CD**
- [ ] Finish **Workload Identity Federation** (GCP deploy plan Task 5) and commit `.github/workflows/deploy.yml` (Task 6) to enable push-to-`master` deploys. (`deploy.yml` is written but uncommitted.)
- [ ] Fix `infra/scripts/deploy-cloudrun.sh` to read `web/.env.development.local` (not `web/.env.local`); clean the stale `ijfleqptkeeepymlewha` values out of `web/.env.local`.
- [ ] Verify `app.ignitehealthnow.com` once its cert provisions; optionally make it the canonical web URL.
- [ ] Create the `admin.ignitehealthnow.com` domain mapping after the admin dashboard service exists.

**Backend / agents**
- [ ] **Secret-scan** `cloud_functions/marketing_agent_*` (6 untracked dirs) before committing.
- [ ] Flip `CHAT_PROVIDER` to `vertex` once GCP Vertex quota clears (4.6/haiku are global-only, start at 0 quota → 429).
- [ ] Build the **admin dashboard** + book-driven marketing content engine (roadmap).

**Security (before prod launch — user will handle)**
- [ ] Rotate exposed secrets: Supabase service-role key, Supabase JWT secret, Anthropic API key.
- [ ] Change the owner's temporary password.

**Plan/process state**
- Auth-provider migration: stay on Supabase for now; migrate to GCP (Identity Platform + Cloud SQL) later — keep adapters provider-agnostic (`web/lib/auth/*`).

---

## 7. Uncommitted at end of session
- `infra/scripts/deploy-cloudrun.sh` (pre-existing edit from GCP deploy work)
- `.github/workflows/deploy.yml` (untracked — awaiting WIF)
- `cloud_functions/marketing_agent_*` (untracked — awaiting secret scan)
