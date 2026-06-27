from app.core.config import get_settings


def test_chat_config_defaults(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://x.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "k")
    monkeypatch.setenv("SUPABASE_JWT_SECRET", "s")
    monkeypatch.setenv("GCP_PROJECT", "ignitehealthnow-2025")
    monkeypatch.setenv("KB_DATABASE_URL", "postgresql://u:p@127.0.0.1:5432/ignite")
    get_settings.cache_clear()
    s = get_settings()
    assert s.gcp_project == "ignitehealthnow-2025"
    assert s.kb_database_url.endswith("/ignite")
    assert s.vertex_chat_location == "us-east5"
    assert s.vertex_embed_model == "text-embedding-005"
    assert s.chat_top_k == 6
    assert s.vertex_chat_model  # non-empty default
