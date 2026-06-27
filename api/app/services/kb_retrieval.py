import vertexai
from vertexai.language_models import TextEmbeddingInput, TextEmbeddingModel

from app.core import get_settings

EMBED_DIM = 768


class KbRetriever:
    """Embed a question (Vertex) and cosine-search rag.kb_chunks (Cloud SQL)."""

    def __init__(self, *, project, embed_location, embed_model, db_url, schema="rag"):
        self._project = project
        self._embed_location = embed_location
        self._embed_model = embed_model
        self._db_url = db_url
        self._schema = schema
        self._model = None

    def _get_model(self):
        if self._model is None:
            vertexai.init(project=self._project, location=self._embed_location)
            self._model = TextEmbeddingModel.from_pretrained(self._embed_model)
        return self._model

    def embed_query(self, text: str) -> list[float]:
        inputs = [TextEmbeddingInput(text, "RETRIEVAL_QUERY")]
        return self._get_model().get_embeddings(inputs)[0].values

    def search(self, query_embedding: list[float], top_k: int) -> list[dict]:
        import psycopg
        from pgvector.psycopg import register_vector

        with psycopg.connect(self._db_url) as conn:
            register_vector(conn)
            rows = conn.execute(
                f"""select content, source_type, source_uri,
                       1 - (embedding <=> %s::vector) as score
                    from {self._schema}.kb_chunks
                    order by embedding <=> %s::vector limit %s""",
                (query_embedding, query_embedding, top_k),
            ).fetchall()
        return [
            {"content": r[0], "source_type": r[1], "source_uri": r[2], "score": float(r[3])}
            for r in rows
        ]

    def retrieve(self, question: str, top_k: int) -> list[dict]:
        return self.search(self.embed_query(question), top_k)


def get_kb_retriever() -> KbRetriever:
    s = get_settings()
    return KbRetriever(
        project=s.gcp_project,
        embed_location=s.vertex_embed_location,
        embed_model=s.vertex_embed_model,
        db_url=s.kb_database_url,
    )
