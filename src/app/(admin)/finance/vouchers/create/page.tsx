"use client";

/**
 * Create Payment Voucher Page
 * Tạo phiếu chi mới
 */

import React from "react";
import { useRouter } from "next/navigation";
import { useCreatePaymentVoucher } from "@/hooks/api";
import VoucherForm from "@/components/features/finance/VoucherForm";
import type { CreatePaymentVoucherDto } from "@/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateVoucherPage() {
  const router = useRouter();
  const createVoucher = useCreatePaymentVoucher();

  const handleSubmit = async (data: CreatePaymentVoucherDto) => {
    try {
      await createVoucher.mutateAsync(data);
      router.push("/finance/vouchers");
    } catch (error) {
      console.error("Failed to create voucher:", error);
    }
  };

  const handleCancel = () => {
    router.push("/finance/vouchers");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/finance/vouchers"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tạo Phiếu Chi
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Tạo phiếu chi tiền
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <VoucherForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={createVoucher.isPending}
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <h3 className="font-semibold text-red-900 dark:text-red-300">
            Lưu ý quan trọng
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-red-800 dark:text-red-400">
            <li>• Phiếu chi sau khi tạo cần phê duyệt mới có hiệu lực</li>
            <li>• Khi phê duyệt, công nợ nhà cung cấp sẽ được cập nhật tự động (nếu có)</li>
            <li>
              • Nếu phương thức thanh toán là tiền mặt, quỹ tiền mặt sẽ được cập nhật
            </li>
            <li>• Chỉ có thể xóa phiếu chi chưa được phê duyệt</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
