# Chat Agent (RAG + Claude via Vertex) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An authenticated user opens a chat from the dashboard, asks hypothyroidism questions, and gets answers grounded in the book KB and bounded by the non-diagnostic guardrails.

**Architecture:** A new `POST /chat` API endpoint retrieves book chunks from Cloud SQL pgvector (query embedded via Vertex), assembles a guardrailed prompt, and calls Claude Sonnet via Vertex AI; a protected Next.js `/chat` page renders a multi-turn, in-session conversation. Retrieval and the LLM call are injectable so the core logic is unit-testable without network.

**Tech Stack:** FastAPI, `anthropic[vertex]` (Claude on Vertex), `vertexai` (embeddings), `psycopg` + `pgvector` (Cloud SQL KB), Next.js 16 / React 19.

## Global Constraints

- **LLM:** Claude Sonnet via **Vertex AI** (`anthropic.AnthropicVertex`), region from config (e.g. `us-east5`). Keeps the LLM under the single Google Cloud BAA. No Anthropic API key.
- **Model resilience:** model ID, fallback model, and region are **config values** (env). On a primary-model error, fall back to the configured fallback model.
- **Retrieval:** embed the question via Vertex `text-embedding-005` (768-dim, `us-central1`); cosine search `rag.kb_chunks` in Cloud SQL with an explicit `%s::vector` cast (the operator needs `vector`, not `float[]`).
- **Content:** **book KB only** in v1 — no journal/lab data, **no PHI in the prompt**.
- **Conversation:** multi-turn, **in-session only** (browser React state); not persisted.
- **Guardrails (non-negotiable):** non-diagnostic ("sometimes associated with…", never "you have…"), never prescribe, always defer to the provider, ground in the book framework, transparent about limits; `story`-tagged chunks framed as illustrative, never evidence.
- **Logging:** metadata only (entrypoint, latency, counts) — never message content (future PHI).
- **Auth:** `POST /chat` is gated by `get_current_user_id`; the web page is inside the protected `(app)` group.
- **Config file:** the API loads env from `api/.env` (`Settings.Config.env_file = ".env"`).

---

## File Structure

```
api/
  pyproject.toml                      # + anthropic[vertex], google-cloud-aiplatform, psycopg[binary], pgvector
  app/core/config.py                  # + chat config fields
  app/services/kb_retrieval.py        # NEW: embed query (Vertex) + search kb_chunks (Cloud SQL)
  app/services/chat.py                # NEW: ChatService (prompt + guardrails + LLM + orchestrate)
  app/services/__init__.py            # export get_chat_service
  app/models/chat.py                  # NEW: ChatRequest / ChatResponse / ChatMessage
  app/models/__init__.py              # export chat models
  app/routers/chat.py                 # NEW: POST /chat
  app/main.py                         # include chat_router
  tests/test_kb_retrieval.py          # NEW
  tests/test_chat_service.py          # NEW
  tests/test_chat_router.py           # NEW
web/
  lib/api/client.ts                   # + chat() method + ChatMessage/ChatReply types
  app/(app)/chat/page.tsx             # NEW: chat UI
  components/layout/AppSidebar.tsx    # + Chat nav item
```

---

## Task 1: API deps + chat config

**Files:**
- Modify: `api/pyproject.toml`
- Modify: `api/app/core/config.py`
- Test: `api/tests/test_chat_config.py`

**Interfaces:**
- Produces: `Settings` fields — `vertex_chat_model: str`, `vertex_chat_fallback_model: str`, `vertex_chat_location: str`, `gcp_project: str`, `vertex_embed_location: str`, `vertex_embed_model: str`, `kb_database_url: str`, `chat_top_k: int`.

- [ ] **Step 1: Add dependencies**

In `api/pyproject.toml`, under `[tool.poetry.dependencies]`, add:
```toml
anthropic = {extras = ["vertex"], version = "^0.40.0"}
google-cloud-aiplatform = "^1.70.0"
psycopg = {extras = ["binary"], version = "^3.2.0"}
pgvector = "^0.3.0"
```
Run: `cd api && poetry lock && poetry install --no-interaction --with dev`
Expected: resolves and installs.

- [ ] **Step 2: Write the failing test**

