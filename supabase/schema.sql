-- Run this file manually in Supabase SQL Editor.
-- It stores the role selected before authentication and leaves the role
-- protected by Row Level Security.

create type public.app_role as enum ('student', 'teacher');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);