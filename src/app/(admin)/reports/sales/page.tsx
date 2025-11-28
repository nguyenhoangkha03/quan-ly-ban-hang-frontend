"use client";

import React, { useState } from "react";
import { useSalesReport } from "@/hooks/api/useReports";
import ReportCard from "@/components/features/reports/ReportCard";
import ReportFilters from "@/components/features/reports/ReportFilters";
import ExportButton from "@/components/features/reports/ExportButton";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import {
  formatCurrencyVND,
  formatNumber,
  formatPercentage,
  type SalesReportFilters,
} from "@/types/report.types";
import { ShoppingCart, Users, TrendingUp, Award } from "lucide-react";

export default function SalesReportPage() {
  const [filters, setFilters] = useState<SalesReportFilters>({});

  const { data: report, isLoading } = useSalesReport(filters);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb
        pages={[
          { name: "Báo cáo", href: "#" },
          { name: "Báo cáo bán hàng", href: "#" },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Báo cáo bán hàng
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Theo dõi sản phẩm bán chạy, khách hàng tiềm năng và hiệu suất nhân viên
          </p>
        </div>
      </div>

      {/* Filters */}
      <ReportFilters
        onFilterChange={(newFilters) => setFilters(newFilters)}
        initialFilters={filters}
        showDateRange
        showLimit
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
            {/* Total Sales */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tổng doanh số
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrencyVND(report.summary.totalSales)}
                </p>
              </div>
            </div>

            {/* Total Orders */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tổng đơn hàng
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(report.summary.totalOrders)}
                </p>
              </div>
            </div>

            {/* Average Order Value */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Giá trị đơn hàng TB
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrencyVND(report.summary.avgOrderValue)}
                </p>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                  <Users className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tỷ lệ chuyển đổi
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPercentage(report.summary.conversionRate)}
                </p>
              </div>
            </div>
          </div>

          {/* Top Products & Customers */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Top Products */}
            <ReportCard
              title="Sản phẩm bán chạy"
              headerActions={
                <ExportButton
                  data={report.topProducts}
                  filename="san_pham_ban_chay"
                  title="Sản phẩm bán chạy"
                  columns={[
                    { header: "Mã SP", key: "productCode" },
                    { header: "Tên sản phẩm", key: "productName" },
                    { header: "Số lượng bán", key: "quantitySold", format: formatNumber },
                    { header: "Doanh thu", key: "revenue", format: formatCurrencyVND },
                    { header: "Số đơn", key: "orderCount", format: formatNumber },
                  ]}
                  format="excel"
                />
              }
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        STT
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Sản phẩm
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        SL bán
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Doanh thu
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Đơn hàng
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {report.topProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                          Không có dữ liệu
                        </td>
                      </tr>
                    ) : (
                      report.topProducts.map((product, idx) => (
                        <tr key={product.productId}>
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {product.productName}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">
                              {product.productCode}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                            {formatNumber(product.quantitySold)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                            {formatCurrencyVND(product.revenue)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                            {formatNumber(product.orderCount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </ReportCard>

            {/* Top Customers */}
            <ReportCard
              title="Khách hàng tiềm năng"
              headerActions={
                <ExportButton
                  data={report.topCustomers}
                  filename="khach_hang_tiem_nang"
                  title="Khách hàng tiềm năng"
                  columns={[
                    { header: "Tên khách hàng", key: "customerName" },
                    { header: "Số đơn", key: "totalOrders", format: formatNumber },
                    { header: "Tổng doanh thu", key: "totalRevenue", format: formatCurrencyVND },
                    { header: "Giá trị TB", key: "avgOrderValue", format: formatCurrencyVND },
                  ]}
                  format="excel"
                />
              }
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        STT
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Khách hàng
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Số đơn
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Doanh thu
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Giá trị TB
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {report.topCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                          Không có dữ liệu
                        </td>
                      </tr>
                    ) : (
                      report.topCustomers.map((customer, idx) => (
                        <tr key={customer.customerId}>
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {customer.customerName}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                            {formatNumber(customer.totalOrders)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                            {formatCurrencyVND(customer.totalRevenue)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                            {formatCurrencyVND(customer.avgOrderValue)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </ReportCard>
          </div>

          {/* Sales by Employee */}
          {report.byEmployee && report.byEmployee.length > 0 && (
            <ReportCard
              title="Hiệu suất nhân viên bán hàng"
              headerActions={
                <ExportButton
                  data={report.byEmployee}
                  filename="hieu_suat_nhan_vien"
                  title="Hiệu suất nhân viên"
                  columns={[
                    { header: "Nhân viên", key: "employeeName" },
                    { header: "Số đơn", key: "ordersHandled", format: formatNumber },
                    { header: "Doanh thu", key: "revenue", format: formatCurrencyVND },
                    { header: "Hoa hồng", key: "commission", format: formatCurrencyVND },
                  ]}
                  format="excel"
                />
              }
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        STT
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Nhân viên
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Đơn xử lý
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Doanh thu
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Hoa hồng
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {report.byEmployee.map((employee, idx) => (
                      <tr key={employee.employeeId}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {employee.employeeName}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                          {formatNumber(employee.ordersHandled)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                          {formatCurrencyVND(employee.revenue)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                          {formatCurrencyVND(employee.commission)}
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
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Không có dữ liệu báo cáo
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
