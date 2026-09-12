-- Enable Supabase Realtime broadcasting on orders, print_requests, and customization_requests tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.print_requests;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.customization_requests;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Realtime publication update notice: %', SQLERRM;
END $$;
