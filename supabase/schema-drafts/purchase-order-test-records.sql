-- Draft only. Apply to a dedicated Supabase test project after project selection
-- and review. This table must not be used for real vehicle orders or payments.
create table public.purchase_order_test_records (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique
    check (reference ~ '^KA-[A-F0-9]{8}$'),
  access_key_hash text not null
    check (access_key_hash ~ '^[0-9a-f]{64}$'),
  vehicle_slug text not null,
  vehicle_snapshot jsonb not null
    check (vehicle_snapshot ->> 'demonstration' = 'true'),
  customer_name text not null
    check (char_length(customer_name) between 2 and 80),
  customer_email text not null
    check (char_length(customer_email) between 3 and 254),
  customer_phone text not null
    check (char_length(customer_phone) between 7 and 24),
  amount_minor bigint not null check (amount_minor > 0),
  currency_code text not null default 'USD'
    check (currency_code = 'USD'),
  status text not null default 'test_pending_payment'
    check (status in ('test_pending_payment', 'test_payment_simulated')),
  checkout_mode text not null default 'test' check (checkout_mode = 'test'),
  created_at timestamptz not null default now(),
  payment_simulated_at timestamptz,
  constraint test_payment_timestamp_matches_status check (
    (status = 'test_pending_payment' and payment_simulated_at is null)
    or (status = 'test_payment_simulated' and payment_simulated_at is not null)
  )
);

create index purchase_order_test_records_created_at_idx
  on public.purchase_order_test_records (created_at desc);

alter table public.purchase_order_test_records enable row level security;
revoke all privileges on table public.purchase_order_test_records from public, anon, authenticated;
grant usage on schema public to service_role;
grant select, insert, update on table public.purchase_order_test_records to service_role;
