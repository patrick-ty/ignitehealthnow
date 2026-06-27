from app.models import ChatMessage
from app.services.chat import ChatService, SYSTEM_PROMPT, build_context


def test_system_prompt_has_guardrails():
    # Assert the specific phrasing, not loose keywords, so a softened
    # paraphrase (e.g. "avoid diagnosing when possible") fails this guard.
    p = SYSTEM_PROMPT.lower()
    # non-diagnostic: forbidden form named + required alternative form present
    assert "never diagnose" in p
    assert "sometimes associated with" in p
    # never prescribe
    assert "never prescribe" in p
    # always defer to the provider
    assert "always defer to the provider" in p
    # story items must be framed as illustrative, never evidence
    assert "illustrative" in p
    assert "evidence" in p
    # must not leak internal scaffolding ("the book"/"the framework") to the patient
    assert "plain words" in p
    assert '"the book"' in p


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


class _Resp:
    def __init__(self, text):
        self.content = [type("B", (), {"text": text})()]


class _FakeClient:
    """Stands in for AnthropicVertex / Anthropic — same messages.create interface."""
    def __init__(self, fail_models=()):
        self._fail = set(fail_models)
        self.used = []

        class _Messages:
            def create(_self, *, model, max_tokens, system, messages):
                self.used.append(model)
                if model in self._fail:
                    raise RuntimeError("model unavailable")
                return _Resp(f"reply from {model}")

        self.messages = _Messages()


def test_make_complete_fn_uses_primary():
    from app.services.chat import _make_complete_fn

    c = _FakeClient()
    fn = _make_complete_fn(c, ("primary", "fallback"))
    assert fn("sys", [{"role": "user", "content": "hi"}]) == "reply from primary"
    assert c.used == ["primary"]  # fallback never tried when primary works


def test_make_complete_fn_falls_back_then_raises():
    from app.services.chat import _make_complete_fn

    c = _FakeClient(fail_models={"primary"})
    fn = _make_complete_fn(c, ("primary", "fallback"))
    assert fn("sys", [{"role": "user", "content": "hi"}]) == "reply from fallback"
    assert c.used == ["primary", "fallback"]

    import pytest
    c2 = _FakeClient(fail_models={"primary", "fallback"})
    with pytest.raises(RuntimeError):
        _make_complete_fn(c2, ("primary", "fallback"))("sys", [{"role": "user", "content": "hi"}])


def test_build_complete_fn_selects_provider(monkeypatch):
    import app.services.chat as chat

    monkeypatch.setattr(chat, "_vertex_complete_fn", lambda: "VERTEX_FN")
    monkeypatch.setattr(chat, "_anthropic_complete_fn", lambda: "ANTHROPIC_FN")

    monkeypatch.setattr(chat, "get_settings",
                        lambda: type("S", (), {"chat_provider": "anthropic"})())
    assert chat._build_complete_fn() == "ANTHROPIC_FN"

    monkeypatch.setattr(chat, "get_settings",
                        lambda: type("S", (), {"chat_provider": "vertex"})())
    assert chat._build_complete_fn() == "VERTEX_FN"
