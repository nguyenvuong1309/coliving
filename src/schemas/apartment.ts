import {z} from 'zod';

export const apartmentSetupSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  address: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  num_rooms: z
    .number()
    .int('Số phòng phải là số nguyên')
    .min(1, 'Phải có ít nhất 1 phòng')
    .max(20, 'Tối đa 20 phòng'),
});

export type ApartmentSetupData = z.infer<typeof apartmentSetupSchema>;
export type ApartmentSetupFormData = ApartmentSetupData;
