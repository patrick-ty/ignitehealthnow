-- Ignite Health Now
-- RAG cloud function: shared KB + per-user note embeddings
-- Requires the pgvector extension (Supabase: enable "vector").

create extension if not exists vector;
create schema if not exists rag;

-- Shared knowledge base (book + lab reference guides). No PII.
create table if not exists rag.kb_chunks (
    id           uuid primary key default gen_random_uuid(),
    source_uri   text not null,
    source_type  text not null check (source_type in ('book', 'lab_reference')),
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

-- Per-user free-text note embeddings. PHI — RLS isolated.
create table if not exists rag.user_note_embeddings (
    id           uuid primary key default gen_random_uuid(),
    user_id      uuid not null references auth.users(id) on delete cascade,
    source_kind  text not null check (source_kind in ('journal_note', 'photo_analysis')),
    source_id    uuid not null,
    content      text not null,
    occurred_at  timestamptz,
    content_hash text not null,
    embedding    vector(768) not null,
    created_at   timestamptz not null default now(),
    unique (source_kind, source_id)
);
create index if not exists user_note_embeddings_embedding_idx
    on rag.user_note_embeddings using hnsw (embedding vector_cosine_ops);
create index if not exists user_note_embeddings_user_id_idx
    on rag.user_note_embeddings (user_id);

alter table rag.user_note_embeddings enable row level security;

-- RLS backstop: any auth.uid()-scoped path sees only its own rows.
-- The function additionally filters by user_id in SQL (defense in depth).
drop policy if exists user_note_owner_select on rag.user_note_embeddings;
create policy user_note_owner_select on rag.user_note_embeddings
    for select using (user_id = auth.uid());

-- PHI access audit — metadata only, never content.
create table if not exists rag.user_note_access_audit (
    id          uuid primary key default gen_random_uuid(),
    occurred_at timestamptz not null default now(),
    user_id     uuid not null,
    entrypoint  text not null,   -- 'retrieve' | 'ingest_user_note'
    op          text not null,   -- 'search' | 'upsert' | 'delete'
    source_ids  uuid[] not null default '{}',
    details     jsonb not null default '{}'
);
create index if not exists user_note_access_audit_user_idx
    on rag.user_note_access_audit (user_id, occurred_at);
