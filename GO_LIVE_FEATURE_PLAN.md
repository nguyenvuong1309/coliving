# CoLiving - Go-Live Feature Plan

Ngay lap: 2026-05-28

## Trang Thai Trien Khai - 2026-05-28

Da thuc hien trong codebase:

- P0 build/test health: TypeScript pass, lint pass khong con error, Jest pass, Jest da tach e2e specs, Android/pnpm Gradle dependencies da duoc fix, release signing khong con fallback debug.
- P0 Supabase foundation: da co migrations schema, RLS policies va storage bucket policies cho MVP; storage private da duoc scope theo issue/payment/apartment path.
- P0/P1 production config: da them env keys cho app version va password reset redirect; CI da yeu cau Supabase/OAuth/signing secrets truoc khi build release.
- P1 auth/onboarding: OAuth/email user thieu profile duoc dua ve RoleSelection/ProfileCompletion, profile completion dung upsert, email confirmation co thong bao va resend, session restore dung MMKV key thong nhat.
- P1 apartment bootstrap: landlord/tenant sau auth duoc gate vao setup/join apartment neu chua co apartment, invite code thong nhat 8 ky tu, duplicate join dung upsert.
- P1 tenant management: landlord co TenantEdit de cap nhat phong va tien thue, billing chan tenant rent <= 0.
- P1 billing/payment: create billing dung adjusted amount tung tenant, chan duplicate billing period, receipt private dung signed URL, confirm/reject refresh list va tao notification.
- P1 borrow flow: UI hien asset name, tenant co due date picker, landlord co list/detail approve/reject/in-use/returned, flow notification da noi vao status changes.
- P1 issue flow: issue detail render signed images, issue create/update tao notification.
- P1 notification center: da co create notification service, unread count, mark read/all read, deep link payload vao detail screens, tenant notification tab co badge.
- P1 profile/settings: avatar upload, phone/full name edit, email hien tu auth session thay vi raw UUID, app version lay tu env config.
- CI: `.github/workflows/ci.yml` chay install/typecheck/lint/test va Android prod release build voi secrets bat buoc.

Ket qua verify local:

- `pnpm exec tsc --noEmit`: pass.
- `pnpm lint`: pass voi 25 warning cu, 0 error.
- `pnpm test --runInBand`: pass.
- `npx react-doctor@latest --verbose --diff`: pass, 100/100, khong con issue tren diff.
- `./gradlew assembleProdDebug`: pass.
- `./gradlew assembleProdRelease`: da qua JS bundle/Hermes/lintVital, fail tai signing vi chua co `release.keystore` / release signing secrets. Day la gate dung cho production release.
- `xcodebuild -workspace ios/CoLiving.xcworkspace -scheme CoLiving-Prod -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' build CODE_SIGNING_ALLOWED=NO -quiet`: pass, con cac warning tu Pods/script phases / deployment target cua dependencies.

Con phu thuoc ben ngoai, khong the hoan tat chi bang code local:

- Dien secret production thuc te: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, Google OAuth client IDs, Android release keystore, iOS signing/provisioning.
- Chay Supabase migrations tren dev/prod project that va generate lai `src/types/database.ts` tu schema da migrate.
- Verify Google/Apple OAuth tren bundle id/application id production.
- Smoke test tren Android device/emulator va iOS simulator/device.
- Push notification that, crash analytics, privacy policy/terms public URL va store metadata van la scope public launch, can Firebase/App Store/Play Store account va policy URLs that.

## Muc tieu

Muc tieu cua tai lieu nay la gom cac tinh nang va cong viec con thieu de dua CoLiving len go-live theo tung muc uu tien.

Gia dinh hien tai:

- Go-live gan nhat la pilot that voi mot so can ho, chua phai public launch rong tren App Store / Play Store.
- MVP da co nhieu man hinh chinh, nhung mot so luong core chua khep kin va build/test/release chua dat.
- Public launch can them push notification, monitoring, chinh sach bao mat va quy trinh release on dinh hon.

