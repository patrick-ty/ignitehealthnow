# RAG Cloud Function — Design Spec

**Date:** 2026-06-25
**Status:** Approved design, pending implementation plan
**Location:** `cloud_functions/rag/`

## 1. Purpose & Scope

This function provides the Retrieval-Augmented Generation (RAG) plumbing for the
**Chat Agent — Patient Advocacy Companion** (PRD §10). It owns two responsibilities:

1. **Ingestion** — index shared knowledge-base content (the book + lab reference
   guides) and per-user free-text notes into a vector store.
2. **Retrieval** — given a query, return ranked, source-tagged context for the
   chat LLM.

### In scope
- Chunking, embedding (Vertex AI), upsert into pgvector.
- Vector search and ranked retrieval response.
- Three entrypoints sharing one `core` module.

### Out of scope (lives in the API, separate work)
- LLM calls, prompt assembly, the §10.3 chat guardrails.
- Structured health-data queries (energy/sleep ratings, lab values, ratios) —
  these are retrieved by the API via SQL/API queries, **not** embedded.
- Publishing journal-note events to Pub/Sub (the API does this on journal writes).

## 2. Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Function responsibility | Ingestion + retrieval, **no LLM** | Clean boundary; LLM call stays in API |
| Vector store | **Supabase pgvector** | Small static shared KB; per-user RLS for PHI; no new vendor; co-located with app data |
| Embeddings | **Vertex AI `text-embedding-005`** (768-dim, cosine) | Same cloud as Cloud Run; IAM auth, no extra key vendor |
| User data in RAG | **Hybrid** | Vector-embed only *unstructured* user text (journal notes, photo-analysis text). Quantitative data retrieved structurally by the API, not embedded — preserves numeric precision, minimizes PHI in the index |
| KB source | **GCS bucket** `ignitehealth-rag-source-prod` | Non-engineer content updates; supports binary/large source |
| Structure | **A — one cohesive package** | Single deployable, shared embedding/pgvector core; honors "build it in `cloud_functions/rag`" |
| Identity source | **Supabase Auth** (`auth.users.id` UUID) | Confirmed: entire app validates Supabase JWTs; no Firebase in source |
| Secrets | **GCP Secret Manager** | Project best practice; secrets never in plaintext env |
| Runtime | **GCP Cloud Functions gen2, Python** | Matches `api/` and `workers/` |

## 3. Architecture

```
                    ┌─────────────────────────────────────┐
   Chat request     │  API (FastAPI, Cloud Run)            │
   ───────────────► │  • holds JWT, resolves user_id       │
                    │  • calls retrieve()                  │
                    │  • runs structured health queries    │
                    │  • assembles prompt + guardrails     │
                    │  • calls LLM (Claude)                │
                    └───────┬──────────────────────▲───────┘
                            │ retrieve(query,user_id)│ ranked chunks
                            ▼                        │
                    ┌─────────────────────────────────────┐
                    │  rag cloud function (Python)         │
                    │  ┌──────────────┐  ┌──────────────┐  │
   GCS (book,       │  │ ingest_kb    │  │ retrieve     │  │
   lab guides) ───► │  │ (HTTP/batch) │  │ (HTTP)       │  │
                    │  └──────┬───────┘  └──────┬───────┘  │
   Pub/Sub          │  ┌──────▼───────┐         │          │
   (journal note)──►│  │ingest_user_  │   shared core:     │
                    │  │note (Pub/Sub)│   embed + pgvector │
                    │  └──────┬───────┘         │          │
                    └─────────┼─────────────────┼──────────┘
                              ▼                  ▼
                    ┌─────────────────────────────────────┐
                    │  Supabase Postgres + pgvector        │
                    │  • rag.kb_chunks (shared, no PII)     │
                    │  • rag.user_note_embeddings (RLS)    │
                    └─────────────────────────────────────┘
```

**Trust model:** the function trusts the API as its caller. The API authenticates
the end user (JWT) and passes a verified `user_id` to `retrieve` and into the
Pub/Sub message for `ingest_user_note`. The function never sees end-user JWTs and
is never reachable directly by end users.

## 4. Data Model (pgvector)

