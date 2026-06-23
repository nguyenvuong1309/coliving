# Wiring — Tinh nang 3: Viec nha + Gamification

Cac file da tao moi (KHONG sua file dung chung). Phan duoi day la cac diem can wire vao file dung chung do agent khac/nguoi phu trach thuc hien.

## 1. Navigation param-list (`src/types/navigation.ts`)

Them vao `TenantStackParamList`:

```ts
ChoreBoard: undefined;
ChoreCreate: undefined;
ChoreLeaderboard: undefined;
```

(Cac man hinh dung `navigation.navigate('ChoreBoard' | 'ChoreCreate' | 'ChoreLeaderboard')`, tat ca khong co params.)

## 2. Screen registrations (`src/navigation/*`)

Trong navigator cua tenant (vd `TenantNavigator` / stack noi dang khai bao BorrowList...):

| Name | Import path | Title | Tab |
|------|-------------|-------|-----|
| `ChoreBoard` | `../screens/tenant/chore/ChoreBoardScreen` | `Viec nha` | Tab "Viec nha" (man hinh goc cua tab) |
| `ChoreCreate` | `../screens/tenant/chore/ChoreCreateScreen` | `Tao viec nha` | (cung stack, push tu ChoreBoard) |
| `ChoreLeaderboard` | `../screens/tenant/chore/ChoreLeaderboardScreen` | `Bang xep hang` | (cung stack, push tu ChoreBoard) |

Imports:

```ts
import ChoreBoardScreen from '../screens/tenant/chore/ChoreBoardScreen';
import ChoreCreateScreen from '../screens/tenant/chore/ChoreCreateScreen';
import ChoreLeaderboardScreen from '../screens/tenant/chore/ChoreLeaderboardScreen';
```

```tsx
<Stack.Screen name="ChoreBoard" component={ChoreBoardScreen} options={{ title: 'Viec nha' }} />
<Stack.Screen name="ChoreCreate" component={ChoreCreateScreen} options={{ title: 'Tao viec nha' }} />
<Stack.Screen name="ChoreLeaderboard" component={ChoreLeaderboardScreen} options={{ title: 'Bang xep hang' }} />
```

Neu them tab moi vao TenantTabs: tab label `Viec nha`, screen goc tro toi stack chua `ChoreBoard`.

## 3. rootReducer (`src/store/rootReducer.ts`)

Import:

```ts
import chore from './slices/choreSlice';
```

Them key vao combineReducers:

```ts
chore,
```

## 4. rootSaga (`src/store/rootSaga.ts`)

Import:

```ts
import {choreSaga} from './slices/choreSlice';
```

Them fork:

```ts
yield fork(choreSaga);
```

## Ghi chu type
- `state.chore` se ton tai sau khi wire rootReducer (cac man hinh hien bao loi TS2339 cho den khi do — du kien).
- Navigation `ChoreBoard/ChoreCreate/ChoreLeaderboard` se het bao loi sau khi them vao `TenantStackParamList`.
