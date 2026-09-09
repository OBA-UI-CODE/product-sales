/*
  Who may change a sale, and what "delete" means.

  Until now update_sale and delete_sale checked only that the sale belonged to
  the caller's shop. Any staff member could edit or delete any sale, including
  the owner's, and delete_sale ran a real DELETE — so a sale could be removed
  with no trace that it ever existed. That is the notebook page torn out, which
  is the exact problem this app is meant to solve.

  New rules:
    owner  — may edit or delete any sale in the shop
    staff  — may edit or delete only sales they logged themselves

  And a delete is now an ARCHIVE. The row stays, marked with deleted_at, and
  stock is returned exactly as before. Nothing is destroyed.
*/

alter table public.sales
  add column if not exists deleted_at timestamptz;

comment on column public.sales.deleted_at is
  'Set when a sale is deleted from the app. The row is kept so a removed sale can still be accounted for; every customer-facing read hides it.';

/* Every listing filters on this, so it is worth an index. */
create index if not exists sales_shop_active_idx
  on public.sales (shop_id, sold_at desc)
  where deleted_at is null;

/*
  Archived sales disappear from every read in one place.

  Done in the policy rather than in each query because six different places
  read sales — dashboard, sales history, debts, the CSV export and more — and
  a filter that has to be remembered in each of them is a filter that will
  eventually be forgotten in a new one. The SECURITY DEFINER functions below
  bypass RLS, so they can still see archived rows to act on them.
*/
drop policy if exists "shop members can view sales" on public.sales;
create policy "shop members can view sales"
  on public.sales for select
  using (
    shop_id = (select current_shop_id())
    and deleted_at is null
  );

/*
  No direct UPDATE or DELETE on the table at all.

  These policies allowed any shop member to PATCH or DELETE a sale straight
  through the REST API, which would have walked around the permission checks
  below and made them decorative. Direct writes were also already wrong on
  their own terms: they would change a sale without returning stock, silently
  corrupting the stock count. Everything goes through the functions.
*/
drop policy if exists "shop members can update sales" on public.sales;
drop policy if exists "shop members can delete sales" on public.sales;

/*
  One place that decides whether the current user may touch a given sale, so
  update and delete can never drift apart on the question.
*/
create or replace function public.can_modify_sale(p_sale sales)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select
    p_sale.shop_id = (select current_shop_id())
    and (
      (select is_owner())
      or p_sale.seller_id = auth.uid()
    );
$$;

revoke execute on function public.can_modify_sale(sales) from public;
grant execute on function public.can_modify_sale(sales) to authenticated, service_role;

create or replace function public.update_sale(
  p_sale_id uuid,
  p_quantity integer,
  p_total_price numeric,
  p_amount_paid numeric,
  p_debtor_name text
)
returns sales
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_shop_id uuid := current_shop_id();
  v_old sales;
  v_qty_diff integer;
  v_updated sales;
begin
  if not shop_can_write() then
    raise exception 'Your free trial has ended. Subscribe to edit sales.';
  end if;

  select * into v_old from sales
  where id = p_sale_id and shop_id = v_shop_id and deleted_at is null;

  if v_old.id is null then
    raise exception 'Sale not found in your shop';
  end if;

  if not can_modify_sale(v_old) then
    raise exception 'You can only edit sales you logged yourself. Ask the shop owner to change this one.';
  end if;

  v_qty_diff := p_quantity - v_old.quantity;

  -- Put the difference back where it came from.
  if v_old.variant_id is not null then
    update product_variants
      set stock_quantity = stock_quantity - v_qty_diff
      where id = v_old.variant_id and shop_id = v_shop_id;
  elsif v_old.product_id is not null then
    update products
      set stock_quantity = stock_quantity - v_qty_diff
      where id = v_old.product_id and shop_id = v_shop_id;
  end if;

  update sales
    set quantity = p_quantity,
        total_price = p_total_price,
        amount_paid = p_amount_paid,
        debtor_name = p_debtor_name,
        edited_at = now()
    where id = p_sale_id and shop_id = v_shop_id
    returning * into v_updated;

  return v_updated;
end;
$function$;

create or replace function public.delete_sale(p_sale_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_shop_id uuid := current_shop_id();
  v_sale sales;
begin
  if not shop_can_write() then
    raise exception 'Your free trial has ended. Subscribe to delete sales.';
  end if;

  select * into v_sale from sales
  where id = p_sale_id and shop_id = v_shop_id and deleted_at is null;

  if v_sale.id is null then
    raise exception 'Sale not found in your shop';
  end if;

  if not can_modify_sale(v_sale) then
    raise exception 'You can only delete sales you logged yourself. Ask the shop owner to remove this one.';
  end if;

  -- Stock comes back exactly as it did before, whether or not the row stays.
  if v_sale.variant_id is not null then
    update product_variants
      set stock_quantity = stock_quantity + v_sale.quantity
      where id = v_sale.variant_id and shop_id = v_shop_id;
  elsif v_sale.product_id is not null then
    update products
      set stock_quantity = stock_quantity + v_sale.quantity
      where id = v_sale.product_id and shop_id = v_shop_id;
  end if;

  /*
    Archived, not deleted. Every customer-facing read hides it, so it behaves
    exactly like a delete, but the record of what was sold survives — which is
    the whole point of the app.
  */
  update sales
    set deleted_at = now()
    where id = p_sale_id and shop_id = v_shop_id;
end;
$function$;
