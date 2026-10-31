-- ==============================================================================
-- VERDARA SPATIAL ECO-TOWN: ENTERPRISE DATABASE SCHEMA (v3.3)
-- Automated User Profiles, Row Level Security (RLS), and Environmental Benchmarks
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. PROFILES TABLE (Linked to Supabase Auth auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  city text default 'Menlo Park',
  country_code text default 'US',
  role text default 'resident',
  theme_preference text default 'dark',
  units_preference text default 'metric',
  level integer default 1,
  xp integer default 0,
  solar_kwp numeric(8,2) default 19.80,
  annual_savings_usd numeric(10,2) default 9651.00,
  co2_saved_kg numeric(10,2) default 14200.00,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for high-speed email and city lookups
create index if not exists idx_profiles_email on public.profiles(lower(email));
create index if not exists idx_profiles_city on public.profiles(city);

-- 3. AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- Automatically fires when a user signs up via Google, Facebook, or Email
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
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
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
    email = excluded.email,
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    avatar_url = coalesce(nullif(excluded.avatar_url, ''), public.profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Recreate trigger safely
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
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

-- 5. SPATIAL SCAN AUDIT TABLE
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

-- 6. COMMUNITY ENERGY BENCHMARKS TABLE
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
