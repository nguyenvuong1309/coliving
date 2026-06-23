# Supabase Edge Functions — Tro ly AI co-living

Cac edge function nay goi Anthropic Claude API (model `claude-opus-4-8`) o phia
server de **giu API key an toan** — key khong bao gio nhung vao app React Native.

## Functions

| Function        | Mo ta                                                                 |
| --------------- | --------------------------------------------------------------------- |
| `scan-receipt`  | Nhan `{ imageBase64, mediaType }`, dung Claude vision trich xuat dong muc + tong tien, tra JSON `{ title, total, items[], suggestedCategory }`. |
| `explain-cost`  | Nhan payload chi phi, tra `{ explanation }` (tieng Viet, ngan gon).   |

## Deploy

```bash
# Dat secret (chi 1 lan / khi xoay key)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# Deploy tung function
supabase functions deploy scan-receipt
supabase functions deploy explain-cost
```

## Goi tu app

App goi qua `supabase.functions.invoke('scan-receipt' | 'explain-cost')`
(xem `src/services/ai.ts`). CORS da duoc bat san trong moi function.

## Ghi chu

- Model: `claude-opus-4-8` (vision + text), adaptive thinking.
- `ANTHROPIC_API_KEY` doc tu `Deno.env.get('ANTHROPIC_API_KEY')`.
- Output JSON cua model duoc parse mot cach an toan (chap nhan code fence /
  text thua) trong `scan-receipt`.
