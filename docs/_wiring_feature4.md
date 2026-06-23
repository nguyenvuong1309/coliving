# Wiring — Tinh nang 4: Tro ly AI co-living

Cac file moi da tao xong va type-consistent (`tsc` sach). Phan duoi day la
cac thay doi WIRING can lam o cac file dung chung (KHONG sua trong PR nay vi
co agent khac dang dung — owner navigation/store se thuc hien).

## 1. Navigation param-list entry

Trong `src/types/navigation.ts`, them vao `TenantStackParamList`:

```ts
ReceiptScanner: undefined;
```

(Dat canh cac entry detail khac, vi du sau `EditProfile`.)

## 2. Screen registration

Import va dang ky trong tenant stack navigator (vi du
`src/navigation/TenantNavigator.tsx` — file noi cac `Stack.Screen` cua tenant):

- **Import path:** `../screens/tenant/ai/ReceiptScannerScreen`
- **Route name:** `ReceiptScanner`
- **Title:** `Quet hoa don AI` (screen tu set qua `navigation.setOptions`, nhung
  co the dat `options={{ title: 'Quet hoa don AI' }}` cho chac).
- **Tab:** KHONG phai tab rieng — la man hinh detail trong **TenantStack**
  (giong `BorrowCreate` / `BorrowDetail`). Mo tu mot nut/entry trong tab
  hien co (vi du tu TenantHome hoac man hinh Quy chung khi feature 1 san sang)
  bang `navigation.navigate('ReceiptScanner')`.

```tsx
import ReceiptScannerScreen from '../screens/tenant/ai/ReceiptScannerScreen';
// ...
<Stack.Screen name="ReceiptScanner" component={ReceiptScannerScreen} />
```

## 3. Ghi chu cho owner feature 1 (ExpenseCreate)

Man hinh `ReceiptScannerScreen` khi nguoi dung xac nhan hoa don da quet se goi:

```ts
navigation.navigate('ExpenseCreate', { prefill: result });
// result: ScanReceiptResult { title, total, items: ReceiptItem[], suggestedCategory }
```

Vi vay **`ExpenseCreate` can chap nhan mot param tuy chon `prefill`**:

```ts
ExpenseCreate: { prefill?: import('./ai').ScanReceiptResult } | undefined;
```

Type `ScanReceiptResult` / `ReceiptItem` nam o `src/types/ai.ts`. Khi `prefill`
co mat, man hinh ExpenseCreate nen do san: tieu de = `prefill.title`, so tien =
`prefill.total`, danh muc = `prefill.suggestedCategory` (map sang category cua
expense), va co the hien danh sach `prefill.items`.

> Hien tai `ReceiptScannerScreen` goi navigate qua `(navigation.navigate as any)`
> de khong phu thuoc navigation types (chua duoc sua). Khi `ExpenseCreate` +
> param `prefill` da co trong `TenantStackParamList`, co the bo `as any` de co
> type-safety.

## Files moi (tham khao)

- `src/types/ai.ts` — `ScanReceiptResult`, `ReceiptItem`, `ExplainCostPayload`, `ExplainCostResult`
- `src/services/ai.ts` — `scanReceipt()`, `explainCost()` (goi qua `supabase.functions.invoke`)
- `src/screens/tenant/ai/ReceiptScannerScreen.tsx` — UI quet hoa don, gate Premium
- `supabase/functions/scan-receipt/index.ts` — edge function (Claude vision, claude-opus-4-8)
- `supabase/functions/explain-cost/index.ts` — edge function (Claude text, claude-opus-4-8)
- `supabase/functions/README.md` — huong dan deploy + set secret
