-- ====================================================================
-- FASALSETU: Water-Aware Crop Planning & Verified Crop Passport Schema
-- PostgreSQL / Supabase Migration
-- ====================================================================

-- 1. PROFILES (Farmers, Buyers, Reviewers)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('farmer', 'buyer', 'admin')),
  full_name TEXT NOT NULL,
  public_display_name TEXT NOT NULL,
  preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi')),
  phone TEXT,
  email TEXT,
  state TEXT,
  district TEXT,
  locality TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. FARMS (Farm plots belonging to farmers)
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  locality TEXT,
  area NUMERIC(10, 2) NOT NULL CHECK (area > 0),
  area_unit TEXT NOT NULL DEFAULT 'acres' CHECK (area_unit IN ('acres', 'hectares')),
  soil_type TEXT NOT NULL,
  irrigation_method TEXT NOT NULL CHECK (irrigation_method IN ('Drip', 'Sprinkler', 'Canal / Flood', 'Borewell / Tube', 'Rainfed')),
  water_availability TEXT NOT NULL CHECK (water_availability IN ('High', 'Medium', 'Low', 'Critical / Scanty')),
  water_storage_capacity_kl NUMERIC(12, 2) DEFAULT 5000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CROP REFERENCE DATA (Agronomic baselines based on ICAR & State Agri University)
