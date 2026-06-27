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
