from types import SimpleNamespace

import pytest

from app.core import user_id_var
from app.middleware import auth as auth_middleware


@pytest.mark.asyncio
async def test_get_current_user_id_sets_context_and_returns_user_id(monkeypatch):
    # Arrange: stub service returned by get_auth_service()
    class FakeAuthService:
        def get_user_id(self, token: str) -> str:
            assert token == "token-abc"
            return "user-123"

    monkeypatch.setattr(auth_middleware, "get_auth_service", lambda: FakeAuthService())

    creds = SimpleNamespace(credentials="token-abc")

    # Act
    user_id = await auth_middleware.get_current_user_id(creds)

    # Assert
    assert user_id == "user-123"
    assert user_id_var.get() == "user-123"
