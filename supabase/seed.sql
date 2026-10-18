-- ====================================================================
-- FASALSETU: Seed Data Script
-- Populates Crop Reference, Demo Profiles, Farms, Crops, and Passports
-- ====================================================================

-- 1. Insert Crop Reference Data (ICAR / SAU baselines)
INSERT INTO public.crop_reference (
  id, crop_name, name_hi, category, suitable_seasons, suitable_soil_types,
  indicative_water_req_kl_per_acre, indicative_yield_per_acre_quintals,
  indicative_cost_per_acre_rs, indicative_market_price_per_quintal_rs,
  duration_days, expected_harvest_window, suitability_notes, risks, source_or_assumption
) VALUES
(
  'chana', 'Chana (Bengal Gram)', 'चना (देसी / काबुली)', 'Pulses',
  ARRAY['Rabi'], ARRAY['Black Soil', 'Loamy Soil', 'Clay Loam'],
  1100, 8.5, 14500, 5850, 110, 'Feb - Mar',
  'Deep root system, drought tolerant, enriches soil nitrogen.',
  ARRAY['Pod borer attack during flowering', 'Frost risk in northern plains'],
  'ICAR-IIPR Kanpur Agronomy & Agmarknet Mandi averages'
),
(
  'tomato', 'Tomato (Hybrid)', 'टमाटर', 'Vegetables',
  ARRAY['Rabi', 'Zaid', 'Kharif'], ARRAY['Loamy Soil', 'Sandy Loam', 'Black Soil'],
  900, 160.0, 38000, 1400, 120, 'Nov - Jan / Mar - May',
  'High cash flow, best with drip fertigation and plastic mulching.',
  ARRAY['Market price volatility', 'Early blight during humid spells'],
  'State Horticulture Dept & NHB benchmarks'
),
(
  'mustard', 'Mustard (Sarson)', 'सरसों', 'Oilseeds',
  ARRAY['Rabi'], ARRAY['Loamy Soil', 'Sandy Loam', 'Alluvial Soil'],
  1000, 7.5, 12500, 5650, 115, 'Feb - Mar',
  'Moderate water requirement, steady MSP support.',
  ARRAY['Aphid infestation during pod filling', 'Sclerotinia stem rot'],
  'ICAR-DRMR Bharatpur & MSP Gazette'
),
(
  'onion', 'Rabi Onion', 'प्याज (रबी)', 'Vegetables',
  ARRAY['Rabi'], ARRAY['Sandy Loam', 'Loamy Soil', 'Red Soil'],
  1300, 120.0, 42000, 1800, 135, 'Apr - May',
  'Strong storage potential, good market liquidity, responsive to micro-irrigation.',
  ARRAY['Thrips and purple blotch', 'Storage rot if harvested damp'],
  'ICAR-DOGR Rajgurunagar'
) ON CONFLICT (id) DO NOTHING;