`api/tests/test_chat_config.py`:
```python
from app.core.config import get_settings


def test_chat_config_defaults(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://x.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "k")
    monkeypatch.setenv("SUPABASE_JWT_SECRET", "s")
    monkeypatch.setenv("GCP_PROJECT", "ignitehealthnow-2025")
    monkeypatch.setenv("KB_DATABASE_URL", "postgresql://u:p@127.0.0.1:5432/ignite")
    get_settings.cache_clear()
    s = get_settings()
    assert s.gcp_project == "ignitehealthnow-2025"
    assert s.kb_database_url.endswith("/ignite")
    assert s.vertex_chat_location == "us-east5"
    assert s.vertex_embed_model == "text-embedding-005"
    assert s.chat_top_k == 6
    assert s.vertex_chat_model  # non-empty default
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd api && poetry run pytest tests/test_chat_config.py -v`
Expected: FAIL — `AttributeError`/validation for the new fields.

- [ ] **Step 4: Add the config fields**

In `api/app/core/config.py`, add these fields to `Settings` (after `gcp_kms_key`):
```python
    # GCP / Vertex
    gcp_project: str = ""
    vertex_embed_location: str = "us-central1"
    vertex_embed_model: str = "text-embedding-005"

    # Chat (Claude via Vertex)
    vertex_chat_location: str = "us-east5"
    vertex_chat_model: str = "claude-sonnet-4-6"          # pinned per Vertex Model Garden at deploy
    vertex_chat_fallback_model: str = "claude-haiku-4-5"
    chat_top_k: int = 6

    # Cloud SQL knowledge base (rag.kb_chunks)
    kb_database_url: str = ""
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd api && poetry run pytest tests/test_chat_config.py -v`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add api/pyproject.toml api/poetry.lock api/app/core/config.py api/tests/test_chat_config.py
git commit -m "feat(api): add chat deps + Vertex/Claude/KB config"
```

---

## Task 2: KB retrieval module

**Files:**
- Create: `api/app/services/kb_retrieval.py`
- Test: `api/tests/test_kb_retrieval.py`

**Interfaces:**
- Consumes: `Settings` (Task 1).
- Produces:
  - `class KbRetriever` with `__init__(self, *, project, embed_location, embed_model, db_url, schema="rag")`.
  - `embed_query(self, text: str) -> list[float]` — Vertex `RETRIEVAL_QUERY` embedding.
  - `search(self, query_embedding: list[float], top_k: int) -> list[dict]` — keys `content, source_type, source_uri, score`.
  - `retrieve(self, question: str, top_k: int) -> list[dict]` — embed then search.
  - `get_kb_retriever() -> KbRetriever` factory (reads settings).

- [ ] **Step 1: Add a fake vertexai to conftest (no GCP in unit tests)**

Append to `api/tests/conftest.py`:
```python
import sys
import types

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
        return [_FakeEmbedding([float(len(i.text.split()))] + [0.0] * 767) for i in inputs]


_vertexai.init = lambda *a, **k: None
_lm.TextEmbeddingModel = _FakeModel
_lm.TextEmbeddingInput = _FakeTextEmbeddingInput
sys.modules.setdefault("vertexai", _vertexai)
sys.modules.setdefault("vertexai.language_models", _lm)
```

- [ ] **Step 2: Write the failing test**

`api/tests/test_kb_retrieval.py`:
```python
from app.services.kb_retrieval import KbRetriever


def test_embed_query_returns_768_vector():
    r = KbRetriever(project="p", embed_location="us-central1",
                    embed_model="text-embedding-005",
                    db_url="postgresql://u:p@localhost/x")
    v = r.embed_query("why am I tired")
    assert len(v) == 768
    assert v[0] == 3.0  # fake encodes token count


def test_retrieve_calls_search_with_embedding(monkeypatch):
    r = KbRetriever(project="p", embed_location="us-central1",
                    embed_model="text-embedding-005",
                    db_url="postgresql://u:p@localhost/x")
    captured = {}

    def fake_search(query_embedding, top_k):
        captured["dim"] = len(query_embedding)
        captured["k"] = top_k
        return [{"content": "c", "source_type": "book", "source_uri": "u", "score": 0.9}]

    monkeypatch.setattr(r, "search", fake_search)
    hits = r.retrieve("why am I tired", top_k=4)
    assert captured == {"dim": 768, "k": 4}
    assert hits[0]["source_type"] == "book"
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd api && poetry run pytest tests/test_kb_retrieval.py -v`
Expected: FAIL — `ModuleNotFoundError: app.services.kb_retrieval`.

- [ ] **Step 4: Implement the module**

`api/app/services/kb_retrieval.py`:
```python
import vertexai
from vertexai.language_models import TextEmbeddingInput, TextEmbeddingModel

