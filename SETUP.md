# CoLiving — Setup Before Go-Live

## 1. Environment variables

Tao 2 file (KHONG commit):

- `.env.development`
- `.env.production`

Tham khao `.env.example`. Cac key bat buoc:

| Key | Mo ta |
|-----|-------|
| `SUPABASE_URL` | URL Supabase project (vd: `https://abcd.supabase.co`) |
| `SUPABASE_ANON_KEY` | Anon key Supabase |
| `APP_NAME` | Ten app hien tren CLI / log |
| `APP_DISPLAY_NAME` | Ten app hien tren home screen iOS |
| `GOOGLE_WEB_CLIENT_ID` | Web client ID tu Google Cloud Console (dung cho ca iOS/Android) |
| `GOOGLE_REVERSED_CLIENT_ID` | iOS only: dao nguoc CLIENT_ID iOS, dang `com.googleusercontent.apps.xxx` |

## 2. Supabase

### Tao project + chay schema

Chay file `IMPLEMENTATION_PLAN.md` muc 1.2 SQL tren ca dev + prod project.

### Storage buckets

Tao 4 bucket trong Supabase Studio:

| Bucket | Public read | Mo ta |
|--------|-------------|-------|
| `avatars` | Public | Anh dai dien |
| `issue-images` | Authenticated | Anh sua co |
| `payment-receipts` | Authenticated | Anh bien lai |
| `asset-images` | Authenticated | Anh tai san |

### RLS policies

Quan trong: bat RLS cho tat ca cac bang. Xem `IMPLEMENTATION_PLAN.md` muc 1.3.

## 3. iOS

### Pods

```bash
cd ios && bundle install && bundle exec pod install
```

### URL Scheme cho OAuth

`Info.plist` da co `$(GOOGLE_REVERSED_CLIENT_ID)` placeholder — gia tri tu env se duoc nhung vao luc build (do `INFOPLIST_PREPROCESS=YES`).

### Capabilities

Trong Xcode:
- Sign in with Apple: ENABLED
- Push Notifications: xem `SENTRY_FCM_SETUP.md` muc B.3 (Firebase + APNs)

## 4. Android

### Release keystore

Tao keystore va dat o `android/app/release.keystore` (gitignored):

```bash
keytool -genkey -v -keystore android/app/release.keystore \
  -alias coliving -keyalg RSA -keysize 2048 -validity 10000
```

Sau do them password vao `~/.gradle/gradle.properties` (KHONG dat trong repo):

```
RELEASE_STORE_PASSWORD=...
RELEASE_KEY_PASSWORD=...
```

Tren CI: dung bien moi truong `ORG_GRADLE_PROJECT_RELEASE_STORE_PASSWORD`, ...

### Deep link

`AndroidManifest.xml` da khai bao scheme `coliving://` (cho Supabase auth callback / password reset).

## 5. Smoke test

```bash
pnpm install
pnpm android:dev    # hoac pnpm ios:dev
```

Kiem tra:
- [ ] Sign up email/password → vao Home (Tenant) / Dashboard (Landlord)
- [ ] Sign in email/password
- [ ] (Neu da config Google) Google sign in
- [ ] Landlord tao apartment → nhan invite code
- [ ] Tenant join apartment bang invite code
- [ ] Landlord tao asset → tenant tao yeu cau muon → landlord duyet → tenant tra
- [ ] Tenant bao cao su co kem 3 anh → upload Storage thanh cong → landlord cap nhat trang thai
- [ ] Landlord tao billing → tenant bao da tra (kem bien lai) → landlord xac nhan / tu choi
- [ ] Doi thong tin profile + doi mat khau
