-- Create invoice processing tables and security

-- invoices table
create table if not exists invoices (
  id uuid default gen_random_uuid() primary key,
  owner uuid references auth.users(id) on delete cascade,
  invoice_number text,
  date date,
  vendor_name text,
  buyer_name text,
  currency text default 'USD',
  total_amount numeric(20,6),
  tax numeric(20,6) default 0,
  discount numeric(20,6) default 0,
  parsed jsonb,
  parser_confidence numeric(5,4),
  status text default 'uploaded',
  storage_path text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- line items
create table if not exists invoice_line_items (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references invoices(id) on delete cascade,
  description text,
  qty numeric(20,6) default 1,
  unit_price numeric(20,6) default 0,
  line_total numeric(20,6),
  created_at timestamptz default now()
);

-- deals (escrow contracts)
create table if not exists deals (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references invoices(id) on delete restrict,
  creator uuid references auth.users(id) on delete set null,
  seller_address text,
  buyer_address text,
  amount numeric(20,6),
  currency text default 'USD',
  state text default 'draft',
  chain_tx_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- transactions
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  deals_id uuid references deals(id) on delete cascade,
  provider text,
  tx_id text,
  status text default 'pending',
  meta jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- parser feedback
create table if not exists parser_feedback (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references invoices(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  original_json jsonb,
  corrected_json jsonb,
  note text,
  created_at timestamptz default now()
);

-- audit logs
create table if not exists audit_logs (
  id uuid default gen_random_uuid() primary key,
  table_name text,
  record_id text,
  operation text,
  old_data jsonb,
  new_data jsonb,
  changed_by uuid references auth.users(id) null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_invoices_owner on invoices(owner);
create index if not exists idx_deals_invoice on deals(invoice_id);
create index if not exists idx_transactions_txid on transactions(tx_id);

-- Timestamp trigger function
create or replace function touch_updated_at() returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger trg_invoices_touch before update on invoices for each row execute procedure touch_updated_at();
create trigger trg_deals_touch before update on deals for each row execute procedure touch_updated_at();
create trigger trg_transactions_touch before update on transactions for each row execute procedure touch_updated_at();

-- Audit trigger function
create or replace function audit_if_changes() returns trigger as $$
declare
  v_old jsonb;
  v_new jsonb;
begin
  if (tg_op = 'DELETE') then
    v_old = to_jsonb(old);
    insert into audit_logs(table_name, record_id, operation, old_data, new_data, created_at)
      values (tg_table_name::text, coalesce(old.id::text, ''), tg_op, v_old, null, now());
    return old;
  elsif (tg_op = 'INSERT') then
    v_new = to_jsonb(new);
    insert into audit_logs(table_name, record_id, operation, old_data, new_data, created_at)
      values (tg_table_name::text, coalesce(new.id::text, ''), tg_op, null, v_new, now());
    return new;
  elsif (tg_op = 'UPDATE') then
    v_old = to_jsonb(old);
    v_new = to_jsonb(new);
    if v_old <> v_new then
      insert into audit_logs(table_name, record_id, operation, old_data, new_data, created_at)
        values (tg_table_name::text, coalesce(new.id::text, ''), tg_op, v_old, v_new, now());
    end if;
    return new;
  end if;
end;
$$ language plpgsql;

-- Attach audit triggers
create trigger audit_invoices after insert or update or delete on invoices for each row execute procedure audit_if_changes();
create trigger audit_deals after insert or update or delete on deals for each row execute procedure audit_if_changes();
create trigger audit_transactions after insert or update or delete on transactions for each row execute procedure audit_if_changes();

-- Enable RLS
alter table invoices enable row level security;
alter table deals enable row level security;
alter table invoice_line_items enable row level security;
alter table parser_feedback enable row level security;

-- RLS Policies for invoices
create policy "invoices_owner_select" on invoices for select using (auth.uid() = owner);
create policy "invoices_owner_insert" on invoices for insert with check (auth.uid() = owner);
create policy "invoices_owner_update" on invoices for update using (auth.uid() = owner) with check (auth.uid() = owner);
create policy "invoices_owner_delete" on invoices for delete using (auth.uid() = owner);

-- RLS for line items
create policy "line_items_invoice_owner" on invoice_line_items for all using (
  exists (select 1 from invoices i where i.id = invoice_line_items.invoice_id and i.owner = auth.uid())
) with check (
  exists (select 1 from invoices i where i.id = invoice_line_items.invoice_id and i.owner = auth.uid())
);

-- RLS for deals
create policy "deals_creator_or_invoice_owner" on deals for select using (
  creator = auth.uid() or exists (select 1 from invoices i where i.id = deals.invoice_id and i.owner = auth.uid())
);
create policy "deals_insert_creator" on deals for insert with check (creator = auth.uid());
create policy "deals_update_creator" on deals for update using (creator = auth.uid()) with check (creator = auth.uid());

-- RLS for feedback
create policy "feedback_by_owner" on parser_feedback for insert with check (
  auth.uid() = (select owner from invoices where id = parser_feedback.invoice_id)
);
create policy "feedback_select_owner" on parser_feedback for select using (
  auth.uid() = (select owner from invoices where id = parser_feedback.invoice_id)
);