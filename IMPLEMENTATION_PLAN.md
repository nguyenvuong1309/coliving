# CoLiving — Kế Hoạch Triển Khai Chi Tiết

## Tổng quan môi trường

| Env | Supabase Project | URL | Region |
|-----|-----------------|-----|--------|
| **Development** | coliving-dev (`svfdvmntwzqaahpcmibx`) | `https://svfdvmntwzqaahpcmibx.supabase.co` | ap-southeast-1 |
| **Production** | coliving-prod (`oqhpngtdoxznlztpswhx`) | `https://oqhpngtdoxznlztpswhx.supabase.co` | ap-southeast-1 |

### Cách chạy theo môi trường
```bash
# Development
pnpm android:dev    # Android debug + .env.development
pnpm ios:dev        # iOS debug + .env.development

# Production
pnpm android:prod   # Android release + .env.production
pnpm ios:prod       # iOS release + .env.production
```

---

## Phase 1 — MVP (Tuần 1-6)

### Tuần 1-2: Foundation & Auth

#### 1.1 Project Structure
```
src/
├── config/
│   ├── env.d.ts              # TypeScript types cho react-native-config
│   └── supabase.ts           # Supabase client init
├── navigation/
│   ├── RootNavigator.tsx      # Auth check → điều hướng Landlord/Tenant
│   ├── AuthStack.tsx          # Welcome, SignIn, SignUp, ForgotPassword
│   ├── TenantStack.tsx        # Bottom tabs cho Tenant
│   └── LandlordStack.tsx     # Bottom tabs cho Landlord
├── screens/
│   ├── auth/
│   │   ├── SplashScreen.tsx       # (A1) Auto-login check
│   │   ├── WelcomeScreen.tsx      # (A2) Role selection
│   │   ├── SignUpScreen.tsx       # (A3) Registration form
│   │   ├── SignInScreen.tsx       # (A4) Login form
│   │   ├── ForgotPasswordScreen.tsx # (A5) Password reset
│   │   └── JoinApartmentScreen.tsx  # (A6) Invite code input
│   ├── tenant/
│   │   ├── HomeScreen.tsx         # (T1) Dashboard
│   │   ├── RoommateListScreen.tsx # (T2)
│   │   ├── borrow/               # T3, T4, T5
│   │   ├── issues/               # T6, T7, T8
│   │   ├── payments/             # T9, T10
│   │   ├── NotificationsScreen.tsx # (T11)
│   │   └── ProfileScreen.tsx      # (T12)
│   └── landlord/
│       ├── DashboardScreen.tsx    # (L1)
│       ├── apartment/             # L2, L3
│       ├── tenants/               # L4, L5
│       ├── assets/                # L6, L7
│       ├── issues/                # L8, L9
│       ├── payments/              # L10, L11, L12
│       ├── RevenueScreen.tsx      # (L13)
│       └── ProfileScreen.tsx      # (L14)
├── store/                    # Redux store
│   ├── index.ts
│   ├── rootReducer.ts
│   ├── rootSaga.ts
│   └── slices/
│       ├── authSlice.ts
│       ├── apartmentSlice.ts
│       ├── borrowSlice.ts
│       ├── issueSlice.ts
│       └── paymentSlice.ts
├── components/               # Shared UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── StatusBadge.tsx
│   ├── EmptyState.tsx
│   └── LoadingOverlay.tsx
├── hooks/                    # Custom hooks
│   ├── useAuth.ts
│   ├── useApartment.ts
│   └── useRealtime.ts
├── schemas/                  # Zod validation schemas
│   ├── auth.ts
│   ├── apartment.ts
│   ├── borrow.ts
│   ├── issue.ts
│   └── payment.ts
├── services/                 # Supabase API calls
│   ├── auth.ts
│   ├── apartment.ts
│   ├── borrow.ts
│   ├── issue.ts
│   ├── payment.ts
│   └── storage.ts
├── types/                    # TypeScript types
│   ├── database.ts           # Supabase DB types (generated)
│   └── navigation.ts         # Navigation param types
└── utils/
    ├── mmkv.ts               # MMKV storage helpers
    ├── notifications.ts      # Push notification setup
    └── formatters.ts         # Date, currency formatters
```

#### 1.2 Supabase Database Schema (cả dev & prod)

