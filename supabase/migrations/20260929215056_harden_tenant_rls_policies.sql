/*
  Make tenant authorization explicit and validate the resulting row on writes.
  These policies keep shop IDs, shop ownership, profile roles, and
  product/variant relationships from being reassigned across tenants.
*/

alter policy "shop members can view their shop"
  on public.shops
  to authenticated
  using (id = (select public.current_shop_id()));

alter policy "owner can update their shop"
  on public.shops
  to authenticated
  using (
    id = (select public.current_shop_id())
    and (select public.is_owner())
  )
  with check (
    id = (select public.current_shop_id())
    and owner_id = (select auth.uid())
    and (select public.is_owner())
  );

alter policy "shop members can view profiles in their shop"
  on public.profiles
  to authenticated
  using (shop_id = (select public.current_shop_id()));

alter policy "owner can insert staff profiles in their shop"
  on public.profiles
  to authenticated
  with check (
    shop_id = (select public.current_shop_id())
    and id <> (select auth.uid())
    and role = 'staff'
    and (select public.is_owner())
  );

alter policy "owner can update profiles in their shop"
  on public.profiles
  to authenticated
  using (
    shop_id = (select public.current_shop_id())
    and (select public.is_owner())
  )
  with check (
    shop_id = (select public.current_shop_id())
    and (select public.is_owner())
    and (
      (id = (select auth.uid()) and role = 'owner')
      or
      (id <> (select auth.uid()) and role = 'staff')
    )
  );

alter policy "owner can delete staff profiles in their shop"
  on public.profiles
  to authenticated
  using (
    shop_id = (select public.current_shop_id())
    and id <> (select auth.uid())
    and role = 'staff'
    and (select public.is_owner())
  );

alter policy "shop members can view products"
  on public.products
  to authenticated
  using (shop_id = (select public.current_shop_id()));

alter policy "owner can insert products"
  on public.products
  to authenticated
  with check (
    shop_id = (select public.current_shop_id())
    and (select public.is_owner())
  );

alter policy "owner can update products"
  on public.products
  to authenticated
  using (
    shop_id = (select public.current_shop_id())
    and (select public.is_owner())
  )
  with check (
    shop_id = (select public.current_shop_id())
    and (select public.is_owner())
  );

alter policy "owner can delete products"
  on public.products
  to authenticated
  using (
    shop_id = (select public.current_shop_id())
    and (select public.is_owner())
  );

alter policy "shop members can view variants"
  on public.product_variants
  to authenticated
  using (shop_id = (select public.current_shop_id()));

alter policy "owner can insert variants"
  on public.product_variants
  to authenticated
  with check (
    shop_id = (select public.current_shop_id())
    and (select public.is_owner())
    and exists (
      select 1
      from public.products p
      where p.id = product_id
        and p.shop_id = (select public.current_shop_id())
    )
  );

alter policy "owner can update variants"
  on public.product_variants
  to authenticated
  using (
    shop_id = (select public.current_shop_id())
    and (select public.is_owner())
  )
  with check (
    shop_id = (select public.current_shop_id())
    and (select public.is_owner())
    and exists (
      select 1
      from public.products p
      where p.id = product_id
        and p.shop_id = (select public.current_shop_id())
    )
  );

alter policy "owner can delete variants"
  on public.product_variants
  to authenticated
  using (
    shop_id = (select public.current_shop_id())
    and (select public.is_owner())
  );

alter policy "shop members can view sales"
  on public.sales
  to authenticated
  using (
    shop_id = (select public.current_shop_id())
    and deleted_at is null
    and (
      (select public.current_shop_is_paid())
      or sold_at >= now() - interval '31 days'
      or amount_paid < total_price
    )
  );

alter policy "shop members can view payments"
  on public.payments
  to authenticated
  using (shop_id = (select public.current_shop_id()));

alter policy "shop members can view stock adjustments"
  on public.stock_adjustments
  to authenticated
  using (shop_id = (select public.current_shop_id()));

