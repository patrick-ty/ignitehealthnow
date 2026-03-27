
-- Ignite Health Now
-- Epic 00: Foundation & Authentication
-- PII Schema (HIPAA-ready, API-owned logic)

create extension if not exists pgcrypto;
create schema if not exists pii;

create table if not exists pii.user_profile (
    user_id uuid primary key references auth.users(id) on delete cascade,
    first_name_enc bytea,
    last_name_enc  bytea,
    mobile_enc     bytea,
    zipcode_enc    bytea,
    display_name text,
    handle text,
    birth_month integer,
    birth_year  integer,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table pii.user_profile
    add constraint user_profile_birth_month_chk
    check (
        birth_month is null
        or (birth_month >= 1 and birth_month <= 12)
    );

alter table pii.user_profile
    add constraint user_profile_birth_year_chk
    check (
        birth_year is null
        or (birth_year >= 1900 and birth_year <= extract(year from now())::int)
    );

create unique index if not exists user_profile_handle_unique
    on pii.user_profile(handle)
    where handle is not null;

create table if not exists pii.user_profile_properties (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references pii.user_profile(user_id) on delete cascade,
    key text not null,
    value_json jsonb not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, key)
);

create index if not exists idx_user_profile_properties_user_id
    on pii.user_profile_properties(user_id);

create or replace function pii.update_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_user_profile_updated_at on pii.user_profile;
create trigger trg_user_profile_updated_at
before update on pii.user_profile
for each row execute function pii.update_updated_at();

alter table pii.user_profile enable row level security;
alter table pii.user_profile_properties enable row level security;

create policy user_profile_select_own
on pii.user_profile
for select
using (auth.uid() = user_id);

create policy user_profile_insert_own
on pii.user_profile
for insert
with check (auth.uid() = user_id);

create policy user_profile_update_own
on pii.user_profile
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy user_profile_properties_select_own
on pii.user_profile_properties
for select
using (auth.uid() = user_id);

create policy user_profile_properties_insert_own
on pii.user_profile_properties
for insert
with check (auth.uid() = user_id);

create policy user_profile_properties_update_own
on pii.user_profile_properties
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy user_profile_properties_delete_own
on pii.user_profile_properties
for delete
using (auth.uid() = user_id);
