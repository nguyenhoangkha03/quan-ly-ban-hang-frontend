"use client";

/**
 * Reconciliation Form Component
 * Form tạo đối chiếu công nợ
 */

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type {
  CreateDebtReconciliationDto,
  ReconciliationType,
} from "@/types";
import { useCustomers, useSuppliers } from "@/hooks/api";
import Button from "@/components/ui/button/Button";
import { Calendar, FileText, Users } from "lucide-react";
import { format } from "date-fns";

// Validation Schema
const reconciliationSchema = z.object({
  reconciliationType: z.enum(["monthly", "quarterly", "yearly"]),
  period: z.string().min(1, "Vui lòng nhập kỳ đối chiếu"),
  entityType: z.enum(["customer", "supplier"]),
  customerId: z.number().optional(),
  supplierId: z.number().optional(),
  reconciliationDate: z.string().min(1, "Vui lòng chọn ngày đối chiếu"),
  notes: z.string().optional(),
}).refine(
  (data) => {
    if (data.entityType === "customer") {
      return !!data.customerId;
    }
    if (data.entityType === "supplier") {
      return !!data.supplierId;
    }
    return false;
  },
  {
    message: "Vui lòng chọn khách hàng hoặc nhà cung cấp",
    path: ["customerId"],
  }
);

type ReconciliationFormData = z.infer<typeof reconciliationSchema>;

interface ReconciliationFormProps {
  initialData?: Partial<CreateDebtReconciliationDto>;
  onSubmit: (data: CreateDebtReconciliationDto) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export default function ReconciliationForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: ReconciliationFormProps) {
  const [entityType, setEntityType] = useState<"customer" | "supplier">(
    initialData?.customerId ? "customer" : "supplier"
  );

  const { data: customersData } = useCustomers({ status: "active" });
  const { data: suppliersData } = useSuppliers({ status: "active" });

  const customers = customersData?.data || [];
  const suppliers = suppliersData?.data || [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReconciliationFormData>({
    resolver: zodResolver(reconciliationSchema),
    defaultValues: {
      reconciliationType: initialData?.reconciliationType || "monthly",
      period: initialData?.period || "",
      entityType: initialData?.customerId ? "customer" : "supplier",
      customerId: initialData?.customerId,
      supplierId: initialData?.supplierId,
      reconciliationDate:
        initialData?.reconciliationDate || format(new Date(), "yyyy-MM-dd"),
      notes: initialData?.notes || "",
    },
  });

  const reconciliationType = watch("reconciliationType");
  const watchedEntityType = watch("entityType");

  useEffect(() => {
    setEntityType(watchedEntityType);
    // Clear opposite entity when switching
    if (watchedEntityType === "customer") {
      setValue("supplierId", undefined);
    } else {
      setValue("customerId", undefined);
    }
  }, [watchedEntityType, setValue]);

  const handleFormSubmit = async (data: ReconciliationFormData) => {
    const submitData: CreateDebtReconciliationDto = {
      reconciliationType: data.reconciliationType,
      period: data.period,
      customerId: data.entityType === "customer" ? data.customerId : undefined,
      supplierId: data.entityType === "supplier" ? data.supplierId : undefined,
      reconciliationDate: data.reconciliationDate,
      notes: data.notes,
    };
    await onSubmit(submitData);
  };

  // Helper để tạo period placeholder
  const getPeriodPlaceholder = (type: ReconciliationType) => {
    switch (type) {
      case "monthly":
        return "VD: 202501 (Tháng 01/2025)";
      case "quarterly":
        return "VD: 2025Q1 (Quý 1/2025)";
      case "yearly":
        return "VD: 2025 (Năm 2025)";
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Reconciliation Type */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Loại đối chiếu <span className="text-red-500">*</span>
        </label>
        <select
          {...register("reconciliationType")}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="monthly">Theo tháng</option>
          <option value="quarterly">Theo quý</option>
          <option value="yearly">Theo năm</option>
        </select>
        {errors.reconciliationType && (
          <p className="mt-1 text-sm text-red-600">
            {errors.reconciliationType.message}
          </p>
        )}
      </div>

      {/* Period */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Kỳ đối chiếu <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("period")}
          placeholder={getPeriodPlaceholder(reconciliationType)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {reconciliationType === "monthly" && "Định dạng: YYYYMM (VD: 202501)"}
          {reconciliationType === "quarterly" && "Định dạng: YYYYQX (VD: 2025Q1)"}
          {reconciliationType === "yearly" && "Định dạng: YYYY (VD: 2025)"}
        </p>
        {errors.period && (
          <p className="mt-1 text-sm text-red-600">{errors.period.message}</p>
        )}
      </div>

      {/* Entity Type Selection */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Đối tượng đối chiếu <span className="text-red-500">*</span>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
              entityType === "customer"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 hover:border-gray-400 dark:border-gray-600"
            }`}
          >
            <input
              type="radio"
              value="customer"
              {...register("entityType")}
              className="h-4 w-4 text-blue-600"
            />
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="font-medium">Khách hàng</span>
            </div>
          </label>

          <label
            className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
              entityType === "supplier"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 hover:border-gray-400 dark:border-gray-600"
            }`}
          >
            <input
              type="radio"
              value="supplier"
              {...register("entityType")}
              className="h-4 w-4 text-blue-600"
            />
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="font-medium">Nhà cung cấp</span>
            </div>
          </label>
        </div>
      </div>

      {/* Customer/Supplier Selector */}
      {entityType === "customer" ? (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Khách hàng <span className="text-red-500">*</span>
          </label>
          <select
            {...register("customerId", { valueAsNumber: true })}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Chọn khách hàng...</option>
            {customers.map((customer: any) => (
              <option key={customer.id} value={customer.id}>
                {customer.customer_name} {customer.customer_code && `(${customer.customer_code})`}
              </option>
            ))}
          </select>
          {errors.customerId && (
            <p className="mt-1 text-sm text-red-600">{errors.customerId.message}</p>
          )}
        </div>
      ) : (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nhà cung cấp <span className="text-red-500">*</span>
          </label>
          <select
            {...register("supplierId", { valueAsNumber: true })}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Chọn nhà cung cấp...</option>
            {suppliers.map((supplier: any) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.supplier_name}
              </option>
            ))}
          </select>
          {errors.supplierId && (
            <p className="mt-1 text-sm text-red-600">{errors.supplierId.message}</p>
          )}
        </div>
      )}

      {/* Reconciliation Date */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Ngày đối chiếu <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            {...register("reconciliationDate")}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
        {errors.reconciliationDate && (
          <p className="mt-1 text-sm text-red-600">
            {errors.reconciliationDate.message}
          </p>
        )}
      </div>

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

      {/* Info Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <h4 className="font-medium text-blue-900 dark:text-blue-300">
          Thông tin tự động
        </h4>
        <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-400">
          <li>• Số dư đầu kỳ sẽ được tự động tính toán từ hệ thống</li>
          <li>• Tổng phát sinh (transactions_amount) tự động tính từ đơn hàng/phiếu nhập</li>
          <li>• Tổng thanh toán (payment_amount) tự động tính từ phiếu thu/chi</li>
          <li>• Số dư cuối kỳ = Số dư đầu + Phát sinh - Thanh toán</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
            Hủy
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading} className="flex-1">
          Tạo đối chiếu
        </Button>
      </div>
    </form>
  );
}
