# Chat Agent (RAG + Claude) — Design Spec

**Date:** 2026-06-27
**Status:** Approved design, pending user review of this doc
**Scope:** v1 of the Chat Agent — Patient Advocacy Companion (PRD §10). Wires the RAG knowledge base (already live) to an LLM and a chat UI. Maps to PRD §10, memory `project_health_advocate_agent`, `project_founding_principle`, `project_rag_deployment`.

## 1. Purpose

Let an authenticated user open a chat from the dashboard, ask questions about hypothyroidism, and get answers **grounded in the book knowledge base** and framed by the **founding principle** (an instrument that supports the patient and their provider — never a diagnostic authority). This is the "G" (generation) on top of the retrieval we already built.

## 2. Decisions (locked)

| Decision | Choice |
|---|---|
| LLM | **Claude Sonnet (4.x) via Vertex AI** — keeps the LLM under the single Google Cloud BAA; reuses existing Vertex/ADC plumbing; no new vendor key |
| Model resilience | model ID + region as **config** (env/Secret Manager) + a **fallback model**; no provider auto-switch exists, so switching on retirement = one config change |
| Retrieval | **inline in the API** — embed the question (Vertex) + search `kb_chunks` in Cloud SQL directly (mirrors RAG `store.search_kb`); not via a deployed cloud function |
| Retrieved content | **book KB only** for v1 (no journal/lab data exists yet → no PHI in the prompt) |
| Conversation | **multi-turn, in-session** — history in browser React state; **not persisted** to a DB |
| Streaming | **non-streaming** for v1 (easy enhancement later) |

## 3. Architecture & Data Flow

```
Dashboard "Chat" link → /chat (protected route, behind the (app) auth gate)
   user question + prior turns
        │  POST /chat  { messages: [{role, content}, ...] }   (Bearer JWT)
        ▼
   API  ChatService:
     1. embed the latest user question        → Vertex text-embedding-005 (us-central1)
     2. search kb_chunks (top-k, cosine, ::vector) → Cloud SQL ignite-pg-dev (via proxy/conn string)
     3. assemble prompt: system(guardrails) + retrieved context (tagged by source_type)
                         + the conversation messages
     4. call Claude Sonnet via Vertex (us-east5)  [anthropic[vertex] SDK; ADC]
        on primary-model error → fallback model
     5. return { reply: str, sources: [{source_uri, source_type, score}] }
        ▼
   /chat page appends the reply (+ optional source chips) to the message list
```

## 4. Components

### 4.1 Web (`web/`)
- **`app/(app)/chat/page.tsx`** — chat UI: scrollable message list (user/assistant bubbles), a text input + send button, loading state, error state. Multi-turn history in React state (`messages`), sent in full on each request. Client component.
- **Dashboard/sidebar link** — add a **"Chat"** entry (replacing/with the existing "Journal/Insights — Soon" pattern) linking to `/chat`. Visible only inside the authenticated `(app)` shell.
- **`lib/api/client.ts`** — add `chat(messages): Promise<{reply, sources}>` using the existing auth'd `getAuthHeaders()` (provider-agnostic via `authClient.getToken()`).

### 4.2 API (`api/`)
- **`routers/chat.py`** — `POST /chat`, auth-gated (`get_current_user_id`), body `{messages: [{role, content}]}`, returns `{reply, sources}`. Maps errors to clean HTTP responses (CORS-safe).
- **`services/chat.py` — `ChatService`**:
  - `retrieve(question) -> list[chunk]` — Vertex-embed the question, psycopg cosine search on `rag.kb_chunks` (Cloud SQL), top-k (config). Mirrors RAG `store.search_kb` (incl. the `::vector` cast). *(Small duplication of the RAG store; a shared retrieval lib is a later refactor.)*
  - `build_prompt(messages, chunks) -> (system, messages)` — the system prompt (§5) + retrieved context block (chunks tagged by `source_type`) + the conversation.
  - `complete(system, messages) -> str` — call Claude via Vertex (`anthropic[vertex]`), with fallback model on error.
  - `answer(messages) -> {reply, sources}` — orchestrates the above.