from app.core import get_settings

EMBED_DIM = 768


class KbRetriever:
    """Embed a question (Vertex) and cosine-search rag.kb_chunks (Cloud SQL)."""

    def __init__(self, *, project, embed_location, embed_model, db_url, schema="rag"):
        self._project = project
        self._embed_location = embed_location
        self._embed_model = embed_model
        self._db_url = db_url
        self._schema = schema
        self._model = None

    def _get_model(self):
        if self._model is None:
            vertexai.init(project=self._project, location=self._embed_location)
            self._model = TextEmbeddingModel.from_pretrained(self._embed_model)
        return self._model

    def embed_query(self, text: str) -> list[float]:
        inputs = [TextEmbeddingInput(text, "RETRIEVAL_QUERY")]
        return self._get_model().get_embeddings(inputs)[0].values

    def search(self, query_embedding: list[float], top_k: int) -> list[dict]:
        import psycopg
        from pgvector.psycopg import register_vector

        with psycopg.connect(self._db_url) as conn:
            register_vector(conn)
            rows = conn.execute(
                f"""select content, source_type, source_uri,
                       1 - (embedding <=> %s::vector) as score
                    from {self._schema}.kb_chunks
                    order by embedding <=> %s::vector limit %s""",
                (query_embedding, query_embedding, top_k),
            ).fetchall()
        return [
            {"content": r[0], "source_type": r[1], "source_uri": r[2], "score": float(r[3])}
            for r in rows
        ]

    def retrieve(self, question: str, top_k: int) -> list[dict]:
        return self.search(self.embed_query(question), top_k)


def get_kb_retriever() -> KbRetriever:
    s = get_settings()
    return KbRetriever(
        project=s.gcp_project,
        embed_location=s.vertex_embed_location,
        embed_model=s.vertex_embed_model,
        db_url=s.kb_database_url,
    )
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd api && poetry run pytest tests/test_kb_retrieval.py -v`
Expected: PASS (2 tests). `psycopg`/`pgvector` import only inside `search`, so the unit tests (which mock `search`) don't need a DB.

- [ ] **Step 6: Commit**

```bash
git add api/app/services/kb_retrieval.py api/tests/test_kb_retrieval.py api/tests/conftest.py
git commit -m "feat(api): add KB retriever (Vertex embed + pgvector search)"
```

---

## Task 3: Chat models

**Files:**
- Create: `api/app/models/chat.py`
- Modify: `api/app/models/__init__.py`
- Test: `api/tests/test_chat_models.py`

**Interfaces:**
- Produces: `ChatMessage{role: str, content: str}`, `ChatRequest{messages: list[ChatMessage]}`, `ChatSource{source_uri, source_type, score}`, `ChatResponse{reply: str, sources: list[ChatSource]}`.

- [ ] **Step 1: Write the failing test**

`api/tests/test_chat_models.py`:
```python
from app.models import ChatRequest, ChatResponse


def test_chat_request_parses_messages():
    req = ChatRequest(messages=[{"role": "user", "content": "hi"}])
    assert req.messages[0].role == "user"


def test_chat_response_shape():
    resp = ChatResponse(reply="hello", sources=[
        {"source_uri": "gs://b/Ch01.md", "source_type": "book", "score": 0.9}
    ])
    assert resp.reply == "hello"
    assert resp.sources[0].source_type == "book"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd api && poetry run pytest tests/test_chat_models.py -v`
Expected: FAIL — import error for `ChatRequest`.

- [ ] **Step 3: Implement the models**

`api/app/models/chat.py`:
```python
from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str   # 'user' | 'assistant'
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


class ChatSource(BaseModel):
    source_uri: str
    source_type: str
    score: float


class ChatResponse(BaseModel):
    reply: str
    sources: list[ChatSource]
```

Add to `api/app/models/__init__.py` (keep existing exports):
```python
from .chat import ChatMessage, ChatRequest, ChatResponse, ChatSource  # noqa: F401
```
And add `"ChatMessage", "ChatRequest", "ChatResponse", "ChatSource"` to `__all__`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd api && poetry run pytest tests/test_chat_models.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add api/app/models/chat.py api/app/models/__init__.py api/tests/test_chat_models.py
git commit -m "feat(api): add chat request/response models"
```

