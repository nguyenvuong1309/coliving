# Wiring — Feature 1: Quỹ chung & Chia tiền thông minh (Shared Wallet)

All feature code is in NEW files. Below is EXACTLY what to add to the shared files.

## 1. `src/store/rootReducer.ts`
Import + register reducer under key `expense`:
```ts
import expense from './slices/expenseSlice';
// inside combineReducers({...})
expense,
```
> Note: the new screens currently cast `useAppSelector((state: any) => state.expense)`.
> Once the `expense` key exists you may optionally retype them, but it is not required.

## 2. `src/store/rootSaga.ts`
```ts
import {expenseSaga} from './slices/expenseSlice';
// inside the all([...]) / yield fork list
fork(expenseSaga),   // or: expenseSaga() depending on existing pattern
```

## 3. `src/types/navigation.ts`
Add to `TenantStackParamList` (and register the tab in `TenantTabParamList` if tabs are typed there):
```ts
export type TenantStackParamList = TenantTabParamList & {
  // ...existing...
  ExpenseList: undefined;          // (or part of TenantTabParamList as the tab)
  ExpenseCreate: undefined;
  ExpenseDetail: {id: string};
  Balance: undefined;
  SettleUp: {toUser?: string; amount?: number; settlementId?: string};
};
```
Tab entry (in `TenantTabParamList`): `Expense: undefined;` (or reuse `ExpenseList` as the tab route name — see step 4).

## 4. Navigator registration (`src/navigation/*` — the Tenant stack/tabs)
Component import paths:
```ts
import ExpenseListScreen from '../screens/tenant/expense/ExpenseListScreen';
import ExpenseCreateScreen from '../screens/tenant/expense/ExpenseCreateScreen';
import ExpenseDetailScreen from '../screens/tenant/expense/ExpenseDetailScreen';
import BalanceScreen from '../screens/tenant/expense/BalanceScreen';
import SettleUpScreen from '../screens/tenant/expense/SettleUpScreen';
```

Registrations:

| Screen name   | Component            | Title (header)        | Where                          |
|---------------|----------------------|-----------------------|--------------------------------|
| `ExpenseList` | ExpenseListScreen    | "Quỹ chung"           | NEW TAB in TenantTabs          |
| `ExpenseCreate` | ExpenseCreateScreen | "Tạo khoản chi"      | Tenant stack (pushed)          |
| `ExpenseDetail` | ExpenseDetailScreen | "Chi tiết khoản chi" | Tenant stack (pushed)          |
| `Balance`     | BalanceScreen        | "Số nợ ròng"          | Tenant stack (pushed)          |
| `SettleUp`    | SettleUpScreen       | "Tất toán"            | Tenant stack (pushed)          |

- Add a tab "Quỹ chung" pointing to `ExpenseListScreen` (route name `ExpenseList`).
  Suggested tab icon: a wallet / money icon consistent with other tabs.
- The other four are stack screens reachable via `navigation.navigate(...)`:
  - ExpenseList → `ExpenseCreate`, `ExpenseDetail`, `Balance`
  - Balance → `SettleUp` (with `{toUser, amount}`)
  - Notifications deep-link to `ExpenseDetail` ({id}) and `SettleUp` ({settlementId}) and `Balance`.

> The notification `data.route` values emitted by the saga are: `ExpenseDetail`,
> `SettleUp`, `Balance`. Make sure those route names match the registered names
> so deep-linking from push/notification works.

## 5. Database migration
`supabase/migrations/0005_shared_expenses.sql` — apply with your normal migration flow.
Tables: `expenses`, `expense_shares`, `settlements` (RLS enabled, helpers
`is_apartment_member` / `is_apartment_landlord`, trigger `set_updated_at`).

## 6. Notification type
The saga emits notifications with `type: 'expense'`. No DB enum change needed
(`notifications.type` is free `text`). If you maintain a
`notification_preferences` boolean column per type and want a toggle, optionally
add `expense_enabled boolean default true` (NOT required for the feature to work).
