-- ==============================================================================
-- VERDARA SPATIAL ECO-TOWN: ENTERPRISE SUPABASE DATABASE ARCHITECTURE (v4.0.0)
-- 100% Idempotent, Clean Reset Supported, Multi-Tenant AI Token Isolation
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. CLEAN RESET (Run this block if you want to wipe all tables and start fresh)
-- ------------------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop table if exists public.scan_audit cascade;
drop table if exists public.user_ai_usage cascade;
drop table if exists public.profiles cascade;

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ------------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. PUBLIC PROFILES TABLE
-- ------------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default 'Verdara Resident',
  avatar_url text default '',
  role text not null default 'resident' check (role in ('resident', 'auditor', 'city_planner', 'admin')),
  city text not null default 'Menlo Park',
  country_code text not null default 'US',
  theme_preference text not null default 'dark' check (theme_preference in ('light', 'dark')),
  units_preference text not null default 'metric' check (units_preference in ('metric', 'imperial')),
  level integer not null default 1 check (level >= 1),
  xp integer not null default 0 check (xp >= 0),
  solar_kwp numeric(8,2) not null default 0.00,
  annual_savings_usd numeric(10,2) not null default 0.00,
  co2_saved_kg numeric(10,2) not null default 0.00,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. PER-USER AI USAGE & TOKEN QUOTA ISOLATION TABLE
-- Strictly separates AI token consumption so users never share or leak credits
-- ------------------------------------------------------------------------------
create table public.user_ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  daily_budget_usd numeric(8,2) not null default 12.00,
  today_spend_usd numeric(8,4) not null default 0.0000,
  total_spend_usd numeric(8,4) not null default 0.0000,
  tokens_used integer not null default 0,
  live_api_calls integer not null default 0,
  cache_hits integer not null default 0,
  last_reset_date date not null default current_date,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 4. SPATIAL SCAN AUDIT TABLE
-- ------------------------------------------------------------------------------
create table public.scan_audit (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('waste', 'plant', 'retrofit')),
  sample_id text,
  city text not null default 'Menlo Park',
  country_code text not null default 'US',
  object_count integer not null default 1 check (object_count >= 1),
  co2e_avoided_g numeric(12,2) not null default 0.00,
  dhash text,
  verified_by_model text not null default 'meta-sam-3.1',
  created_at timestamptz not null default timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 5. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
create index idx_profiles_email on public.profiles(lower(email));
create index idx_profiles_city on public.profiles(city);
create index idx_user_ai_usage_user_id on public.user_ai_usage(user_id);
create index idx_scan_audit_user_id on public.scan_audit(user_id);

-- ------------------------------------------------------------------------------
-- 6. AUTOMATIC USER PROVISIONING TRIGGER (Works with Email, Google, Facebook)
-- ------------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public, auth
language plpgsql
as $$
declare
  v_email text;
  v_name text;
  v_avatar text;
begin
  -- Resolve real email from auth record or metadata (NEVER use static mock email)
  v_email := coalesce(
    nullif(trim(new.email), ''),
    nullif(trim(new.raw_user_meta_data->>'email'), ''),
    'user_' || substr(new.id::text, 1, 8) || '@auth.verdara.local'
  );

  -- Resolve real display name
  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    split_part(v_email, '@', 1),
    'Resident'
  );

  -- Resolve real avatar URL if supplied by provider
  v_avatar := coalesce(
    nullif(trim(new.raw_user_meta_data->>'avatar_url'), ''),
    nullif(trim(new.raw_user_meta_data->>'picture'), ''),
    ''
  );

  -- Insert profile for the authentic user
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
    v_email,
    v_name,
    v_avatar,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(nullif(excluded.display_name, 'Resident'), public.profiles.display_name),
    avatar_url = coalesce(nullif(excluded.avatar_url, ''), public.profiles.avatar_url),
    updated_at = timezone('utc'::text, now());

  -- Initialize isolated per-user AI usage budget
  insert into public.user_ai_usage (
    user_id,
    email,
    daily_budget_usd,
    today_spend_usd,
    total_spend_usd,
    tokens_used,
    live_api_calls,
    cache_hits,
    last_reset_date,
    created_at,
    updated_at
  )
  values (
    new.id,
    v_email,
    12.00,
    0.0000,
    0.0000,
    0,
    0,
    0,
    current_date,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  on conflict (user_id) do update set
    email = excluded.email,
    updated_at = timezone('utc'::text, now());

  return new;
end;
$$;

-- Attach trigger to auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.user_ai_usage enable row level security;
alter table public.scan_audit enable row level security;

-- Profiles Policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- AI Usage Policies (Strict User Isolation)
create policy "Users can view own AI usage"
  on public.user_ai_usage for select
  using (auth.uid() = user_id);

create policy "Users can update own AI usage"
  on public.user_ai_usage for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Scan Audit Policies
create policy "Users can view own scans"
  on public.scan_audit for select
  using (auth.uid() = user_id);

create policy "Users can insert own scans"
  on public.scan_audit for insert
  with check (auth.uid() = user_id);