Tables live in a dedicated `rag` schema, isolated alongside the existing `pii`
schema. Embedding dimension 768 matches `text-embedding-005`.

```sql
CREATE SCHEMA IF NOT EXISTS rag;
CREATE EXTENSION IF NOT EXISTS vector;

-- Shared KB — no PII, readable by all authenticated retrieval paths
CREATE TABLE rag.kb_chunks (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_uri    TEXT NOT NULL,        -- gs://ignitehealth-rag-source-prod/book/ch03.md
    source_type   TEXT NOT NULL,        -- 'book' | 'lab_reference'
    chunk_index   INT  NOT NULL,        -- ordinal within source
    content       TEXT NOT NULL,        -- chunk text, returned to API for the prompt
    metadata      JSONB NOT NULL DEFAULT '{}',  -- {chapter, heading, framework_tag, lab_name...}
    content_hash  TEXT NOT NULL,        -- sha256(content) for idempotent re-ingest
    embedding     vector(768) NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (source_uri, chunk_index)
);
CREATE INDEX ON rag.kb_chunks USING hnsw (embedding vector_cosine_ops);

-- Per-user notes — PHI, RLS-isolated
CREATE TABLE rag.user_note_embeddings (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_kind   TEXT NOT NULL,        -- 'journal_note' | 'photo_analysis'
    source_id     UUID NOT NULL,        -- originating entry's id
    content       TEXT NOT NULL,        -- free-text note (PHI)
    occurred_at   TIMESTAMPTZ,          -- when the entry is *about* (recency ranking)
    content_hash  TEXT NOT NULL,
    embedding     vector(768) NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (source_kind, source_id)     -- one row per source entry; re-embed on edit
);
CREATE INDEX ON rag.user_note_embeddings USING hnsw (embedding vector_cosine_ops);
CREATE INDEX ON rag.user_note_embeddings (user_id);
ALTER TABLE rag.user_note_embeddings ENABLE ROW LEVEL SECURITY;
-- RLS policy: rows scoped to auth.uid(); the function also filters by user_id in SQL (defense in depth).
```

### PHI handling decision
Free-text note `content` is PHI but must be stored as **readable plaintext** so it
can be fed into prompts as retrieval context — it cannot be KMS-envelope-encrypted
and still be usable. Protection relies on: **RLS + Postgres at-rest disk encryption
+ `rag` schema isolation**, treated like any readable PHI column. This is an
explicit, approved trade-off given the HIPAA-ready posture.

## 5. Entrypoints

All three import one shared `core` module (`embeddings.py`, `store.py`,
`chunking.py`). Entrypoints are thin handlers; logic lives in `core`.

### ① `ingest_kb` — HTTP, manual/admin batch
```
POST /ingest_kb  { "prefix": "book/" }
  1. List objects under gs://ignitehealth-rag-source-prod/<prefix>
  2. Each file: download → detect type (book | lab_reference) → chunk
  3. Each chunk: content_hash = sha256(content)
       skip if (source_uri, chunk_index) exists with same hash   ← idempotent
       else embed via Vertex (batched) → upsert into rag.kb_chunks
  4. Return { files, chunks_embedded, chunks_skipped }
```
Privileged caller only (deploy step / Cloud Scheduler / operator). Locked down by
IAM invoker or a Secret-Manager-held shared token.

### ② `ingest_user_note` — Pub/Sub, event-driven
```
Topic: rag-user-note-ingest
Message (published by the API on journal note create/edit/delete):
  { user_id, source_kind, source_id, content, occurred_at, op }
  op = upsert → embed content → upsert into rag.user_note_embeddings (UNIQUE on source_id replaces)
  op = delete → delete row by source_id (idempotent no-op if absent)
  Idempotent on content_hash; ack on success, nack to retry on transient failure.
```
The **API is the publisher** — it owns the journal write and stamps the verified
`user_id`. Dead-letter topic after N attempts.

