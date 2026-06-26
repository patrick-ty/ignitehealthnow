import uuid
from core.store import Store, content_hash
from tests.conftest import requires_db


def _vec(first: float):
    return [first] + [0.0] * 767


@requires_db
def test_kb_upsert_is_idempotent_on_hash(db_url):
    store = Store(db_url)
    args = dict(
        source_uri="gs://b/book/ch1.md", source_type="book", chunk_index=0,
        content="alpha beta", metadata={"heading": "Ch1"},
        content_hash=content_hash("alpha beta"), embedding=_vec(1.0),
    )
    assert store.upsert_kb_chunk(**args) is True
    assert store.upsert_kb_chunk(**args) is False  # same hash -> skipped


@requires_db
def test_kb_search_ranks_by_cosine(db_url):
    store = Store(db_url)
    for i, c in enumerate(["near", "far"]):
        store.upsert_kb_chunk(
            source_uri="gs://b/book/ch1.md", source_type="book", chunk_index=i,
            content=c, metadata={}, content_hash=content_hash(c),
            embedding=_vec(1.0 if c == "near" else 9.0),
        )
    hits = store.search_kb(query_embedding=_vec(1.0), top_k=2)
    assert hits[0]["content"] == "near"
    assert set(hits[0].keys()) >= {"content", "source_type", "source_uri", "metadata", "score"}


@requires_db
def test_user_note_rls_isolation(db_url, seed_user):
    store = Store(db_url)
    other = seed_user  # one real user
    # create a second real user inline
    import psycopg
    other2 = uuid.uuid4()
    with psycopg.connect(db_url, autocommit=True) as conn:
        conn.execute("insert into auth.users (id) values (%s)", (other2,))
    try:
        store.upsert_user_note(
            user_id=other, source_kind="journal_note", source_id=uuid.uuid4(),
            content="mine", occurred_at=None, content_hash=content_hash("mine"),
            embedding=_vec(1.0),
        )
        store.upsert_user_note(
            user_id=other2, source_kind="journal_note", source_id=uuid.uuid4(),
            content="theirs", occurred_at=None, content_hash=content_hash("theirs"),
            embedding=_vec(1.0),
        )
        hits = store.search_user_notes(user_id=other, query_embedding=_vec(1.0), top_k=10)
        contents = {h["content"] for h in hits}
        assert contents == {"mine"}  # never sees other2's note
    finally:
        with psycopg.connect(db_url, autocommit=True) as conn:
            conn.execute("delete from auth.users where id = %s", (other2,))


@requires_db
def test_user_note_edit_replaces_not_duplicates(db_url, seed_user):
    store = Store(db_url)
    sid = uuid.uuid4()
    store.upsert_user_note(
        user_id=seed_user, source_kind="journal_note", source_id=sid,
        content="v1", occurred_at=None, content_hash=content_hash("v1"), embedding=_vec(1.0),
    )
    store.upsert_user_note(
        user_id=seed_user, source_kind="journal_note", source_id=sid,
        content="v2", occurred_at=None, content_hash=content_hash("v2"), embedding=_vec(2.0),
    )
    hits = store.search_user_notes(user_id=seed_user, query_embedding=_vec(2.0), top_k=10)
    assert [h["content"] for h in hits] == ["v2"]


@requires_db
def test_search_user_notes_writes_audit(db_url, seed_user):
    import psycopg
    store = Store(db_url)
    store.upsert_user_note(
        user_id=seed_user, source_kind="journal_note", source_id=uuid.uuid4(),
        content="note", occurred_at=None, content_hash=content_hash("note"), embedding=_vec(1.0),
    )
    store.search_user_notes(user_id=seed_user, query_embedding=_vec(1.0), top_k=5)
    with psycopg.connect(db_url, autocommit=True) as conn:
        row = conn.execute(
            "select op, entrypoint from rag.user_note_access_audit where user_id=%s and op='search'",
            (seed_user,),
        ).fetchone()
    assert row is not None
