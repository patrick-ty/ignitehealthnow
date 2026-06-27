# GCP Deploy + CI/CD (MVP) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or
> superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.
>
> **Hybrid execution note:** Code artifacts (Dockerfiles, `next.config.ts`, `deploy.yml`, scripts)
> are written + committed in-repo. GCP provisioning steps (`gcloud …`) must be run by the operator
> with Owner/Editor on `ignitehealthnow-2025` — they cannot run in the sandbox. Each gcloud step
> lists the exact command + expected output.

**Goal:** Web (Next.js) + API (FastAPI) live on Cloud Run in `ignitehealthnow-2025`, auto-deployed
on push to `master` via GitHub Actions + Workload Identity Federation.

**Architecture:** Two Cloud Run services behind default `*.run.app` URLs. Images in Artifact
Registry. Secrets in Secret Manager. KB via Cloud SQL connector. See
[spec](../specs/2026-06-27-gcp-deploy-cicd-design.md).

## Global Constraints
- Project `ignitehealthnow-2025`, region `us-central1`.
- Artifact Registry repo: `us-central1-docker.pkg.dev/ignitehealthnow-2025/ignitehealth`.
- Services: `ignitehealth-api`, `ignitehealth-web`. Runtime SA: `ignitehealth-run@ignitehealthnow-2025.iam.gserviceaccount.com`.
- Never commit secrets. `.env` stays gitignored. `marketing_agent_*` dirs are out of scope.
- Cloud Run injects `$PORT` (8080) — every container must bind it.
- `CHAT_PROVIDER=anthropic` for now (no real PHI yet); flip to `vertex` before real patients.

---

## Task 1: Container build files

**Files:**
- Create: `api/Dockerfile`, `api/.dockerignore`
- Create: `web/Dockerfile`, `web/.dockerignore`
- Modify: `web/next.config.ts` (add `output: 'standalone'`)

- [ ] **Step 1: `web/next.config.ts` → standalone**

Add `output: 'standalone'` to the config object so Next emits a self-contained server:
```ts
const nextConfig: NextConfig = {
  output: 'standalone',
  // ...keep existing options...
}
```

- [ ] **Step 2: `api/Dockerfile`**

```dockerfile
FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1 \
    POETRY_VERSION=1.8.3 POETRY_VIRTUALENVS_CREATE=false
WORKDIR /app
RUN pip install "poetry==${POETRY_VERSION}"
COPY pyproject.toml poetry.lock ./
RUN poetry install --only main --no-root --no-interaction
COPY app ./app
# Cloud Run sets $PORT (8080). Disable /docs in prod via ENVIRONMENT.
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
```

- [ ] **Step 3: `api/.dockerignore`**

```
.venv
__pycache__
*.pyc
.env
.env.*
tests
.pytest_cache
.ruff_cache
```

- [ ] **Step 4: `web/Dockerfile` (multi-stage, standalone)**

```dockerfile
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
ENV PORT=8080
CMD ["node", "server.js"]
```

- [ ] **Step 5: `web/.dockerignore`**

```
node_modules
.next
.env
.env.*
npm-debug.log
```

- [ ] **Step 6: Verify builds (if Docker available locally)**