### ③ `retrieve` — HTTP, called by the API per chat turn
```
POST /retrieve  { user_id, query, top_k_kb?=6, top_k_user?=4 }
  1. embed(query) via Vertex
  2. parallel cosine search:
       kb_chunks            ORDER BY embedding <=> q  LIMIT top_k_kb
       user_note_embeddings WHERE user_id = $1
                            ORDER BY embedding <=> q  LIMIT top_k_user
  3. return:
       { kb:   [{content, source_type, source_uri, metadata, score}],
         notes:[{content, source_kind, occurred_at, score}] }
```
No LLM, no prompt-building, no structured health lookups. User query scoped by
`user_id` in SQL **and** RLS (two layers).

## 6. Chunking & Embedding

**Chunking** (`core/chunking.py`):
- **Book** (markdown): structure-aware — split on headings, pack into ~500–800
  token windows with ~15% overlap. Carry `{chapter, heading, framework_tag}` into
  `metadata` so chunks remain attributable to the book framework (PRD §10.3
  requires framework citation).
- **Lab reference guides**: one chunk per biomarker (ranges + interpretation),
  tagged `metadata.lab_name`. Atomic chunks retrieve more precisely than prose.
- **User notes**: short — embed whole; split only if over the window (rare).

**Embedding** (`core/embeddings.py`):
- Vertex AI `text-embedding-005`, 768-dim, cosine. One client wrapper for all
  entrypoints — single place that knows model id, dimension, batching.
- Batch on ingestion; single on retrieval.
- Model id + dimension are config constants in one module. Swapping the model
  changes the constant and the `vector(N)` dimension together, with a documented
  re-index step (re-embed KB; user notes re-embed as entries are touched or via
  backfill). KB and query **must** share the embedding space — model fixed per index.

## 7. Security, IAM & Operations

**Dedicated service account, least privilege:**
- `roles/aiplatform.user` (Vertex embeddings)
- `roles/secretmanager.secretAccessor` (DB connection string)
- `roles/storage.objectViewer` on `ignitehealth-rag-source-prod`
- `roles/pubsub.subscriber` on `rag-user-note-ingest`

**Trust boundaries (PHI defense in depth):**
- `retrieve` / `ingest_kb` are **not public** — reachable only by the API (IAM
  invoker or Secret-Manager shared token).
- User-note queries filtered by `user_id` in SQL **and** RLS — independent layers.
- The function's DB role has `SELECT/INSERT/UPDATE/DELETE` on `rag.*` only — no
  reach into `pii` or `public`.

**Operations:**
- **Idempotency** via `content_hash` + `UNIQUE` constraints — safe to replay
  Pub/Sub or re-run `ingest_kb`.
- **Pub/Sub failures:** transient → nack → retry with backoff; **dead-letter
  topic** after N attempts. Deletes idempotent.
- **Cold start on `retrieve`:** `min-instances=1` keeps one warm for chat.
- **Connections:** pooled, initialized once per warm instance.
- **Observability:** structured logs (request id, entrypoint, counts, latency).
  Logs **never** include user-note `content` (PHI); KB content is fine to log.

## 8. Testing

- **`core` modules unit-tested in isolation:** chunking (boundary/overlap),
  embedding client (mocked Vertex), store (real Postgres + pgvector fixture,
  mirroring how `api/tests` exercises real encryption rather than mocking).
- **Idempotency:** ingest twice → one row; edit note → vector replaced; delete → gone.
- **RLS/isolation (PHI-critical):** user A's query never returns user B's notes.
- **Entrypoint handlers:** thin — parse input, call core, shape response; Vertex +
  GCS mocked.

## 9. Deferred / Dependencies (not this function)

1. **API-side work:** publishing to `rag-user-note-ingest` on journal writes;
   calling `retrieve`; assembling the prompt; the LLM call + §10.3 guardrails.
   Separate work in `api/`.
2. **Provisioning checklist** (infra-as-code may live in `infra/` later):
   - Create `rag` schema, `vector` extension, tables + RLS policy (migration).
   - Create Pub/Sub topic `rag-user-note-ingest` + dead-letter topic.
   - Create the function's service account + IAM bindings above.
   - Store DB connection string in Secret Manager.
   - Seed `gs://ignitehealth-rag-source-prod` with book + lab-guide content.
   - Set non-secret env: `RAG_SOURCE_BUCKET`, embedding model id, schema name,
     chunk sizes, top-k defaults.
