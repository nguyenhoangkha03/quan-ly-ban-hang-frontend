"use client";

/**
 * Reconciliation Status Component
 * Hiển thị trạng thái đối chiếu công nợ
 */

import React from "react";
import type { DebtReconciliation } from "@/types";
import { CheckCircle, Clock, AlertTriangle, Calendar } from "lucide-react";

interface ReconciliationStatusProps {
  reconciliation: DebtReconciliation;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const sizeClasses = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
  lg: "px-4 py-2 text-base",
};

export default function ReconciliationStatus({
  reconciliation,
  size = "md",
  showLabel = true,
}: ReconciliationStatusProps) {
  const status = reconciliation.status;

  const statusConfig = {
    pending: {
      label: "Chờ xác nhận",
      icon: <Clock className="h-4 w-4" />,
      color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    },
    confirmed: {
      label: "Đã xác nhận",
      icon: <CheckCircle className="h-4 w-4" />,
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    },
    disputed: {
      label: "Tranh chấp",
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.color} ${sizeClasses[size]}`}
    >
      {config.icon}
      {showLabel && config.label}
    </span>
  );
}

/**
 * Reconciliation Type Badge
 * Hiển thị loại đối chiếu (monthly/quarterly/yearly)
 */
interface ReconciliationTypeBadgeProps {
  reconciliationType: string;
  size?: "sm" | "md" | "lg";
}

export function ReconciliationTypeBadge({
  reconciliationType,
  size = "md",
}: ReconciliationTypeBadgeProps) {
  const typeConfig: Record<string, { label: string; color: string }> = {
    monthly: {
      label: "Tháng",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    },
    quarterly: {
      label: "Quý",
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    },
    yearly: {
      label: "Năm",
      color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    },
  };

  const config = typeConfig[reconciliationType] || typeConfig.monthly;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.color} ${sizeClasses[size]}`}
    >
      <Calendar className="h-3 w-3" />
      {config.label}
    </span>
  );
}

/**
 * Entity Type Badge
 * Hiển thị loại đối tác (customer/supplier)
 */
interface EntityTypeBadgeProps {
  hasCustomer: boolean;
  hasSupplier: boolean;
  size?: "sm" | "md" | "lg";
}

export function EntityTypeBadge({
  hasCustomer,
  hasSupplier,
  size = "md",
}: EntityTypeBadgeProps) {
  const label = hasCustomer ? "Khách hàng" : hasSupplier ? "Nhà cung cấp" : "N/A";
  const color = hasCustomer
    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
    : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${color} ${sizeClasses[size]}`}
    >
      {label}
    </span>
  );
}
