import { z } from "zod";

// 1. Form Tạo mới (Nhân viên thao tác)
export const createDebtSchema = z.object({
  // Bỏ tham số thứ 2 (errorMap) để tránh lỗi overload
  reconciliationType: z.enum(["monthly", "quarterly", "yearly"]),
  
  period: z.string().min(1, "Kỳ đối chiếu không được để trống"), 
  
  // Optional không cần custom error
  customerId: z.number().int().positive().optional(),
  supplierId: z.number().int().positive().optional(),
  
  // Bỏ custom error object trong z.date() để tránh lỗi Type
  reconciliationDate: z.date(),
  
  notes: z.string().max(500, "Ghi chú tối đa 500 ký tự").optional(),
}).refine((data) => data.customerId || data.supplierId, {
  message: "Phải chọn Khách hàng hoặc Nhà cung cấp",
  path: ["customerId"],
});

// 2. Form Xác nhận (Nhân viên nhập kết quả xác nhận từ khách)
export const confirmDebtSchema = z.object({
  confirmedByName: z.string().min(1, "Nhập tên người đại diện khách hàng đã xác nhận"),
  
  // Logic email hoặc rỗng
  confirmedByEmail: z.union([
    z.literal(""), 
    z.string().email("Email không hợp lệ")
  ]),
  
  notes: z.string().max(500).optional().nullable(),
  
  discrepancyReason: z.string().max(500).optional().nullable(),
});

// 3. Form Báo cáo sai lệch
export const disputeDebtSchema = z.object({
  reason: z.string().min(5, "Vui lòng nhập chi tiết lý do khách hàng từ chối/báo sai"),
});

// 4. Form Gửi Email
export const sendDebtEmailSchema = z.object({
  recipientName: z.string().min(1, "Tên người nhận"),
  recipientEmail: z.string().email("Email người nhận không hợp lệ"),
  message: z.string().optional(),
});

// --- Export Types cho Form ---
export type CreateDebtForm = z.infer<typeof createDebtSchema>;
export type ConfirmDebtForm = z.infer<typeof confirmDebtSchema>;
export type DisputeDebtForm = z.infer<typeof disputeDebtSchema>;
export type SendDebtEmailForm = z.infer<typeof sendDebtEmailSchema>;