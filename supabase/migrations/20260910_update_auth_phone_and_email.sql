-- Migration for Phone + Email Dual Auth System
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- Helper RPC to lookup email by phone for phone+password authentication
CREATE OR REPLACE FUNCTION public.get_email_by_phone(p_phone text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_clean text;
BEGIN
  v_clean := regexp_replace(p_phone, '\D', '', 'g');
  
  -- Search profiles by full phone or digits
  SELECT email INTO v_email FROM public.profiles 
  WHERE phone = p_phone 
     OR regexp_replace(COALESCE(phone, ''), '\D', '', 'g') = v_clean
     OR (length(v_clean) >= 10 AND regexp_replace(COALESCE(phone, ''), '\D', '', 'g') LIKE '%' || right(v_clean, 10))
  LIMIT 1;

  IF v_email IS NOT NULL AND v_email <> '' THEN
    RETURN v_email;
  END IF;

  -- Search auth.users as fallback
  SELECT email INTO v_email FROM auth.users 
  WHERE phone = p_phone 
     OR regexp_replace(COALESCE(phone, ''), '\D', '', 'g') = v_clean
  LIMIT 1;

  RETURN v_email;
END;
$$;

-- Helper RPC to check if email or phone already exists for signup uniqueness check
CREATE OR REPLACE FUNCTION public.check_user_exists(p_email text, p_phone text)
RETURNS TABLE (email_exists boolean, phone_exists boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clean_phone text;
  v_e_exists boolean;
  v_p_exists boolean;
BEGIN
  v_clean_phone := regexp_replace(p_phone, '\D', '', 'g');

  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE lower(email) = lower(p_email)
    UNION
    SELECT 1 FROM auth.users WHERE lower(email) = lower(p_email)
  ) INTO v_e_exists;

  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE phone = p_phone 
       OR (length(v_clean_phone) >= 10 AND right(regexp_replace(COALESCE(phone, ''), '\D', '', 'g'), 10) = right(v_clean_phone, 10))
    UNION
    SELECT 1 FROM auth.users 
    WHERE phone = p_phone 
       OR (length(v_clean_phone) >= 10 AND right(regexp_replace(COALESCE(phone, ''), '\D', '', 'g'), 10) = right(v_clean_phone, 10))
  ) INTO v_p_exists;

  RETURN QUERY SELECT v_e_exists, v_p_exists;
END;
$$;
