import { z } from "zod";

// Create Production Order Schema
export const createProductionOrderSchema = z.object({
  bomId: z.number({}).positive("BOM ID phải là số dương"),

  plannedQuantity: z.number({}).positive("Số lượng phải lớn hơn 0"),

  warehouseId: z.number().positive("Warehouse ID phải là số dương").optional(),

  startDate: z.string({}).refine((date) => {
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

// Update Production Order Schema
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

// Cancel Production Schema
export const cancelProductionSchema = z.object({
  reason: z.string({}).min(10, "Lý do hủy phải có ít nhất 10 ký tự")
    .max(255, "Lý do hủy không được vượt quá 255 ký tự"),
});

// Export types
export type CreateProductionOrderInput = z.infer<typeof createProductionOrderSchema>;
export type UpdateProductionOrderInput = z.infer<typeof updateProductionOrderSchema>;
export type CancelProductionInput = z.infer<typeof cancelProductionSchema>;
