/*
  complete_onboarding is callable through the Data API, so every invariant
  must be enforced here as well as in the server action. This prevents an
  authenticated caller from creating oversized or negative inventory data.
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

  p_owner_name := trim(coalesce(p_owner_name, ''));
  p_shop_name := trim(coalesce(p_shop_name, ''));
  p_first_product_name := nullif(trim(coalesce(p_first_product_name, '')), '');

  if length(p_owner_name) not between 1 and 200 then
    raise exception 'Owner name must be between 1 and 200 characters';
  end if;
  if length(p_shop_name) not between 1 and 200 then
    raise exception 'Shop name must be between 1 and 200 characters';
  end if;
  if p_theme_color is null or p_theme_color !~ '^#[0-9A-Fa-f]{6}$' then
    raise exception 'Theme colour must be a six-digit hex colour';
  end if;
  if p_first_product_name is not null and length(p_first_product_name) > 200 then
    raise exception 'Product name must not exceed 200 characters';
  end if;
  if coalesce(p_first_product_price, 0) < 0 or coalesce(p_first_product_stock, 0) < 0 then
    raise exception 'Product price and stock cannot be negative';
  end if;

  select coalesce(array_agg(c order by ord), '{}')
  into v_categories
  from (
    select distinct on (c) trim(c) as c, ord
    from unnest(coalesce(p_categories, '{}')) with ordinality as t(c, ord)
    where c is not null and length(trim(c)) between 1 and 100
    order by c, ord
  ) deduped;

  if cardinality(v_categories) not between 1 and 20 then
    raise exception 'Choose between 1 and 20 valid categories';
  end if;

  insert into shops (name, category, categories, theme_color)
  values (p_shop_name, v_categories[1], v_categories, p_theme_color)
  returning * into v_shop;

  insert into profiles (id, shop_id, name, role)
  values (v_user, v_shop.id, p_owner_name, 'owner');

  update shops set owner_id = v_user where id = v_shop.id
  returning * into v_shop;

  if p_first_product_name is not null then
    insert into products (shop_id, name, default_price, stock_quantity)
    values (
      v_shop.id,
      p_first_product_name,
      coalesce(p_first_product_price, 0),
      coalesce(p_first_product_stock, 0)
    );
  end if;

  return v_shop;
end;
$function$;

revoke execute on function public.complete_onboarding(text, text, text[], text, text, numeric, integer)
  from public, anon;
grant execute on function public.complete_onboarding(text, text, text[], text, text, numeric, integer)
  to authenticated, service_role;
