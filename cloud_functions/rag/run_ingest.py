"""Operational CLI runner for RAG ingestion (book KB).

Curation policy for the ignitehealth-rag-source-prod bucket (flat layout):
  - ingest .md only (skip binary diagrams: .pdf/.png/.svg)
  - exclude front matter + table of contents (boilerplate/navigation)
  - source_type tagging:
      Appendix_C_*  -> 'story'      (composite/illustrative narratives)
      References*    -> 'reference'  (citations)
      everything else .md (chapters, Appendix A/B) -> 'book'

Usage:
  python run_ingest.py --dry-run [--limit N] [--embed-sample K]   # chunk + validate Vertex, no DB
  python run_ingest.py                                            # real ingest (needs DATABASE_URL)

Env: GCP_PROJECT, VERTEX_LOCATION, RAG_SOURCE_BUCKET, RAG_EMBED_MODEL,
     RAG_CHUNK_MAX_TOKENS, RAG_CHUNK_OVERLAP_RATIO, DATABASE_URL (real run only).
"""

import argparse
import os
import time

from core.chunking import chunk_book
from core.embeddings import Embedder
from core.store import Store, content_hash

EXCLUDE_EXACT = {"00_TABLE_OF_CONTENTS.md"}
EXCLUDE_PREFIX = ("Front_Matter_",)
TEXT_EXT = (".md",)


def classify(object_name: str) -> str | None:
    """Return source_type for an object, or None to skip it."""
    base = object_name.rsplit("/", 1)[-1]
    if not base.endswith(TEXT_EXT):
        return None
    if base in EXCLUDE_EXACT or base.startswith(EXCLUDE_PREFIX):
        return None
    if base.startswith("Appendix_C"):
        return "story"
    if base.startswith("References"):
        return "reference"
    return "book"


def list_curated(bucket: str):
    from google.cloud import storage

    client = storage.Client()
    out = []
    for blob in client.list_blobs(bucket):
        stype = classify(blob.name)
        if stype is not None:
            out.append((blob.name, stype, blob))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--limit", type=int, default=0, help="cap files processed")
    ap.add_argument("--embed-sample", type=int, default=3,
                    help="dry-run: embed this many chunks to validate Vertex")
    args = ap.parse_args()

    bucket = os.environ["RAG_SOURCE_BUCKET"]
    project = os.environ["GCP_PROJECT"]
    location = os.environ.get("VERTEX_LOCATION", "us-central1")
    model = os.environ.get("RAG_EMBED_MODEL", "text-embedding-005")
    max_tok = int(os.environ.get("RAG_CHUNK_MAX_TOKENS", "800"))
    overlap = float(os.environ.get("RAG_CHUNK_OVERLAP_RATIO", "0.15"))

    files = list_curated(bucket)
    files.sort(key=lambda f: f[0])
    if args.limit:
        files = files[: args.limit]

    print(f"Curated files: {len(files)}  (bucket gs://{bucket})\n")
    by_type: dict[str, int] = {}
    total = 0
    all_chunks = []
    for name, stype, blob in files:
        text = blob.download_as_text()
        chunks = chunk_book(text, max_tokens=max_tok, overlap_ratio=overlap)
        total += len(chunks)
        by_type[stype] = by_type.get(stype, 0) + len(chunks)
        print(f"  [{stype:9}] {name:45} -> {len(chunks):3} chunks")
        all_chunks.extend((name, stype, c) for c in chunks)

    print(f"\nTotal chunks: {total}   by source_type: {by_type}")

    if args.dry_run:
        emb = Embedder(project, location, model)
        sample = all_chunks[: args.embed_sample]
        t = time.monotonic()
        vecs = emb.embed_documents([c.content for _, _, c in sample])
        dt = (time.monotonic() - t) * 1000
        print(f"\nVertex embed check: {len(vecs)} vectors, "
              f"dim={len(vecs[0]) if vecs else 0}, {dt:.0f}ms")
        nm, st, c = sample[0]
        print("\nSample chunk:")
        print(f"  file={nm.rsplit('/', 1)[-1]}  source_type={st}  "
              f"heading={c.metadata.get('heading')!r}")
        print(f"  text[:220]={c.content[:220]!r}")
        print("\nDRY RUN — no database writes.")
        return

    # Bulk load over a SINGLE pooled connection (per-chunk connections are far
    # too slow through the Cloud SQL proxy). Idempotent via ON CONFLICT.
    import psycopg
    from pgvector.psycopg import register_vector
    from psycopg.types.json import Jsonb

    db_url = os.environ["DATABASE_URL"]
    emb = Embedder(project, location, model)
    batch = int(os.environ.get("RAG_EMBED_BATCH", "16"))
    sql = (
        "insert into rag.kb_chunks "
        "(source_uri, source_type, chunk_index, content, metadata, content_hash, embedding) "
        "values (%s,%s,%s,%s,%s,%s,%s) "
        "on conflict (source_uri, chunk_index) do update set "
        "source_type=excluded.source_type, content=excluded.content, "
        "metadata=excluded.metadata, content_hash=excluded.content_hash, "
        "embedding=excluded.embedding"
    )
    total = 0
    with psycopg.connect(db_url) as conn:
        register_vector(conn)
        for name, stype, blob in files:
            text = blob.download_as_text()
            chunks = chunk_book(text, max_tokens=max_tok, overlap_ratio=overlap)
            contents = [c.content for c in chunks]
            vectors = []
            for i in range(0, len(contents), batch):
                vectors.extend(emb.embed_documents(contents[i:i + batch]))
            uri = f"gs://{bucket}/{name}"
            data = [
                (uri, stype, c.chunk_index, c.content, Jsonb(c.metadata),
                 content_hash(c.content), v)
                for c, v in zip(chunks, vectors)
            ]
            with conn.cursor() as cur:
                cur.executemany(sql, data)
            conn.commit()
            total += len(data)
            print(f"  [{stype:9}] {name.rsplit('/', 1)[-1]:45} +{len(data):3}  ({total} total)",
                  flush=True)
    print(f"Ingest complete: {total} chunks written.")


if __name__ == "__main__":
    main()
