from core.chunking import Chunk
from core.config import load_config
from main import run_ingest_kb


class FakeGCS:
    def __init__(self, files):  # files: dict[name -> text]
        self._files = files

    def list_texts(self, bucket, prefix):
        return [(n, t) for n, t in self._files.items() if n.startswith(prefix)]


class FakeEmbedder:
    DIMENSION = 768

    def embed_documents(self, texts):
        return [[float(len(t.split()))] + [0.0] * 767 for t in texts]


class RecordingStore:
    def __init__(self):
        self.embedded = 0
        self.skipped = 0

    def upsert_kb_chunk(self, **kw):
        # Pretend chunk 0 already exists (skip), others are new.
        if kw["chunk_index"] == 0:
            self.skipped += 1
            return False
        self.embedded += 1
        return True


def test_run_ingest_kb_chunks_embeds_and_counts():
    cfg = load_config()
    gcs = FakeGCS({"book/ch1.md": "# H\n\n" + ("w " * 50).strip()})
    store = RecordingStore()
    result = run_ingest_kb("book/", gcs=gcs, embedder=FakeEmbedder(), store=store, cfg=cfg)
    assert result["files"] == 1
    assert result["chunks_embedded"] + result["chunks_skipped"] >= 1
    assert result["chunks_skipped"] == store.skipped
