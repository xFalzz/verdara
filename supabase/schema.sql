-- ==============================================================================
-- VERDARA SPATIAL ECO-TOWN: ENTERPRISE DATABASE SCHEMA (v3.3.1)
-- Self-Healing Migration: Works seamlessly on fresh or existing databases
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ENSURE PROFILES BASE TABLE EXISTS
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade
);

-- 3. ENSURE ALL PROFILE COLUMNS EXIST (Self-healing for existing tables)
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists display_name text default 'Verdara Resident';
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists city text default 'Menlo Park';
alter table public.profiles add column if not exists country_code text default 'US';
alter table public.profiles add column if not exists role text default 'resident';
alter table public.profiles add column if not exists theme_preference text default 'dark';
alter table public.profiles add column if not exists units_preference text default 'metric';
alter table public.profiles add column if not exists level integer default 1;
alter table public.profiles add column if not exists xp integer default 0;
alter table public.profiles add column if not exists solar_kwp numeric(8,2) default 19.80;
alter table public.profiles add column if not exists annual_savings_usd numeric(10,2) default 9651.00;
alter table public.profiles add column if not exists co2_saved_kg numeric(10,2) default 14200.00;
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

-- Drop deprecated demo columns if they existed in legacy schemas
alter table public.profiles drop column if exists is_judge_demo;

-- 4. BACKFILL AND SYNC EXISTING USERS FROM AUTH.USERS
-- Backfill email for any existing rows in profiles where email is empty or null
update public.profiles p
set email = coalesce(u.email, 'resident@verdara.app')
from auth.users u
where p.id = u.id and (p.email is null or p.email = '');

-- Auto-register any existing auth users who don't have a profile row yet
insert into public.profiles (id, email, display_name, avatar_url)
select
  u.id,
  coalesce(u.email, 'resident@verdara.app'),
  coalesce(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(coalesce(u.email, 'resident@verdara.app'), '@', 1)
  ),
  coalesce(
    u.raw_user_meta_data->>'avatar_url',
    u.raw_user_meta_data->>'picture',
    ''
  )
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do update set
  email = coalesce(excluded.email, public.profiles.email);

-- 5. INDEXES FOR PERFORMANCE
create index if not exists idx_profiles_email on public.profiles(lower(email));
create index if not exists idx_profiles_city on public.profiles(city);

-- 6. AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- Automatically executes when any user signs up via Google, Facebook, or Email
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    email,
    display_name,
    avatar_url,
    created_at,
    updated_at
  )
  values (
    new.id,
    coalesce(new.email, 'resident@verdara.app'),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(coalesce(new.email, 'resident@verdara.app'), '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture',
      ''
    ),
    now(),
    now()
  )
  on conflict (id) do update set
    email = coalesce(excluded.email, public.profiles.email),
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    avatar_url = coalesce(nullif(excluded.avatar_url, ''), public.profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Safely re-attach trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;

-- Policy: Users can view their own profile
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Policy: Users can update their own profile
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Policy: Users can insert their own profile
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 8. SPATIAL SCAN AUDIT TABLE
create table if not exists public.scan_audit (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  mode text not null, -- 'waste' | 'plant' | 'retrofit'
  sample_id text,
  city text default 'Menlo Park',
  country_code text default 'US',
  object_count integer default 1,
  co2e_avoided_g numeric(12,2) default 0.0,
  dhash text,
  verified_by_model text default 'meta-sam-3.1',
  created_at timestamptz default now()
);

alter table public.scan_audit enable row level security;

drop policy if exists "Users can view own scans" on public.scan_audit;
create policy "Users can view own scans"
  on public.scan_audit for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own scans" on public.scan_audit;
create policy "Users can insert own scans"
  on public.scan_audit for insert
  with check (auth.uid() = user_id);

-- 9. COMMUNITY ENERGY BENCHMARKS TABLE
create table if not exists public.energy_benchmarks (
  slug text primary key,
  city text not null,
  country_code text not null,
  country_name_en text not null,
  ghi_kwh_m2_day numeric(5,2) not null,
  annual_precip_mm numeric(6,1) not null,
  solar_kwp_default numeric(6,2) not null,
  solar_savings_yr numeric(10,2) not null,
  currency text not null,
  rain_liters_yr numeric(12,2) not null,
  tci_score integer not null,
  updated_at timestamptz default now()
);

alter table public.energy_benchmarks enable row level security;

drop policy if exists "Public can read benchmarks" on public.energy_benchmarks;
create policy "Public can read benchmarks"
  on public.energy_benchmarks for select
  using (true);
