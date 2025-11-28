/**
 * Salary Validation Schemas
 * Zod schemas for salary-related forms
 */

import { z } from "zod";

//----------------------------------------------
// Calculate Salary Schema
//----------------------------------------------

export const calculateSalarySchema = z.object({
  userId: z
    .number({
      required_error: "Vui lòng chọn nhân viên",
      invalid_type_error: "ID nhân viên không hợp lệ",
    })
    .min(1, "Vui lòng chọn nhân viên"),
  month: z
    .string({
      required_error: "Vui lòng chọn tháng",
    })
    .regex(/^\d{6}$/, "Tháng phải có định dạng YYYYMM (ví dụ: 202501)"),
  basicSalary: z
    .number({
      invalid_type_error: "Lương cơ bản phải là số",
    })
    .min(0, "Lương cơ bản phải >= 0")
    .optional(),
  allowance: z
    .number({
      invalid_type_error: "Phụ cấp phải là số",
    })
    .min(0, "Phụ cấp phải >= 0")
    .optional(),
  bonus: z
    .number({
      invalid_type_error: "Thưởng phải là số",
    })
    .min(0, "Thưởng phải >= 0")
    .optional(),
  advance: z
    .number({
      invalid_type_error: "Tạm ứng phải là số",
    })
    .min(0, "Tạm ứng phải >= 0")
    .optional(),
  notes: z
    .string()
    .max(255, "Ghi chú không được vượt quá 255 ký tự")
    .optional(),
});

export type CalculateSalaryFormValues = z.infer<typeof calculateSalarySchema>;

//----------------------------------------------
// Update Salary Schema
//----------------------------------------------

export const updateSalarySchema = z.object({
  basicSalary: z
    .number({
      invalid_type_error: "Lương cơ bản phải là số",
    })
    .min(0, "Lương cơ bản phải >= 0")
    .optional(),
  allowance: z
    .number({
      invalid_type_error: "Phụ cấp phải là số",
    })
    .min(0, "Phụ cấp phải >= 0")
    .optional(),
  overtimePay: z
    .number({
      invalid_type_error: "Lương làm thêm phải là số",
    })
    .min(0, "Lương làm thêm phải >= 0")
    .optional(),
  bonus: z
    .number({
      invalid_type_error: "Thưởng phải là số",
    })
    .min(0, "Thưởng phải >= 0")
    .optional(),
  commission: z
    .number({
      invalid_type_error: "Hoa hồng phải là số",
    })
    .min(0, "Hoa hồng phải >= 0")
    .optional(),
  deduction: z
    .number({
      invalid_type_error: "Khấu trừ phải là số",
    })
    .min(0, "Khấu trừ phải >= 0")
    .optional(),
  advance: z
    .number({
      invalid_type_error: "Tạm ứng phải là số",
    })
    .min(0, "Tạm ứng phải >= 0")
    .optional(),
  notes: z
    .string()
    .max(255, "Ghi chú không được vượt quá 255 ký tự")
    .optional(),
});

export type UpdateSalaryFormValues = z.infer<typeof updateSalarySchema>;

//----------------------------------------------
// Approve Salary Schema
//----------------------------------------------

export const approveSalarySchema = z.object({
  notes: z
    .string()
    .max(500, "Ghi chú không được vượt quá 500 ký tự")
    .optional(),
});

export type ApproveSalaryFormValues = z.infer<typeof approveSalarySchema>;

//----------------------------------------------
// Pay Salary Schema
//----------------------------------------------

export const paySalarySchema = z.object({
  paymentDate: z
    .string({
      required_error: "Vui lòng chọn ngày thanh toán",
    })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Ngày thanh toán không hợp lệ",
    }),
  paymentMethod: z.enum(["cash", "transfer"], {
    required_error: "Vui lòng chọn phương thức thanh toán",
    invalid_type_error: "Phương thức thanh toán không hợp lệ",
  }),
  notes: z
    .string()
    .max(500, "Ghi chú không được vượt quá 500 ký tự")
    .optional(),
});

export type PaySalaryFormValues = z.infer<typeof paySalarySchema>;

//----------------------------------------------
// Salary Filters Schema
//----------------------------------------------

export const salaryFilterSchema = z.object({
  userId: z.number().optional(),
  month: z.string().regex(/^\d{6}$/).optional(),
  status: z.enum(["pending", "approved", "paid"]).optional(),
  fromMonth: z.string().regex(/^\d{6}$/).optional(),
  toMonth: z.string().regex(/^\d{6}$/).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type SalaryFilterFormValues = z.infer<typeof salaryFilterSchema>;
