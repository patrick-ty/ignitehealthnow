# Dev Journal #009 — RAG Cloud Function (ingestion + retrieval) + repo fixups

## Context
A single session that started as a repo review and turned into building the RAG
cloud function under `cloud_functions/rag/`. The function is the retrieval layer
for the **Chat Agent — Patient Advocacy Companion** (PRD §10): it indexes the
shared knowledge base (book + lab reference guides) and per-user free-text notes
into Supabase pgvector and serves ranked retrieval. It does **not** call the LLM —
the API owns prompt assembly, the §10.3 guardrails, and the model call. Built via
brainstorm → spec → plan → subagent-driven TDD execution → whole-branch review.

Design: `docs/superpowers/specs/2026-06-25-rag-cloud-function-design.md`
Plan:   `docs/superpowers/plans/2026-06-25-rag-cloud-function.md`

## Decision(s)
Repo fixups (committed to master first):
- Added `google-cloud-kms` to `pyproject.toml` (was imported in `core/kms.py` but
  only in `requirements.txt`); corrected the bogus `2.28.1` pin → real `3.14.0` in
  both files; regenerated `poetry.lock`. Fixed CI `push` trigger to include
  `master`. Gitignored `*.log` and removed stray `firebase-debug.log`.

RAG function:
- Scope: **ingestion + retrieval, no LLM**. Clean boundary; LLM stays in the API.
- Vector store: **Supabase pgvector** (small static shared KB; per-user PHI handled
  by RLS + SQL filter; no new vendor; co-located with app data).
- Embeddings: **Vertex AI `text-embedding-005`** (768-dim, cosine), task types
  RETRIEVAL_DOCUMENT (ingest) / RETRIEVAL_QUERY (query); IAM auth, no key vendor.
- User data: **hybrid** — vector-embed only unstructured user text (journal notes,
  photo-analysis); quantitative data (ratings/labs) retrieved structurally by the
  API, never embedded.
- KB source: **GCS bucket** `ignitehealth-rag-source-prod`.
- Structure: **one cohesive Python package** (Cloud Functions gen2) with three
  entrypoints (`ingest_kb` HTTP, `ingest_user_note` Pub/Sub, `retrieve` HTTP)
  sharing a `core` module (config, chunking, embeddings, store). DB driver:
  psycopg3 + pgvector adapter (raw SQL — PostgREST can't do `ORDER BY <=>`).
- Identity: Supabase `auth.users.id`; the API passes a verified `user_id`; the
  function never sees end-user JWTs.
- Secrets: **GCP Secret Manager** for the DB connection string; non-secret config
  via env vars.
- Data model: dedicated `rag` schema; `kb_chunks` (shared, no PII),
  `user_note_embeddings` (PHI, RLS + audit), `user_note_access_audit` (metadata
  only). Idempotency via `content_hash` + UNIQUE constraints.
- PHI: note `content` stored as readable plaintext (cannot be KMS-encrypted and
  still usable for embedding/prompts); protected by RLS + at-rest disk encryption
  + schema isolation + access audit logging. Note ownership is **immutable** on
  upsert (cross-user source_id collision is a no-op, never reassigns).
- Isolation model (corrected after final review): the function connects with a
  **service-role/BYPASSRLS** role and isolates via an explicit `WHERE user_id`
  SQL filter; RLS(`auth.uid()`) policies (select+insert+update+delete) protect the
  separate JWT/PostgREST access path. Do NOT use FORCE ROW LEVEL SECURITY (it would
  subject the function's role to RLS and break it).

## Rationale
- Confirmed from code that the app is on **Supabase Auth, not Firebase** (the only
  Firebase footprint was a stray debug log + MCP tooling). The `auth.users` FK and
  RLS model depend on this.
- The real PHI exposure in RAG is not the at-rest column — it's the plaintext
  disclosure of note text to **Vertex (embedding)** and the **LLM (prompt)**. So
  the governing controls are **BAAs** (Supabase, Google/Vertex, LLM provider),
  RLS, data minimization (hybrid), audit, and deletion-cascade — not column
  encryption. HIPAA's encryption-at-rest rule is *addressable*.
- pgvector chosen over Pinecone: workload is small/static/shared; Postgres RLS
  gives native per-user PHI isolation; avoids a second managed service.
- Hybrid user-data model preserves numeric precision (you query numbers, not
  semantic-search them) and minimizes PHI in the index.

## Alternatives Considered
- Pinecone for vectors: rejected (extra vendor; scale not needed; pgvector RLS
  better for PHI).
- Embed all user data including quantitative fields: rejected (loses precision,
  maximizes PHI in index).
- Retrieval inside the API / split retrieval to Cloud Run: deferred (Approach A —
  one package — was chosen; Cloud Run remains an easy later migration if chat
  latency demands it).
- FORCE ROW LEVEL SECURITY: rejected (would block the function's own connection).
- KMS-encrypting note content: impossible while keeping it usable for RAG.

## Constraints / Gotchas
- Local env had no Docker → the pgvector integration tests (store: idempotency,
  SQL isolation, ownership, edit-replaces, audit) are **CI-only**, gated on
  `RAG_TEST_DATABASE_URL`. CI runs them against a `pgvector/pgvector:pg16` service
  container. Local suite: 12 passed, 7 skipped.
- Local Python is 3.14; CI/target is 3.11 (pre-existing mismatch, still open).
- The migration FKs to `auth.users` and must be applied **after** Supabase's `auth`
  schema exists. CI stubs `auth.users`/`auth.uid()` before applying it.
- Never log note `content` — handlers log metadata only (entrypoint, ms, user_id,
  source_id, counts).
- Provisioning (Secret Manager secret, Pub/Sub topic + DLQ, service account roles,
  GCS seeding, dev+prod Supabase DBs) lives in the README checklist — not in code.

## Follow-ups / TODOs
- **API-side work (separate):** publish journal-note events to `rag-user-note-ingest`,
  call `retrieve`, assemble the prompt, apply §10.3 guardrails, call the LLM.
- **Compliance prerequisite (hard):** confirm BAAs with Supabase, Google/Vertex,
  and the LLM provider before enabling user-note ingestion.
- **Infra:** provision dev + prod Supabase projects (env-aware naming per
  `spec/architecture/04-2-environment-strategy.md`), enable pgvector, apply
  `02_rag_schema.sql`, store per-env DB URL in Secret Manager.
- Resolve the Python 3.14 (local) vs 3.11 (CI) mismatch; add `tsc --noEmit` to web CI.
- `chunk_min_tokens` is reserved/unused in v1 (sections packed independently);
  revisit cross-section merging + tune chunk size/top-k empirically after first
  real ingestion.
- master is currently 4 commits ahead of origin/master (this session's earlier
  work) and not yet pushed.
