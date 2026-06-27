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
