from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Supabase
    supabase_url: str
    supabase_service_role_key: str
    supabase_jwt_secret: str
    database_url: str
    gcp_kms_key: str = ""
    allow_hs256_fallback: bool = False

    # Environment
    environment: str = "dev"

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    log_level: str = "INFO"

    # CORS (allow common localhost dev origins)
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:4000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:4000",
        "http://localhost:8081",
    ]

    class Config:
        env_file = ".env.local"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
