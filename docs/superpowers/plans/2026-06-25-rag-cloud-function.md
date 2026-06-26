# RAG Cloud Function Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `cloud_functions/rag/` package that indexes the shared knowledge base (book + lab guides) and per-user free-text notes into Supabase pgvector, and serves ranked retrieval — with no LLM call.

**Architecture:** One cohesive Python package (GCP Cloud Functions gen2) with three `functions-framework` entrypoints (`ingest_kb` HTTP, `ingest_user_note` Pub/Sub, `retrieve` HTTP) sharing a `core` module (config, embeddings, chunking, store). Vectors live in a dedicated `rag` Postgres schema; per-user notes are RLS-isolated PHI with access auditing. The API (separate codebase) is the only caller and publisher.

**Tech Stack:** Python 3.11, `functions-framework`, `vertexai` (text-embedding-005, 768-dim), `psycopg` (psycopg3) + `pgvector` adapter, `google-cloud-storage`, `google-cloud-secret-manager`, `pytest`.

## Global Constraints

- **Vector store:** Supabase Postgres + pgvector. Schema name: `rag`. (verbatim from spec §2)
- **Embeddings:** Vertex AI `text-embedding-005`, dimension **768**, cosine distance. Same model for ingestion and queries; document chunks use task type `RETRIEVAL_DOCUMENT`, queries use `RETRIEVAL_QUERY`. (spec §6)
- **DB driver:** psycopg3 sync + `pgvector.psycopg`. Connection string from **GCP Secret Manager** at cold start; never a plaintext env var. (spec §2, §7)
- **Non-secret config via env vars only:** `RAG_SOURCE_BUCKET=ignitehealth-rag-source-prod`, `RAG_EMBED_MODEL=text-embedding-005`, `RAG_SCHEMA=rag`, `GCP_PROJECT`, `VERTEX_LOCATION`, chunk/top-k knobs. (spec §2, §7)
- **Identity:** user key is the Supabase `auth.users.id` UUID; never trust an end-user JWT in this function — the API passes a verified `user_id`. (spec §3)
- **PHI rules:** user-note `content` is stored plaintext, RLS-isolated; the function filters user-note queries by `user_id` in SQL **and** relies on RLS. **Never log note `content`.** Every access to `rag.user_note_embeddings` writes a metadata-only audit record. (spec §4, §7)
- **Idempotency:** all upserts keyed by `content_hash` + UNIQUE constraints; safe to replay Pub/Sub or re-run `ingest_kb`. (spec §5)
- **Out of scope:** LLM calls, prompt assembly, §10.3 guardrails, structured health-number queries, and the API-side publishing/retrieval wiring. (spec §1)

---

## File Structure

```
spec/migrations/
  02_rag_schema.sql                 # rag schema, tables, indexes, RLS, audit table

cloud_functions/rag/
  main.py                           # 3 functions-framework entrypoints (thin handlers)
  requirements.txt                  # runtime deps
  requirements-dev.txt              # + pytest
  README.md                         # deploy + provisioning checklist
  .env.example                      # non-secret config template
  core/
    __init__.py
    config.py                       # Config dataclass; env + Secret Manager loader
    embeddings.py                   # Vertex text-embedding-005 wrapper (batch + single)
    chunking.py                     # book / lab_reference / note chunkers
    store.py                        # psycopg+pgvector: upsert/search/delete/audit
  tests/
    conftest.py                     # env stubs, fake vertex, DB fixture (gated)
    test_config.py
    test_chunking.py
    test_embeddings.py
    test_store.py                   # integration, gated on RAG_TEST_DATABASE_URL
    test_retrieve.py                # integration, gated
    test_handlers.py                # thin handler unit tests (core mocked)
```

Each `core` module has one responsibility. Handlers in `main.py` parse input, call `core`, shape output — no logic.

---

## Task 1: Package scaffold + config module

**Files:**
- Create: `cloud_functions/rag/requirements.txt`, `cloud_functions/rag/requirements-dev.txt`, `cloud_functions/rag/.env.example`, `cloud_functions/rag/core/__init__.py`, `cloud_functions/rag/core/config.py`
- Test: `cloud_functions/rag/tests/conftest.py`, `cloud_functions/rag/tests/test_config.py`

**Interfaces:**
- Produces: `core.config.Config` dataclass with fields `source_bucket: str`, `embed_model: str`, `schema: str`, `gcp_project: str`, `vertex_location: str`, `database_url: str`, `chunk_min_tokens: int`, `chunk_max_tokens: int`, `chunk_overlap_ratio: float`, `top_k_kb: int`, `top_k_user: int`. Function `core.config.load_config() -> Config`.
- `load_config()` reads non-secret values from env; reads `database_url` from Secret Manager when `RAG_DB_SECRET` is set, else falls back to env `DATABASE_URL` (tests/local).

- [ ] **Step 1: Create dependency files**

`cloud_functions/rag/requirements.txt`:
```
functions-framework==3.*
google-cloud-aiplatform==1.*
google-cloud-storage==2.*
google-cloud-secret-manager==2.*
psycopg[binary]==3.*
pgvector==0.3.*
```

`cloud_functions/rag/requirements-dev.txt`:
```
-r requirements.txt
pytest==8.3.3
```

`cloud_functions/rag/.env.example`:
```
RAG_SOURCE_BUCKET=ignitehealth-rag-source-prod
RAG_EMBED_MODEL=text-embedding-005
RAG_SCHEMA=rag
GCP_PROJECT=ignitehealthnow-2025
VERTEX_LOCATION=us-central1
# Secret Manager resource name holding the Postgres connection string (prod):
RAG_DB_SECRET=projects/ignitehealthnow-2025/secrets/rag-database-url/versions/latest
# Local/test only — used when RAG_DB_SECRET is unset:
DATABASE_URL=postgresql://user:pass@localhost:5432/testdb
RAG_CHUNK_MIN_TOKENS=500
RAG_CHUNK_MAX_TOKENS=800
RAG_CHUNK_OVERLAP_RATIO=0.15
RAG_TOP_K_KB=6
RAG_TOP_K_USER=4
```

- [ ] **Step 2: Write the failing test**

