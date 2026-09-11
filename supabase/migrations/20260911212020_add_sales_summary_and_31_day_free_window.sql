/*
  Weekly and monthly totals for Sales History (11 September 2026).

  sales_summary(from, to) adds up a shop's sales between two instants and
  returns, as json:
    days       one row per Lagos calendar day: total, number of sales,
               amount collected (never counting more than the sale's price)
    top_items  the three items that brought in the most

  Added up here rather than in the app because the API returns at most 1000
  rows per request, so a busy shop's month would have been silently short.

  SECURITY INVOKER on purpose: it runs as the signed-in user, so the sales
  policy applies unchanged. It can only ever see the caller's own shop, never
  deleted sales, and on Free only the recent window. Nothing here re-decides
  who may see what.

  Days are Lagos days (UTC+1): a sale at 00:30 in Lagos belongs to that day,
  not the one before.
*/
create or replace function public.sales_summary(p_from timestamptz, p_to timestamptz)
returns json
language sql
stable
security invoker
set search_path to 'public'
as $$
  with s as (
    select
      sa.total_price,
      least(sa.amount_paid, sa.total_price) as collected,
      sa.quantity,
      coalesce(nullif(trim(sa.custom_item_name), ''), p.name, 'Item') as item,
      (sa.sold_at at time zone 'Africa/Lagos')::date as day
    from public.sales sa
    left join public.products p on p.id = sa.product_id
    where sa.sold_at >= p_from and sa.sold_at < p_to
  )
  select json_build_object(
    'days', coalesce((
      select json_agg(d order by d.day)
      from (
        select day, sum(total_price) as total, count(*) as sales, sum(collected) as collected
        from s group by day
      ) d
    ), '[]'::json),
    'top_items', coalesce((
      select json_agg(t)
      from (
        select item, sum(total_price) as total, sum(quantity) as quantity
        from s group by item
        order by sum(total_price) desc, item
        limit 3
      ) t
    ), '[]'::json)
  );
$$;

revoke execute on function public.sales_summary(timestamptz, timestamptz) from public, anon;
grant execute on function public.sales_summary(timestamptz, timestamptz) to authenticated;

/*
  The Free window goes from 30 to 31 days. With exactly 30, on the 31st of a
  31-day month the 1st had already slipped out by the evening, so "this
  month" was short on the one day it matters most. The plan is still
  described as the last 30 days; this only ever shows a little more.
*/
drop policy if exists "shop members can view sales" on public.sales;
create policy "shop members can view sales" on public.sales
  for select
  using (
    shop_id = (select public.current_shop_id())
    and deleted_at is null
    and (
      (select public.current_shop_is_paid())
      or sold_at >= now() - interval '31 days'
      or amount_paid < total_price
    )
  );
