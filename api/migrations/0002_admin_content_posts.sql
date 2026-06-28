-- Admin dashboard — Content & Social store (spec 2026-06-27-admin-dashboard).
-- Owned exclusively by the API via the service-role key. Isolated to Supabase
-- project arxcpgonhrhdpzhgwexj. No evogolf resources.
create table if not exists public.admin_content_posts (
    id            uuid primary key default gen_random_uuid(),
    channel       text not null check (channel in ('instagram','x','linkedin','facebook')),
    caption       text not null,
    hashtags      text[] not null default '{}',
    status        text not null default 'draft'
                  check (status in ('draft','review','scheduled','published')),
    scheduled_for timestamptz,
    source        text,
    ai            boolean not null default false,
    why_it_works  text,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

create index if not exists admin_content_posts_status_idx
    on public.admin_content_posts (status, created_at desc);

-- RLS on; no anon/auth policies — only the service role (which bypasses RLS) touches it.
alter table public.admin_content_posts enable row level security;
