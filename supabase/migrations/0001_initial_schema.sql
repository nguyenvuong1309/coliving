create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  role text not null check (role in ('tenant', 'landlord')),
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.apartments (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.profiles(id),
  name text not null,
  address text not null,
  num_rooms integer not null default 1,
  invite_code text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.apartment_members (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  room_name text,
  rent_amount numeric(12,0) not null default 0,
  joined_at timestamptz default now(),
  unique(apartment_id, user_id)
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments(id) on delete cascade,
  owner_id uuid references public.profiles(id),
  name text not null,
  category text,
  location text,
  condition text not null default 'good' check (condition in ('good', 'fair', 'poor')),
  image_url text,
  is_borrowable boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists public.borrow_requests (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments(id) on delete cascade,
  asset_id uuid not null references public.assets(id),
  borrower_id uuid not null references public.profiles(id),
  lender_id uuid not null references public.profiles(id),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'in_use', 'return_requested', 'returned')),
  note text,
  borrow_duration text,
  due_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id),
  category text not null check (category in ('equipment', 'noise', 'hygiene', 'security', 'other')),
  location text not null,
  urgency text not null default 'normal' check (urgency in ('normal', 'urgent')),
  title text not null,
  description text,
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'resolved', 'closed', 'reopened')),
  landlord_note text,
  resolution_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.issue_images (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  image_url text not null,
  created_at timestamptz default now()
);

create table if not exists public.billing_periods (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments(id) on delete cascade,
  month integer not null check (month between 1 and 12),
  year integer not null check (year >= 2020),
  due_date date not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz default now(),
  unique(apartment_id, month, year)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  billing_period_id uuid not null references public.billing_periods(id) on delete cascade,
  tenant_id uuid not null references public.profiles(id),
  amount numeric(12,0) not null check (amount >= 0),
  status text not null default 'unpaid'
    check (status in ('unpaid', 'tenant_reported', 'confirmed', 'overdue')),
  payment_method text check (payment_method in ('bank_transfer', 'cash') or payment_method is null),
  receipt_image_url text,
  paid_at timestamptz,
  confirmed_at timestamptz,
  confirmed_by uuid references public.profiles(id),
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  apartment_id uuid references public.apartments(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  data jsonb not null default '{}',
  is_read boolean not null default false,
  created_at timestamptz default now()
);

create index if not exists idx_apartment_members_user on public.apartment_members(user_id);
create index if not exists idx_apartment_members_apartment on public.apartment_members(apartment_id);
create index if not exists idx_assets_apartment on public.assets(apartment_id);
create index if not exists idx_borrow_requests_apartment on public.borrow_requests(apartment_id);
create index if not exists idx_issues_apartment on public.issues(apartment_id);
create index if not exists idx_billing_periods_apartment on public.billing_periods(apartment_id);
create index if not exists idx_payments_tenant on public.payments(tenant_id);
create index if not exists idx_notifications_user on public.notifications(user_id, is_read, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_apartments_updated_at on public.apartments;
create trigger trg_apartments_updated_at
before update on public.apartments
for each row execute function public.set_updated_at();

drop trigger if exists trg_borrow_requests_updated_at on public.borrow_requests;
create trigger trg_borrow_requests_updated_at
before update on public.borrow_requests
for each row execute function public.set_updated_at();

drop trigger if exists trg_issues_updated_at on public.issues;
create trigger trg_issues_updated_at
before update on public.issues
for each row execute function public.set_updated_at();

drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();
