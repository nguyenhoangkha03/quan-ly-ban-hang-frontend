"use client";

import React, { useEffect } from "react";
import { Plus, Filter, RefreshCcw, DollarSign, CheckCircle, Clock } from "lucide-react";

// Import Hooks & Store
import {
  useDebtReconciliations,
  // useDebtReconciliationStatistics // Tạm bỏ nếu chưa có API thống kê mới
} from "@/hooks/api/useDebtReconciliation";
import { useDebtReconciliationStore } from "@/stores/debtReconciliationStore";

// Import Components
import Button from "@/components/ui/button/Button";
import DebtReconciliationTable from "@/components/finance/ReconciliationTable";
import DebtReconciliationModals from "@/components/finance/ReconciliationModals";
import { formatCurrency } from "@/lib/utils";
import type { DebtReconciliation } from "@/types/debt-reconciliation.types";

export default function DebtReconciliationPage() {
  const {
    filters,
    setFilters,
    openCreateModal,
    resetFilters
  } = useDebtReconciliationStore();

  // Gọi API lấy danh sách
  const {
    data: listData,
    isLoading: isLoadingList,
    refetch
  } = useDebtReconciliations(filters);

  // Xử lý dữ liệu an toàn
  // (Do cấu trúc API trả về có thể là { data: [...], meta: ... } hoặc mảng trực tiếp)
  const rawData = listData as any;
  const tableData: DebtReconciliation[] = Array.isArray(rawData) 
    ? rawData 
    : (Array.isArray(rawData?.data) ? rawData.data : []);

  // Tính toán sơ bộ thống kê Client-side (Tạm thời)
  // Vì API summary cũ đã bỏ, ta có thể tính nhanh dựa trên list data hiện tại hoặc để trống
  const totalUnpaid = tableData.filter(i => i.status === 'unpaid').length;
  const totalDebtAmount = tableData.reduce((sum, i) => sum + Number(i.closingBalance), 0);

  // Reset filters khi unmount
  useEffect(() => {
    return () => resetFilters();
  }, [resetFilters]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Đối chiếu công nợ
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Quản lý công nợ tự động theo năm
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} title="Làm mới danh sách">
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button onClick={openCreateModal} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="h-4 w-4" />
            Tạo / Cập nhật
          </Button>
        </div>
      </div>

      {/* KPI Cards (Đã cập nhật theo logic mới) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tổng phiếu</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {listData?.meta?.total || tableData.length}
            </p>
          </div>
          <div className="p-3 bg-gray-100 rounded-full dark:bg-gray-700">
             <Filter className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-600">Chưa thanh toán</p>
            <p className="mt-1 text-2xl font-bold text-red-700">
                {totalUnpaid}
            </p>
          </div>
          <div className="p-3 bg-red-100 rounded-full dark:bg-red-900/30">
             <Clock className="h-5 w-5 text-red-600" />
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Tổng nợ cần thu</p>
            <p className="mt-1 text-2xl font-bold text-blue-700">
               {formatCurrency(totalDebtAmount)}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900/30">
             <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-3 rounded-lg border bg-white p-4 dark:bg-gray-800 dark:border-gray-700 shadow-sm items-center">
        {/* Tìm kiếm */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Tìm theo Mã phiếu, Tên khách, Mã khách..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            value={filters.search || ""}
            onChange={(e) => setFilters({ search: e.target.value, page: 1 })}
          />
        </div>

        {/* Lọc Trạng Thái Mới */}
        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          value={filters.status || ""}
          onChange={(e) => setFilters({ status: e.target.value as any || undefined, page: 1 })}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="unpaid">Chưa trả hết</option>
          <option value="paid">Đã trả hết</option>
        </select>

        {/* Lọc Theo Thời Gian (Ngày cập nhật) */}
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded dark:bg-gray-700">
            <input
                type="date"
                className="bg-transparent border-none text-sm focus:ring-0 dark:text-white px-2"
                value={filters.fromDate || ""}
                onChange={(e) => setFilters({ fromDate: e.target.value })}
            />
            <span className="text-gray-400">-</span>
            <input
                type="date"
                className="bg-transparent border-none text-sm focus:ring-0 dark:text-white px-2"
                value={filters.toDate || ""}
                onChange={(e) => setFilters({ toDate: e.target.value })}
            />
        </div>

        {/* Nút Reset Filter */}
        <Button
          variant="outline"
          onClick={resetFilters}
          title="Xóa bộ lọc"
          className="px-3 border-dashed"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Table */}
      <DebtReconciliationTable
        data={tableData}
        isLoading={isLoadingList}
      />

      {/* Modals Manager (Chứa Create & Email Modal) */}
      <DebtReconciliationModals />
    </div>
  );
}