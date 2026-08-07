-- Add articles table + public storage bucket (run in Supabase SQL editor if schema was already applied)

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  cover text not null,
  excerpt text not null default '',
  body text not null default '',
  tags text[] not null default '{}',
  published_at text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
before update on public.articles
for each row
execute function public.set_updated_at();

alter table public.articles enable row level security;

drop policy if exists "public read articles" on public.articles;
create policy "public read articles"
on public.articles
for select
to anon, authenticated
using (true);

insert into storage.buckets (id, name, public)
values ('articles', 'articles', true)
on conflict (id) do nothing;
