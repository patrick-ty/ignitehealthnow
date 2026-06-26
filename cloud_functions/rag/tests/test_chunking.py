from core.chunking import chunk_book, chunk_lab_reference, approx_tokens


def test_approx_tokens_counts_words_scaled():
    assert approx_tokens("one two three four") == 5  # round(4 * 1.3)


def test_chunk_book_splits_on_headings_and_tags_metadata():
    text = (
        "# Chapter 1\n\n"
        + ("word " * 400).strip()
        + "\n\n## Section A\n\n"
        + ("alpha " * 400).strip()
    )
    chunks = chunk_book(text, max_tokens=800, overlap_ratio=0.15)
    assert len(chunks) >= 2
    headings = {c.metadata["heading"] for c in chunks}
    assert "Chapter 1" in headings
    assert "Section A" in headings
    # indices are sequential starting at 0
    assert [c.chunk_index for c in chunks] == list(range(len(chunks)))


def test_chunk_book_packs_short_sections_within_max_tokens():
    text = "# H\n\n" + ("word " * 100).strip()
    chunks = chunk_book(text, max_tokens=800, overlap_ratio=0.15)
    assert len(chunks) == 1
    assert approx_tokens(chunks[0].content) <= 800


def test_chunk_lab_reference_one_chunk_per_marker():
    text = (
        "## Ferritin\n\nFunctional 50-100. Conventional 12-150.\n\n"
        "## TSH\n\nFunctional 0.5-2.0.\n"
    )
    chunks = chunk_lab_reference(text)
    assert len(chunks) == 2
    names = {c.metadata["lab_name"] for c in chunks}
    assert names == {"Ferritin", "TSH"}
    assert "50-100" in chunks[0].content
