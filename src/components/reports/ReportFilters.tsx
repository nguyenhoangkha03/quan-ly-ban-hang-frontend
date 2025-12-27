"use client";

import React, { useState, useEffect } from "react";
import { SimpleDatePicker } from "@/components/form/SimpleDatePicker";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { Search, RotateCcw } from "lucide-react";
import { format, subDays, startOfWeek, startOfMonth, startOfYear } from "date-fns";

export interface ReportFiltersProps {
  onFilterChange: (filters: Record<string, any>) => void;
  initialFilters?: Record<string, any>;
  showDateRange?: boolean;
  showDatePresets?: boolean;
  showGroupBy?: boolean;
  showSalesChannel?: boolean;
  showWarehouse?: boolean;
  showCategory?: boolean;
  showProductType?: boolean;
  showStaff?: boolean;
  showLimit?: boolean;
  customFilters?: React.ReactNode;
  warehouses?: Array<{ id: number; warehouse_name: string }>;
  categories?: Array<{ id: number; category_name: string }>;
  staff?: Array<{ id: number; full_name: string }>;
}

const GROUP_BY_OPTIONS = [
  { label: "Theo ngày", value: "day" },
  { label: "Theo tuần", value: "week" },
  { label: "Theo tháng", value: "month" },
  { label: "Theo năm", value: "year" },
];

const SALES_CHANNEL_OPTIONS = [
  { label: "Tất cả kênh", value: "" },
  { label: "Bán lẻ", value: "retail" },
  { label: "Bán sỉ", value: "wholesale" },
  { label: "Trực tuyến", value: "online" },
  { label: "Đại lý", value: "distributor" },
];

const PRODUCT_TYPE_OPTIONS = [
  { label: "Tất cả loại", value: "" },
  { label: "Nguyên liệu", value: "raw_material" },
  { label: "Bao bì", value: "packaging" },
  { label: "Thành phẩm", value: "finished_product" },
  { label: "Hàng hóa", value: "goods" },
];

const LIMIT_OPTIONS = [
  { label: "Top 10", value: "10" },
  { label: "Top 20", value: "20" },
  { label: "Top 50", value: "50" },
  { label: "Top 100", value: "100" },
];

const DATE_PRESET_OPTIONS = [
  { label: "Hôm nay", value: "today" },
  { label: "Hôm qua", value: "yesterday" },
  { label: "Tuần này", value: "this_week" },
  { label: "Tuần trước", value: "last_week" },
  { label: "Tháng này", value: "this_month" },
  { label: "Tháng trước", value: "last_month" },
  { label: "Quý này", value: "this_quarter" },
  { label: "Năm này", value: "this_year" },
];

