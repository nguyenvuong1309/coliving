import {z} from 'zod';

export const expenseCategorySchema = z.enum([
  'food',
  'household',
  'utility',
  'party',
  'transport',
  'other',
]);

export const splitTypeSchema = z.enum(['equal', 'exact', 'percentage']);

export const expenseFormSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tên khoản chi'),
  category: expenseCategorySchema,
  amount: z.number().positive('Số tiền phải lớn hơn 0'),
  note: z.string().optional(),
  payer_id: z.string().uuid('Người trả không hợp lệ'),
  split_type: splitTypeSchema,
  participant_ids: z
    .array(z.string().uuid())
    .min(1, 'Chọn ít nhất một người tham gia'),
});

export type ExpenseFormData = z.infer<typeof expenseFormSchema>;

export const settlementFormSchema = z.object({
  to_user: z.string().uuid('Người nhận không hợp lệ'),
  amount: z.number().positive('Số tiền phải lớn hơn 0'),
  note: z.string().optional(),
});

export type SettlementFormData = z.infer<typeof settlementFormSchema>;
