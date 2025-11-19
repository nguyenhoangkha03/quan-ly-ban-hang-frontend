import { z } from "zod";

/**
 * Sales Order Schema
 */
export const salesOrderSchema = z.object({
  customer_id: z.number().int().positive("Vui lòng chọn khách hàng"),
  warehouse_id: z.number().int().positive("Vui lòng chọn kho xuất hàng").optional(),
  sales_channel: z.enum(["store", "online", "phone", "social_media", "distributor"], {
    errorMap: () => ({ message: "Kênh bán hàng không hợp lệ" }),
  }),
  delivery_address: z.string().max(255, "Địa chỉ giao hàng không được quá 255 ký tự").optional(),
  delivery_city: z.string().max(100, "Thành phố không được quá 100 ký tự").optional(),
  delivery_region: z.string().max(100, "Khu vực không được quá 100 ký tự").optional(),
  shipping_fee: z.number().min(0, "Phí vận chuyển không được âm").optional().default(0),
  payment_method: z.enum(["cash", "bank_transfer", "credit", "cod"], {
    errorMap: () => ({ message: "Phương thức thanh toán không hợp lệ" }),
  }),
  paid_amount: z.number().min(0, "Số tiền thanh toán không được âm").optional().default(0),
  notes: z.string().max(500, "Ghi chú không được quá 500 ký tự").optional(),
  details: z
    .array(
      z.object({
        product_id: z.number().int().positive("Sản phẩm không hợp lệ"),
        quantity: z.number().positive("Số lượng phải lớn hơn 0"),
        unit_price: z.number().min(0, "Đơn giá không được âm"),
        discount_percent: z.number().min(0).max(100, "Chiết khấu % phải từ 0-100").optional().default(0),
        discount_amount: z.number().min(0, "Số tiền chiết khấu không được âm").optional().default(0),
        tax_rate: z.number().min(0).max(100, "Thuế suất phải từ 0-100").optional().default(0),
      })
    )
    .min(1, "Đơn hàng phải có ít nhất 1 sản phẩm"),
});

export type SalesOrderFormData = z.infer<typeof salesOrderSchema>;

/**
 * Update Sales Order Schema (chỉ cho phép sửa một số field)
 */
export const updateSalesOrderSchema = z.object({
  delivery_address: z.string().max(255).optional(),
  delivery_city: z.string().max(100).optional(),
  delivery_region: z.string().max(100).optional(),
  shipping_fee: z.number().min(0).optional(),
  payment_method: z.enum(["cash", "bank_transfer", "credit", "cod"]).optional(),
  notes: z.string().max(500).optional(),
});

export type UpdateSalesOrderFormData = z.infer<typeof updateSalesOrderSchema>;

/**
 * Add Payment Schema
 */
export const addPaymentSchema = z.object({
  order_id: z.number().int().positive("Đơn hàng không hợp lệ"),
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  payment_method: z.enum(["cash", "bank_transfer", "credit", "cod"], {
    errorMap: () => ({ message: "Phương thức thanh toán không hợp lệ" }),
  }),
  notes: z.string().max(500).optional(),
});

export type AddPaymentFormData = z.infer<typeof addPaymentSchema>;

/**
 * Sales Order Filter Schema
 */
export const salesOrderFilterSchema = z.object({
  customer_id: z.number().int().positive().optional(),
  status: z.enum(["pending", "approved", "in_progress", "completed", "cancelled"]).optional(),
  payment_status: z.enum(["unpaid", "partial", "paid"]).optional(),
  sales_channel: z.enum(["store", "online", "phone", "social_media", "distributor"]).optional(),
  payment_method: z.enum(["cash", "bank_transfer", "credit", "cod"]).optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  warehouse_id: z.number().int().positive().optional(),
  sales_staff_id: z.number().int().positive().optional(),
});

export type SalesOrderFilterFormData = z.infer<typeof salesOrderFilterSchema>;