export default function ReportFilters({
  onFilterChange,
  initialFilters = {},
  showDateRange = true,
  showDatePresets = false,
  showGroupBy = false,
  showSalesChannel = false,
  showWarehouse = false,
  showCategory = false,
  showProductType = false,
  showStaff = false,
  showLimit = false,
  customFilters,
  warehouses = [],
  categories = [],
  staff = [],
}: ReportFiltersProps) {
  // Default date range: last 30 days
  const today = new Date();
  const defaultFromDate = format(subDays(today, 30), "yyyy-MM-dd");
  const defaultToDate = format(today, "yyyy-MM-dd");

  const [filters, setFilters] = useState({
    fromDate: initialFilters.fromDate || defaultFromDate,
    toDate: initialFilters.toDate || defaultToDate,
    groupBy: initialFilters.groupBy || "day",
    salesChannel: initialFilters.salesChannel || "",
    warehouseId: initialFilters.warehouseId || "",
    categoryId: initialFilters.categoryId || "",
    productType: initialFilters.productType || "",
    staffId: initialFilters.staffId || "",
    ...initialFilters,
  });

  const getDateRangeFromPreset = (preset: string) => {
    const today = new Date();
    switch (preset) {
      case "today":
        return { fromDate: format(today, "yyyy-MM-dd"), toDate: format(today, "yyyy-MM-dd") };
      case "yesterday":
        const yesterday = subDays(today, 1);
        return { fromDate: format(yesterday, "yyyy-MM-dd"), toDate: format(yesterday, "yyyy-MM-dd") };
      case "this_week":
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        return { fromDate: format(weekStart, "yyyy-MM-dd"), toDate: format(today, "yyyy-MM-dd") };
      case "last_week":
        const lastWeekEnd = subDays(startOfWeek(today, { weekStartsOn: 1 }), 1);
        const lastWeekStart = subDays(lastWeekEnd, 6);
        return { fromDate: format(lastWeekStart, "yyyy-MM-dd"), toDate: format(lastWeekEnd, "yyyy-MM-dd") };
      case "this_month":
        const monthStart = startOfMonth(today);
        return { fromDate: format(monthStart, "yyyy-MM-dd"), toDate: format(today, "yyyy-MM-dd") };
      case "last_month":
        const lastMonthEnd = subDays(startOfMonth(today), 1);
        const lastMonthStart = startOfMonth(lastMonthEnd);
        return { fromDate: format(lastMonthStart, "yyyy-MM-dd"), toDate: format(lastMonthEnd, "yyyy-MM-dd") };
      case "this_quarter":
        const quarterStart = startOfYear(today);
        const currentMonth = today.getMonth();
        const quarterMonthStart = new Date(today.getFullYear(), Math.floor(currentMonth / 3) * 3, 1);
        return { fromDate: format(quarterMonthStart, "yyyy-MM-dd"), toDate: format(today, "yyyy-MM-dd") };
      case "this_year":
        const yearStart = startOfYear(today);
        return { fromDate: format(yearStart, "yyyy-MM-dd"), toDate: format(today, "yyyy-MM-dd") };
      default:
        return { fromDate: defaultFromDate, toDate: defaultToDate };
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePresetChange = (preset: string) => {
    const { fromDate, toDate } = getDateRangeFromPreset(preset);
    setFilters((prev) => ({
      ...prev,
      fromDate,
      toDate,
    }));
  };

  const handleApply = () => {
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
    );
    onFilterChange(cleanedFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      fromDate: defaultFromDate,
      toDate: defaultToDate,
      groupBy: "day",
      salesChannel: "",
      warehouseId: "",
      categoryId: "",
      productType: "",
      staffId: "",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      onFilterChange(filters);
    }
  }, []);

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      {/* Date Presets (if enabled) */}
      {showDatePresets && (
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase text-gray-600 dark:text-gray-400">
            Chọn khoảng thời gian nhanh
          </label>
          <div className="flex flex-wrap gap-2">
            {DATE_PRESET_OPTIONS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetChange(preset.value)}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Date Range */}
        {showDateRange && (
          <>
            <div>
              <SimpleDatePicker
                value={filters.fromDate}
                onChange={(selectedDate) => handleFilterChange("fromDate", selectedDate)}
                placeholder="Từ ngày"
              />
            </div>

            <div>
              <SimpleDatePicker
                value={filters.toDate}
                onChange={(selectedDate) => handleFilterChange("toDate", selectedDate)}
                placeholder="Đến ngày"
              />
            </div>
          </>
        )}

        {/* Group By */}
        {showGroupBy && (
          <div>
            <Select
              label="Nhóm theo"
              value={filters.groupBy}
              onChange={(e) => handleFilterChange("groupBy", e.target.value)}
              options={GROUP_BY_OPTIONS}
            />
          </div>
        )}

        {/* Sales Channel */}
        {showSalesChannel && (
          <div>
            <Select
              label="Kênh bán hàng"
              value={filters.salesChannel}
              onChange={(e) => handleFilterChange("salesChannel", e.target.value)}
              options={SALES_CHANNEL_OPTIONS}
            />
          </div>
        )}

        {/* Warehouse */}
        {showWarehouse && warehouses.length > 0 && (
          <div>
            <Select
              label="Kho"
              value={filters.warehouseId}
              onChange={(e) => handleFilterChange("warehouseId", e.target.value)}
              options={[
                { label: "Tất cả kho", value: "" },
                ...warehouses.map((w) => ({
                  label: w.warehouse_name,
                  value: w.id.toString(),
                })),
              ]}
            />
          </div>
        )}

        {/* Category */}
        {showCategory && categories.length > 0 && (
          <div>
            <Select
              label="Danh mục"
              value={filters.categoryId}
              onChange={(e) => handleFilterChange("categoryId", e.target.value)}
              options={[
                { label: "Tất cả danh mục", value: "" },
                ...categories.map((c) => ({
                  label: c.category_name,
                  value: c.id.toString(),
                })),
              ]}
            />
          </div>
        )}

        {/* Product Type */}
        {showProductType && (
          <div>
            <Select
              label="Loại sản phẩm"
              value={filters.productType}
              onChange={(e) => handleFilterChange("productType", e.target.value)}
              options={PRODUCT_TYPE_OPTIONS}
            />
          </div>
        )}

        {/* Staff */}
        {showStaff && staff.length > 0 && (
          <div>
            <Select
              label="Nhân viên"
              value={filters.staffId}
              onChange={(e) => handleFilterChange("staffId", e.target.value)}
              options={[
                { label: "Tất cả nhân viên", value: "" },
                ...staff.map((s) => ({
                  label: s.full_name,
                  value: s.id.toString(),
                })),
              ]}
            />
          </div>
        )}

        {/* Custom Filters */}
        {customFilters}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button variant="primary" onClick={handleApply}>
          <Search className="mr-2 h-4 w-4" />
          Áp dụng
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
