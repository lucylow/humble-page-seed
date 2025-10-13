-- Fix security warnings

-- Update touch_updated_at function with search_path
create or replace function touch_updated_at() returns trigger 
language plpgsql
security definer
set search_path = public
as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$;

-- Update audit_if_changes function with search_path  
create or replace function audit_if_changes() returns trigger
language plpgsql
security definer
set search_path = public
as $$
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
$$;

-- Enable RLS on remaining tables
alter table transactions enable row level security;
alter table audit_logs enable row level security;

-- RLS for transactions: users can see transactions related to their deals
create policy "transactions_via_deals" on transactions for select using (
  exists (
    select 1 from deals d 
    where d.id = transactions.deals_id 
    and (d.creator = auth.uid() or exists (
      select 1 from invoices i where i.id = d.invoice_id and i.owner = auth.uid()
    ))
  )
);

-- Audit logs are read-only for admins via service role, no user policies needed