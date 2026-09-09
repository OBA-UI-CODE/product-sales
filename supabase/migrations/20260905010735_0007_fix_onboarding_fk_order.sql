-- Fix: shops.owner_id has a FK to profiles(id), but profiles.shop_id is
-- NOT NULL and references shops(id) — neither can be inserted first.
-- Fix: insert the shop with owner_id left null, insert the profile,
-- then backfill owner_id on the shop.

create or replace function complete_onboarding(
  p_owner_name text,
  p_shop_name text,
  p_category text,
  p_theme_color text default '#1D9E75',
  p_first_product_name text default null,
  p_first_product_price numeric default null,
  p_first_product_stock integer default null
)
returns shops
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_shop shops;
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

  insert into shops (name, category, theme_color)
  values (p_shop_name, p_category, p_theme_color)
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
$$;