---

## Task 4: ChatService (prompt + guardrails + LLM + fallback)

**Files:**
- Create: `api/app/services/chat.py`
- Modify: `api/app/services/__init__.py`
- Test: `api/tests/test_chat_service.py`

**Interfaces:**
- Consumes: `KbRetriever` (Task 2), `ChatMessage` (Task 3).
- Produces:
  - `SYSTEM_PROMPT: str` (module constant — the guardrails).
  - `class ChatService.__init__(self, *, retriever, complete_fn, top_k)` where `complete_fn(system: str, messages: list[dict]) -> str`.
  - `build_context(chunks: list[dict]) -> str`.
  - `answer(self, messages: list[ChatMessage]) -> dict` → `{"reply": str, "sources": list[dict]}`.
  - `get_chat_service() -> ChatService` factory (wires the real retriever + Vertex-Claude complete fn with fallback).

- [ ] **Step 1: Write the failing tests**

`api/tests/test_chat_service.py`:
```python
from app.models import ChatMessage
from app.services.chat import ChatService, SYSTEM_PROMPT, build_context


def test_system_prompt_has_guardrails():
    p = SYSTEM_PROMPT.lower()
    assert "never" in p and "diagnos" in p          # non-diagnostic
    assert "provider" in p                            # defer to provider
    assert "prescri" in p                             # never prescribe


def test_build_context_tags_sources():
    ctx = build_context([
        {"content": "fatigue is cellular", "source_type": "book", "source_uri": "gs://b/Ch02.md", "score": 0.7},
        {"content": "Rachel felt...", "source_type": "story", "source_uri": "gs://b/AppC.md", "score": 0.6},
    ])
    assert "[book]" in ctx and "[story]" in ctx
    assert "fatigue is cellular" in ctx


class FakeRetriever:
    def retrieve(self, question, top_k):
        return [{"content": "fatigue is cellular", "source_type": "book",
                 "source_uri": "gs://b/Ch02.md", "score": 0.7}]


def test_answer_passes_system_and_messages_and_returns_sources():
    captured = {}

    def fake_complete(system, messages):
        captured["system"] = system
        captured["messages"] = messages
        return "Here is what the framework says..."

    svc = ChatService(retriever=FakeRetriever(), complete_fn=fake_complete, top_k=6)
    out = svc.answer([ChatMessage(role="user", content="why am I tired")])
    assert out["reply"].startswith("Here is what")
    assert out["sources"][0]["source_type"] == "book"
    # system prompt is the guardrail prompt; retrieved context is included in it
    assert "fatigue is cellular" in captured["system"]
    # the user's message is forwarded to the model
    assert captured["messages"][-1]["content"] == "why am I tired"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd api && poetry run pytest tests/test_chat_service.py -v`
Expected: FAIL — `ModuleNotFoundError: app.services.chat`.

- [ ] **Step 3: Implement the service**

