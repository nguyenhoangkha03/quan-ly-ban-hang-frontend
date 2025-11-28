"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useRevenueReport } from "@/hooks/api/useReports";
import ReportCard from "@/components/features/reports/ReportCard";
import ReportFilters from "@/components/features/reports/ReportFilters";
import ExportButton from "@/components/features/reports/ExportButton";
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

            {/* Total Orders */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
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
                  <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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

            {/* Growth Rate */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                  {report.summary.growth >= 0 ? (
                    <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  )}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tăng trưởng
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {report.summary.growth >= 0 ? "+" : ""}
                  {formatPercentage(report.summary.growth)}
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