## Dinh nghia muc uu tien

| Muc | Y nghia |
| --- | --- |
| P0 | Blocker. Khong nen pilot neu chua xong. |
| P1 | Can co de pilot su dung hang ngay on dinh. |
| P2 | Can co truoc public launch hoac khi scale. |
| P3 | Nice-to-have / differentiation, co the de phase sau. |

## P0 - Blockers Truoc Khi Pilot

### 1. Build, Test, Release Health

**Van de hien tai**

- `pnpm exec tsc --noEmit` pass.
- `pnpm lint` fail voi nhieu loi unused imports / unused vars.
- `pnpm test --runInBand` fail truoc khi chay test do Jest / React Native setup.
- E2E specs dang nam trong pattern Jest nen bi Jest pick nham.
- Android release build fail do `android/settings.gradle` tro den `node_modules/@react-native/gradle-plugin`, nhung pnpm khong link package nay o top-level.
- Android release dang fallback sang debug signing neu thieu release keystore.

**Can lam**

- Fix toan bo ESLint errors.
- Tach Jest unit tests va WebdriverIO e2e tests:
  - Jest chi chay `__tests__` va unit/integration tests.
  - E2E chi chay bang `pnpm e2e:ios` / `pnpm e2e:android`.
- Fix Jest config cho React Native 0.84 + pnpm.
- Fix pnpm/Gradle plugin resolution cho Android.
- Bat Android release build fail neu thieu release keystore, khong fallback debug signing trong prod release.
- Them CI toi thieu:
  - `pnpm install --frozen-lockfile`
  - `pnpm exec tsc --noEmit`
  - `pnpm lint`
  - `pnpm test`
  - Android prod release build

**Acceptance criteria**

- `pnpm lint` pass.
- `pnpm test` pass.
- Android prod release build pass.
- iOS prod release build pass tren may co Xcode setup.
- CI fail neu release signing / env bi thieu.

### 2. Supabase Production Foundation

**Van de hien tai**

- Schema SQL dang nam trong `IMPLEMENTATION_PLAN.md`, chua co migration files rieng.
- RLS policies moi duoc mo ta, chua thay migration/policy files trong repo.
- Storage bucket policy can ro rang hon, dac biet voi receipt va issue images.
- `types/database.ts` co ve viet tay / generated tu schema mong muon, chua dam bao khop prod DB.

**Can lam**

- Tao thu muc Supabase migrations, vi du:
  - `supabase/migrations/0001_initial_schema.sql`
  - `supabase/migrations/0002_rls_policies.sql`
  - `supabase/migrations/0003_storage_policies.sql`
- Viet migration cho cac bang MVP:
  - `profiles`
  - `apartments`
  - `apartment_members`
  - `assets`
  - `borrow_requests`
  - `issues`
  - `issue_images`
  - `billing_periods`
  - `payments`
  - `notifications`
- Bat RLS cho tat ca bang.
- Viet RLS policies:
  - User chi sua profile minh.
  - Tenant / landlord chi doc du lieu trong apartment cua minh.
  - Tenant chi xem payment cua minh.
  - Landlord chi xem/manage payment trong apartment minh quan ly.
  - Notification chi user so huu duoc doc/sua.
- Tao storage policies cho:
  - `avatars`: public read, user update avatar cua minh.
  - `issue-images`: chi member trong apartment lien quan duoc read.
  - `payment-receipts`: chi tenant thanh toan va landlord lien quan duoc read.
  - `asset-images`: chi member trong apartment duoc read, landlord duoc write.
- Generate lai DB types tu Supabase schema that.
- Tao seed/test data cho dev project.

**Acceptance criteria**

- Chay migration tren dev tu empty DB thanh cong.
- RLS bat cho moi bang public.
- Test Supabase policy bang user tenant A khong doc duoc du lieu apartment B.
- App dev chay duoc voi DB migrate moi.

### 3. Production Config

**Van de hien tai**

