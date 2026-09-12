/*
  Insights (12 September 2026): top sellers, running out soon, not selling.

  All three are SECURITY INVOKER: they run as the signed-in user, so the
  existing row-level security decides what they can see (own shop only,
  never deleted sales, Free's recent window). Nothing here re-decides access.
  Which of them a Free shop sees is a product decision made in the app
  (running out and not selling are Paid).

  Sales typed in by hand have no product, so they are grouped by name
  (case and spacing ignored) for top sellers, and left out of the stock-based
  two, which need a product's stock to mean anything.
*/

create or replace function public.insights_top_items(
  p_from timestamptz, p_to timestamptz, p_limit int default 5
)
returns table (item text, quantity bigint, revenue numeric, sales bigint)
language sql
stable
security invoker
set search_path to 'public'
as $$
  with s as (
    select sa.*,
      case when sa.product_id is not null
        then 'p:' || sa.product_id::text || ':' || coalesce(sa.variant_id::text, '')
        else 'n:' || lower(regexp_replace(trim(sa.custom_item_name), '\s+', ' ', 'g'))
      end as k
    from public.sales sa
    where sa.sold_at >= p_from and sa.sold_at < p_to
      and (sa.product_id is not null or nullif(trim(sa.custom_item_name), '') is not null)
  )
  select
    coalesce(
      max(p.name) || coalesce(' (' || max(v.label) || ')', ''),
      mode() within group (order by trim(s.custom_item_name))
    ),
    sum(s.quantity)::bigint,
    sum(s.total_price),
    count(*)::bigint
  from s
  left join public.products p on p.id = s.product_id
  left join public.product_variants v on v.id = s.variant_id
  group by s.k
  order by sum(s.total_price) desc, 1
  limit greatest(1, least(p_limit, 20));
$$;

/*
  Every product and size that is for sale, with its own stock and price: a
  product with sizes is represented by its sizes (that is where the stock
  is), a product without sizes by itself.
*/
create or replace function public.insights_stock_lines()
returns table (product_id uuid, variant_id uuid, item text, stock int, price numeric, added timestamptz)
language sql
stable
security invoker
set search_path to 'public'
as $$
  select p.id, null::uuid, p.name, p.stock_quantity, p.default_price, p.created_at
  from public.products p
  where p.archived_at is null
    and not exists (
      select 1 from public.product_variants v
      where v.product_id = p.id and v.archived_at is null
    )
  union all
  select v.product_id, v.id, p.name || ' (' || v.label || ')', v.stock_quantity, v.price,
         greatest(v.created_at, p.created_at)
  from public.product_variants v
  join public.products p on p.id = v.product_id
  where v.archived_at is null and p.archived_at is null;
$$;

/*
  How fast each item has sold over the last p_days (or since it was added,
  if more recent), and how many days its stock lasts at that rate. Only
  items that actually sold in the window.
*/
create or replace function public.insights_running_out(p_days int default 14)
returns table (item text, stock int, sold bigint, per_day numeric, days_left numeric)
language sql
stable
security invoker
set search_path to 'public'
as $$
  with sold as (
    select sa.product_id, sa.variant_id, sum(sa.quantity) as q
    from public.sales sa
    where sa.product_id is not null
      and sa.sold_at >= now() - make_interval(days => p_days)
    group by 1, 2
  ),
  lines as (
    select l.*, greatest(1, least(p_days, ceil(extract(epoch from now() - l.added) / 86400)))::numeric as window_days
    from public.insights_stock_lines() l
  )
  select
    l.item,
    l.stock,
    so.q::bigint,
    round(so.q / l.window_days, 1),
    round(greatest(l.stock, 0) / (so.q / l.window_days), 1)
  from lines l
  join sold so on so.product_id = l.product_id and so.variant_id is not distinct from l.variant_id
  where so.q > 0
  order by greatest(l.stock, 0) / (so.q / l.window_days) asc, so.q desc
  limit 10;
$$;

/*
  Items with stock that have been for sale at least p_days and sold nothing
  in that time, with what is tied up in them. Newer items are left out so
  nothing is judged before it has had a fair chance.
*/
create or replace function public.insights_not_selling(p_days int default 30)
returns table (item text, stock int, price numeric, stock_value numeric, last_sold timestamptz, added timestamptz)
language sql
stable
security invoker
set search_path to 'public'
as $$
  with last as (
    select sa.product_id, sa.variant_id,
           max(sa.sold_at) as last_sold,
           count(*) filter (where sa.sold_at >= now() - make_interval(days => p_days)) as recent
    from public.sales sa
    where sa.product_id is not null
    group by 1, 2
  )
  select l.item, l.stock, l.price, l.stock * l.price, la.last_sold, l.added
  from public.insights_stock_lines() l
  left join last la on la.product_id = l.product_id and la.variant_id is not distinct from l.variant_id
  where l.stock > 0
    and l.added <= now() - make_interval(days => p_days)
    and coalesce(la.recent, 0) = 0
  order by l.stock * l.price desc
  limit 20;
$$;

revoke execute on function public.insights_top_items(timestamptz, timestamptz, int) from public, anon;
revoke execute on function public.insights_stock_lines() from public, anon;
revoke execute on function public.insights_running_out(int) from public, anon;
revoke execute on function public.insights_not_selling(int) from public, anon;
grant execute on function public.insights_top_items(timestamptz, timestamptz, int) to authenticated;
grant execute on function public.insights_stock_lines() to authenticated;
grant execute on function public.insights_running_out(int) to authenticated;
grant execute on function public.insights_not_selling(int) to authenticated;
