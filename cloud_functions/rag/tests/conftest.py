import sys
import types
import pytest


@pytest.fixture(autouse=True)
def _env(monkeypatch):
    monkeypatch.setenv("RAG_SOURCE_BUCKET", "ignitehealth-rag-source-prod")
    monkeypatch.setenv("RAG_EMBED_MODEL", "text-embedding-005")
    monkeypatch.setenv("RAG_SCHEMA", "rag")
    monkeypatch.setenv("GCP_PROJECT", "test-project")
    monkeypatch.setenv("VERTEX_LOCATION", "us-central1")
    monkeypatch.setenv("DATABASE_URL", "postgresql://u:p@localhost:5432/testdb")
    monkeypatch.delenv("RAG_DB_SECRET", raising=False)
    monkeypatch.setenv("RAG_CHUNK_MIN_TOKENS", "500")
    monkeypatch.setenv("RAG_CHUNK_MAX_TOKENS", "800")
    monkeypatch.setenv("RAG_CHUNK_OVERLAP_RATIO", "0.15")
    monkeypatch.setenv("RAG_TOP_K_KB", "6")
    monkeypatch.setenv("RAG_TOP_K_USER", "4")
