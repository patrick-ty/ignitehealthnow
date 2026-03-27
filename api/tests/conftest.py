import sys
import types

import pytest


class _FakeKMSClient:
    class KeyManagementServiceClient:
        def encrypt(self, name=None, plaintext=None):
            return type("Resp", (), {"ciphertext": b"wrapped:" + (plaintext or b"")})

        def decrypt(self, name=None, ciphertext=None):
            if ciphertext and ciphertext.startswith(b"wrapped:"):
                return type("Resp", (), {"plaintext": ciphertext[len(b"wrapped:") :]})
            return type("Resp", (), {"plaintext": b""})


# Provide a stub google.cloud.kms module so tests can import without network deps.
google_module = types.ModuleType("google")
cloud_module = types.ModuleType("google.cloud")
kms_module = types.ModuleType("google.cloud.kms")
kms_module.KeyManagementServiceClient = _FakeKMSClient.KeyManagementServiceClient

google_module.__path__ = []  # mark as package
cloud_module.__path__ = []

cloud_module.kms = kms_module
google_module.cloud = cloud_module

sys.modules.setdefault("google", google_module)
sys.modules.setdefault("google.cloud", cloud_module)
sys.modules.setdefault("google.cloud.kms", kms_module)


@pytest.fixture(autouse=True)
def _test_env(monkeypatch):
    """
    Provide dummy env vars so Pydantic Settings() doesn't explode in CI.
    These are NOT real secrets and are not used to talk to real services in tests.
    """
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key")
    monkeypatch.setenv("SUPABASE_JWT_SECRET", "test-jwt-secret")
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/testdb")

    # If Settings/get_settings is cached, clear it so new env vars are read each test.
    try:
        from app.core.config import get_settings

        get_settings.cache_clear()
    except Exception:
        pass
