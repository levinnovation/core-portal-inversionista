CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS text_content text,
  ADD COLUMN IF NOT EXISTS indexed_at timestamptz;

CREATE TABLE IF NOT EXISTS public.document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  chunk_index int NOT NULL,
  content text NOT NULL,
  embedding vector(1536),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_chunks_doc ON public.document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding
  ON public.document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage chunks" ON public.document_chunks
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Investors: chunks de docs cuya entidad es un proyecto/inversion suya
CREATE POLICY "Investors view chunks of their docs" ON public.document_chunks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_chunks.document_id
        AND (
          d.uploaded_by = auth.uid()
          OR (d.entity_type = 'project' AND EXISTS (
            SELECT 1 FROM public.investments inv
            JOIN public.investors i ON i.id = inv.investor_id
            WHERE inv.project_id = d.entity_id AND i.user_id = auth.uid()
          ))
          OR (d.entity_type = 'investment' AND EXISTS (
            SELECT 1 FROM public.investments inv
            JOIN public.investors i ON i.id = inv.investor_id
            WHERE inv.id = d.entity_id AND i.user_id = auth.uid()
          ))
          OR (d.entity_type = 'unit' AND EXISTS (
            SELECT 1 FROM public.sales s
            JOIN public.customers c ON c.id = s.customer_id
            WHERE s.unit_id = d.entity_id AND c.user_id = auth.uid()
          ))
          OR (d.entity_type = 'sale' AND EXISTS (
            SELECT 1 FROM public.sales s
            JOIN public.customers c ON c.id = s.customer_id
            WHERE s.id = d.entity_id AND c.user_id = auth.uid()
          ))
        )
    )
  );

-- Vector search function (SECURITY INVOKER => respeta RLS del caller)
CREATE OR REPLACE FUNCTION public.match_document_chunks(
  query_embedding vector(1536),
  match_count int DEFAULT 6
)
RETURNS TABLE (
  chunk_id uuid,
  document_id uuid,
  content text,
  similarity float
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    dc.id AS chunk_id,
    dc.document_id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM public.document_chunks dc
  WHERE dc.embedding IS NOT NULL
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count
$$;

REVOKE EXECUTE ON FUNCTION public.match_document_chunks(vector, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.match_document_chunks(vector, int) TO authenticated;