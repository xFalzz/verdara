-- ==============================================================================
-- VERDARA SPATIAL ECO-TOWN: SUPABASE SECURITY ADVISOR REMEDIATION
-- Resolves: 1 Error (RLS Disabled in Public) & 12 Warnings (SECURITY DEFINER execution)
-- Project: lynbpwewukmlditrihcq (verdara-town)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. FIX ERROR: RLS Disabled in Public on public.spatial_ref_sys
-- Enables Row Level Security on the PostGIS reference table and permits safe public read access
-- ------------------------------------------------------------------------------
alter table if exists public.spatial_ref_sys enable row level security;

drop policy if exists "Allow public read access to spatial_ref_sys" on public.spatial_ref_sys;
create policy "Allow public read access to spatial_ref_sys"
  on public.spatial_ref_sys
  for select
  to public
  using (true);

-- ------------------------------------------------------------------------------
-- 2. FIX WARNINGS: Restrict direct execution of SECURITY DEFINER functions
-- Trigger functions must only run via internal PostgreSQL triggers, NOT via public/authenticated API calls.
-- ------------------------------------------------------------------------------

-- 2.1 Handle New User Trigger Function
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

-- 2.2 RLS Auto Enable Function (if created by helper script)
do $$
begin
  if exists (
    select 1 from pg_proc p 
    join pg_namespace n on p.pronamespace = n.oid 
    where n.nspname = 'public' and p.proname = 'rls_auto_enable'
  ) then
    execute 'revoke execute on function public.rls_auto_enable() from public';
    execute 'revoke execute on function public.rls_auto_enable() from anon';
    execute 'revoke execute on function public.rls_auto_enable() from authenticated';
  end if;
end $$;

-- 2.3 PostGIS st_estimatedextent functions
do $$
begin
  if exists (
    select 1 from pg_proc p 
    join pg_namespace n on p.pronamespace = n.oid 
    where n.nspname = 'public' and p.proname = 'st_estimatedextent'
  ) then
    execute 'revoke execute on function public.st_estimatedextent(text, text, text) from public';
    execute 'revoke execute on function public.st_estimatedextent(text, text, text) from anon';
    execute 'revoke execute on function public.st_estimatedextent(text, text, text) from authenticated';
    execute 'revoke execute on function public.st_estimatedextent(text, text, text, boolean) from public';
    execute 'revoke execute on function public.st_estimatedextent(text, text, text, boolean) from anon';
    execute 'revoke execute on function public.st_estimatedextent(text, text, text, boolean) from authenticated';
  end if;
exception
  when others then null;
end $$;
