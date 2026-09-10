/*
  Errors, recorded as they happen, so problems are found by us and not by a
  shop owner telling us days later.

  Written only by the server (service role): the app's onRequestError hook for
  crashes on the server, and /api/errors for crashes in someone's browser.
  Row-level security is on with NO policies, so no signed-in user can read or
  write this table through the API. It is read in the Supabase dashboard.

  Deliberately no user or shop id, and no request bodies or cookies: an error
  record should say what broke and where, not who was using it.
*/
create table if not exists public.error_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  source text not null check (source in ('server', 'client')),
  path text,
  message text not null,
  digest text,
  stack text,
  user_agent text,
  -- Same error, same fingerprint: lets alerts be sent once per problem
  -- rather than once per occurrence.
  fingerprint text not null
);

comment on table public.error_events is
  'Crashes from the server and from browsers. Service role only (RLS, no policies). Kept 90 days.';

create index if not exists error_events_occurred_at_idx on public.error_events (occurred_at desc);
create index if not exists error_events_fingerprint_idx on public.error_events (fingerprint, occurred_at desc);

alter table public.error_events enable row level security;
revoke all on public.error_events from anon, authenticated;

/*
  A running list of distinct problems, newest first, with how often each has
  happened. What to open first when an alert arrives.
*/
create or replace view public.error_summary
with (security_invoker = true) as
select
  fingerprint,
  min(message) as message,
  min(source) as source,
  count(*) as occurrences,
  count(*) filter (where occurred_at > now() - interval '24 hours') as last_24h,
  max(occurred_at) as last_seen,
  min(occurred_at) as first_seen,
  (array_agg(path order by occurred_at desc))[1] as last_path
from public.error_events
group by fingerprint
order by max(occurred_at) desc;

revoke all on public.error_summary from anon, authenticated;

/* Ninety days is long enough to spot a pattern, short enough not to become
   a store of people's activity. */
select cron.schedule(
  'purge-old-error-events',
  '30 3 * * *',
  $$delete from public.error_events where occurred_at < now() - interval '90 days';$$
);
