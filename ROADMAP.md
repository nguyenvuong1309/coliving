# CoLiving — Roadmap Chi Tiết

> Tài liệu này mở rộng từ PLAN.md, chi tiết hóa từng Phase sau MVP.
> Phase 1 (MVP) đã hoàn thành — xem IMPLEMENTATION_PLAN.md.
> Dựa trên phân tích 13+ ứng dụng tương tự: Splitwise, OurFlat, Flatastic, Lozido, Jeasy, Buildium, AppFolio, RentRedi, TurboTenant, Common, Quarters, Hmlet, Roomi, Bilt Rewards.

---

## Tổng Quan Roadmap

```
Phase 1 (MVP)          ███████████████████████ DONE
Phase 2 (Core)         ░░░░░░░░░░░░░░░░░░░░░ 6-8 tuần
Phase 3 (Engagement)   ░░░░░░░░░░░░░░░░░░░░░ 6-8 tuần
Phase 4 (Professional) ░░░░░░░░░░░░░░░░░░░░░ 6-8 tuần
Phase 5 (Growth)       ░░░░░░░░░░░░░░░░░░░░░ 8-10 tuần
Phase 6 (Delight)      ░░░░░░░░░░░░░░░░░░░░░ Dài hạn
```

| Phase | Mục tiêu | Số tính năng | Màn hình mới | Bảng DB mới |
|-------|----------|-------------|-------------|-------------|
| 2 | App thực sự usable hàng ngày | 8 | +12 | +4 |
| 3 | Tăng tần suất mở app | 7 | +10 | +4 |
| 4 | Thuyết phục landlord chuyên nghiệp | 6 | +8 | +3 |
| 5 | Scale user base & tạo revenue | 7 | +10 | +3 |
| 6 | Tạo moat & differentiation | 6 | +6 | +2 |

**Tổng cộng sau tất cả phases: ~86 màn hình, ~26 bảng DB**

---

## Phase 1 — MVP (DONE)

### Tính năng đã hoàn thành

- [x] Auth: Email/password, Google OAuth, Apple OAuth
- [x] Role-based access: Tenant / Landlord
- [x] Apartment setup + invite code
- [x] Tenant management
- [x] Item borrowing (full flow)
- [x] Issue reporting (full flow)
- [x] Payment tracking (full flow)
- [x] In-app notifications (DB-based)
- [x] Landlord dashboard + revenue history
- [x] 40+ màn hình, 10 bảng DB

### Những gì CHƯA có (cần Phase 2+)

- Push notification thực (FCM/APNs) — chỉ có in-app notification
- Chat/messaging — phải dùng Zalo ngoài app
- Tính tiền điện/nước — chưa có
- Multi-apartment — landlord chỉ quản lý 1 apartment
- Chore management — chưa có
- Expense splitting — chưa có
- Export báo cáo — chưa có

---

## Phase 2 — Core Experience (6-8 tuần)

> **Mục tiêu:** Biến app từ "dùng được" thành "không thể thiếu". Giải quyết 3 pain point lớn nhất mà user feedback từ Phase 1: không có push notification thực, không tính được tiền điện nước, landlord chỉ quản lý được 1 căn hộ.

### 2.1 Push Notification thực (FCM/APNs)

**Tham khảo:** Mọi app đều có. Không có push = app "chết".

**Mô tả:** Tích hợp Firebase Cloud Messaging để gửi push notification thực sự đến thiết bị, không chỉ lưu trong DB.

**Chi tiết kỹ thuật:**

| Hạng mục | Chi tiết |
|----------|---------|
| **Dependencies mới** | `@react-native-firebase/app`, `@react-native-firebase/messaging` |
| **Supabase** | Bảng `device_tokens` mới, Edge Function `send-push-notification` |
| **Firebase Console** | Setup project, download `google-services.json` (Android) + `GoogleService-Info.plist` (iOS) |
| **APNs** | Upload APNs key lên Firebase cho iOS |

**Database schema:**

```sql
CREATE TABLE public.device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, token)
);
```

**Notification categories & triggers:**

| Category | Trigger | Người nhận | Ưu tiên |
|----------|---------|-----------|---------|
| `payment_due` | Cron: T-3 ngày trước hạn | Tenant chưa trả | Cao |
| `payment_overdue` | Cron: quá hạn | Tenant + Landlord | Khẩn cấp |
| `payment_reported` | Tenant báo đã trả | Landlord | Cao |
| `payment_confirmed` | Landlord xác nhận | Tenant | Bình thường |
| `issue_created` | Tenant tạo issue | Landlord | Cao/Khẩn cấp |
| `issue_updated` | Landlord cập nhật | Tenant reporter | Bình thường |
| `borrow_requested` | Tenant tạo request | Chủ đồ | Bình thường |
| `borrow_responded` | Chủ đồ approve/reject | Tenant requester | Bình thường |
| `borrow_overdue` | Cron: quá hạn trả | Borrower + Lender | Cao |
| `announcement` | Landlord đăng thông báo | Tất cả tenant | Bình thường |
| `chat_message` | Tin nhắn mới | Người nhận | Bình thường |

**Edge Functions cần tạo:**

```
supabase/functions/
├── send-push/              # Gửi FCM notification
│   └── index.ts            # Input: user_id[], title, body, data
├── payment-reminder-cron/  # Cron chạy hàng ngày 9:00 AM
│   └── index.ts            # Check due_date, gửi nhắc T-3, T-1, overdue
└── borrow-reminder-cron/   # Cron chạy hàng ngày 9:00 AM
    └── index.ts            # Check borrow due_date, nhắc khi sắp/quá hạn
```

**Màn hình mới/sửa:**

| Màn hình | Loại | Mô tả |
|----------|------|-------|
| NotificationSettingsScreen | Mới | Bật/tắt từng loại notification |
| Sửa ProfileScreen (cả 2 role) | Sửa | Thêm link đến Notification Settings |

**Files cần tạo/sửa:**

```
src/
├── utils/
│   └── notifications.ts        # SỬA: Setup FCM, request permission, get token, handle background
├── services/
│   └── deviceToken.ts          # MỚI: CRUD device_tokens trên Supabase
├── store/slices/
│   └── notificationSlice.ts    # SỬA: Thêm actions cho notification settings
├── screens/
│   └── shared/
│       └── NotificationSettingsScreen.tsx  # MỚI
└── hooks/
    └── usePushNotification.ts  # MỚI: Hook setup FCM + handle incoming notifications
```

**Thứ tự triển khai:**
1. Setup Firebase project + config files
2. Implement `usePushNotification` hook (request permission, get token, save to DB)
3. Tạo Edge Function `send-push`
4. Tạo DB trigger: khi INSERT vào `notifications` → gọi `send-push`
5. Tạo cron Edge Functions (payment-reminder, borrow-reminder)
6. Tạo NotificationSettingsScreen
7. Test trên cả iOS + Android device thật

---

### 2.2 Quản lý Tiện ích (Điện/Nước/Internet)

**Tham khảo:** Lozido, Jeasy — đây là tính năng #1 khiến landlord VN cài app.

**Mô tả:** Landlord nhập chỉ số đồng hồ điện/nước hàng tháng cho từng phòng. Hệ thống tự động tính tiền theo bậc thang hoặc đơn giá cố định. Tích hợp vào billing period.

**Database schema:**

