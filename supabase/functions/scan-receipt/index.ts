// Supabase Edge Function: scan-receipt
//
// Nhan { imageBase64, mediaType }, goi Anthropic Messages API (model
// claude-opus-4-8, vision) de trich xuat cac dong muc + tong tien tu anh hoa
// don, tra ve JSON nghiem ngat.
//
// API KEY (ANTHROPIC_API_KEY) chi ton tai o phia server, doc tu Deno.env.
// Deploy: `supabase functions deploy scan-receipt`
// Secret:  `supabase secrets set ANTHROPIC_API_KEY=sk-ant-...`

// @ts-ignore - Deno runtime import (chi chay tren edge, khong qua tsc cua app)
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-opus-4-8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ReceiptItem {
  name: string;
  amount: number;
}

interface ScanReceiptResult {
  title: string;
  total: number;
  items: ReceiptItem[];
  suggestedCategory: string;
}

const SYSTEM_PROMPT = `Ban la tro ly trich xuat thong tin tu anh hoa don (bill) cho mot ung dung quan ly chi tieu o ghep.
Nhiem vu: doc anh hoa don va tra ve DUY NHAT mot doi tuong JSON hop le (khong kem giai thich, khong kem markdown, khong kem code fence) theo dung schema sau:
{
  "title": string,            // ten cua hang hoac mo ta ngan cho khoan chi
  "total": number,            // tong tien (VND), chi so, khong dau phay/cham phan cach nghin
  "items": [                  // cac dong muc tren hoa don
    { "name": string, "amount": number }
  ],
  "suggestedCategory": string // mot trong: "groceries" | "food" | "utilities" | "household" | "other"
}
Quy tac:
- Tat ca so tien la number (vi du 35000), KHONG phai chuoi.
- Neu khong chac tong, hay cong don cac items.
- Neu khong doc duoc dong muc nao, tra "items": [] nhung van uoc luong "total".
- Chi tra ve JSON, khong them bat ky van ban nao khac.`;

/** Trich JSON tu output cua model mot cach an toan (chap nhan ca khi co code fence). */
function parseModelJson(text: string): ScanReceiptResult {
  let raw = text.trim();

  // Loai bo code fence neu co (```json ... ``` hoac ``` ... ```).
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) {
    raw = fenceMatch[1].trim();
  }

  // Lay tu dau `{` den cuoi `}` de bo qua text thua.
  const first = raw.indexOf('{');
  const last = raw.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    raw = raw.slice(first, last + 1);
  }

  const parsed = JSON.parse(raw);

  const items: ReceiptItem[] = Array.isArray(parsed.items)
    ? parsed.items
        .map((it: any) => ({
          name: typeof it?.name === 'string' ? it.name : 'Khong ro',
          amount: Number(it?.amount) || 0,
        }))
        .filter((it: ReceiptItem) => it.name)
    : [];

  return {
    title: typeof parsed.title === 'string' ? parsed.title : 'Hoa don',
    total: Number(parsed.total) || 0,
    items,
    suggestedCategory:
      typeof parsed.suggestedCategory === 'string'
        ? parsed.suggestedCategory
        : 'other',
  };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // @ts-ignore - Deno global
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Server chua cau hinh ANTHROPIC_API_KEY' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const { imageBase64, mediaType } = await req.json();
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Thieu du lieu anh (imageBase64)' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const anthropicResp = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2048,
        thinking: { type: 'adaptive' },
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType || 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: 'Trich xuat thong tin hoa don nay theo schema JSON da quy dinh.',
              },
            ],
          },
        ],
      }),
    });

    if (!anthropicResp.ok) {
      const errText = await anthropicResp.text();
      return new Response(
        JSON.stringify({ error: 'Loi goi Claude API', detail: errText }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const data = await anthropicResp.json();

    if (data.stop_reason === 'refusal') {
      return new Response(
        JSON.stringify({ error: 'Yeu cau bi tu choi xu ly' }),
        {
          status: 422,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Ghep cac text block lai (bo qua thinking block co the rong).
    const textOut: string = Array.isArray(data.content)
      ? data.content
          .filter((b: any) => b.type === 'text')
          .map((b: any) => b.text)
          .join('\n')
      : '';

    const result = parseModelJson(textOut);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'Khong xu ly duoc hoa don',
        detail: String(err),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
