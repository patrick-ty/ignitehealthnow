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
