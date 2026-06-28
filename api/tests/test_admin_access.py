from unittest.mock import patch

from app.core.config import Settings
from app.services.admin_access import is_admin_email


def test_admin_email_set_parses_and_normalizes():
    s = Settings(
        supabase_url="https://x.supabase.co",
        supabase_service_role_key="k",
        supabase_jwt_secret="j",
        admin_emails="  Admin@Ex.com , owner@ex.com ,,",
    )
    assert s.admin_email_set() == {"admin@ex.com", "owner@ex.com"}


def test_admin_email_set_empty_by_default():
    s = Settings(
        supabase_url="https://x.supabase.co",
        supabase_service_role_key="k",
        supabase_jwt_secret="j",
    )
    assert s.admin_email_set() == set()


def test_is_admin_email_uses_allowlist():
    fake = type("S", (), {"admin_email_set": lambda self: {"a@ex.com"}})()
    with patch("app.services.admin_access.get_settings", return_value=fake):
        assert is_admin_email("A@ex.com") is True
        assert is_admin_email("b@ex.com") is False
        assert is_admin_email(None) is False
