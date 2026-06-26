from core.embeddings import Embedder


def test_embed_documents_returns_one_vector_per_text():
    e = Embedder(project="p", location="us-central1", model="text-embedding-005")
    vecs = e.embed_documents(["hello world", "a b c"])
    assert len(vecs) == 2
    assert all(len(v) == Embedder.DIMENSION for v in vecs)
    assert vecs[0][0] == 2.0  # fake encodes token count in slot 0
    assert vecs[1][0] == 3.0


def test_embed_query_returns_single_vector():
    e = Embedder(project="p", location="us-central1", model="text-embedding-005")
    v = e.embed_query("one two three four")
    assert len(v) == Embedder.DIMENSION
    assert v[0] == 4.0
