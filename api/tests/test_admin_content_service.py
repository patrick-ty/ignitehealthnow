from datetime import datetime, timezone
from app.models import AdminContentPost, AdminContentCreate


def test_admin_content_post_roundtrips():
    now = datetime(2026, 6, 27, tzinfo=timezone.utc)
    p = AdminContentPost(
        id="p1", channel="instagram", caption="hi", hashtags=["#a"],
        status="draft", scheduled_for=None, source=None, ai=False,
        why_it_works=None, created_at=now, updated_at=now,
    )
    assert p.channel == "instagram" and p.status == "draft"


def test_admin_content_create_defaults():
    c = AdminContentCreate(channel="x", caption="hi")
    assert c.status == "draft" and c.hashtags == []


from app.repositories.content_repository import InMemoryContentRepository


def test_in_memory_repo_create_get_update_list():
    repo = InMemoryContentRepository()
    rec = repo.create({"channel": "x", "caption": "hi", "hashtags": [], "status": "draft"})
    assert rec["id"] and rec["created_at"] and rec["ai"] is False
    got = repo.get(rec["id"])
    assert got["caption"] == "hi"
    upd = repo.update(rec["id"], {"caption": "bye"})
    assert upd["caption"] == "bye"
    assert len(repo.list()) == 1
    assert repo.get("missing") is None
