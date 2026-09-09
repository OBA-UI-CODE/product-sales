/*
  Each of these already scoped itself to the caller's shop. The only change is
  the shop_can_write() guard at the top, so an expired trial cannot be worked
  around by calling the REST API directly with a valid token — the paywall
  lives in the database, not only in the interface.

  The message is deliberately plain, because it is shown to shop owners.
*/

create or replace function public.create_sale(p_product_id uuid, p_custom_item_name text, p_category text, p_quantity integer, p_total_price numeric, p_amount_paid numeric, p_debtor_name text)
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

  if p_product_id is not null then
    -- verify the product belongs to this shop before touching stock
    if not exists (select 1 from products where id = p_product_id and shop_id = v_shop_id) then
      raise exception 'Product does not belong to your shop';
    end if;
    update products
      set stock_quantity = stock_quantity - p_quantity
      where id = p_product_id and shop_id = v_shop_id;
  end if;

  insert into sales (shop_id, product_id, custom_item_name, category, quantity, total_price, amount_paid, seller_id, debtor_name)
  values (v_shop_id, p_product_id, p_custom_item_name, p_category, p_quantity, p_total_price, p_amount_paid, v_seller_id, p_debtor_name)
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

  if v_old.product_id is not null then
    v_qty_diff := p_quantity - v_old.quantity;
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

  if v_sale.product_id is not null then
    update products
      set stock_quantity = stock_quantity + v_sale.quantity
      where id = v_sale.product_id and shop_id = v_shop_id;
  end if;

  delete from sales where id = p_sale_id and shop_id = v_shop_id;
end;
$function$;

create or replace function public.record_payment(p_sale_id uuid, p_amount numeric DEFAULT NULL::numeric, p_pay_full boolean DEFAULT false)
 returns sales
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_shop_id uuid := current_shop_id();
  v_sale sales;
  v_amount numeric;
  v_updated sales;
begin
  if not shop_can_write() then
    raise exception 'Your free trial has ended. Subscribe to record payments.';
  end if;

  select * into v_sale from sales where id = p_sale_id and shop_id = v_shop_id;
  if v_sale.id is null then
    raise exception 'Sale not found in your shop';
  end if;

  v_amount := case when p_pay_full then (v_sale.total_price - v_sale.amount_paid) else p_amount end;

  if v_amount is null or v_amount <= 0 then
    raise exception 'Invalid payment amount';
  end if;

  insert into payments (shop_id, sale_id, amount, recorded_by)
  values (v_shop_id, p_sale_id, v_amount, auth.uid());

  update sales
    set amount_paid = amount_paid + v_amount
    where id = p_sale_id and shop_id = v_shop_id
    returning * into v_updated;

  return v_updated;
end;
$function$;

create or replace function public.restock_product(p_product_id uuid, p_quantity integer, p_reason text DEFAULT 'restock'::text)
 returns products
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_shop_id uuid := current_shop_id();
  v_product products;
begin
  if not shop_can_write() then
    raise exception 'Your free trial has ended. Subscribe to update stock.';
  end if;

  if not exists (select 1 from products where id = p_product_id and shop_id = v_shop_id) then
    raise exception 'Product does not belong to your shop';
  end if;

  update products
    set stock_quantity = stock_quantity + p_quantity
    where id = p_product_id and shop_id = v_shop_id
    returning * into v_product;

  insert into stock_adjustments (shop_id, product_id, quantity_change, reason, created_by)
  values (v_shop_id, p_product_id, p_quantity, p_reason, auth.uid());

  return v_product;
end;
$function$;