`cloud_functions/rag/tests/conftest.py`:
```python
import sys
import types
import pytest


@pytest.fixture(autouse=True)
def _env(monkeypatch):
    monkeypatch.setenv("RAG_SOURCE_BUCKET", "ignitehealth-rag-source-prod")
    monkeypatch.setenv("RAG_EMBED_MODEL", "text-embedding-005")
    monkeypatch.setenv("RAG_SCHEMA", "rag")
    monkeypatch.setenv("GCP_PROJECT", "test-project")
    monkeypatch.setenv("VERTEX_LOCATION", "us-central1")
    monkeypatch.setenv("DATABASE_URL", "postgresql://u:p@localhost:5432/testdb")
    monkeypatch.delenv("RAG_DB_SECRET", raising=False)
    monkeypatch.setenv("RAG_CHUNK_MIN_TOKENS", "500")
    monkeypatch.setenv("RAG_CHUNK_MAX_TOKENS", "800")
    monkeypatch.setenv("RAG_CHUNK_OVERLAP_RATIO", "0.15")
    monkeypatch.setenv("RAG_TOP_K_KB", "6")
    monkeypatch.setenv("RAG_TOP_K_USER", "4")
```

`cloud_functions/rag/tests/test_config.py`:
```python
from core.config import load_config


def test_load_config_reads_env_without_secret_manager():
    cfg = load_config()
    assert cfg.source_bucket == "ignitehealth-rag-source-prod"
    assert cfg.embed_model == "text-embedding-005"
    assert cfg.schema == "rag"
    assert cfg.database_url == "postgresql://u:p@localhost:5432/testdb"
    assert cfg.top_k_kb == 6
    assert cfg.top_k_user == 4
    assert cfg.chunk_max_tokens == 800
    assert abs(cfg.chunk_overlap_ratio - 0.15) < 1e-9
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd cloud_functions/rag && python -m pytest tests/test_config.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'core.config'`

- [ ] **Step 4: Write minimal implementation**

`cloud_functions/rag/core/__init__.py`:
```python
```

`cloud_functions/rag/core/config.py`:
```python
import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Config:
    source_bucket: str
    embed_model: str
    schema: str
    gcp_project: str
    vertex_location: str
    database_url: str
    chunk_min_tokens: int
    chunk_max_tokens: int
    chunk_overlap_ratio: float
    top_k_kb: int
    top_k_user: int


def _load_database_url() -> str:
    secret_name = os.environ.get("RAG_DB_SECRET")
    if secret_name:
        from google.cloud import secretmanager

        client = secretmanager.SecretManagerServiceClient()
        resp = client.access_secret_version(name=secret_name)
        return resp.payload.data.decode("utf-8")
    return os.environ["DATABASE_URL"]


def load_config() -> Config:
    return Config(
        source_bucket=os.environ["RAG_SOURCE_BUCKET"],
        embed_model=os.environ.get("RAG_EMBED_MODEL", "text-embedding-005"),
        schema=os.environ.get("RAG_SCHEMA", "rag"),
        gcp_project=os.environ["GCP_PROJECT"],
        vertex_location=os.environ.get("VERTEX_LOCATION", "us-central1"),
        database_url=_load_database_url(),
        chunk_min_tokens=int(os.environ.get("RAG_CHUNK_MIN_TOKENS", "500")),
        chunk_max_tokens=int(os.environ.get("RAG_CHUNK_MAX_TOKENS", "800")),
        chunk_overlap_ratio=float(os.environ.get("RAG_CHUNK_OVERLAP_RATIO", "0.15")),
        top_k_kb=int(os.environ.get("RAG_TOP_K_KB", "6")),
        top_k_user=int(os.environ.get("RAG_TOP_K_USER", "4")),
    )
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd cloud_functions/rag && python -m pytest tests/test_config.py -v`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add cloud_functions/rag/requirements.txt cloud_functions/rag/requirements-dev.txt \
  cloud_functions/rag/.env.example cloud_functions/rag/core/__init__.py \
  cloud_functions/rag/core/config.py cloud_functions/rag/tests/conftest.py \
  cloud_functions/rag/tests/test_config.py
git commit -m "feat(rag): scaffold package and config loader"
```

---

## Task 2: Database migration (rag schema + tables + RLS + audit)

**Files:**
- Create: `spec/migrations/02_rag_schema.sql`

**Interfaces:**
- Produces: schema `rag` with tables `kb_chunks`, `user_note_embeddings`, `user_note_access_audit`. Column names exactly as below — `store.py` (Task 5) depends on them.

This task has no unit test; its deliverable is verified by applying it to a Postgres+pgvector instance and by the Task 5 integration tests that run against it.

- [ ] **Step 1: Write the migration**

`spec/migrations/02_rag_schema.sql`:
```sql
-- Ignite Health Now
-- RAG cloud function: shared KB + per-user note embeddings
-- Requires the pgvector extension (Supabase: enable "vector").

create extension if not exists vector;
create schema if not exists rag;

-- Shared knowledge base (book + lab reference guides). No PII.
create table if not exists rag.kb_chunks (
    id           uuid primary key default gen_random_uuid(),
    source_uri   text not null,
    source_type  text not null check (source_type in ('book', 'lab_reference')),
    chunk_index  int  not null,
    content      text not null,
    metadata     jsonb not null default '{}',
    content_hash text not null,
    embedding    vector(768) not null,
    created_at   timestamptz not null default now(),
    unique (source_uri, chunk_index)
);
create index if not exists kb_chunks_embedding_idx
    on rag.kb_chunks using hnsw (embedding vector_cosine_ops);

-- Per-user free-text note embeddings. PHI — RLS isolated.
create table if not exists rag.user_note_embeddings (
    id           uuid primary key default gen_random_uuid(),
    user_id      uuid not null references auth.users(id) on delete cascade,
    source_kind  text not null check (source_kind in ('journal_note', 'photo_analysis')),
    source_id    uuid not null,
    content      text not null,
    occurred_at  timestamptz,
    content_hash text not null,
    embedding    vector(768) not null,
    created_at   timestamptz not null default now(),
    unique (source_kind, source_id)
);
create index if not exists user_note_embeddings_embedding_idx
    on rag.user_note_embeddings using hnsw (embedding vector_cosine_ops);
create index if not exists user_note_embeddings_user_id_idx
    on rag.user_note_embeddings (user_id);

alter table rag.user_note_embeddings enable row level security;

-- RLS backstop: any auth.uid()-scoped path sees only its own rows.
-- The function additionally filters by user_id in SQL (defense in depth).
drop policy if exists user_note_owner_select on rag.user_note_embeddings;
create policy user_note_owner_select on rag.user_note_embeddings
    for select using (user_id = auth.uid());

-- PHI access audit — metadata only, never content.
create table if not exists rag.user_note_access_audit (
    id          uuid primary key default gen_random_uuid(),
    occurred_at timestamptz not null default now(),
    user_id     uuid not null,
    entrypoint  text not null,   -- 'retrieve' | 'ingest_user_note'
    op          text not null,   -- 'search' | 'upsert' | 'delete'
    source_ids  uuid[] not null default '{}',
    details     jsonb not null default '{}'
);
create index if not exists user_note_access_audit_user_idx
    on rag.user_note_access_audit (user_id, occurred_at);
