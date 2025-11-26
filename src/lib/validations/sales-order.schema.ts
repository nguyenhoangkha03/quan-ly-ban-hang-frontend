/**
 * Sales Order Validation Schemas
 */

import { z } from "zod";

/**
 * Create Sales Order Schema
 */
export const createSalesOrderSchema = z.object({
  customerId: z.number({ required_error: "Vui lòng chọn khách hàng" }).int().positive(),
  warehouseId: z.number().int().positive().optional(),
  orderDate: z.string().optional(),
  salesChannel: z.enum(["retail", "wholesale", "online", "distributor"], {
    required_error: "Vui lòng chọn kênh bán hàng",
  }),
  deliveryAddress: z.string().max(255, "Địa chỉ giao hàng không được quá 255 ký tự").optional(),
  shippingFee: z.number().min(0, "Phí vận chuyển không được âm").optional().default(0),
  paymentMethod: z.enum(["cash", "bank_transfer", "credit", "cod"], {
    required_error: "Vui lòng chọn phương thức thanh toán",
  }),
  paidAmount: z.number().min(0, "Số tiền thanh toán không được âm").optional().default(0),
  notes: z.string().max(255, "Ghi chú không được quá 255 ký tự").optional(),
  details: z
    .array(
      z.object({
        productId: z.number().int().positive("Sản phẩm không hợp lệ"),
        warehouseId: z.number().int().positive().optional(),
        quantity: z.number().positive("Số lượng phải lớn hơn 0"),
        unitPrice: z.number().min(0, "Đơn giá không được âm"),
        discountPercent: z.number().min(0).max(100, "Chiết khấu % phải từ 0-100").optional().default(0),
        taxRate: z.number().min(0).max(100, "Thuế suất phải từ 0-100").optional().default(0),
        batchNumber: z.string().max(100).optional(),
        expiryDate: z.string().optional(),
        notes: z.string().max(255).optional(),
      })
    )
    .min(1, "Đơn hàng phải có ít nhất 1 sản phẩm"),
});

export type CreateSalesOrderInput = z.infer<typeof createSalesOrderSchema>;

/**
 * Update Sales Order Schema
 */
export const updateSalesOrderSchema = z.object({
  deliveryAddress: z.string().max(255).optional(),
  shippingFee: z.number().min(0).optional(),
  paymentMethod: z.enum(["cash", "bank_transfer", "credit", "cod"]).optional(),
  notes: z.string().max(255).optional(),
  details: z
    .array(
      z.object({
        id: z.number().int().positive().optional(),
        productId: z.number().int().positive(),
        warehouseId: z.number().int().positive().optional(),
        quantity: z.number().positive(),
        unitPrice: z.number().min(0),
        discountPercent: z.number().min(0).max(100).optional().default(0),
        taxRate: z.number().min(0).max(100).optional().default(0),
        batchNumber: z.string().max(100).optional(),
        expiryDate: z.string().optional(),
        notes: z.string().max(255).optional(),
      })
    )
    .optional(),
});

export type UpdateSalesOrderInput = z.infer<typeof updateSalesOrderSchema>;

/**
 * Approve Order Schema
 */
export const approveOrderSchema = z.object({
  notes: z.string().max(255, "Ghi chú không được quá 255 ký tự").optional(),
});

export type ApproveOrderInput = z.infer<typeof approveOrderSchema>;

/**
 * Cancel Order Schema
 */
export const cancelOrderSchema = z.object({
  reason: z.string({ required_error: "Vui lòng nhập lý do hủy" }).min(1, "Lý do hủy là bắt buộc").max(255, "Lý do không được quá 255 ký tự"),
});

export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;

/**
 * Process Payment Schema
 */
export const processPaymentSchema = z.object({
  amount: z.number({ required_error: "Vui lòng nhập số tiền" }).positive("Số tiền phải lớn hơn 0"),
  paymentMethod: z.enum(["cash", "bank_transfer", "credit", "cod"], {
    required_error: "Vui lòng chọn phương thức thanh toán",
  }),
  paymentDate: z.string().optional(),
  notes: z.string().max(255, "Ghi chú không được quá 255 ký tự").optional(),
});

export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;
