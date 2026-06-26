-- Ignite Health Now
-- RAG knowledge-base schema for Cloud SQL (GCP data tier).
--
-- KB ONLY — no auth dependency. This stands up the shared book/reference corpus.
-- The per-user PHI table (user_note_embeddings) + its RLS are intentionally NOT
-- here: they need the identity layer (auth.users / a user_id source), which is
-- deferred with the auth work. On Cloud SQL there is no Supabase auth.uid(), so
-- per-user isolation will use the explicit WHERE user_id filter (see the auth
-- provider contract spec) when that table is added.
--
-- Postgres 16: gen_random_uuid() is built-in (no pgcrypto needed).

create extension if not exists vector;
create schema if not exists rag;

create table if not exists rag.kb_chunks (
    id           uuid primary key default gen_random_uuid(),
    source_uri   text not null,
    source_type  text not null check (source_type in ('book', 'reference', 'story')),
    chunk_index  int  not null,
    content      text not null,
    metadata     jsonb not null default '{}',
    content_hash text not null,
    embedding    vector(768) not null,
    created_at   timestamptz not null default now(),
    unique (source_uri, chunk_index)
);

create index if not exists kb_chunks_embedding_idx
    on rag.kb_chunks using hnsw (embedding vector_cosine_ops);
