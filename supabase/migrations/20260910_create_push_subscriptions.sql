-- Migration: Create push_subscriptions table and enable Realtime on public.orders

-- 1. Create table for storing Admin Web Push Subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    subscription JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies: Authenticated Admin users can manage their own subscriptions
DROP POLICY IF EXISTS "Admins can view own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Admins can view own push subscriptions"
ON public.push_subscriptions
FOR SELECT
USING (auth.uid() = admin_user_id);

DROP POLICY IF EXISTS "Admins can insert own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Admins can insert own push subscriptions"
ON public.push_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = admin_user_id);

DROP POLICY IF EXISTS "Admins can update own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Admins can update own push subscriptions"
ON public.push_subscriptions
FOR UPDATE
USING (auth.uid() = admin_user_id);

DROP POLICY IF EXISTS "Admins can delete own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Admins can delete own push subscriptions"
ON public.push_subscriptions
FOR DELETE
USING (auth.uid() = admin_user_id);

-- 4. Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_admin ON public.push_subscriptions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON public.push_subscriptions(endpoint);

-- 5. Enable Realtime broadcasting on public.orders table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Realtime publication update notice: %', SQLERRM;
END $$;
