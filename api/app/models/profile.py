from datetime import datetime

from pydantic import BaseModel, Field


class ProfileBase(BaseModel):
    """Base profile fields."""

    first_name: str | None = None
    last_name: str | None = None
    mobile: str | None = None
    zipcode: str | None = None
    birth_year: int | None = Field(None, ge=1900, le=2100)
    display_name: str | None = None
    avatar_url: str | None = Field(
        None,
        pattern=r"^/avatars/system/avatar-(0|1|2|3|4|5|6|7|8|9|10|11)\.png$",
    )


class ProfileCreate(ProfileBase):
    """Profile creation (not used directly - profiles bootstrapped automatically)."""

    pass


class ProfileUpdate(ProfileBase):
    """Profile update via PATCH /profile."""

    pass


class ProfileResponse(ProfileBase):
    """Profile response with computed fields."""
    """
    UI IDENTITY CONTRACT (LOCKED)

    The Profile database is the single authoritative source for all user-visible
    identity used by client applications (web and mobile).

    Authoritative fields:
    - display_name
    - avatar_url

    Explicitly forbidden for UI rendering:
    - email
    - Supabase auth user_metadata
    - JWT claims (except user_id for authentication)

    Rationale:
    - Prevent PII leakage
    - Ensure cross-platform consistency
    - Avoid coupling UI logic to auth providers

    Any UI-facing feature requiring user identity MUST read from Profile DB only.
    """

    user_id: str
    email: str | None = None
    handle: str | None = None
    is_complete: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class UserIdentity(BaseModel):
    """Minimal user identity for /me endpoint."""

    user_id: str
    email: str | None = None


class PropertyValue(BaseModel):
    """Profile property key-value pair."""

    key: str
    value_json: dict


class PropertyUpdate(BaseModel):
    """Update a profile property."""

    value_json: dict


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "ok"
    environment: str