```sql
-- Cấu hình đơn giá tiện ích cho từng apartment
CREATE TABLE public.utility_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
  utility_type TEXT NOT NULL CHECK (utility_type IN ('electricity', 'water', 'internet', 'parking', 'other')),
  name TEXT NOT NULL,                    -- "Tiền điện", "Tiền nước", "Internet", "Gửi xe"
  pricing_type TEXT NOT NULL DEFAULT 'fixed'
    CHECK (pricing_type IN ('fixed', 'per_unit', 'tiered')),
  fixed_amount NUMERIC(12,0),            -- Giá cố định (internet, gửi xe)
  unit_price NUMERIC(12,0),              -- Giá theo đơn vị (đ/kWh, đ/m3)
  unit_name TEXT,                         -- "kWh", "m3"
  tiers JSONB,                           -- Bậc thang: [{"from": 0, "to": 50, "price": 1806}, ...]
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(apartment_id, utility_type)
);

-- Ghi nhận tiện ích hàng tháng cho từng tenant
CREATE TABLE public.utility_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_period_id UUID NOT NULL REFERENCES public.billing_periods(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.profiles(id),
  utility_config_id UUID NOT NULL REFERENCES public.utility_configs(id),
  previous_reading NUMERIC(12,2),         -- Chỉ số cũ
  current_reading NUMERIC(12,2),          -- Chỉ số mới
  usage_amount NUMERIC(12,2),             -- = current - previous (auto-calculate)
  calculated_amount NUMERIC(12,0) NOT NULL, -- Số tiền sau khi tính
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(billing_period_id, tenant_id, utility_config_id)
);
```

**Bậc thang điện VN (mặc định, landlord có thể chỉnh):**

```json
{
  "electricity_tiers_vn": [
    { "from": 0,   "to": 50,  "price": 1806 },
    { "from": 51,  "to": 100, "price": 1866 },
    { "from": 101, "to": 200, "price": 2167 },
    { "from": 201, "to": 300, "price": 2729 },
    { "from": 301, "to": 400, "price": 3050 },
    { "from": 401, "to": null, "price": 3151 }
  ]
}
```

**Màn hình mới:**

| Màn hình | Role | Mô tả |
|----------|------|-------|
| UtilityConfigScreen | Landlord | Cấu hình đơn giá điện/nước/internet/gửi xe cho apartment |
| UtilityInputScreen | Landlord | Nhập chỉ số đồng hồ cho từng phòng trong billing period |
| UtilityDetailScreen | Tenant | Xem chi tiết tiền điện/nước tháng này (breakdown bậc thang) |
| Sửa CreateBillingScreen | Landlord | Thêm bước nhập tiện ích sau khi tạo billing period |
| Sửa PaymentDetailScreen | Tenant | Hiển thị breakdown: tiền thuê + điện + nước + phí khác |

**Files cần tạo/sửa:**

```
src/
├── services/
│   └── utility.ts                # MỚI: CRUD utility_configs, utility_readings
├── store/slices/
│   └── utilitySlice.ts           # MỚI: State management cho utilities
├── store/sagas/
│   └── utilitySaga.ts            # MỚI: Side effects
├── schemas/
│   └── utility.ts                # MỚI: Zod schemas cho form validation
├── utils/
│   └── utilityCalculator.ts      # MỚI: Hàm tính tiền theo bậc thang/đơn giá
├── screens/landlord/utility/
│   ├── UtilityConfigScreen.tsx   # MỚI
│   └── UtilityInputScreen.tsx    # MỚI
├── screens/tenant/utility/
│   └── UtilityDetailScreen.tsx   # MỚI
└── components/
    └── UtilityBreakdown.tsx      # MỚI: Component hiển thị breakdown chi tiết
```

**Sửa bảng payments:**

```sql
-- Thêm cột vào payments để lưu breakdown
ALTER TABLE public.payments
  ADD COLUMN rent_amount NUMERIC(12,0),           -- Tiền thuê gốc
  ADD COLUMN utility_total NUMERIC(12,0) DEFAULT 0, -- Tổng tiền tiện ích
  ADD COLUMN extra_charges JSONB DEFAULT '[]';      -- Phụ thu khác [{name, amount}]
-- amount = rent_amount + utility_total + sum(extra_charges)
```

**Thứ tự triển khai:**
1. Tạo bảng `utility_configs`, `utility_readings` + RLS
2. Implement `utilityCalculator.ts` (tính bậc thang VN)
3. UtilityConfigScreen — landlord cấu hình đơn giá
4. Sửa CreateBillingScreen — thêm bước nhập chỉ số
5. UtilityInputScreen — nhập chỉ số từng phòng
6. UtilityDetailScreen — tenant xem breakdown
7. Sửa PaymentDetailScreen — hiển thị breakdown đầy đủ

---

### 2.3 Multi-Apartment cho Landlord

**Tham khảo:** Lozido, Buildium, AppFolio — landlord VN thường có 2-10+ căn/khu trọ.

**Mô tả:** Landlord quản lý nhiều apartment. Dashboard tổng hợp cross-apartment. Switch nhanh giữa các apartment.

**Database changes:**

```sql
-- Không cần bảng mới — apartments đã hỗ trợ nhiều record cho 1 landlord_id
-- Chỉ cần sửa logic app: bỏ assumption "1 landlord = 1 apartment"

-- Thêm bảng lưu apartment đang active
-- (hoặc lưu trong MMKV, không cần bảng)
```

**Màn hình mới:**

| Màn hình | Mô tả |
|----------|-------|
| ApartmentListScreen | Danh sách tất cả apartment, tổng quan nhanh (số tenant, payment pending, issue open) |
| ApartmentSwitcher (component) | Bottom sheet hoặc dropdown chọn apartment đang xem |
| CrossApartmentDashboard | Dashboard tổng hợp: tổng doanh thu, tổng issue, tổng payment across all apartments |

**Logic thay đổi:**

| Hiện tại | Sau khi sửa |
|----------|------------|
| Landlord auto-load apartment duy nhất | Landlord chọn apartment từ list hoặc xem tổng hợp |
| `useApartment()` trả về 1 apartment | `useApartment()` trả về active apartment, `useApartments()` trả về tất cả |
| Dashboard chỉ hiển thị 1 apartment | Dashboard có mode: "Tổng hợp" vs "Theo apartment" |
| Mọi screen hardcode 1 apartment_id | Mọi screen lấy apartment_id từ active apartment context |

**Files cần tạo/sửa:**

```
src/
├── store/slices/
│   └── apartmentSlice.ts          # SỬA: Thêm apartments[] + activeApartmentId
├── hooks/
│   └── useApartment.ts            # SỬA: Support multi-apartment
├── screens/landlord/
│   ├── ApartmentListScreen.tsx    # MỚI
│   └── DashboardScreen.tsx        # SỬA: Mode tổng hợp / theo apartment
├── components/
│   └── ApartmentSwitcher.tsx      # MỚI: Bottom sheet chọn apartment
└── navigation/
    └── LandlordStack.tsx          # SỬA: Thêm ApartmentList screen
```

**Thứ tự triển khai:**
1. Refactor `apartmentSlice` — support array + active selection
2. Refactor `useApartment` hook
3. Tạo ApartmentSwitcher component
4. Tạo ApartmentListScreen
5. Sửa DashboardScreen — mode tổng hợp
6. Sửa tất cả screen landlord — dùng active apartment context
7. Test flow: tạo apartment thứ 2, switch qua lại

