import uuid
from datetime import datetime, timezone
from typing import Protocol

from app.core import get_settings

TABLE = "admin_content_posts"


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ContentRepository(Protocol):
    def list(self) -> list[dict]: ...
    def get(self, post_id: str) -> dict | None: ...
    def create(self, data: dict) -> dict: ...
    def update(self, post_id: str, changes: dict) -> dict: ...


class InMemoryContentRepository:
    """In-memory fake — used by tests and as a safe default if Supabase is absent."""

    def __init__(self) -> None:
        self._rows: dict[str, dict] = {}

    def list(self) -> list[dict]:
        return sorted(self._rows.values(), key=lambda r: r["created_at"], reverse=True)

    def get(self, post_id: str) -> dict | None:
        return self._rows.get(post_id)

    def create(self, data: dict) -> dict:
        now = _utcnow()
        row = {
            "id": str(uuid.uuid4()),
            "channel": data["channel"],
            "caption": data["caption"],
            "hashtags": list(data.get("hashtags") or []),
            "status": data.get("status", "draft"),
            "scheduled_for": data.get("scheduled_for"),
            "source": data.get("source"),
            "ai": bool(data.get("ai", False)),
            "why_it_works": data.get("why_it_works"),
            "created_at": now,
            "updated_at": now,
        }
        self._rows[row["id"]] = row
        return row

    def update(self, post_id: str, changes: dict) -> dict:
        row = self._rows[post_id]
        row.update({k: v for k, v in changes.items() if v is not None})
        row["updated_at"] = _utcnow()
        return row


class SupabaseContentRepository:
    """Supabase-backed repository over the admin_content_posts table."""

    def __init__(self, client) -> None:
        self.client = client

    def list(self) -> list[dict]:
        res = self.client.table(TABLE).select("*").order("created_at", desc=True).execute()
        return res.data or []

    def get(self, post_id: str) -> dict | None:
        res = self.client.table(TABLE).select("*").eq("id", post_id).limit(1).execute()
        return (res.data or [None])[0]

    def create(self, data: dict) -> dict:
        res = self.client.table(TABLE).insert(data).execute()
        return res.data[0]

    def update(self, post_id: str, changes: dict) -> dict:
        res = self.client.table(TABLE).update(changes).eq("id", post_id).execute()
        return res.data[0]


def get_content_repository() -> ContentRepository:
    from supabase import create_client

    settings = get_settings()
    client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return SupabaseContentRepository(client)