- `.env.production` dang la placeholder.
- Google/Apple OAuth can config theo production bundle id / application id.
- Deep link co khai bao native nhung chua duoc verify end-to-end.

**Can lam**

- Thay production env:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `APP_NAME`
  - `APP_DISPLAY_NAME`
  - `GOOGLE_WEB_CLIENT_ID`
  - `GOOGLE_REVERSED_CLIENT_ID`
- Tao Google OAuth client cho:
  - iOS bundle id `com.coliving`
  - Android package `com.coliving` + SHA signing cert.
- Enable Apple Sign In cho production app id.
- Test deep link:
  - auth callback
  - password reset
  - notification deep link sau nay
- Chuan bi:
  - app icon
  - launch screen
  - version code/build number
  - privacy strings
  - release signing

**Acceptance criteria**

- Prod build dung prod Supabase project.
- Google sign-in pass tren Android va iOS prod build.
- Apple sign-in pass tren iOS prod build.
- Password reset link mo app va doi mat khau duoc.

## P1 - Pilot-Ready Features

### 1. Auth & Onboarding Hoan Chinh

**Van de hien tai**

- Google/Apple sign-in neu user moi chua co profile thi saga set `user = null`, nhung khong dieu huong sang role/profile completion ro rang.
- `ProfileCompletionScreen` update profile theo user id, nhung neu profile chua ton tai thi update se khong tao row.
- Session restore chi check token va Supabase session, chua load apartment.

**Can lam**

- Sau OAuth login:
  - Neu profile ton tai: load profile va vao app.
  - Neu profile chua ton tai: tao draft profile hoac dieu huong role selection + profile completion.
- `ProfileCompletionScreen` dung upsert thay vi update-only.
- Sau email/password signup:
  - Hien trang thai email confirmation neu Supabase bat confirm email.
  - Xu ly resend confirmation.
- Session restore:
  - Load session.
  - Load profile.
  - Load apartment/membership.
  - Neu thieu profile/role/apartment thi route dung onboarding state.
- Logout clear toan bo Redux state lien quan:
  - apartment
  - members
  - assets
  - borrow
  - issues
  - payments
  - notifications

**Acceptance criteria**

- User moi dang ky email/password xong vao dung onboarding state.
- User moi Google/Apple login xong chon role va hoan tat profile duoc.
- Kill app / reopen van vao dung man hinh theo state.
- Logout xong login user khac khong bi ro data user truoc.

### 2. Apartment Bootstrap

**Van de hien tai**

- `JoinApartment` chi nam trong `AuthStack`, tenant da authenticated khong co route de join.
- Tenant home chi fetch data neu `apartment.id` da co trong Redux.
- Landlord dashboard co TODO fetch apartment nhung chua implement.
- Invite code generator tao 6 ky tu, UI noi 8 ky tu.

**Can lam**

- Them onboarding gate sau auth:
  - Landlord chua co apartment -> `ApartmentSetup`.
  - Tenant chua co apartment -> `JoinApartment`.
  - Da co apartment -> main tabs.
- Tao service:
  - `getMyApartment(userId)`
  - `getLandlordApartment(landlordId)`
  - `getApartmentMembership(userId)`
- Luu apartment/membership vao Redux sau login/restore.
- Move/duplicate `JoinApartmentScreen` vao authenticated tenant stack hoac tao `OnboardingStack`.
- Xu ly:
  - invite code sai
  - invite code het han neu co
  - duplicate join
  - user bi remove khoi apartment
- Thong nhat invite code length va validation.

**Acceptance criteria**

- Landlord moi login vao setup apartment.
- Tenant moi login vao join apartment.
- Tenant da join reopen app van thay apartment data.
- Invite code sai hien loi de hieu.
- Duplicate join khong tao row trung.

### 3. Tenant / Member Management

**Van de hien tai**

- Tenant join vao `apartment_members` voi `rent_amount = 0`.
- Landlord xem duoc tenant detail nhung chua edit `room_name` / `rent_amount`.
- Billing dua vao `rent_amount`, nen co nguy co tao hoa don 0 VND.