---

### 2.4 In-App Chat

**Tham khảo:** Roomi, RentRedi, Common — giữ communication trong app, tạo audit trail.

**Mô tả:** Chat 1:1 giữa members + group chat cho apartment. Gửi text + ảnh. Liên kết context (gửi link đến issue/payment/borrow trong chat).

**Database schema:**

```sql
-- Conversations (1:1 hoặc group)
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('direct', 'group')),
  name TEXT,                          -- NULL cho direct, tên cho group
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Members của conversation
CREATE TABLE public.conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_read_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'context_link')),
  metadata JSONB DEFAULT '{}',        -- Cho context_link: {entity_type, entity_id, preview_text}
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index cho performance
CREATE INDEX idx_messages_conversation_created
  ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_conversation_members_user
  ON public.conversation_members(user_id);
```

**Realtime subscription:**

```typescript
// Subscribe messages cho conversation đang mở
supabase
  .channel(`conversation:${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, handleNewMessage)
  .subscribe()
```

**Màn hình mới:**

| Màn hình | Mô tả |
|----------|-------|
| ConversationListScreen | Danh sách conversations, last message preview, unread badge |
| ChatScreen | Chat chi tiết, input bar, gửi text/ảnh |
| NewConversationScreen | Chọn member để tạo conversation mới |

**Files cần tạo:**

```
src/
├── services/
│   └── chat.ts                     # MỚI: CRUD conversations, messages
├── store/slices/
│   └── chatSlice.ts                # MỚI
├── store/sagas/
│   └── chatSaga.ts                 # MỚI
├── screens/shared/chat/
│   ├── ConversationListScreen.tsx  # MỚI
│   ├── ChatScreen.tsx              # MỚI
│   └── NewConversationScreen.tsx   # MỚI
├── components/
│   ├── ChatBubble.tsx              # MỚI
│   ├── ChatInput.tsx               # MỚI
│   ├── ContextLinkPreview.tsx      # MỚI: Preview card cho issue/payment/borrow link
│   └── UnreadBadge.tsx             # MỚI
└── hooks/
    └── useChat.ts                  # MỚI: Subscribe realtime messages
```

**Tính năng chi tiết:**

| Feature | Mô tả | Độ phức tạp |
|---------|-------|-------------|
| 1:1 Direct message | Nhắn tin giữa 2 member | Thấp |
| Group chat (apartment) | Auto-tạo group khi member join apartment | Thấp |
| Text messages | Gửi/nhận text realtime | Thấp |
| Image messages | Chụp/chọn ảnh, upload Supabase Storage, gửi URL | Trung bình |
| Context links | Từ issue/payment/borrow detail → "Gửi vào chat" → preview card | Trung bình |
| Unread count | Badge trên tab + conversation list | Trung bình |
| Push notification | Gửi push khi nhận tin nhắn mới (dùng từ 2.1) | Thấp |
| Typing indicator | Hiển thị "đang nhập..." | Thấp (dùng Supabase Presence) |

**Thứ tự triển khai:**
1. Tạo bảng DB + RLS policies
2. Service layer (`chat.ts`)
3. ConversationListScreen (hiển thị danh sách)
4. ChatScreen (gửi/nhận text realtime)
5. Image messages
6. Context links
7. Unread badge + push notification integration
8. Auto-tạo group chat khi apartment có member mới

---

### 2.5 UX Polish & Foundation

**Tham khảo:** Best practices từ mọi app phân tích.

| Tính năng | Mô tả | Files |
|-----------|-------|-------|
| Skeleton loading | Placeholder animation khi loading data | `components/Skeleton.tsx` |
| Pull-to-refresh | Kéo xuống để refresh trên mọi list screen | Sửa tất cả list screens |
| Image compression | Nén ảnh trước khi upload (giảm 80% size) | `utils/imageCompressor.ts` |
| Error boundary | Catch errors, hiển thị fallback UI | `components/ErrorBoundary.tsx` |
| Offline indicator | Banner "Không có kết nối" khi mất mạng | `components/OfflineBar.tsx`, `hooks/useNetwork.ts` |
| Deep linking | Mở đúng screen khi tap notification | `utils/deepLinking.ts`, sửa navigation config |
| Haptic feedback | Rung nhẹ khi nhấn button quan trọng | `utils/haptics.ts` |

**Dependencies mới:**

```bash
pnpm add react-native-compressor     # Image compression
pnpm add @react-native-community/netinfo  # Network state
```

---

### Phase 2 — Tổng kết

**Timeline đề xuất: 6-8 tuần**

| Tuần | Công việc |
|------|----------|
| 1-2 | Push Notification (FCM setup, Edge Functions, cron jobs) |
| 3-4 | Utility Billing (schema, calculator, screens) |
| 5 | Multi-Apartment (refactor state, apartment switcher, dashboard) |
| 6-7 | In-App Chat (schema, realtime, screens) |
| 8 | UX Polish + Testing + Bug fixing |

**KPIs đo lường thành công Phase 2:**

| KPI | Target | Cách đo |
|-----|--------|---------|
| Push notification delivery rate | > 90% | Firebase Analytics |
| Landlord sử dụng utility billing | > 70% landlord active | Supabase query |
| Landlord có 2+ apartment | > 30% landlord active | Supabase query |
| Chat messages/tuần/apartment | > 10 | Supabase query |
| Daily Active Users (DAU) | Tăng 50% so với Phase 1 | Analytics |

---

## Phase 3 — Daily Engagement (6-8 tuần)

> **Mục tiêu:** Biến app thành công cụ mở hàng ngày. Hiện user chỉ mở app khi trả tiền hoặc có vấn đề. Phase 3 thêm lý do mở app mỗi ngày.

### 3.1 Quản lý Việc nhà (Chore Management)

**Tham khảo:** OurFlat (gamification), Flatastic (rotation algorithm, fairness tracking).

**Mô tả:** Tạo & gán task cho members. Lịch rotation tự động. Gamification với điểm thưởng.

**Database schema:**

```sql
-- Chore templates (tái sử dụng)
CREATE TABLE public.chore_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                     -- "Dọn bếp", "Đổ rác", "Lau nhà"
  description TEXT,
  icon TEXT,                              -- Emoji hoặc icon name
  frequency TEXT NOT NULL DEFAULT 'weekly'
    CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  points INTEGER NOT NULL DEFAULT 10,     -- Điểm thưởng khi hoàn thành
  rotation_enabled BOOLEAN DEFAULT true,  -- Có tự xoay vòng không
  rotation_order UUID[] DEFAULT '{}',     -- Thứ tự xoay vòng user_ids
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Chore assignments (phân công cụ thể)
CREATE TABLE public.chore_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.chore_templates(id) ON DELETE CASCADE,
  apartment_id UUID NOT NULL REFERENCES public.apartments(id),
  assigned_to UUID NOT NULL REFERENCES public.profiles(id),
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'skipped', 'overdue')),
  completed_at TIMESTAMPTZ,
  proof_image_url TEXT,                   -- Ảnh chứng minh (tùy chọn)
  points_earned INTEGER DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Leaderboard tích lũy
