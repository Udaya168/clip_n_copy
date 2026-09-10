-- Migration: Add store closure detail columns to store_settings
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS store_status TEXT DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS closure_type TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS reopen_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS closure_message TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS auto_reopen BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_by TEXT DEFAULT NULL;