```

- [ ] **Step 2: Apply against a local pgvector Postgres to verify it runs clean**

Run (requires a Postgres with pgvector; `auth.users` must exist — for local verification create a stub schema first):
```bash
psql "$RAG_TEST_DATABASE_URL" -c "create schema if not exists auth; create table if not exists auth.users (id uuid primary key); create or replace function auth.uid() returns uuid language sql stable as \$\$ select null::uuid \$\$;"
psql "$RAG_TEST_DATABASE_URL" -f spec/migrations/02_rag_schema.sql
```
Expected: no errors; `\dt rag.*` lists the three tables.

- [ ] **Step 3: Commit**

```bash
git add spec/migrations/02_rag_schema.sql
git commit -m "feat(rag): add rag schema migration with RLS and audit table"
```

---

## Task 3: Chunking module

**Files:**
- Create: `cloud_functions/rag/core/chunking.py`
- Test: `cloud_functions/rag/tests/test_chunking.py`

**Interfaces:**
- Produces:
  - `Chunk` dataclass: `content: str`, `chunk_index: int`, `metadata: dict`.
  - `chunk_book(text: str, *, max_tokens: int, overlap_ratio: float) -> list[Chunk]` — splits markdown on headings, packs prose into windows; `metadata` carries `{"heading": str}` for the section a chunk came from.
  - `chunk_lab_reference(text: str) -> list[Chunk]` — one chunk per `## <lab name>` section; `metadata` carries `{"lab_name": str}`.
  - `approx_tokens(text: str) -> int` — whitespace-word count × 1.3 (cheap heuristic; no tokenizer dependency).

- [ ] **Step 1: Write the failing test**

`cloud_functions/rag/tests/test_chunking.py`:
```python
from core.chunking import chunk_book, chunk_lab_reference, approx_tokens


def test_approx_tokens_counts_words_scaled():
    assert approx_tokens("one two three four") == 5  # round(4 * 1.3)


def test_chunk_book_splits_on_headings_and_tags_metadata():
    text = (
        "# Chapter 1\n\n"
        + ("word " * 400).strip()
        + "\n\n## Section A\n\n"
        + ("alpha " * 400).strip()
    )
    chunks = chunk_book(text, max_tokens=800, overlap_ratio=0.15)
    assert len(chunks) >= 2
    headings = {c.metadata["heading"] for c in chunks}
    assert "Chapter 1" in headings
    assert "Section A" in headings
    # indices are sequential starting at 0
    assert [c.chunk_index for c in chunks] == list(range(len(chunks)))


def test_chunk_book_packs_short_sections_within_max_tokens():
    text = "# H\n\n" + ("word " * 100).strip()
    chunks = chunk_book(text, max_tokens=800, overlap_ratio=0.15)
    assert len(chunks) == 1
    assert approx_tokens(chunks[0].content) <= 800


def test_chunk_lab_reference_one_chunk_per_marker():
    text = (
        "## Ferritin\n\nFunctional 50-100. Conventional 12-150.\n\n"
        "## TSH\n\nFunctional 0.5-2.0.\n"
    )
    chunks = chunk_lab_reference(text)
    assert len(chunks) == 2
    names = {c.metadata["lab_name"] for c in chunks}
    assert names == {"Ferritin", "TSH"}
    assert "50-100" in chunks[0].content
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cloud_functions/rag && python -m pytest tests/test_chunking.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'core.chunking'`

- [ ] **Step 3: Write minimal implementation**

`cloud_functions/rag/core/chunking.py`:
```python
import re
from dataclasses import dataclass, field


@dataclass
class Chunk:
    content: str
    chunk_index: int
    metadata: dict = field(default_factory=dict)


def approx_tokens(text: str) -> int:
    return round(len(text.split()) * 1.3)


_HEADING_RE = re.compile(r"^(#{1,6})\s+(.*)$", re.MULTILINE)


def _split_sections(text: str) -> list[tuple[str, str]]:
    """Return [(heading, body)] split on markdown headings. Text before the
    first heading is attributed to heading '' (preamble)."""
    sections: list[tuple[str, str]] = []
    matches = list(_HEADING_RE.finditer(text))
    if not matches:
        return [("", text.strip())]
    if matches[0].start() > 0:
        pre = text[: matches[0].start()].strip()
        if pre:
            sections.append(("", pre))
    for i, m in enumerate(matches):
        heading = m.group(2).strip()
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[start:end].strip()
        sections.append((heading, body))
    return sections


def _pack(body: str, max_tokens: int, overlap_ratio: float) -> list[str]:
    """Pack a body into windows <= max_tokens, overlapping by overlap_ratio."""
    words = body.split()
    if not words:
        return []
    max_words = max(1, int(max_tokens / 1.3))
    overlap = int(max_words * overlap_ratio)
    windows: list[str] = []
    start = 0
    while start < len(words):
        end = min(start + max_words, len(words))
        windows.append(" ".join(words[start:end]))
        if end == len(words):
            break
        start = end - overlap
    return windows


def chunk_book(text: str, *, max_tokens: int, overlap_ratio: float) -> list[Chunk]:
    chunks: list[Chunk] = []
    idx = 0
    for heading, body in _split_sections(text):
        for window in _pack(body, max_tokens, overlap_ratio):
            chunks.append(Chunk(content=window, chunk_index=idx, metadata={"heading": heading}))
            idx += 1
    return chunks


def chunk_lab_reference(text: str) -> list[Chunk]:
    chunks: list[Chunk] = []
    idx = 0
    for heading, body in _split_sections(text):
        if not heading:
            continue
        content = f"{heading}\n{body}".strip()
        chunks.append(Chunk(content=content, chunk_index=idx, metadata={"lab_name": heading}))
        idx += 1
    return chunks
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd cloud_functions/rag && python -m pytest tests/test_chunking.py -v`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add cloud_functions/rag/core/chunking.py cloud_functions/rag/tests/test_chunking.py
git commit -m "feat(rag): add structure-aware chunking for book and lab guides"
```

---

## Task 4: Embeddings module (Vertex wrapper)

**Files:**
- Create: `cloud_functions/rag/core/embeddings.py`
- Modify: `cloud_functions/rag/tests/conftest.py` (add fake vertexai module)
- Test: `cloud_functions/rag/tests/test_embeddings.py`

**Interfaces:**
- Produces: class `Embedder` with:
  - `__init__(self, project: str, location: str, model: str)`
  - `embed_documents(self, texts: list[str]) -> list[list[float]]` (task type `RETRIEVAL_DOCUMENT`, batched)
  - `embed_query(self, text: str) -> list[float]` (task type `RETRIEVAL_QUERY`)
  - class attribute `DIMENSION = 768`

- [ ] **Step 1: Add a fake `vertexai` to conftest so tests need no GCP**

Append to `cloud_functions/rag/tests/conftest.py`:
```python
# --- Fake vertexai so embeddings can be imported/tested without GCP ---
_vertexai = types.ModuleType("vertexai")
_lm = types.ModuleType("vertexai.language_models")