CREATE TABLE public.chore_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0, -- Streak liên tiếp hoàn thành
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(apartment_id, user_id)
);
```

**Rotation algorithm:**

```typescript
// Khi đến lịch tạo assignment mới (cron hoặc DB trigger):
// 1. Lấy rotation_order từ template
// 2. Tìm assignment gần nhất → xác định user hiện tại trong rotation
// 3. Gán cho user tiếp theo trong danh sách
// 4. Skip user đang absent (nếu có absent system)
// 5. Tạo chore_assignment mới
```

**Màn hình mới:**

| Màn hình | Role | Mô tả |
|----------|------|-------|
| ChoreListScreen | Tenant | Danh sách việc nhà, filter "của tôi" / "tất cả", calendar view |
| ChoreDetailScreen | Tenant | Chi tiết task, nút "Hoàn thành" + chụp ảnh proof |
| ChoreCreateScreen | Landlord/Admin | Tạo chore template, set rotation |
| ChoreLeaderboardScreen | Tenant | Bảng xếp hạng, điểm, streak, huy hiệu |

**Files cần tạo:**

```
src/
├── services/
│   └── chore.ts
├── store/slices/
│   └── choreSlice.ts
├── store/sagas/
│   └── choreSaga.ts
├── schemas/
│   └── chore.ts
├── screens/tenant/chores/
│   ├── ChoreListScreen.tsx
│   ├── ChoreDetailScreen.tsx
│   └── ChoreLeaderboardScreen.tsx
├── screens/landlord/chores/
│   └── ChoreCreateScreen.tsx
└── components/
    ├── ChoreCard.tsx
    ├── ChoreCalendar.tsx         # Weekly calendar view
    ├── PointsBadge.tsx
    └── StreakIndicator.tsx
```

**Edge Functions:**

```
supabase/functions/
├── chore-rotation-cron/          # Cron hàng ngày: tạo assignments mới theo schedule
└── chore-overdue-cron/           # Cron hàng ngày: mark overdue, gửi nhắc nhở
```

---

### 3.2 Chia tiền linh hoạt (Expense Splitting)

**Tham khảo:** Splitwise (debt simplification algorithm), OurFlat (simple splitting).

**Mô tả:** Chia tiền chi phí chung (mua đồ ăn, giấy vệ sinh, gas...) giữa roommates. Không chỉ tiền thuê.

**Database schema:**

```sql
-- Shared expenses
CREATE TABLE public.shared_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
  paid_by UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL,                    -- "Mua giấy vệ sinh", "Gas tháng 4"
  amount NUMERIC(12,0) NOT NULL,
  category TEXT DEFAULT 'other'
    CHECK (category IN ('groceries', 'utilities', 'household', 'food', 'transport', 'entertainment', 'other')),
  split_type TEXT NOT NULL DEFAULT 'equal'
    CHECK (split_type IN ('equal', 'exact', 'percentage')),
  receipt_image_url TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Chi tiết chia cho từng người
CREATE TABLE public.expense_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES public.shared_expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  amount NUMERIC(12,0) NOT NULL,          -- Số tiền user này phải trả
  is_settled BOOLEAN DEFAULT false,       -- Đã settle chưa
  settled_at TIMESTAMPTZ,
  UNIQUE(expense_id, user_id)
);
```

**Debt simplification algorithm:**

```typescript
// Input: Danh sách ai nợ ai bao nhiêu
// Output: Số giao dịch tối thiểu để settle tất cả

// Ví dụ: A nợ B 100k, B nợ C 50k, C nợ A 30k
// Naive: 3 giao dịch
// Simplified: A trả B 70k, A trả C 20k = 2 giao dịch

function simplifyDebts(balances: Map<string, number>): Transaction[] {
  // 1. Tính net balance cho mỗi người
  // 2. Chia thành debtors (balance < 0) và creditors (balance > 0)
  // 3. Greedy matching: debtor lớn nhất match với creditor lớn nhất
  // 4. Repeat cho đến khi tất cả = 0
}
```

**Màn hình mới:**

| Màn hình | Mô tả |
|----------|-------|
| ExpenseListScreen | Danh sách expenses, tổng "bạn nợ" / "bạn được nợ" |
| ExpenseCreateScreen | Form tạo expense: title, amount, split type, chọn members |
| ExpenseBalanceScreen | Overview ai nợ ai, simplified debts, nút "Settle" |

**Files cần tạo:**

```
src/
├── services/
│   └── expense.ts
├── store/slices/
│   └── expenseSlice.ts
├── store/sagas/
│   └── expenseSaga.ts
├── schemas/
│   └── expense.ts
├── utils/
│   └── debtSimplifier.ts          # Thuật toán simplify debts
├── screens/tenant/expenses/
│   ├── ExpenseListScreen.tsx
│   ├── ExpenseCreateScreen.tsx
│   └── ExpenseBalanceScreen.tsx
└── components/
    ├── ExpenseCard.tsx
    ├── SplitSelector.tsx           # UI chọn split type + phân chia
    └── BalanceOverview.tsx         # Tổng nợ/được nợ
