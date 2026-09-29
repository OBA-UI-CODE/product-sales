/*
  Data-integrity hardening.

  The interface already guides people toward sensible values, but the RPCs
  are also public API endpoints for signed-in users. These checks make the
  database authoritative when a caller bypasses the interface.

  Constraints are added NOT VALID first and then validated. New writes are
  protected immediately; validation deliberately stops this migration if an
  old row is already invalid, so historical business records are never
  rewritten silently.
*/

do $$
begin
if not exists (select 1 from pg_constraint where conname = 'products_price_nonnegative' and conrelid = 'public.products'::regclass) then
    alter table public.products add constraint products_price_nonnegative
      check (default_price >= 0) not valid;
  end if;
if not exists (select 1 from pg_constraint where conname = 'products_low_stock_nonnegative' and conrelid = 'public.products'::regclass) then
    alter table public.products add constraint products_low_stock_nonnegative
      check (low_stock_threshold >= 0) not valid;
  end if;
if not exists (select 1 from pg_constraint where conname = 'product_variants_price_nonnegative' and conrelid = 'public.product_variants'::regclass) then
    alter table public.product_variants add constraint product_variants_price_nonnegative
      check (price >= 0) not valid;
  end if;
if not exists (select 1 from pg_constraint where conname = 'product_variants_low_stock_nonnegative' and conrelid = 'public.product_variants'::regclass) then
    alter table public.product_variants add constraint product_variants_low_stock_nonnegative
      check (low_stock_threshold >= 0) not valid;
  end if;
if not exists (select 1 from pg_constraint where conname = 'sales_quantity_positive' and conrelid = 'public.sales'::regclass) then
    alter table public.sales add constraint sales_quantity_positive
      check (quantity > 0) not valid;
  end if;
if not exists (select 1 from pg_constraint where conname = 'sales_total_nonnegative' and conrelid = 'public.sales'::regclass) then
    alter table public.sales add constraint sales_total_nonnegative
      check (total_price >= 0) not valid;
  end if;
if not exists (select 1 from pg_constraint where conname = 'sales_amount_paid_valid' and conrelid = 'public.sales'::regclass) then
    alter table public.sales add constraint sales_amount_paid_valid
      check (amount_paid >= 0 and amount_paid <= total_price) not valid;
  end if;
if not exists (select 1 from pg_constraint where conname = 'payments_amount_positive' and conrelid = 'public.payments'::regclass) then
    alter table public.payments add constraint payments_amount_positive
      check (amount > 0) not valid;
  end if;
end;
$$;

alter table public.products validate constraint products_price_nonnegative;
alter table public.products validate constraint products_low_stock_nonnegative;
alter table public.product_variants validate constraint product_variants_price_nonnegative;
alter table public.product_variants validate constraint product_variants_low_stock_nonnegative;
alter table public.sales validate constraint sales_quantity_positive;
alter table public.sales validate constraint sales_total_nonnegative;
alter table public.sales validate constraint sales_amount_paid_valid;
alter table public.payments validate constraint payments_amount_positive;

create or replace function public.create_sale(
  p_product_id uuid,
  p_custom_item_name text,
  p_category text,
  p_quantity integer,
  p_total_price numeric,
  p_amount_paid numeric,
  p_debtor_name text,
  p_variant_id uuid default null
)
returns public.sales
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_shop_id uuid := public.current_shop_id();
  v_seller_id uuid := auth.uid();
  v_variant_product_id uuid;
  v_sale public.sales;
