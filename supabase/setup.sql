-- Enid & Jason wedding website: Supabase setup.
-- Run this once in the Supabase dashboard (SQL Editor > New query > paste > Run).

create extension if not exists "pgcrypto";

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  attending text not null default 'yes' check (attending in ('yes', 'no')),
  guests_count integer not null default 1 check (guests_count between 1 and 10),
  dietary text not null default '',
  message text not null default '',
  character jsonb not null default '{}'::jsonb,
  map_x double precision not null default random(),
  map_y double precision not null default random(),
  created_at timestamptz not null default now()
);

alter table public.rsvps enable row level security;

-- Guests may submit RSVPs but cannot read anyone's data.
-- The website's API routes read via the service role key (bypasses RLS)
-- and only ever expose name + character + map position publicly.
drop policy if exists "anyone can rsvp" on public.rsvps;
create policy "anyone can rsvp"
  on public.rsvps for insert
  to anon, authenticated
  with check (true);

-- No select/update/delete policies on purpose: reads and edits happen through
-- the server-side API routes using the service role key.
