import json
from datetime import datetime, timezone

from app.repositories.content_repository import SupabaseContentRepository


class _FakeQuery:
    """Mimics the supabase-py query builder, asserting the payload is JSON-serializable.

    PostgREST serializes the request body to JSON; a raw datetime would raise
    ``TypeError: Object of type datetime is not JSON serializable`` there.
    """

    def __init__(self, store: dict) -> None:
        self._store = store

    def insert(self, data):
        self._store["payload"] = data
        return self

    def update(self, changes):
        self._store["payload"] = changes
        return self

    def eq(self, *_args, **_kwargs):
        return self

    def execute(self):
        json.dumps(self._store["payload"])  # raises if a value isn't JSON-serializable
        return type("Res", (), {"data": [{**self._store["payload"], "id": "p1"}]})()


class _FakeClient:
    def __init__(self) -> None:
        self._store: dict = {}

    def table(self, _name):
        return _FakeQuery(self._store)


def test_supabase_update_serializes_datetime_for_json():
    """approve_post puts a real datetime in scheduled_for; the Supabase path must serialize it."""
    repo = SupabaseContentRepository(_FakeClient())
    row = repo.update(
        "p1",
        {"status": "scheduled", "scheduled_for": datetime(2026, 7, 15, 9, 0, tzinfo=timezone.utc)},
    )
    assert isinstance(row["scheduled_for"], str)


def test_supabase_create_serializes_datetime_for_json():
    repo = SupabaseContentRepository(_FakeClient())
    row = repo.create(
        {
            "channel": "x",
            "caption": "hi",
            "scheduled_for": datetime(2026, 7, 15, 9, 0, tzinfo=timezone.utc),
        },
    )
    assert isinstance(row["scheduled_for"], str)