**Can lam**

- Them man hinh `TenantEditScreen` cho landlord:
  - room name
  - rent amount
  - phone note neu can
  - status active/inactive neu them soft delete
- Them action tu tenant detail/list de edit tenant.
- Cap nhat apartment service:
  - `updateMember(memberId, updates)`
  - optional `deactivateMember(memberId)`
- Khi tenant moi join:
  - landlord nhan notification in-app.
  - tenant hien trang thai "Dang cho chu nha cap nhat tien phong" neu rent = 0.
- Billing khong cho tao ky thu neu tenant active co rent = 0, tru khi landlord xac nhan.

**Acceptance criteria**

- Landlord set duoc room va rent cho tenant.
- Payment billing lay dung rent moi.
- Tenant list hien dung room/rent.
- Khong the tao billing sai 0 VND do thieu setup.

### 4. Billing / Payment Flow

**Van de hien tai**

- `CreateBillingScreen` cho landlord sua amount tung tenant, nhung action `createBillingRequest` khong gui adjusted amounts.
- Service `createBillingPeriod` lay lai `rent_amount` tu DB, bo qua adjusted amount.
- Sau confirm/reject payment, overview co the chua refresh.
- Receipt image dang lay public URL, khong phu hop neu bucket private.

**Can lam**

- Doi payload `createBillingRequest` de gui:
  - month
  - year
  - dueDate
  - tenant payment rows: tenantId, amount
- Doi service `createBillingPeriod` de insert payment theo rows tu client hoac RPC.
- Dam bao landlord khong nam trong tenant payment rows.
- Them validation:
  - duplicate billing period
  - amount >= 0
  - due date hop le
- Them payment status lifecycle:
  - `unpaid`
  - `tenant_reported`
  - `confirmed`
  - `rejected` hoac quay ve `unpaid` kem note
  - `overdue`
- Them overdue updater:
  - Trong pilot co the tinh realtime tren app.
  - Public launch nen dung Supabase cron/edge function.
- Receipt:
  - upload vao private/authenticated bucket.
  - dung signed URL khi render.
- Sau landlord confirm/reject:
  - refresh payment list
  - refresh billing overview
  - tao notification cho tenant.

**Acceptance criteria**

- Landlord tao billing voi amount tuy chinh tung tenant.
- Tenant thay dung amount can thanh toan.
- Tenant upload receipt va landlord xem duoc anh.
- Landlord confirm/reject xong tenant thay status moi.
- Overdue hien dung sau due date.

### 5. Asset & Borrow Flow

**Van de hien tai**

- Borrow list/detail hien `asset_id`, chua hien asset name.
- Asset landlord tao co `owner_id = landlord`, nhung landlord khong co man hinh approve/reject borrow request.
- `borrow_duration` la text, chua co due date that.
- Dashboard landlord chi dem request, chua xu ly.

**Can lam**

- Update borrow query/type de UI dung nested asset data:
  - asset name
  - asset image
  - lender profile
  - borrower profile
- Them landlord borrow screens hoac shared borrow detail:
  - list request theo apartment
  - approve/reject
  - confirm returned
- Quy dinh mo hinh owner:
  - Neu do chung cua apartment: landlord/admin approve.
  - Neu do ca nhan tenant: owner tenant approve.
- Them due date picker khi create borrow request.
- Status flow:
  - `pending`
  - `approved`
  - `in_use`
  - `return_requested`
  - `returned`
  - `rejected`
- Tao notification:
  - request created
  - approved/rejected
  - return requested
  - returned confirmed
- Optional pilot: nhac qua han tra do bang in-app notification khi mo app.

**Acceptance criteria**

- Tenant tao request muon do va nguoi co quyen approve thay duoc.
- Landlord approve duoc request do chung.
- UI hien ten tai san, khong hien raw UUID.
- Return flow hoan thanh duoc tu dau den cuoi.

### 6. Issue Reporting

**Van de hien tai**

