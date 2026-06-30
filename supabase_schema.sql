-- Run this entire file in Supabase Dashboard > SQL Editor > New query > Run

-- 1. Profiles (Hirenum / Talha / Abdul Moez)
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

-- 2. Contacts (every person, tagged to a profile)
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  name text not null,
  linkedin_url text,
  company text,
  role text,
  industry text,
  country text,
  email text,
  email_source text check (email_source in ('apollo','manual')),
  source text check (source in ('post_engagement','outbound')) default 'outbound',
  stage text check (stage in ('not_contacted','dm_sent','replied','interested','converted','cold')) default 'not_contacted',
  sentiment text check (sentiment in ('interested','neutral','declined','referred')),
  score int default 0,
  comment_text text,
  draft_message text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Touchpoints (history log per contact)
create table if not exists touchpoints (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete cascade,
  type text check (type in ('post_engagement','dm_sent','reply_received','call_booked','note')),
  notes text,
  created_at timestamptz default now()
);

-- Seed the three profiles
insert into profiles (name, slug)
values ('Hirenum', 'hirenum'), ('Talha Saleem', 'talha'), ('Abdul Moez Habib', 'abdul-moez')
on conflict (slug) do nothing;

-- Row Level Security: open for prototype phase (anon key read/write)
alter table profiles enable row level security;
alter table contacts enable row level security;
alter table touchpoints enable row level security;

drop policy if exists "open_profiles" on profiles;
create policy "open_profiles" on profiles for all using (true) with check (true);

drop policy if exists "open_contacts" on contacts;
create policy "open_contacts" on contacts for all using (true) with check (true);

drop policy if exists "open_touchpoints" on touchpoints;
create policy "open_touchpoints" on touchpoints for all using (true) with check (true);
