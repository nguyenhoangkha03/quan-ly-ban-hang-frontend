"use client";

/**
 * Receipt Form Component
 * Form tạo/sửa phiếu thu
 */

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { CreatePaymentReceiptDto, ReceiptType, ReceiptPaymentMethod } from "@/types";
import CustomerSelector from "../sales/CustomerSelector";
import Button from "@/components/ui/button/Button";
import { Calendar, DollarSign, FileText, CreditCard, Building2 } from "lucide-react";
import { format } from "date-fns";

// Validation Schema
const receiptSchema = z.object({
  receiptType: z.enum(["sales", "debt_collection", "refund", "other"]),
  customerId: z.number().min(1, "Vui lòng chọn khách hàng"),
  orderId: z.number().optional(),
  amount: z.number().min(0.01, "Số tiền phải lớn hơn 0"),
  paymentMethod: z.enum(["cash", "transfer", "card"]),
  bankName: z.string().optional(),
  transactionReference: z.string().optional(),
  receiptDate: z.string().min(1, "Vui lòng chọn ngày thu"),
  notes: z.string().optional(),
});

type ReceiptFormData = z.infer<typeof receiptSchema>;

interface ReceiptFormProps {
  initialData?: Partial<CreatePaymentReceiptDto>;
  onSubmit: (data: CreatePaymentReceiptDto) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export default function ReceiptForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: ReceiptFormProps) {
  const [showBankFields, setShowBankFields] = useState(
    initialData?.paymentMethod === "transfer" || false
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setValue,
  } = useForm<ReceiptFormData>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      receiptType: initialData?.receiptType || "sales",
      customerId: initialData?.customerId,
      orderId: initialData?.orderId,
      amount: initialData?.amount || 0,
      paymentMethod: initialData?.paymentMethod || "cash",
      bankName: initialData?.bankName || "",
      transactionReference: initialData?.transactionReference || "",
      receiptDate: initialData?.receiptDate || format(new Date(), "yyyy-MM-dd"),
      notes: initialData?.notes || "",
    },
  });

  const paymentMethod = watch("paymentMethod");

  useEffect(() => {
    setShowBankFields(paymentMethod === "transfer");
  }, [paymentMethod]);

  const handleFormSubmit = async (data: ReceiptFormData) => {
    await onSubmit(data as CreatePaymentReceiptDto);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Receipt Type */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Loại phiếu thu <span className="text-red-500">*</span>
        </label>
        <select
          {...register("receiptType")}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="sales">Thu tiền hàng</option>
          <option value="debt_collection">Thu công nợ</option>
          <option value="refund">Hoàn tiền</option>
          <option value="other">Khác</option>
        </select>
        {errors.receiptType && (
          <p className="mt-1 text-sm text-red-600">{errors.receiptType.message}</p>
        )}
      </div>

      {/* Customer Selector */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Khách hàng <span className="text-red-500">*</span>
        </label>
        <Controller
          name="customerId"
          control={control}
          render={({ field }) => (
            <CustomerSelector
              value={field.value}
              onChange={(customerId) => field.onChange(customerId)}
              placeholder="Chọn khách hàng..."
            />
          )}
        />
        {errors.customerId && (
          <p className="mt-1 text-sm text-red-600">{errors.customerId.message}</p>
        )}
      </div>

      {/* Order ID (optional) */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Mã đơn hàng (tùy chọn)
        </label>
        <input
          type="number"
          {...register("orderId", { valueAsNumber: true })}
          placeholder="Nhập ID đơn hàng nếu có"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        {errors.orderId && (
          <p className="mt-1 text-sm text-red-600">{errors.orderId.message}</p>
        )}
      </div>

      {/* Amount & Receipt Date */}
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

        {/* Receipt Date */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Ngày thu <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              {...register("receiptDate")}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          {errors.receiptDate && (
            <p className="mt-1 text-sm text-red-600">{errors.receiptDate.message}</p>
          )}
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Phương thức thanh toán <span className="text-red-500">*</span>
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
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

          <label
            className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
              paymentMethod === "card"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 hover:border-gray-400 dark:border-gray-600"
            }`}
          >
            <input
              type="radio"
              value="card"
              {...register("paymentMethod")}
              className="h-4 w-4 text-blue-600"
            />
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <span className="font-medium">Thẻ</span>
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

          {/* Transaction Reference */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mã giao dịch
            </label>
            <input
              type="text"
              {...register("transactionReference")}
              placeholder="Mã tham chiếu ngân hàng"
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
        <Button type="submit" variant="primary" loading={loading} className="flex-1">
          {initialData ? "Cập nhật" : "Tạo phiếu thu"}
        </Button>
      </div>
    </form>
  );
}