- Issue create upload anh, nhung detail screens chua render issue images.
- Storage bucket du kien authenticated, nhung service dang dung public URL.
- Timeline status con don gian.

**Can lam**

- Render images trong tenant issue detail va landlord issue detail.
- Dung signed URL cho issue images neu bucket private.
- Them image viewer full-screen neu can.
- Chuan hoa labels:
  - category
  - location
  - urgency
  - status
- Timeline:
  - created
  - landlord accepted
  - resolved
  - tenant closed/reopened
  - notes theo tung buoc
- Tao notifications:
  - tenant tao issue -> landlord
  - landlord update issue -> tenant reporter
  - tenant reopen -> landlord

**Acceptance criteria**

- Tenant tao issue kem 1-3 anh.
- Landlord xem duoc anh va cap nhat status.
- Tenant thay status/note va confirm/reopen duoc.
- Notifications xuat hien o notification center.

### 7. In-App Notifications

**Van de hien tai**

- Co table/service fetch notification.
- Chua thay service tao notification khi co event nghiep vu.
- Notification item chua deep link vao detail screen.
- Unread badge chua gan vao tabs/header.

**Can lam**

- Tao notification service/action:
  - `createNotification`
  - `createNotifications`
- Tao notifications trong cac saga/service:
  - tenant join apartment
  - borrow request/update
  - issue create/update
  - payment reported/confirmed/rejected
- Them `data` payload:
  - entity type
  - entity id
  - target route
- Notification center:
  - tap item -> navigate dung detail.
  - mark read sau khi tap.
  - mark all read.
- Badge unread count:
  - tab notification/profile
  - dashboard recent activity
- Optional pilot: Supabase Realtime subscribe notifications.

**Acceptance criteria**

- Moi event core tao notification row.
- User chi xem notification cua minh.
- Tap notification mo dung man chi tiet.
- Unread count update dung sau mark read.

### 8. Profile & Settings

**Van de hien tai**

- Tenant profile dang hien user id thay email.
- Avatar upload chua duoc implement ro rang.
- Version app hardcode.

**Can lam**

- Hien email tu Supabase auth user hoac profile field.
- Edit avatar:
  - pick image
  - upload `avatars`
  - update `profiles.avatar_url`
- Edit phone/full name on dinh.
- Change password:
  - yeu cau re-auth hoac validation ro rang neu can.
- App version lay tu native build config.
- Them settings:
  - notification settings placeholder neu chua co push.
  - privacy policy / terms link cho public launch.

**Acceptance criteria**

- User cap nhat profile va avatar duoc.
- Profile khong hien raw UUID nhu email.
- Doi mat khau thanh cong va co success feedback.

## P2 - Public Launch / Scale

### 1. Push Notifications That

Can lam:

- Them Firebase:
  - `@react-native-firebase/app`
  - `@react-native-firebase/messaging`
- Tao bang `device_tokens`.
- Xin permission iOS/Android.
- Register/update/delete device token khi login/logout.
- Supabase Edge Function `send-push`.
- Cron reminders:
  - payment due
  - payment overdue
  - borrow overdue
- Notification settings per user.

Acceptance criteria:

- App nhan push khi background/quit.
- Push tap deep link vao dung detail.
- User tat duoc category notification.

### 2. Utility Billing Dien/Nuoc

Can lam:

- Bang config gia dien/nuoc.
- Bang meter readings theo billing period.
- UI nhap chi so cu/moi.
- Tinh tien theo don gia/co bac thang neu can.
- Gop utility vao payment period.

Acceptance criteria:

- Landlord tao billing gom rent + dien + nuoc + phi khac.
- Tenant thay chi tiet tung khoan.

### 3. Multi-Apartment

Can lam:

- Landlord co the tao/quan ly nhieu apartment.
- App co apartment switcher.
- Tat ca queries/slices can scoped theo selected apartment.
- Invite code theo apartment.

Acceptance criteria:

- Landlord switch apartment va data khong bi tron.
- Tenant co the thuoc mot hoac nhieu apartment neu business cho phep.

