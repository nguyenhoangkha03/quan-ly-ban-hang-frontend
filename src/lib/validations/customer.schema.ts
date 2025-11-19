import { z } from "zod";

/**
 * Customer Schema
 */
export const customerSchema = z.object({
  customer_name: z
    .string()
    .min(1, "Tên khách hàng là bắt buộc")
    .max(200, "Tên khách hàng không được quá 200 ký tự"),
  customer_type: z.enum(["individual", "company"], {
    required_error: "Loại khách hàng là bắt buộc",
  }),
  classification: z.enum(["retail", "wholesale", "vip", "distributor"], {
    required_error: "Phân loại khách hàng là bắt buộc",
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
  city: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  tax_code: z.string().max(50).optional(),
  credit_limit: z.number().nonnegative("Hạn mức công nợ phải >= 0").default(0),
  notes: z.string().max(500).optional(),
  status: z.enum(["active", "inactive"]).default("active"),
}).refine(
  (data) => {
    // Nếu là company thì tax_code là bắt buộc
    if (data.customer_type === "company" && !data.tax_code) {
      return false;
    }
    return true;
  },
  {
    message: "Mã số thuế là bắt buộc đối với công ty",
    path: ["tax_code"],
  }
);

export type CustomerFormData = z.infer<typeof customerSchema>;
