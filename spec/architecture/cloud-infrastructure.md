# Cloud / Infrastructure Architecture

## Regions
- All Cloud Run services + workers in `us-central1`

## Environments
- Two environments: `dev` and `prod`
- Separate GCP projects recommended (or separate resources with strict naming + IAM)

## Compute
- Cloud Run:
  - `ignitehealth-api` (FastAPI)
  - `ignitehealth-worker` (Pub/Sub-triggered jobs)

## Async
- Pub/Sub topics for:
  - lab extraction pipeline stages
  - daily metrics computation
  - notification/event fanout (future)

## Storage
- GCS buckets:
  - `ignitehealth-<env>-assets` (photos/labs/uploads)
  - lifecycle policies for cleanup where appropriate

## CI/CD
- GitHub Actions Pattern A:
  - build/push to Artifact Registry
  - deploy to Cloud Run
- Deploy on **tagged releases only** (`v*`)
- Workload Identity Federation (OIDC) restricted to this repo

## Secrets & Config
- Use managed secrets (e.g., Secret Manager) for:
  - API keys (LLM, OCR, etc.)
  - service credentials (if any)
- Environment variables for non-sensitive config
- Never store secrets in repo

## Security
- Do not expose `/docs` publicly in prod
- IAM least privilege
- Service-to-service auth preferred
- Encryption at rest (GCP-managed) + consider CMEK later
