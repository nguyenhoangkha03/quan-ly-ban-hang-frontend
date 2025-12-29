"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// 👇 IMPORT HOOK MỚI (GỘP CHUNG)
import { useCreateDebtReconciliation } from "@/hooks/api/useDebtReconciliation"; 

// 👇 IMPORT TYPE TỪ FILE MỚI TÁCH BIỆT
import type { CreateDebtReconciliationDto } from "@/types/debt-reconciliation.types";

import ReconciliationForm from "@/components/finance/ReconciliationForm";

export default function CreateReconciliationPage() {
  const router = useRouter();
  
  // ✅ Sử dụng 1 Hook duy nhất cho mọi loại đối chiếu
  const createMutation = useCreateDebtReconciliation();

  const handleSubmit = async (data: CreateDebtReconciliationDto) => {
    try {
      // Không cần switch/case nữa, hook tự xử lý endpoint dựa vào data.reconciliationType
      await createMutation.mutateAsync(data);
      
      // Thành công -> Quay về danh sách
      router.push("/finance/debt-reconciliation");
    } catch (error) {
      console.error("Failed to create reconciliation:", error);
      // Toast lỗi đã được xử lý trong hook (onError) nên không cần gọi ở đây
    }
  };

  const handleCancel = () => {
    router.push("/finance/debt-reconciliation");
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/finance/debt-reconciliation"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tạo Đối Chiếu Công Nợ
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Tạo bảng đối chiếu công nợ với khách hàng hoặc nhà cung cấp
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900 shadow-sm">
          <ReconciliationForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={createMutation.isPending}
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300">
            Hướng dẫn đối chiếu công nợ
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-400 list-disc pl-5">
            <li>
              <strong>Đối chiếu tháng:</strong> Nhập kỳ dạng YYYYMM (VD: 202501 = Tháng 01/2025)
            </li>
            <li>
              <strong>Đối chiếu quý:</strong> Nhập kỳ dạng YYYYQX (VD: 2025Q1 = Quý 1/2025)
            </li>
            <li>
              <strong>Đối chiếu năm:</strong> Nhập kỳ dạng YYYY (VD: 2025)
            </li>
            <li>
              Hệ thống sẽ tự động tính toán số dư đầu kỳ, phát sinh, thanh toán và số dư cuối kỳ dựa trên các chứng từ đã duyệt.
            </li>
            <li>
              Sau khi tạo, bạn có thể in PDF hoặc gửi email đối chiếu cho đối tác.
            </li>
          </ul>
        </div>
      </div>

      {/* Calculation Info */}
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Công thức tính toán
          </h3>
          <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-700">
              <span>Số dư đầu kỳ:</span>
              <span className="font-mono">opening_balance</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-700">
              <span>Phát sinh tăng (đơn hàng/phiếu nhập):</span>
              <span className="font-mono text-green-600">+ transactions_amount</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-700">
              <span>Phát sinh giảm (phiếu thu/chi):</span>
              <span className="font-mono text-red-600">- payment_amount</span>
            </div>
            <div className="flex items-center justify-between border-t-2 pt-2 font-semibold dark:border-gray-600">
              <span>Số dư cuối kỳ:</span>
              <span className="font-mono text-blue-600">= closing_balance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}