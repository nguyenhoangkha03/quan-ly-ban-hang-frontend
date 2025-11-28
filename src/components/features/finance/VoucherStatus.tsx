"use client";

/**
 * Voucher Status Component
 * Hiển thị trạng thái phiếu chi (approved/pending)
 */

import React from "react";
import type { PaymentVoucher } from "@/types";
import { CheckCircle, Clock, FileCheck } from "lucide-react";

interface VoucherStatusProps {
  voucher: PaymentVoucher;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const sizeClasses = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
  lg: "px-4 py-2 text-base",
};

export default function VoucherStatus({
  voucher,
  size = "md",
  showLabel = true,
}: VoucherStatusProps) {
  const isApproved = !!voucher.approvedAt;
  const isPosted = voucher.isPosted;

  if (isApproved) {
    return (
      <div className="inline-flex items-center gap-2">
        {/* Approved Badge */}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 ${sizeClasses[size]}`}
        >
          <CheckCircle className="h-4 w-4" />
          {showLabel && "Đã duyệt"}
        </span>

        {/* Posted Badge */}
        {isPosted && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 ${sizeClasses[size]}`}
          >
            <FileCheck className="h-4 w-4" />
            {showLabel && "Đã ghi sổ"}
          </span>
        )}
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 ${sizeClasses[size]}`}
    >
      <Clock className="h-4 w-4" />
      {showLabel && "Chờ duyệt"}
    </span>
  );
}

/**
 * Voucher Type Badge
 * Hiển thị loại phiếu chi
 */
interface VoucherTypeBadgeProps {
  voucherType: string;
  size?: "sm" | "md" | "lg";
}

export function VoucherTypeBadge({ voucherType, size = "md" }: VoucherTypeBadgeProps) {
  const typeConfig: Record<
    string,
    { label: string; color: string }
  > = {
    salary: {
      label: "Chi lương",
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    },
    operating_cost: {
      label: "Chi phí hoạt động",
      color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    },
    supplier_payment: {
      label: "Thanh toán NCC",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    },
    refund: {
      label: "Hoàn tiền",
      color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    },
    other: {
      label: "Khác",
      color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
    },
  };

  const config = typeConfig[voucherType] || typeConfig.other;

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.color} ${sizeClasses[size]}`}
    >
      {config.label}
    </span>
  );
}

/**
 * Payment Method Badge
 * Hiển thị phương thức thanh toán
 */
interface PaymentMethodBadgeProps {
  paymentMethod: string;
  size?: "sm" | "md" | "lg";
}

export function PaymentMethodBadge({
  paymentMethod,
  size = "md",
}: PaymentMethodBadgeProps) {
  const methodConfig: Record<string, { label: string; color: string }> = {
    cash: {
      label: "Tiền mặt",
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    },
    transfer: {
      label: "Chuyển khoản",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    },
  };

  const config = methodConfig[paymentMethod] || methodConfig.cash;

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.color} ${sizeClasses[size]}`}
    >
      {config.label}
    </span>
  );
}
