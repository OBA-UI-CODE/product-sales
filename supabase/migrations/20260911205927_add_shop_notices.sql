/*
  Which account emails each shop has been sent, so each goes exactly once.

  Written by the daily notices job (/api/cron/notices) with the service role.
  The unique (shop_id, kind) pair is what makes it safe to run the job twice
  in a day, or to retry it: a second send of the same kind is refused here
  before any email leaves.

  kinds:
    plans_announcement  "your free month ends on <date>, here is Free vs Paid"
                        (sent from 14 September 2026 to shops that existed
                        before the plans were introduced)
    trial_ending_3d     three days before a shop's trial ends

  RLS on with no policies: nobody reads this through the API.
*/
create table if not exists public.shop_notices (
  shop_id uuid not null references public.shops(id) on delete cascade,
  kind text not null,
  sent_at timestamptz not null default now(),
  primary key (shop_id, kind)
);

comment on table public.shop_notices is
  'Account emails sent to each shop (one row per shop and kind). Service role only.';

alter table public.shop_notices enable row level security;
revoke all on public.shop_notices from anon, authenticated;
