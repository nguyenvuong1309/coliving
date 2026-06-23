# Kế hoạch tính năng nổi bật — CoLiving

> Mục tiêu: bổ sung các tính năng tạo khác biệt cho app co-living, tận dụng tối đa hạ tầng sẵn có (Supabase + RLS, Redux Toolkit + redux-saga, notification engine, RevenueCat).

## Tổng quan 4 tính năng

| # | Tính năng | Giá trị | Độ ưu tiên |
|---|-----------|---------|-----------|
| 1 | **Quỹ chung & Chia tiền thông minh** (Shared Wallet) | Giải nỗi đau lớn nhất của ở ghép — tiền nong. Tái dùng payment infra. Mở khóa RevenueCat. | 🏆 Flagship |
| 2 | Chat / nhắn tin theo căn hộ | Giảm phụ thuộc Zalo, gắn vào luồng mượn đồ/báo hỏng | P1 |
| 3 | Việc nhà + Gamification | Tăng engagement, lịch xoay vòng + điểm thưởng | P2 |
| 4 | Trợ lý AI co-living | Quét hóa đơn (OCR), giải thích chi phí, tư vấn | P2 (Premium) |

---

## Tính năng 1 — Quỹ chung & Chia tiền thông minh (Flagship)

### Mô tả
Bất kỳ thành viên tạo khoản chi chung (đi chợ, đồ dùng, tiệc...), chọn người tham gia & cách chia. App tính **nợ ròng (net balance)** tối giản giữa các thành viên và cho phép **tất toán (settle up)** với cơ chế xác nhận 2 chiều giống luồng payment hiện có.

### Database (migration `0005_shared_expenses.sql`)
- `expenses`: id, apartment_id, payer_id (người trả trước), title, category, amount, note, receipt_image_url, split_type (`equal`|`exact`|`percentage`), created_by, created_at, updated_at
- `expense_shares`: id, expense_id, member_id (user), share_amount, created_at — ai nợ bao nhiêu trong khoản đó
- `settlements`: id, apartment_id, from_user, to_user, amount, status (`pending`|`confirmed`|`rejected`), note, created_at, confirmed_at — ghi nhận trả nợ
- RLS: chỉ thành viên căn hộ xem được; người tạo/payer sửa được khoản của mình; settlement xác nhận bởi người nhận.

### Tầng code
- `src/types/database.ts` — thêm types Expense / ExpenseShare / Settlement
- `src/services/expense.ts` — CRUD expenses, shares, settlements + hàm tính balance
- `src/utils/splitCalculator.ts` — chia đều / theo số / theo %, và thuật toán **simplify debts** (gộp nợ ròng)
- `src/schemas/expense.ts` — Zod validation
- `src/store/slices/expenseSlice.ts` — slice + saga (theo đúng pattern borrowSlice)
- Wire `rootReducer.ts`, `rootSaga.ts`
- Notifications: thêm type `expense` khi có khoản mới / yêu cầu tất toán

### Screens (tenant + shared)
- `ExpenseListScreen` — danh sách khoản chi + tab (Tất cả / Tôi trả / Liên quan tôi)
- `ExpenseCreateScreen` — tạo khoản, chọn người tham gia, cách chia
- `ExpenseDetailScreen` — chi tiết khoản + ai nợ ai
- `BalanceScreen` — bảng nợ ròng "Ai nợ ai bao nhiêu" + nút Tất toán
- `SettleUpScreen` — xác nhận trả nợ
- Wire vào `TenantTabs` (thêm tab "Quỹ chung") + navigation types

### RevenueCat (Premium)
- Free: ≤ N khoản/tháng, chia cơ bản
- Premium: không giới hạn, quét hóa đơn AI, biểu đồ chi tiêu, nhắc nợ nâng cao
- Dùng `hasActiveEntitlement('premium')` trong service `purchases.ts` (đã có sẵn)

---

## Tính năng 2 — Chat theo căn hộ

### Database (`0006_apartment_chat.sql`)
- `messages`: id, apartment_id, sender_id, body, attachment_url, reply_to (nullable, gắn entity borrow/issue), created_at
- `message_reads`: message_id, user_id, read_at
- RLS: chỉ thành viên căn hộ. Realtime qua Supabase Realtime channel `apartment:{id}`.

### Code
- `src/services/chat.ts` — gửi/nhận, subscribe realtime
- `src/store/slices/chatSlice.ts`
- Screens: `ChatScreen` (group căn hộ) + deep-link "Thảo luận" từ BorrowDetail/IssueDetail

---

## Tính năng 3 — Việc nhà + Gamification

### Database (`0007_chores.sql`)
- `chores`: id, apartment_id, title, recurrence (`once`|`daily`|`weekly`|`monthly`), points
- `chore_assignments`: id, chore_id, assignee_id, due_date, status (`pending`|`done`|`skipped`), completed_at, points_awarded
- `member_points` (view hoặc bảng tổng điểm)

### Code
- Service + slice/saga theo pattern
- Screens: `ChoreBoardScreen` (lịch xoay vòng), `ChoreLeaderboardScreen` (bảng xếp hạng điểm)
- Thuật toán xoay vòng người được giao

---

## Tính năng 4 — Trợ lý AI co-living (Premium)

### Phạm vi
- **Quét hóa đơn**: chụp ảnh bill → gọi Claude API (vision) → trích món + số tiền → tạo expense tự động
- **Giải thích chi phí**: "Tháng này tôi trả bao nhiêu, vì sao?"
- Gắn với feature 1.

### Code
- `src/services/ai.ts` — gọi Claude API qua Supabase Edge Function (giữ API key server-side)
- Edge function `supabase/functions/scan-receipt` — gọi model `claude-opus-4-8` (vision), trả JSON
- Gate bằng RevenueCat entitlement `premium`

---

## Thứ tự triển khai
1. ✅ **Feature 1 (Shared Wallet)** — làm đầy đủ end-to-end trước (nền tảng cho AI scan & premium)
2. Feature 2 (Chat)
3. Feature 3 (Chores)
4. Feature 4 (AI) — phụ thuộc Edge Function + key

## Nguyên tắc kỹ thuật (theo codebase hiện tại)
- Slice + saga chung 1 file; notification gắn trong saga, bọc try/catch không chặn flow chính.
- Service luôn có nhánh `isE2EMode` fallback (e2eBackend).
- UI tiếng Việt; dùng components sẵn có (Card, StatusBadge, EmptyState, Button, Input...).
- Tin `tsc` để verify (test/lint pre-existing broken).
- Migration SQL theo style 0004: `create table if not exists`, enable RLS, policy dùng helper `is_apartment_member` / `is_apartment_landlord`, trigger `set_updated_at`.