```sql
-- USERS (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('tenant', 'landlord')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- APARTMENTS
CREATE TABLE public.apartments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID NOT NULL REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  num_rooms INTEGER NOT NULL DEFAULT 1,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- APARTMENT_MEMBERS (tenant ↔ apartment)
CREATE TABLE public.apartment_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_name TEXT,
  rent_amount NUMERIC(12,0) DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(apartment_id, user_id)
);

-- ASSETS (đồ dùng trong căn hộ)
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.profiles(id),  -- NULL = đồ chung
  name TEXT NOT NULL,
  category TEXT,
  location TEXT,
  condition TEXT DEFAULT 'good',
  image_url TEXT,
  is_borrowable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- BORROW REQUESTS
CREATE TABLE public.borrow_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES public.apartments(id),
  asset_id UUID NOT NULL REFERENCES public.assets(id),
  borrower_id UUID NOT NULL REFERENCES public.profiles(id),
  lender_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'in_use', 'return_requested', 'returned')),
  note TEXT,
  borrow_duration TEXT,  -- e.g. "2 ngày"
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ISSUES (báo cáo sự cố)
CREATE TABLE public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES public.apartments(id),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id),
  category TEXT NOT NULL CHECK (category IN ('equipment', 'noise', 'hygiene', 'security', 'other')),
  location TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgent')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'reopened')),
  landlord_note TEXT,
  resolution_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ISSUE IMAGES
CREATE TABLE public.issue_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- BILLING PERIODS (kỳ thu tiền)
CREATE TABLE public.billing_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES public.apartments(id),
  month INTEGER NOT NULL,       -- 1-12
  year INTEGER NOT NULL,
  due_date DATE NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(apartment_id, month, year)
);

-- PAYMENTS (thanh toán từng tenant)
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_period_id UUID NOT NULL REFERENCES public.billing_periods(id),
  tenant_id UUID NOT NULL REFERENCES public.profiles(id),
  amount NUMERIC(12,0) NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (status IN ('unpaid', 'tenant_reported', 'confirmed', 'overdue')),
  payment_method TEXT,           -- 'bank_transfer', 'cash'
  receipt_image_url TEXT,
  paid_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES public.profiles(id),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  apartment_id UUID REFERENCES public.apartments(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 1.3 RLS Policies (ưu tiên bảo mật)
```sql
-- Profiles: user chỉ sửa profile mình, đọc được profile cùng apartment
-- Apartments: landlord CRUD, tenant chỉ đọc apartment mình thuộc
-- Borrow requests: đọc/tạo trong apartment mình
-- Issues: đọc trong apartment mình, tạo nếu là tenant
-- Payments: tenant chỉ xem CỦA MÌNH, landlord xem tất cả trong apartment
-- Notifications: chỉ xem của mình
```

#### 1.4 Dependencies cần cài (Tuần 1)
```bash
# Navigation
pnpm add @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack react-native-screens react-native-safe-area-context

# State management
pnpm add @reduxjs/toolkit react-redux redux-saga

# Forms & validation
pnpm add react-hook-form @hookform/resolvers zod

# Local storage
pnpm add react-native-mmkv

# UI & Animation
pnpm add react-native-reanimated react-native-gesture-handler

# Image handling
pnpm add react-native-image-picker