class _FakeEmbedding:
    def __init__(self, values):
        self.values = values


class _FakeTextEmbeddingInput:
    def __init__(self, text, task_type):
        self.text = text
        self.task_type = task_type


class _FakeModel:
    @classmethod
    def from_pretrained(cls, name):
        return cls()

    def get_embeddings(self, inputs):
        # Deterministic dummy vectors: length-768, first value = token count.
        out = []
        for inp in inputs:
            v = [float(len(inp.text.split()))] + [0.0] * 767
            out.append(_FakeEmbedding(v))
        return out


def _fake_init(*args, **kwargs):
    return None


_vertexai.init = _fake_init
_lm.TextEmbeddingModel = _FakeModel
_lm.TextEmbeddingInput = _FakeTextEmbeddingInput
sys.modules.setdefault("vertexai", _vertexai)
sys.modules.setdefault("vertexai.language_models", _lm)
```

- [ ] **Step 2: Write the failing test**

`cloud_functions/rag/tests/test_embeddings.py`:
```python
from core.embeddings import Embedder


def test_embed_documents_returns_one_vector_per_text():
    e = Embedder(project="p", location="us-central1", model="text-embedding-005")
    vecs = e.embed_documents(["hello world", "a b c"])
    assert len(vecs) == 2
    assert all(len(v) == Embedder.DIMENSION for v in vecs)
    assert vecs[0][0] == 2.0  # fake encodes token count in slot 0
    assert vecs[1][0] == 3.0


def test_embed_query_returns_single_vector():
    e = Embedder(project="p", location="us-central1", model="text-embedding-005")
    v = e.embed_query("one two three four")
    assert len(v) == Embedder.DIMENSION
    assert v[0] == 4.0
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd cloud_functions/rag && python -m pytest tests/test_embeddings.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'core.embeddings'`

- [ ] **Step 4: Write minimal implementation**

`cloud_functions/rag/core/embeddings.py`:
```python
import vertexai
from vertexai.language_models import TextEmbeddingInput, TextEmbeddingModel


class Embedder:
    DIMENSION = 768

    def __init__(self, project: str, location: str, model: str):
        vertexai.init(project=project, location=location)
        self._model = TextEmbeddingModel.from_pretrained(model)

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        inputs = [TextEmbeddingInput(t, "RETRIEVAL_DOCUMENT") for t in texts]
        return [e.values for e in self._model.get_embeddings(inputs)]

    def embed_query(self, text: str) -> list[float]:
        inputs = [TextEmbeddingInput(text, "RETRIEVAL_QUERY")]
        return self._model.get_embeddings(inputs)[0].values
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd cloud_functions/rag && python -m pytest tests/test_embeddings.py -v`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add cloud_functions/rag/core/embeddings.py cloud_functions/rag/tests/conftest.py \
  cloud_functions/rag/tests/test_embeddings.py
git commit -m "feat(rag): add Vertex text-embedding-005 wrapper"
```

---

## Task 5: Store module (pgvector upsert / search / delete / audit)

**Files:**
- Create: `cloud_functions/rag/core/store.py`
- Modify: `cloud_functions/rag/tests/conftest.py` (add gated DB fixture)
- Test: `cloud_functions/rag/tests/test_store.py`

**Interfaces:**
- Produces: class `Store`:
  - `__init__(self, database_url: str, schema: str = "rag")`
  - `upsert_kb_chunk(self, *, source_uri, source_type, chunk_index, content, metadata, content_hash, embedding) -> bool` — returns `True` if embedded/written, `False` if skipped (hash match). Idempotent on `(source_uri, chunk_index)`.
  - `upsert_user_note(self, *, user_id, source_kind, source_id, content, occurred_at, content_hash, embedding) -> bool` — idempotent on `(source_kind, source_id)`; writes audit `op='upsert'`.
  - `delete_user_note(self, *, user_id, source_kind, source_id) -> int` — rows deleted; writes audit `op='delete'`.
  - `search_kb(self, *, query_embedding, top_k) -> list[dict]` — keys `content, source_type, source_uri, metadata, score`.
  - `search_user_notes(self, *, user_id, query_embedding, top_k) -> list[dict]` — filters by `user_id` in SQL; keys `content, source_kind, occurred_at, score`; writes audit `op='search'` with the returned `source_ids`.
  - `content_hash(text: str) -> str` module function — `sha256` hex.

**Interfaces consumed:** none beyond stdlib + `psycopg`, `pgvector`.

> These are **integration tests** against a real Postgres+pgvector. They are **skipped** unless `RAG_TEST_DATABASE_URL` is set. CI provides it via a service container (Task 9 wires CI). The migration from Task 2 must be applied to that database first.

- [ ] **Step 1: Add the gated DB fixture to conftest**

Append to `cloud_functions/rag/tests/conftest.py`:
```python
import os
import uuid


def _db_url():
    return os.environ.get("RAG_TEST_DATABASE_URL")


requires_db = pytest.mark.skipif(_db_url() is None, reason="RAG_TEST_DATABASE_URL not set")


@pytest.fixture
def db_url():
    url = _db_url()
    assert url, "guarded by requires_db"
    return url


@pytest.fixture
def seed_user(db_url):
    """Insert a throwaway auth.users row; return its id; clean up after."""
    import psycopg

    uid = uuid.uuid4()
    with psycopg.connect(db_url, autocommit=True) as conn:
        conn.execute("insert into auth.users (id) values (%s)", (uid,))
    yield uid
    with psycopg.connect(db_url, autocommit=True) as conn:
        conn.execute("delete from auth.users where id = %s", (uid,))


@pytest.fixture(autouse=True)
def _clean_rag_tables(request):
    """Truncate rag tables around DB-backed tests only."""
    if _db_url() is None or "db_url" not in request.fixturenames:
        yield
        return
    import psycopg

    with psycopg.connect(_db_url(), autocommit=True) as conn:
        conn.execute("truncate rag.kb_chunks, rag.user_note_embeddings, rag.user_note_access_audit")
    yield
```

