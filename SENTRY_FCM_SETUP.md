# Sentry + Firebase Push — Setup

Code da duoc tich hop san. App van **build & chay binh thuong khi chua co**
config (Sentry/Firebase tu tat). Chi can lam cac buoc duoi khi muon bat that.

Packages: `@sentry/react-native`, `@react-native-firebase/app` +
`@react-native-firebase/messaging`, `@notifee/react-native`.

---

## A. Sentry (error + crash reporting)

### 1. Lay DSN
Sentry.io > Project Settings > Client Keys (DSN). Dien vao env:

```
# .env.development / .env.production
SENTRY_DSN=https://xxxx@oXXXX.ingest.sentry.io/XXXX
```

De trong `SENTRY_DSN=` → Sentry tat hoan toan (no-op). Da wire:
- `initSentry()` goi trong `index.js` (som nhat).
- `Sentry.wrap(App)` trong `App.tsx` (bat loi render + performance).
- `setSentryUser({id})` khi dang nhap/xuat (RootNavigator).
- Helper `src/utils/errorReporting.ts`: `captureException`, `captureMessage`,
  `addBreadcrumb`, `setSentryUser`.

### 2. Source maps (CI/CD, trigger tay)
Workflow `.github/workflows/sentry-sourcemaps.yml` (Actions > **Sentry source
maps** > Run workflow). No build Android prod release voi Sentry auto-upload
bat → day source map Hermes (da compose + Debug IDs) len Sentry.

GitHub repo Secrets can co:

| Secret | Mo ta |
|--------|-------|
| `SENTRY_ORG` | Slug org tren Sentry |
| `SENTRY_PROJECT` | Slug project |
| `SENTRY_AUTH_TOKEN` | Auth token (scope: `project:releases`, `org:read`) |
| `SENTRY_DSN` | DSN (nhung vao build) |

> CI thuong (`ci.yml`) da dat `SENTRY_DISABLE_AUTO_UPLOAD=true` nen khong upload;
> chi workflow tay moi upload.

**iOS source maps**: upload chay trong build phase Xcode. Khi dung CI macOS/local,
bat capability + cau hinh nhu duoi roi build Release; hoac upload tay:
`SENTRY_PROPERTIES=ios/sentry.properties` + `sentry-cli`.

---

## B. Firebase Cloud Messaging (push notifications)

### 1. Tao Firebase project + apps
Firebase Console > tao project. Them apps (cung 1 project):

| Platform | applicationId / bundleId |
|----------|--------------------------|
| Android dev | `com.vuongnguyen.coliving.dev` |
| Android prod | `com.vuongnguyen.coliving` |
| iOS dev | `com.vuongnguyen.coliving.dev` |
| iOS prod | `com.vuongnguyen.coliving` |

### 2. Android — `google-services.json`
Tai ve va dat tai `android/app/google-services.json` (da gitignore). Xem
`android/app/google-services.json.example` (1 file chua ca 2 client dev+prod).
- `google-services` plugin **chi apply khi file ton tai** → khong co file thi
  build van chay (push tat).
- Da co: quyen `POST_NOTIFICATIONS`, meta-data channel `default` + icon
  `ic_notification`, classpath `com.google.gms:google-services:4.4.2`.

### 3. iOS — `GoogleService-Info.plist` + APNs
1. Tai `GoogleService-Info.plist`, keo vao Xcode (target CoLiving). Xem
   `ios/CoLiving/GoogleService-Info.plist.example`. (Da gitignore file that.)
2. Xcode > target > Signing & Capabilities > **+ Push Notifications**.
   (Background Modes > Remote notifications da bat san trong `Info.plist`.)
3. Firebase Console > Project settings > Cloud Messaging > **APNs Auth Key**:
   upload key `.p8` (tao tu Apple Developer > Keys).
4. `cd ios && bundle exec pod install` (Podfile da co
   `$RNFirebaseAsStaticFramework = true`).

> Quan ly dev/prod plist rieng: dat 2 file o `ios/config/{dev,prod}/` + Run
> Script copy theo `${CONFIGURATION}` truoc buoc "Copy Bundle Resources".

### 4. Luong da wire san (`src/services/pushNotifications.ts` + hook)
- Xin quyen (notifee + messaging), tao Android channel `default`.
- Lay FCM token → `registerDeviceToken(userId, token)` (bang `device_tokens`).
- Dang ky lai khi token refresh.
- Foreground: hien thi qua notifee (`onMessage`).
- Background/quit: `setBackgroundMessageHandler` trong `index.js`.
- `NotificationSettingsScreen` toggle `notification_preferences` (backend ton trong
  khi gui).

### 5. Gui push (backend)
Backend/Edge Function doc `device_tokens` (loc `is_active`) + `notification_preferences`
roi goi FCM HTTP v1 API. (Chua nam trong pham vi setup nay.)

---

## C. Checklist nhanh
- [ ] `SENTRY_DSN` vao env (dev + prod)
- [ ] GitHub Secrets: `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`, `SENTRY_DSN`
- [ ] (tuy chon) Secret `GOOGLE_SERVICES_JSON_BASE64` cho workflow source map build co Firebase
- [ ] `android/app/google-services.json`
- [ ] `ios/CoLiving/GoogleService-Info.plist` + Push capability + APNs key
- [ ] `pod install` lai
- [ ] Chay workflow "Sentry source maps" de kiem tra upload
