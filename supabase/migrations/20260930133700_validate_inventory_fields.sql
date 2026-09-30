/* Browser clients can write inventory through the Data API, so keep the
   basic shape valid even when the server action is bypassed. */
alter table public.products
  add constraint products_stock_nonnegative check (stock_quantity >= 0) not valid,
  add constraint products_fields_bounded check (
    length(trim(name)) between 1 and 200
    and length(coalesce(category, '')) <= 100
  ) not valid;

alter table public.product_variants
  add constraint product_variants_stock_nonnegative check (stock_quantity >= 0) not valid,
  add constraint product_variants_label_bounded check (
    length(trim(label)) between 1 and 100
  ) not valid;

alter table public.products
  validate constraint products_stock_nonnegative;
alter table public.products
  validate constraint products_fields_bounded;
alter table public.product_variants
  validate constraint product_variants_label_bounded;

/* One pre-existing active variant is already at -1. NOT VALID still rejects
   every new negative write without rewriting the owner's historical value. */
