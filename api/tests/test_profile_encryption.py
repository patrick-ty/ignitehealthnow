import random

import pytest

from app.core.encryption import EnvelopeEncryptor
from app.models import ProfileUpdate
from app.services.profile import ProfileService


class FakeKMSClient:
    """Simple fake KMS client for testing envelope logic."""

    def encrypt(self, key_name: str, plaintext: bytes) -> bytes:
        return b"wrapped:" + plaintext

    def decrypt(self, key_name: str, ciphertext: bytes) -> bytes:
        if not ciphertext.startswith(b"wrapped:"):
            raise RuntimeError("invalid ciphertext")
        return ciphertext[len(b"wrapped:") :]


class FakeQuery:
    def __init__(self, table_name: str, store: dict):
        self.table_name = table_name
        self.store = store
        self._filters = {}
        self._update_payload = None
        self._single = False
        self._select_fields = None

    def select(self, fields: str):
        self._select_fields = fields
        return self

    def eq(self, column: str, value):
        self._filters[column] = value
        return self

    def single(self):
        self._single = True
        return self

    def update(self, payload: dict):
        self._update_payload = payload
        return self

    def insert(self, payload: dict):
        # Only support list-free payloads used in service
        if self.table_name == "user_profile":
            user_id = payload["user_id"]
            self.store.setdefault("user_profile", {})
            self.store["user_profile"][user_id] = {
                "user_id": user_id,
                **payload,
            }
            self._inserted = self.store["user_profile"][user_id]
        return self

    def execute(self):
        if self.table_name == "user_profile":
            table = self.store.get("user_profile", {})
            if hasattr(self, "_inserted"):
                return type("Resp", (), {"data": [self._inserted]})
            if self._update_payload is not None:
                # apply updates
                user_id = self._filters.get("user_id")
                table[user_id] = {**table[user_id], **self._update_payload}
                return type("Resp", (), {"data": [table[user_id]]})

            if "handle" in self._filters:
                handle = self._filters["handle"]
                data = [row for row in table.values() if row.get("handle") == handle]
                return type("Resp", (), {"data": data})

            if "user_id" in self._filters:
                row = table.get(self._filters["user_id"])
                if not row:
                    return type("Resp", (), {"data": None})
                return type("Resp", (), {"data": [row] if not self._single else row})

        return type("Resp", (), {"data": None})


class FakeTableClient:
    def __init__(self, table_name: str, store: dict):
        self.table_name = table_name
        self.store = store

    def select(self, fields: str):
        return FakeQuery(self.table_name, self.store).select(fields)

    def eq(self, column: str, value):
        return FakeQuery(self.table_name, self.store).eq(column, value)

    def insert(self, payload: dict):
        return FakeQuery(self.table_name, self.store).insert(payload)

    def update(self, payload: dict):
        return FakeQuery(self.table_name, self.store).update(payload)

    def single(self):
        return FakeQuery(self.table_name, self.store).single()

    def execute(self):
        return FakeQuery(self.table_name, self.store).execute()


class FakeSupabaseClient:
    def __init__(self):
        self.store = {"user_profile": {}}

    def from_(self, table_name: str):
        return FakeQuery(table_name, self.store)

    def table(self, table_name: str):
        return FakeQuery(table_name, self.store)

    def schema(self, _name: str):
        return self


def make_service(
    store=None, kms_key="projects/test/locations/global/keyRings/r/cryptoKeys/k"
):
    fake_kms = FakeKMSClient()
    supabase = FakeSupabaseClient()
    if store:
        supabase.store = store
    from app.core.config import get_settings

    get_settings.cache_clear()
    service = ProfileService(
        kms_client=fake_kms,
        kms_key=kms_key,
        supabase_client=supabase,
    )
    # override word lists for deterministic tests
    service.allow_words = ["juniper"]
    service.deny_words = {"juniper00000"}
    service.safe_words = ["juniper"]
    return service


def test_envelope_roundtrip():
    kms_client = FakeKMSClient()
    encryptor = EnvelopeEncryptor(kms_client, "projects/test/keys/key")
    values = ["Alice", "Smith", "555-1234", "94107"]
    for v in values:
        blob = encryptor.encrypt(v)
        recovered = encryptor.decrypt(blob)
        assert recovered == v


@pytest.mark.asyncio
async def test_profile_write_read_roundtrip():
    service = make_service()
    user_id = "user-1"
    # bootstrap
    await service.bootstrap_profile(user_id)

    update = ProfileUpdate(
        first_name="Alice",
        last_name="Walker",
        mobile="555-1234",
        zipcode="94107",
        birth_year=1980,
        avatar_url="/avatars/system/avatar-3.png",
    )
    updated = await service.update_profile(user_id, update)
    assert updated["first_name"] == "Alice"
    assert updated["avatar_url"] == "/avatars/system/avatar-3.png"

    profile = await service.get_profile_with_completeness(user_id)
    assert profile.first_name == "Alice"
    assert profile.is_complete is True
    # display_name should default to handle, not first name
    assert profile.display_name == profile.handle


@pytest.mark.asyncio
async def test_handle_uniqueness_retry(monkeypatch):
    store = {
        "user_profile": {
            "existing": {"user_id": "existing", "handle": "juniper00000"},
        }
    }
    service = make_service(store=store)
    user_id = "new-user"
    await service.bootstrap_profile(user_id)

    seq = iter([0, 0, 1])

    monkeypatch.setattr(random, "randint", lambda a, b: next(seq))
    monkeypatch.setattr(random, "choice", lambda lst: "juniper")

    update = ProfileUpdate(
        first_name="Alice",
        last_name="Walker",
        mobile="555-1234",
        zipcode="94107",
        birth_year=1980,
        avatar_url="/avatars/system/avatar-3.png",
    )
    profile = await service.update_profile(user_id, update)
    assert profile["handle"].startswith("juniper")
    assert profile["handle"] != "juniper00000"


def test_missing_kms_config_fails(monkeypatch):
    monkeypatch.delenv("GCP_KMS_KEY", raising=False)
    from app.core.config import get_settings

    get_settings.cache_clear()
    with pytest.raises(ValueError):
        make_service(kms_key="")


@pytest.mark.asyncio
async def test_bootstrap_missing_profile_returns_incomplete():
    service = make_service()
    user_id = "user-missing"
    # No profile exists initially
    profile = await service.get_profile(user_id)
    assert profile is None
    await service.bootstrap_profile(user_id)
    profile_resp = await service.get_profile_with_completeness(user_id)
    assert profile_resp.is_complete is False
    assert profile_resp.handle is None
    assert profile_resp.display_name is None
