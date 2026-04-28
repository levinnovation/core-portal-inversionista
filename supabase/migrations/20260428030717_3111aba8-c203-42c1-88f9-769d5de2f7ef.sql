
-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('project-photos', 'project-photos', true),
  ('documents', 'documents', false),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ============ project-photos policies (public read, admin write) ============
CREATE POLICY "Public read project photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-photos');

CREATE POLICY "Admins upload project photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update project photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'project-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete project photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'project-photos' AND public.has_role(auth.uid(), 'admin'));

-- ============ avatars policies (public read, user manages own) ============
CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============ documents policies (admins manage; users see linked docs) ============
CREATE POLICY "Admins manage documents storage"
ON storage.objects FOR ALL
USING (bucket_id = 'documents' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'documents' AND public.has_role(auth.uid(), 'admin'));

-- Authenticated users can read documents (RLS on the documents table controls visibility metadata)
CREATE POLICY "Authenticated read documents storage"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- ============ Auto-assign roles when investor/customer record is linked ============
CREATE OR REPLACE FUNCTION public.assign_investor_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'investor')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_customer_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'customer')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_assign_investor_role
AFTER INSERT OR UPDATE OF user_id ON public.investors
FOR EACH ROW EXECUTE FUNCTION public.assign_investor_role();

CREATE TRIGGER trg_assign_customer_role
AFTER INSERT OR UPDATE OF user_id ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.assign_customer_role();

-- ============ Notifications table ============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
ON public.notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications"
ON public.notifications FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Admins manage notifications"
ON public.notifications FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow customers to see their projects via existing project unit relationship (already covered)
