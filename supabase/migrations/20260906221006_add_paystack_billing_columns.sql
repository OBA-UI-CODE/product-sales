-- Everything Paystack needs to tie a subscription back to a shop.
-- subscription_status and trial_ends_at already existed.
alter table public.shops
  add column if not exists paystack_customer_code text,
  add column if not exists paystack_subscription_code text,
  add column if not exists paystack_email_token text,
  add column if not exists billing_plan text,
  add column if not exists current_period_end timestamptz;

comment on column public.shops.paystack_email_token is
  'Returned by Paystack alongside the subscription code; both are required to disable a subscription.';
comment on column public.shops.billing_plan is
  'monthly | yearly - which plan the shop is on, for display.';
comment on column public.shops.current_period_end is
  'When the current paid period runs out, from Paystack''s next_payment_date.';

-- The webhook looks shops up by these, so they need to be indexed.
create index if not exists shops_paystack_subscription_code_idx
  on public.shops (paystack_subscription_code);
create index if not exists shops_paystack_customer_code_idx
  on public.shops (paystack_customer_code);

/*
  Whether the signed-in user's shop is currently allowed to write.

  Read-only once the trial lapses: they keep full sight of their records and
  can still sign in, but cannot log new sales until they subscribe. A shop is
  writable while the trial is still running, or while the subscription is
  active. past_due and canceled are read-only.

  SECURITY DEFINER with a pinned search_path, like the other helpers, so it
  can read shops without tripping over that table's own policies.
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
      )
  );
$$;
