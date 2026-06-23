/**
 * Types cho tinh nang Tro ly AI co-living (quet hoa don + giai thich chi phi).
 * Dung chung giua service `ai.ts`, edge function va man hinh ReceiptScanner.
 */

/** Mot dong muc trong hoa don (vi du: "Sua tuoi" - 35000). */
export interface ReceiptItem {
  /** Ten mat hang / dich vu. */
  name: string;
  /** So tien (VND), da chuan hoa ve number. */
  amount: number;
}

/** Ket qua quet hoa don tra ve tu Claude (qua edge function). */
export interface ScanReceiptResult {
  /** Tieu de goi y cho khoan chi (vi du ten cua hang). */
  title: string;
  /** Tong tien tren hoa don (VND). */
  total: number;
  /** Danh sach cac dong muc. */
  items: ReceiptItem[];
  /**
   * Danh muc goi y cho khoan chi (map sang category cua expense feature 1).
   * Vi du: 'groceries' | 'utilities' | 'household' | 'food' | 'other'.
   */
  suggestedCategory: string;
}

/** Payload gui len edge function `explain-cost`. */
export interface ExplainCostPayload {
  /** Thang dang xet (vi du "2026-06"). */
  period?: string;
  /** Tong tien nguoi dung phai tra trong ky. */
  totalOwed: number;
  /** Don vi tien te, mac dinh VND. */
  currency?: string;
  /** Cac khoan chi gop phan vao tong (ten + so tien phan bo cho user). */
  breakdown: ReceiptItem[];
  /** Ghi chu / boi canh them (tuy chon). */
  note?: string;
}

/** Ket qua giai thich chi phi. */
export interface ExplainCostResult {
  /** Doan giai thich ngan gon bang tieng Viet. */
  explanation: string;
}
