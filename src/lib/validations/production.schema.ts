import { z } from "zod";

export const bomSchema = z.object({
  bom_code: z
    .string()
    .min(1, "Mã BOM là bắt buộc")
    .max(50, "Mã BOM không được quá 50 ký tự")
    .regex(/^[A-Z0-9-]+$/, "Mã BOM chỉ chứa chữ in hoa, số và dấu gạch ngang"),
  finished_product_id: z.number().int().positive("Vui lòng chọn thành phẩm"),
  finished_product_quantity: z.number().positive("Số lượng sản xuất phải lớn hơn 0"),
  version: z
    .string()
    .min(1, "Phiên bản là bắt buộc")
    .max(20, "Phiên bản không được quá 20 ký tự"),
  description: z.string().max(500, "Mô tả không được quá 500 ký tự").optional(),
  is_active: z.boolean().optional().default(true),
  materials: z
    .array(
      z.object({
        product_id: z.number().int().positive("Nguyên liệu không hợp lệ"),
        product_type: z.enum(["raw_material", "packaging"])
            .refine((val) => !!val, { message: "Loại nguyên liệu là bắt buộc" })
        ,
        quantity_required: z.number().positive("Số lượng định mức phải lớn hơn 0"),
        wastage_percent: z
          .number()
          .min(0)
          .max(100, "Tỷ lệ hao hụt phải từ 0-100")
          .optional()
          .default(0),
        notes: z.string().max(255).optional(),
      })
    )
    .min(1, "BOM phải có ít nhất 1 nguyên liệu"),
});

// Production Order Schema
export const productionOrderSchema = z.object({
  po_code: z
    .string()
    .min(1, "Mã lệnh sản xuất là bắt buộc")
    .max(50, "Mã lệnh sản xuất không được quá 50 ký tự")
    .regex(
      /^[A-Z0-9-]+$/,
      "Mã lệnh sản xuất chỉ chứa chữ in hoa, số và dấu gạch ngang"
    ),
  bom_id: z.number().int().positive("Vui lòng chọn BOM"),
  quantity_to_produce: z.number().positive("Số lượng sản xuất phải lớn hơn 0"),
  raw_material_warehouse_id: z
    .number()
    .int()
    .positive("Vui lòng chọn kho nguyên liệu"),
  packaging_warehouse_id: z.number().int().positive("Vui lòng chọn kho bao bì"),
  finished_warehouse_id: z.number().int().positive("Vui lòng chọn kho thành phẩm"),
  planned_start_date: z.string().min(1, "Ngày bắt đầu dự kiến là bắt buộc"),
  planned_end_date: z.string().min(1, "Ngày kết thúc dự kiến là bắt buộc"),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional().default("normal"),
  notes: z.string().max(500, "Ghi chú không được quá 500 ký tự").optional(),
});

// Production Order Validation - End date phải sau start date
export const productionOrderSchemaWithValidation = productionOrderSchema.superRefine(
  (data, ctx) => {
    const startDate = new Date(data.planned_start_date);
    const endDate = new Date(data.planned_end_date);

    if (endDate <= startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ngày kết thúc phải sau ngày bắt đầu",
        path: ["planned_end_date"],
      });
    }
  }
);

// Production Wastage Schema
export const productionWastageSchema = z.object({
  production_order_id: z.number().int().positive("Lệnh sản xuất không hợp lệ"),
  product_id: z.number().int().positive("Sản phẩm không hợp lệ"),
  wastage_quantity: z.number().positive("Số lượng hao hụt phải lớn hơn 0"),
  wastage_reason: z.enum(["material_defect", "production_error", "equipment_failure", "other"])
    .refine((val) => !!val, { message: "Ly do hao hụt là bắt buộc" })
  ,
  notes: z.string().max(500, "Ghi chú không được quá 500 ký tự").optional(),
});

// Start Production Schema
export const startProductionSchema = z.object({
  actual_start_date: z.string().min(1, "Ngày bắt đầu thực tế là bắt buộc"),
});

// Complete Production Schema
export const completeProductionSchema = z.object({
  actual_end_date: z.string().min(1, "Ngày hoàn thành thực tế là bắt buộc"),
  actual_quantity_produced: z.number().positive("Số lượng sản xuất thực tế phải lớn hơn 0"),
  notes: z.string().max(500).optional(),
});

export type CompleteProductionFormData = z.infer<typeof completeProductionSchema>;
export type BOMFormData = z.infer<typeof bomSchema>;
export type ProductionOrderFormData = z.infer<typeof productionOrderSchema>;
export type ProductionWastageFormData = z.infer<typeof productionWastageSchema>;
export type StartProductionFormData = z.infer<typeof startProductionSchema>;