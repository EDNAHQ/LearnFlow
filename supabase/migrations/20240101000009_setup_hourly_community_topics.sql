-- Migration: Setup hourly community topic generation
-- Generates 1-2 topics per hour (instead of 10 at once) for better performance

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to call edge function (if it doesn't exist)
CREATE OR REPLACE FUNCTION generate_daily_community_topics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  supabase_url TEXT := 'https://hjivfywgkiwjvpquxndg.supabase.co';
  edge_function_url TEXT;
  service_key TEXT;
BEGIN
  edge_function_url := supabase_url || '/functions/v1/generate-daily-community-topics';
  
  BEGIN
    service_key := current_setting('app.settings.service_role_key', true);
  EXCEPTION
    WHEN OTHERS THEN
      service_key := NULL;
  END;
  
  PERFORM net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(service_key, '')
    ),
    body := '{}'::jsonb
  );
  
  RAISE NOTICE 'Community topics generation request sent at %', NOW();
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error generating community topics: %', SQLERRM;
END;
$$;

-- Create wrapper function
CREATE OR REPLACE FUNCTION trigger_daily_community_topics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM generate_daily_community_topics();
  RAISE NOTICE 'Community topics generation triggered at %', NOW();
END;
$$;

-- Remove any existing schedules (handle errors gracefully)
DO $$
BEGIN
  -- Try to remove daily schedule
  BEGIN
    PERFORM cron.unschedule('generate-daily-community-topics');
    RAISE NOTICE 'Removed daily schedule';
  EXCEPTION
    WHEN OTHERS THEN
      -- Job doesn't exist, that's fine
      RAISE NOTICE 'Daily schedule not found (skipping)';
  END;
  
  -- Try to remove hourly schedule
  BEGIN
    PERFORM cron.unschedule('generate-hourly-community-topics');
    RAISE NOTICE 'Removed existing hourly schedule';
  EXCEPTION
    WHEN OTHERS THEN
      -- Job doesn't exist, that's fine
      RAISE NOTICE 'Hourly schedule not found (skipping)';
  END;
END $$;

-- Schedule to run every hour (at minute 0)
-- This generates 1-2 topics per hour = 24-48 topics per day
SELECT cron.schedule(
  'generate-hourly-community-topics',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT trigger_daily_community_topics();
  $$
);

COMMENT ON FUNCTION trigger_daily_community_topics() IS 
'Triggers community topic generation. Runs hourly, generates 1-2 topics per run (24-48 per day). Detailed content generates on-demand when users view steps.';

