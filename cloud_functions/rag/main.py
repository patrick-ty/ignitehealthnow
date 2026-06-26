import json

import functions_framework

from core.chunking import chunk_book, chunk_lab_reference
from core.config import load_config
from core.embeddings import Embedder
from core.store import Store, content_hash


class _GCSReader:
    def list_texts(self, bucket: str, prefix: str):
        from google.cloud import storage

        client = storage.Client()
        out = []
        for blob in client.list_blobs(bucket, prefix=prefix):
            if blob.name.endswith("/"):
                continue
            out.append((blob.name, blob.download_as_text()))
        return out


def _chunks_for(name: str, text: str, cfg):
    if name.startswith("lab/") or name.startswith("labs/"):
        return "lab_reference", chunk_lab_reference(text)
    return "book", chunk_book(
        text, max_tokens=cfg.chunk_max_tokens, overlap_ratio=cfg.chunk_overlap_ratio
    )


def run_ingest_kb(prefix, *, gcs, embedder, store, cfg) -> dict:
    files = gcs.list_texts(cfg.source_bucket, prefix)
    embedded = skipped = 0
    for name, text in files:
        source_type, chunks = _chunks_for(name, text, cfg)
        if not chunks:
            continue
        vectors = embedder.embed_documents([c.content for c in chunks])
        source_uri = f"gs://{cfg.source_bucket}/{name}"
        for chunk, vec in zip(chunks, vectors):
            wrote = store.upsert_kb_chunk(
                source_uri=source_uri, source_type=source_type,
                chunk_index=chunk.chunk_index, content=chunk.content,
                metadata=chunk.metadata, content_hash=content_hash(chunk.content),
                embedding=vec,
            )
            if wrote:
                embedded += 1
            else:
                skipped += 1
    return {"files": len(files), "chunks_embedded": embedded, "chunks_skipped": skipped}


@functions_framework.http
def ingest_kb(request):
    body = request.get_json(silent=True) or {}
    prefix = body.get("prefix", "")
    cfg = load_config()
    embedder = Embedder(cfg.gcp_project, cfg.vertex_location, cfg.embed_model)
    store = Store(cfg.database_url, cfg.schema)
    result = run_ingest_kb(prefix, gcs=_GCSReader(), embedder=embedder, store=store, cfg=cfg)
    return (json.dumps(result), 200, {"Content-Type": "application/json"})