- **Config** (`core/config.py`): `vertex_chat_model` (e.g. `claude-sonnet-4-...`), `vertex_chat_fallback_model`, `vertex_chat_location` (e.g. `us-east5`), `kb_database_url` (Cloud SQL KB connection), `chat_top_k`. Secrets via Secret Manager / env.
- **Cloud SQL connection** — the API gains a psycopg connection to `ignite-pg-dev` for the KB (separate from the Supabase/PostgREST profile path). Connection from `kb_database_url`.

## 5. The System Prompt (guardrails — the core of this feature)

The system prompt encodes `project_founding_principle` and PRD §10.3 as hard rules:
- **Instrument, not authority.** Help the user understand their data and prepare for their provider; never replace clinical judgment.
- **Never diagnose.** "This pattern is *sometimes associated with*…" — never "you have…".
- **Never prescribe.** Discuss what labs to ask for; never recommend meds/doses.
- **Always defer to the provider.** Clinical questions close with "this is worth discussing with your provider."
- **Ground in the book framework.** Answer from the retrieved context; cite the framework, not generic medical advice.
- **Transparent about limits.** "I can help you understand patterns in your data, but I'm not a substitute for medical evaluation."
- **Source tiering.** Retrieved chunks are labeled by `source_type`; `story` chunks are framed as *illustrative examples*, never as evidence or prediction.

The retrieved context is injected as a clearly delimited block; the conversation messages follow. If retrieval returns nothing relevant, the model answers from general framework knowledge but says so and still defers to the provider.

## 6. Error Handling
- LLM call fails (both primary + fallback) → `503` with a clean JSON message; UI shows "couldn't reach the assistant, try again."
- Retrieval/DB error → `500` clean JSON; never leak internals. (CORS headers preserved — the middleware ordering fix is in place.)
- Empty retrieval → still answer (general framework), flagged as such.
- No PHI in logs; log entrypoint + latency + counts only.

## 7. Testing
- **Retrieval** — unit test the embed→search path (Vertex mocked; the DB-backed search is gated like the RAG store tests, run in CI against pgvector).
- **Prompt assembly** — context block built correctly, chunks tagged by source_type, conversation appended in order.
- **Guardrail test** — assert the system prompt contains the non-diagnostic / defer-to-provider / never-prescribe framing (a regression guard on the founding principle).
- **LLM** — mocked; assert fallback is used when the primary raises.
- **Router** — thin: parses body, calls ChatService, shapes response; auth required.

## 8. Dependencies / Prerequisites
- **Enable Claude in Vertex Model Garden** for `ignitehealthnow-2025` + a Claude-supported region (`us-east5`). One-time, like the embeddings enablement.
- The API needs Vertex access (has it via ADC) and a Cloud SQL KB connection string (the proxy is already running; `kb_database_url` points at it).
- `anthropic[vertex]` (or the Vertex SDK Claude path) added to the API deps.

## 9. Out of Scope (v1)
- Persisted conversation history (DB) + cross-session summarization (PRD §10.5).
- Personal/journal/lab data in retrieval (the **hybrid** model) — added when those entities exist.
- Appointment-prep flagging → doctor-visit report (PRD §10.5, §9).
- Streaming responses.
- The provider/caregiver sharing of chats (authZ spec, Phase 4).

## 10. Founding-Principle Check
This feature is the clearest expression of the founding principle, so it carries the highest guardrail bar: it must **inform and prepare**, never **diagnose or prescribe**. The guardrail test (§7) is the regression guard; the source-tiering keeps composite stories from reading as evidence. Any future change that lets the agent assert a diagnosis or recommend treatment is a violation, not a feature.
