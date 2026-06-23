import { supabase } from '../config/supabase';
import type {
  ScanReceiptResult,
  ExplainCostPayload,
  ExplainCostResult,
} from '../types';

/**
 * Service goi cac tinh nang AI (quet hoa don, giai thich chi phi).
 *
 * Tat ca cac lenh goi Claude API deu di qua Supabase Edge Function de GIU API
 * KEY O PHIA SERVER (khong nhung key vao app). App chi gui anh base64 / payload
 * va nhan ve JSON da duoc model trich xuat.
 *
 * Thong bao loi deu bang tieng Viet de UI hien thi truc tiep.
 */

/**
 * Quet hoa don tu anh (base64). Goi edge function `scan-receipt` -> Claude
 * (vision, model claude-opus-4-8) de trich xuat cac dong muc + tong tien.
 *
 * @param imageBase64 chuoi base64 cua anh (KHONG kem tien to `data:...`).
 * @param mediaType MIME type cua anh, vi du 'image/jpeg' | 'image/png'.
 */
export async function scanReceipt(
  imageBase64: string,
  mediaType: string,
): Promise<ScanReceiptResult> {
  const { data, error } = await supabase.functions.invoke<ScanReceiptResult>(
    'scan-receipt',
    {
      body: { imageBase64, mediaType },
    },
  );

  if (error) {
    throw new Error(
      'Khong the quet hoa don luc nay. Vui long thu lai sau giay lat.',
    );
  }
  if (!data || typeof data.total !== 'number' || !Array.isArray(data.items)) {
    throw new Error(
      'Khong doc duoc thong tin tu hoa don. Hay thu chup ro net hon.',
    );
  }

  return {
    title: typeof data.title === 'string' ? data.title : 'Hoa don',
    total: data.total,
    items: data.items,
    suggestedCategory:
      typeof data.suggestedCategory === 'string'
        ? data.suggestedCategory
        : 'other',
  };
}

/**
 * Giai thich chi phi cho nguoi dung. Goi edge function `explain-cost` -> Claude
 * (text, model claude-opus-4-8) de sinh doan giai thich ngan gon tieng Viet.
 */
export async function explainCost(
  payload: ExplainCostPayload,
): Promise<ExplainCostResult> {
  const { data, error } = await supabase.functions.invoke<ExplainCostResult>(
    'explain-cost',
    {
      body: payload,
    },
  );

  if (error) {
    throw new Error(
      'Khong the tao giai thich chi phi luc nay. Vui long thu lai sau.',
    );
  }
  if (!data || typeof data.explanation !== 'string') {
    throw new Error('Khong nhan duoc noi dung giai thich. Vui long thu lai.');
  }

  return data;
}
