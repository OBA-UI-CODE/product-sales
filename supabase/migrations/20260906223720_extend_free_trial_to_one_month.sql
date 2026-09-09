/*
  The free trial is now one month, not 14 days.

  interval '1 month' rather than '30 days' so it lands on the same date in the
  next calendar month — someone starting on the 3rd is charged on the 3rd,
  which is what "one month free" means to a shop owner.
*/
alter table public.shops
  alter column trial_ends_at set default (now() + interval '1 month');

comment on column public.shops.trial_ends_at is
  'End of the one-month free trial. shop_can_write() goes read-only past this unless the shop has subscribed.';

/*
  Existing shops signed up under the old 14-day trial. Since the offer is now
  a month, they get the longer trial too — this only ever moves the date
  forward, never shortens a trial anyone is already on.
*/
update public.shops
set trial_ends_at = created_at + interval '1 month'
where subscription_status = 'trialing'
  and trial_ends_at < created_at + interval '1 month';

select name, created_at::date as signed_up, trial_ends_at::date as trial_ends,
       subscription_status
from public.shops
order by created_at;
