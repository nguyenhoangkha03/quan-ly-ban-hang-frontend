import { z } from "zod";

/**
 * Promotion Validation Schemas
 */

// Promotion Type Enum
export const promotionTypeEnum = z.enum([
  "percent_discount",
  "fixed_discount",
  "buy_x_get_y",
  "gift",
]);

// Applicable To Enum
export const applicableToEnum = z.enum([
  "all",
  "category",
  "product_group",
  "specific_product",
  "customer_group",
]);

// Promotion Product Schema
export const promotionProductSchema = z.object({
  productId: z.number().int().positive("Vui lòng chọn sản phẩm"),
  discountValueOverride: z.number().min(0).optional(),
  minQuantity: z.number().int().min(1).optional(),
  giftProductId: z.number().int().positive().optional(),
  giftQuantity: z.number().int().min(0).optional(),
  note: z.string().max(255).optional(),
});

// Promotion Conditions Schema (flexible JSON)
export const promotionConditionsSchema = z.any().optional();

/**
 * Create Promotion Schema
 */
export const createPromotionSchema = z
  .object({
    promotionCode: z
      .string()
      .min(1, "Mã khuyến mãi là bắt buộc")
      .max(50, "Mã không được quá 50 ký tự")
      .regex(
        /^[A-Z0-9-]+$/,
        "Mã chỉ được chứa chữ in hoa, số và dấu gạch ngang"
      ),
    promotionName: z
      .string()
      .min(1, "Tên khuyến mãi là bắt buộc")
      .max(200, "Tên không được quá 200 ký tự"),
    promotionType: promotionTypeEnum,
    discountValue: z.number().min(0, "Giá trị giảm phải >= 0"),
    maxDiscountValue: z.number().min(0).optional(),
    startDate: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
    endDate: z.string().min(1, "Ngày kết thúc là bắt buộc"),
    isRecurring: z.boolean().optional(),
    applicableTo: applicableToEnum,
    minOrderValue: z.number().min(0).optional(),
    minQuantity: z.number().int().min(0).optional(),
    quantityLimit: z.number().int().positive().optional(),
    conditions: promotionConditionsSchema,
    products: z.array(promotionProductSchema).optional(),
  })
  .refine(
    (data) => {
      // Validate percent discount
      if (data.promotionType === "percent_discount") {
        return data.discountValue > 0 && data.discountValue <= 100;
      }
      return true;
    },
    {
      message: "Giảm theo % phải từ 0-100",
      path: ["discountValue"],
    }
  )
  .refine(
    (data) => {
      // Validate date range
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return start <= end;
    },
    {
      message: "Ngày kết thúc phải sau ngày bắt đầu",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      // If applicable_to = specific_product, must have products
      if (
        data.applicableTo === "specific_product" &&
        (!data.products || data.products.length === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Vui lòng chọn ít nhất 1 sản phẩm",
      path: ["products"],
    }
  );

export type CreatePromotionFormData = z.infer<typeof createPromotionSchema>;

/**
 * Update Promotion Schema
 */
export const updatePromotionSchema = z
  .object({
    promotionName: z
      .string()
      .min(1, "Tên khuyến mãi là bắt buộc")
      .max(200, "Tên không được quá 200 ký tự")
      .optional(),
    discountValue: z.number().min(0, "Giá trị giảm phải >= 0").optional(),
    maxDiscountValue: z.number().min(0).optional(),
    startDate: z.string().min(1, "Ngày bắt đầu là bắt buộc").optional(),
    endDate: z.string().min(1, "Ngày kết thúc là bắt buộc").optional(),
    isRecurring: z.boolean().optional(),
    applicableTo: applicableToEnum.optional(),
    minOrderValue: z.number().min(0).optional(),
    minQuantity: z.number().int().min(0).optional(),
    quantityLimit: z.number().int().positive().optional(),
    conditions: promotionConditionsSchema,
    products: z.array(promotionProductSchema).optional(),
  })
  .refine(
    (data) => {
      // Validate date range if both provided
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return start <= end;
      }
      return true;
    },
    {
      message: "Ngày kết thúc phải sau ngày bắt đầu",
      path: ["endDate"],
    }
  );

export type UpdatePromotionFormData = z.infer<typeof updatePromotionSchema>;

/**
 * Promotion Filter Schema
 */
export const promotionFilterSchema = z.object({
  promotionType: promotionTypeEnum.optional(),
  status: z
    .enum(["pending", "active", "expired", "cancelled"])
    .optional(),
  applicableTo: applicableToEnum.optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  search: z.string().optional(),
  isRecurring: z.boolean().optional(),
  hasProducts: z.boolean().optional(),
});

export type PromotionFilterFormData = z.infer<typeof promotionFilterSchema>;
