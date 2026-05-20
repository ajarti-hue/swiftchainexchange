
-- 1. payment_methods: restrict to authenticated users
DROP POLICY IF EXISTS "Anyone can view active payment methods" ON public.payment_methods;
CREATE POLICY "Authenticated users view active payment methods"
ON public.payment_methods
FOR SELECT
TO authenticated
USING (active = true OR public.has_role(auth.uid(), 'admin'::app_role));

-- 2. chat-attachments bucket: make private
UPDATE storage.buckets SET public = false WHERE id = 'chat-attachments';

-- Drop old policies
DROP POLICY IF EXISTS "Public read chat attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload chat attachments" ON storage.objects;

-- INSERT: only into own user folder
CREATE POLICY "Users upload to own folder in chat-attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- SELECT: owner or admin
CREATE POLICY "Owner or admin reads chat-attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-attachments'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

-- DELETE: admin only
CREATE POLICY "Admins delete chat-attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat-attachments'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- UPDATE: admin only
CREATE POLICY "Admins update chat-attachments"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'chat-attachments'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- 3. Revoke EXECUTE on trigger function from public roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
