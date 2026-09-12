/*
  When the same typed-in item is spelled "Ankara" and "ankara", top sellers
  showed the lowercase one (the tie went to the collation's order). Comparing
  byte-wise puts capitals first, so the tidier spelling wins a tie.
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
      mode() within group (order by regexp_replace(trim(s.custom_item_name), '\s+', ' ', 'g') collate "C")
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
