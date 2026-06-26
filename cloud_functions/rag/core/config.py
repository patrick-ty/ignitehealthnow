import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Config:
    source_bucket: str
    embed_model: str
    schema: str
    gcp_project: str
    vertex_location: str
    database_url: str
    chunk_min_tokens: int
    chunk_max_tokens: int
    chunk_overlap_ratio: float
    top_k_kb: int
    top_k_user: int


def _load_database_url() -> str:
    secret_name = os.environ.get("RAG_DB_SECRET")
    if secret_name:
        from google.cloud import secretmanager

        client = secretmanager.SecretManagerServiceClient()
        resp = client.access_secret_version(name=secret_name)
        return resp.payload.data.decode("utf-8")
    return os.environ["DATABASE_URL"]


def load_config() -> Config:
    return Config(
        source_bucket=os.environ["RAG_SOURCE_BUCKET"],
        embed_model=os.environ.get("RAG_EMBED_MODEL", "text-embedding-005"),
        schema=os.environ.get("RAG_SCHEMA", "rag"),
        gcp_project=os.environ["GCP_PROJECT"],
        vertex_location=os.environ.get("VERTEX_LOCATION", "us-central1"),
        database_url=_load_database_url(),
        chunk_min_tokens=int(os.environ.get("RAG_CHUNK_MIN_TOKENS", "500")),
        chunk_max_tokens=int(os.environ.get("RAG_CHUNK_MAX_TOKENS", "800")),
        chunk_overlap_ratio=float(os.environ.get("RAG_CHUNK_OVERLAP_RATIO", "0.15")),
        top_k_kb=int(os.environ.get("RAG_TOP_K_KB", "6")),
        top_k_user=int(os.environ.get("RAG_TOP_K_USER", "4")),
    )
