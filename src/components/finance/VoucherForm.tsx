"use client";

/**
 * Voucher Form Component
 * Form tạo/sửa phiếu chi
 */

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { CreatePaymentVoucherDto, VoucherType, VoucherPaymentMethod, Supplier } from "@/types";
import { useSuppliers } from "@/hooks/api";
import Button from "@/components/ui/button/Button";
import { Calendar, DollarSign, FileText, Building2, CreditCard } from "lucide-react";
import { format } from "date-fns";

// Validation Schema
const voucherSchema = z.object({
  voucherType: z.enum(["salary", "operating_cost", "supplier_payment", "refund", "other"]),
  supplierId: z.number().optional(),
  expenseAccount: z.string().optional(),
  amount: z.number().min(0.01, "Số tiền phải lớn hơn 0"),
  paymentMethod: z.enum(["cash", "transfer"]),
  bankName: z.string().optional(),
  paymentDate: z.string().min(1, "Vui lòng chọn ngày chi"),
  notes: z.string().optional(),
});

type VoucherFormData = z.infer<typeof voucherSchema>;

interface VoucherFormProps {
  initialData?: Partial<CreatePaymentVoucherDto>;
  onSubmit: (data: CreatePaymentVoucherDto) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export default function VoucherForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: VoucherFormProps) {
  const [showBankFields, setShowBankFields] = useState(
    initialData?.paymentMethod === "transfer" || false
  );
  const [showSupplierField, setShowSupplierField] = useState(
    initialData?.voucherType === "supplier_payment" || false
  );

  const { data: suppliersData } = useSuppliers({ status: "active" });
  const suppliers = suppliersData?.data as unknown as Supplier[];
  // console.log(suppliers)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setValue,
  } = useForm<VoucherFormData>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      voucherType: initialData?.voucherType || "operating_cost",
      supplierId: initialData?.supplierId,
      expenseAccount: initialData?.expenseAccount || "",
      amount: initialData?.amount || 0,
      paymentMethod: initialData?.paymentMethod || "cash",
      bankName: initialData?.bankName || "",
      paymentDate: initialData?.paymentDate ? initialData.paymentDate.slice(0, 10) : format(new Date(), "yyyy-MM-dd"),
      notes: initialData?.notes || "",
    },
  });

  const paymentMethod = watch("paymentMethod");
  const voucherType = watch("voucherType");

  useEffect(() => {
    setShowBankFields(paymentMethod === "transfer");
  }, [paymentMethod]);

  useEffect(() => {
    setShowSupplierField(voucherType === "supplier_payment");
    // Clear supplierId if not supplier_payment
    if (voucherType !== "supplier_payment") {
      setValue("supplierId", undefined);
    }
  }, [voucherType, setValue]);

  const handleFormSubmit = async (data: VoucherFormData) => {
    await onSubmit(data as CreatePaymentVoucherDto);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Voucher Type */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Loại phiếu chi <span className="text-red-500">*</span>
        </label>
        <select
          {...register("voucherType")}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="operating_cost">Chi phí hoạt động</option>
          <option value="supplier_payment">Thanh toán nhà cung cấp</option>
          <option value="salary">Chi lương</option>
          <option value="refund">Hoàn tiền</option>
          <option value="other">Khác</option>
        </select>
        {errors.voucherType && (
          <p className="mt-1 text-sm text-red-600">{errors.voucherType.message}</p>
        )}
      </div>

      {/* Supplier Selector (chỉ hiện khi type = supplier_payment) */}
      {showSupplierField && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nhà cung cấp <span className="text-red-500">*</span>
          </label>
          <select
            {...register("supplierId", { valueAsNumber: true })}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Chọn nhà cung cấp...</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.supplierName}
              </option>
            ))}
          </select>
          {errors.supplierId && (
            <p className="mt-1 text-sm text-red-600">{errors.supplierId.message}</p>
          )}
        </div>
      )}

      {/* Expense Account (optional) */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tài khoản chi phí (tùy chọn)
        </label>
        <input
          type="text"
          {...register("expenseAccount")}
          placeholder="VD: 6421, 6422..."
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        {errors.expenseAccount && (
          <p className="mt-1 text-sm text-red-600">{errors.expenseAccount.message}</p>
        )}
      </div>

      {/* Amount & Payment Date */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Amount */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Số tiền <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              step="0.01"
              {...register("amount", { valueAsNumber: true })}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="0.00"
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>

        {/* Payment Date */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Ngày chi <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              {...register("paymentDate")}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          {errors.paymentDate && (
            <p className="mt-1 text-sm text-red-600">{errors.paymentDate.message}</p>
          )}
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Phương thức thanh toán <span className="text-red-500">*</span>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
              paymentMethod === "cash"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 hover:border-gray-400 dark:border-gray-600"
            }`}
          >
            <input
              type="radio"
              value="cash"
              {...register("paymentMethod")}
              className="h-4 w-4 text-blue-600"
            />
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              <span className="font-medium">Tiền mặt</span>
            </div>
          </label>

          <label
            className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
              paymentMethod === "transfer"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 hover:border-gray-400 dark:border-gray-600"
            }`}
          >
            <input
              type="radio"
              value="transfer"
              {...register("paymentMethod")}
              className="h-4 w-4 text-blue-600"
            />
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <span className="font-medium">Chuyển khoản</span>
            </div>
          </label>
        </div>
        {errors.paymentMethod && (
          <p className="mt-1 text-sm text-red-600">{errors.paymentMethod.message}</p>
        )}
      </div>

      {/* Bank Fields (chỉ hiện khi chuyển khoản) */}
      {showBankFields && (
        <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <h4 className="font-medium text-blue-900 dark:text-blue-300">
            Thông tin chuyển khoản
          </h4>

          {/* Bank Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tên ngân hàng
            </label>
            <input
              type="text"
              {...register("bankName")}
              placeholder="VD: Vietcombank, Techcombank..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Ghi chú
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <textarea
            {...register("notes")}
            rows={3}
            placeholder="Ghi chú thêm (tùy chọn)..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
            Hủy
          </Button>
        )}
        <Button type="submit" variant="primary" className="flex-1">
          {initialData ? "Cập nhật" : "Tạo phiếu chi"}
        </Button>
      </div>
    </form>
  );
}
