-- Migration: Create print-files bucket for Upload & Print document uploads

INSERT INTO storage.buckets (id, name, public)
VALUES ('print-files', 'print-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies: Allow public read access to print files
CREATE POLICY "Public Read Print Files"
ON storage.objects FOR SELECT
USING (bucket_id = 'print-files');

-- Allow authenticated and anonymous users to upload print request files
CREATE POLICY "Public Upload Print Files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'print-files');
