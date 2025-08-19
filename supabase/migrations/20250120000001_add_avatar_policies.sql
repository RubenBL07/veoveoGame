-- Add policies for avatar uploads in game-photos bucket
CREATE POLICY "Users can upload avatars" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'game-photos' AND
  name LIKE 'avatars/' || auth.uid()::text || '/%'
);

CREATE POLICY "Users can update avatars" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'game-photos' AND
  name LIKE 'avatars/' || auth.uid()::text || '/%'
);

CREATE POLICY "Users can delete avatars" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'game-photos' AND
  name LIKE 'avatars/' || auth.uid()::text || '/%'
);