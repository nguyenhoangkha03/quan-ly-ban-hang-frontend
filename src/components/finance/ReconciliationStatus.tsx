"use client";

import React from "react";
import type { ReconciliationStatus } from "@/types/debt-reconciliation.types";
import { CheckCircle, Clock } from "lucide-react";

interface Props {
  status: ReconciliationStatus; // 'paid' | 'unpaid'
  size?: "sm" | "md";
  showLabel?: boolean;
}

export default function ReconciliationStatusBadge({ 
  status, 
  size = "md", 
  showLabel = true 
}: Props) {
  
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  if (status === "paid") {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 ${sizeClass}`}>
        <CheckCircle className={iconSize} />
        {showLabel && "Đã trả hết"}
      </span>
    );
  }

  // Mặc định là unpaid
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 ${sizeClass}`}>
      <Clock className={iconSize} />
      {showLabel && "Chưa trả hết"}
    </span>
  );
}