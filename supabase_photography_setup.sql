-- ====================================================================
-- Supabase Setup Script for Photography Feature & Site Settings
-- Run this in your Supabase Project Dashboard -> SQL Editor -> Run
-- ====================================================================

-- 1. Create site_settings table (for toggles like show_photography, social links, etc.)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to site_settings (so visitors and Navbar can check toggles)
DROP POLICY IF EXISTS "Allow public read on site_settings" ON public.site_settings;
CREATE POLICY "Allow public read on site_settings" 
  ON public.site_settings 
  FOR SELECT 
  USING (true);

-- Allow authenticated users (Admin) full access to update site_settings
DROP POLICY IF EXISTS "Allow authenticated users to manage site_settings" ON public.site_settings;
CREATE POLICY "Allow authenticated users to manage site_settings" 
  ON public.site_settings 
  FOR ALL 
  USING (auth.role() = 'authenticated');


-- 2. Create photography_photos table
CREATE TABLE IF NOT EXISTS public.photography_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Portraits',
  image TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for photography_photos
ALTER TABLE public.photography_photos ENABLE ROW LEVEL SECURITY;

-- Allow public read access to photography photos
DROP POLICY IF EXISTS "Allow public read on photography_photos" ON public.photography_photos;
CREATE POLICY "Allow public read on photography_photos" 
  ON public.photography_photos 
  FOR SELECT 
  USING (true);

-- Allow authenticated users (Admin) full access to insert, update, delete photos
DROP POLICY IF EXISTS "Allow authenticated users to manage photography_photos" ON public.photography_photos;
CREATE POLICY "Allow authenticated users to manage photography_photos" 
  ON public.photography_photos 
  FOR ALL 
  USING (auth.role() = 'authenticated');


-- 3. Initial Default Settings (Optional initial seeding)
INSERT INTO public.site_settings (key, value)
VALUES (
  'photography_settings', 
  '{
    "show_photography": true,
    "tiktok_url": "https://www.tiktok.com/@tharushakawshalya",
    "facebook_url": "https://www.facebook.com/tharushakawshalya",
    "tagline": "Capturing timeless emotions, street geometry, and authentic portraits with cinematic color science."
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Done! Your photography gallery and toggle are ready in Supabase.
