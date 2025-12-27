"use client";

import React, { useState } from "react";
import { Calendar, Building2, ChevronDown } from "lucide-react";

interface DashboardFiltersProps {
  onPeriodChange?: (period: "today" | "week" | "month" | "custom") => void;
  onDateRangeChange?: (fromDate: string, toDate: string) => void;
  onWarehouseChange?: (warehouseId: number | null) => void;
  selectedPeriod?: "today" | "week" | "month" | "custom";
  selectedWarehouse?: number | null;
  isAdmin?: boolean;
}

export function DashboardFilters({
  onPeriodChange,
  onDateRangeChange,
  onWarehouseChange,
  selectedPeriod = "month",
  selectedWarehouse = null,
  isAdmin = false,
}: DashboardFiltersProps) {
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleCustomDateApply = () => {
    if (fromDate && toDate) {
      onDateRangeChange?.(fromDate, toDate);
      onPeriodChange?.("custom");
      setShowCustomDate(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-4">
      {/* Time Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
        <div className="flex gap-2 flex-wrap">
          {(["today", "week", "month"] as const).map((period) => (
            <button
              key={period}
              onClick={() => {
                onPeriodChange?.(period);
                setShowCustomDate(false);
              }}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
                selectedPeriod === period
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {period === "today" && "Hôm nay"}
              {period === "week" && "Tuần này"}
              {period === "month" && "Tháng này"}
            </button>
          ))}
        </div>

        {/* Custom Date Button */}
        <div className="relative">
          <button
            onClick={() => setShowCustomDate(!showCustomDate)}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
              selectedPeriod === "custom"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Tùy chọn
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* Custom Date Picker Dropdown */}
          {showCustomDate && (
            <div className="absolute right-0 mt-2 w-64 rounded-lg bg-white p-4 shadow-lg dark:bg-gray-700 z-10">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-600 dark:text-white"
                  />
                </div>
                <button
                  onClick={handleCustomDateApply}
                  className="w-full rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Warehouse Filter (Admin only) */}
      {isAdmin && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <select
            value={selectedWarehouse || ""}
            onChange={(e) =>
              onWarehouseChange?.(e.target.value ? parseInt(e.target.value) : null)
            }
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-gray-500 whitespace-nowrap"
          >
            <option value="">Tất cả kho</option>
            <option value="1">Kho Nguyên liệu</option>
            <option value="2">Kho Thành phẩm</option>
            <option value="3">Kho Hàng hóa</option>
          </select>
        </div>
      )}
    </div>
  );
}
