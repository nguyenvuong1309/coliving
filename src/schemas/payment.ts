import {z} from 'zod';

export const createBillingSchema = z.object({
  month: z
    .number()
    .int()
    .min(1, 'Tháng phải từ 1 đến 12')
    .max(12, 'Tháng phải từ 1 đến 12'),
  year: z
    .number()
    .int()
    .min(2024, 'Năm phải từ 2024 trở đi'),
  due_date: z.string().min(1, 'Vui lòng chọn ngày hạn thanh toán'),
});

export const reportPaymentSchema = z.object({
  payment_method: z.enum(['bank_transfer', 'cash']),
  note: z.string().optional(),
});

export type CreateBillingData = z.infer<typeof createBillingSchema>;
export type CreateBillingFormData = CreateBillingData;
export type ReportPaymentData = z.infer<typeof reportPaymentSchema>;
