import re
from dataclasses import dataclass, field


@dataclass
class Chunk:
    content: str
    chunk_index: int
    metadata: dict = field(default_factory=dict)


def approx_tokens(text: str) -> int:
    return round(len(text.split()) * 1.3)


_HEADING_RE = re.compile(r"^(#{1,6})\s+(.*)$", re.MULTILINE)


def _split_sections(text: str) -> list[tuple[str, str]]:
    """Return [(heading, body)] split on markdown headings. Text before the
    first heading is attributed to heading '' (preamble)."""
    sections: list[tuple[str, str]] = []
    matches = list(_HEADING_RE.finditer(text))
    if not matches:
        return [("", text.strip())]
    if matches[0].start() > 0:
        pre = text[: matches[0].start()].strip()
        if pre:
            sections.append(("", pre))
    for i, m in enumerate(matches):
        heading = m.group(2).strip()
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[start:end].strip()
        sections.append((heading, body))
    return sections


def _pack(body: str, max_tokens: int, overlap_ratio: float) -> list[str]:
    """Pack a body into windows <= max_tokens, overlapping by overlap_ratio."""
    words = body.split()
    if not words:
        return []
    max_words = max(1, int(max_tokens / 1.3))
    overlap = int(max_words * overlap_ratio)
    windows: list[str] = []
    start = 0
    while start < len(words):
        end = min(start + max_words, len(words))
        windows.append(" ".join(words[start:end]))
        if end == len(words):
            break
        start = end - overlap
    return windows


def chunk_book(text: str, *, max_tokens: int, overlap_ratio: float) -> list[Chunk]:
    chunks: list[Chunk] = []
    idx = 0
    for heading, body in _split_sections(text):
        for window in _pack(body, max_tokens, overlap_ratio):
            chunks.append(Chunk(content=window, chunk_index=idx, metadata={"heading": heading}))
            idx += 1
    return chunks


def chunk_lab_reference(text: str) -> list[Chunk]:
    chunks: list[Chunk] = []
    idx = 0
    for heading, body in _split_sections(text):
        if not heading:
            continue
        content = f"{heading}\n{body}".strip()
        chunks.append(Chunk(content=content, chunk_index=idx, metadata={"lab_name": heading}))
        idx += 1
    return chunks