```

---

### 3.3 Bảng tin & Thông báo chung (Announcement Board)

**Tham khảo:** Common (community feed), Flatastic (pinboard), Hmlet (apartment rules).

**Mô tả:** Landlord/admin đăng thông báo chung. Nội quy căn hộ. Tenant xác nhận đã đọc.

**Database schema:**

```sql
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general'
    CHECK (type IN ('general', 'rule', 'maintenance', 'urgent')),
  is_pinned BOOLEAN DEFAULT false,
  requires_ack BOOLEAN DEFAULT false,     -- Yêu cầu xác nhận đã đọc
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  read_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);
```

**Màn hình mới:**

| Màn hình | Role | Mô tả |
|----------|------|-------|
| AnnouncementListScreen | Cả 2 | Danh sách thông báo, pinned lên đầu, badge "chưa đọc" |
| AnnouncementDetailScreen | Cả 2 | Chi tiết, danh sách ai đã đọc |
| AnnouncementCreateScreen | Landlord | Tạo thông báo, chọn type, pin, yêu cầu xác nhận |

---

### 3.4 Nâng cấp Borrow System

**Tham khảo:** Quarters (internal marketplace), Hmlet (feedback rating).

**Sửa đổi bổ sung cho borrow system hiện có:**

| Tính năng mới | Mô tả | DB changes |
|---------------|-------|------------|
| Marketplace view | Grid view với ảnh tất cả đồ mượn được | Không — dùng data assets hiện có |
| Rating sau trả đồ | 1-5 sao + comment sau khi trả | Thêm `rating`, `rating_comment` vào `borrow_requests` |
| Condition tracking | Ảnh trước/sau khi mượn | Thêm `borrow_condition_image`, `return_condition_image` vào `borrow_requests` |
| Overdue escalation | Quá 3 ngày → thông báo landlord | Edge Function cron |
| Borrow statistics | Đồ mượn nhiều nhất, người mượn nhiều nhất | Query aggregation |

---

### 3.5 Tenant Home Screen Redesign

**Mô tả:** Redesign home screen để hiển thị tất cả thông tin quan trọng trong ngày.

**Layout mới:**

```
┌─────────────────────────────────┐
│ Xin chào, [Tên]!        [🔔 3] │
├─────────────────────────────────┤
│ ⚡ Hôm nay                      │
│ ┌─────────────────────────────┐ │
│ │ 🧹 Dọn bếp (đến lượt bạn) │ │  ← Chore của ngày
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 💰 Tiền thuê T4: 5.000.000đ│ │  ← Payment reminder
│ │    Hạn: còn 3 ngày          │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 📌 Thông báo ghim              │
│ "Cắt nước ngày 10/4, 8h-12h"  │  ← Pinned announcement
├─────────────────────────────────┤
│ 📊 Tổng quan                    │
│ Bạn nợ: 150.000đ  |  Mượn: 2  │  ← Quick stats
├─────────────────────────────────┤
│ 💬 Tin nhắn mới (3)            │  ← Chat preview
└─────────────────────────────────┘
```

---

### Phase 3 — Tổng kết

**Timeline đề xuất: 6-8 tuần**

| Tuần | Công việc |
|------|----------|
| 1-2 | Chore Management (schema, rotation algorithm, screens) |
| 3-4 | Expense Splitting (schema, simplify algorithm, screens) |
| 5 | Announcement Board + Borrow System upgrade |
| 6 | Tenant Home Redesign |
| 7-8 | Integration testing + Bug fixing + UX polish |

**KPIs:**

| KPI | Target |
|-----|--------|
| Chore completion rate | > 60% tasks completed on time |
| Expense entries/tuần/apartment | > 5 |
| Announcement read rate | > 80% within 24h |
| DAU/MAU ratio | > 40% (app mở hàng ngày) |

---

## Phase 4 — Trust & Professionalism (6-8 tuần)

> **Mục tiêu:** Nâng tầm app từ "công cụ tiện ích" lên "nền tảng quản lý chuyên nghiệp". Thuyết phục landlord rằng app thay thế được sổ tay + Excel.

### 4.1 Hợp đồng thuê số (Digital Lease)

**Tham khảo:** Buildium (e-signature), TurboTenant (state-specific templates), Lozido (hợp đồng VN).

**Database schema:**

```sql
CREATE TABLE public.lease_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID NOT NULL REFERENCES public.profiles(id),
  name TEXT NOT NULL,                     -- "Hợp đồng phòng trọ cơ bản"
  content_html TEXT NOT NULL,             -- HTML template với {{placeholders}}
  placeholders JSONB NOT NULL,            -- [{key, label, type}]
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES public.apartments(id),
  tenant_id UUID NOT NULL REFERENCES public.profiles(id),
  template_id UUID REFERENCES public.lease_templates(id),
  content_html TEXT NOT NULL,             -- HTML đã điền thông tin
  content_data JSONB NOT NULL,            -- Data đã điền
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_tenant', 'signed', 'expired', 'terminated')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rent_amount NUMERIC(12,0) NOT NULL,
  deposit_amount NUMERIC(12,0) DEFAULT 0,
  landlord_signature_url TEXT,            -- Ảnh chữ ký
  tenant_signature_url TEXT,
  landlord_signed_at TIMESTAMPTZ,
  tenant_signed_at TIMESTAMPTZ,
  pdf_url TEXT,                           -- PDF đã ký generate bởi Edge Function
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Template mặc định (hợp đồng phòng trọ VN):**

Placeholders: `{{landlord_name}}`, `{{tenant_name}}`, `{{tenant_cccd}}`, `{{room_name}}`, `{{address}}`, `{{rent_amount}}`, `{{deposit_amount}}`, `{{start_date}}`, `{{end_date}}`, `{{electricity_rate}}`, `{{water_rate}}`

**Dependencies mới:**

```bash
pnpm add react-native-signature-canvas   # Ký tay trên màn hình
pnpm add react-native-html-to-pdf        # Generate PDF từ HTML (hoặc dùng Edge Function)
```

**Màn hình mới:**

| Màn hình | Role | Mô tả |
|----------|------|-------|
| LeaseTemplateListScreen | Landlord | Danh sách templates |
| LeaseTemplateEditScreen | Landlord | Tạo/sửa template |
| LeaseCreateScreen | Landlord | Điền thông tin → gửi cho tenant ký |
| LeaseSignScreen | Tenant | Xem hợp đồng → ký → xác nhận |
| LeaseDetailScreen | Cả 2 | Xem hợp đồng đã ký, download PDF |
| LeaseListScreen | Cả 2 | Danh sách hợp đồng (active/expired) |

**Edge Functions:**

```
supabase/functions/
├── generate-lease-pdf/        # Input: lease_id → Generate PDF → Upload Storage → Return URL
└── lease-expiry-cron/         # Cron hàng ngày: check end_date, nhắc nhở T-30, T-7
```

---

### 4.2 Quản lý Move-in / Move-out

**Tham khảo:** AppFolio (inspection checklist), Quarters (digital move-in/out), Hmlet (move-in kit).

**Database schema:**

```sql
CREATE TABLE public.inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES public.apartments(id),
  tenant_id UUID NOT NULL REFERENCES public.profiles(id),
  type TEXT NOT NULL CHECK (type IN ('move_in', 'move_out')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_review', 'completed', 'disputed')),
  total_deduction NUMERIC(12,0) DEFAULT 0,  -- Tổng khấu trừ (move_out)
  landlord_note TEXT,
  tenant_note TEXT,
  landlord_signature_url TEXT,
  tenant_signature_url TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.inspection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  area TEXT NOT NULL,                     -- "Phòng ngủ", "Bếp", "WC"
  item_name TEXT NOT NULL,                -- "Tường", "Sàn", "Đèn", "Điều hòa"
  condition TEXT NOT NULL DEFAULT 'good'
    CHECK (condition IN ('good', 'fair', 'poor', 'damaged', 'missing')),
  photo_urls TEXT[] DEFAULT '{}',
  note TEXT,
  deduction_amount NUMERIC(12,0) DEFAULT 0,  -- Khấu trừ nếu hư hỏng
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Màn hình mới:**

| Màn hình | Mô tả |
|----------|-------|
| InspectionCreateScreen | Landlord tạo inspection (chọn tenant, type), checklist items |
| InspectionChecklistScreen | Đi qua từng item, chụp ảnh, đánh giá condition |
| InspectionReviewScreen | Tenant xem kết quả, ký xác nhận hoặc dispute |
| InspectionDetailScreen | Xem inspection đã hoàn thành |

---

### 4.3 Báo cáo & Xuất dữ liệu

**Tham khảo:** Buildium (tax-ready reports), AppFolio (performance insights), TurboTenant (income/expense).

**Reports cho Landlord:**

| Report | Mô tả | Format |
|--------|-------|--------|
| Báo cáo thu chi tháng | Doanh thu - Chi phí = Lợi nhuận | Screen + PDF |
| Báo cáo tình trạng thanh toán | Ai trả đúng hạn, ai trễ, ai chưa trả | Screen + PDF |
| Báo cáo tiện ích | Tổng tiền điện/nước, so sánh theo tháng | Screen + CSV |
| Báo cáo sự cố | Số lượng, thời gian xử lý trung bình, chi phí | Screen |
| Báo cáo tổng kết năm | Tổng hợp tất cả metrics theo năm | PDF |

**Reports cho Tenant:**

| Report | Mô tả | Format |
|--------|-------|--------|
| Lịch sử thanh toán cá nhân | Tất cả payments + breakdown | Screen + PDF |
| Chi phí chung đã chia | Tổng expense splitting | Screen |

**Dependencies mới:**

```bash
pnpm add react-native-blob-util          # Download/share files
# PDF generation qua Edge Function (server-side)
```

**Edge Functions:**

```
supabase/functions/
└── generate-report/           # Input: report_type, apartment_id, date_range
                               # Output: PDF/CSV file URL
