"use client";

import React, { useEffect } from "react";
import { Plus, Filter, RefreshCcw } from "lucide-react";

// Import Hooks & Store
import {
  useDebtReconciliations,
  useDebtReconciliationStatistics
} from "@/hooks/api/useDebtReconciliation";
import { useDebtReconciliationStore } from "@/stores/debtReconciliationStore";

// Import Components
import Button from "@/components/ui/button/Button";
import DebtReconciliationTable from "@/components/finance/ReconciliationTable";
import DebtReconciliationModals from "@/components/finance/ReconciliationModals";
import { formatCurrency } from "@/lib/utils";
import { DebtReconciliation } from "@/types/debt-reconciliation.types";

export default function DebtReconciliationPage() {
  const {
    filters,
    setFilters,
    openCreateModal,
    resetFilters
  } = useDebtReconciliationStore();

  // ✅ FIX LỖI 1: Ép kiểu (filters as any) để tránh lỗi Type không khớp
  const {
    data: listData,
    isLoading: isLoadingList,
    refetch
  } = useDebtReconciliations(filters as any);

  const {
    data: statsResponse,
    isLoading: isLoadingStats
  } = useDebtReconciliationStatistics({
    fromDate: filters.fromDate,
    toDate: filters.toDate
  });

  const stats = statsResponse?.data || {
    totalReconciliations: 0,
    byStatus: { pending: 0, confirmed: 0, disputed: 0 },
    totalDiscrepancy: 0
  };

  useEffect(() => {
    return () => resetFilters();
  }, [resetFilters]);

  // ✅ FIX LỖI 3: Xử lý dữ liệu mảng an toàn

  const rawData = listData as any;
  
  const tableData: DebtReconciliation[] = Array.isArray(rawData) 
    ? rawData 
    : (Array.isArray(rawData?.data) ? rawData.data : []);
  // console.log("🔥 [PAGE DEBUG] tableData passed to Table:", tableData);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Đối chiếu công nợ
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Quản lý và theo dõi công nợ khách hàng & nhà cung cấp
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} title="Làm mới">
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Tạo đối chiếu
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tổng phiếu</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats.totalReconciliations}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <p className="text-sm font-medium text-yellow-600">Chờ xác nhận</p>
          <p className="mt-2 text-2xl font-bold text-yellow-700">{stats.byStatus.pending}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <p className="text-sm font-medium text-green-600">Đã chốt</p>
          <p className="mt-2 text-2xl font-bold text-green-700">{stats.byStatus.confirmed}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <p className="text-sm font-medium text-red-600">Tổng lệch</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-bold text-red-700">{stats.byStatus.disputed}</p>
            {stats.totalDiscrepancy !== 0 && (
              <span className="text-sm font-medium text-red-600">({formatCurrency(stats.totalDiscrepancy)})</span>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-lg border bg-white p-4 dark:bg-gray-800 dark:border-gray-700 shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Tìm kiếm mã phiếu, tên khách..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            value={filters.search || ""}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
        </div>

        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          value={filters.status || ""}
          onChange={(e) => setFilters({ status: e.target.value as any || undefined })}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="disputed">Có sai lệch</option>
        </select>

        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          value={filters.reconciliationType || ""}
          onChange={(e) => setFilters({ reconciliationType: e.target.value as any || undefined })}
        >
          <option value="">Tất cả loại kỳ</option>
          <option value="monthly">Theo Tháng</option>
          <option value="quarterly">Theo Quý</option>
          <option value="yearly">Theo Năm</option>
        </select>

        <input
          type="date"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          value={filters.fromDate || ""}
          onChange={(e) => setFilters({ fromDate: e.target.value })}
        />

        <input
          type="date"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          value={filters.toDate || ""}
          onChange={(e) => setFilters({ toDate: e.target.value })}
        />

        {/* ✅ FIX LỖI 2: Đổi variant "ghost" thành "outline" (hoặc style tay) */}
        <Button
          variant="outline"
          onClick={resetFilters}
          title="Xóa bộ lọc"
          className="border-dashed" // Thêm style nếu muốn giống ghost hơn
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <DebtReconciliationTable
        data={tableData}
        isLoading={isLoadingList}
      />

      {/* Modals */}
      <DebtReconciliationModals />
    </div>
  );
}