```bash
docker build -t ih-api ./api
docker build -t ih-web --build-arg NEXT_PUBLIC_API_URL=http://x --build-arg NEXT_PUBLIC_SUPABASE_URL=http://x --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=x ./web
```
Expected: both images build. (If Docker isn't local, this is verified in Task 4 via Cloud Build.)

- [ ] **Step 7: Commit**

```bash
git add api/Dockerfile api/.dockerignore web/Dockerfile web/.dockerignore web/next.config.ts
git commit -m "build: add Cloud Run Dockerfiles + Next standalone output"
```

---

## Task 2: GCP project prep (operator runs)

**No repo files.** All `gcloud`, project `ignitehealthnow-2025`.

- [ ] **Step 1: Enable APIs**
```bash
gcloud services enable run.googleapis.com artifactregistry.googleapis.com \
  secretmanager.googleapis.com sqladmin.googleapis.com iam.googleapis.com \
  iamcredentials.googleapis.com aiplatform.googleapis.com cloudbuild.googleapis.com \
  --project=ignitehealthnow-2025
```
Expected: `Operation ... finished successfully`.

- [ ] **Step 2: Artifact Registry repo**
```bash
gcloud artifacts repositories create ignitehealth --repository-format=docker \
  --location=us-central1 --project=ignitehealthnow-2025
```
Expected: repo created. Verify: `gcloud artifacts repositories list --location=us-central1 --project=ignitehealthnow-2025`.

- [ ] **Step 3: Runtime service account + roles**
```bash
gcloud iam service-accounts create ignitehealth-run \
  --display-name="Cloud Run runtime" --project=ignitehealthnow-2025
SA=ignitehealth-run@ignitehealthnow-2025.iam.gserviceaccount.com
for ROLE in roles/cloudsql.client roles/secretmanager.secretAccessor roles/aiplatform.user; do
  gcloud projects add-iam-policy-binding ignitehealthnow-2025 \
    --member="serviceAccount:$SA" --role="$ROLE" --condition=None
done
```
Expected: each binding prints the updated policy. (KMS encrypt/decrypt on `ignite-pii/profile-pii`
for this SA is granted in Task 3 Step 3.)

---

## Task 3: Secrets (operator runs)

**No repo files.** Values come from the operator's local `api/.env`.

- [ ] **Step 1: Create the four secrets**
```bash
for S in SUPABASE_SERVICE_ROLE_KEY SUPABASE_JWT_SECRET ANTHROPIC_API_KEY KB_DATABASE_URL; do
  gcloud secrets create "$S" --replication-policy=automatic --project=ignitehealthnow-2025
done
```

- [ ] **Step 2: Add versions (paste each value; KB_DATABASE_URL uses the Cloud SQL socket form)**
```bash
# from the values in api/.env (service role, jwt secret, anthropic key):
printf '%s' 'PASTE_SUPABASE_SERVICE_ROLE_KEY' | gcloud secrets versions add SUPABASE_SERVICE_ROLE_KEY --data-file=- --project=ignitehealthnow-2025
printf '%s' 'PASTE_SUPABASE_JWT_SECRET'       | gcloud secrets versions add SUPABASE_JWT_SECRET --data-file=- --project=ignitehealthnow-2025
printf '%s' 'PASTE_ANTHROPIC_API_KEY'         | gcloud secrets versions add ANTHROPIC_API_KEY --data-file=- --project=ignitehealthnow-2025
# Prod KB DSN — unix socket via the Cloud SQL connector (NOT 127.0.0.1):
printf '%s' 'postgresql://rag_app:PASTE_PW@/ignite?host=/cloudsql/ignitehealthnow-2025:us-central1:ignite-pg-dev' \
  | gcloud secrets versions add KB_DATABASE_URL --data-file=- --project=ignitehealthnow-2025
```
Expected: `Created version [1] of the secret ...` four times.

- [ ] **Step 3: Grant the runtime SA KMS encrypt/decrypt on the PII key**
```bash
gcloud kms keys add-iam-policy-binding profile-pii \
  --keyring=ignite-pii --location=us-central1 --project=ignitehealthnow-2025 \
  --member="serviceAccount:ignitehealth-run@ignitehealthnow-2025.iam.gserviceaccount.com" \
  --role=roles/cloudkms.cryptoKeyEncrypterDecrypter
```

---

## Task 4: Manual first deploy (operator runs the script)

**Files:**
- Create: `infra/scripts/deploy-cloudrun.sh`

- [ ] **Step 1: Write the deploy script**

`infra/scripts/deploy-cloudrun.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail
PROJECT=ignitehealthnow-2025
REGION=us-central1
REPO=us-central1-docker.pkg.dev/$PROJECT/ignitehealth
SA=ignitehealth-run@$PROJECT.iam.gserviceaccount.com
CLOUDSQL=$PROJECT:$REGION:ignite-pg-dev

# Read non-secret config from api/.env without printing it
SUPABASE_URL=$(grep -E '^SUPABASE_URL=' api/.env | cut -d= -f2-)
KMS_KEY=$(grep -E '^GCP_KMS_KEY=' api/.env | cut -d= -f2-)
SUPA_PUB_URL=$(grep -E '^NEXT_PUBLIC_SUPABASE_URL=' web/.env.local | cut -d= -f2-)
SUPA_ANON=$(grep -E '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' web/.env.local | cut -d= -f2-)

gcloud auth configure-docker us-central1-docker.pkg.dev -q

# 1) API image (Cloud Build) + deploy
gcloud builds submit api --tag "$REPO/ignitehealth-api:latest" --project "$PROJECT"
gcloud run deploy ignitehealth-api \
  --image "$REPO/ignitehealth-api:latest" --region "$REGION" --project "$PROJECT" \
  --service-account "$SA" --add-cloudsql-instances "$CLOUDSQL" --allow-unauthenticated \
  --set-env-vars "GCP_PROJECT=$PROJECT,ENVIRONMENT=dev,CHAT_PROVIDER=anthropic,VERTEX_CHAT_LOCATION=global,SUPABASE_URL=$SUPABASE_URL,GCP_KMS_KEY=$KMS_KEY" \
  --set-secrets "SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest,SUPABASE_JWT_SECRET=SUPABASE_JWT_SECRET:latest,ANTHROPIC_API_KEY=ANTHROPIC_API_KEY:latest,KB_DATABASE_URL=KB_DATABASE_URL:latest"
API_URL=$(gcloud run services describe ignitehealth-api --region "$REGION" --project "$PROJECT" --format='value(status.url)')
echo "API_URL=$API_URL"

# 2) Web image (baked NEXT_PUBLIC_*) + deploy
gcloud builds submit web --project "$PROJECT" \
  --substitutions "_API=$API_URL,_SUPA_URL=$SUPA_PUB_URL,_SUPA_ANON=$SUPA_ANON" \
  --config web/cloudbuild.web.yaml
gcloud run deploy ignitehealth-web \
  --image "$REPO/ignitehealth-web:latest" --region "$REGION" --project "$PROJECT" \
  --allow-unauthenticated
WEB_URL=$(gcloud run services describe ignitehealth-web --region "$REGION" --project "$PROJECT" --format='value(status.url)')
echo "WEB_URL=$WEB_URL"

# 3) Point API CORS at the web URL (env-vars-file handles the JSON list cleanly)
printf 'CORS_ORIGINS: '\''["%s"]'\''\n' "$WEB_URL" > /tmp/ih-cors.yaml
gcloud run services update ignitehealth-api --region "$REGION" --project "$PROJECT" \
  --env-vars-file /tmp/ih-cors.yaml
echo "Done. Web: $WEB_URL  API: $API_URL"
```

- [ ] **Step 2: `web/cloudbuild.web.yaml`** (passes NEXT_PUBLIC_* build args to the web image)
```yaml
steps:
  - name: gcr.io/cloud-builders/docker
    args:
      - build
      - --build-arg=NEXT_PUBLIC_API_URL=${_API}
      - --build-arg=NEXT_PUBLIC_SUPABASE_URL=${_SUPA_URL}
      - --build-arg=NEXT_PUBLIC_SUPABASE_ANON_KEY=${_SUPA_ANON}
      - -t=us-central1-docker.pkg.dev/ignitehealthnow-2025/ignitehealth/ignitehealth-web:latest
      - .
images:
  - us-central1-docker.pkg.dev/ignitehealthnow-2025/ignitehealth/ignitehealth-web:latest
```

- [ ] **Step 3: Run it**
```bash
chmod +x infra/scripts/deploy-cloudrun.sh
./infra/scripts/deploy-cloudrun.sh
```
Expected: prints `API_URL=…` and `WEB_URL=…`.

- [ ] **Step 4: Verify live**
```bash
curl -i "$API_URL/health"        # 200, server: uvicorn (not SimpleHTTP)
```
Then open `WEB_URL` → log in → Chat → ask a question → get an answer.
(KB proxy NOT needed in prod — the API uses the Cloud SQL connector socket.)

- [ ] **Step 5: Commit the deploy scaffolding**
```bash
git add infra/scripts/deploy-cloudrun.sh web/cloudbuild.web.yaml
git commit -m "build: manual Cloud Run deploy script + web cloudbuild"
```

---

## Task 5: Workload Identity Federation (operator runs)

**No repo files.** One-time keyless GitHub→GCP trust.

- [ ] **Step 1: Deployer SA + roles**
```bash
gcloud iam service-accounts create gh-deployer --display-name="GitHub Actions deployer" --project=ignitehealthnow-2025
DEP=gh-deployer@ignitehealthnow-2025.iam.gserviceaccount.com
for ROLE in roles/run.admin roles/artifactregistry.writer roles/cloudbuild.builds.editor roles/iam.serviceAccountUser roles/storage.admin; do
  gcloud projects add-iam-policy-binding ignitehealthnow-2025 --member="serviceAccount:$DEP" --role="$ROLE" --condition=None
done
```

- [ ] **Step 2: WIF pool + provider restricted to the repo**
```bash
gcloud iam workload-identity-pools create github --location=global --project=ignitehealthnow-2025 --display-name="GitHub"
gcloud iam workload-identity-pools providers create-oidc github-oidc \
  --location=global --workload-identity-pool=github --project=ignitehealthnow-2025 \
  --display-name="github-oidc" --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='patrick-ty/ignitehealthnow'"
```

- [ ] **Step 3: Bind the repo to the deployer SA**
```bash
PROJNUM=$(gcloud projects describe ignitehealthnow-2025 --format='value(projectNumber)')
gcloud iam service-accounts add-iam-policy-binding gh-deployer@ignitehealthnow-2025.iam.gserviceaccount.com \
  --project=ignitehealthnow-2025 --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/$PROJNUM/locations/global/workloadIdentityPools/github/attribute.repository/patrick-ty/ignitehealthnow"
echo "WIF provider: projects/$PROJNUM/locations/global/workloadIdentityPools/github/providers/github-oidc"
```
Record the printed provider resource string — `deploy.yml` needs it (and add `WIF_PROVIDER` +
`DEPLOYER_SA` as GitHub repo variables, or hardcode in the workflow).

---

## Task 6: GitHub Actions CD (`deploy.yml`)

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Write the workflow**

`.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: ["master"]
permissions:
  contents: read
  id-token: write
concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: true
env:
  PROJECT: ignitehealthnow-2025
  REGION: us-central1
  REPO: us-central1-docker.pkg.dev/ignitehealthnow-2025/ignitehealth
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - id: auth
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ vars.WIF_PROVIDER }}
          service_account: gh-deployer@ignitehealthnow-2025.iam.gserviceaccount.com
      - uses: google-github-actions/setup-gcloud@v2

      - name: Build & deploy API
        run: |
          gcloud builds submit api --tag "$REPO/ignitehealth-api:${{ github.sha }}" --project "$PROJECT"
          gcloud run deploy ignitehealth-api \
            --image "$REPO/ignitehealth-api:${{ github.sha }}" --region "$REGION" --project "$PROJECT" \
            --service-account ignitehealth-run@$PROJECT.iam.gserviceaccount.com \
            --add-cloudsql-instances "$PROJECT:$REGION:ignite-pg-dev" --allow-unauthenticated
          echo "API_URL=$(gcloud run services describe ignitehealth-api --region $REGION --project $PROJECT --format='value(status.url)')" >> "$GITHUB_ENV"

      - name: Build & deploy Web
        run: |
          gcloud builds submit web --project "$PROJECT" \
            --substitutions "_API=$API_URL,_SUPA_URL=${{ vars.NEXT_PUBLIC_SUPABASE_URL }},_SUPA_ANON=${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}" \
            --config web/cloudbuild.web.yaml
          gcloud run deploy ignitehealth-web \
            --image "$REPO/ignitehealth-web:latest" --region "$REGION" --project "$PROJECT" \
            --allow-unauthenticated
```
Note: env/secret updates on the API service are NOT re-applied here (they persist from the manual
deploy in Task 4). This workflow only ships new images. Changing env/secrets is a manual
`gcloud run services update` until we add it.

- [ ] **Step 2: Add GitHub repo variables/secrets**

In GitHub repo settings → Secrets and variables → Actions:
- Variable `WIF_PROVIDER` = the provider string from Task 5 Step 3
- Variable `NEXT_PUBLIC_SUPABASE_URL` = the Supabase project URL
- Secret `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the Supabase anon key

- [ ] **Step 3: Commit + trigger**
```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add Cloud Run deploy workflow (WIF, push-to-master)"
git push origin master
```
Expected: the **Deploy** workflow runs green in the Actions tab and both services redeploy.

- [ ] **Step 4: Verify CD**
Make a trivial change, push to `master`, confirm the new revision appears in Cloud Run.

---

## Done =
Web + API live on Cloud Run, push-to-`master` redeploys both. Roadmap "Deploy consumer app to
GCP + CI/CD" → shipped. Next hardening (separate prod project, tagged releases, custom domains,
CDN, worker) tracked separately.
