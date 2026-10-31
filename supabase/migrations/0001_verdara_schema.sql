-- ============================================================================
-- VERDARA: Spatial Intelligence for Sustainable Living & Resilient Homes
-- Meta Global AI Developer Hackathon (Oct 27 to Nov 4, 2026)
-- Full PostgreSQL 15 + PostGIS + Row Level Security (RLS) Migration
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. ENUMERATED TYPES
DO $$ BEGIN
  CREATE TYPE user_role_enum AS ENUM ('user', 'judge', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE unit_system_enum AS ENUM ('metric', 'imperial');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE koppen_biome_enum AS ENUM (
    'tropical',
    'arid',
    'mediterranean',
    'temperate',
    'continental',
    'polar'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE scan_mode_enum AS ENUM (
    'waste_valorization',
    'plant_pathology',
    'eco_retrofit',
    'ewaste_extraction'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE hub_category_enum AS ENUM (
    'recycling_center',
    'compost_hub',
    'ewaste_dropoff',
    'solar_installer',
    'repair_cafe'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. PROFILES & ECO-ISLAND STATE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Eco Explorer',
  avatar_url TEXT,
  role user_role_enum NOT NULL DEFAULT 'user',
  is_judge_demo BOOLEAN NOT NULL DEFAULT FALSE,

  -- Global Localization Preferences
  preferred_locale VARCHAR(10) NOT NULL DEFAULT 'en-US',
  preferred_currency CHAR(3) NOT NULL DEFAULT 'USD',
  unit_system unit_system_enum NOT NULL DEFAULT 'metric',
  country_code CHAR(2) NOT NULL DEFAULT 'US',

  -- Active Spatial Context
  active_city_name TEXT NOT NULL DEFAULT 'Menlo Park, CA, USA',
  active_lat DOUBLE PRECISION NOT NULL DEFAULT 37.4529,
  active_lng DOUBLE PRECISION NOT NULL DEFAULT -122.1817,
  koppen_code VARCHAR(4) NOT NULL DEFAULT 'Csb',
  koppen_biome koppen_biome_enum NOT NULL DEFAULT 'mediterranean',

  -- Gamification & 3D Eco-Island State
  eco_xp INTEGER NOT NULL DEFAULT 0 CHECK (eco_xp >= 0),
  island_level SMALLINT NOT NULL DEFAULT 1 CHECK (island_level BETWEEN 1 AND 5),
  total_co2_saved_kg NUMERIC(12, 3) NOT NULL DEFAULT 0.000,
  total_water_harvested_l NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_materials_diverted_kg NUMERIC(12, 3) NOT NULL DEFAULT 0.000,
  unlocked_island_modules JSONB NOT NULL DEFAULT '["base_plot", "sorting_bins"]'::jsonb,

  -- Per-User Daily AI Quota Tracking
  daily_scan_count SMALLINT NOT NULL DEFAULT 0,
  daily_council_count SMALLINT NOT NULL DEFAULT 0,
  daily_imagine_count SMALLINT NOT NULL DEFAULT 0,
  quota_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SPATIAL SCANS (SAM 3.1 + Muse Spark + Muse Image)
CREATE TABLE IF NOT EXISTS public.spatial_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scan_mode scan_mode_enum NOT NULL DEFAULT 'waste_valorization',

  image_sha256 CHAR(64) NOT NULL,
  image_dhash CHAR(16) NOT NULL,
  source_image_url TEXT NOT NULL,
  retrofit_image_url TEXT,

  sam_masks JSONB NOT NULL DEFAULT '[]'::jsonb,
  muse_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  open_weight_audit JSONB NOT NULL DEFAULT '{}'::jsonb,

  estimated_value_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  local_currency CHAR(3) NOT NULL DEFAULT 'USD',
  estimated_value_local NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  co2_diverted_kg NUMERIC(10, 3) NOT NULL DEFAULT 0.000,
  xp_awarded INTEGER NOT NULL DEFAULT 25,

  cache_hit BOOLEAN NOT NULL DEFAULT FALSE,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SITE ASSESSMENTS (Global 3D Radar & Deterministic Calculator)
CREATE TABLE IF NOT EXISTS public.site_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  address_label TEXT NOT NULL,
  country_code CHAR(2) NOT NULL DEFAULT 'US',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  geom GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
  ) STORED,

  koppen_code VARCHAR(4) NOT NULL,
  koppen_biome koppen_biome_enum NOT NULL,
  annual_rainfall_mm NUMERIC(8, 2) NOT NULL,
  daily_solar_ghi_kwh_m2 NUMERIC(5, 2) NOT NULL,
  current_temp_c NUMERIC(5, 2) NOT NULL,
  current_aqi SMALLINT NOT NULL,

  roof_area_m2 NUMERIC(8, 2) NOT NULL CHECK (roof_area_m2 > 0),
  roof_material VARCHAR(32) NOT NULL DEFAULT 'concrete_tile',
  yard_area_m2 NUMERIC(8, 2) NOT NULL DEFAULT 0,
  monthly_bill_usd NUMERIC(10, 2) NOT NULL DEFAULT 120.00,

  solar_kwp_capacity NUMERIC(8, 2) NOT NULL,
  solar_annual_kwh NUMERIC(10, 2) NOT NULL,
  solar_annual_savings_usd NUMERIC(10, 2) NOT NULL,
  rainwater_annual_liters NUMERIC(12, 2) NOT NULL,
  recommended_cistern_liters INTEGER NOT NULL,
  recommended_biopore_count SMALLINT NOT NULL,
  co2_offset_tonnes_yr NUMERIC(8, 3) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. COUNCIL SESSIONS (Multi-Agent Deliberation)
CREATE TABLE IF NOT EXISTS public.council_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  site_assessment_id UUID REFERENCES public.site_assessments(id) ON DELETE SET NULL,
  scan_id UUID REFERENCES public.spatial_scans(id) ON DELETE SET NULL,

  user_prompt TEXT NOT NULL,
  voice_transcript TEXT,

  site_brief_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  gaia_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  ares_critique JSONB NOT NULL DEFAULT '{}'::jsonb,
  vulcan_blueprint JSONB NOT NULL DEFAULT '{}'::jsonb,
  themis_audit JSONB NOT NULL DEFAULT '{}'::jsonb,

  themis_verified BOOLEAN NOT NULL DEFAULT TRUE,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  estimated_cost_usd NUMERIC(8, 5) NOT NULL DEFAULT 0.00000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ACADEMY PROOFS (Verifiable Field-Action Academy)
CREATE TABLE IF NOT EXISTS public.academy_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  module_slug VARCHAR(64) NOT NULL,
  module_title TEXT NOT NULL,

  before_image_url TEXT NOT NULL,
  after_image_url TEXT NOT NULL,
  before_dhash CHAR(16) NOT NULL,
  after_dhash CHAR(16) NOT NULL,

  sam_verification_masks JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence_score NUMERIC(4, 3) NOT NULL CHECK (confidence_score BETWEEN 0 AND 1),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_rationale TEXT NOT NULL,

  xp_awarded INTEGER NOT NULL DEFAULT 150,
  unlocked_module VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_user_after_dhash UNIQUE (user_id, after_dhash)
);

-- 7. CIRCULAR HUBS (PostGIS Spatial Index)
CREATE TABLE IF NOT EXISTS public.circular_hubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  osm_id BIGINT UNIQUE,
  name TEXT NOT NULL,
  category hub_category_enum NOT NULL,
  city_name TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  geom GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
  ) STORED,
  accepted_materials TEXT[] NOT NULL DEFAULT '{}',
  Incentive_notes TEXT,
  verified_partner BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_circular_hubs_geom ON public.circular_hubs USING GIST (geom);

-- 8. AI CREDIT LEDGER (7-Layer AI Credit Shield)
CREATE TABLE IF NOT EXISTS public.ai_credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  client_ip_hash CHAR(64) NOT NULL,
  endpoint VARCHAR(64) NOT NULL,
  meta_model VARCHAR(64) NOT NULL,
  is_judge_session BOOLEAN NOT NULL DEFAULT FALSE,
  cache_hit BOOLEAN NOT NULL DEFAULT FALSE,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  estimated_cost_usd NUMERIC(8, 5) NOT NULL DEFAULT 0.00000,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spatial_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.council_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circular_hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_credit_ledger ENABLE ROW LEVEL SECURITY;
