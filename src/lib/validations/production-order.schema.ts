/**
 * Production Order Validation Schemas
 */

import { z } from "zod";

/**
 * Create Production Order Schema
 */
export const createProductionOrderSchema = z.object({
  bomId: z.number({
    required_error: "Vui lòng chọn công thức sản xuất (BOM)",
  }).positive("BOM ID phải là số dương"),

  plannedQuantity: z.number({
    required_error: "Vui lòng nhập số lượng kế hoạch",
  }).positive("Số lượng phải lớn hơn 0"),

  warehouseId: z.number().positive("Warehouse ID phải là số dương").optional(),

  startDate: z.string({
    required_error: "Vui lòng chọn ngày bắt đầu",
  }).refine((date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, {
    message: "Ngày bắt đầu không được trong quá khứ",
  }),

  endDate: z.string().optional(),

  notes: z.string().max(255, "Ghi chú không được vượt quá 255 ký tự").optional(),
}).refine(
  (data) => {
    if (!data.endDate) return true;
    return new Date(data.endDate) >= new Date(data.startDate);
  },
  {
    message: "Ngày kết thúc phải sau ngày bắt đầu",
    path: ["endDate"],
  }
);

/**
 * Update Production Order Schema
 */
export const updateProductionOrderSchema = z.object({
  plannedQuantity: z.number().positive("Số lượng phải lớn hơn 0").optional(),
  warehouseId: z.number().positive("Warehouse ID phải là số dương").optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().max(255, "Ghi chú không được vượt quá 255 ký tự").optional(),
}).refine(
  (data) => {
    if (!data.startDate || !data.endDate) return true;
    return new Date(data.endDate) >= new Date(data.startDate);
  },
  {
    message: "Ngày kết thúc phải sau ngày bắt đầu",
    path: ["endDate"],
  }
);

/**
 * Start Production Schema
 */
export const startProductionSchema = z.object({
  actualStartDate: z.string().optional(),
  notes: z.string().max(255, "Ghi chú không được vượt quá 255 ký tự").optional(),
});

/**
 * Complete Production Schema
 */
export const completeProductionSchema = z.object({
  actualQuantity: z.number({
    required_error: "Vui lòng nhập số lượng thực tế sản xuất",
  }).positive("Số lượng phải lớn hơn 0"),

  actualMaterials: z.array(
    z.object({
      materialId: z.number().positive(),
      actualQuantity: z.number().nonnegative("Số lượng không được âm"),
      notes: z.string().max(255).optional(),
    })
  ).optional(),

  notes: z.string().max(255, "Ghi chú không được vượt quá 255 ký tự").optional(),
});

/**
 * Cancel Production Schema
 */
export const cancelProductionSchema = z.object({
  reason: z.string({
    required_error: "Vui lòng nhập lý do hủy",
  }).min(10, "Lý do hủy phải có ít nhất 10 ký tự")
    .max(255, "Lý do hủy không được vượt quá 255 ký tự"),
});

// Export types
export type CreateProductionOrderInput = z.infer<typeof createProductionOrderSchema>;
export type UpdateProductionOrderInput = z.infer<typeof updateProductionOrderSchema>;
export type StartProductionInput = z.infer<typeof startProductionSchema>;
export type CompleteProductionInput = z.infer<typeof completeProductionSchema>;
export type CancelProductionInput = z.infer<typeof cancelProductionSchema>;
