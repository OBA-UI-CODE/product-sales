-- Reko: contact form submissions. Not shop-scoped — this is a general
-- inquiry to Reko as a company, submitted by anyone (logged in or not).
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  inquiry_type text not null default 'General inquiry',
  message text not null,
  created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;

-- Anyone (anon or authenticated) can submit a message.
create policy "anyone can submit a contact message"
  on contact_messages for insert
  with check (true);

-- No select policy for anon/authenticated — submissions are only
-- readable via the Supabase dashboard (service role), keeping them
-- private from the public API.
