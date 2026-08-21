CREATE POLICY "Investors view documents of their holdings"
ON public.documents FOR SELECT TO authenticated
USING (
  (entity_type = 'investment' AND entity_id IN (
     SELECT iv.id FROM public.investments iv
     JOIN public.investors i ON i.id = iv.investor_id
     WHERE i.user_id = auth.uid()))
  OR (entity_type = 'project' AND entity_id IN (
     SELECT iv.project_id FROM public.investments iv
     JOIN public.investors i ON i.id = iv.investor_id
     WHERE i.user_id = auth.uid()))
  OR (entity_type = 'investor' AND entity_id IN (
     SELECT i.id FROM public.investors i WHERE i.user_id = auth.uid()))
);

CREATE POLICY "Customers view documents of their purchase"
ON public.documents FOR SELECT TO authenticated
USING (
  (entity_type = 'sale' AND entity_id IN (
     SELECT s.id FROM public.sales s
     JOIN public.customers c ON c.id = s.customer_id
     WHERE c.user_id = auth.uid()))
  OR (entity_type = 'unit' AND entity_id IN (
     SELECT s.unit_id FROM public.sales s
     JOIN public.customers c ON c.id = s.customer_id
     WHERE c.user_id = auth.uid()))
  OR (entity_type = 'project' AND entity_id IN (
     SELECT u.project_id FROM public.sales s
     JOIN public.customers c ON c.id = s.customer_id
     JOIN public.units u ON u.id = s.unit_id
     WHERE c.user_id = auth.uid()))
  OR (entity_type = 'customer' AND entity_id IN (
     SELECT c.id FROM public.customers c WHERE c.user_id = auth.uid()))
);