begin
  if v_seller_id is null or v_shop_id is null then
    raise exception 'You must be signed in to log a sale';
  end if;
  if not public.shop_can_write() then
    raise exception 'Your free trial has ended. Subscribe to keep logging sales.';
  end if;
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Quantity must be greater than zero';
  end if;
  if p_total_price is null or p_total_price < 0 then
    raise exception 'Total price cannot be negative';
  end if;
  if p_amount_paid is null or p_amount_paid < 0 or p_amount_paid > p_total_price then
    raise exception 'Amount paid must be between zero and the total price';
  end if;
  if p_product_id is null and nullif(btrim(p_custom_item_name), '') is null then
    raise exception 'Choose a product or enter an item name';
  end if;

  if p_variant_id is not null then
    select product_id into v_variant_product_id
    from public.product_variants
    where id = p_variant_id and shop_id = v_shop_id and archived_at is null;

    if v_variant_product_id is null then
      raise exception 'That product option is not active in your shop';
    end if;
    if p_product_id is distinct from v_variant_product_id then
      raise exception 'That product option does not belong to the selected product';
    end if;

    update public.product_variants
      set stock_quantity = stock_quantity - p_quantity
      where id = p_variant_id and shop_id = v_shop_id;
  elsif p_product_id is not null then
    if not exists (
      select 1 from public.products
      where id = p_product_id and shop_id = v_shop_id and archived_at is null
    ) then
      raise exception 'Product is not active in your shop';
    end if;

    update public.products
      set stock_quantity = stock_quantity - p_quantity
      where id = p_product_id and shop_id = v_shop_id;
  end if;

  insert into public.sales (
    shop_id, product_id, variant_id, custom_item_name, category,
    quantity, total_price, amount_paid, seller_id, debtor_name
  ) values (
    v_shop_id, p_product_id, p_variant_id,
    nullif(btrim(p_custom_item_name), ''), p_category,
    p_quantity, p_total_price, p_amount_paid, v_seller_id,
    nullif(btrim(p_debtor_name), '')
  )
  returning * into v_sale;

  return v_sale;
end;
$function$;

create or replace function public.update_sale(
  p_sale_id uuid,
  p_quantity integer,
  p_total_price numeric,
  p_amount_paid numeric,
  p_debtor_name text
)
returns public.sales
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_shop_id uuid := public.current_shop_id();
  v_old public.sales;
  v_qty_diff integer;
  v_updated public.sales;
begin
  if auth.uid() is null or v_shop_id is null then
    raise exception 'You must be signed in to edit a sale';
  end if;
  if not public.shop_can_write() then
    raise exception 'Your free trial has ended. Subscribe to edit sales.';
  end if;
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Quantity must be greater than zero';
  end if;
  if p_total_price is null or p_total_price < 0 then
    raise exception 'Total price cannot be negative';
  end if;
  if p_amount_paid is null or p_amount_paid < 0 or p_amount_paid > p_total_price then
    raise exception 'Amount paid must be between zero and the total price';
  end if;

  select * into v_old from public.sales
  where id = p_sale_id and shop_id = v_shop_id and deleted_at is null
  for update;

  if v_old.id is null then
    raise exception 'Sale not found in your shop';
  end if;
  if not public.can_modify_sale(v_old) then
    raise exception 'You can only edit sales you logged yourself. Ask the shop owner to change this one.';
  end if;

  v_qty_diff := p_quantity - v_old.quantity;
  if v_old.variant_id is not null then
    update public.product_variants
      set stock_quantity = stock_quantity - v_qty_diff
      where id = v_old.variant_id and shop_id = v_shop_id;
  elsif v_old.product_id is not null then
    update public.products
      set stock_quantity = stock_quantity - v_qty_diff
      where id = v_old.product_id and shop_id = v_shop_id;
  end if;

  update public.sales
    set quantity = p_quantity,
        total_price = p_total_price,
        amount_paid = p_amount_paid,
        debtor_name = nullif(btrim(p_debtor_name), ''),
        edited_at = now()
    where id = p_sale_id and shop_id = v_shop_id
    returning * into v_updated;

  return v_updated;
end;
$function$;

create or replace function public.record_payment(
  p_sale_id uuid,
  p_amount numeric default null,
  p_pay_full boolean default false
)
returns public.sales
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_shop_id uuid := public.current_shop_id();
  v_sale public.sales;
  v_amount numeric;
  v_balance numeric;
  v_updated public.sales;
