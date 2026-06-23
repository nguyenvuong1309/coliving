# CoLiving — Appium E2E Suite

End-to-end tests for the CoLiving React Native app, driven by **Appium 2.x + WebdriverIO + Mocha** in TypeScript. Android via **UiAutomator2**, iOS via **XCUITest**.

## Layout

```
e2e/
├── config/            # wdio.shared / wdio.android / wdio.ios (+ .cjs build outputs)
├── helpers/
│   ├── utils.ts       # selectors (byId/byText), waits, tap/type, scroll, alerts
│   ├── session.ts     # E2E_ACCOUNT creds, restartAtWelcome(), signInAs(role)
│   └── fixtures.ts    # FIXTURE_ID — UUIDs of seeded Supabase test data
├── screenObjects/     # Page Object Model — one singleton per screen
│   ├── BasePage.ts    # abstract base: pageId + waitForShown/isShown/waitForHidden
│   ├── *.ts           # auth: Welcome / SignIn / SignUp
│   ├── auth/          # Splash, ForgotPassword, RoleSelection, ProfileCompletion, JoinApartment
│   ├── tenant/        # Home, Borrow*, Issue*, Payment*, Roommate, Notifications, Profile
│   ├── landlord/      # Dashboard, Tenant*, Asset*, Payment*/Billing, Issue*, Borrow*, Apartment*, Invite, Utility, Report, Revenue, Profile
│   ├── shared/        # EditProfile, ChangePassword, NotificationSettings
│   └── index.ts       # barrel — import { TenantHomeScreen, ... } from '../screenObjects'
└── specs/             # auth/ navigation/ tenant/ landlord/  (*.spec.ts)
```

## Selector strategy

1. **`accessibilityId` / `testID`** — primary. `byId('signin-submit-btn')` → `~signin-submit-btn`.
   The app has full testID coverage (every screen container + interactive element).
2. **Vietnamese text** (`byText`, `tapText`) — only for bottom-tab labels and a few asserts.
   Avoid for logic; UI strings mix diacritics ("Đăng nhập") and non-diacritics ("Dang xuat").
3. **xpath** — avoided.

Dynamic list items use templated IDs, e.g. `borrow-item-${id}`, `tenant-item-${id}` — Page Objects expose `openItem(id)` / `hasItem(id)` for these.

## Page Object usage

```ts
import {TenantHomeScreen, BorrowCreateScreen, BorrowListScreen} from '../../screenObjects';

await BorrowListScreen.waitForShown();
await BorrowListScreen.tapCreateFab();
await BorrowCreateScreen.selectAsset(FIXTURE_ID.assetWasher);
await BorrowCreateScreen.tapSubmit();
```

Page Objects are exported as ready-made singletons. They wrap `helpers/utils`; no raw testIDs in specs once migrated. See `specs/tenant/borrowFlow.pom.spec.ts` for a full example.

## Test data & backend

- Tests run against a **local Supabase** (`.env.e2e` → `http://127.0.0.1:54321`), never prod.
- Seeded rows are referenced by `FIXTURE_ID` (helpers/fixtures.ts). The seed must exist before a run.
- Login uses `E2E_ACCOUNT` in `helpers/session.ts` (`tenant@e2e.coliving.local` / `landlord@e2e.coliving.local`).

## Waits

Use the explicit waits in `helpers/utils.ts` (`waitForDisplayed`, `waitForExisting`, `waitForHidden`, `waitForText`) or `BasePage.waitForShown()`. **No `pause`/sleep.** Timeouts: `TIMEOUT.short` 3s / `medium` 10s / `long` 30s.

## Running (later — do not run during authoring)

```bash
# one-time
pnpm appium:setup            # install xcuitest + uiautomator2 drivers
pnpm appium:doctor           # verify driver prerequisites

# build app under test (e2e env)
pnpm build:e2e:android       # assembleDevDebug with ENVFILE=.env.e2e
pnpm build:e2e:ios

# start local Supabase + seed fixtures, then:
pnpm e2e:android             # compiles specs (tsc) then wdio run android
pnpm e2e:ios
# or build app + run in one shot:
pnpm e2e:android:full
pnpm e2e:ios:full
```

Override device/app via env: `ANDROID_DEVICE_NAME`, `ANDROID_APP_PATH`, `IOS_APP_PATH`, `IOS_BUNDLE_ID`, `E2E_SPEC` (single-spec glob).

## Known issue

`helpers/utils.ts` reports ~11 `tsc` type errors from a dependency skew (`webdriverio@8.40` types vs `@wdio/globals@9.15`). Runtime is unaffected (ts-node `transpileOnly`), but `pnpm build:e2e:tests` (real `tsc` emit) will fail until the `@wdio/*` packages are aligned to one major (recommend all v8 **or** all v9). All Page Objects and specs added here are type-clean.
