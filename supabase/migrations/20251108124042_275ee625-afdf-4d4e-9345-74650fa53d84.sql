-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own files
CREATE POLICY "Users can upload their own attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own files
CREATE POLICY "Users can view their own attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public access to all chat attachments
CREATE POLICY "Public access to chat attachments"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'chat-attachments');