- [ ] **Step 2: Write the failing test**

`cloud_functions/rag/tests/test_store.py`:
```python
import uuid
from core.store import Store, content_hash
from tests.conftest import requires_db


def _vec(first: float):
    return [first] + [0.0] * 767


@requires_db
def test_kb_upsert_is_idempotent_on_hash(db_url):
    store = Store(db_url)
    args = dict(
        source_uri="gs://b/book/ch1.md", source_type="book", chunk_index=0,
        content="alpha beta", metadata={"heading": "Ch1"},
        content_hash=content_hash("alpha beta"), embedding=_vec(1.0),
    )
    assert store.upsert_kb_chunk(**args) is True
    assert store.upsert_kb_chunk(**args) is False  # same hash -> skipped


@requires_db
def test_kb_search_ranks_by_cosine(db_url):
    store = Store(db_url)
    for i, c in enumerate(["near", "far"]):
        store.upsert_kb_chunk(
            source_uri="gs://b/book/ch1.md", source_type="book", chunk_index=i,
            content=c, metadata={}, content_hash=content_hash(c),
            embedding=_vec(1.0 if c == "near" else 9.0),
        )
    hits = store.search_kb(query_embedding=_vec(1.0), top_k=2)
    assert hits[0]["content"] == "near"
    assert set(hits[0].keys()) >= {"content", "source_type", "source_uri", "metadata", "score"}


@requires_db
def test_user_note_rls_isolation(db_url, seed_user):
    store = Store(db_url)
    other = seed_user  # one real user
    # create a second real user inline
    import psycopg
    other2 = uuid.uuid4()
    with psycopg.connect(db_url, autocommit=True) as conn:
        conn.execute("insert into auth.users (id) values (%s)", (other2,))
    try:
        store.upsert_user_note(
            user_id=other, source_kind="journal_note", source_id=uuid.uuid4(),
            content="mine", occurred_at=None, content_hash=content_hash("mine"),
            embedding=_vec(1.0),
        )
        store.upsert_user_note(
            user_id=other2, source_kind="journal_note", source_id=uuid.uuid4(),
            content="theirs", occurred_at=None, content_hash=content_hash("theirs"),
            embedding=_vec(1.0),
        )
        hits = store.search_user_notes(user_id=other, query_embedding=_vec(1.0), top_k=10)
        contents = {h["content"] for h in hits}
        assert contents == {"mine"}  # never sees other2's note
    finally:
        with psycopg.connect(db_url, autocommit=True) as conn:
            conn.execute("delete from auth.users where id = %s", (other2,))


@requires_db
def test_user_note_edit_replaces_not_duplicates(db_url, seed_user):
    store = Store(db_url)
    sid = uuid.uuid4()
    store.upsert_user_note(
        user_id=seed_user, source_kind="journal_note", source_id=sid,
        content="v1", occurred_at=None, content_hash=content_hash("v1"), embedding=_vec(1.0),
    )
    store.upsert_user_note(
        user_id=seed_user, source_kind="journal_note", source_id=sid,
        content="v2", occurred_at=None, content_hash=content_hash("v2"), embedding=_vec(2.0),
    )
    hits = store.search_user_notes(user_id=seed_user, query_embedding=_vec(2.0), top_k=10)
    assert [h["content"] for h in hits] == ["v2"]


@requires_db
def test_search_user_notes_writes_audit(db_url, seed_user):
    import psycopg
    store = Store(db_url)
    store.upsert_user_note(
        user_id=seed_user, source_kind="journal_note", source_id=uuid.uuid4(),
        content="note", occurred_at=None, content_hash=content_hash("note"), embedding=_vec(1.0),
    )
    store.search_user_notes(user_id=seed_user, query_embedding=_vec(1.0), top_k=5)
    with psycopg.connect(db_url, autocommit=True) as conn:
        row = conn.execute(
            "select op, entrypoint from rag.user_note_access_audit where user_id=%s and op='search'",
            (seed_user,),
        ).fetchone()
    assert row is not None
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd cloud_functions/rag && RAG_TEST_DATABASE_URL=$RAG_TEST_DATABASE_URL python -m pytest tests/test_store.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'core.store'` (or all skipped if no DB — set one to develop this task).

- [ ] **Step 4: Write minimal implementation**

`cloud_functions/rag/core/store.py`:
```python
import hashlib
import psycopg
from pgvector.psycopg import register_vector


def content_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


class Store:
    def __init__(self, database_url: str, schema: str = "rag"):
        self._url = database_url
        self._schema = schema

    def _connect(self):
        conn = psycopg.connect(self._url, autocommit=True)
        register_vector(conn)
        return conn

    def upsert_kb_chunk(self, *, source_uri, source_type, chunk_index, content,
                        metadata, content_hash, embedding) -> bool:
        import json
        with self._connect() as conn:
            existing = conn.execute(
                f"select content_hash from {self._schema}.kb_chunks "
                "where source_uri=%s and chunk_index=%s",
                (source_uri, chunk_index),
            ).fetchone()
            if existing and existing[0] == content_hash:
                return False
            conn.execute(
                f"""insert into {self._schema}.kb_chunks
                    (source_uri, source_type, chunk_index, content, metadata,
                     content_hash, embedding)
                    values (%s,%s,%s,%s,%s,%s,%s)
                    on conflict (source_uri, chunk_index) do update set
                      source_type=excluded.source_type, content=excluded.content,
                      metadata=excluded.metadata, content_hash=excluded.content_hash,
                      embedding=excluded.embedding""",
                (source_uri, source_type, chunk_index, content, json.dumps(metadata),
                 content_hash, embedding),
            )
            return True

    def upsert_user_note(self, *, user_id, source_kind, source_id, content,
                         occurred_at, content_hash, embedding) -> bool:
        with self._connect() as conn:
            existing = conn.execute(
                f"select content_hash from {self._schema}.user_note_embeddings "
                "where source_kind=%s and source_id=%s",
                (source_kind, source_id),
            ).fetchone()
            if existing and existing[0] == content_hash:
                self._audit(conn, user_id, "ingest_user_note", "upsert", [source_id])
                return False
            conn.execute(
                f"""insert into {self._schema}.user_note_embeddings
                    (user_id, source_kind, source_id, content, occurred_at,
                     content_hash, embedding)
                    values (%s,%s,%s,%s,%s,%s,%s)
                    on conflict (source_kind, source_id) do update set
                      content=excluded.content, occurred_at=excluded.occurred_at,
                      content_hash=excluded.content_hash, embedding=excluded.embedding""",
                (user_id, source_kind, source_id, content, occurred_at, content_hash, embedding),
            )
            self._audit(conn, user_id, "ingest_user_note", "upsert", [source_id])
            return True

    def delete_user_note(self, *, user_id, source_kind, source_id) -> int:
        with self._connect() as conn:
            cur = conn.execute(
                f"delete from {self._schema}.user_note_embeddings "
                "where source_kind=%s and source_id=%s",
                (source_kind, source_id),
            )
            self._audit(conn, user_id, "ingest_user_note", "delete", [source_id])
            return cur.rowcount

    def search_kb(self, *, query_embedding, top_k) -> list[dict]:
        with self._connect() as conn:
            rows = conn.execute(
                f"""select content, source_type, source_uri, metadata,
                       1 - (embedding <=> %s) as score
                    from {self._schema}.kb_chunks
                    order by embedding <=> %s limit %s""",
                (query_embedding, query_embedding, top_k),
            ).fetchall()
        return [
            {"content": r[0], "source_type": r[1], "source_uri": r[2],
             "metadata": r[3], "score": float(r[4])}
            for r in rows
        ]

    def search_user_notes(self, *, user_id, query_embedding, top_k) -> list[dict]:
        with self._connect() as conn:
            rows = conn.execute(
                f"""select id, content, source_kind, occurred_at,
                       1 - (embedding <=> %s) as score
                    from {self._schema}.user_note_embeddings
                    where user_id = %s
                    order by embedding <=> %s limit %s""",
                (query_embedding, user_id, query_embedding, top_k),
            ).fetchall()
            source_ids = [r[0] for r in rows]
            self._audit(conn, user_id, "retrieve", "search", source_ids)
        return [
            {"content": r[1], "source_kind": r[2], "occurred_at": r[3], "score": float(r[4])}
            for r in rows
        ]

    def _audit(self, conn, user_id, entrypoint, op, source_ids):
        conn.execute(
            f"""insert into {self._schema}.user_note_access_audit
                (user_id, entrypoint, op, source_ids) values (%s,%s,%s,%s)""",
            (user_id, entrypoint, op, source_ids),
        )
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd cloud_functions/rag && python -m pytest tests/test_store.py -v`
Expected: PASS (5 tests) when `RAG_TEST_DATABASE_URL` points at a migrated pgvector DB; otherwise SKIPPED.

