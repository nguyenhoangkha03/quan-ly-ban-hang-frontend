"use client";

/**
 * Create Payment Receipt Page
 * Tạo phiếu thu mới
 */

import React from "react";
import { useRouter } from "next/navigation";
import { useCreatePaymentReceipt } from "@/hooks/api";
import ReceiptForm from "@/components/finance/ReceiptForm";
import type { CreatePaymentReceiptDto } from "@/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateReceiptPage() {
  const router = useRouter();
  const createReceipt = useCreatePaymentReceipt();

  const handleSubmit = async (data: CreatePaymentReceiptDto) => {
    try {
      await createReceipt.mutateAsync(data);
      router.push("/finance/receipts");
    } catch (error) {
      console.error("Failed to create receipt:", error);
    }
  };

  const handleCancel = () => {
    router.push("/finance/receipts");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/finance/receipts"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tạo Phiếu Thu
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Tạo phiếu thu tiền từ khách hàng
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <ReceiptForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={createReceipt.isPending}
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300">
            Lưu ý quan trọng
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-400">
            <li>• Phiếu thu sau khi tạo cần phê duyệt mới có hiệu lực</li>
            <li>• Khi phê duyệt, công nợ khách hàng sẽ được cập nhật tự động</li>
            <li>
              • Nếu liên kết với đơn hàng, số tiền đã thanh toán của đơn hàng sẽ được
              cập nhật
            </li>
            <li>• Chỉ có thể xóa phiếu thu chưa được phê duyệt</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
