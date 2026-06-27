# GCP Deploy + CI/CD (MVP) — Design

**Goal:** Get the consumer app (Next.js web + FastAPI) running live on GCP Cloud Run in
`ignitehealthnow-2025`, with a GitHub Actions pipeline that auto-deploys on push to `master`.
MVP-first: simple and live now; production hardening (separate prod project, tagged-release
deploys, custom domains, CDN) is explicitly deferred.

**Approach decisions (from brainstorm 2026-06-27):**
- MVP deploy first, harden later.
- Web **and** API on **Cloud Run** (one platform, one pipeline, clean HIPAA/BAA story — both
  surfaces covered by the Google Cloud BAA).
- Single project `ignitehealthnow-2025` as the first environment (call it `dev`/staging).
- GitHub→GCP auth via **Workload Identity Federation** (keyless OIDC), not a SA JSON key.
- Deploy trigger: **push to `master`** (tighten to tagged `v*` releases later).
- URLs: default `*.run.app` first; custom domains (`api.ignitehealthnow.com`, app domain) later.

---

## Architecture

```
GitHub (push to master)
  └─ Actions: ci.yml (tests, existing)  ─ gate ─┐
  └─ Actions: deploy.yml (new)                  │  via Workload Identity Federation (OIDC)
       ├─ build + push images → Artifact Registry (us-central1)
       ├─ deploy ignitehealth-api  → Cloud Run
       └─ deploy ignitehealth-web  → Cloud Run
                                   │
Cloud Run (us-central1, ignitehealthnow-2025)
  ├─ ignitehealth-api  (FastAPI)  ── Cloud SQL connector ──> ignite-pg-dev (KB)
  │      └─ Secret Manager: Supabase keys, Anthropic key, KB DB URL
  │      └─ Vertex (embeddings) + KMS (PII) via service-account ADC
  └─ ignitehealth-web  (Next.js standalone)  ──HTTPS──> ignitehealth-api
```

## Components

### 1. Containers
- `api/Dockerfile` — slim Python base matching `pyproject` (`^3.11`), Poetry install (no dev),
  run `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Cloud Run sets `$PORT`.
- `web/Dockerfile` — Node 20, multi-stage: `npm ci` → `next build` → run the standalone server.
  Requires `output: 'standalone'` added to `next.config.ts`.
- The three `NEXT_PUBLIC_*` vars are **build args** (baked into the client bundle):
  `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 2. Artifact Registry
- One Docker repo in `us-central1` (e.g. `ignitehealth`). Images: `ignitehealth-api`, `ignitehealth-web`.

### 3. Cloud Run services
- `ignitehealth-api`: public (unauthenticated ingress — the API does its own JWT auth), min-instances 0,
  Cloud SQL connection to `ignite-pg-dev`, dedicated runtime service account.
- `ignitehealth-web`: public, min-instances 0.

### 4. Secrets (Secret Manager → Cloud Run)
- **Secrets:** `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `ANTHROPIC_API_KEY`,
  `KB_DATABASE_URL` (prod form uses the Cloud SQL unix socket:
  `postgresql://rag_app:<pw>@/ignite?host=/cloudsql/ignitehealthnow-2025:us-central1:ignite-pg-dev`).
- **Plain env:** `GCP_PROJECT`, `ENVIRONMENT`, `CHAT_PROVIDER`, `GCP_KMS_KEY`, `SUPABASE_URL`,
  `CORS_ORIGINS` (set to the web service URL), Vertex model/location vars.

### 5. IAM / runtime service accounts
- A runtime SA for `ignitehealth-api` with: `roles/cloudsql.client`, `roles/secretmanager.secretAccessor`
  (on the specific secrets), `roles/aiplatform.user` (Vertex embeddings), and KMS
  encrypt/decrypt on `ignite-pii/profile-pii`.
- A deployer SA (used by the GitHub Actions WIF binding) with: Artifact Registry writer,
  Cloud Run admin, `iam.serviceAccountUser` on the runtime SAs.

### 6. CD — Workload Identity Federation + `deploy.yml`
- One-time: WIF pool + provider restricted to `patrick-ty/ignitehealthnow`; bind the deployer SA.
- `.github/workflows/deploy.yml` on push to `master`: authenticate via WIF → build & push both
  images → `gcloud run deploy` both services. Deploy **API first**, capture its URL, then build the
  web image with `NEXT_PUBLIC_API_URL` = that URL.
- Existing `ci.yml` stays as the test gate (lint + pytest + web lint + rag tests).

### 7. First deploy = manual
- A `infra/scripts/deploy-cloudrun.sh` that does the same `gcloud` steps from the developer's
  machine (using their ADC) to get it live **before** the WIF/Actions wiring is finished.

## Sequencing (dependency order)
1. Enable APIs (run, artifactregistry, secretmanager, sqladmin, iam, aiplatform).
2. Create Artifact Registry repo + runtime SA + secrets.
3. `next.config.ts` standalone + write both Dockerfiles.
4. Manual deploy **API** → get its `*.run.app` URL.
5. Manual deploy **web** with `NEXT_PUBLIC_API_URL` = API URL; set API `CORS_ORIGINS` = web URL.
6. Verify live (login → chat).
7. Set up WIF + `deploy.yml`; confirm push-to-master redeploys.

## Compliance / caveats
- **LLM provider in the deployed app:** stays `CHAT_PROVIDER=anthropic` until the Vertex Claude
  quota clears. That means prod chat prompts go to Anthropic directly — **acceptable only while
  there is no real patient PHI.** Before real patients: flip to `vertex` (single GCP BAA) or
  execute Anthropic's BAA. Tracked on the roadmap.
- **`/docs`:** disabled when `ENVIRONMENT=prod`. For this dev/staging env we may keep `ENVIRONMENT=dev`
  (so `/docs` works for testing) — revisit at launch.
- Never commit secrets; `.env` stays gitignored. The `marketing_agent_*` functions are untracked and
  out of scope here.

## Out of scope (harden later)
- Separate `prod` GCP project; tagged-release (`v*`) deploys; custom domains + DNS; Cloud CDN;
  the `ignitehealth-worker` service + Pub/Sub; Terraform/IaC; staging↔prod promotion.

## Risks / open items
- `pydantic` parsing of `CORS_ORIGINS` from an env var (list field) — confirm format (JSON array
  string) in the plan.
- Python base image version: align container with a version the test suite passes on (CI uses 3.11).
- Cloud SQL connector requires the API's runtime SA to have `cloudsql.client` and the service to
  declare the instance connection — verify the unix-socket DSN works with `psycopg`.
