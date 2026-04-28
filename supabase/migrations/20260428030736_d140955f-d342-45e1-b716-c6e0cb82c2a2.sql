
-- Revoke direct execute on trigger functions (only the trigger itself runs them)
REVOKE EXECUTE ON FUNCTION public.assign_investor_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_customer_role() FROM PUBLIC, anon, authenticated;

-- Replace public-list policies with authenticated-only listing (URL access still works publicly via CDN)
DROP POLICY IF EXISTS "Public read project photos" ON storage.objects;
CREATE POLICY "Read project photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-photos' AND (auth.role() = 'authenticated' OR auth.role() = 'anon'));

DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars' AND (auth.role() = 'authenticated' OR auth.role() = 'anon'));
