"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useInventoryReport } from "@/hooks/api/useReports";
import { useWarehouses } from "@/hooks/api/useWarehouses";
import { useCategories } from "@/hooks/api/useCategories";
import ReportCard from "@/components/reports/ReportCard";
import ReportFilters from "@/components/reports/ReportFilters";
import ExportButton from "@/components/reports/ExportButton";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import {
  formatCurrencyVND,
  formatNumber,
  formatPercentage,
  PRODUCT_TYPE_LABELS,
  type InventoryReportFilters,
} from "@/types/report.types";
import { Package, AlertCircle, TrendingDown, BarChart3 } from "lucide-react";
import { ApexOptions } from "apexcharts";

// Dynamic import for ApexCharts
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function InventoryReportPage() {
  const [filters, setFilters] = useState<InventoryReportFilters>({});

  const { data: report, isLoading } = useInventoryReport(filters);
  const { data: warehousesData } = useWarehouses({});
  const { data: categoriesData } = useCategories({});

  // Inventory by Type Chart
  const typeChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 300,
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: report?.byType.map((t) => PRODUCT_TYPE_LABELS[t.type]) || [],
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
    },
    yaxis: [
      {
        title: {
          text: "Giá trị (VNĐ)",
        },
        labels: {
          style: {
            colors: "#6B7280",
            fontSize: "12px",
          },
          formatter: (value) => formatCurrencyVND(value),
        },
      },
    ],
    tooltip: {
      y: {
        formatter: (value) => formatCurrencyVND(value),
      },
    },
    grid: {
      borderColor: "#E5E7EB",
    },
    legend: {
      position: "top",
    },
  };

  const typeChartSeries = [
    {
      name: "Giá trị tồn kho",
      data: report?.byType.map((t) => t.value) || [],
    },
  ];

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const colors: Record<string, "green" | "yellow" | "red"> = {
      normal: "green",
      low: "yellow",
      out_of_stock: "red",
    };
    const labels: Record<string, string> = {
      normal: "Bình thường",
      low: "Tồn kho thấp",
      out_of_stock: "Hết hàng",
    };
    return <Badge color={colors[status] || "green"}>{labels[status] || status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb
        pages={[
          { name: "Báo cáo", href: "#" },
          { name: "Báo cáo tồn kho", href: "#" },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Báo cáo tồn kho
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Theo dõi tồn kho theo kho, loại sản phẩm và tỷ lệ quay vòng
          </p>
        </div>
      </div>

      {/* Filters */}
      <ReportFilters
        onFilterChange={(newFilters) => setFilters(newFilters)}
        initialFilters={filters}
        showDateRange={false}
        showWarehouse
        showCategory
        showProductType
        warehouses={warehousesData || []}
        categories={categoriesData || []}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}

      {/* Report Content */}
      {!isLoading && report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Items */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tổng sản phẩm
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(report.summary.totalItems)}
                </p>
              </div>
            </div>

            {/* Total Value */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tổng giá trị
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrencyVND(report.summary.totalValue)}
                </p>
              </div>
            </div>

            {/* Low Stock */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                  <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tồn kho thấp
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(report.summary.lowStockItems)}
                </p>
              </div>
            </div>

            {/* Out of Stock */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Hết hàng
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(report.summary.outOfStockItems)}
                </p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Inventory by Type */}
            <ReportCard title="Tồn kho theo loại sản phẩm">
              <ReactApexChart
                options={typeChartOptions}
                series={typeChartSeries}
                type="bar"
                height={300}
              />
            </ReportCard>

            {/* Inventory by Warehouse */}
            <ReportCard title="Tồn kho theo kho">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Kho
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Số lượng
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Giá trị
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        SP
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {report.byWarehouse.map((warehouse) => (
                      <tr key={warehouse.warehouseId}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {warehouse.warehouseName}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                          {formatNumber(warehouse.totalQuantity)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                          {formatCurrencyVND(warehouse.totalValue)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                          {formatNumber(warehouse.itemCount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ReportCard>
          </div>

          {/* Inventory Items Table */}
          <ReportCard
            title="Chi tiết tồn kho"
            headerActions={
              <ExportButton
                data={report.items}
                filename="bao_cao_ton_kho"
                title="Báo cáo tồn kho"
                columns={[
                  { header: "Mã SP", key: "productCode" },
                  { header: "Tên sản phẩm", key: "productName" },
                  { header: "Danh mục", key: "category" },
                  { header: "Kho", key: "warehouse" },
                  { header: "Số lượng", key: "quantity", format: formatNumber },
                  { header: "Tồn kho tối thiểu", key: "minStock", format: formatNumber },
                  { header: "Giá trị", key: "value", format: formatCurrencyVND },
                  {
                    header: "Trạng thái",
                    key: "status",
                    format: (val) => {
                      const labels: Record<string, string> = {
                        normal: "Bình thường",
                        low: "Tồn kho thấp",
                        out_of_stock: "Hết hàng",
                      };
                      return labels[val] || val;
                    },
                  },
                ]}
              />
            }
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Mã SP
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Tên sản phẩm
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Danh mục
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Kho
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Số lượng
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Min
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Giá trị
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {report.items.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    report.items.map((item) => (
                      <tr key={`${item.productId}-${item.warehouse}`}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {item.productCode}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {item.productName}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {item.category}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {item.warehouse}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                          {formatNumber(item.quantity)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                          {formatNumber(item.minStock)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                          {formatCurrencyVND(item.value)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-center">
                          {getStatusBadge(item.status)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </ReportCard>

          {/* Slow Moving Products */}
          {report.slowMoving && report.slowMoving.length > 0 && (
            <ReportCard title="Sản phẩm tồn kho chậm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Mã SP
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Tên sản phẩm
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Số lượng tồn
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Giá trị
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {report.slowMoving.map((item) => (
                      <tr key={item.productId}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {item.productCode}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {item.productName}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                          {formatNumber(item.quantity)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                          {formatCurrencyVND(item.value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ReportCard>
          )}
        </>
      )}

      {/* No Data State */}
      {!isLoading && !report && (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Không có dữ liệu báo cáo
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
