from datetime import datetime, timezone
from app.models import AdminContentPost, AdminContentCreate, AdminContentApprove, AdminContentUpdate
from app.repositories.content_repository import InMemoryContentRepository
from app.services.admin_content import AdminContentService


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


def _svc():
    return AdminContentService(InMemoryContentRepository())


def test_create_and_list_returns_models():
    svc = _svc()
    post = svc.create_post(AdminContentCreate(channel="instagram", caption="hi"))
    assert post.status == "draft" and post.ai is False
    assert [p.id for p in svc.list_posts()] == [post.id]


def test_approve_draft_without_time_goes_review():
    svc = _svc()
    p = svc.create_post(AdminContentCreate(channel="x", caption="hi"))
    out = svc.approve_post(p.id, AdminContentApprove())
    assert out.status == "review"


def test_approve_with_time_schedules_and_edits_caption():
    svc = _svc()
    when = datetime(2026, 7, 1, 9, tzinfo=timezone.utc)
    p = svc.create_post(AdminContentCreate(channel="x", caption="hi"))
    out = svc.approve_post(p.id, AdminContentApprove(edited_caption="new", scheduled_for=when))
    assert out.status == "scheduled" and out.caption == "new" and out.scheduled_for == when


def test_reject_returns_to_draft():
    svc = _svc()
    p = svc.create_post(AdminContentCreate(channel="x", caption="hi", status="review"))
    out = svc.reject_post(p.id)
    assert out.status == "draft"


def test_update_changes_fields():
    svc = _svc()
    p = svc.create_post(AdminContentCreate(channel="x", caption="hi"))
    out = svc.update_post(p.id, AdminContentUpdate(caption="edited"))
    assert out.caption == "edited"
