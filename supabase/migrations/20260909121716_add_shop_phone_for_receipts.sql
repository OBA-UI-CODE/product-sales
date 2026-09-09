/*
  A phone number for the shop, shown on receipts.

  A receipt with no way to contact the shop is close to useless to the person
  holding it, and this is the only contact detail JOHTA collects. Optional:
  plenty of shops will not want it on a slip, and a receipt without it is
  still better than none.

  Granted alongside name and colour as something an owner may change about how
  their shop presents itself.
*/
alter table public.shops
  add column if not exists phone text;

comment on column public.shops.phone is
  'Optional. Shown on receipts so a customer can contact the shop. Never used by JOHTA to contact anyone.';

grant update (phone) on public.shops to authenticated;
