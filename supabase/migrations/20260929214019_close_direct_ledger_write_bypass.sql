/*
  Keep ledger writes on the audited RPC path.

  Direct INSERT on sales bypasses stock movement and permits callers to choose
  seller_id. Payments and stock adjustments must likewise be produced only by
  the SECURITY DEFINER functions that validate the shop and signed-in user.
*/

drop policy if exists "shop members can insert sales" on public.sales;

revoke insert, update, delete, truncate, references, trigger
  on table public.sales
  from anon, authenticated;

revoke insert, update, delete, truncate, references, trigger
  on table public.payments
  from anon, authenticated;

revoke insert, update, delete, truncate, references, trigger
  on table public.stock_adjustments
  from anon, authenticated;

/* Anonymous visitors have no reason to read private shop ledgers. */
revoke select on table public.sales from anon;
revoke select on table public.payments from anon;
revoke select on table public.stock_adjustments from anon;

/* Signed-in reads remain governed by the existing shop-scoped RLS policies. */
grant select on table public.sales to authenticated;
grant select on table public.payments to authenticated;
grant select on table public.stock_adjustments to authenticated;

