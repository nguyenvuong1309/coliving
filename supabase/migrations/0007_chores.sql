-- Tinh nang 3: Viec nha + Gamification
-- Bang chores + chore_assignments, theo style migration 0004.

create table if not exists public.chores (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments(id) on delete cascade,
  title text not null,
  recurrence text not null default 'once' check (recurrence in ('once', 'daily', 'weekly', 'monthly')),
  points int not null default 10,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.chore_assignments (
  id uuid primary key default gen_random_uuid(),
  chore_id uuid not null references public.chores(id) on delete cascade,
  assignee_id uuid not null references public.profiles(id),
  due_date date,
  status text not null default 'pending' check (status in ('pending', 'done', 'skipped')),
  completed_at timestamptz,
  points_awarded int not null default 0,
  created_at timestamptz default now()
);

create index if not exists idx_chores_apartment on public.chores(apartment_id);
create index if not exists idx_chore_assignments_chore on public.chore_assignments(chore_id);
create index if not exists idx_chore_assignments_assignee on public.chore_assignments(assignee_id);

alter table public.chores enable row level security;
alter table public.chore_assignments enable row level security;

drop trigger if exists trg_chores_updated_at on public.chores;
create trigger trg_chores_updated_at
before update on public.chores
for each row execute function public.set_updated_at();

-- Chores: thanh vien can ho xem duoc; thanh vien tao/quan ly.
create policy "chores_select_members"
on public.chores for select
using (public.is_apartment_member(apartment_id) or public.is_apartment_landlord(apartment_id));

create policy "chores_insert_members"
on public.chores for insert
with check (
  (public.is_apartment_member(apartment_id) or public.is_apartment_landlord(apartment_id))
  and created_by = auth.uid()
);

create policy "chores_update_members"
on public.chores for update
using (public.is_apartment_member(apartment_id) or public.is_apartment_landlord(apartment_id))
with check (public.is_apartment_member(apartment_id) or public.is_apartment_landlord(apartment_id));

create policy "chores_delete_owner_or_landlord"
on public.chores for delete
using (created_by = auth.uid() or public.is_apartment_landlord(apartment_id));

-- Chore assignments: gan voi chore -> kiem tra qua apartment cua chore.
create policy "chore_assignments_select_members"
on public.chore_assignments for select
using (
  exists (
    select 1 from public.chores
    where chores.id = chore_assignments.chore_id
      and (public.is_apartment_member(chores.apartment_id) or public.is_apartment_landlord(chores.apartment_id))
  )
);

create policy "chore_assignments_insert_members"
on public.chore_assignments for insert
with check (
  exists (
    select 1 from public.chores
    where chores.id = chore_assignments.chore_id
      and (public.is_apartment_member(chores.apartment_id) or public.is_apartment_landlord(chores.apartment_id))
  )
);

create policy "chore_assignments_update_members"
on public.chore_assignments for update
using (
  exists (
    select 1 from public.chores
    where chores.id = chore_assignments.chore_id
      and (public.is_apartment_member(chores.apartment_id) or public.is_apartment_landlord(chores.apartment_id))
  )
)
with check (
  exists (
    select 1 from public.chores
    where chores.id = chore_assignments.chore_id
      and (public.is_apartment_member(chores.apartment_id) or public.is_apartment_landlord(chores.apartment_id))
  )
);

create policy "chore_assignments_delete_members"
on public.chore_assignments for delete
using (
  exists (
    select 1 from public.chores
    where chores.id = chore_assignments.chore_id
      and (public.is_apartment_member(chores.apartment_id) or public.is_apartment_landlord(chores.apartment_id))
  )
);
