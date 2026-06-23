# Wiring — Feature 2: Chat theo căn hộ

Chat is apartment-scoped (uses `useApartment().apartment.id` internally). The
`ChatScreen` takes **no route params**.

## 1. Navigation param-list (`src/types/navigation.ts`)

Chat fits best as a **stack screen** (not a bottom tab, to keep the tab bar at 6
items). Add to `TenantStackParamList` (the `TenantTabParamList & { ... }` block,
around line 36–47):

```ts
  Chat: undefined;
```

If you prefer it as a tab instead, add `Chat: undefined;` to
`TenantTabParamList` (line 16–23) and register it with `<Tab.Screen>` below.

## 2. Screen registration (`src/navigation/TenantTabs.tsx`)

Import (near the other tenant screen imports, ~line 12):

```ts
import ChatScreen from '../screens/tenant/chat/ChatScreen';
```

Register as a **stack screen** (alongside the other `<Stack.Screen>` entries,
e.g. after `BorrowDetail`):

```tsx
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: 'Thảo luận căn hộ' }}
      />
```

- import path: `../screens/tenant/chat/ChatScreen`
- name: `Chat`
- title: `Thảo luận căn hộ`
- tab: none (registered in the **stack**, navigate via
  `navigation.navigate('Chat')`). To make it a tab instead, use a
  `<Tab.Screen name="Chat" component={ChatScreen} />` and add `Chat` to
  `TenantTabParamList`.

Optional deep-link entry points per spec ("Thảo luận" from BorrowDetail /
IssueDetail): add a button that calls `navigation.navigate('Chat')`.

## 3. rootReducer (`src/store/rootReducer.ts`)

Import (with the other slice imports, ~line 4):

```ts
import chatReducer from './slices/chatSlice';
```

Add to the `combineReducers` map (~line 14):

```ts
  chat: chatReducer,
```

Key: `chat` — matches `useAppSelector(state => state.chat)` used in `ChatScreen`.

## 4. rootSaga (`src/store/rootSaga.ts`)

Import (with the other saga imports, ~line 4):

```ts
import {chatSaga} from './slices/chatSlice';
```

Add to the `all([ ... fork(...) ])` list (~line 15):

```ts
    fork(chatSaga),
```

## Files created (all new)

- `supabase/migrations/0006_apartment_chat.sql`
- `src/types/chat.ts`
- `src/services/chat.ts`
- `src/store/slices/chatSlice.ts`
- `src/screens/tenant/chat/ChatScreen.tsx`
