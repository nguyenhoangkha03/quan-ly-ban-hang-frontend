import { z } from "zod";

/**
 * Product Schema
 */
export const productSchema = z.object({
  sku: z.string().optional(),
  productName: z
    .string()
    .min(1, "Tên sản phẩm là bắt buộc")
    .max(200, "Tên sản phẩm không được quá 200 ký tự"),
  productType: z.enum(["raw_material", "packaging", "finished_product", "goods"], {
    required_error: "Loại sản phẩm là bắt buộc",
  }),
  packagingType: z.enum(["bottle", "box", "bag", "label", "other"]).optional(),
  categoryId: z.number().int().positive().optional().nullable(),
  supplierId: z.number().int().positive().optional().nullable(),
  unit: z
    .string()
    .min(1, "Đơn vị tính là bắt buộc")
    .max(50, "Đơn vị tính không được quá 50 ký tự"),
  barcode: z.string().max(100).optional(),
  weight: z.number().nonnegative().optional().nullable(),
  dimensions: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  purchasePrice: z.number().nonnegative().optional().nullable(),
  sellingPriceRetail: z.number().nonnegative().optional().nullable(),
  sellingPriceWholesale: z.number().nonnegative().optional().nullable(),
  sellingPriceVip: z.number().nonnegative().optional().nullable(),
  taxRate: z.number().min(0).max(100).optional(),
  minStockLevel: z.number().nonnegative().optional(),
  expiryDate: z.string().optional().nullable(),
  status: z.enum(["active", "inactive", "discontinued"]).default("active"),
}).refine(
  (data) => {
    // Nếu là packaging thì phải có packagingType
    if (data.productType === "packaging" && !data.packagingType) {
      return false;
    }
    return true;
  },
  {
    message: "Loại bao bì là bắt buộc khi sản phẩm là bao bì",
    path: ["packagingType"],
  }
);

export type ProductFormData = z.infer<typeof productSchema>;

/**
 * Category Schema
 */
export const categorySchema = z.object({
  categoryName: z
    .string()
    .min(1, "Tên danh mục là bắt buộc")
    .max(200, "Tên danh mục không được quá 200 ký tự"),
  parentId: z.number().int().positive().optional().nullable(),
  description: z.string().max(500).optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

/**
 * Supplier Schema
 */
export const supplierSchema = z.object({
  supplierName: z
    .string()
    .min(1, "Tên nhà cung cấp là bắt buộc")
    .max(200, "Tên nhà cung cấp không được quá 200 ký tự"),
  supplierType: z.enum(["local", "foreign"], {
    required_error: "Loại nhà cung cấp là bắt buộc",
  }),
  contactName: z.string().max(100).optional(),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{10,11}$/.test(val),
      "Số điện thoại không hợp lệ"
    ),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  address: z.string().max(255).optional(),
  taxCode: z.string().max(50).optional(),
  paymentTerms: z.string().max(255).optional(),
  notes: z.string().max(500).optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;
