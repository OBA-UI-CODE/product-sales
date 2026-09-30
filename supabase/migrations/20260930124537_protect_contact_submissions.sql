/*
  Contact submissions now pass through the server action, which validates and
  bounds every field before using the service role. Direct Data API inserts
  would bypass those checks and permit unbounded anonymous database spam.
*/

drop policy if exists "anyone can submit a contact message"
  on public.contact_messages;

revoke insert, update, delete, truncate, references, trigger
  on table public.contact_messages
  from public, anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'contact_messages_lengths_valid'
      and conrelid = 'public.contact_messages'::regclass
  ) then
    alter table public.contact_messages
      add constraint contact_messages_lengths_valid check (
        length(name) between 1 and 200
        and length(email) between 3 and 320
        and length(inquiry_type) between 1 and 100
        and length(message) between 1 and 5000
      ) not valid;
  end if;
end;
$$;

alter table public.contact_messages
  validate constraint contact_messages_lengths_valid;

