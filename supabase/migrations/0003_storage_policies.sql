insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('issue-images', 'issue-images', false),
  ('payment-receipts', 'payment-receipts', false),
  ('asset-images', 'asset-images', false)
on conflict (id) do update set public = excluded.public;

create policy "avatars_public_read"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "avatars_user_write"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatars_user_update"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "issue_images_related_read"
on storage.objects for select
using (
  bucket_id = 'issue-images'
  and exists (
    select 1
    from public.issues
    where issues.id = ((storage.foldername(name))[1])::uuid
      and (
        public.is_apartment_member(issues.apartment_id)
        or public.is_apartment_landlord(issues.apartment_id)
      )
  )
);

create policy "issue_images_reporter_or_landlord_write"
on storage.objects for insert
with check (
  bucket_id = 'issue-images'
  and exists (
    select 1
    from public.issues
    where issues.id = ((storage.foldername(name))[1])::uuid
      and (
        issues.reporter_id = auth.uid()
        or public.is_apartment_landlord(issues.apartment_id)
      )
  )
);

create policy "payment_receipts_tenant_or_landlord_read"
on storage.objects for select
using (
  bucket_id = 'payment-receipts'
  and exists (
    select 1
    from public.payments
    join public.billing_periods
      on billing_periods.id = payments.billing_period_id
    where payments.id = ((storage.foldername(name))[1])::uuid
      and (
        payments.tenant_id = auth.uid()
        or public.is_apartment_landlord(billing_periods.apartment_id)
      )
  )
);

create policy "payment_receipts_tenant_write"
on storage.objects for insert
with check (
  bucket_id = 'payment-receipts'
  and exists (
    select 1
    from public.payments
    where payments.id = ((storage.foldername(name))[1])::uuid
      and payments.tenant_id = auth.uid()
  )
);

create policy "asset_images_members_read"
on storage.objects for select
using (
  bucket_id = 'asset-images'
  and (
    public.is_apartment_member(((storage.foldername(name))[1])::uuid)
    or public.is_apartment_landlord(((storage.foldername(name))[1])::uuid)
  )
);

create policy "asset_images_members_write"
on storage.objects for insert
with check (
  bucket_id = 'asset-images'
  and (
    public.is_apartment_member(((storage.foldername(name))[1])::uuid)
    or public.is_apartment_landlord(((storage.foldername(name))[1])::uuid)
  )
);
