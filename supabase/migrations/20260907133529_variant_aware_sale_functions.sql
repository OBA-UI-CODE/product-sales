/*
  Sales can now name a variant. When they do, stock moves on the VARIANT and
  the product's own stock_quantity is left alone; when they don't, behaviour is
  exactly as before, so existing products and existing sales are unaffected.

  Stock is never allowed to block a sale — a shop that has just sold its last
  packet still needs the sale recorded, and an unrecorded sale is worse than a
  stock count that has gone negative. The count is corrected at restock.
*/

create or replace function public.create_sale(p_product_id uuid, p_custom_item_name text, p_category text, p_quantity integer, p_total_price numeric, p_amount_paid numeric, p_debtor_name text, p_variant_id uuid default null)
 returns sales
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_shop_id uuid := current_shop_id();
  v_seller_id uuid := auth.uid();
  v_sale sales;
begin
  if not shop_can_write() then
    raise exception 'Your free trial has ended. Subscribe to keep logging sales.';
  end if;

  if v_shop_id is null then
    raise exception 'No shop found for current user';
  end if;

  if p_variant_id is not null then
    if not exists (select 1 from product_variants where id = p_variant_id and shop_id = v_shop_id) then
      raise exception 'That product option does not belong to your shop';
    end if;
    update product_variants
      set stock_quantity = stock_quantity - p_quantity
      where id = p_variant_id and shop_id = v_shop_id;

  elsif p_product_id is not null then
    if not exists (select 1 from products where id = p_product_id and shop_id = v_shop_id) then
      raise exception 'Product does not belong to your shop';
    end if;
    update products
      set stock_quantity = stock_quantity - p_quantity
      where id = p_product_id and shop_id = v_shop_id;
  end if;

  insert into sales (shop_id, product_id, variant_id, custom_item_name, category, quantity, total_price, amount_paid, seller_id, debtor_name)
  values (v_shop_id, p_product_id, p_variant_id, p_custom_item_name, p_category, p_quantity, p_total_price, p_amount_paid, v_seller_id, p_debtor_name)
  returning * into v_sale;

  return v_sale;
end;
$function$;

create or replace function public.update_sale(p_sale_id uuid, p_quantity integer, p_total_price numeric, p_amount_paid numeric, p_debtor_name text)
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

  select * into v_old from sales where id = p_sale_id and shop_id = v_shop_id;
  if v_old.id is null then
    raise exception 'Sale not found in your shop';
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

  select * into v_sale from sales where id = p_sale_id and shop_id = v_shop_id;
  if v_sale.id is null then
    raise exception 'Sale not found in your shop';
  end if;

  if v_sale.variant_id is not null then
    update product_variants
      set stock_quantity = stock_quantity + v_sale.quantity
      where id = v_sale.variant_id and shop_id = v_shop_id;
  elsif v_sale.product_id is not null then
    update products
      set stock_quantity = stock_quantity + v_sale.quantity
      where id = v_sale.product_id and shop_id = v_shop_id;
  end if;

  delete from sales where id = p_sale_id and shop_id = v_shop_id;
end;
$function$;

/* Restocking a specific variant. The product-level restock_product() is left
   as it is, for products that have no variants. */
create or replace function public.restock_variant(p_variant_id uuid, p_quantity integer, p_reason text default 'restock')
 returns product_variants
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_shop_id uuid := current_shop_id();
  v_variant product_variants;
begin
  if not shop_can_write() then
    raise exception 'Your free trial has ended. Subscribe to update stock.';
  end if;

  select * into v_variant from product_variants where id = p_variant_id and shop_id = v_shop_id;
  if v_variant.id is null then
    raise exception 'That product option does not belong to your shop';
  end if;

  update product_variants
    set stock_quantity = stock_quantity + p_quantity
    where id = p_variant_id and shop_id = v_shop_id
    returning * into v_variant;

  insert into stock_adjustments (shop_id, product_id, quantity_change, reason, created_by)
  values (v_shop_id, v_variant.product_id, p_quantity, p_reason, auth.uid());

  return v_variant;
end;
$function$;
