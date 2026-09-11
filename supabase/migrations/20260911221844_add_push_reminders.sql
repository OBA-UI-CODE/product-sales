/*
  Phone reminders to log sales (12 September 2026). Free for everyone,
  owners and staff.

    08:00 Lagos  morning     "Good morning, ready to log today's sales?"
    14:00 Lagos  afternoon   only if the shop has logged nothing yet today
    20:00 Lagos  evening     today's total, or a nudge if nothing was logged

  push_subscriptions  one row per phone or browser that said yes. Written by
                      the signed-in user for themselves (RLS), read by the
                      sender with the service role.
  notification_prefs  each person's on/off for the three reminders. No row
                      means all three on.
*/

create extension if not exists pg_net with schema extensions;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  shop_id uuid not null references public.shops(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_sent_at timestamptz
);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);
create index if not exists push_subscriptions_shop_idx on public.push_subscriptions (shop_id);

alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from anon, authenticated;
grant select, insert, delete on public.push_subscriptions to authenticated;

create policy "users see their own devices" on public.push_subscriptions
  for select using (user_id = (select auth.uid()));
create policy "users add their own devices, for their own shop" on public.push_subscriptions
  for insert with check (
    user_id = (select auth.uid())
    and shop_id = (select public.current_shop_id())
  );
create policy "users remove their own devices" on public.push_subscriptions
  for delete using (user_id = (select auth.uid()));

create table if not exists public.notification_prefs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  morning boolean not null default true,
  afternoon boolean not null default true,
  evening boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.notification_prefs enable row level security;
revoke all on public.notification_prefs from anon, authenticated;
grant select, insert, update (morning, afternoon, evening, updated_at) on public.notification_prefs to authenticated;

create policy "users read their own reminder settings" on public.notification_prefs
  for select using (user_id = (select auth.uid()));
create policy "users create their own reminder settings" on public.notification_prefs
  for insert with check (user_id = (select auth.uid()));
create policy "users change their own reminder settings" on public.notification_prefs
  for update using (user_id = (select auth.uid()));

/*
  Everyone who should get a given reminder right now, one row per device,
  with what the message needs: their first name, the shop, and the shop's
  sales so far today (Lagos day). Skips paused and deleted shops, removed
  staff, staff paused on the Free plan, and anyone who turned that
  reminder off. Service role only.
*/
create or replace function public.reminder_targets(p_slot text)
returns table (
  subscription_id uuid,
  endpoint text,
  p256dh text,
  auth text,
  first_name text,
  shop_name text,
  sales_today bigint,
  total_today numeric
)
language sql
stable
security definer
set search_path to 'public'
as $$
  with today as (
    select (date_trunc('day', now() at time zone 'Africa/Lagos') at time zone 'Africa/Lagos') as since
  ),
  shop_day as (
    select s.shop_id, count(*) as n, coalesce(sum(s.total_price), 0) as total
    from sales s, today
    where s.sold_at >= today.since and s.deleted_at is null
    group by s.shop_id
  )
  select
    ps.id, ps.endpoint, ps.p256dh, ps.auth,
    split_part(trim(p.name), ' ', 1),
    sh.name,
    coalesce(d.n, 0),
    coalesce(d.total, 0)
  from push_subscriptions ps
  join profiles p on p.id = ps.user_id and p.shop_id = ps.shop_id
  join shops sh on sh.id = ps.shop_id
  left join notification_prefs np on np.user_id = ps.user_id
  left join shop_day d on d.shop_id = ps.shop_id
  where p.removed_at is null
    and sh.deactivated_at is null
    and sh.deletion_requested_at is null
    and (p.role = 'owner' or public.shop_is_paid(sh.id) or public.staff_seat_holder(sh.id) = p.id)
    and case p_slot
          when 'morning' then coalesce(np.morning, true)
          when 'afternoon' then coalesce(np.afternoon, true) and coalesce(d.n, 0) = 0
          when 'evening' then coalesce(np.evening, true)
          else false
        end;
$$;

revoke execute on function public.reminder_targets(text) from public, anon, authenticated;
grant execute on function public.reminder_targets(text) to service_role;

/*
  The key the scheduled jobs present to /api/cron/reminders. Made here, in
  the vault, so it is never typed or shown anywhere; the route asks this
  function whether the key it was given is the right one.
*/
select vault.create_secret(
  encode(extensions.gen_random_bytes(32), 'hex'),
  'reminders_token',
  'Presented by the pg_cron reminder jobs to https://johta.click/api/cron/reminders'
)
where not exists (select 1 from vault.secrets where name = 'reminders_token');

create or replace function public.reminder_token_ok(p_token text)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1 from vault.decrypted_secrets
    where name = 'reminders_token' and decrypted_secret = p_token
  );
$$;

revoke execute on function public.reminder_token_ok(text) from public, anon, authenticated;
grant execute on function public.reminder_token_ok(text) to service_role;

/* 07:00, 13:00 and 19:00 UTC are 08:00, 14:00 and 20:00 in Lagos. */
select cron.schedule(
  'reminder-' || slot,
  hour || ' * * *',
  format(
    $job$select net.http_get(
      url := 'https://johta.click/api/cron/reminders?slot=%s',
      headers := jsonb_build_object('Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'reminders_token')),
      timeout_milliseconds := 30000
    );$job$,
    slot
  )
)
from (values ('morning', '0 7'), ('afternoon', '0 13'), ('evening', '0 19')) as t(slot, hour);
