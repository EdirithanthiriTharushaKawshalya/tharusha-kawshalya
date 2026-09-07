-- ====================================================================
-- Supabase Setup Script for Photography Feature & Site Settings
-- Run this in your Supabase Project Dashboard -> SQL Editor -> New Query -> Run
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


-- 2. Create photography_photos table (supports both UUIDs and custom string IDs)
CREATE TABLE IF NOT EXISTS public.photography_photos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
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


-- 3. Storage Policies for 'projects' bucket (ensures photo uploads work smoothly)
DROP POLICY IF EXISTS "Allow authenticated uploads to projects bucket" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to projects bucket"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'projects');

DROP POLICY IF EXISTS "Allow authenticated manage projects bucket" ON storage.objects;
CREATE POLICY "Allow authenticated manage projects bucket"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'projects');

DROP POLICY IF EXISTS "Allow public read projects bucket" ON storage.objects;
CREATE POLICY "Allow public read projects bucket"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'projects');


-- 4. Initial Default Settings (Optional initial seeding)
INSERT INTO public.site_settings (key, value)
VALUES (
  'photography_settings', 
  '{
    "show_photography": true,
    "tiktok_url": "https://www.tiktok.com/@tkedirithanthiri?_r=1&_t=ZS-99XMs48xnm9",
    "facebook_url": "https://www.facebook.com/share/18KDu9sEeb/",
    "tagline": "Exploring visual rhythm, editorial portraiture, and candid street geometry through a cinematic lens."
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Done! Your photography gallery, cloud sync, and storage are ready in Supabase.
