/*
  A shop can sell more than one kind of thing.

  Onboarding asked "What are you into?" and accepted exactly one answer, which
  does not describe a real Nigerian shop — the same counter often carries
  provisions, drinks and snacks.

  `categories` is added alongside `category` rather than replacing it. The
  singular column is read in several places and by existing rows, so it is
  kept and set to the first choice; the array is the full answer.
*/
alter table public.shops
  add column if not exists categories text[] not null default '{}';

comment on column public.shops.categories is
  'Every category the shop picked during onboarding. `category` holds the first of these, for displays that show only one.';

-- Existing shops keep working: their single category becomes a one-item array.
update public.shops
set categories = array[category]
where category is not null
  and category <> ''
  and cardinality(categories) = 0;

/*
  The signature changes, so the old one has to be dropped explicitly — adding a
  parameter to `create or replace` creates a second, overloaded function rather
  than replacing the first, and PostgREST would then not know which to call.
*/
drop function if exists public.complete_onboarding(text, text, text, text, text, numeric, integer);

create function public.complete_onboarding(
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

  -- Drop blanks and duplicates rather than trusting the client's list.
  select coalesce(array_agg(distinct c), '{}')
  into v_categories
  from unnest(coalesce(p_categories, '{}')) as c
  where c is not null and length(trim(c)) > 0;

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
