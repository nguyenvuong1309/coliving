// Supabase Edge Function: explain-cost
//
// Nhan payload chi tiet chi phi cua nguoi dung, goi Anthropic Messages API
// (model claude-opus-4-8, text) de sinh mot doan giai thich ngan gon, than
// thien bang TIENG VIET ("Thang nay ban tra bao nhieu, vi sao?").
//
// API KEY (ANTHROPIC_API_KEY) chi ton tai o phia server, doc tu Deno.env.
// Deploy: `supabase functions deploy explain-cost`
// Secret:  `supabase secrets set ANTHROPIC_API_KEY=sk-ant-...`

// @ts-ignore - Deno runtime import
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-opus-4-8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM_PROMPT = `Ban la tro ly tai chinh than thien cua mot ung dung quan ly chi tieu danh cho nhom o ghep.
Nhiem vu: giai thich cho nguoi dung mot cach NGAN GON, RO RANG, bang TIENG VIET, ve so tien ho phai tra trong ky.
Yeu cau:
- Toi da 4-5 cau, giong nhu dang noi chuyen voi ban cung phong.
- Neu ro tong tien, va cac khoan chinh dong gop vao tong.
- Giong dieu tich cuc, de hieu, khong dung thuat ngu tai chinh phuc tap.
- Chi tra ve van ban thuan (khong markdown, khong JSON, khong bullet ky thuat).`;

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

    const payload = await req.json();
    const {
      period,
      totalOwed,
      currency = 'VND',
      breakdown = [],
      note,
    } = payload ?? {};

    if (typeof totalOwed !== 'number') {
      return new Response(
        JSON.stringify({ error: 'Thieu thong tin tong tien (totalOwed)' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const breakdownText = Array.isArray(breakdown)
      ? breakdown
          .map((it: any) => `- ${it?.name ?? 'Khoan chi'}: ${it?.amount ?? 0} ${currency}`)
          .join('\n')
      : '';

    const userText = [
      period ? `Ky: ${period}` : null,
      `Tong tien ban phai tra: ${totalOwed} ${currency}`,
      breakdownText ? `Chi tiet cac khoan:\n${breakdownText}` : null,
      note ? `Ghi chu: ${note}` : null,
      'Hay giai thich vi sao toi phai tra so tien nay.',
    ]
      .filter(Boolean)
      .join('\n');

    const anthropicResp = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        thinking: { type: 'adaptive' },
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userText }],
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

    const explanation: string = Array.isArray(data.content)
      ? data.content
          .filter((b: any) => b.type === 'text')
          .map((b: any) => b.text)
          .join('\n')
          .trim()
      : '';

    return new Response(JSON.stringify({ explanation }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'Khong tao duoc giai thich chi phi',
        detail: String(err),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
