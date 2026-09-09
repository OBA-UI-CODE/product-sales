-- Same rules, same names, same logic. The only change is wrapping the helper
-- calls in (select ...) so Postgres evaluates them ONCE per query instead of
-- once per row. This is Supabase's documented fix for the auth_rls_initplan
-- lint and it matters more the more rows a shop accumulates.

-- payments
drop policy if exists "shop members can view payments" on public.payments;
create policy "shop members can view payments" on public.payments
  for select using (shop_id = (select current_shop_id()));

-- products
drop policy if exists "shop members can view products" on public.products;
create policy "shop members can view products" on public.products
  for select using (shop_id = (select current_shop_id()));

drop policy if exists "owner can insert products" on public.products;
create policy "owner can insert products" on public.products
  for insert with check (shop_id = (select current_shop_id()) and (select is_owner()));

drop policy if exists "owner can update products" on public.products;
create policy "owner can update products" on public.products
  for update using (shop_id = (select current_shop_id()) and (select is_owner()));

drop policy if exists "owner can delete products" on public.products;
create policy "owner can delete products" on public.products
  for delete using (shop_id = (select current_shop_id()) and (select is_owner()));

-- profiles
drop policy if exists "shop members can view profiles in their shop" on public.profiles;
create policy "shop members can view profiles in their shop" on public.profiles
  for select using (shop_id = (select current_shop_id()));

drop policy if exists "owner can insert staff profiles in their shop" on public.profiles;
create policy "owner can insert staff profiles in their shop" on public.profiles
  for insert with check (shop_id = (select current_shop_id()) and (select is_owner()));

drop policy if exists "owner can update profiles in their shop" on public.profiles;
create policy "owner can update profiles in their shop" on public.profiles
  for update using (shop_id = (select current_shop_id()) and (select is_owner()));

drop policy if exists "owner can delete staff profiles in their shop" on public.profiles;
create policy "owner can delete staff profiles in their shop" on public.profiles
  for delete using (
    shop_id = (select current_shop_id())
    and (select is_owner())
    and id <> (select auth.uid())
  );

-- sales
drop policy if exists "shop members can view sales" on public.sales;
create policy "shop members can view sales" on public.sales
  for select using (shop_id = (select current_shop_id()));

drop policy if exists "shop members can insert sales" on public.sales;
create policy "shop members can insert sales" on public.sales
  for insert with check (shop_id = (select current_shop_id()));

drop policy if exists "shop members can update sales" on public.sales;
create policy "shop members can update sales" on public.sales
  for update using (shop_id = (select current_shop_id()));

drop policy if exists "shop members can delete sales" on public.sales;
create policy "shop members can delete sales" on public.sales
  for delete using (shop_id = (select current_shop_id()));

-- shops
drop policy if exists "shop members can view their shop" on public.shops;
create policy "shop members can view their shop" on public.shops
  for select using (id = (select current_shop_id()));

drop policy if exists "owner can update their shop" on public.shops;
create policy "owner can update their shop" on public.shops
  for update using (id = (select current_shop_id()) and (select is_owner()));

-- stock_adjustments
drop policy if exists "shop members can view stock adjustments" on public.stock_adjustments;
create policy "shop members can view stock adjustments" on public.stock_adjustments
  for select using (shop_id = (select current_shop_id()));
