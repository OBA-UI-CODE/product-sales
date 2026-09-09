/*
  Cancelling means "do not renew", not "cut me off now". Someone who cancels
  three days into a paid month has paid for that month and keeps full use of
  the app until it runs out — anything else takes money for a service then
  withdraws it.

  So a canceled shop stays writable while current_period_end is still in the
  future. Once that passes, it is read-only like an expired trial.
*/
create or replace function public.shop_can_write()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1
    from profiles p
    join shops s on s.id = p.shop_id
    where p.id = auth.uid()
      and (
        s.subscription_status = 'active'
        or (s.subscription_status = 'trialing' and s.trial_ends_at > now())
        or (
          s.subscription_status = 'canceled'
          and s.current_period_end is not null
          and s.current_period_end > now()
        )
      )
  );
$$;
