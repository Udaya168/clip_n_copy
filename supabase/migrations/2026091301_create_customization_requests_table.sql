-- Migration: Create customization_requests table, RPC, and RLS policies
CREATE TABLE IF NOT EXISTS public.customization_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  file_name TEXT,
  file_path TEXT,
  file_url TEXT,
  customization_type TEXT,
  title TEXT,
  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending',
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.customization_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "customization_requests_select_policy" ON public.customization_requests;
CREATE POLICY "customization_requests_select_policy" ON public.customization_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "customization_requests_insert_policy" ON public.customization_requests;
CREATE POLICY "customization_requests_insert_policy" ON public.customization_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "customization_requests_update_policy" ON public.customization_requests;
CREATE POLICY "customization_requests_update_policy" ON public.customization_requests FOR UPDATE USING (true) WITH CHECK (true);

-- SECURITY DEFINER RPC helper for inserting customization requests
CREATE OR REPLACE FUNCTION public.create_customization_request(
  p_user_id UUID,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_file_name TEXT,
  p_file_path TEXT,
  p_file_url TEXT,
  p_customization_type TEXT,
  p_title TEXT,
  p_quantity INTEGER
)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  email_sent BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_created_at TIMESTAMPTZ;
BEGIN
  INSERT INTO public.customization_requests (
    user_id,
    customer_name,
    customer_email,
    customer_phone,
    file_name,
    file_path,
    file_url,
    customization_type,
    title,
    quantity,
    status,
    email_sent
  ) VALUES (
    p_user_id,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_file_name,
    p_file_path,
    p_file_url,
    p_customization_type,
    p_title,
    COALESCE(p_quantity, 1),
    'pending',
    false
  )
  RETURNING customization_requests.id, customization_requests.created_at INTO v_id, v_created_at;

  RETURN QUERY SELECT v_id, v_created_at, false;
END;
$$;
