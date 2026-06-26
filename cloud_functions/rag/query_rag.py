"""Quick retrieval smoke-test against the live KB. Usage: query_rag.py "question"."""
import os
import sys

from core.embeddings import Embedder
from core.store import Store

q = " ".join(sys.argv[1:]) or "why am I tired?"
emb = Embedder(os.environ["GCP_PROJECT"],
               os.environ.get("VERTEX_LOCATION", "us-central1"),
               os.environ.get("RAG_EMBED_MODEL", "text-embedding-005"))
store = Store(os.environ["DATABASE_URL"])
qv = emb.embed_query(q)
hits = store.search_kb(query_embedding=qv, top_k=5)
print(f"\nQ: {q}\n" + "=" * 70)
for i, h in enumerate(hits, 1):
    src = h["source_uri"].rsplit("/", 1)[-1]
    head = (h.get("metadata") or {}).get("heading", "")
    print(f"{i}. [{h['source_type']:9}] score={h['score']:.3f}  {src}")
    if head:
        print(f"   § {head}")
    print(f"   {h['content'][:230].strip()}...\n")
