-- ============================================================================
-- Create `public.addresses` Table & Row Level Security (RLS) Policies
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT NOT NULL,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_default ON public.addresses(user_id, is_default);

-- Enable RLS
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Drop existing if re-running to avoid errors)
DROP POLICY IF EXISTS "addresses_select_policy" ON public.addresses;
DROP POLICY IF EXISTS "addresses_insert_policy" ON public.addresses;
DROP POLICY IF EXISTS "addresses_update_policy" ON public.addresses;
DROP POLICY IF EXISTS "addresses_delete_policy" ON public.addresses;

CREATE POLICY "addresses_select_policy"
ON public.addresses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "addresses_insert_policy"
ON public.addresses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "addresses_update_policy"
ON public.addresses
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "addresses_delete_policy"
ON public.addresses
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
