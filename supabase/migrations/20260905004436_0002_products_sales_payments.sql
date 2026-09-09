-- Reko: shop-scoped operational tables

create table products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  name text not null,
  category text,
  default_price numeric(12,2) not null default 0,
  stock_quantity integer not null default 0,
  low_stock_threshold integer not null default 5,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table sales (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  product_id uuid references products(id),
  custom_item_name text,
  category text,
  quantity integer not null default 1,
  total_price numeric(12,2) not null,
  amount_paid numeric(12,2) not null default 0,
  seller_id uuid not null references profiles(id),
  debtor_name text,
  sold_at timestamptz not null default now(),
  edited_at timestamptz,
  created_at timestamptz not null default now(),
  constraint sales_item_check check (product_id is not null or custom_item_name is not null)
);

create table stock_adjustments (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity_change integer not null,
  reason text not null default 'restock',
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  sale_id uuid not null references sales(id) on delete cascade,
  amount numeric(12,2) not null,
  paid_at timestamptz not null default now(),
  recorded_by uuid references profiles(id)
);

alter table products enable row level security;
alter table sales enable row level security;
alter table stock_adjustments enable row level security;
alter table payments enable row level security;

-- Products: all shop members can read; only owner manages catalog
create policy "shop members can view products"
  on products for select
  using (shop_id = current_shop_id());

create policy "owner can insert products"
  on products for insert
  with check (shop_id = current_shop_id() and is_owner());

create policy "owner can update products"
  on products for update
  using (shop_id = current_shop_id() and is_owner());

create policy "owner can delete products"
  on products for delete
  using (shop_id = current_shop_id() and is_owner());

-- Sales: all shop members can read/write within their shop
create policy "shop members can view sales"
  on sales for select
  using (shop_id = current_shop_id());

create policy "shop members can insert sales"
  on sales for insert
  with check (shop_id = current_shop_id());

create policy "shop members can update sales"
  on sales for update
  using (shop_id = current_shop_id());

create policy "shop members can delete sales"
  on sales for delete
  using (shop_id = current_shop_id());

-- Stock adjustments: shop members can view; writes go through SECURITY DEFINER functions (0003)
create policy "shop members can view stock adjustments"
  on stock_adjustments for select
  using (shop_id = current_shop_id());

-- Payments: shop members can view; writes go through SECURITY DEFINER functions (0003)
create policy "shop members can view payments"
  on payments for select
  using (shop_id = current_shop_id());
