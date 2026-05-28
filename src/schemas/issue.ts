import {z} from 'zod';

export const issueCreateSchema = z.object({
  category: z.enum(['equipment', 'noise', 'hygiene', 'security', 'other']),
  location: z.string().min(1, 'Vui lòng nhập vị trí'),
  urgency: z.enum(['normal', 'urgent']),
  title: z.string().min(3, 'Tiêu đề phải có ít nhất 3 ký tự'),
  description: z.string().optional(),
});

export type IssueCreateData = z.infer<typeof issueCreateSchema>;
export type IssueCreateFormData = IssueCreateData;
