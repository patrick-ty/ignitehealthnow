from app.services.kb_retrieval import KbRetriever


def test_embed_query_returns_768_vector():
    r = KbRetriever(project="p", embed_location="us-central1",
                    embed_model="text-embedding-005",
                    db_url="postgresql://u:p@localhost/x")
    v = r.embed_query("why am I tired")
    assert len(v) == 768
    assert v[0] == 3.0  # fake encodes token count


def test_retrieve_calls_search_with_embedding(monkeypatch):
    r = KbRetriever(project="p", embed_location="us-central1",
                    embed_model="text-embedding-005",
                    db_url="postgresql://u:p@localhost/x")
    captured = {}

    def fake_search(query_embedding, top_k):
        captured["dim"] = len(query_embedding)
        captured["k"] = top_k
        return [{"content": "c", "source_type": "book", "source_uri": "u", "score": 0.9}]

    monkeypatch.setattr(r, "search", fake_search)
    hits = r.retrieve("why am I tired", top_k=4)
    assert captured == {"dim": 768, "k": 4}
    assert hits[0]["source_type"] == "book"
