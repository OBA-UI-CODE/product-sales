/*
  Product variants — one product, several sizes / pack sizes, each with its own
  price and its own stock.

  "Relaxer" is the product; "Small", "Big", "Big 12-pack" are variants. Each
  variant counts its own stock, so selling a 12-pack takes one off the packs
  and leaves the singles alone.

  Variants are OPTIONAL. A product with none behaves exactly as before, using
  products.default_price and products.stock_quantity — every product that
  already exists keeps working untouched.
*/
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  -- Free text, not a fixed list: sizes differ per trade (Small/Big for
  -- relaxer, 35cl/50cl for drinks, 41/42 for shoes).
  label text not null,
  price numeric not null default 0,
  stock_quantity integer not null default 0,
  low_stock_threshold integer not null default 5,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists product_variants_shop_id_idx
  on public.product_variants (shop_id);
create index if not exists product_variants_product_id_idx
  on public.product_variants (product_id);
create index if not exists product_variants_shop_active_idx
  on public.product_variants (shop_id, stock_quantity)
  where archived_at is null;

/* Which variant a sale was for. Null for older sales and for products that
   have no variants, so nothing existing breaks. */
alter table public.sales
  add column if not exists variant_id uuid references public.product_variants(id);

create index if not exists sales_variant_id_idx on public.sales (variant_id);

-- Same tenant isolation as products: readable by the shop, writable by owner.
alter table public.product_variants enable row level security;

drop policy if exists "shop members can view variants" on public.product_variants;
create policy "shop members can view variants" on public.product_variants
  for select using (shop_id = (select current_shop_id()));

drop policy if exists "owner can insert variants" on public.product_variants;
create policy "owner can insert variants" on public.product_variants
  for insert with check (shop_id = (select current_shop_id()) and (select is_owner()));

drop policy if exists "owner can update variants" on public.product_variants;
create policy "owner can update variants" on public.product_variants
  for update using (shop_id = (select current_shop_id()) and (select is_owner()));

drop policy if exists "owner can delete variants" on public.product_variants;
create policy "owner can delete variants" on public.product_variants
  for delete using (shop_id = (select current_shop_id()) and (select is_owner()));
