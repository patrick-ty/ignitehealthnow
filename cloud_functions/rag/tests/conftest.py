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


# --- Fake vertexai so embeddings can be imported/tested without GCP ---
_vertexai = types.ModuleType("vertexai")
_lm = types.ModuleType("vertexai.language_models")


class _FakeEmbedding:
    def __init__(self, values):
        self.values = values


class _FakeTextEmbeddingInput:
    def __init__(self, text, task_type):
        self.text = text
        self.task_type = task_type


class _FakeModel:
    @classmethod
    def from_pretrained(cls, name):
        return cls()

    def get_embeddings(self, inputs):
        # Deterministic dummy vectors: length-768, first value = token count.
        out = []
        for inp in inputs:
            v = [float(len(inp.text.split()))] + [0.0] * 767
            out.append(_FakeEmbedding(v))
        return out


def _fake_init(*args, **kwargs):
    return None


_vertexai.init = _fake_init
_lm.TextEmbeddingModel = _FakeModel
_lm.TextEmbeddingInput = _FakeTextEmbeddingInput
sys.modules.setdefault("vertexai", _vertexai)
sys.modules.setdefault("vertexai.language_models", _lm)
