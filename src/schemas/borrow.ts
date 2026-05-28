import {z} from 'zod';

export const borrowRequestSchema = z.object({
  asset_id: z.string().uuid('ID tài sản không hợp lệ'),
  lender_id: z.string().uuid('ID người cho mượn không hợp lệ'),
  note: z.string().optional(),
  borrow_duration: z
    .string()
    .min(1, 'Vui lòng nhập thời gian mượn'),
  due_date: z.string().optional(),
});

export type BorrowRequestFormData = z.infer<typeof borrowRequestSchema>;
