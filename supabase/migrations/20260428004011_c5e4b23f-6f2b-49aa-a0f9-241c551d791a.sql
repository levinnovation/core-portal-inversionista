
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'investor', 'customer');
CREATE TYPE public.project_status AS ENUM ('planning', 'pre_construction', 'construction', 'completed');
CREATE TYPE public.unit_status AS ENUM ('available', 'reserved', 'sold');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'overdue');
CREATE TYPE public.investment_type AS ENUM ('equity', 'debt', 'preferred');
CREATE TYPE public.distribution_type AS ENUM ('preferred_return', 'catch_up', 'carried_interest', 'return_of_capital');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ============ PROJECTS ============
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  type TEXT,
  total_units INT DEFAULT 0,
  total_sqft NUMERIC,
  budget_total NUMERIC,
  status project_status NOT NULL DEFAULT 'planning',
  start_date DATE,
  estimated_delivery DATE,
  cover_image_url TEXT,
  description TEXT,
  quickbase_record_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.project_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  phase_name TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  completion_percentage NUMERIC NOT NULL DEFAULT 0,
  estimated_start DATE,
  actual_start DATE,
  estimated_end DATE,
  actual_end DATE,
  photos TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.project_phases ENABLE ROW LEVEL SECURITY;

-- ============ UNITS ============
CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  floor INT,
  sqft NUMERIC,
  bedrooms INT,
  bathrooms INT,
  price_total NUMERIC,
  status unit_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

-- ============ INVESTORS ============
CREATE TABLE public.investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  id_number TEXT,
  kyc_status TEXT DEFAULT 'pending',
  accreditation_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES public.investors(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  amount_invested NUMERIC NOT NULL,
  investment_date DATE NOT NULL,
  investment_type investment_type NOT NULL DEFAULT 'equity',
  ownership_percentage NUMERIC,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id UUID NOT NULL REFERENCES public.investments(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  distribution_date DATE NOT NULL,
  type distribution_type NOT NULL DEFAULT 'preferred_return',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.distributions ENABLE ROW LEVEL SECURITY;

-- ============ CUSTOMERS ============
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  id_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  sale_date DATE NOT NULL,
  price_agreed NUMERIC NOT NULL,
  payment_plan JSONB,
  financing_bank TEXT,
  financing_amount NUMERIC,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status payment_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  quickbase_record_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ============ DOCUMENTS ============
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  doc_type TEXT NOT NULL,
  name TEXT,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- ============ SYNC LOGS ============
CREATE TABLE public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  direction TEXT NOT NULL,
  entity_type TEXT,
  records_processed INT DEFAULT 0,
  records_failed INT DEFAULT 0,
  error_details JSONB,
  initiated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- ============ TRIGGER: AUTO-CREATE PROFILE ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ RLS POLICIES ============

-- profiles
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- projects: investors/customers see projects they're linked to; admins see all
CREATE POLICY "Admins manage projects" ON public.projects FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Investors view their projects" ON public.projects FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.investments inv
    JOIN public.investors i ON i.id = inv.investor_id
    WHERE inv.project_id = projects.id AND i.user_id = auth.uid()
  )
);
CREATE POLICY "Customers view their projects" ON public.projects FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.sales s
    JOIN public.units u ON u.id = s.unit_id
    JOIN public.customers c ON c.id = s.customer_id
    WHERE u.project_id = projects.id AND c.user_id = auth.uid()
  )
);

-- project_phases
CREATE POLICY "Admins manage phases" ON public.project_phases FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Linked users view phases" ON public.project_phases FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.investments inv JOIN public.investors i ON i.id = inv.investor_id
    WHERE inv.project_id = project_phases.project_id AND i.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.sales s JOIN public.units u ON u.id = s.unit_id JOIN public.customers c ON c.id = s.customer_id
    WHERE u.project_id = project_phases.project_id AND c.user_id = auth.uid()
  )
);

-- units
CREATE POLICY "Admins manage units" ON public.units FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customers view their unit" ON public.units FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.sales s JOIN public.customers c ON c.id = s.customer_id
    WHERE s.unit_id = units.id AND c.user_id = auth.uid()
  )
);

-- investors
CREATE POLICY "Admins manage investors" ON public.investors FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Investors view own record" ON public.investors FOR SELECT USING (user_id = auth.uid());

-- investments
CREATE POLICY "Admins manage investments" ON public.investments FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Investors view own investments" ON public.investments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.investors i WHERE i.id = investments.investor_id AND i.user_id = auth.uid())
);

-- distributions
CREATE POLICY "Admins manage distributions" ON public.distributions FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Investors view own distributions" ON public.distributions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.investments inv JOIN public.investors i ON i.id = inv.investor_id
    WHERE inv.id = distributions.investment_id AND i.user_id = auth.uid()
  )
);

-- customers
CREATE POLICY "Admins manage customers" ON public.customers FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customers view own record" ON public.customers FOR SELECT USING (user_id = auth.uid());

-- sales
CREATE POLICY "Admins manage sales" ON public.sales FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customers view own sales" ON public.sales FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.customers c WHERE c.id = sales.customer_id AND c.user_id = auth.uid())
);

-- payments
CREATE POLICY "Admins manage payments" ON public.payments FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Customers view own payments" ON public.payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.sales s JOIN public.customers c ON c.id = s.customer_id
    WHERE s.id = payments.sale_id AND c.user_id = auth.uid()
  )
);

-- documents
CREATE POLICY "Admins manage documents" ON public.documents FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view own documents" ON public.documents FOR SELECT USING (uploaded_by = auth.uid());

-- sync_logs (admin only)
CREATE POLICY "Admins view sync logs" ON public.sync_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins create sync logs" ON public.sync_logs FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
