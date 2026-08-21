CREATE TABLE public.project_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  report_date date NOT NULL,
  construction_month integer,
  progress_pct numeric,
  status_note text,
  units_total integer,
  units_sold integer,
  sales_pct numeric,
  revenue_projected numeric,
  sales_placed numeric,
  profit_actual numeric,
  profit_proforma numeric,
  irr_actual numeric,
  irr_proforma numeric,
  coc_actual numeric,
  coc_proforma numeric,
  delinquency_pct numeric,
  cost_budget_total numeric,
  cost_executed_pct numeric,
  expense_executed_pct numeric,
  financing_total numeric,
  financing_disbursed numeric,
  interest_rate numeric,
  loan_term text,
  equity_total numeric,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, report_date)
);

CREATE TABLE public.project_report_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.project_reports(id) ON DELETE CASCADE,
  section text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  label text,
  values jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_reports_project ON public.project_reports(project_id, report_date DESC);
CREATE INDEX idx_project_report_items_report ON public.project_report_items(report_id, section, order_index);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_reports TO authenticated;
GRANT ALL ON public.project_reports TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_report_items TO authenticated;
GRANT ALL ON public.project_report_items TO service_role;

ALTER TABLE public.project_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_report_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage project reports"
ON public.project_reports FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Investors read reports of their projects"
ON public.project_reports FOR SELECT TO authenticated
USING (
  published AND EXISTS (
    SELECT 1 FROM public.investments inv
    JOIN public.investors i ON i.id = inv.investor_id
    WHERE inv.project_id = project_reports.project_id AND i.user_id = auth.uid()
  )
);

CREATE POLICY "Admins manage project report items"
ON public.project_report_items FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Investors read report items of their projects"
ON public.project_report_items FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.project_reports r
    JOIN public.investments inv ON inv.project_id = r.project_id
    JOIN public.investors i ON i.id = inv.investor_id
    WHERE r.id = project_report_items.report_id AND r.published AND i.user_id = auth.uid()
  )
);