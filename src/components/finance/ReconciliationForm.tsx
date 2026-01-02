"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, FileText, User, UserCheck } from "lucide-react";

// Import Schema
import { createDebtSchema, CreateDebtForm } from "@/lib/validations/debt-reconciliation.schema";

// Import Hooks
import { useCustomers } from "@/hooks/api/useCustomers";
import { useSuppliers } from "@/hooks/api/useSuppliers";
import { useUsers } from "@/hooks/api/useUsers";
import Button from "@/components/ui/button/Button";

interface Props {
  onSubmit: (data: CreateDebtForm) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ReconciliationForm({ onSubmit, onCancel, loading }: Props) {
  const [entityType, setEntityType] = useState<"customer" | "supplier">("customer");

  // 1. Load data
  const { data: customersData } = useCustomers({ status: "active", limit: 100 } as any);
  const { data: suppliersData } = useSuppliers({ status: "active", limit: 100 } as any);
  const { data: usersResponse } = useUsers({ status: "active", limit: 100 });

  // Safety check data
  const customers = Array.isArray(customersData?.data) ? customersData.data : [];
  const suppliers = Array.isArray(suppliersData?.data) ? suppliersData.data : [];
  const users = Array.isArray(usersResponse?.data) ? usersResponse.data : [];

 const { register, handleSubmit, setValue, formState: { errors } } = useForm({ 
    resolver: zodResolver(createDebtSchema),
    defaultValues: {
      notes: "",
      assignedUserId: undefined, // TypeScript sẽ không còn báo lỗi ở đây
    }
  });

  const handleTypeChange = (type: "customer" | "supplier") => {
    setEntityType(type);
    setValue("customerId", undefined);
    setValue("supplierId", undefined);
  };

  // ✅ [QUAN TRỌNG] Hàm xử lý dữ liệu trước khi gửi
  const onFormSubmit = (data: CreateDebtForm) => {
    // 1. Xử lý assignedUserId: Nếu là NaN (do chưa chọn) hoặc 0 -> chuyển về undefined
    let cleanAssignedUserId: number | undefined = data.assignedUserId;
    
    if (!cleanAssignedUserId || isNaN(cleanAssignedUserId)) {
        cleanAssignedUserId = undefined;
    }

    // 2. Tạo payload sạch sẽ
    const payload = {
        ...data,
        assignedUserId: cleanAssignedUserId,
        // Đảm bảo chỉ gửi đúng ID của loại đối tượng đang chọn
        customerId: entityType === 'customer' ? data.customerId : undefined,
        supplierId: entityType === 'supplier' ? data.supplierId : undefined,
    };

    console.log("🚀 Payload Safe to Send:", payload);
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
      
      {/* 1. Chọn Loại Đối Tượng */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Đối tượng <span className="text-red-500">*</span>
        </label>
        <div className="flex p-1 bg-gray-100 rounded-lg dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => handleTypeChange("customer")}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              entityType === "customer" 
                ? "bg-white shadow-sm text-blue-600 dark:bg-gray-700 dark:text-blue-400" 
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Khách hàng
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("supplier")}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              entityType === "supplier" 
                ? "bg-white shadow-sm text-blue-600 dark:bg-gray-700 dark:text-blue-400" 
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Nhà cung cấp
          </button>
        </div>
      </div>

      {/* 2. Dropdown Chọn Đối Tác */}
      <div>
        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
          {entityType === "customer" ? "Chọn Khách hàng" : "Chọn Nhà cung cấp"} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            
            {entityType === "customer" ? (
            <select
                {...register("customerId", { valueAsNumber: true })}
                className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                disabled={loading}
            >
                <option value="">-- Chọn khách hàng --</option>
                {customers.map((c: any) => (
                <option key={c.id} value={c.id}>
                    {c.customerName} {c.phone ? `- ${c.phone}` : ""}
                </option>
                ))}
            </select>
            ) : (
            <select
                {...register("supplierId", { valueAsNumber: true })}
                className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                disabled={loading}
            >
                <option value="">-- Chọn nhà cung cấp --</option>
                {suppliers.map((s: any) => (
                <option key={s.id} value={s.id}>
                    {s.supplierName}
                </option>
                ))}
            </select>
            )}
        </div>
        
        {errors.customerId && <p className="text-red-500 text-xs mt-1">{errors.customerId.message}</p>}
        {errors.supplierId && <p className="text-red-500 text-xs mt-1">{errors.supplierId.message}</p>}
      </div>

      {/* 3. Dropdown Chọn Người Phụ Trách */}
      <div>
        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
          Người phụ trách (Tùy chọn)
        </label>
        <div className="relative">
            <UserCheck className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            <select
                {...register("assignedUserId", { valueAsNumber: true })}
                className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                disabled={loading}
            >
                <option value="">-- Chọn nhân viên phụ trách --</option>
                {users.map((u: any) => (
                <option key={u.id} value={u.id}>
                    {u.fullName || u.username} ({u.role?.name || "Staff"})
                </option>
                ))}
            </select>
        </div>
        <p className="text-xs text-gray-500 mt-1">Nhân viên này sẽ chịu trách nhiệm theo dõi công nợ.</p>
      </div>

      {/* 4. Ghi Chú */}
      <div>
        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
          Ghi chú (Tùy chọn)
        </label>
        <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            <textarea
            {...register("notes")}
            rows={3}
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            placeholder="Ghi chú nội bộ cho kỳ này..."
            disabled={loading}
            />
        </div>
      </div>

      {/* 5. Thông báo tự động */}
      <div className="flex gap-3 p-3 rounded-md bg-blue-50 border border-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
            <p className="font-semibold">Cơ chế tự động hóa:</p>
            <ul className="list-disc pl-4 space-y-0.5">
                <li>Hệ thống sẽ tính toán số liệu cho năm nay <strong>({new Date().getFullYear()})</strong>.</li>
                <li><strong>Nợ đầu kỳ</strong> sẽ được tự động lấy từ số dư cuối của các năm trước.</li>
            </ul>
        </div>
      </div>

      {/* 6. Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={loading}
        >
          Hủy bỏ
        </Button>
        <Button 
          type="submit" 
          isLoading={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          Tạo & Tính Toán Ngay
        </Button>
      </div>
    </form>
  );
}