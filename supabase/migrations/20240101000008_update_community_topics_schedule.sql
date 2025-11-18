-- Migration: Update community topic generation to run hourly with fewer topics
-- Changed from daily (10 topics) to hourly (1-2 topics) for better performance

-- Remove old daily schedule
SELECT cron.unschedule('generate-daily-community-topics');

-- Schedule to run every hour (at minute 0 of each hour)
-- This generates 1-2 topics per hour = 24-48 topics per day
SELECT cron.schedule(
  'generate-hourly-community-topics',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT trigger_daily_community_topics();
  $$
);

-- Update comment
COMMENT ON FUNCTION trigger_daily_community_topics() IS 
'Wrapper function called by pg_cron to trigger community topic generation. Now runs hourly (1-2 topics per run) instead of daily (10 topics).';

