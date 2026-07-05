-- Enid & Jason wedding website: Supabase setup.
-- Run this once in the Supabase dashboard (SQL Editor > New query > paste > Run).
--
-- Data model: a managed guest list grouped into parties (households).
--   parties  -> one invited household / group
--   guests   -> individual invitees, each belongs to a party
-- Guests look themselves up by full name on the RSVP page and can respond for
-- everyone in their party. Reads/writes happen through the server-side API
-- routes using the service role key (which bypasses RLS).

create extension if not exists "pgcrypto";

-- A party is a household / invited group, e.g. "The Rossi Family".
create table if not exists public.parties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null default '',
  created_at timestamptz not null default now()
);

-- Each invited person. attending is null until they respond ('yes' | 'no').
create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.parties(id) on delete cascade,
  full_name text not null,
  email text not null default '',
  attending text check (attending in ('yes', 'no')),
  driving boolean not null default false,
  dietary text not null default '',
  character jsonb not null default '{}'::jsonb,
  map_x double precision not null default random(),
  map_y double precision not null default random(),
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

-- Migration for existing deployments: add the newer columns if missing.
alter table public.guests add column if not exists email text not null default '';
alter table public.guests add column if not exists driving boolean not null default false;

-- Case/space-insensitive name lookups.
create index if not exists guests_full_name_lower_idx
  on public.guests (lower(full_name));
create index if not exists guests_party_id_idx
  on public.guests (party_id);

alter table public.parties enable row level security;
alter table public.guests enable row level security;

-- No public policies on purpose: the website's API routes use the service role
-- key, which bypasses RLS. This keeps the full guest list private (nobody can
-- read or edit rows directly with the anon key).

-- Explicit grants so the service_role can read/write both tables.
grant usage on schema public to anon, authenticated, service_role;
grant all on public.parties to service_role;
grant all on public.guests to service_role;

-- ---------------------------------------------------------------------------
-- Optional: seed a couple of example parties so you can try the flow.
-- Delete this block (or edit it) once you add your real guest list in /admin.
-- ---------------------------------------------------------------------------
-- insert into public.parties (name) values ('The Rossi Family')
--   returning id; -- then insert guests with that party_id
