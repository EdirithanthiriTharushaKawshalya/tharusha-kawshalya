-- Run once in Supabase Dashboard > SQL Editor before using research paper uploads.
-- Follows the site's existing model: authenticated accounts are administrators.
BEGIN;

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS research_paper_url TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('research-papers', 'research-papers', true, 20971520, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Admins upload research papers" ON storage.objects;
CREATE POLICY "Admins upload research papers" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'research-papers');

DROP POLICY IF EXISTS "Admins read research paper objects" ON storage.objects;
CREATE POLICY "Admins read research paper objects" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'research-papers');

DROP POLICY IF EXISTS "Admins delete research papers" ON storage.objects;
CREATE POLICY "Admins delete research papers" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'research-papers');

COMMIT;