`api/app/services/chat.py`:
```python
import logging

from app.core import get_settings
from app.models import ChatMessage

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the Ignite Health patient-advocacy companion. You are an \
INSTRUMENT that helps a patient understand their situation and prepare to talk with \
their healthcare provider. You are NOT a doctor and NOT an authority.

Hard rules:
- NEVER diagnose. Say "this pattern is sometimes associated with..." — never "you have...".
- NEVER prescribe or recommend medications or doses. You may discuss which labs to ask for.
- ALWAYS defer to the provider: end clinical answers with a note to discuss it with their provider.
- Ground every answer in the provided book context (the Four Legs / cellular-hypothyroid \
framework). If the context doesn't cover it, say so and answer only in general framework terms.
- Be transparent about limits: you help interpret patterns, you are not a substitute for medical evaluation.
- Context items are tagged by source. [story] items are ILLUSTRATIVE examples only — never \
present them as evidence, proof, or a prediction of the user's outcome.

Use the CONTEXT below to answer. Be warm, clear, and non-alarming."""


def build_context(chunks: list[dict]) -> str:
    if not chunks:
        return "(no specific book passages retrieved — answer in general framework terms)"
    lines = []
    for c in chunks:
        lines.append(f"[{c['source_type']}] {c['content']}")
    return "\n\n".join(lines)


class ChatService:
    def __init__(self, *, retriever, complete_fn, top_k: int):
        self._retriever = retriever
        self._complete = complete_fn
        self._top_k = top_k

    def answer(self, messages: list[ChatMessage]) -> dict:
        question = next(
            (m.content for m in reversed(messages) if m.role == "user"), ""
        )
        chunks = self._retriever.retrieve(question, self._top_k)
        system = f"{SYSTEM_PROMPT}\n\n=== CONTEXT ===\n{build_context(chunks)}"
        model_messages = [{"role": m.role, "content": m.content} for m in messages]
        reply = self._complete(system, model_messages)
        sources = [
            {"source_uri": c["source_uri"], "source_type": c["source_type"], "score": c["score"]}
            for c in chunks
        ]
        return {"reply": reply, "sources": sources}


def _vertex_complete_fn():
    """Build a complete(system, messages) -> str backed by Claude on Vertex, with fallback."""
    from anthropic import AnthropicVertex

    s = get_settings()
    client = AnthropicVertex(project_id=s.gcp_project, region=s.vertex_chat_location)

    def complete(system: str, messages: list[dict]) -> str:
        for model in (s.vertex_chat_model, s.vertex_chat_fallback_model):
            try:
                resp = client.messages.create(
                    model=model, max_tokens=1024, system=system, messages=messages,
                )
                return resp.content[0].text
            except Exception as exc:  # pragma: no cover - network
                logger.warning("Claude model %s failed: %s", model, exc)
        raise RuntimeError("All chat models failed")

    return complete


_service = None


def get_chat_service() -> "ChatService":
    global _service
    if _service is None:
        from app.services.kb_retrieval import get_kb_retriever

        s = get_settings()
        _service = ChatService(
            retriever=get_kb_retriever(),
            complete_fn=_vertex_complete_fn(),
            top_k=s.chat_top_k,
        )
    return _service
```

Add to `api/app/services/__init__.py`:
```python
from .chat import get_chat_service  # noqa: F401
```
and add `"get_chat_service"` to `__all__`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd api && poetry run pytest tests/test_chat_service.py -v`
Expected: PASS (3 tests). The Vertex/Anthropic imports are inside the factory, so unit tests (which inject `complete_fn`) don't need them.

- [ ] **Step 5: Commit**

```bash
git add api/app/services/chat.py api/app/services/__init__.py api/tests/test_chat_service.py
git commit -m "feat(api): add ChatService with guardrail prompt + Vertex-Claude + fallback"
```

---

## Task 5: Chat router (`POST /chat`)

**Files:**
- Create: `api/app/routers/chat.py`
- Modify: `api/app/main.py`
- Modify: `api/app/routers/__init__.py`
- Test: `api/tests/test_chat_router.py`

**Interfaces:**
- Consumes: `ChatRequest`/`ChatResponse` (Task 3), `get_chat_service` (Task 4), `get_current_user_id` middleware.
- Produces: `chat_router` mounted at `/chat`; `POST /chat` returns `ChatResponse`.

- [ ] **Step 1: Write the failing test**

`api/tests/test_chat_router.py`:
```python
from fastapi.testclient import TestClient

from app.main import app
from app.middleware import get_current_user_id
from app.services import get_chat_service


class FakeChatService:
    def answer(self, messages):
        return {"reply": "ok", "sources": [
            {"source_uri": "gs://b/Ch01.md", "source_type": "book", "score": 0.9}
        ]}


def test_chat_endpoint_returns_reply_and_sources():
    app.dependency_overrides[get_current_user_id] = lambda: "user-1"
    app.dependency_overrides[get_chat_service] = lambda: FakeChatService()
    try:
        client = TestClient(app)
        resp = client.post("/chat", json={"messages": [{"role": "user", "content": "hi"}]})
        assert resp.status_code == 200
        body = resp.json()
        assert body["reply"] == "ok"
        assert body["sources"][0]["source_type"] == "book"
    finally:
        app.dependency_overrides.clear()


def test_chat_endpoint_requires_auth():
    client = TestClient(app)
    resp = client.post("/chat", json={"messages": [{"role": "user", "content": "hi"}]})
    assert resp.status_code in (401, 403)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd api && poetry run pytest tests/test_chat_router.py -v`
Expected: FAIL — `/chat` route does not exist (404), import error for `chat_router`.

- [ ] **Step 3: Implement the router**

`api/app/routers/chat.py`:
```python
import logging
import time