CREATE TABLE IF NOT EXISTS public.crop_reference (
  id TEXT PRIMARY KEY,
  crop_name TEXT NOT NULL,
  name_hi TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Pulses', 'Cereals', 'Oilseeds', 'Vegetables', 'Cash Crops')),
  suitable_seasons TEXT[] NOT NULL,
  suitable_soil_types TEXT[] NOT NULL,
  indicative_water_req_kl_per_acre NUMERIC(10, 2) NOT NULL,
  indicative_yield_per_acre_quintals NUMERIC(10, 2) NOT NULL,
  indicative_cost_per_acre_rs NUMERIC(10, 2) NOT NULL,
  indicative_market_price_per_quintal_rs NUMERIC(10, 2) NOT NULL,
  duration_days INT NOT NULL,
  expected_harvest_window TEXT NOT NULL,
  suitability_notes TEXT,
  risks TEXT[],
  source_or_assumption TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CROP PLANS (Pre-sowing water & profit plans)
CREATE TABLE IF NOT EXISTS public.crop_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  season TEXT NOT NULL CHECK (season IN ('Kharif', 'Rabi', 'Zaid')),
  total_area NUMERIC(10, 2) NOT NULL,
  water_budget_kl NUMERIC(12, 2) NOT NULL,
  objective TEXT NOT NULL CHECK (objective IN ('profit', 'water', 'balanced')),
  plan_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CROP RECORDS (Active field records)
CREATE TABLE IF NOT EXISTS public.crop_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  crop_name_hi TEXT,
  variety TEXT,
  planting_date DATE NOT NULL,
  expected_harvest_date DATE NOT NULL,
  actual_harvest_date DATE,
  cultivated_area NUMERIC(10, 2) NOT NULL CHECK (cultivated_area > 0),
  cultivated_area_unit TEXT NOT NULL DEFAULT 'acres' CHECK (cultivated_area_unit IN ('acres', 'hectares')),
  estimated_quantity NUMERIC(12, 2) NOT NULL CHECK (estimated_quantity >= 0),
  quantity_unit TEXT NOT NULL DEFAULT 'Quintals' CHECK (quantity_unit IN ('Quintals', 'Tonnes', 'Kg')),
  expected_price_per_unit NUMERIC(10, 2) NOT NULL,
  growth_stage TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Harvested', 'Archived')),
  public_id TEXT NOT NULL UNIQUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CROP LOGS (Daily / periodic activity records)
CREATE TABLE IF NOT EXISTS public.crop_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_record_id UUID NOT NULL REFERENCES public.crop_records(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_date TIMESTAMPTZ NOT NULL,
  water_volume_kl NUMERIC(10, 2),
  description TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. CROP EVIDENCE (Photographs with agronomist audit status)
CREATE TABLE IF NOT EXISTS public.crop_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_record_id UUID NOT NULL REFERENCES public.crop_records(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  capture_date DATE,
  upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  growth_stage TEXT NOT NULL,
  review_status TEXT NOT NULL DEFAULT 'Pending Review' CHECK (review_status IN ('Uploaded', 'Pending Review', 'Approved as Supporting Evidence', 'Rejected', 'Resubmission Requested')),
  reviewer_id UUID REFERENCES public.profiles(id),
  reviewer_name TEXT,
  reviewed_at TIMESTAMPTZ,
  review_note TEXT,
  public_sharing_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. PASSPORT RECORDS (Consolidated digital passport & 100-point score)
CREATE TABLE IF NOT EXISTS public.passport_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_record_id UUID NOT NULL REFERENCES public.crop_records(id) ON DELETE CASCADE UNIQUE,
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  public_id TEXT NOT NULL UNIQUE,
  public_sharing_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  score NUMERIC(5, 2) NOT NULL CHECK (score >= 0 AND score <= 100),
  score_breakdown JSONB NOT NULL,
  score_method_version TEXT NOT NULL,
  score_calculated_at TIMESTAMPTZ NOT NULL,
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. CROP LISTINGS (Pre-harvest produce marketplace)
CREATE TABLE IF NOT EXISTS public.crop_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  crop_record_id UUID NOT NULL REFERENCES public.crop_records(id) ON DELETE CASCADE,
  passport_record_id UUID NOT NULL REFERENCES public.passport_records(id) ON DELETE CASCADE,
  public_passport_id TEXT NOT NULL,
  crop_name TEXT NOT NULL,
  quantity_available NUMERIC(12, 2) NOT NULL CHECK (quantity_available >= 0),
  quantity_unit TEXT NOT NULL DEFAULT 'Quintals',
  expected_price NUMERIC(10, 2) NOT NULL,
  expected_harvest_date DATE NOT NULL,
  general_location TEXT NOT NULL,
  public_description TEXT NOT NULL,
  sample_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Partially Booked', 'Fully Booked', 'Closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. BUYER REQUIREMENTS (Institutional buyer demand)
CREATE TABLE IF NOT EXISTS public.buyer_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  crop_name TEXT NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL,
  quantity_unit TEXT NOT NULL DEFAULT 'Quintals',
  target_price NUMERIC(10, 2) NOT NULL,
  required_date DATE NOT NULL,
  location TEXT NOT NULL,
  min_passport_score INT DEFAULT 0,
  requirements TEXT,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Matched', 'Fulfilled', 'Closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. BOOKING REQUESTS (Pre-harvest orders from buyers)
CREATE TABLE IF NOT EXISTS public.booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.crop_listings(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  requested_quantity NUMERIC(12, 2) NOT NULL CHECK (requested_quantity > 0),
  quantity_unit TEXT NOT NULL DEFAULT 'Quintals',
  proposed_price NUMERIC(10, 2) NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_location TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Under Discussion', 'Accepted', 'Rejected', 'Cancelled', 'Fulfilled')),
  status_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. BOOKING EVENTS (Audit trail of contract status transitions)
CREATE TABLE IF NOT EXISTS public.booking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_request_id UUID NOT NULL REFERENCES public.booking_requests(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.profiles(id),
  actor_role TEXT NOT NULL,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  event_note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. EVIDENCE REVIEW EVENTS (Audit trail of agronomist reviews)
CREATE TABLE IF NOT EXISTS public.evidence_review_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id UUID NOT NULL REFERENCES public.crop_evidence(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  review_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. WEATHER SNAPSHOTS (Agrometeorology caching)
CREATE TABLE IF NOT EXISTS public.weather_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_reference TEXT NOT NULL,
  forecast_data JSONB NOT NULL,
  source TEXT NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passport_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- Public can read passport_records ONLY IF public_sharing_enabled = true
CREATE POLICY "Public read passports" ON public.passport_records
  FOR SELECT USING (public_sharing_enabled = true);

-- Public can read marketplace listings
CREATE POLICY "Public read listings" ON public.crop_listings
  FOR SELECT USING (status != 'Closed');

-- Farmers can manage only their own data
CREATE POLICY "Farmers manage own crops" ON public.crop_records
  FOR ALL USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers manage own logs" ON public.crop_logs
  FOR ALL USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers manage own evidence" ON public.crop_evidence
  FOR ALL USING (auth.uid() = farmer_id);

-- Authorized reviewers / admins can update review status
CREATE POLICY "Admins review evidence" ON public.crop_evidence
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
