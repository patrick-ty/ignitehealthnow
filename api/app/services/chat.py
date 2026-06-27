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


def _make_complete_fn(client, models):
    """A complete(system, messages) -> str over an Anthropic-style client, primary→fallback.

    Both AnthropicVertex and the direct Anthropic client expose the identical
    `client.messages.create(...)` interface, so this loop is shared by both providers.
    """
    def complete(system: str, messages: list[dict]) -> str:
        for model in models:
            try:
                resp = client.messages.create(
                    model=model, max_tokens=1024, system=system, messages=messages,
                )
                return resp.content[0].text
            except Exception as exc:  # pragma: no cover - network
                logger.warning("Claude model %s failed: %s", model, type(exc).__name__)
        raise RuntimeError("All chat models failed")

    return complete


def _vertex_complete_fn():
    """Claude via Vertex (single GCP BAA — production posture)."""
    from anthropic import AnthropicVertex

    s = get_settings()
    client = AnthropicVertex(project_id=s.gcp_project, region=s.vertex_chat_location)
    return _make_complete_fn(client, (s.vertex_chat_model, s.vertex_chat_fallback_model))


def _anthropic_complete_fn():
    """Claude via Anthropic's direct API (dev — sidesteps Vertex billing-maturity quota gate).

    For real patient PHI this requires Anthropic's BAA; fine for non-PHI dev testing.
    """
    from anthropic import Anthropic

    s = get_settings()
    client = Anthropic(api_key=s.anthropic_api_key)
    return _make_complete_fn(client, (s.anthropic_chat_model, s.anthropic_chat_fallback_model))


def _build_complete_fn():
    """Select the LLM provider from settings.chat_provider ("vertex" | "anthropic")."""
    s = get_settings()
    if s.chat_provider == "anthropic":
        return _anthropic_complete_fn()
    return _vertex_complete_fn()


_service = None


def get_chat_service() -> "ChatService":
    global _service
    if _service is None:
        from app.services.kb_retrieval import get_kb_retriever

        s = get_settings()
        _service = ChatService(
            retriever=get_kb_retriever(),
            complete_fn=_build_complete_fn(),
            top_k=s.chat_top_k,
        )
    return _service
