from app.core.config import Settings


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