from fastapi import APIRouter, Depends, HTTPException, status

from app.middleware import get_current_user_id
from app.models import ChatRequest, ChatResponse
from app.services import get_chat_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    user_id: str = Depends(get_current_user_id),
    chat_service=Depends(get_chat_service),
):
    started = time.monotonic()
    try:
        result = chat_service.answer(request.messages)
    except Exception as e:
        logger.error("chat failed for user %s: %s", user_id, e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The assistant is unavailable right now. Please try again.",
        )
    logger.info(
        '{"entrypoint":"chat","user_id":"%s","sources":%d,"ms":%d}',
        user_id, len(result["sources"]), int((time.monotonic() - started) * 1000),
    )
    return result
```

In `api/app/routers/__init__.py`, export `chat_router` (mirror `health_router`/`profile_router`):
```python
from .chat import router as chat_router  # noqa: F401
```
and add to `__all__`.

In `api/app/main.py`, after `app.include_router(profile_router)` add:
```python
from app.routers import chat_router  # (add to the existing routers import)
app.include_router(chat_router)
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd api && poetry run pytest tests/test_chat_router.py -v`
Expected: PASS (2 tests).

- [ ] **Step 5: Run the full API suite**

Run: `cd api && poetry run pytest -q`
Expected: all pass (existing + new).

- [ ] **Step 6: Commit**

```bash
git add api/app/routers/chat.py api/app/routers/__init__.py api/app/main.py api/tests/test_chat_router.py
git commit -m "feat(api): add POST /chat endpoint"
```

---

## Task 6: Web — API client `chat()`

**Files:**
- Modify: `web/lib/api/client.ts`

**Interfaces:**
- Consumes: existing `getAuthHeaders()` + `API_URL`.
- Produces: `ChatMessage`/`ChatReply` types and `api.chat(messages: ChatMessage[]): Promise<ChatReply>`.

- [ ] **Step 1: Add types + method**

In `web/lib/api/client.ts`, add the types near the other interfaces:
```typescript
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatSource {
  source_uri: string
  source_type: string
  score: number
}

export interface ChatReply {
  reply: string
  sources: ChatSource[]
}
```
And inside the `api` object, add:
```typescript
  async chat(messages: ChatMessage[]): Promise<ChatReply> {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ messages }),
    })
    if (!response.ok) {
      throw new Error('The assistant is unavailable right now.')
    }
    return response.json()
  },
