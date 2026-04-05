ALTER TABLE public.books ADD COLUMN IF NOT EXISTS cover_url text;

INSERT INTO storage.buckets (id, name, public) VALUES ('book-covers', 'book-covers', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload book covers" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'book-covers');

CREATE POLICY "Public read book covers" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'book-covers');

CREATE POLICY "Users can manage own covers" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'book-covers');