# Push notifications
pnpm add @react-native-firebase/app @react-native-firebase/messaging
```

#### 1.5 Công việc chi tiết Tuần 1-2

| Task | Chi tiết | Output |
|------|----------|--------|
| Setup Navigation | RootNavigator + AuthStack + role-based routing | Navigation hoạt động |
| Supabase Schema | Chạy SQL migration trên cả dev & prod | DB sẵn sàng |
| RLS Policies | Viết + test policies cho mỗi bảng | Bảo mật ở DB level |
| Auth Flow | SignUp → email verify → SignIn → role check → Home | 6 màn hình auth |
| MMKV Setup | Lưu token, role, apartment_id | Auto-login hoạt động |
| Redux Store | Setup store + authSlice + saga watchers | State management |
| Apartment Setup | Landlord tạo apartment + sinh invite code | L2, L3 |
| Join Apartment | Tenant nhập invite code → join | A6 |

---

### Tuần 3: Tenant Management & Item Borrowing

| Task | Chi tiết | Màn hình |
|------|----------|----------|
| Tenant list (Landlord) | Xem/thêm/xóa tenant | L4, L5 |
| Roommate list (Tenant) | Xem danh sách người cùng ở | T2 |
| Asset management | CRUD tài sản/đồ dùng | L6, L7 |
| Borrow - Create | Tenant tạo yêu cầu mượn | T4 |
| Borrow - List | Danh sách yêu cầu, filter trạng thái | T3 |
| Borrow - Detail & Actions | Approve/Reject/Return/Confirm | T5 |
| Borrow - Realtime | Subscribe borrow_requests changes | Realtime updates |
| borrowSlice + saga | Redux state + side effects | State management |

---

### Tuần 4: Issue Reporting

| Task | Chi tiết | Màn hình |
|------|----------|----------|
| Issue - Create | Form: category, location, urgency, description, photos | T7 |
| Issue - List | Filter theo status/category | T6, L8 |
| Issue - Detail | Timeline trạng thái, ghi chú landlord | T8, L9 |
| Issue - Actions | Landlord: tiếp nhận, ghi chú, resolve. Tenant: confirm/reopen | T8, L9 |
| Image upload | Upload ảnh sự cố lên Supabase Storage | Storage bucket |
| Issue - Realtime | Subscribe issues changes | Realtime updates |
| issueSlice + saga | Redux state + side effects | State management |

---

### Tuần 5: Payment Tracking & Push Notifications

| Task | Chi tiết | Màn hình |
|------|----------|----------|
| Billing - Create | Landlord tạo kỳ thu tiền, auto-generate payment records | L10 |
| Payment - Overview | Ai đã trả / chưa trả | L11 |
| Payment - Confirm | Landlord xác nhận thanh toán | L12 |
| Payment - History (Tenant) | Lịch sử thanh toán CỦA MÌNH | T9 |
| Payment - Detail (Tenant) | Báo đã trả + đính kèm biên lai | T10 |
| Push Notifications | FCM setup + Edge Function gửi notification | Background push |
| Notification triggers | Mượn đồ, sự cố, thanh toán, nhắc hạn | Edge Functions |
| paymentSlice + saga | Redux state + side effects | State management |

---

### Tuần 6: Dashboard, Testing & Polish

| Task | Chi tiết | Màn hình |
|------|----------|----------|
| Landlord Dashboard | Tổng thu tháng, sự cố chờ, thanh toán pending | L1 |
| Tenant Home | Nhắc thanh toán, yêu cầu mượn đang chờ | T1 |
| Notification center | Danh sách thông báo in-app | T11 |
| Profile/Settings | Thông tin cá nhân, đổi mật khẩu, logout | T12, L14 |
| Revenue History | Lịch sử doanh thu theo tháng | L13 |
| End-to-end testing | Test toàn bộ 4 flow chính | QA |
| Bug fixing | Fix issues từ testing | Stable MVP |

---

## Supabase Storage Buckets

```
avatars/           # Profile photos - public read
issue-images/      # Ảnh sự cố - authenticated read, apartment-scoped
payment-receipts/  # Ảnh biên lai - private, chỉ tenant + landlord
asset-images/      # Ảnh tài sản - authenticated read, apartment-scoped
```

---

## Edge Functions cần tạo

| Function | Trigger | Mô tả |
|----------|---------|-------|
| `send-push-notification` | HTTP | Gửi FCM/APNs notification |
| `create-billing-period` | HTTP | Tạo kỳ thu tiền + payment records cho tất cả tenant |
| `payment-reminder-cron` | Cron (daily) | Kiểm tra due_date → gửi nhắc T-3, T-1, overdue |
| `borrow-overdue-cron` | Cron (daily) | Kiểm tra due_date borrow → nhắc nhở + thông báo landlord |
| `generate-invite-code` | DB trigger | Sinh unique invite code khi tạo apartment |

---

## Nguyên tắc phát triển

1. **Schema trước, UI sau** — chạy migration trên dev trước, test kỹ, rồi apply lên prod
2. **RLS từ đầu** — không skip bảo mật, test mỗi policy
3. **Normalized Redux state** — entities pattern, tránh nested data
4. **Zod schema tái sử dụng** — dùng cho cả form validation và API response parsing
5. **MMKV chỉ là cache** — Supabase DB luôn là source of truth
6. **Develop trên dev, deploy lên prod** — không bao giờ test trực tiếp trên prod
