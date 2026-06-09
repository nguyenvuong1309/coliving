alter table public.payments
  add column if not exists rent_amount numeric(12,0),
  add column if not exists utility_total numeric(12,0) not null default 0,
  add column if not exists extra_charges jsonb not null default '[]'::jsonb;

update public.payments
set rent_amount = amount
where rent_amount is null;

create table if not exists public.utility_configs (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments(id) on delete cascade,
  utility_type text not null check (utility_type in ('electricity', 'water', 'internet', 'parking', 'other')),
  name text not null,
  pricing_type text not null default 'fixed' check (pricing_type in ('fixed', 'per_unit', 'tiered')),
  fixed_amount numeric(12,0),
  unit_price numeric(12,0),
  unit_name text,
  tiers jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(apartment_id, utility_type)
);

create table if not exists public.utility_readings (
  id uuid primary key default gen_random_uuid(),
  billing_period_id uuid not null references public.billing_periods(id) on delete cascade,
  tenant_id uuid not null references public.profiles(id),
  utility_config_id uuid not null references public.utility_configs(id),
  previous_reading numeric(12,2),
  current_reading numeric(12,2),
  usage_amount numeric(12,2),
  calculated_amount numeric(12,0) not null default 0,
  note text,
  created_at timestamptz default now(),
  unique(billing_period_id, tenant_id, utility_config_id)
);

create table if not exists public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token text not null,
  platform text not null check (platform in ('ios', 'android')),
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, token)
);

create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  payment_enabled boolean not null default true,
  issue_enabled boolean not null default true,
  borrow_enabled boolean not null default true,
  announcement_enabled boolean not null default true,
  push_enabled boolean not null default true,
  updated_at timestamptz default now()
);

alter table public.utility_configs enable row level security;
alter table public.utility_readings enable row level security;
alter table public.device_tokens enable row level security;
alter table public.notification_preferences enable row level security;

drop trigger if exists trg_utility_configs_updated_at on public.utility_configs;
create trigger trg_utility_configs_updated_at
before update on public.utility_configs
for each row execute function public.set_updated_at();

drop trigger if exists trg_device_tokens_updated_at on public.device_tokens;
create trigger trg_device_tokens_updated_at
before update on public.device_tokens
for each row execute function public.set_updated_at();

create policy "utility_configs_select_members"
on public.utility_configs for select
using (public.is_apartment_member(apartment_id) or public.is_apartment_landlord(apartment_id));

create policy "utility_configs_manage_landlord"
on public.utility_configs for all
using (public.is_apartment_landlord(apartment_id))
with check (public.is_apartment_landlord(apartment_id));

create policy "utility_readings_select_tenant_or_landlord"
on public.utility_readings for select
using (
  tenant_id = auth.uid()
  or exists (
    select 1
    from public.billing_periods
    where billing_periods.id = utility_readings.billing_period_id
      and public.is_apartment_landlord(billing_periods.apartment_id)
  )
);

create policy "utility_readings_manage_landlord"
on public.utility_readings for all
using (
  exists (
    select 1
    from public.billing_periods
    where billing_periods.id = utility_readings.billing_period_id
      and public.is_apartment_landlord(billing_periods.apartment_id)
  )
)
with check (
  exists (
    select 1
    from public.billing_periods
    where billing_periods.id = utility_readings.billing_period_id
      and public.is_apartment_landlord(billing_periods.apartment_id)
  )
);

create policy "device_tokens_manage_own"
on public.device_tokens for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "notification_preferences_manage_own"
on public.notification_preferences for all
using (user_id = auth.uid())
with check (user_id = auth.uid());