```

- [ ] **Step 2: Verify it type-checks**

Run: `cd web && npx tsc --noEmit`
Expected: clean (no errors).

- [ ] **Step 3: Commit**

```bash
git add web/lib/api/client.ts
git commit -m "feat(web): add api.chat() client method"
```

---

## Task 7: Web — chat page + sidebar link

**Files:**
- Create: `web/app/(app)/chat/page.tsx`
- Modify: `web/components/layout/AppSidebar.tsx`

**Interfaces:**
- Consumes: `api.chat`, `ChatMessage` (Task 6).
- Produces: the `/chat` route (protected by the `(app)` layout gate) + a "Chat" sidebar link.

- [ ] **Step 1: Add the Chat nav item**

In `web/components/layout/AppSidebar.tsx`, change `navItems` to insert Chat after Dashboard:
```typescript
const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Chat', href: '/chat' },
  { label: 'Profile', href: '/profile' },
  { label: 'Journal', href: '/journal', disabled: true },
  { label: 'Insights', href: '/insights', disabled: true },
]
```

- [ ] **Step 2: Create the chat page**

`web/app/(app)/chat/page.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { api, type ChatMessage } from '@/lib/api/client'

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return
    setError('')
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const { reply } = await api.chat(next)
      setMessages([...next, { role: 'assistant', content: reply }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] w-full max-w-3xl flex-col">
      <h1 className="mb-4 text-xl font-semibold text-[#212121]">Ask your health companion</h1>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-[#9E9E9E]/30 bg-[#FFFFFF] p-4">
        {messages.length === 0 && (
          <p className="text-sm text-[#9E9E9E]">
            Ask about symptoms, labs, or what to discuss with your provider. This is
            educational and not a substitute for medical care.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === 'user' ? 'text-right' : 'text-left'}
          >
            <span
              className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                m.role === 'user'
                  ? 'bg-[#007ACC] text-white'
                  : 'bg-[#007ACC]/10 text-[#212121]'
              }`}
            >
              {m.content}
            </span>
          </div>
        ))}
        {loading && <p className="text-left text-sm text-[#9E9E9E]">Thinking…</p>}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <form onSubmit={send} className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Why am I tired even though my labs are normal?"
          className="flex-1 rounded-md border border-[#9E9E9E]/40 px-3 py-2 text-[#212121] focus:border-[#007ACC] focus:outline-none focus:ring-2 focus:ring-[#007ACC]/30"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-md bg-[#007ACC] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#0064A5] disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Verify build + lint**

Run: `cd web && npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add web/app/'(app)'/chat/page.tsx web/components/layout/AppSidebar.tsx
git commit -m "feat(web): add chat page + sidebar link"
```

---

## Task 8: Manual end-to-end verification

**Files:** none (verification + notes).

**Prerequisite (one-time, the human operator):** in GCP, **enable the Claude model in Vertex Model Garden** for `ignitehealthnow-2025` (region `us-east5`), and confirm the exact model IDs; set `VERTEX_CHAT_MODEL` / `VERTEX_CHAT_FALLBACK_MODEL` in `api/.env` to those IDs. Add `KB_DATABASE_URL` (the Cloud SQL `ignite-pg-dev` connection via the running proxy, as `rag_app`) and `GCP_PROJECT=ignitehealthnow-2025` to `api/.env`.

- [ ] **Step 1: Restart the API and web dev servers** (so the API picks up the new routes/config and the new `KB_DATABASE_URL`).

- [ ] **Step 2: Confirm retrieval works** against the live KB:
```bash
cd api && poetry run python -c "
from app.services.kb_retrieval import get_kb_retriever
hits = get_kb_retriever().retrieve('why am I tired even though my labs are normal', 4)
print(len(hits), hits[0]['source_type'], round(hits[0]['score'], 3))
"
```
Expected: prints `4 book 0.7x`-ish (the same quality we saw in the RAG smoke test).

- [ ] **Step 3: Browser walkthrough** — log in → click **Chat** in the sidebar → ask *"why am I tired even though my labs are normal?"* → expect a grounded, non-diagnostic answer that references the framework and suggests discussing with a provider. Ask a follow-up (*"what labs should I ask for?"*) → expect it to use the prior turn.

- [ ] **Step 4: Verify guardrails** — ask *"do I have hypothyroidism?"* → the answer must NOT diagnose; it should explain patterns and defer to a provider.

---

## Self-Review

**Spec coverage:**
- §2 decisions (Vertex-Claude, model-as-config+fallback, inline retrieval, KB-only, multi-turn in-session, non-streaming) → Tasks 1, 2, 4, 6, 7.
- §3 flow (embed→search→prompt→Claude→reply+sources) → Tasks 2, 4, 5.
- §4 components (config, kb_retrieval, ChatService, router, web client/page/sidebar) → Tasks 1–7.
- §5 guardrails → Task 4 `SYSTEM_PROMPT` + the guardrail test; source-tiering in `build_context` + its test.
- §6 errors (LLM fail → 503 clean; CORS-safe) → Task 5; fallback in Task 4.
- §7 testing (retrieval, prompt assembly, guardrail test, LLM mocked, thin router) → Tasks 2, 4, 5.
- §8 prerequisites (Vertex Model Garden, KB connection) → Task 8.
- §9 out-of-scope (persistence, personal data, streaming) → not built; noted.
- §10 founding-principle check → Task 4 guardrail test is the regression guard.

**Placeholder scan:** none — all steps contain real code/commands. The exact Vertex Claude model IDs are config values set by the operator in Task 8 (Model Garden gives the canonical IDs); defaults are provided.

**Type consistency:** `KbRetriever.retrieve(question, top_k)` used consistently (Tasks 2, 4); `complete_fn(system, messages)` signature consistent (Task 4 def + tests); `answer(messages) -> {reply, sources}` matches the router + `ChatResponse` (Tasks 3, 4, 5); web `ChatMessage`/`ChatReply` match the API shapes (Tasks 3, 6).

**Note for executor:** Tasks 1–5 are API (do in order — each builds on the prior module). Tasks 6–7 are web (independent of each other but both need the API contract from Tasks 3/5). Task 8 needs the human to enable Claude in Vertex + set env. Unit tests need no GCP/DB (Vertex faked in conftest; retrieval/LLM injected); the real KB search + Claude call are exercised in Task 8.
