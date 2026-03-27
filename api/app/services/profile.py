# api/app/services/profile.py

import base64
import logging
import random
import uuid
from pathlib import Path
from typing import TYPE_CHECKING, Optional

from supabase import Client, create_client

from app.core import get_settings
from app.core.encryption import EnvelopeEncryptor
from app.models import ProfileResponse, ProfileUpdate

if TYPE_CHECKING:
    from app.core.kms import KMSClient

logger = logging.getLogger(__name__)

PII_SCHEMA = "pii"
USER_PROFILE_TABLE = "user_profile"
USER_PROFILE_PROPERTIES_TABLE = "user_profile_properties"


class ProfileService:
    """Service for profile database operations."""

    def __init__(
        self,
        kms_client: Optional["KMSClient"] = None,
        kms_key: str | None = None,
        supabase_client: Client | None = None,
    ):
        settings = get_settings()

        self.client: Client = supabase_client or create_client(
            settings.supabase_url,
            settings.supabase_service_role_key,
        )

        self.kms_key = settings.gcp_kms_key if kms_key is None else kms_key
        if not self.kms_key:
            raise ValueError("GCP_KMS_KEY is required for PII encryption")

        if kms_client is None:
            # Local import to avoid import-time deps / allow tests to stub
            from app.core.kms import get_kms_client

            kms_client = get_kms_client()

        self.encryptor = EnvelopeEncryptor(kms_client, self.kms_key)

        # Load handle resources from api/app/resources/*
        base_path = Path(__file__).resolve().parents[1] / "resources"
        self.allow_words = self._load_wordlist(base_path / "handle_allowlist.txt")
        deny_words = self._load_wordlist(base_path / "handle_denylist.txt")
        reserved_words = self._load_wordlist(base_path / "handle_reserved.txt")

        self.deny_words = set(deny_words + reserved_words)
        self.safe_words = [w for w in self.allow_words if w not in self.deny_words]

    @staticmethod
    def _load_wordlist(path: Path) -> list[str]:
        if not path.exists():
            return []
        with path.open("r", encoding="utf-8") as f:
            return [line.strip() for line in f if line.strip()]

    def _random_word(self) -> str:
        if not self.safe_words:
            raise RuntimeError("No safe handle words available")
        return random.choice(self.safe_words)

    async def generate_unique_handle(self) -> str:
        """
        Generate unique handle as <word><5digits>.
        Retries on reserved/deny/duplicate.
        """
        for _ in range(50):
            word = self._random_word()
            digits = random.randint(0, 99999)
            handle = f"{word}{digits:05d}"
            if handle in self.deny_words:
                continue

            response = (
                self.client.schema(PII_SCHEMA)
                .from_(USER_PROFILE_TABLE)
                .select("handle")
                .eq("handle", handle)
                .execute()
            )

            # If no rows, handle is available
            if not response.data:
                return handle

        raise ValueError("Failed to generate unique handle after retries")

    @staticmethod
    def _encode_bytea(blob: bytes) -> str:
        return "\\x" + blob.hex()

    @staticmethod
    def _coerce_bytea(value) -> bytes:
        if isinstance(value, bytes | bytearray):
            return bytes(value)
        if isinstance(value, str):
            if value.startswith("\\x"):
                return bytes.fromhex(value[2:])
            try:
                return base64.b64decode(value, validate=True)
            except Exception:
                return base64.b64decode(value)
        raise TypeError("Unsupported bytea value type")

    def _encrypt_field(self, value: str | None) -> str | None:
        if value is None:
            return None
        blob = self.encryptor.encrypt(value)
        return self._encode_bytea(blob)

    def _decrypt_field(self, value) -> str | None:
        if value is None:
            return None
        try:
            blob = self._coerce_bytea(value)
            return self.encryptor.decrypt(blob)
        except Exception as exc:
            # Keep error generic; never leak crypto details
            raise RuntimeError("Unable to decrypt profile field") from exc

    def _deserialize_profile(self, row: dict) -> dict:
        """Convert DB row with encrypted columns into plaintext dict."""
        # UI IDENTITY CONTRACT:
        # Only Profile DB fields (display_name, avatar_url) may be exposed
        # for UI identity. Do not fall back to email or auth metadata.
        return {
            "user_id": row.get("user_id"),
            "first_name": self._decrypt_field(row.get("first_name_enc")),
            "last_name": self._decrypt_field(row.get("last_name_enc")),
            "mobile": self._decrypt_field(row.get("mobile_enc")),
            "zipcode": self._decrypt_field(row.get("zipcode_enc")),
            "birth_year": row.get("birth_year"),
            "display_name": row.get("display_name"),
            "avatar_url": row.get("avatar_url"),
            "handle": row.get("handle"),
            "email": row.get("email"),
            "created_at": row.get("created_at"),
            "updated_at": row.get("updated_at"),
        }

    def _prepare_encrypted_update(self, update_dict: dict) -> dict:
        """Encrypt PII fields and map to *_enc columns."""
        payload: dict = {}

        for field, column in [
            ("first_name", "first_name_enc"),
            ("last_name", "last_name_enc"),
            ("mobile", "mobile_enc"),
            ("zipcode", "zipcode_enc"),
        ]:
            if field in update_dict:
                payload[column] = self._encrypt_field(update_dict[field])

        # Non-PII fields remain plaintext
        for field in ["birth_year", "display_name", "handle", "avatar_url"]:
            if field in update_dict:
                payload[field] = update_dict[field]

        return payload

    async def get_profile(self, user_id: str) -> dict | None:
        """Get user profile by user_id."""
        response = (
            self.client.schema(PII_SCHEMA)
            .from_(USER_PROFILE_TABLE)
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )

        if not response.data:
            return None
        return self._deserialize_profile(response.data[0])

    async def bootstrap_profile(self, user_id: str, email: str | None = None) -> dict:
        """
        Ensure profile exists for user_id (idempotent).
        Creates profile if it doesn't exist.
        Note: email parameter ignored - Supabase Auth is source of truth.
        """
        existing = await self.get_profile(user_id)
        if existing:
            return existing

        profile_data = {"user_id": user_id}

        response = (
            self.client.schema(PII_SCHEMA)
            .from_(USER_PROFILE_TABLE)
            .insert(profile_data)
            .execute()
        )

        logger.info("Bootstrapped profile for user: %s", user_id)
        if response.data:
            return self._deserialize_profile(response.data[0])
        return {"user_id": user_id}

    def _is_profile_complete(self, profile: dict) -> bool:
        """Check if profile has all required fields."""
        required_fields = ["first_name", "last_name", "mobile", "zipcode", "birth_year"]
        return all(profile.get(field) for field in required_fields)

    async def update_profile(self, user_id: str, update_data: ProfileUpdate) -> dict:
        """
        Update user profile.
        Auto-generates handle and display_name on completion.
        """
        profile = await self.get_profile(user_id)
        if not profile:
            raise ValueError("Profile not found")

        update_dict = update_data.model_dump(exclude_unset=True, exclude_none=True)

        merged = {**profile, **update_dict}
        if self._is_profile_complete(merged):
            # handle: generate if missing
            if not profile.get("handle") and not update_dict.get("handle"):
                update_dict["handle"] = await self.generate_unique_handle()

            # display_name: default to handle (never decrypted names)
            if not update_dict.get("display_name"):
                update_dict["display_name"] = update_dict.get("handle") or profile.get(
                    "handle"
                )

        encrypted_payload = self._prepare_encrypted_update(update_dict)

        response = (
            self.client.schema(PII_SCHEMA)
            .from_(USER_PROFILE_TABLE)
            .update(encrypted_payload)
            .eq("user_id", user_id)
            .execute()
        )

        logger.info("Updated profile for user: %s", user_id)
        updated_profile = self._deserialize_profile(response.data[0])

        display_name = updated_profile.get("display_name")
        if display_name and display_name != profile.get("display_name"):
            self._sync_auth_metadata(user_id, display_name)

        return updated_profile

    async def get_profile_with_completeness(self, user_id: str) -> ProfileResponse:
        """Get profile with is_complete computed field."""
        profile = await self.get_profile(user_id)
        if not profile:
            raise ValueError("Profile not found")

        return ProfileResponse(
            **profile, is_complete=self._is_profile_complete(profile)
        )

    async def set_property(self, user_id: str, key: str, value_json: dict):
        """Set a profile property (upsert)."""
        allowed_prefixes = ["prefs.", "onboarding.", "notifications.", "community."]
        if not any(key.startswith(prefix) for prefix in allowed_prefixes):
            raise ValueError(f"Property key must start with one of: {allowed_prefixes}")

        data = {"user_id": user_id, "key": key, "value_json": value_json}

        response = (
            self.client.schema(PII_SCHEMA)
            .from_(USER_PROFILE_PROPERTIES_TABLE)
            .upsert(data, on_conflict="user_id,key")
            .execute()
        )

        return response.data[0]

    async def delete_property(self, user_id: str, key: str):
        """Delete a profile property."""
        response = (
            self.client.schema(PII_SCHEMA)
            .from_(USER_PROFILE_PROPERTIES_TABLE)
            .delete()
            .eq("user_id", user_id)
            .eq("key", key)
            .execute()
        )
        return response.data

    @staticmethod
    def _deterministic_avatar_key(user_id: str) -> str:
        try:
            value = uuid.UUID(user_id).int % 12
        except ValueError:
            value = abs(hash(user_id)) % 12
        return f"avatar-{value + 1:02d}"

    def _sync_auth_metadata(self, user_id: str, display_name: str) -> None:
        try:
            existing = self.client.auth.admin.get_user_by_id(user_id)
            current_meta = (existing.user.user_metadata or {}) if existing else {}
            current_display_name = current_meta.get("display_name")
            current_avatar_key = current_meta.get("avatar_key")

            avatar_key = current_avatar_key or self._deterministic_avatar_key(user_id)
            if (
                current_display_name == display_name
                and current_avatar_key == avatar_key
            ):
                return

            self.client.auth.admin.update_user_by_id(
                user_id,
                {
                    "user_metadata": {
                        "display_name": display_name,
                        "avatar_key": avatar_key,
                    }
                },
            )
        except Exception:
            logger.warning("Failed to update auth metadata for user: %s", user_id)


_service_instance: ProfileService | None = None


def get_profile_service() -> ProfileService:
    """Lazy factory for ProfileService to avoid import-time side effects."""
    global _service_instance
    if _service_instance is None:
        _service_instance = ProfileService()
    return _service_instance
