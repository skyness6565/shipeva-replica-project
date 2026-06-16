
CREATE POLICY "admins read package files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('package-images','package-documents') AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins write package files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('package-images','package-documents') AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update package files" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('package-images','package-documents') AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete package files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('package-images','package-documents') AND public.has_role(auth.uid(),'admin'));
