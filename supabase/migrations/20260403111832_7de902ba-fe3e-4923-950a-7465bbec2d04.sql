
-- Create templates table for user-uploaded templates
CREATE TABLE public.templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Custom',
  description text,
  thumbnail_url text,
  file_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own templates" ON public.templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own templates" ON public.templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own templates" ON public.templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own templates" ON public.templates FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for template files
INSERT INTO storage.buckets (id, name, public) VALUES ('templates', 'templates', true);

-- Storage policies
CREATE POLICY "Users can upload templates" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'templates' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own templates" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'templates' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own templates" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'templates' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Public can view template files" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'templates');
