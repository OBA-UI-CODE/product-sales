/*
  Two clean-ups before the app is exposed on a public URL.

  1. Adding the variant argument created a SECOND create_sale overload rather
     than replacing the old one, so both existed. The app always passes
     p_variant_id now, so the 7-argument version is dead weight — and dead
     weight that still writes to sales is worth removing rather than leaving
     for someone to call by accident.

  2. These are SECURITY DEFINER functions, which run with the definer's
     rights. They all derive the shop from auth.uid() and refuse when there
     isn't one, so an anonymous call already fails — but there is no reason
     for the anon role to be able to reach them at all. Revoking EXECUTE
     removes the surface instead of relying on the guard inside.
*/

drop function if exists public.create_sale(uuid, text, text, integer, numeric, numeric, text);

revoke execute on function
  public.create_sale(uuid, text, text, integer, numeric, numeric, text, uuid),
  public.update_sale(uuid, integer, numeric, numeric, text),
  public.delete_sale(uuid),
  public.record_payment(uuid, numeric, boolean),
  public.restock_product(uuid, integer, text),
  public.restock_variant(uuid, integer, text),
  public.complete_onboarding(text, text, text, text, text, numeric, integer),
  public.current_shop_id(),
  public.is_owner(),
  public.shop_can_write()
from anon;
