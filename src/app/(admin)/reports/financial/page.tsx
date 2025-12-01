"use client";

import React, { useState } from "react";
import { useFinancialReport } from "@/hooks/api/useReports";
import ReportCard from "@/components/reports/ReportCard";
import ReportFilters from "@/components/reports/ReportFilters";
import ExportButton from "@/components/reports/ExportButton";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import {
  formatCurrencyVND,
  formatPercentage,
  type FinancialReportFilters,
} from "@/types/report.types";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Wallet } from "lucide-react";

export default function FinancialReportPage() {
  const [filters, setFilters] = useState<FinancialReportFilters>({});

  const { data: report, isLoading } = useFinancialReport(filters);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb
        pages={[
          { name: "Báo cáo", href: "#" },
          { name: "Báo cáo tài chính", href: "#" },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Báo cáo tài chính
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Báo cáo lãi lỗ, dòng tiền và phân tích công nợ
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
            {/* Revenue */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Doanh thu
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrencyVND(report.summary.revenue)}
                </p>
              </div>
            </div>

            {/* Profit */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Lợi nhuận
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrencyVND(report.summary.profit)}
                </p>
              </div>
            </div>

            {/* Profit Margin */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tỷ suất lợi nhuận
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPercentage(report.summary.profitMargin)}
                </p>
              </div>
            </div>

            {/* Cash Balance */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                  <Wallet className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Số dư tiền mặt
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrencyVND(report.summary.cashBalance)}
                </p>
              </div>
            </div>

            {/* Total Debt */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tổng công nợ
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrencyVND(report.summary.totalDebt)}
                </p>
                {report.summary.overdueDebt > 0 && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    Quá hạn: {formatCurrencyVND(report.summary.overdueDebt)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* P&L Statement & Cash Flow */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Profit & Loss Statement */}
            <ReportCard
              title="Báo cáo lãi lỗ (P&L)"
              headerActions={
                <ExportButton
                  data={[report.profitLoss]}
                  filename="bao_cao_lai_lo"
                  title="Báo cáo lãi lỗ"
                  columns={[
                    { header: "Doanh thu", key: "revenue", format: formatCurrencyVND },
                    { header: "Giá vốn hàng bán", key: "costOfGoodsSold", format: formatCurrencyVND },
                    { header: "Lợi nhuận gộp", key: "grossProfit", format: formatCurrencyVND },
                    { header: "Chi phí hoạt động", key: "operatingExpenses", format: formatCurrencyVND },
                    { header: "Lợi nhuận hoạt động", key: "operatingIncome", format: formatCurrencyVND },
                    { header: "Lợi nhuận ròng", key: "netIncome", format: formatCurrencyVND },
                    { header: "Tỷ suất lợi nhuận gộp", key: "grossMargin", format: formatPercentage },
                    { header: "Tỷ suất lợi nhuận ròng", key: "netMargin", format: formatPercentage },
                  ]}
                  format="pdf"
                />
              }
            >
              <div className="space-y-4">
                {/* Revenue */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Doanh thu
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrencyVND(report.profitLoss.revenue)}
                  </span>
                </div>

                {/* COGS */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Giá vốn hàng bán
                  </span>
                  <span className="text-sm text-red-600 dark:text-red-400">
                    -{formatCurrencyVND(report.profitLoss.costOfGoodsSold)}
                  </span>
                </div>

                {/* Gross Profit */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Lợi nhuận gộp
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrencyVND(report.profitLoss.grossProfit)}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      ({formatPercentage(report.profitLoss.grossMargin)})
                    </span>
                  </div>
                </div>

                {/* Operating Expenses */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Chi phí hoạt động
                  </span>
                  <span className="text-sm text-red-600 dark:text-red-400">
                    -{formatCurrencyVND(report.profitLoss.operatingExpenses)}
                  </span>
                </div>

                {/* Operating Income */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Lợi nhuận hoạt động
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrencyVND(report.profitLoss.operatingIncome)}
                  </span>
                </div>

                {/* Net Income */}
                <div className="flex items-center justify-between border-t-2 border-gray-300 pt-4 dark:border-gray-600">
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    Lợi nhuận ròng
                  </span>
                  <div className="text-right">
                    <span
                      className={`text-base font-bold ${
                        report.profitLoss.netIncome >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrencyVND(report.profitLoss.netIncome)}
                    </span>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      ({formatPercentage(report.profitLoss.netMargin)})
                    </span>
                  </div>
                </div>
              </div>
            </ReportCard>

            {/* Cash Flow Statement */}
            <ReportCard title="Báo cáo dòng tiền">
              <div className="space-y-4">
                {/* Opening Balance */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Số dư đầu kỳ
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrencyVND(report.cashFlow.openingBalance)}
                  </span>
                </div>

                {/* Operating Cash Flow */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Dòng tiền từ hoạt động KD
                  </span>
                  <span
                    className={`text-sm ${
                      report.cashFlow.operatingCashFlow >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {report.cashFlow.operatingCashFlow >= 0 ? "+" : ""}
                    {formatCurrencyVND(report.cashFlow.operatingCashFlow)}
                  </span>
                </div>

                {/* Investing Cash Flow */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Dòng tiền từ đầu tư
                  </span>
                  <span
                    className={`text-sm ${
                      report.cashFlow.investingCashFlow >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {report.cashFlow.investingCashFlow >= 0 ? "+" : ""}
                    {formatCurrencyVND(report.cashFlow.investingCashFlow)}
                  </span>
                </div>

                {/* Financing Cash Flow */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Dòng tiền từ tài chính
                  </span>
                  <span
                    className={`text-sm ${
                      report.cashFlow.financingCashFlow >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {report.cashFlow.financingCashFlow >= 0 ? "+" : ""}
                    {formatCurrencyVND(report.cashFlow.financingCashFlow)}
                  </span>
                </div>

                {/* Net Cash Flow */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Dòng tiền ròng
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      report.cashFlow.netCashFlow >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {report.cashFlow.netCashFlow >= 0 ? "+" : ""}
                    {formatCurrencyVND(report.cashFlow.netCashFlow)}
                  </span>
                </div>

                {/* Closing Balance */}
                <div className="flex items-center justify-between border-t-2 border-gray-300 pt-4 dark:border-gray-600">
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    Số dư cuối kỳ
                  </span>
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    {formatCurrencyVND(report.cashFlow.closingBalance)}
                  </span>
                </div>
              </div>
            </ReportCard>
          </div>

          {/* Debt Aging Analysis */}
          <ReportCard title="Phân tích công nợ theo độ tuổi">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* Current (0-30 days) */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Hiện tại (0-30 ngày)
                </p>
                <p className="mt-2 text-lg font-bold text-green-600 dark:text-green-400">
                  {formatCurrencyVND(report.debtAging.current)}
                </p>
              </div>

              {/* 31-60 days */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  31-60 ngày
                </p>
                <p className="mt-2 text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {formatCurrencyVND(report.debtAging.days30)}
                </p>
              </div>

              {/* 61-90 days */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  61-90 ngày
                </p>
                <p className="mt-2 text-lg font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrencyVND(report.debtAging.days60)}
                </p>
              </div>

              {/* 90+ days */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Trên 90 ngày
                </p>
                <p className="mt-2 text-lg font-bold text-red-600 dark:text-red-400">
                  {formatCurrencyVND(report.debtAging.days90Plus)}
                </p>
              </div>

              {/* Total */}
              <div className="rounded-lg border-2 border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Tổng công nợ
                </p>
                <p className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrencyVND(report.debtAging.total)}
                </p>
              </div>
            </div>
          </ReportCard>
        </>
      )}

      {/* No Data State */}
      {!isLoading && !report && (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="text-center">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Không có dữ liệu báo cáo
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
