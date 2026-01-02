import { z } from "zod";

// 1. Form Tạo/Tính toán (Đơn giản hóa tối đa)
export const createDebtSchema = z.object({
  customerId: z.number().int().positive().optional(),
  supplierId: z.number().int().positive().optional(),
  notes: z.string().max(500).optional(),
  
  // ✅ SỬA LẠI: Chấp nhận number (bao gồm NaN) hoặc undefined ngay từ đầu
  assignedUserId: z.number()
    .or(z.nan())     // Chấp nhận NaN (do valueAsNumber trả về khi rỗng)
    .optional()      // Đánh dấu field là optional -> Fix lỗi TypeScript "Required vs Optional"
    .transform((val) => {
      // Logic: Nếu là NaN, null, undefined hoặc 0 -> chuyển thành undefined
      if (val === undefined || val === null || Number.isNaN(val)) {
        return undefined;
      }
      return val;
    }),

}).refine((data) => data.customerId || data.supplierId, {
  message: "Vui lòng chọn Khách hàng hoặc Nhà cung cấp",
  path: ["customerId"], 
});

// 2. Form Gửi Email (Giữ nguyên vì vẫn cần)
export const sendDebtEmailSchema = z.object({
  recipientName: z.string().min(1, "Tên người nhận"),
  recipientEmail: z.string().email("Email người nhận không hợp lệ"),
  message: z.string().optional(),
});

// --- Export Types ---
export type CreateDebtForm = z.infer<typeof createDebtSchema>;
export type SendDebtEmailForm = z.infer<typeof sendDebtEmailSchema>;
