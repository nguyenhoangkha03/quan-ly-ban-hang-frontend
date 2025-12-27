"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useRevenueReport } from "@/hooks/api/useReports";
import ReportCard from "@/components/reports/ReportCard";
import ReportFilters from "@/components/reports/ReportFilters";
import ExportButton from "@/components/reports/ExportButton";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import {
  formatCurrencyVND,
  formatNumber,
  formatPercentage,
  type RevenueReportFilters,
} from "@/types/report.types";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, BarChart3 } from "lucide-react";
import { ApexOptions } from "apexcharts";

// Dynamic import for ApexCharts
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function RevenueReportPage() {
  const [filters, setFilters] = useState<RevenueReportFilters>({});
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "customers">("orders");

  const { data: report, isLoading } = useRevenueReport(filters);

  // Chart Options
  const revenueChartOptions: ApexOptions = {
    chart: {
      type: "area",
      height: 350,
      fontFamily: "Outfit, sans-serif",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
    },
    colors: ["#3B82F6", "#10B981"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.4,
        opacityTo: 0.1,
      },
    },
    xaxis: {
      categories: report?.chartData.map((d) => d.date) || [],
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
        formatter: (value) => formatCurrencyVND(value),
      },
    },
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
      horizontalAlign: "right",
    },
  };

  const revenueChartSeries = [
    {
      name: "Doanh thu",
      data: report?.chartData.map((d) => d.revenue) || [],
    },
  ];

  // Channel Chart Options
  const channelChartOptions: ApexOptions = {
    chart: {
      type: "donut",
      height: 300,
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
    labels: report?.byChannel.map((c) => {
      const labels: Record<string, string> = {
        retail: "Bán lẻ",
        wholesale: "Bán sỉ",
        online: "Trực tuyến",
        distributor: "Đại lý",
      };
      return labels[c.channel] || c.channel;
    }) || [],
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
    },
    legend: {
      position: "bottom",
    },
    tooltip: {
      y: {
        formatter: (value) => formatCurrencyVND(value),
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Tổng doanh thu",
              formatter: () => formatCurrencyVND(report?.summary.totalRevenue || 0),
            },
          },
        },
      },
    },
  };

  const channelChartSeries = report?.byChannel.map((c) => c.revenue) || [];

  // Top Products Chart Options
  const topProductsChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      fontFamily: "Outfit, sans-serif",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
    },
    colors: ["#3B82F6"],
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: report?.topProducts?.map((p) => p.productName.substring(0, 20)) || [],
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
        formatter: (value) => formatCurrencyVND(value),
      },
    },
    tooltip: {
      y: {
        formatter: (value) => formatCurrencyVND(value),
      },
    },
    grid: {
      borderColor: "#E5E7EB",
    },
    states: {
      hover: {
        filter: {
          type: "darken",
          value: 0.15,
        },
      },
    },
  };

  const topProductsChartSeries = [
    {
      name: "Doanh số",
      data: report?.topProducts?.map((p) => p.revenue) || [],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb
        pages={[
          { name: "Báo cáo", href: "#" },
          { name: "Báo cáo doanh thu", href: "#" },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Báo cáo doanh thu
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Theo dõi doanh thu theo thời gian, kênh bán hàng và khu vực
          </p>
        </div>
      </div>

      {/* Filters */}
      <ReportFilters
        onFilterChange={(newFilters) => setFilters(newFilters)}
        initialFilters={filters}
        showDateRange
        showDatePresets
        showGroupBy
        showSalesChannel
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
            {/* Total Revenue */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                {report.summary.growth !== 0 && (
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      report.summary.growth > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {report.summary.growth > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {formatPercentage(Math.abs(report.summary.growth))}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tổng doanh thu
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrencyVND(report.summary.totalRevenue)}
                </p>
              </div>
            </div>

            {/* Net Revenue */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Thực thu (sau giảm giá)
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrencyVND(report.summary.netRevenue)}
                </p>
              </div>
            </div>

            {/* Profit */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Lợi nhuận ròng
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrencyVND(report.summary.profit)}
                </p>
              </div>
            </div>

            {/* Total Orders */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <ShoppingCart className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
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
          </div>

          {/* Additional KPI Cards - Row 2 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Discount Amount */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tiền chiết khấu
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrencyVND(report.summary.totalDiscount)}
                </p>
              </div>
            </div>

            {/* Average Order Value */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/30">
                <BarChart3 className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
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

            {/* Receivable Debt */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <BarChart3 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Công nợ phải thu
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrencyVND(report.summary.totalDebt)}
                </p>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <ReportCard
            title="Biểu đồ doanh thu theo thời gian"
            headerActions={
              <ExportButton
                data={report.chartData}
                filename="bao_cao_doanh_thu"
                title="Báo cáo doanh thu"
                columns={[
                  { header: "Ngày", key: "date" },
                  { header: "Doanh thu", key: "revenue", format: formatCurrencyVND },
                  { header: "Số đơn hàng", key: "orderCount", format: formatNumber },
                  { header: "Giá trị TB", key: "avgOrderValue", format: formatCurrencyVND },
                ]}
              />
            }
          >
            <ReactApexChart
              options={revenueChartOptions}
              series={revenueChartSeries}
              type="area"
              height={350}
            />
          </ReportCard>

          {/* Channel & Region Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Revenue by Channel */}
            <ReportCard title="Doanh thu theo kênh bán hàng">
              <ReactApexChart
                options={channelChartOptions}
                series={channelChartSeries}
                type="donut"
                height={300}
              />

              {/* Channel Table */}
              <div className="mt-6 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Kênh
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Doanh thu
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Đơn hàng
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {report.byChannel.map((channel, idx) => (
                      <tr key={idx}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {
                            {
                              retail: "Bán lẻ",
                              wholesale: "Bán sỉ",
                              online: "Trực tuyến",
                              distributor: "Đại lý",
                            }[channel.channel]
                          }
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                          {formatCurrencyVND(channel.revenue)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                          {formatNumber(channel.orderCount)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                          {formatPercentage(channel.percentage)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ReportCard>

            {/* Revenue by Region */}
            {report.byRegion && report.byRegion.length > 0 && (
              <ReportCard title="Doanh thu theo khu vực">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Khu vực
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Doanh thu
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Đơn hàng
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          %
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                      {report.byRegion.map((region, idx) => (
                        <tr key={idx}>
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {region.region}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                            {formatCurrencyVND(region.revenue)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                            {formatNumber(region.orderCount)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                            {formatPercentage(region.percentage)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ReportCard>
            )}
          </div>

          {/* Top Products Chart */}
          {report.topProducts && report.topProducts.length > 0 && (
            <ReportCard title="Top 10 sản phẩm bán chạy">
              <ReactApexChart
                options={topProductsChartOptions}
                series={topProductsChartSeries}
                type="bar"
                height={350}
              />

              {/* Top Products Table */}
              <div className="mt-6 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        SKU
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Tên sản phẩm
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Số lượng
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Doanh số
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Tỷ trọng
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {report.topProducts.map((product, idx) => (
                      <tr key={idx}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {product.sku}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {product.productName}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                          {formatNumber(product.quantity)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrencyVND(product.revenue)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                          {formatPercentage(product.percentage)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ReportCard>
          )}

          {/* Detailed Tables - Tabs Section */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-0">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`flex-1 border-b-2 px-4 py-3 text-left text-sm font-medium transition-colors ${
                    activeTab === "orders"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  Chi tiết đơn hàng
                </button>
                <button
                  onClick={() => setActiveTab("products")}
                  className={`flex-1 border-b-2 px-4 py-3 text-left text-sm font-medium transition-colors ${
                    activeTab === "products"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  Chi tiết sản phẩm
                </button>
                <button
                  onClick={() => setActiveTab("customers")}
                  className={`flex-1 border-b-2 px-4 py-3 text-left text-sm font-medium transition-colors ${
                    activeTab === "customers"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  Chi tiết khách hàng
                </button>
              </div>
            </div>

            {/* Tab 1: Orders */}
            {activeTab === "orders" && (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Mã đơn
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Ngày bán
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Khách hàng
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Nhân viên
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Tổng tiền
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Giảm giá
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Thành tiền
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {report.orders && report.orders.length > 0 ? (
                      report.orders.slice(0, 20).map((order, idx) => (
                        <tr key={idx}>
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                            {order.orderCode}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {order.customerName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {order.staffName}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                            {formatCurrencyVND(order.totalAmount)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                            {formatCurrencyVND(order.discountAmount)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrencyVND(order.finalAmount)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                order.paymentStatus === "paid"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : order.paymentStatus === "partial"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {order.paymentStatus === "paid"
                                ? "Đã trả"
                                : order.paymentStatus === "partial"
                                  ? "Trả một phần"
                                  : "Chưa trả"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                          Không có dữ liệu
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 2: Products */}
            {activeTab === "products" && (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        SKU
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Tên sản phẩm
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Số lượng
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Doanh số
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Tỷ trọng
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {report.topProducts && report.topProducts.length > 0 ? (
                      report.topProducts.slice(0, 20).map((product, idx) => (
                        <tr key={idx}>
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {product.sku}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {product.productName}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                            {formatNumber(product.quantity)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrencyVND(product.revenue)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                            {formatPercentage(product.percentage)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                          Không có dữ liệu
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 3: Customers */}
            {activeTab === "customers" && (
              <div className="overflow-hidden">
                <div className="px-4 py-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Đang cập nhật dữ liệu chi tiết khách hàng...
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* No Data State */}
      {!isLoading && !report && (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Không có dữ liệu báo cáo
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
