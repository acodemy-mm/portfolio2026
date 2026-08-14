create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  cover text not null,
  detail_cover text,
  gallery text[] not null default '{}',
  tags text[] not null default '{}',
  excerpt text not null default '',
  body text not null default '',
  featured boolean not null default false,
  year text not null default '',
  role text not null default '',
  client text,
  live_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  title text not null,
  location text not null default '',
  start_date text not null,
  end_date text,
  current boolean not null default false,
  employment_type text not null default 'Full-time',
  work_mode text not null default 'On-site',
  company_logo text,
  description text not null default '',
  highlights text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'milestone',
  title text not null,
  date text not null,
  summary text not null default '',
  thumbnail text,
  link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  cover text not null,
  excerpt text not null default '',
  body text not null default '',
  gallery text[] not null default '{}',
  tags text[] not null default '{}',
  published_at text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.articles
  add column if not exists gallery text[] not null default '{}';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

drop trigger if exists experiences_set_updated_at on public.experiences;
create trigger experiences_set_updated_at
before update on public.experiences
for each row
execute function public.set_updated_at();

drop trigger if exists activity_set_updated_at on public.activity;
create trigger activity_set_updated_at
before update on public.activity
for each row
execute function public.set_updated_at();

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
before update on public.articles
for each row
execute function public.set_updated_at();

alter table public.projects enable row level security;
alter table public.experiences enable row level security;
alter table public.activity enable row level security;
alter table public.articles enable row level security;

drop policy if exists "public read projects" on public.projects;
create policy "public read projects"
on public.projects
for select
to anon, authenticated
using (true);

drop policy if exists "public read experiences" on public.experiences;
create policy "public read experiences"
on public.experiences
for select
to anon, authenticated
using (true);

drop policy if exists "public read activity" on public.activity;
create policy "public read activity"
on public.activity
for select
to anon, authenticated
using (true);

drop policy if exists "public read articles" on public.articles;
create policy "public read articles"
on public.articles
for select
to anon, authenticated
using (true);

insert into storage.buckets (id, name, public)
values
  ('projects', 'projects', true),
  ('experiences', 'experiences', true),
  ('activity', 'activity', true),
  ('articles', 'articles', true)
on conflict (id) do nothing;
