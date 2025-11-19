import { z } from "zod";

/**
 * Product Schema
 */
export const productSchema = z.object({
  sku: z.string().optional(),
  product_name: z
    .string()
    .min(1, "Tên sản phẩm là bắt buộc")
    .max(200, "Tên sản phẩm không được quá 200 ký tự"),
  product_type: z.enum(["raw_material", "packaging", "finished_product", "goods"], {
    required_error: "Loại sản phẩm là bắt buộc",
  }),
  packaging_type: z.enum(["bottle", "box", "bag", "label", "other"]).optional(),
  category_id: z.number().int().positive().optional(),
  supplier_id: z.number().int().positive().optional(),
  unit: z
    .string()
    .min(1, "Đơn vị tính là bắt buộc")
    .max(50, "Đơn vị tính không được quá 50 ký tự"),
  barcode: z.string().max(100).optional(),
  weight: z.number().nonnegative().optional(),
  dimensions: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  purchase_price: z.number().nonnegative().optional(),
  selling_price_retail: z.number().nonnegative().optional(),
  selling_price_wholesale: z.number().nonnegative().optional(),
  selling_price_vip: z.number().nonnegative().optional(),
  tax_rate: z.number().min(0).max(100).optional(),
  min_stock_level: z.number().nonnegative().optional(),
  expiry_date: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
}).refine(
  (data) => {
    // Nếu là packaging thì phải có packaging_type
    if (data.product_type === "packaging" && !data.packaging_type) {
      return false;
    }
    return true;
  },
  {
    message: "Loại bao bì là bắt buộc khi sản phẩm là bao bì",
    path: ["packaging_type"],
  }
);

export type ProductFormData = z.infer<typeof productSchema>;

/**
 * Category Schema
 */
export const categorySchema = z.object({
  category_name: z
    .string()
    .min(1, "Tên danh mục là bắt buộc")
    .max(200, "Tên danh mục không được quá 200 ký tự"),
  parent_id: z.number().int().positive().optional(),
  description: z.string().max(500).optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

/**
 * Supplier Schema
 */
export const supplierSchema = z.object({
  supplier_name: z
    .string()
    .min(1, "Tên nhà cung cấp là bắt buộc")
    .max(200, "Tên nhà cung cấp không được quá 200 ký tự"),
  supplier_type: z.enum(["local", "foreign"], {
    required_error: "Loại nhà cung cấp là bắt buộc",
  }),
  contact_name: z.string().max(100).optional(),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{10,11}$/.test(val),
      "Số điện thoại không hợp lệ"
    ),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  address: z.string().max(255).optional(),
  tax_code: z.string().max(50).optional(),
  payment_terms: z.string().max(255).optional(),
  notes: z.string().max(500).optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;
