-- Reko: onboarding bootstrap function.
-- Creating a shop + the owner's own profile is a chicken-and-egg problem
-- for RLS (profiles insert policy requires current_shop_id(), which
-- requires a profile to already exist). Solved the same way as the
-- sale/stock functions: a SECURITY DEFINER function that does its own
-- explicit checks instead of relying on RLS.

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

  -- Hard stop: a user can only ever complete onboarding once. Prevents
  -- an authenticated user from creating a second shop for themselves,
  -- or re-running onboarding to overwrite their existing shop.
  if exists (select 1 from profiles where id = v_user) then
    raise exception 'Onboarding already completed for this account';
  end if;

  if p_shop_name is null or length(trim(p_shop_name)) = 0 then
    raise exception 'Shop name is required';
  end if;

  insert into shops (name, category, theme_color, owner_id)
  values (p_shop_name, p_category, p_theme_color, v_user)
  returning * into v_shop;

  insert into profiles (id, shop_id, name, role)
  values (v_user, v_shop.id, p_owner_name, 'owner');

  if p_first_product_name is not null and length(trim(p_first_product_name)) > 0 then
    insert into products (shop_id, name, default_price, stock_quantity)
    values (v_shop.id, p_first_product_name, coalesce(p_first_product_price, 0), coalesce(p_first_product_stock, 0));
  end if;

  return v_shop;
end;
$$;

revoke all on function complete_onboarding(text, text, text, text, text, numeric, integer) from public;
revoke all on function complete_onboarding(text, text, text, text, text, numeric, integer) from anon;
grant execute on function complete_onboarding(text, text, text, text, text, numeric, integer) to authenticated;
