-- Every query in the app filters by shop_id, and RLS re-checks it on every row.
-- Without these, each shop's page load scans every other shop's rows too, so
-- the app gets slower for everyone as shops are added. Additive and reversible.

-- Dashboard + sales history: "this shop's sales, newest first, since <date>".
create index if not exists sales_shop_id_sold_at_idx
  on public.sales (shop_id, sold_at desc);

-- Foreign keys used for joins and for restoring stock on edit/delete.
create index if not exists sales_product_id_idx on public.sales (product_id);
create index if not exists sales_seller_id_idx  on public.sales (seller_id);

-- Products list and the dashboard's low-stock count.
create index if not exists products_shop_id_idx on public.products (shop_id);
create index if not exists products_shop_active_stock_idx
  on public.products (shop_id, stock_quantity)
  where archived_at is null;

-- current_shop_id() reads profiles by primary key, but staff lists read by shop.
create index if not exists profiles_shop_id_idx on public.profiles (shop_id);

-- Debts screen and payment history.
create index if not exists payments_shop_id_idx     on public.payments (shop_id);
create index if not exists payments_sale_id_idx     on public.payments (sale_id);
create index if not exists payments_recorded_by_idx on public.payments (recorded_by);

create index if not exists stock_adjustments_shop_id_idx    on public.stock_adjustments (shop_id);
create index if not exists stock_adjustments_product_id_idx on public.stock_adjustments (product_id);
create index if not exists stock_adjustments_created_by_idx on public.stock_adjustments (created_by);

create index if not exists shops_owner_id_idx on public.shops (owner_id);
