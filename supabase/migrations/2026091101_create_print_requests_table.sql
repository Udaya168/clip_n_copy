-- Migration: Create print_requests table, RPC, and RLS policies
CREATE TABLE IF NOT EXISTS public.print_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT,
  print_type TEXT NOT NULL,
  copies INTEGER NOT NULL DEFAULT 1,
  paper TEXT NOT NULL,
  finishing TEXT DEFAULT 'None',
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  email_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.print_requests ENABLE ROW LEVEL SECURITY;

-- Allow SELECT for all
DROP POLICY IF EXISTS "print_requests_select_policy" ON public.print_requests;
CREATE POLICY "print_requests_select_policy" ON public.print_requests FOR SELECT USING (true);

-- Allow INSERT for everyone (anon and authenticated users)
DROP POLICY IF EXISTS "print_requests_insert_policy" ON public.print_requests;
CREATE POLICY "print_requests_insert_policy" ON public.print_requests FOR INSERT WITH CHECK (true);

-- Allow UPDATE for everyone
DROP POLICY IF EXISTS "print_requests_update_policy" ON public.print_requests;
CREATE POLICY "print_requests_update_policy" ON public.print_requests FOR UPDATE USING (true) WITH CHECK (true);

-- SECURITY DEFINER RPC helper for inserting print requests
CREATE OR REPLACE FUNCTION public.create_print_request(
  p_user_id UUID,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_file_name TEXT,
  p_file_path TEXT,
  p_file_url TEXT,
  p_print_type TEXT,
  p_copies INTEGER,
  p_paper TEXT,
  p_finishing TEXT,
  p_total_amount NUMERIC
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
  INSERT INTO public.print_requests (
    user_id,
    customer_name,
    customer_email,
    customer_phone,
    file_name,
    file_path,
    file_url,
    print_type,
    copies,
    paper,
    finishing,
    total_amount,
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
    p_print_type,
    COALESCE(p_copies, 1),
    p_paper,
    COALESCE(p_finishing, 'None'),
    COALESCE(p_total_amount, 0),
    'pending',
    false
  )
  RETURNING print_requests.id, print_requests.created_at INTO v_id, v_created_at;

  RETURN QUERY SELECT v_id, v_created_at, false;
END;
$$;
