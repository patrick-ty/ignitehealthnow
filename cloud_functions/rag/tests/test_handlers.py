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

    def embed_query(self, text):
        return [float(len(text.split()))] + [0.0] * 767


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


from main import run_ingest_user_note


class NoteStore:
    def __init__(self):
        self.upserts = []
        self.deletes = []

    def upsert_user_note(self, **kw):
        self.upserts.append(kw)
        return True

    def delete_user_note(self, **kw):
        self.deletes.append(kw)
        return 1


def test_run_ingest_user_note_upsert_embeds_and_writes():
    store = NoteStore()
    msg = {
        "user_id": "11111111-1111-1111-1111-111111111111",
        "source_kind": "journal_note",
        "source_id": "22222222-2222-2222-2222-222222222222",
        "content": "felt foggy after lunch",
        "occurred_at": "2026-06-25T12:00:00Z",
        "op": "upsert",
    }
    result = run_ingest_user_note(msg, embedder=FakeEmbedder(), store=store)
    assert result == {"op": "upsert", "written": True}
    assert len(store.upserts) == 1
    assert store.upserts[0]["user_id"] == msg["user_id"]
    assert "content_hash" in store.upserts[0]


def test_run_ingest_user_note_delete():
    store = NoteStore()
    msg = {
        "user_id": "11111111-1111-1111-1111-111111111111",
        "source_kind": "journal_note",
        "source_id": "22222222-2222-2222-2222-222222222222",
        "op": "delete",
    }
    result = run_ingest_user_note(msg, embedder=FakeEmbedder(), store=store)
    assert result == {"op": "delete", "deleted": 1}
    assert len(store.deletes) == 1
