
-- Books table
CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Untitled Book',
  subtitle text,
  target_audience text,
  positioning text,
  tone text DEFAULT 'professional',
  depth text DEFAULT 'standard' CHECK (depth IN ('short', 'standard', 'detailed')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'complete', 'published')),
  description text,
  keywords text[],
  categories text[],
  author_name text,
  author_bio text,
  cover_direction jsonb DEFAULT '{}'::jsonb,
  front_matter jsonb DEFAULT '{}'::jsonb,
  back_matter jsonb DEFAULT '{}'::jsonb,
  strategy jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own books" ON public.books FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own books" ON public.books FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own books" ON public.books FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own books" ON public.books FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Chapters table
CREATE TABLE public.chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  chapter_number integer NOT NULL DEFAULT 0,
  title text NOT NULL DEFAULT 'Untitled Chapter',
  content text DEFAULT '',
  hook text,
  summary text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'complete', 'improved')),
  word_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own chapters" ON public.chapters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own chapters" ON public.chapters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chapters" ON public.chapters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chapters" ON public.chapters FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON public.chapters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generated assets (repurposed content)
CREATE TABLE public.generated_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  book_id uuid REFERENCES public.books(id) ON DELETE SET NULL,
  asset_type text NOT NULL CHECK (asset_type IN ('blog_post', 'social_media', 'newsletter', 'course_outline', 'video_script', 'sales_page')),
  title text NOT NULL,
  content text DEFAULT '',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.generated_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own assets" ON public.generated_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own assets" ON public.generated_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assets" ON public.generated_assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own assets" ON public.generated_assets FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.generated_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for books and chapters
ALTER PUBLICATION supabase_realtime ADD TABLE public.books;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chapters;
