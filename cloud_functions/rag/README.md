# RAG Cloud Function

Indexes the shared knowledge base (book + lab guides) and per-user free-text
notes into Supabase pgvector, and serves ranked retrieval. No LLM call — the API
composes prompts and calls the model. See design:
`docs/superpowers/specs/2026-06-25-rag-cloud-function-design.md`.

## Entrypoints
- `ingest_kb` (HTTP) — batch index GCS content. Body: `{"prefix": "book/"}`.
- `ingest_user_note` (Pub/Sub, topic `rag-user-note-ingest`) — per-user note upsert/delete.
- `retrieve` (HTTP) — `{user_id, query, top_k_kb?, top_k_user?}` → `{kb, notes}`.

## Local test
```bash
cd cloud_functions/rag
pip install -r requirements-dev.txt
python -m pytest tests/ -v            # DB tests skip unless RAG_TEST_DATABASE_URL is set
```

## Provisioning checklist (one-time)
- [ ] Enable `vector` extension; apply `spec/migrations/02_rag_schema.sql` **after**
      Supabase's `auth` schema exists (the migration references `auth.users`).
- [ ] Create Pub/Sub topic `rag-user-note-ingest` + a dead-letter topic.
- [ ] Create the function service account with: `roles/aiplatform.user`,
      `roles/secretmanager.secretAccessor`, `roles/storage.objectViewer` on
      `ignitehealth-rag-source-prod`, `roles/pubsub.subscriber` on the topic.
- [ ] The function's DB connection must use a **service-role/BYPASSRLS** role.
      User isolation is enforced via the explicit `WHERE user_id = $1` SQL filter in
      every query. RLS (`auth.uid()`) protects the separate JWT/PostgREST access path
      and does not apply to the BYPASSRLS role by design.
- [ ] Store the Postgres connection string in Secret Manager as `rag-database-url`;
      set `RAG_DB_SECRET` to its version resource name.
- [ ] Seed `gs://ignitehealth-rag-source-prod` with `book/` (markdown) and `lab/`
      (per-marker markdown) content.
- [ ] Set non-secret env from `.env.example`.
- [ ] **Compliance:** confirm BAAs with Supabase, Google Cloud/Vertex AI, and the
      LLM provider before enabling user-note ingestion (spec §9).

## Deploy (gcloud, gen2)
```bash
gcloud functions deploy rag-retrieve --gen2 --runtime=python311 \
  --source=cloud_functions/rag --entry-point=retrieve --trigger-http \
  --no-allow-unauthenticated --min-instances=1 --region=$VERTEX_LOCATION
gcloud functions deploy rag-ingest-kb --gen2 --runtime=python311 \
  --source=cloud_functions/rag --entry-point=ingest_kb --trigger-http \
  --no-allow-unauthenticated --region=$VERTEX_LOCATION
gcloud functions deploy rag-ingest-user-note --gen2 --runtime=python311 \
  --source=cloud_functions/rag --entry-point=ingest_user_note \
  --trigger-topic=rag-user-note-ingest --region=$VERTEX_LOCATION
```