```

**Màn hình mới:**

| Màn hình | Mô tả |
|----------|-------|
| ReportListScreen | Landlord chọn loại report, khoảng thời gian |
| ReportViewScreen | Hiển thị report, nút Download PDF/CSV, nút Share |

---

### 4.4 Document Storage

**Tham khảo:** Lozido (quản lý CMND/CCCD), Buildium (document management).

**Database schema:**

```sql
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID REFERENCES public.apartments(id),
  owner_id UUID NOT NULL REFERENCES public.profiles(id),
  category TEXT NOT NULL
    CHECK (category IN ('cccd', 'lease', 'receipt', 'inspection', 'other')),
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,                         -- 'pdf', 'image'
  metadata JSONB DEFAULT '{}',            -- {cccd_number, issue_date, expiry_date...}
  is_private BOOLEAN DEFAULT true,        -- true = chỉ owner + landlord xem
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Supabase Storage bucket:**

```
documents/                # Private bucket
├── {apartment_id}/
│   ├── leases/
│   ├── inspections/
│   └── receipts/
└── {user_id}/
    └── personal/         # CMND/CCCD
```

---

### 4.5 Maintenance Feedback Rating

**Tham khảo:** Hmlet (1-5 sao sau mỗi lần sửa chữa).

**Database changes:**

```sql
ALTER TABLE public.issues
  ADD COLUMN tenant_rating INTEGER CHECK (tenant_rating BETWEEN 1 AND 5),
  ADD COLUMN tenant_feedback TEXT,
  ADD COLUMN rated_at TIMESTAMPTZ;
```

**UI:** Khi issue chuyển sang `resolved`, tenant nhận prompt đánh giá 1-5 sao + comment.

---

### 4.6 Tenant Profile nội bộ cho Landlord

**Database schema:**

```sql
-- Landlord ghi chú nội bộ về tenant (tenant không thấy)
CREATE TABLE public.tenant_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID NOT NULL REFERENCES public.profiles(id),
  tenant_id UUID NOT NULL REFERENCES public.profiles(id),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- View tổng hợp tenant profile (query, không phải bảng)
-- SELECT: on_time_payments, late_payments, total_issues_reported, avg_maintenance_rating,
--         borrow_return_on_time_rate, chore_completion_rate, lease_start_date
```

---

### Phase 4 — Tổng kết

**Timeline đề xuất: 6-8 tuần**

| Tuần | Công việc |
|------|----------|
| 1-2 | Digital Lease (templates, create, sign, PDF generation) |
| 3-4 | Move-in/Move-out Inspection (checklist, photos, signature) |
| 5 | Reports & Export (report generation, PDF/CSV) |
| 6 | Document Storage + Maintenance Rating |
| 7 | Tenant Profile cho Landlord |
| 8 | Testing + Bug fixing |

**KPIs:**

| KPI | Target |
|-----|--------|
| Leases created digitally | > 50% tenants mới có e-lease |
| Inspections completed | > 70% move-in/out có inspection |
| Reports generated/tháng | > 2 per landlord |
| Maintenance rating filled | > 60% resolved issues |

---

## Phase 5 — Growth & Monetization (8-10 tuần)

> **Mục tiêu:** Mở rộng user base qua marketplace, tạo revenue stream qua premium tier và payment gateway.

### 5.1 Tích hợp Thanh toán Online

**Tham khảo:** Bilt (rent payment), Buildium (ACH/card), RentRedi (in-app payment).

**Mô tả:** Tenant trả tiền trực tiếp trong app qua VNPay/MoMo/ZaloPay. Auto-confirm khi nhận tiền.

**Payment Gateway Options cho VN:**

| Gateway | Phí | Ưu điểm | Nhược điểm |
|---------|-----|---------|------------|
| **VNPay** | ~1.1% | Phổ biến nhất VN, hỗ trợ QR + ATM + visa | Setup phức tạp, cần đăng ký doanh nghiệp |
| **MoMo** | ~1.5% | 30M+ users, UX quen thuộc | API ít flexible |
| **ZaloPay** | ~1.2% | Tích hợp Zalo, phổ biến | Ít user hơn MoMo |
| **Stripe** (qua VN partner) | ~2.9% | API đẹp, global | Phí cao, cần intermediary |

**Đề xuất:** Bắt đầu với **VNPay** (phổ biến nhất) + **QR code** (đơn giản nhất).

**Flow:**

```
Tenant mở Payment Detail
    → Nhấn "Thanh toán online"
    → Chọn phương thức (VNPay QR / Chuyển khoản / MoMo)
    → [VNPay QR]: App generate QR → Tenant scan bằng banking app → VNPay webhook → Auto confirm
    → [Chuyển khoản]: Hiển thị STK + nội dung CK chuẩn → Tenant CK → Upload biên lai → Landlord confirm
    → [MoMo]: Redirect MoMo app → Thanh toán → Webhook → Auto confirm
```

**Database changes:**

```sql
ALTER TABLE public.payments
  ADD COLUMN payment_gateway TEXT,         -- 'vnpay', 'momo', 'zalopay', 'manual'
  ADD COLUMN transaction_id TEXT,          -- Gateway transaction ID
  ADD COLUMN gateway_response JSONB;       -- Raw response for debugging
```

**Edge Functions:**

```
supabase/functions/
├── create-vnpay-payment/     # Tạo payment URL/QR
├── vnpay-webhook/            # Nhận callback từ VNPay → auto confirm payment
├── create-momo-payment/      # Tạo payment request MoMo
└── momo-webhook/             # Nhận callback từ MoMo
```

**Màn hình sửa:**

| Màn hình | Thay đổi |
|----------|---------|
| PaymentDetailScreen (Tenant) | Thêm nút "Thanh toán online", hiển thị QR code |
| PaymentConfirmScreen (Landlord) | Hiển thị auto-confirmed payments |

---

### 5.2 Room Discovery / Tìm phòng

**Tham khảo:** Roomi (listing + matching), SpareRoom (room search), Lozido (đăng tin).

**Mô tả:** Landlord đăng phòng trống lên marketplace. User mới tìm phòng theo khu vực, giá, tiện nghi. Tạo thêm "đầu vào" user mới (hiện chỉ có invite code).

**Database schema:**

