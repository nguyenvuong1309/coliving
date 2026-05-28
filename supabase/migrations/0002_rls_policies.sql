alter table public.profiles enable row level security;
alter table public.apartments enable row level security;
alter table public.apartment_members enable row level security;
alter table public.assets enable row level security;
alter table public.borrow_requests enable row level security;
alter table public.issues enable row level security;
alter table public.issue_images enable row level security;
alter table public.billing_periods enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;

create or replace function public.is_apartment_member(target_apartment_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.apartment_members
    where apartment_id = target_apartment_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_apartment_landlord(target_apartment_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.apartments
    where id = target_apartment_id
      and landlord_id = auth.uid()
  );
$$;

create or replace function public.shares_apartment(target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.apartment_members mine
    join public.apartment_members theirs
      on theirs.apartment_id = mine.apartment_id
    where mine.user_id = auth.uid()
      and theirs.user_id = target_user_id
  );
$$;

create policy "profiles_select_related"
on public.profiles for select
using (id = auth.uid() or public.shares_apartment(id));

create policy "profiles_insert_self"
on public.profiles for insert
with check (id = auth.uid());

create policy "profiles_update_self"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "apartments_select_related"
on public.apartments for select
using (landlord_id = auth.uid() or public.is_apartment_member(id));

create policy "apartments_insert_landlord"
on public.apartments for insert
with check (landlord_id = auth.uid());

create policy "apartments_update_landlord"
on public.apartments for update
using (landlord_id = auth.uid())
with check (landlord_id = auth.uid());

create policy "apartments_delete_landlord"
on public.apartments for delete
using (landlord_id = auth.uid());

create policy "apartment_members_select_related"
on public.apartment_members for select
using (
  user_id = auth.uid()
  or public.is_apartment_member(apartment_id)
  or public.is_apartment_landlord(apartment_id)
);

create policy "apartment_members_insert_self_or_landlord"
on public.apartment_members for insert
with check (
  user_id = auth.uid()
  or public.is_apartment_landlord(apartment_id)
);

create policy "apartment_members_update_landlord"
on public.apartment_members for update
using (public.is_apartment_landlord(apartment_id))
with check (public.is_apartment_landlord(apartment_id));

create policy "apartment_members_delete_self_or_landlord"
on public.apartment_members for delete
using (user_id = auth.uid() or public.is_apartment_landlord(apartment_id));

create policy "assets_select_members"
on public.assets for select
using (public.is_apartment_member(apartment_id) or public.is_apartment_landlord(apartment_id));

create policy "assets_insert_members"
on public.assets for insert
with check (
  public.is_apartment_member(apartment_id)
  or public.is_apartment_landlord(apartment_id)
);

create policy "assets_update_owner_or_landlord"
on public.assets for update
using (owner_id = auth.uid() or public.is_apartment_landlord(apartment_id))
with check (owner_id = auth.uid() or public.is_apartment_landlord(apartment_id));

create policy "assets_delete_owner_or_landlord"
on public.assets for delete
using (owner_id = auth.uid() or public.is_apartment_landlord(apartment_id));

create policy "borrow_select_members"
on public.borrow_requests for select
using (public.is_apartment_member(apartment_id) or public.is_apartment_landlord(apartment_id));

create policy "borrow_insert_borrower"
on public.borrow_requests for insert
with check (
  borrower_id = auth.uid()
  and public.is_apartment_member(apartment_id)
);

create policy "borrow_update_participants_or_landlord"
on public.borrow_requests for update
using (
  borrower_id = auth.uid()
  or lender_id = auth.uid()
  or public.is_apartment_landlord(apartment_id)
)
with check (
  borrower_id = auth.uid()
  or lender_id = auth.uid()
  or public.is_apartment_landlord(apartment_id)
);

create policy "issues_select_members"
on public.issues for select
using (public.is_apartment_member(apartment_id) or public.is_apartment_landlord(apartment_id));

create policy "issues_insert_reporter"
on public.issues for insert
with check (reporter_id = auth.uid() and public.is_apartment_member(apartment_id));

create policy "issues_update_reporter_or_landlord"
on public.issues for update
using (reporter_id = auth.uid() or public.is_apartment_landlord(apartment_id))
with check (reporter_id = auth.uid() or public.is_apartment_landlord(apartment_id));

create policy "issue_images_select_members"
on public.issue_images for select
using (
  exists (
    select 1 from public.issues
    where issues.id = issue_images.issue_id
      and (public.is_apartment_member(issues.apartment_id) or public.is_apartment_landlord(issues.apartment_id))
  )
);

create policy "issue_images_insert_reporter_or_landlord"
on public.issue_images for insert
with check (
  exists (
    select 1 from public.issues
    where issues.id = issue_images.issue_id
      and (issues.reporter_id = auth.uid() or public.is_apartment_landlord(issues.apartment_id))
  )
);

create policy "billing_select_members"
on public.billing_periods for select
using (public.is_apartment_member(apartment_id) or public.is_apartment_landlord(apartment_id));

create policy "billing_insert_landlord"
on public.billing_periods for insert
with check (created_by = auth.uid() and public.is_apartment_landlord(apartment_id));

create policy "billing_update_landlord"
on public.billing_periods for update
using (public.is_apartment_landlord(apartment_id))
with check (public.is_apartment_landlord(apartment_id));

create policy "payments_select_tenant_or_landlord"
on public.payments for select
using (
  tenant_id = auth.uid()
  or exists (
    select 1 from public.billing_periods
    where billing_periods.id = payments.billing_period_id
      and public.is_apartment_landlord(billing_periods.apartment_id)
  )
);

create policy "payments_insert_landlord"
on public.payments for insert
with check (
  exists (
    select 1 from public.billing_periods
    where billing_periods.id = payments.billing_period_id
      and public.is_apartment_landlord(billing_periods.apartment_id)
  )
);

create policy "payments_update_tenant_or_landlord"
on public.payments for update
using (
  tenant_id = auth.uid()
  or exists (
    select 1 from public.billing_periods
    where billing_periods.id = payments.billing_period_id
      and public.is_apartment_landlord(billing_periods.apartment_id)
  )
)
with check (
  tenant_id = auth.uid()
  or exists (
    select 1 from public.billing_periods
    where billing_periods.id = payments.billing_period_id
      and public.is_apartment_landlord(billing_periods.apartment_id)
  )
);

create policy "notifications_select_own"
on public.notifications for select
using (user_id = auth.uid());

create policy "notifications_insert_related"
on public.notifications for insert
with check (
  user_id = auth.uid()
  or apartment_id is null
  or public.is_apartment_member(apartment_id)
  or public.is_apartment_landlord(apartment_id)
);

create policy "notifications_update_own"
on public.notifications for update
using (user_id = auth.uid())
with check (user_id = auth.uid());
