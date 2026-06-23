-- Feature 1: Quy chung & Chia tien thong minh (Shared Wallet)
-- Tables: expenses, expense_shares, settlements

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments(id) on delete cascade,
  payer_id uuid not null references public.profiles(id),
  title text not null,
  category text not null default 'other' check (category in ('food', 'household', 'utility', 'party', 'transport', 'other')),
  amount numeric(12,0) not null check (amount > 0),
  note text,
  receipt_image_url text,
  split_type text not null default 'equal' check (split_type in ('equal', 'exact', 'percentage')),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.expense_shares (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses(id) on delete cascade,
  member_id uuid not null references public.profiles(id),
  share_amount numeric(12,0) not null default 0,
  created_at timestamptz default now(),
  unique(expense_id, member_id)
);

create table if not exists public.settlements (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments(id) on delete cascade,
  from_user uuid not null references public.profiles(id),
  to_user uuid not null references public.profiles(id),
  amount numeric(12,0) not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
  note text,
  created_at timestamptz default now(),
  confirmed_at timestamptz
);

create index if not exists idx_expenses_apartment on public.expenses(apartment_id);
create index if not exists idx_expense_shares_expense on public.expense_shares(expense_id);
create index if not exists idx_settlements_apartment on public.settlements(apartment_id);

alter table public.expenses enable row level security;
alter table public.expense_shares enable row level security;
alter table public.settlements enable row level security;

drop trigger if exists trg_expenses_updated_at on public.expenses;
create trigger trg_expenses_updated_at
before update on public.expenses
for each row execute function public.set_updated_at();

-- expenses policies: members of the apartment can see; creator/payer can manage their own
create policy "expenses_select_members"
on public.expenses for select
using (public.is_apartment_member(apartment_id) or public.is_apartment_landlord(apartment_id));

create policy "expenses_insert_members"
on public.expenses for insert
with check (
  (public.is_apartment_member(apartment_id) or public.is_apartment_landlord(apartment_id))
  and created_by = auth.uid()
);

create policy "expenses_update_owner"
on public.expenses for update
using (created_by = auth.uid() or payer_id = auth.uid())
with check (created_by = auth.uid() or payer_id = auth.uid());

create policy "expenses_delete_owner"
on public.expenses for delete
using (created_by = auth.uid() or payer_id = auth.uid());

-- expense_shares policies: visible / manageable if the parent expense belongs to a member's apartment
create policy "expense_shares_select_members"
on public.expense_shares for select
using (
  exists (
    select 1 from public.expenses e
    where e.id = expense_shares.expense_id
      and (public.is_apartment_member(e.apartment_id) or public.is_apartment_landlord(e.apartment_id))
  )
);

create policy "expense_shares_manage_owner"
on public.expense_shares for all
using (
  exists (
    select 1 from public.expenses e
    where e.id = expense_shares.expense_id
      and (e.created_by = auth.uid() or e.payer_id = auth.uid())
  )
)
with check (
  exists (
    select 1 from public.expenses e
    where e.id = expense_shares.expense_id
      and (e.created_by = auth.uid() or e.payer_id = auth.uid())
  )
);

-- settlements policies: parties (from/to) can see; from_user creates; to_user confirms/rejects
create policy "settlements_select_parties"
on public.settlements for select
using (
  from_user = auth.uid()
  or to_user = auth.uid()
  or public.is_apartment_landlord(apartment_id)
);

create policy "settlements_insert_from"
on public.settlements for insert
with check (
  from_user = auth.uid()
  and (public.is_apartment_member(apartment_id) or public.is_apartment_landlord(apartment_id))
);

create policy "settlements_update_parties"
on public.settlements for update
using (from_user = auth.uid() or to_user = auth.uid())
with check (from_user = auth.uid() or to_user = auth.uid());
