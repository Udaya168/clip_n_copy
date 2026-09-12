-- Migration: Add automatic store schedule columns & procedure to public.store_settings
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS auto_schedule_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_open_time TEXT DEFAULT '09:00',
  ADD COLUMN IF NOT EXISTS auto_close_time TEXT DEFAULT '21:00',
  ADD COLUMN IF NOT EXISTS manual_override BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS manual_override_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS last_auto_status_change TIMESTAMPTZ DEFAULT NULL;

-- Function to check & execute 9:00 AM / 9:00 PM automatic schedule in Asia/Kolkata timezone
CREATE OR REPLACE FUNCTION public.check_store_auto_schedule()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_now_ist TIMESTAMP;
  v_current_time TEXT;
  v_rec RECORD;
BEGIN
  -- Convert current UTC time to Asia/Kolkata (IST)
  v_now_ist := NOW() AT TIME ZONE 'Asia/Kolkata';
  v_current_time := TO_CHAR(v_now_ist, 'HH24:MI');

  SELECT * INTO v_rec FROM public.store_settings WHERE id = 'global' LIMIT 1;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF v_rec.auto_schedule_enabled IS FALSE THEN
    RETURN;
  END IF;

  -- 9:00 AM Event (09:00:00 to 20:59:59 IST)
  IF v_current_time >= COALESCE(v_rec.auto_open_time, '09:00') AND v_current_time < COALESCE(v_rec.auto_close_time, '21:00') THEN
    IF v_rec.last_auto_status_change IS NULL OR v_rec.last_auto_status_change < (v_now_ist::DATE + TIME '09:00:00') AT TIME ZONE 'Asia/Kolkata' THEN
      UPDATE public.store_settings
      SET is_online = true,
          store_status = 'open',
          manual_override = false,
          last_auto_status_change = NOW(),
          updated_at = NOW()
      WHERE id = 'global';
    END IF;
  ELSE
    -- 9:00 PM Event (21:00:00 to 08:59:59 IST)
    IF v_rec.last_auto_status_change IS NULL OR v_rec.last_auto_status_change < (v_now_ist::DATE + TIME '21:00:00') AT TIME ZONE 'Asia/Kolkata' THEN
      UPDATE public.store_settings
      SET is_online = false,
          store_status = 'closed',
          manual_override = false,
          last_auto_status_change = NOW(),
          updated_at = NOW()
      WHERE id = 'global';
    END IF;
  END IF;
END;
$$;
