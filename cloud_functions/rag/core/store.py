import hashlib
import json
import psycopg
from pgvector.psycopg import register_vector


def content_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


class Store:
    def __init__(self, database_url: str, schema: str = "rag"):
        self._url = database_url
        self._schema = schema

    def _connect(self):
        conn = psycopg.connect(self._url, autocommit=True)
        register_vector(conn)
        return conn

    def upsert_kb_chunk(self, *, source_uri, source_type, chunk_index, content,
                        metadata, content_hash, embedding) -> bool:
        with self._connect() as conn:
            existing = conn.execute(
                f"select content_hash from {self._schema}.kb_chunks "
                "where source_uri=%s and chunk_index=%s",
                (source_uri, chunk_index),
            ).fetchone()
            if existing and existing[0] == content_hash:
                return False
            conn.execute(
                f"""insert into {self._schema}.kb_chunks
                    (source_uri, source_type, chunk_index, content, metadata,
                     content_hash, embedding)
                    values (%s,%s,%s,%s,%s,%s,%s)
                    on conflict (source_uri, chunk_index) do update set
                      source_type=excluded.source_type, content=excluded.content,
                      metadata=excluded.metadata, content_hash=excluded.content_hash,
                      embedding=excluded.embedding""",
                (source_uri, source_type, chunk_index, content, json.dumps(metadata),
                 content_hash, embedding),
            )
            return True

    def upsert_user_note(self, *, user_id, source_kind, source_id, content,
                         occurred_at, content_hash, embedding) -> bool:
        with self._connect() as conn:
            existing = conn.execute(
                f"select content_hash from {self._schema}.user_note_embeddings "
                "where source_kind=%s and source_id=%s",
                (source_kind, source_id),
            ).fetchone()
            if existing and existing[0] == content_hash:
                self._audit(conn, user_id, "ingest_user_note", "upsert", [source_id])
                return False
            conn.execute(
                f"""insert into {self._schema}.user_note_embeddings
                    (user_id, source_kind, source_id, content, occurred_at,
                     content_hash, embedding)
                    values (%s,%s,%s,%s,%s,%s,%s)
                    on conflict (source_kind, source_id) do update set
                      user_id=excluded.user_id, content=excluded.content,
                      occurred_at=excluded.occurred_at,
                      content_hash=excluded.content_hash, embedding=excluded.embedding""",
                (user_id, source_kind, source_id, content, occurred_at, content_hash, embedding),
            )
            self._audit(conn, user_id, "ingest_user_note", "upsert", [source_id])
            return True

    def delete_user_note(self, *, user_id, source_kind, source_id) -> int:
        with self._connect() as conn:
            cur = conn.execute(
                f"delete from {self._schema}.user_note_embeddings "
                "where user_id=%s and source_kind=%s and source_id=%s",
                (user_id, source_kind, source_id),
            )
            self._audit(conn, user_id, "ingest_user_note", "delete", [source_id])
            return cur.rowcount

    def search_kb(self, *, query_embedding, top_k) -> list[dict]:
        with self._connect() as conn:
            rows = conn.execute(
                f"""select content, source_type, source_uri, metadata,
                       1 - (embedding <=> %s) as score
                    from {self._schema}.kb_chunks
                    order by embedding <=> %s limit %s""",
                (query_embedding, query_embedding, top_k),
            ).fetchall()
        return [
            {"content": r[0], "source_type": r[1], "source_uri": r[2],
             "metadata": r[3], "score": float(r[4])}
            for r in rows
        ]

    def search_user_notes(self, *, user_id, query_embedding, top_k) -> list[dict]:
        with self._connect() as conn:
            rows = conn.execute(
                f"""select id, content, source_kind, occurred_at,
                       1 - (embedding <=> %s) as score
                    from {self._schema}.user_note_embeddings
                    where user_id = %s
                    order by embedding <=> %s limit %s""",
                (query_embedding, user_id, query_embedding, top_k),
            ).fetchall()
            source_ids = [r[0] for r in rows]
            self._audit(conn, user_id, "retrieve", "search", source_ids)
        return [
            {"content": r[1], "source_kind": r[2], "occurred_at": r[3], "score": float(r[4])}
            for r in rows
        ]

    def _audit(self, conn, user_id, entrypoint, op, source_ids):
        conn.execute(
            f"""insert into {self._schema}.user_note_access_audit
                (user_id, entrypoint, op, source_ids) values (%s,%s,%s,%s)""",
            (user_id, entrypoint, op, source_ids),
        )
