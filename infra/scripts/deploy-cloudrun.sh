#!/usr/bin/env bash
# Manual first deploy of API + web to Cloud Run (run from repo root with your ADC).
# Prereqs: Tasks 2 + 3 done (APIs enabled, Artifact Registry repo, runtime SA, secrets).
set -euo pipefail

PROJECT=ignitehealthnow-2025
REGION=us-central1
REPO=us-central1-docker.pkg.dev/$PROJECT/ignitehealth
SA=ignitehealth-run@$PROJECT.iam.gserviceaccount.com
CLOUDSQL=$PROJECT:$REGION:ignite-pg-dev

# Non-secret config pulled from local env files (values are not printed)
SUPABASE_URL=$(grep -E '^SUPABASE_URL=' api/.env | cut -d= -f2-)
KMS_KEY=$(grep -E '^GCP_KMS_KEY=' api/.env | cut -d= -f2-)
SUPA_PUB_URL=$(grep -E '^NEXT_PUBLIC_SUPABASE_URL=' web/.env.local | cut -d= -f2-)
SUPA_ANON=$(grep -E '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' web/.env.local | cut -d= -f2-)

gcloud auth configure-docker us-central1-docker.pkg.dev -q

# 1) API: build image (Cloud Build) + deploy
gcloud builds submit api --tag "$REPO/ignitehealth-api:latest" --project "$PROJECT"
gcloud run deploy ignitehealth-api \
  --image "$REPO/ignitehealth-api:latest" --region "$REGION" --project "$PROJECT" \
  --service-account "$SA" --add-cloudsql-instances "$CLOUDSQL" --allow-unauthenticated \
  --set-env-vars "GCP_PROJECT=$PROJECT,ENVIRONMENT=dev,CHAT_PROVIDER=anthropic,VERTEX_CHAT_LOCATION=global,SUPABASE_URL=$SUPABASE_URL,GCP_KMS_KEY=$KMS_KEY" \
  --set-secrets "SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest,SUPABASE_JWT_SECRET=SUPABASE_JWT_SECRET:latest,ANTHROPIC_API_KEY=ANTHROPIC_API_KEY:latest,KB_DATABASE_URL=KB_DATABASE_URL:latest"
API_URL=$(gcloud run services describe ignitehealth-api --region "$REGION" --project "$PROJECT" --format='value(status.url)')
echo "API_URL=$API_URL"

# 2) Web: build image with baked NEXT_PUBLIC_* + deploy
gcloud builds submit web --project "$PROJECT" \
  --substitutions "_API=$API_URL,_SUPA_URL=$SUPA_PUB_URL,_SUPA_ANON=$SUPA_ANON" \
  --config web/cloudbuild.web.yaml
gcloud run deploy ignitehealth-web \
  --image "$REPO/ignitehealth-web:latest" --region "$REGION" --project "$PROJECT" \
  --allow-unauthenticated
WEB_URL=$(gcloud run services describe ignitehealth-web --region "$REGION" --project "$PROJECT" --format='value(status.url)')
echo "WEB_URL=$WEB_URL"

# 3) Point the API's CORS at the web URL (env-vars-file keeps the JSON list intact)
printf 'CORS_ORIGINS: '\''["%s"]'\''\n' "$WEB_URL" > /tmp/ih-cors.yaml
gcloud run services update ignitehealth-api --region "$REGION" --project "$PROJECT" \
  --env-vars-file /tmp/ih-cors.yaml

echo "Done.  Web: $WEB_URL   API: $API_URL"