- [ ] **Step 6: Commit**

```bash
git add cloud_functions/rag/core/store.py cloud_functions/rag/tests/conftest.py \
  cloud_functions/rag/tests/test_store.py
git commit -m "feat(rag): add pgvector store with idempotent upsert, search, audit"
```

---

## Task 6: `ingest_kb` entrypoint (GCS batch)

**Files:**
- Modify/Create: `cloud_functions/rag/main.py`
- Test: `cloud_functions/rag/tests/test_handlers.py`

**Interfaces:**
- Consumes: `core.config.load_config`, `core.chunking`, `core.embeddings.Embedder`, `core.store.Store`, `core.store.content_hash`.
- Produces: `ingest_kb(request)` functions-framework HTTP handler. Reads JSON `{"prefix": "book/"}`, lists GCS objects under `gs://<source_bucket>/<prefix>`, chunks by type (`book/` → `chunk_book`, `lab/` → `chunk_lab_reference`), embeds new chunks, upserts. Returns JSON `{"files": int, "chunks_embedded": int, "chunks_skipped": int}`.
- Also produces a testable seam: `run_ingest_kb(prefix, *, gcs, embedder, store, cfg) -> dict` so the handler is thin and the logic is unit-testable with fakes.

- [ ] **Step 1: Write the failing test (logic seam with fakes)**

`cloud_functions/rag/tests/test_handlers.py`:
```python
from core.chunking import Chunk
from core.config import load_config
from main import run_ingest_kb


class FakeGCS:
    def __init__(self, files):  # files: dict[name -> text]
        self._files = files

    def list_texts(self, bucket, prefix):
        return [(n, t) for n, t in self._files.items() if n.startswith(prefix)]


class FakeEmbedder:
    DIMENSION = 768

    def embed_documents(self, texts):
        return [[float(len(t.split()))] + [0.0] * 767 for t in texts]


class RecordingStore:
    def __init__(self):
        self.embedded = 0
        self.skipped = 0

    def upsert_kb_chunk(self, **kw):
        # Pretend chunk 0 already exists (skip), others are new.
        if kw["chunk_index"] == 0:
            self.skipped += 1
            return False
        self.embedded += 1
        return True


def test_run_ingest_kb_chunks_embeds_and_counts():
    cfg = load_config()
    gcs = FakeGCS({"book/ch1.md": "# H\n\n" + ("w " * 50).strip()})
    store = RecordingStore()
    result = run_ingest_kb("book/", gcs=gcs, embedder=FakeEmbedder(), store=store, cfg=cfg)
    assert result["files"] == 1
    assert result["chunks_embedded"] + result["chunks_skipped"] >= 1
    assert result["chunks_skipped"] == store.skipped
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cloud_functions/rag && python -m pytest tests/test_handlers.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'main'`

- [ ] **Step 3: Write minimal implementation**

`cloud_functions/rag/main.py`:
```python
import json

import functions_framework

from core.chunking import chunk_book, chunk_lab_reference
from core.config import load_config
from core.embeddings import Embedder
from core.store import Store, content_hash


class _GCSReader:
    def list_texts(self, bucket: str, prefix: str):
        from google.cloud import storage

        client = storage.Client()
        out = []
        for blob in client.list_blobs(bucket, prefix=prefix):
            if blob.name.endswith("/"):
                continue
            out.append((blob.name, blob.download_as_text()))
        return out


def _chunks_for(name: str, text: str, cfg):
    if name.startswith("lab/") or name.startswith("labs/"):
        return "lab_reference", chunk_lab_reference(text)
    return "book", chunk_book(
        text, max_tokens=cfg.chunk_max_tokens, overlap_ratio=cfg.chunk_overlap_ratio
    )


def run_ingest_kb(prefix, *, gcs, embedder, store, cfg) -> dict:
    files = gcs.list_texts(cfg.source_bucket, prefix)
    embedded = skipped = 0
    for name, text in files:
        source_type, chunks = _chunks_for(name, text, cfg)
        if not chunks:
            continue
        vectors = embedder.embed_documents([c.content for c in chunks])
        source_uri = f"gs://{cfg.source_bucket}/{name}"
        for chunk, vec in zip(chunks, vectors):
            wrote = store.upsert_kb_chunk(
                source_uri=source_uri, source_type=source_type,
                chunk_index=chunk.chunk_index, content=chunk.content,
                metadata=chunk.metadata, content_hash=content_hash(chunk.content),
                embedding=vec,
            )
            if wrote:
                embedded += 1
            else:
                skipped += 1
    return {"files": len(files), "chunks_embedded": embedded, "chunks_skipped": skipped}


@functions_framework.http
def ingest_kb(request):
    body = request.get_json(silent=True) or {}
    prefix = body.get("prefix", "")
    cfg = load_config()
    embedder = Embedder(cfg.gcp_project, cfg.vertex_location, cfg.embed_model)
    store = Store(cfg.database_url, cfg.schema)
    result = run_ingest_kb(prefix, gcs=_GCSReader(), embedder=embedder, store=store, cfg=cfg)
    return (json.dumps(result), 200, {"Content-Type": "application/json"})
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd cloud_functions/rag && python -m pytest tests/test_handlers.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add cloud_functions/rag/main.py cloud_functions/rag/tests/test_handlers.py
git commit -m "feat(rag): add ingest_kb entrypoint with GCS batch ingestion"
```