### 4. Reports & Export

Can lam:

- Revenue report theo thang/quy.
- Payment status report: da tra/chua tra/tre han.
- Tenant list export.
- Issue history export.
- PDF/CSV export hoac share file.

Acceptance criteria:

- Landlord export duoc report co filter thoi gian.
- So lieu report khop payment records.

### 5. Monitoring, Analytics, Compliance

Can lam:

- Crash reporting.
- Basic analytics:
  - signup
  - join apartment
  - create billing
  - report payment
  - create issue
- Error logging cho Supabase calls.
- Privacy policy.
- Terms of service.
- Data deletion request flow.

Acceptance criteria:

- Crash va JS errors duoc ghi nhan.
- Co privacy policy public URL de submit store.

## P3 - Phase Sau

- Chat / Zalo integration.
- Chore management.
- Expense splitting.
- Lease/document storage.
- Visitor management.
- Smart lock integration.
- Gamification / rewards.
- Marketplace room listing.

## Thu Tu Trien Khai De Xuat

### Tuan 1 - Nen Tang Release

1. Fix lint.
2. Fix Jest config va test scripts.
3. Fix Android release build voi pnpm.
4. Them CI toi thieu.
5. Tao Supabase migrations + RLS + storage policies.
6. Validate dev DB tu migration moi.

### Tuan 2 - Auth, Onboarding, Apartment

1. OAuth profile upsert.
2. Profile completion upsert.
3. Auth/session restore load profile + apartment.
4. Onboarding gate cho landlord/tenant.
5. Tenant join apartment sau auth.
6. Landlord setup apartment sau auth.
7. Tenant/member edit room/rent.

### Tuan 3 - Core Business Flows

1. Billing create dung adjusted amounts.
2. Payment receipt signed URL.
3. Payment confirm/reject refresh + notification.
4. Issue image render + signed URL.
5. Borrow UI hien asset data.
6. Landlord/shared borrow approve flow.

### Tuan 4 - Pilot QA & Hardening

1. In-app notifications cho tat ca core events.
2. Notification deep links.
3. Smoke test iOS + Android.
4. E2E happy paths cho auth, apartment, billing, issue, borrow.
5. Release build verification.
6. Pilot deployment.

## Smoke Test Bat Buoc Truoc Pilot

- Sign up email/password tenant.
- Sign up email/password landlord.
- Sign in email/password.
- Google sign-in user moi va user cu.
- Apple sign-in user moi va user cu tren iOS.
- Landlord tao apartment va lay invite code.
- Tenant join apartment bang invite code.
- Landlord set room/rent cho tenant.
- Landlord tao billing.
- Tenant thay payment dung amount.
- Tenant bao da tra tien va upload receipt.
- Landlord xem receipt va confirm payment.
- Tenant thay payment confirmed.
- Tenant tao issue kem 3 anh.
- Landlord xem issue images va update status.
- Tenant confirm resolved.
- Landlord tao asset do chung.
- Tenant tao borrow request.
- Landlord approve borrow request.
- Tenant request return.
- Landlord confirm returned.
- Notification center hien cac event tren.
- Logout/login user khac khong ro data.
- Kill app/reopen van restore dung session/apartment.

## Definition Of Done Cho Pilot

- Tat ca P0 xong.
- Tat ca P1 core flows xong.
- `pnpm lint` pass.
- `pnpm test` pass.
- Typecheck pass.
- Android prod release build pass.
- iOS prod release build pass.
- Supabase dev/prod da migrate bang migration files.
- RLS/storage policies da test.
- Smoke test pass tren it nhat:
  - 1 Android device/emulator
  - 1 iOS simulator/device

## Definition Of Done Cho Public Launch

- Tat ca P0 + P1 xong.
- Push notification that xong.
- Crash reporting va analytics xong.
- Privacy policy / terms public.
- Store metadata, screenshots, app icon, signing hoan tat.
- Monitoring va rollback plan san sang.
- Pilot feedback critical bugs da fix.
