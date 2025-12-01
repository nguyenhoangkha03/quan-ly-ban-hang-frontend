"use client";

import React, { useState } from "react";
import { useProductionReport } from "@/hooks/api/useReports";
import ReportCard from "@/components/reports/ReportCard";
import ReportFilters from "@/components/reports/ReportFilters";
import ExportButton from "@/components/reports/ExportButton";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import {
  formatCurrencyVND,
  formatNumber,
  formatPercentage,
  type ProductionReportFilters,
} from "@/types/report.types";
import { Factory, Package, AlertTriangle, CheckCircle } from "lucide-react";

export default function ProductionReportPage() {
  const [filters, setFilters] = useState<ProductionReportFilters>({});

  const { data: report, isLoading } = useProductionReport(filters);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb
        pages={[
          { name: "Báo cáo", href: "#" },
          { name: "Báo cáo sản xuất", href: "#" },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Báo cáo sản xuất
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Theo dõi sản lượng, tiêu hao nguyên liệu và phân tích hao hụt
          </p>
        </div>
      </div>

      {/* Filters */}
      <ReportFilters
        onFilterChange={(newFilters) => setFilters(newFilters)}
        initialFilters={filters}
        showDateRange
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Total Orders */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Factory className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tổng lệnh SX
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(report.summary.totalOrders)}
                </p>
              </div>
            </div>

            {/* Completed Orders */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Hoàn thành
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(report.summary.completedOrders)}
                </p>
              </div>
            </div>

            {/* In Progress */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                  <Package className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Đang SX
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(report.summary.inProgressOrders)}
                </p>
              </div>
            </div>

            {/* Total Output */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tổng sản lượng
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(report.summary.totalOutput)}
                </p>
              </div>
            </div>

            {/* Total Wastage */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tổng hao hụt
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(report.summary.totalWastage)}
                </p>
              </div>
            </div>
          </div>

          {/* Production Output */}
          <ReportCard
            title="Sản lượng theo sản phẩm"
            headerActions={
              <ExportButton
                data={report.output}
                filename="san_luong_san_xuat"
                title="Sản lượng sản xuất"
                columns={[
                  { header: "Sản phẩm", key: "productName" },
                  { header: "Kế hoạch", key: "plannedQuantity", format: formatNumber },
                  { header: "Thực tế", key: "producedQuantity", format: formatNumber },
                  { header: "Tỷ lệ hoàn thành", key: "completionRate", format: formatPercentage },
                  { header: "Hao hụt", key: "wastage", format: formatNumber },
                ]}
              />
            }
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Sản phẩm
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Kế hoạch
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Thực tế
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Hoàn thành
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Hao hụt
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {report.output.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    report.output.map((item) => (
                      <tr key={item.productId}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {item.productName}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                          {formatNumber(item.plannedQuantity)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                          {formatNumber(item.producedQuantity)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                          <span
                            className={`font-medium ${
                              item.completionRate >= 100
                                ? "text-green-600 dark:text-green-400"
                                : item.completionRate >= 80
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {formatPercentage(item.completionRate)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                          {formatNumber(item.wastage)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </ReportCard>

          {/* Material Consumption & Wastage */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Material Consumption */}
            <ReportCard title="Tiêu hao nguyên liệu">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Nguyên liệu
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Kế hoạch
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Thực tế
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Chênh lệch
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {report.materialConsumption.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                          Không có dữ liệu
                        </td>
                      </tr>
                    ) : (
                      report.materialConsumption.map((material) => (
                        <tr key={material.materialId}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {material.materialName}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                            {formatNumber(material.plannedQuantity)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                            {formatNumber(material.actualQuantity)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                            <span
                              className={`font-medium ${
                                material.variance > 0
                                  ? "text-red-600 dark:text-red-400"
                                  : material.variance < 0
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {material.variance > 0 ? "+" : ""}
                              {formatNumber(material.variance)} (
                              {formatPercentage(material.variancePercentage)})
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </ReportCard>

            {/* Wastage Analysis */}
            <ReportCard title="Phân tích hao hụt">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Sản phẩm
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Hao hụt
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Tỷ lệ
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Giá trị
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {report.wastage.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                          Không có dữ liệu
                        </td>
                      </tr>
                    ) : (
                      report.wastage.map((item) => (
                        <tr key={item.productId}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {item.productName}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                            {formatNumber(item.totalWastage)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                            <span
                              className={`font-medium ${
                                item.wastagePercentage > 5
                                  ? "text-red-600 dark:text-red-400"
                                  : item.wastagePercentage > 2
                                  ? "text-yellow-600 dark:text-yellow-400"
                                  : "text-green-600 dark:text-green-400"
                              }`}
                            >
                              {formatPercentage(item.wastagePercentage)}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                            {formatCurrencyVND(item.wastageValue)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </ReportCard>
          </div>
        </>
      )}

      {/* No Data State */}
      {!isLoading && !report && (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="text-center">
            <Factory className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Không có dữ liệu báo cáo
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