---

## Task 7: `ingest_user_note` entrypoint (Pub/Sub)

**Files:**
- Modify: `cloud_functions/rag/main.py`
- Test: `cloud_functions/rag/tests/test_handlers.py`

**Interfaces:**
- Consumes: `core.store.Store`, `core.embeddings.Embedder`, `core.config.load_config`.
- Produces: `ingest_user_note(cloud_event)` functions-framework CloudEvent handler. Decodes the base64 Pub/Sub message JSON `{user_id, source_kind, source_id, content, occurred_at, op}`; `op="upsert"` embeds + upserts, `op="delete"` deletes. Plus a testable seam `run_ingest_user_note(message: dict, *, embedder, store) -> dict`.
- **Never logs `content`.**

- [ ] **Step 1: Write the failing test**

Append to `cloud_functions/rag/tests/test_handlers.py`:
```python
from main import run_ingest_user_note


class NoteStore:
    def __init__(self):
        self.upserts = []
        self.deletes = []

    def upsert_user_note(self, **kw):
        self.upserts.append(kw)
        return True

    def delete_user_note(self, **kw):
        self.deletes.append(kw)
        return 1


def test_run_ingest_user_note_upsert_embeds_and_writes():
    store = NoteStore()
    msg = {
        "user_id": "11111111-1111-1111-1111-111111111111",
        "source_kind": "journal_note",
        "source_id": "22222222-2222-2222-2222-222222222222",
        "content": "felt foggy after lunch",
        "occurred_at": "2026-06-25T12:00:00Z",
        "op": "upsert",
    }
    result = run_ingest_user_note(msg, embedder=FakeEmbedder(), store=store)
    assert result == {"op": "upsert", "written": True}
    assert len(store.upserts) == 1
    assert store.upserts[0]["user_id"] == msg["user_id"]
    assert "content_hash" in store.upserts[0]


def test_run_ingest_user_note_delete():
    store = NoteStore()
    msg = {
        "user_id": "11111111-1111-1111-1111-111111111111",
        "source_kind": "journal_note",
        "source_id": "22222222-2222-2222-2222-222222222222",
        "op": "delete",
    }
    result = run_ingest_user_note(msg, embedder=FakeEmbedder(), store=store)
    assert result == {"op": "delete", "deleted": 1}
    assert len(store.deletes) == 1
```

Note: `FakeEmbedder` needs `embed_query` here — extend it in the test file:
```python
# add to FakeEmbedder:
    def embed_query(self, text):
        return [float(len(text.split()))] + [0.0] * 767
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cloud_functions/rag && python -m pytest tests/test_handlers.py::test_run_ingest_user_note_upsert_embeds_and_writes -v`
Expected: FAIL — `ImportError: cannot import name 'run_ingest_user_note'`

- [ ] **Step 3: Write minimal implementation**

Add to `cloud_functions/rag/main.py` (imports `base64`):
```python
import base64


def run_ingest_user_note(message: dict, *, embedder, store) -> dict:
    op = message.get("op", "upsert")
    if op == "delete":
        deleted = store.delete_user_note(
            user_id=message["user_id"], source_kind=message["source_kind"],
            source_id=message["source_id"],
        )
        return {"op": "delete", "deleted": deleted}
    content = message["content"]
    vec = embedder.embed_query(content)  # single text; query-type fine for short notes
    written = store.upsert_user_note(
        user_id=message["user_id"], source_kind=message["source_kind"],
        source_id=message["source_id"], content=content,
        occurred_at=message.get("occurred_at"), content_hash=content_hash(content),
        embedding=vec,
    )
    return {"op": "upsert", "written": written}


@functions_framework.cloud_event
def ingest_user_note(cloud_event):
    data = cloud_event.data["message"]["data"]
    message = json.loads(base64.b64decode(data).decode("utf-8"))
    cfg = load_config()
    embedder = Embedder(cfg.gcp_project, cfg.vertex_location, cfg.embed_model)
    store = Store(cfg.database_url, cfg.schema)
    run_ingest_user_note(message, embedder=embedder, store=store)
    # No return body for CloudEvent handlers; raising re-queues (nack).
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd cloud_functions/rag && python -m pytest tests/test_handlers.py -v`
Expected: PASS (all handler tests)

- [ ] **Step 5: Commit**

```bash
git add cloud_functions/rag/main.py cloud_functions/rag/tests/test_handlers.py
git commit -m "feat(rag): add ingest_user_note Pub/Sub entrypoint"
```

---

## Task 8: `retrieve` entrypoint (HTTP)

**Files:**
- Modify: `cloud_functions/rag/main.py`
- Test: `cloud_functions/rag/tests/test_handlers.py`

**Interfaces:**
- Consumes: `core.store.Store`, `core.embeddings.Embedder`, `core.config.load_config`.
- Produces: `retrieve(request)` HTTP handler. JSON in: `{user_id, query, top_k_kb?, top_k_user?}`. JSON out: `{"kb": [...], "notes": [...]}`. Plus seam `run_retrieve(payload, *, embedder, store, cfg) -> dict`.

- [ ] **Step 1: Write the failing test**

