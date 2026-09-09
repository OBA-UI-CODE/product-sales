-- The 30-day grace period only means anything if something actually destroys
-- the data at the end of it. pg_cron keeps that inside the database, so it
-- does not depend on the app being deployed or a request coming in.
create extension if not exists pg_cron with schema pg_catalog;

-- Unschedule first so re-running this is safe.
select cron.unschedule('purge-expired-shops')
where exists (select 1 from cron.job where jobname = 'purge-expired-shops');

-- 03:15 UTC daily — the quiet part of the night in Nigeria (04:15 WAT).
select cron.schedule(
  'purge-expired-shops',
  '15 3 * * *',
  $$select public.purge_expired_shops();$$
);
