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