```sql
CREATE TABLE public.room_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES public.apartments(id),
  landlord_id UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  room_name TEXT,
  rent_amount NUMERIC(12,0) NOT NULL,
  deposit_amount NUMERIC(12,0) DEFAULT 0,
  area_sqm NUMERIC(6,1),                 -- Diện tích m2
  max_occupants INTEGER DEFAULT 1,
  amenities TEXT[] DEFAULT '{}',          -- ['wifi', 'ac', 'fridge', 'washing_machine', 'parking']
  photos TEXT[] DEFAULT '{}',             -- URLs
  location_lat NUMERIC(10,7),
  location_lng NUMERIC(10,7),
  district TEXT,                          -- "Quận 7", "Bình Thạnh"
  city TEXT DEFAULT 'Hồ Chí Minh',
  available_from DATE,
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.listing_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.room_listings(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  message TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'contacted', 'viewing_scheduled', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Màn hình mới:**

| Màn hình | Role | Mô tả |
|----------|------|-------|
| RoomSearchScreen | Public/Tenant | Tìm phòng: filter quận, giá, tiện nghi |
| RoomListingDetailScreen | Public | Chi tiết phòng: ảnh, mô tả, giá, amenities, map |
| RoomListingCreateScreen | Landlord | Tạo/sửa listing |
| MyListingsScreen | Landlord | Quản lý listings, xem inquiries |
| InquiryListScreen | Landlord | Danh sách người hỏi thuê |

**Dependencies mới:**

```bash
pnpm add react-native-maps              # Map view
```

---

### 5.3 Gamification & Reward System

**Tham khảo:** OurFlat (chore points), TurboTenant (RentRep), Bilt Rewards.

**Mô tả:** Hệ thống điểm thưởng tích hợp cross-feature. Điểm thưởng khi trả tiền đúng hạn, hoàn thành việc nhà, mượn/trả đúng hẹn.

**Database schema:**

```sql
CREATE TABLE public.reward_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  apartment_id UUID NOT NULL REFERENCES public.apartments(id),
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,                   -- 'payment_on_time', 'chore_completed', 'borrow_returned_on_time'
  source_type TEXT,                       -- 'payment', 'chore', 'borrow'
  source_id UUID,                         -- ID of related record
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                     -- "Trả tiền siêu đúng hạn"
  description TEXT,
  icon TEXT,                              -- Emoji or icon name
  condition JSONB NOT NULL,               -- {"type": "payment_streak", "count": 6}
  points_value INTEGER DEFAULT 0
);

CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  badge_id UUID NOT NULL REFERENCES public.badges(id),
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);
```

**Hệ thống điểm:**

| Hành động | Điểm | Điều kiện |
|-----------|------|-----------|
| Trả tiền đúng hạn | +50 | Trả trước hoặc đúng ngày due_date |
| Trả tiền trước hạn 3+ ngày | +100 | Bonus cho early payment |
| Hoàn thành chore đúng hạn | +10-30 | Tùy theo points của chore template |
| Trả đồ mượn đúng hẹn | +20 | Trả trước hoặc đúng due_date |
| Streak trả tiền đúng hạn | +200 | Bonus mỗi 6 tháng liên tiếp |

**Badges:**

| Badge | Điều kiện |
|-------|-----------|
| Công dân gương mẫu | 3 tháng liên tiếp trả đúng hạn |
| Siêu sạch sẽ | Hoàn thành 20 chores |
| Người hàng xóm tốt | 10 lần mượn/trả đúng hẹn |
| Cháy hết mình | Streak 30 ngày hoàn thành chore |

**Màn hình mới:**

| Màn hình | Mô tả |
|----------|-------|
| RewardDashboardScreen | Tổng điểm, badges, bảng xếp hạng apartment |
| BadgeDetailScreen | Chi tiết badge, điều kiện, tiến trình |

---

### 5.4 Landlord Premium (Monetization)

**Tham khảo:** Lozido (SaaS tiers), TurboTenant (freemium), Buildium (per-unit pricing).

**Pricing tiers:**

| Tier | Giá | Giới hạn | Tính năng |
|------|-----|----------|-----------|
| **Free** | 0đ | 1 apartment, ≤10 phòng | Tất cả tính năng cơ bản |
| **Pro** | 99.000đ/tháng | 3 apartments, ≤30 phòng | + Advanced reports, PDF export, priority support |
| **Business** | 249.000đ/tháng | Unlimited apartments & phòng | + Multi-admin, API access, custom branding, bulk communication |

**Database schema:**

```sql
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  plan TEXT NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'pro', 'business')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  payment_method TEXT,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Gating logic:**

```typescript
// Hook kiểm tra quyền
function useSubscription() {
  const plan = useAppSelector(state => state.auth.user?.subscription?.plan);
  return {
    canCreateApartment: (count: number) => {
      if (plan === 'free') return count < 1;
      if (plan === 'pro') return count < 3;
      return true; // business
    },
    canExportPDF: plan !== 'free',
    canBulkCommunicate: plan === 'business',
    // ...
  };
}
```

**Màn hình mới:**

| Màn hình | Mô tả |
|----------|-------|
| SubscriptionScreen | So sánh tiers, nút upgrade |
| PaymentScreen | Thanh toán subscription (VNPay/MoMo) |

---

### 5.5 Zalo Notification Integration

**Tham khảo:** Lozido — nhắc nhở qua Zalo OA, reach cao hơn push.

**Mô tả:** Bên cạnh push notification, gửi nhắc nhở qua Zalo Official Account. Phù hợp thói quen VN.

**Yêu cầu:**
- Đăng ký Zalo OA (Official Account)
- Zalo OA API để gửi tin nhắn
- User cần follow Zalo OA + link account

**Edge Function:**

```
supabase/functions/
└── send-zalo-notification/    # Input: phone/zalo_id, template, data
                               # Gọi Zalo OA API gửi tin nhắn
```

---

### 5.6 Auto Late Fee

**Tham khảo:** Buildium (auto late fee rules).

**Database changes:**

```sql
ALTER TABLE public.apartments
  ADD COLUMN late_fee_enabled BOOLEAN DEFAULT false,
  ADD COLUMN late_fee_type TEXT CHECK (late_fee_type IN ('fixed', 'percentage')),
  ADD COLUMN late_fee_amount NUMERIC(12,0),    -- Số tiền cố định hoặc %
  ADD COLUMN late_fee_grace_days INTEGER DEFAULT 0; -- Số ngày ân hạn

-- Edge Function: chạy sau grace_days → tự động thêm late fee vào payment
```

---

### 5.7 Referral System

**Tham khảo:** Common (tenant referral), Bilt (referral rewards).

**Database schema:**

