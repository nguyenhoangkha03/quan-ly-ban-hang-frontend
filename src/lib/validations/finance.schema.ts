import { z } from "zod";

// Payment Receipt Schema (Phiếu thu)
export const paymentReceiptSchema = z.object({
  receipt_code: z
    .string()
    .min(1, "Mã phiếu thu là bắt buộc")
    .max(50, "Mã phiếu thu không được quá 50 ký tự"),
  customer_id: z.number().int().positive("Vui lòng chọn khách hàng").optional(),
  sales_order_id: z.number().int().positive("Vui lòng chọn đơn hàng").optional(),
  receipt_date: z.string().min(1, "Ngày thu là bắt buộc"),
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  payment_method: z.enum(["cash", "bank_transfer", "credit", "cod"])
    .refine((val) => !!val, { message: "Phương thức thanh toán là bắt buộc" })
  ,
  receipt_type: z.enum(["order_payment", "deposit", "refund", "other"])
    .refine((val) => !!val, { message: "Loại phiếu thu là bắt buộc" })
  ,
  notes: z.string().max(500, "Ghi chú không được quá 500 ký tự").optional(),
});

// Payment Voucher Schema (Phiếu chi)
export const paymentVoucherSchema = z.object({
  voucher_code: z
    .string()
    .min(1, "Mã phiếu chi là bắt buộc")
    .max(50, "Mã phiếu chi không được quá 50 ký tự"),
  supplier_id: z.number().int().positive("Vui lòng chọn nhà cung cấp").optional(),
  purchase_order_id: z.number().int().positive("Vui lòng chọn đơn đặt hàng").optional(),
  voucher_date: z.string().min(1, "Ngày chi là bắt buộc"),
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  payment_method: z.enum(["cash", "bank_transfer", "check"])
    .refine((val) => !!val, { message: "Phương thức thanh toán là bắt buộc" })
  ,
  voucher_type: z.enum(["purchase_payment", "salary", "expense", "tax", "other"])
    .refine((val) => !!val, { message: "Loại phiếu chi là bắt buộc" })
    ,
  notes: z.string().max(500, "Ghi chú không được quá 500 ký tự").optional(),
});

// Debt Reconciliation Schema
export const debtReconciliationSchema = z.object({
  customer_id: z.number().int().positive("Vui lòng chọn khách hàng"),
  reconciliation_period: z.enum(["month", "quarter", "year"])
    .refine((val) => !!val, { message: "Kỳ học là bắt buộc" })
  ,
  period_value: z
    .string()
    .min(1, "Giá trị kỳ là bắt buộc")
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Giá trị kỳ phải theo định dạng YYYY-MM"),
  opening_balance: z.number().min(0, "Số dư đầu kỳ không được âm"),
  total_sales: z.number().min(0, "Tổng bán không được âm"),
  total_payments: z.number().min(0, "Tổng thu không được âm"),
  closing_balance: z.number().min(0, "Số dư cuối kỳ không được âm"),
  notes: z.string().max(500, "Ghi chú không được quá 500 ký tự").optional(),
});

// Debt Reconciliation Validation - Tính toán số dư cuối kỳ
export const debtReconciliationSchemaWithValidation = debtReconciliationSchema.superRefine(
  (data, ctx) => {
    const calculatedClosing = data.opening_balance + data.total_sales - data.total_payments;

    if (Math.abs(data.closing_balance - calculatedClosing) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Số dư cuối kỳ không khớp. Số dư tính toán: ${calculatedClosing.toFixed(2)}`,
        path: ["closing_balance"],
      });
    }
  }
);

// Expense Schema
export const expenseSchema = z.object({
  expense_code: z
    .string()
    .min(1, "Mã chi phí là bắt buộc")
    .max(50, "Mã chi phí không được quá 50 ký tự"),
  expense_date: z.string().min(1, "Ngày chi phí là bắt buộc"),
  expense_category: z.enum(["rent", "utilities", "salary", "marketing", "maintenance", "other"])
        .refine((val) => !!val, { message: "Loại chi phí là bắt buộc" })
    ,
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  payment_method: z.enum(["cash", "bank_transfer", "check"])
    .refine((val) => !!val, { message: "Phương thức thanh toán là bắt buộc" }),
  description: z
    .string()
    .min(1, "Mô tả là bắt buộc")
    .max(500, "Mô tả không được quá 500 ký tự"),
  notes: z.string().max(500, "Ghi chú không được quá 500 ký tự").optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

// Finance Filter Schema
export const financeFilterSchema = z.object({
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  payment_method: z.enum(["cash", "bank_transfer", "credit", "cod", "check"]).optional(),
  type: z.string().optional(),
  customer_id: z.number().int().positive().optional(),
  supplier_id: z.number().int().positive().optional(),
  min_amount: z.number().min(0).optional(),
  max_amount: z.number().min(0).optional(),
});

export type FinanceFilterFormData = z.infer<typeof financeFilterSchema>;
export type PaymentReceiptFormData = z.infer<typeof paymentReceiptSchema>;
export type PaymentVoucherFormData = z.infer<typeof paymentVoucherSchema>;
export type DebtReconciliationFormData = z.infer<typeof debtReconciliationSchema>;