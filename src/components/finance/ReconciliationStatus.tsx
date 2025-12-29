"use client";

import React from "react";
import type { ReconciliationStatus } from "@/types/debt-reconciliation.types"; // Update path
import { CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";

interface Props {
  status: ReconciliationStatus;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export default function ReconciliationStatusBadge({ 
  status, 
  size = "md", 
  showLabel = true 
}: Props) {
  
  const config = {
    pending: {
      label: "Chờ xác nhận",
      icon: Clock,
      className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    },
    confirmed: {
      label: "Đã xác nhận",
      icon: CheckCircle2,
      className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    },
    disputed: {
      label: "Có sai lệch",
      icon: AlertTriangle,
      className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    },
  };

  const current = config[status] || config.pending;
  const Icon = current.icon;
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${current.className} ${sizeClass} font-medium`}>
      <Icon className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      {showLabel && current.label}
    </span>
  );
}