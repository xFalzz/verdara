-- ==============================================================================
-- VERDARA SPATIAL ECO-TOWN: SUPABASE SECURITY ADVISOR REMEDIATION (v2.0)
-- Solusi untuk: ERROR 42501 (must be owner of table spatial_ref_sys)
-- & Peringatan Eksekusi Fungsi SECURITY DEFINER
-- Project: lynbpwewukmlditrihcq (verdara-town)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SOLUSI ERROR spatial_ref_sys & FUNGSI st_estimatedextent
-- Tabel spatial_ref_sys dan fungsi st_estimatedextent dibuat otomatis saat ekstensi
-- PostGIS diaktifkan di schema 'public'. Karena dimiliki oleh superuser 'supabase_admin',
-- perintah ALTER TABLE oleh role 'postgres' akan memicu error 42501.
--
-- Verdara tidak menggunakan tipe geometri PostGIS (menggunakan lat/lng numerik biasa).
-- Menghapus PostGIS dari schema 'public' adalah solusi resmi Supabase yang langsung
-- melenyapkan 1 Error spatial_ref_sys dan 6 Peringatan st_estimatedextent sekaligus!
-- ------------------------------------------------------------------------------
drop extension if exists postgis cascade;

-- (Catatan: Jika suatu saat Anda ingin memakai PostGIS, pasang di schema 'extensions':)
-- create extension if not exists postgis with schema extensions;

-- ------------------------------------------------------------------------------
-- 2. SOLUSI PERINGATAN: public.handle_new_user()
-- Fungsi trigger ini hanya boleh dieksekusi oleh trigger internal PostgreSQL,
-- TIDAK boleh dipanggil langsung oleh publik atau pengguna via API/RPC.
-- ------------------------------------------------------------------------------
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

-- ------------------------------------------------------------------------------
-- 3. SOLUSI PERINGATAN: public.rls_auto_enable() (jika ada)
-- ------------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from pg_proc p 
    join pg_namespace n on p.pronamespace = n.oid 
    where n.nspname = 'public' and p.proname = 'rls_auto_enable'
  ) then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end $$;