Append to `cloud_functions/rag/tests/test_handlers.py`:
```python
from core.config import load_config
from main import run_retrieve


class SearchStore:
    def search_kb(self, *, query_embedding, top_k):
        return [{"content": "book bit", "source_type": "book",
                 "source_uri": "gs://b/x.md", "metadata": {}, "score": 0.9}][:top_k]

    def search_user_notes(self, *, user_id, query_embedding, top_k):
        return [{"content": "my note", "source_kind": "journal_note",
                 "occurred_at": None, "score": 0.8}][:top_k]


def test_run_retrieve_returns_kb_and_notes():
    cfg = load_config()
    payload = {"user_id": "11111111-1111-1111-1111-111111111111", "query": "why tired"}
    result = run_retrieve(payload, embedder=FakeEmbedder(), store=SearchStore(), cfg=cfg)
    assert [h["content"] for h in result["kb"]] == ["book bit"]
    assert [h["content"] for h in result["notes"]] == ["my note"]


def test_run_retrieve_honors_top_k_overrides():
    cfg = load_config()
    payload = {"user_id": "1", "query": "q", "top_k_kb": 0, "top_k_user": 0}
    result = run_retrieve(payload, embedder=FakeEmbedder(), store=SearchStore(), cfg=cfg)
    assert result["kb"] == []
    assert result["notes"] == []
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cloud_functions/rag && python -m pytest tests/test_handlers.py::test_run_retrieve_returns_kb_and_notes -v`
Expected: FAIL — `ImportError: cannot import name 'run_retrieve'`

- [ ] **Step 3: Write minimal implementation**

Add to `cloud_functions/rag/main.py`:
```python
def run_retrieve(payload: dict, *, embedder, store, cfg) -> dict:
    query = payload["query"]
    user_id = payload["user_id"]
    top_k_kb = payload.get("top_k_kb", cfg.top_k_kb)
    top_k_user = payload.get("top_k_user", cfg.top_k_user)
    qvec = embedder.embed_query(query)
    kb = store.search_kb(query_embedding=qvec, top_k=top_k_kb) if top_k_kb else []
    notes = (
        store.search_user_notes(user_id=user_id, query_embedding=qvec, top_k=top_k_user)
        if top_k_user else []
    )
    return {"kb": kb, "notes": notes}


@functions_framework.http
def retrieve(request):
    payload = request.get_json(silent=True) or {}
    cfg = load_config()
    embedder = Embedder(cfg.gcp_project, cfg.vertex_location, cfg.embed_model)
    store = Store(cfg.database_url, cfg.schema)
    result = run_retrieve(payload, embedder=embedder, store=store, cfg=cfg)
    return (json.dumps(result), 200, {"Content-Type": "application/json"})
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd cloud_functions/rag && python -m pytest tests/ -v`
Expected: PASS (all non-DB tests; DB tests skipped without `RAG_TEST_DATABASE_URL`)

- [ ] **Step 5: Commit**

```bash
git add cloud_functions/rag/main.py cloud_functions/rag/tests/test_handlers.py
git commit -m "feat(rag): add retrieve entrypoint returning ranked kb + notes"
```

---

## Task 9: README, provisioning checklist, and CI wiring

**Files:**
- Create: `cloud_functions/rag/README.md`
- Modify: `.github/workflows/ci.yml`

**Interfaces:** none (docs + CI).

- [ ] **Step 1: Write the README**

`cloud_functions/rag/README.md`:
````markdown
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
- [ ] Enable `vector` extension and apply `spec/migrations/02_rag_schema.sql`.
- [ ] Create Pub/Sub topic `rag-user-note-ingest` + a dead-letter topic.
- [ ] Create the function service account with: `roles/aiplatform.user`,
      `roles/secretmanager.secretAccessor`, `roles/storage.objectViewer` on
      `ignitehealth-rag-source-prod`, `roles/pubsub.subscriber` on the topic.
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
````

- [ ] **Step 2: Add a CI job for the RAG function**

Add this job to `.github/workflows/ci.yml` (sibling of the `api` and `web` jobs). It runs the non-DB tests plus DB-integration tests against a pgvector service container with the migration applied:
```yaml
  rag:
    name: RAG (pytest)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: cloud_functions/rag
    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: testdb
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U postgres"
          --health-interval 10s --health-timeout 5s --health-retries 5
    env:
      RAG_TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/testdb
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - name: Install deps
        run: pip install -r requirements-dev.txt
      - name: Prepare auth stub + apply migration
        run: |
          psql "$RAG_TEST_DATABASE_URL" -c "create schema if not exists auth; create table if not exists auth.users (id uuid primary key); create or replace function auth.uid() returns uuid language sql stable as \$\$ select null::uuid \$\$;"
          psql "$RAG_TEST_DATABASE_URL" -f ../../spec/migrations/02_rag_schema.sql
      - name: Pytest
        run: python -m pytest tests/ -v
```

- [ ] **Step 3: Run the full suite locally to confirm green**

Run: `cd cloud_functions/rag && python -m pytest tests/ -v`
Expected: PASS (DB tests skipped locally if no `RAG_TEST_DATABASE_URL`; all others pass)

- [ ] **Step 4: Commit**

```bash
git add cloud_functions/rag/README.md .github/workflows/ci.yml
git commit -m "docs(rag): add README + provisioning checklist; ci: add rag job"
```

---

## Self-Review

**Spec coverage:**
- §1 scope (ingestion + retrieval, no LLM) → Tasks 6,7,8; LLM explicitly absent.
- §2 decisions (pgvector, Vertex, hybrid, GCS, Approach A, Secret Manager) → Tasks 1,2,4,6.
- §3 architecture / trust (API passes user_id) → Tasks 7,8 use `user_id` from message/payload, never a JWT.
- §4 data model + PHI plaintext + RLS + audit → Task 2 (schema/RLS/audit), Task 5 (filter + audit writes).
- §5 entrypoints + idempotency → Tasks 6,7,8; idempotency in Task 5 + tests.
- §6 chunking + embedding (task types, fixed model) → Tasks 3,4.
- §7 security/ops (least-priv SA, min-instances, no content in logs, audit) → Task 9 deploy flags + README; Tasks 5,7 avoid logging content.
- §8 testing (chunking/embeddings unit, store real-DB, RLS isolation, thin handlers) → Tasks 3,4,5,6,7,8 + Task 9 CI.
- §9 deferred (API work, BAAs, provisioning) → README checklist (Task 9); API work intentionally out of scope.

**Placeholder scan:** none — all steps contain real code/commands.

**Type consistency:** `Store` method names and kwargs in Task 5 match calls in Tasks 6/7/8; `Embedder.embed_documents`/`embed_query` consistent across Tasks 4/6/7/8; `content_hash` used consistently; `Chunk.chunk_index`/`metadata`/`content` consistent between Tasks 3 and 6.

**Note for executor:** Tasks must be done in order (each builds on prior modules). DB-backed tests (Task 5) require a pgvector Postgres with `02_rag_schema.sql` applied and the `auth.users`/`auth.uid()` stub; CI (Task 9) sets this up automatically.
