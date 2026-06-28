from fastapi.testclient import TestClient

from app.main import app
from app.middleware import get_current_claims
from app.services import get_admin_content_service
from app.services.admin_content import AdminContentService
from app.repositories.content_repository import InMemoryContentRepository


def _override(admin_email="admin@ex.com"):
    repo = InMemoryContentRepository()
    svc = AdminContentService(repo)
    app.dependency_overrides[get_current_claims] = lambda: {"sub": "u1", "email": admin_email}
    app.dependency_overrides[get_admin_content_service] = lambda: svc
    return svc


def teardown_function():
    app.dependency_overrides.clear()


def test_me_true_for_allowlisted(monkeypatch):
    monkeypatch.setattr("app.services.admin_access.get_settings",
                        lambda: type("S", (), {"admin_email_set": lambda self: {"admin@ex.com"}})())
    _override("admin@ex.com")
    body = TestClient(app).get("/admin/me").json()
    assert body == {"admin": True, "email": "admin@ex.com"}


def test_me_false_for_non_admin(monkeypatch):
    monkeypatch.setattr("app.services.admin_access.get_settings",
                        lambda: type("S", (), {"admin_email_set": lambda self: {"admin@ex.com"}})())
    _override("nobody@ex.com")
    body = TestClient(app).get("/admin/me").json()
    assert body == {"admin": False, "email": "nobody@ex.com"}


def test_content_crud_flow(monkeypatch):
    monkeypatch.setattr("app.services.admin_access.get_settings",
                        lambda: type("S", (), {"admin_email_set": lambda self: {"admin@ex.com"}})())
    _override("admin@ex.com")
    c = TestClient(app)
    created = c.post("/admin/content/posts", json={"channel": "x", "caption": "hi"}).json()
    assert created["status"] == "draft"
    pid = created["id"]
    assert c.get("/admin/content/posts").json()["posts"][0]["id"] == pid
    edited = c.patch(f"/admin/content/posts/{pid}", json={"caption": "edited"}).json()
    assert edited["caption"] == "edited"
    approved = c.post(f"/admin/content/posts/{pid}/approve", json={}).json()
    assert approved["status"] == "review"
    rejected = c.post(f"/admin/content/posts/{pid}/reject").json()
    assert rejected["status"] == "draft"


def test_content_forbidden_for_non_admin(monkeypatch):
    monkeypatch.setattr("app.services.admin_access.get_settings",
                        lambda: type("S", (), {"admin_email_set": lambda self: {"admin@ex.com"}})())
    _override("nobody@ex.com")
    assert TestClient(app).get("/admin/content/posts").status_code == 403
