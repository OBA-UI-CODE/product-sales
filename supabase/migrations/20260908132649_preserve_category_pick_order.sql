/*
  Keep the order the shop owner picked.

  The first version deduplicated with array_agg(distinct ...), which sorts
  alphabetically as a side effect. Picking Provisions then Beverages stored
  Beverages first, and since `category` is the first element, the singular
  column ended up naming a category they chose second. WITH ORDINALITY keeps
  the original positions while still dropping repeats and blanks.
*/
create or replace function public.complete_onboarding(
  p_owner_name text,
  p_shop_name text,
  p_categories text[],
  p_theme_color text default '#1D9E75'::text,
  p_first_product_name text default null,
  p_first_product_price numeric default null,
  p_first_product_stock integer default null
)
returns shops
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_user uuid := auth.uid();
  v_shop shops;
  v_categories text[];
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from profiles where id = v_user) then
    raise exception 'Onboarding already completed for this account';
  end if;

  if p_shop_name is null or length(trim(p_shop_name)) = 0 then
    raise exception 'Shop name is required';
  end if;

  select coalesce(array_agg(c order by ord), '{}')
  into v_categories
  from (
    select distinct on (c) c, ord
    from unnest(coalesce(p_categories, '{}')) with ordinality as t(c, ord)
    where c is not null and length(trim(c)) > 0
    order by c, ord
  ) deduped;

  insert into shops (name, category, categories, theme_color)
  values (p_shop_name, v_categories[1], v_categories, p_theme_color)
  returning * into v_shop;

  insert into profiles (id, shop_id, name, role)
  values (v_user, v_shop.id, p_owner_name, 'owner');

  update shops set owner_id = v_user where id = v_shop.id
  returning * into v_shop;

  if p_first_product_name is not null and length(trim(p_first_product_name)) > 0 then
    insert into products (shop_id, name, default_price, stock_quantity)
    values (v_shop.id, p_first_product_name, coalesce(p_first_product_price, 0), coalesce(p_first_product_stock, 0));
  end if;

  return v_shop;
end;
$function$;

revoke execute on function public.complete_onboarding(text, text, text[], text, text, numeric, integer) from public;
revoke execute on function public.complete_onboarding(text, text, text[], text, text, numeric, integer) from anon;
grant execute on function public.complete_onboarding(text, text, text[], text, text, numeric, integer) to authenticated, service_role;
