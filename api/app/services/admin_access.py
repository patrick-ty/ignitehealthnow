from app.core import get_settings


def is_admin_email(email: str | None) -> bool:
    if not email:
        return False
    return email.strip().lower() in get_settings().admin_email_set()
