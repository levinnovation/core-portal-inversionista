-- Restore EXECUTE on has_role for authenticated users so RLS policies can evaluate it
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;