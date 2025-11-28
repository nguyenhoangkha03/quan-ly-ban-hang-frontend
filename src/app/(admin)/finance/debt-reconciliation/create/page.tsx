"use client";

/**
 * Create Debt Reconciliation Page
 * Tạo đối chiếu công nợ mới
 */

import React from "react";
import { useRouter } from "next/navigation";
import {
  useCreateMonthlyReconciliation,
  useCreateQuarterlyReconciliation,
  useCreateYearlyReconciliation,
} from "@/hooks/api/useDebtReconciliation";
import ReconciliationForm from "@/components/features/finance/ReconciliationForm";
import type { CreateDebtReconciliationDto } from "@/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateReconciliationPage() {
  const router = useRouter();
  const createMonthly = useCreateMonthlyReconciliation();
  const createQuarterly = useCreateQuarterlyReconciliation();
  const createYearly = useCreateYearlyReconciliation();

  const handleSubmit = async (data: CreateDebtReconciliationDto) => {
    try {
      // Choose mutation based on reconciliation type
      switch (data.reconciliationType) {
        case "monthly":
          await createMonthly.mutateAsync(data);
          break;
        case "quarterly":
          await createQuarterly.mutateAsync(data);
          break;
        case "yearly":
          await createYearly.mutateAsync(data);
          break;
      }
      router.push("/finance/debt-reconciliation");
    } catch (error) {
      console.error("Failed to create reconciliation:", error);
    }
  };

  const handleCancel = () => {
    router.push("/finance/debt-reconciliation");
  };

  const isLoading =
    createMonthly.isPending ||
    createQuarterly.isPending ||
    createYearly.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/finance/debt-reconciliation"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
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

      {/* Form */}
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <ReconciliationForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={isLoading}
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300">
            Hướng dẫn đối chiếu công nợ
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-400">
            <li>
              • <strong>Đối chiếu tháng:</strong> Nhập period theo định dạng YYYYMM
              (VD: 202501 = Tháng 01/2025)
            </li>
            <li>
              • <strong>Đối chiếu quý:</strong> Nhập period theo định dạng YYYYQX
              (VD: 2025Q1 = Quý 1/2025)
            </li>
            <li>
              • <strong>Đối chiếu năm:</strong> Nhập period theo định dạng YYYY (VD:
              2025)
            </li>
            <li>
              • Hệ thống sẽ tự động tính toán số dư đầu kỳ, phát sinh, thanh toán và
              số dư cuối kỳ
            </li>
            <li>
              • Sau khi tạo, bạn có thể gửi email đối chiếu cho khách hàng/nhà cung
              cấp
            </li>
            <li>
              • Khách hàng/NCC có thể xác nhận hoặc tranh chấp số liệu đối chiếu
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
            <div className="flex items-center justify-between border-b pb-2">
              <span>Số dư đầu kỳ:</span>
              <span className="font-mono">opening_balance</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span>Phát sinh tăng (đơn hàng/phiếu nhập):</span>
              <span className="font-mono">+ transactions_amount</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span>Phát sinh giảm (phiếu thu/chi):</span>
              <span className="font-mono">- payment_amount</span>
            </div>
            <div className="flex items-center justify-between border-t-2 pt-2 font-semibold">
              <span>Số dư cuối kỳ:</span>
              <span className="font-mono text-blue-600">= closing_balance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