begin
  if auth.uid() is null or v_shop_id is null then
    raise exception 'You must be signed in to record a payment';
  end if;
  if not public.shop_can_write() then
    raise exception 'Your free trial has ended. Subscribe to record payments.';
  end if;

  select * into v_sale from public.sales
  where id = p_sale_id and shop_id = v_shop_id and deleted_at is null
  for update;

  if v_sale.id is null then
    raise exception 'Sale not found in your shop';
  end if;

  v_balance := v_sale.total_price - v_sale.amount_paid;
  if v_balance <= 0 then
    raise exception 'This sale is already fully paid';
  end if;

  v_amount := case when p_pay_full then v_balance else p_amount end;
  if v_amount is null or v_amount <= 0 then
    raise exception 'Payment amount must be greater than zero';
  end if;
  if v_amount > v_balance then
    raise exception 'Payment cannot be greater than the outstanding balance';
  end if;

  insert into public.payments (shop_id, sale_id, amount, recorded_by)
  values (v_shop_id, p_sale_id, v_amount, auth.uid());

  update public.sales
    set amount_paid = amount_paid + v_amount
    where id = p_sale_id and shop_id = v_shop_id
    returning * into v_updated;

  return v_updated;
end;
$function$;

create or replace function public.restock_product(
  p_product_id uuid,
  p_quantity integer,
  p_reason text default 'restock'
)
returns public.products
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_shop_id uuid := public.current_shop_id();
  v_product public.products;
begin
  if auth.uid() is null or v_shop_id is null then
    raise exception 'You must be signed in to update stock';
  end if;
  if not public.shop_can_write() then
    raise exception 'Your free trial has ended. Subscribe to update stock.';
  end if;
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Restock quantity must be greater than zero';
  end if;

  update public.products
    set stock_quantity = stock_quantity + p_quantity
    where id = p_product_id and shop_id = v_shop_id and archived_at is null
    returning * into v_product;

  if v_product.id is null then
    raise exception 'Product is not active in your shop';
  end if;

  insert into public.stock_adjustments (
    shop_id, product_id, quantity_change, reason, created_by
  ) values (
    v_shop_id, p_product_id, p_quantity,
    coalesce(nullif(btrim(p_reason), ''), 'restock'), auth.uid()
  );

  return v_product;
end;
$function$;

create or replace function public.restock_variant(
  p_variant_id uuid,
  p_quantity integer,
  p_reason text default 'restock'
)
returns public.product_variants
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_shop_id uuid := public.current_shop_id();
  v_variant public.product_variants;
begin
  if auth.uid() is null or v_shop_id is null then
    raise exception 'You must be signed in to update stock';
  end if;
  if not public.shop_can_write() then
    raise exception 'Your free trial has ended. Subscribe to update stock.';
  end if;
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Restock quantity must be greater than zero';
  end if;

  update public.product_variants v
    set stock_quantity = v.stock_quantity + p_quantity
    from public.products p
    where v.id = p_variant_id
      and v.shop_id = v_shop_id
      and v.archived_at is null
      and p.id = v.product_id
      and p.shop_id = v_shop_id
      and p.archived_at is null
    returning v.* into v_variant;

  if v_variant.id is null then
    raise exception 'That product option is not active in your shop';
  end if;

  insert into public.stock_adjustments (
    shop_id, product_id, quantity_change, reason, created_by
  ) values (
    v_shop_id, v_variant.product_id, p_quantity,
    coalesce(nullif(btrim(p_reason), ''), 'restock'), auth.uid()
  );

  return v_variant;
end;
$function$;

revoke execute on function public.create_sale(uuid, text, text, integer, numeric, numeric, text, uuid) from public, anon;
revoke execute on function public.update_sale(uuid, integer, numeric, numeric, text) from public, anon;
revoke execute on function public.record_payment(uuid, numeric, boolean) from public, anon;
revoke execute on function public.restock_product(uuid, integer, text) from public, anon;
revoke execute on function public.restock_variant(uuid, integer, text) from public, anon;

grant execute on function public.create_sale(uuid, text, text, integer, numeric, numeric, text, uuid) to authenticated, service_role;
grant execute on function public.update_sale(uuid, integer, numeric, numeric, text) to authenticated, service_role;
grant execute on function public.record_payment(uuid, numeric, boolean) to authenticated, service_role;
grant execute on function public.restock_product(uuid, integer, text) to authenticated, service_role;
grant execute on function public.restock_variant(uuid, integer, text) to authenticated, service_role;
