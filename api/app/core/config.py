from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Supabase
    supabase_url: str
    supabase_service_role_key: str
    supabase_jwt_secret: str
    database_url: str = ""  # not used at runtime (profile service uses the Supabase client)
    gcp_kms_key: str = ""
    allow_hs256_fallback: bool = False

    # GCP / Vertex
    gcp_project: str = ""
    vertex_embed_location: str = "us-central1"
    vertex_embed_model: str = "text-embedding-005"

    # Chat (Claude via Vertex). The newest Claude models (Sonnet 4.6, Haiku 4.5)
    # are served ONLY on the Vertex `global` endpoint — not regional (us-east5 has
    # only older versions). Verified live: regional returns 404 for 4.6; global
    # resolves it. Keep this `global` unless pinning to an older regional model.
    vertex_chat_location: str = "global"
    vertex_chat_model: str = "claude-sonnet-4-6"          # global endpoint; no @version suffix needed
    vertex_chat_fallback_model: str = "claude-haiku-4-5"  # also global-only
    chat_top_k: int = 6

    # Cloud SQL knowledge base (rag.kb_chunks)
    kb_database_url: str = ""

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
        env_file = ".env"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
