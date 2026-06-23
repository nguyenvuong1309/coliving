create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  body text not null,
  attachment_url text,
  reply_to uuid references public.messages(id) on delete set null,
  entity_type text check (entity_type in ('borrow', 'issue', 'payment', 'expense')),
  entity_id uuid,
  created_at timestamptz default now()
);

create index if not exists idx_messages_apartment_created
  on public.messages (apartment_id, created_at desc);

create table if not exists public.message_reads (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz default now(),
  primary key (message_id, user_id)
);

alter table public.messages enable row level security;
alter table public.message_reads enable row level security;

create policy "messages_select_members"
on public.messages for select
using (public.is_apartment_member(apartment_id) or public.is_apartment_landlord(apartment_id));

create policy "messages_insert_members"
on public.messages for insert
with check (
  sender_id = auth.uid()
  and (public.is_apartment_member(apartment_id) or public.is_apartment_landlord(apartment_id))
);

create policy "messages_delete_own"
on public.messages for delete
using (sender_id = auth.uid());

create policy "message_reads_select_members"
on public.message_reads for select
using (
  exists (
    select 1
    from public.messages m
    where m.id = message_reads.message_id
      and (public.is_apartment_member(m.apartment_id) or public.is_apartment_landlord(m.apartment_id))
  )
);

create policy "message_reads_manage_own"
on public.message_reads for all
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.messages m
    where m.id = message_reads.message_id
      and (public.is_apartment_member(m.apartment_id) or public.is_apartment_landlord(m.apartment_id))
  )
);

alter publication supabase_realtime add table public.messages;
