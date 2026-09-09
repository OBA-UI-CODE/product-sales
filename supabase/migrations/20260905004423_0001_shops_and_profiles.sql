-- Reko multi-tenant foundation: shops + profiles

create extension if not exists "pgcrypto";

create type role as enum ('owner', 'staff');
create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled');

create table shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  theme_color text default '#1D9E75',
  logo_url text,
  owner_id uuid, -- set after first profile is created (FK added after profiles exists)
  trial_ends_at timestamptz not null default (now() + interval '14 days'),
  subscription_status subscription_status not null default 'trialing',
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  shop_id uuid not null references shops(id) on delete cascade,
  name text not null,
  role role not null default 'staff',
  created_at timestamptz not null default now()
);

alter table shops
  add constraint shops_owner_id_fkey foreign key (owner_id) references profiles(id);

-- Helper: resolve the current logged-in user's shop_id
create or replace function current_shop_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select shop_id from profiles where id = auth.uid();
$$;

-- Helper: is the current user the owner of their shop?
create or replace function is_owner()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'owner'
  );
$$;

alter table shops enable row level security;
alter table profiles enable row level security;

-- Shops: a user can only see/update their own shop
create policy "shop members can view their shop"
  on shops for select
  using (id = current_shop_id());

create policy "owner can update their shop"
  on shops for update
  using (id = current_shop_id() and is_owner());

-- Profiles: shop-scoped visibility; only owner manages staff
create policy "shop members can view profiles in their shop"
  on profiles for select
  using (shop_id = current_shop_id());

create policy "owner can insert staff profiles in their shop"
  on profiles for insert
  with check (shop_id = current_shop_id() and is_owner());

create policy "owner can update profiles in their shop"
  on profiles for update
  using (shop_id = current_shop_id() and is_owner());

create policy "owner can delete staff profiles in their shop"
  on profiles for delete
  using (shop_id = current_shop_id() and is_owner() and id <> auth.uid());
