-- AI chat history
CREATE TABLE public.ai_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  agent text NOT NULL DEFAULT 'investor',
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  content text NOT NULL,
  tokens int,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_ai_chat_user_created ON public.ai_chat_messages(user_id, created_at DESC);

CREATE POLICY "Users view own chat" ON public.ai_chat_messages
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users insert own chat" ON public.ai_chat_messages
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins view all chat" ON public.ai_chat_messages
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Audit logs (admin actions)
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_audit_actor_created ON public.audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_entity ON public.audit_logs(entity_type, entity_id);

CREATE POLICY "Admins view audit logs" ON public.audit_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated insert audit" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND actor_id = auth.uid());

-- Realtime for notifications + chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_chat_messages;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;