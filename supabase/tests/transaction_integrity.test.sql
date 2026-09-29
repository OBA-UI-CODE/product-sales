begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(10);

insert into public.shops (id, name, trial_ends_at)
values ('10000000-0000-0000-0000-000000000001', 'Integrity test shop', now() + interval '90 days');

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '20000000-0000-0000-0000-000000000001',
  'authenticated', 'authenticated', 'integrity@example.test', '', now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now()
);

insert into public.profiles (id, shop_id, name, role)
values (
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'Integrity owner',
  'owner'
);

update public.shops
set owner_id = '20000000-0000-0000-0000-000000000001'
where id = '10000000-0000-0000-0000-000000000001';

insert into public.products (id, shop_id, name, default_price, stock_quantity)
values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Product one', 100, 10),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Product two', 50, 10);

insert into public.product_variants (id, shop_id, product_id, label, price, stock_quantity)
values (
  '40000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000002',
  'Pack',
  50,
  10
);

insert into public.sales (
  id, shop_id, product_id, quantity, total_price, amount_paid, seller_id, debtor_name
) values (
  '50000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  1, 100, 40,
  '20000000-0000-0000-0000-000000000001',
  'Test debtor'
);

select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select throws_ok(
  $$ select public.create_sale(null, 'Item', null, 0, 100, 0, null, null) $$,
  'P0001', 'Quantity must be greater than zero',
  'create_sale rejects zero quantity'
);

select throws_ok(
  $$ select public.create_sale(null, 'Item', null, 1, -1, 0, null, null) $$,
  'P0001', 'Total price cannot be negative',
  'create_sale rejects a negative total'
);

select throws_ok(
  $$ select public.create_sale(null, 'Item', null, 1, 100, 101, null, null) $$,
  'P0001', 'Amount paid must be between zero and the total price',
  'create_sale rejects overpayment'
);

select throws_ok(
  $$ select public.create_sale(
    '30000000-0000-0000-0000-000000000001', null, null, 1, 100, 0, null,
    '40000000-0000-0000-0000-000000000001'
  ) $$,
  'P0001', 'That product option does not belong to the selected product',
  'create_sale rejects a variant from another product'
);

select lives_ok(
  $$ select public.create_sale(null, 'Walk-in item', 'Other', 1, 25, 0, null, null) $$,
  'create_sale accepts a valid custom-item sale'
);

select throws_ok(
  $$ select public.restock_product('30000000-0000-0000-0000-000000000001', -1, 'bad') $$,
  'P0001', 'Restock quantity must be greater than zero',
  'restock_product rejects a negative quantity'
);

select throws_ok(
  $$ select public.record_payment('50000000-0000-0000-0000-000000000001', 61, false) $$,
  'P0001', 'Payment cannot be greater than the outstanding balance',
  'record_payment rejects payment above the balance'
);

select throws_ok(
  $$ select public.record_payment('50000000-0000-0000-0000-000000000001', 0, false) $$,
  'P0001', 'Payment amount must be greater than zero',
  'record_payment rejects zero'
);

select lives_ok(
  $$ select public.record_payment('50000000-0000-0000-0000-000000000001', null, true) $$,
  'record_payment accepts paying the exact balance'
);

select throws_ok(
  $$ select public.record_payment('50000000-0000-0000-0000-000000000001', 1, false) $$,
  'P0001', 'This sale is already fully paid',
  'record_payment rejects payment on a settled sale'
);

select * from finish();
rollback;

