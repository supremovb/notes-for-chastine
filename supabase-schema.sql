create table if not exists public.relationship_notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  mood text not null default 'Grateful',
  healing_status text not null default 'Unprocessed',
  pov text not null default 'My POV',
  location text not null default '',
  image_url text not null default '',
  photo_urls text not null default '',
  audio_url text not null default '',
  tags text not null default '',
  felt_then text not null default '',
  understand_now text not null default '',
  reaction text not null default '',
  is_encrypted boolean not null default false,
  privacy_hash text not null default '',
  privacy_hint text not null default '',
  is_pinned boolean not null default false,
  is_archived boolean not null default false,
  is_favorite boolean not null default false,
  entry_date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.relationship_notes
add column if not exists healing_status text not null default 'Unprocessed';

alter table public.relationship_notes
add column if not exists tags text not null default '';

alter table public.relationship_notes
add column if not exists photo_urls text not null default '';

alter table public.relationship_notes
add column if not exists audio_url text not null default '';

alter table public.relationship_notes
add column if not exists felt_then text not null default '';

alter table public.relationship_notes
add column if not exists understand_now text not null default '';

alter table public.relationship_notes
add column if not exists reaction text not null default '';

alter table public.relationship_notes
add column if not exists is_encrypted boolean not null default false;

alter table public.relationship_notes
add column if not exists privacy_hash text not null default '';

alter table public.relationship_notes
add column if not exists privacy_hint text not null default '';

alter table public.relationship_notes
add column if not exists is_pinned boolean not null default false;

alter table public.relationship_notes
add column if not exists is_archived boolean not null default false;

alter table public.relationship_notes
add column if not exists entry_date date not null default current_date;

alter table public.relationship_notes enable row level security;

drop policy if exists "Allow public read notes" on public.relationship_notes;
drop policy if exists "Allow public insert notes" on public.relationship_notes;
drop policy if exists "Allow public update notes" on public.relationship_notes;
drop policy if exists "Allow public delete notes" on public.relationship_notes;

create policy "Allow public read notes"
on public.relationship_notes
for select
to anon
using (true);

create policy "Allow public insert notes"
on public.relationship_notes
for insert
to anon
with check (true);

create policy "Allow public update notes"
on public.relationship_notes
for update
to anon
using (true)
with check (true);

create policy "Allow public delete notes"
on public.relationship_notes
for delete
to anon
using (true);

create index if not exists relationship_notes_created_at_idx
on public.relationship_notes (created_at desc);

create index if not exists relationship_notes_entry_date_idx
on public.relationship_notes (entry_date desc);

create index if not exists relationship_notes_is_pinned_idx
on public.relationship_notes (is_pinned)
where is_pinned = true;

create index if not exists relationship_notes_is_archived_idx
on public.relationship_notes (is_archived);
