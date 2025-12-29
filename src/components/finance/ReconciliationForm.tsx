"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateDebtReconciliationDto, ReconciliationType } from "@/types/debt-reconciliation.types";
import { createDebtSchema, CreateDebtForm } from "@/lib/validations/debt-reconciliation.schema";
import { useCustomers } from "@/hooks/api/useCustomers"; // Giả định path hook
import { useSuppliers } from "@/hooks/api/useSuppliers"; // Giả định path hook
import Button from "@/components/ui/button/Button"; // Giả định path button
import { Calendar, FileText, Users, AlertCircle } from "lucide-react";
import { format } from "date-fns";

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
  const [entityType, setEntityType] = useState<"customer" | "supplier">("customer");

  // Fetch danh sách (Thêm options để lấy tất cả hoặc phân trang lớn)
  // Thêm 'as any' để tắt kiểm tra type tạm thời
  const { data: customersResponse } = useCustomers({ status: "active", limit: 100 } as any);
  const { data: suppliersResponse, isLoading: isLoadingSuppliers } = useSuppliers({ status: "active", limit: 100 });

  // ✅ FIX LỖI MAP: Kiểm tra kỹ cấu trúc trả về
  // Nếu API trả về { data: [], meta: {} } thì lấy .data
  // Nếu API trả về [] thì lấy trực tiếp
  const customers = Array.isArray(customersResponse?.data)
    ? customersResponse.data
    : (Array.isArray(customersResponse) ? customersResponse : []);

  const suppliers = Array.isArray(suppliersResponse?.data)
    ? suppliersResponse.data
    : (Array.isArray(suppliersResponse) ? suppliersResponse : []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateDebtForm>({
    resolver: zodResolver(createDebtSchema),
    defaultValues: {
      reconciliationType: (initialData?.reconciliationType as any) || "monthly",
      period: initialData?.period || format(new Date(), "yyyyMM"),
      customerId: initialData?.customerId,
      supplierId: initialData?.supplierId,
      // Format date string cho input type="date"
      reconciliationDate: initialData?.reconciliationDate
        ? new Date(initialData.reconciliationDate)
        : new Date(),
      notes: initialData?.notes || "",
    },
  });

  const reconciliationType = watch("reconciliationType");

  const handleEntityTypeChange = (type: "customer" | "supplier") => {
    setEntityType(type);
    if (type === "customer") {
      setValue("supplierId", undefined);
    } else {
      setValue("customerId", undefined);
    }
  };

  // ✅ FIX LỖI SUBMIT HANDLER
  const handleFormSubmit = async (data: CreateDebtForm) => {
    // data.reconciliationDate lúc này đã là Date object nhờ z.coerce.date() hoặc schema chuẩn
    const submitData: CreateDebtReconciliationDto = {
      reconciliationType: data.reconciliationType as ReconciliationType,
      period: data.period,
      customerId: entityType === "customer" ? data.customerId : undefined,
      supplierId: entityType === "supplier" ? data.supplierId : undefined,
      reconciliationDate: data.reconciliationDate,
      notes: data.notes || undefined,
    };
    await onSubmit(submitData);
  };

  const getPeriodPlaceholder = (type: string) => {
    switch (type) {
      case "monthly": return "VD: 202501 (Tháng 01/2025)";
      case "quarterly": return "VD: 2025Q1 (Quý 1/2025)";
      case "yearly": return "VD: 2025 (Năm 2025)";
      default: return "";
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* 1. Loại đối chiếu */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Loại kỳ <span className="text-red-500">*</span>
          </label>
          <select
            {...register("reconciliationType")}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="monthly">Theo tháng</option>
            <option value="quarterly">Theo quý</option>
            <option value="yearly">Theo năm</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Mã kỳ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("period")}
            placeholder={getPeriodPlaceholder(reconciliationType)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
          />
          {errors.period && <p className="mt-1 text-xs text-red-500">{errors.period.message}</p>}
        </div>
      </div>

      {/* 2. Đối tượng */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Đối tượng <span className="text-red-500">*</span>
        </label>

        <div className="mb-3 flex rounded-md bg-gray-100 p-1 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => handleEntityTypeChange("customer")}
            className={`flex-1 rounded py-1.5 text-sm font-medium transition-all ${entityType === "customer"
                ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
          >
            Khách hàng
          </button>
          <button
            type="button"
            onClick={() => handleEntityTypeChange("supplier")}
            className={`flex-1 rounded py-1.5 text-sm font-medium transition-all ${entityType === "supplier"
                ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
          >
            Nhà cung cấp
          </button>
        </div>

        {entityType === "customer" ? (
          <select
            {...register("customerId", { valueAsNumber: true })}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            disabled={loading}
          >
            <option value="">-- Chọn khách hàng --</option>
            {/* ✅ Đã fix lỗi map ở đây */}
            {customers.map((c: any) => (
              <option key={c.id} value={c.id}>{c.customerName || c.customer_name}</option>
            ))}
          </select>
        ) : (
          <select
            {...register("supplierId", { valueAsNumber: true })}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            disabled={isLoadingSuppliers}
          >
            <option value="">-- Chọn nhà cung cấp --</option>
            {/* ✅ Đã fix lỗi map ở đây */}
            {suppliers.map((s: any) => (
              <option key={s.id} value={s.id}>{s.supplierName || s.supplier_name}</option>
            ))}
          </select>
        )}

        {errors.customerId && <p className="mt-1 text-xs text-red-500">{errors.customerId.message}</p>}
        {errors.supplierId && <p className="mt-1 text-xs text-red-500">{errors.supplierId.message}</p>}
      </div>

      {/* 3. Ngày chốt số liệu */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Ngày chốt số liệu <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="date"
            {...register("reconciliationDate", { valueAsDate: true })}
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
          // React Hook Form sẽ tự xử lý value cho date input khi dùng valueAsDate
          />
        </div>
        {errors.reconciliationDate && <p className="mt-1 text-xs text-red-500">{errors.reconciliationDate.message}</p>}
      </div>

      {/* 4. Ghi chú */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Ghi chú</label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <textarea
            {...register("notes")}
            rows={3}
            placeholder="Ghi chú nội bộ..."
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
      </div>

      {/* Info Alert */}
      <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
        <div className="flex gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Hệ thống tự động tính toán:</p>
            <ul className="ml-4 mt-1 list-disc text-xs opacity-90">
              <li>Nợ đầu kỳ & Cuối kỳ</li>
              <li>Tổng phát sinh mua hàng & thanh toán</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 border-t pt-4 dark:border-gray-700">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Hủy bỏ
          </Button>
        )}
        <Button type="submit" isLoading={loading}>
          {initialData ? "Cập nhật" : "Tạo đối chiếu"}
        </Button>
      </div>
    </form>
  );
}