```sql
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id),
  referred_id UUID REFERENCES public.profiles(id),  -- NULL cho đến khi register
  referral_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'registered', 'rewarded')),
  reward_type TEXT,                        -- 'points', 'discount'
  reward_value INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### Phase 5 — Tổng kết

**Timeline đề xuất: 8-10 tuần**

| Tuần | Công việc |
|------|----------|
| 1-3 | Payment Gateway Integration (VNPay, MoMo setup, webhooks) |
| 4-5 | Room Discovery (listings, search, map) |
| 6-7 | Gamification (points, badges, leaderboard) |
| 8 | Landlord Premium (tiers, gating, subscription payment) |
| 9 | Zalo Integration + Auto Late Fee + Referral |
| 10 | Testing + Bug fixing |

**Revenue targets:**

| Metric | Target (6 tháng sau launch) |
|--------|----------------------------|
| Landlord Pro subscribers | 100+ |
| Payment gateway transactions/tháng | 500+ |
| Revenue/tháng | 15-20 triệu đồng |

---

## Phase 6 — Delight & Differentiation (Dài hạn)

> **Mục tiêu:** Tạo moat (lợi thế cạnh tranh bền vững) qua AI, IoT, và community — những thứ đối thủ VN chưa có.

### 6.1 AI-Powered Features

| Tính năng | Mô tả | Công nghệ |
|-----------|-------|-----------|
| AI Issue Categorization | Auto-categorize issue từ mô tả + ảnh | OpenAI Vision API / Claude API |
| Smart Rent Suggestion | Gợi ý giá thuê dựa trên khu vực, diện tích, tiện nghi | ML model + market data |
| Smart Reminders | Nhắc nhở thông minh dựa trên pattern (tenant hay trả trễ → nhắc sớm hơn) | Rule-based + Edge Function |
| Chatbot FAQ | Bot trả lời câu hỏi thường gặp cho tenant mới | Claude API / OpenAI |
| Receipt OCR | Chụp hóa đơn → tự nhận diện số tiền | Google ML Kit / Tesseract |
| Expense Auto-categorize | Tự phân loại expense từ mô tả | NLP classification |

### 6.2 Community Features

| Tính năng | Mô tả |
|-----------|-------|
| Shared Calendar | Sinh nhật, sự kiện chung, lịch cắt nước/điện |
| Polls & Voting | Chọn nhà mạng internet, quyết định mua đồ chung |
| Internal Marketplace | Cư dân mua bán/trao đổi/tặng đồ đạc (mở rộng từ Borrow) |
| Tenant Welcome Flow | Onboarding sequence cho tenant mới: intro roommates, house rules, checklist |
| Quiet Hours | Đặt giờ yên tĩnh, nhắc nhở khi vi phạm |

### 6.3 Smart Home Integration (IoT)

| Tính năng | Mô tả | Hardware |
|-----------|-------|----------|
| Smart Lock | Mở cửa qua app, mã tạm cho khách | Tuya / Xiaomi smart lock |
| Utility Monitoring | Theo dõi điện nước realtime | IoT sensor + ESP32 |
| AC/Light Control | Điều khiển điều hòa/đèn khu vực chung | Smart plug + IR blaster |

### 6.4 Multi-language & Accessibility

| Tính năng | Mô tả |
|-----------|-------|
| English Support | Cho expat tenant |
| Dark Mode | Theme tối |
| Font Scaling | Hỗ trợ cỡ chữ lớn |
| Screen Reader | VoiceOver (iOS) / TalkBack (Android) |

### 6.5 Advanced Analytics (Landlord)

| Tính năng | Mô tả |
|-----------|-------|
| Occupancy Forecasting | Dự đoán phòng trống dựa trên lease end dates |
| Tenant Churn Prediction | Dự đoán tenant sắp dọn đi |
| Maintenance Cost Analysis | Phân tích chi phí sửa chữa theo loại, xu hướng |
| ROI Calculator | Tính lợi nhuận cho từng apartment |
| Benchmark Comparison | So sánh performance với average (nếu có đủ data) |

### 6.6 Platform Expansion

| Tính năng | Mô tả |
|-----------|-------|
| Web Dashboard (Landlord) | Next.js web app cho landlord quản lý trên máy tính |
| Tablet Layout | Optimized layout cho iPad/tablet |
| API for Partners | Public API cho third-party integration |
| White-label | Cho phép property management companies dùng brand riêng |

---

## Phụ lục A — Tổng hợp Database Schema theo Phase

| Phase | Bảng mới | Bảng sửa |
|-------|---------|----------|
| 1 (DONE) | profiles, apartments, apartment_members, assets, borrow_requests, issues, issue_images, billing_periods, payments, notifications | — |
| 2 | device_tokens, utility_configs, utility_readings, conversations, conversation_members, messages | payments (thêm breakdown columns) |
| 3 | chore_templates, chore_assignments, chore_points, shared_expenses, expense_splits, announcements, announcement_reads | borrow_requests (thêm rating, condition images) |
| 4 | lease_templates, leases, inspections, inspection_items, documents, tenant_notes | issues (thêm rating) |
| 5 | room_listings, listing_inquiries, reward_points, badges, user_badges, subscriptions, referrals | apartments (thêm late fee config), payments (thêm gateway info) |
| 6 | polls, poll_votes, calendar_events, marketplace_items | — |

---

## Phụ lục B — Tổng hợp Dependencies theo Phase

| Phase | Dependencies mới |
|-------|-----------------|
| 1 (DONE) | react-navigation, redux-toolkit, redux-saga, supabase-js, react-hook-form, zod, mmkv, reanimated, gesture-handler, image-picker, google-signin, apple-authentication |
| 2 | @react-native-firebase/app, @react-native-firebase/messaging, react-native-compressor, @react-native-community/netinfo |
| 3 | (Không có dependencies mới lớn) |
| 4 | react-native-signature-canvas, react-native-blob-util |
| 5 | react-native-maps, vnpay-sdk (hoặc webview), momo-sdk |
| 6 | react-native-ble-plx (IoT), i18next (multi-language) |

---

## Phụ lục C — Tổng hợp Edge Functions theo Phase

| Phase | Edge Functions |
|-------|--------------|
| 2 | send-push, payment-reminder-cron, borrow-reminder-cron |
| 3 | chore-rotation-cron, chore-overdue-cron |
| 4 | generate-lease-pdf, lease-expiry-cron, generate-report |
| 5 | create-vnpay-payment, vnpay-webhook, create-momo-payment, momo-webhook, send-zalo-notification, late-fee-cron |
| 6 | ai-categorize-issue, smart-rent-suggestion, chatbot |

---

## Phụ lục D — Tổng hợp Màn hình theo Phase

| Phase | Số màn hình mới | Tổng tích lũy |
|-------|----------------|---------------|
| 1 (DONE) | ~40 | 40 |
| 2 | +12 | 52 |
| 3 | +10 | 62 |
| 4 | +8 | 70 |
| 5 | +10 | 80 |
| 6 | +6 | 86 |

---

## Phụ lục E — Risk Matrix theo Phase

| Phase | Risk | Probability | Impact | Mitigation |
|-------|------|------------|--------|------------|
| 2 | FCM setup phức tạp trên iOS | Cao | Cao | Test trên device thật sớm, có fallback polling |
| 2 | Chat performance khi nhiều messages | Trung bình | Trung bình | Pagination, chỉ load 50 messages gần nhất |
| 3 | Chore rotation edge cases (member join/leave) | Trung bình | Thấp | Handle gracefully, re-calculate rotation |
| 3 | Debt simplification algorithm bugs | Thấp | Cao | Unit test kỹ, manual override option |
| 4 | E-signature legal validity ở VN | Trung bình | Trung bình | Disclaimer: "mang tính tham khảo", khuyến khích ký thêm bản cứng |
| 4 | PDF generation quality | Trung bình | Thấp | Server-side generation (Edge Function), không client-side |
| 5 | Payment gateway integration complexity | Cao | Cao | Bắt đầu với QR code đơn giản, sandbox test kỹ |
| 5 | Premium conversion rate thấp | Trung bình | Cao | Free tier phải đủ tốt để giữ user, premium tạo giá trị rõ ràng |
| 6 | AI cost per request | Trung bình | Trung bình | Cache results, rate limit, dùng smaller models |
| 6 | IoT hardware compatibility | Cao | Trung bình | Chỉ support 2-3 brands phổ biến (Tuya, Xiaomi) |

---

> **Ghi chú cuối:** Roadmap này là living document — cần review và điều chỉnh sau mỗi Phase dựa trên user feedback thực tế. Thứ tự tính năng trong mỗi Phase có thể thay đổi dựa trên feedback, nhưng thứ tự giữa các Phase nên giữ nguyên vì có dependency chain.
