/*
  Revoking from `anon` alone did nothing, because Postgres grants EXECUTE on new
  functions to PUBLIC by default and anon inherits it. The grant has to be taken
  away from PUBLIC and handed back explicitly to the roles that need it.

  authenticated needs all of them: the RPCs are called with the user's session,
  and current_shop_id()/is_owner() are evaluated inside the RLS policies, which
  run as the querying role.

  service_role keeps access for the webhook and admin paths.
*/
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
from public;

grant execute on function
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
to authenticated, service_role;
