ALTER TABLE public.packages REPLICA IDENTITY FULL;
ALTER TABLE public.tracking_events REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.packages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracking_events;