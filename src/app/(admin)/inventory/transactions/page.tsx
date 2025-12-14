"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useStockTransactions, useWarehouses, useApproveTransaction, useCancelTransaction } from "@/hooks/api";
import { Can } from "@/components/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import Card from "@/components/ui/card/Card";
import type { TransactionType, TransactionStatus, Warehouse, ApiResponse, StockTransaction } from "@/types";
import { useDebounce } from "@/hooks";
import Pagination from "@/components/tables/Pagination";
import {
  MoreVertical,
  Eye,
  Printer,
  CheckCircle,
  XCircle,
  Search,
  Package,
  Clock,
  CheckCircle2,
  XOctagon,
  X,
  RotateCcw,
  Calendar
} from "lucide-react";

export default function StockTransactionsPage() {
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">("all");
  const [warehouseFilter, setWarehouseFilter] = useState<number | "all">("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Dropdown state
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Date input refs
  const fromDateRef = React.useRef<HTMLInputElement>(null);
  const toDateRef = React.useRef<HTMLInputElement>(null);

  // Mutations
  const approve = useApproveTransaction();
  const cancel = useCancelTransaction();

  // Fetch kho cho bộ lọc (lấy tất cả kho cho dropdown search)
  const { data: warehousesResponse, isLoading: warehousesLoading } = useWarehouses({
    limit: 1000, 
  });
  const warehouses = warehousesResponse?.data as unknown as Warehouse[] || [];

  // Fetch giao dịch kho
  const { data: responseWrapper, isLoading, error } = useStockTransactions({
    page,
    limit,
    ...(debouncedSearch && { search: debouncedSearch}),
    ...(typeFilter !== "all" && { transactionType: typeFilter }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(warehouseFilter !== "all" && { warehouseId: warehouseFilter }),
    ...(fromDate && { fromDate }),
    ...(toDate && { toDate }),
  });

  const response = responseWrapper as unknown as ApiResponse<StockTransaction[]>;
  const transactions = response?.data || [];
  const paginationMeta = response?.meta;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, typeFilter, statusFilter, warehouseFilter, fromDate, toDate])

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const getTypeInfo = (type: TransactionType) => {
    const types = {
      import: { label: "Nhập kho", color: "green" as const },
      export: { label: "Xuất kho", color: "blue" as const },
      transfer: { label: "Chuyển kho", color: "purple" as const },
      disposal: { label: "Xuất hủy", color: "red" as const },
      stocktake: { label: "Kiểm kê", color: "yellow" as const },
    };
    return types[type] || { label: type, color: "gray" as const };
  };

  // Status labels and colors
  const getStatusInfo = (status: TransactionStatus) => {
    const statuses = {
      draft: { label: "Nháp", color: "gray" as const },
      pending: { label: "Chờ duyệt", color: "yellow" as const },
      approved: { label: "Đã duyệt", color: "green" as const },
      completed: { label: "Hoàn thành", color: "green" as const },
      cancelled: { label: "Đã hủy", color: "red" as const },
    };
    return statuses[status] || { label: status, color: "gray" as const };
  };

  // Handlers
  const handleApprove = (id: number, transactionCode: string) => {
    if (confirm(`Phê duyệt phiếu ${transactionCode}?`)) {
      approve.mutate({ id });
      setOpenDropdownId(null);
    }
  };

  const handleCancel = (id: number, transactionCode: string) => {
    if (confirm(`Hủy phiếu ${transactionCode}?`)) {
      const reason = prompt("Lý do hủy:");
      if (reason) {
        cancel.mutate({ id, reason });
        setOpenDropdownId(null);
      }
    }
  };

  const handlePrint = (id: number) => {
    // Open print page in new tab
    window.open(`/inventory/transactions/${id}/print`, '_blank');
    setOpenDropdownId(null);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
    setWarehouseFilter("all");
    setFromDate("");
    setToDate("");
  };

  // Calculate statistics
  const stats = {
    total: paginationMeta?.total || 0,
    pending: transactions.filter(t => t.status === "pending").length,
    approved: transactions.filter(t => t.status === "approved").length,
    completed: transactions.filter(t => t.status === "completed").length,
    cancelled: transactions.filter(t => t.status === "cancelled").length,
  };

  // Check if has active filters
  const hasActiveFilters =
    searchTerm !== "" ||
    typeFilter !== "all" ||
    statusFilter !== "all" ||
    warehouseFilter !== "all" ||
    fromDate !== "" ||
    toDate !== "";

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/10">
        <p className="text-red-800 dark:text-red-200">
          Lỗi khi tải danh sách phiếu: {(error as any)?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quản Lý Phiếu Kho
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Nhập/Xuất/Chuyển/Kiểm kê kho
          </p>
        </div>

        <div className="flex gap-3">
          <Can permission="create_stock_transaction">
            <div className="relative group">
              <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Tạo phiếu
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 dark:border-gray-700 dark:bg-gray-800">
                <div className="py-1">
                  <Link
                    href="/inventory/transactions/import"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nhập kho
                  </Link>
                  <Link
                    href="/inventory/transactions/export"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                    Xuất kho
                  </Link>
                  <Link
                    href="/inventory/transactions/transfer"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Chuyển kho
                  </Link>
                  <Link
                    href="/inventory/transactions/disposal"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Xuất hủy
                  </Link>
                  <Link
                    href="/inventory/transactions/stocktake"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Kiểm kê
                  </Link>
                </div>
              </div>
            </div>
          </Can>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tổng phiếu
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total.toLocaleString()}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        {/* Pending */}
        <Card
          onClick={() => setStatusFilter("pending")}
          hoverable
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Chờ duyệt
              </p>
              <p className="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.pending.toLocaleString()}
              </p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900/20">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>

        {/* Completed */}
        <Card
          onClick={() => setStatusFilter("completed")}
          hoverable
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Hoàn thành
              </p>
              <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.completed.toLocaleString()}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        {/* Cancelled */}
        <Card
          onClick={() => setStatusFilter("cancelled")}
          hoverable
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Đã hủy
              </p>
              <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.cancelled.toLocaleString()}
              </p>
            </div>
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
              <XOctagon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo mã phiếu, người tạo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Bộ lọc:
          </span>

          {searchTerm && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
              🔍 "{searchTerm}"
              <button
                onClick={() => setSearchTerm("")}
                className="hover:text-blue-900 dark:hover:text-blue-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {typeFilter !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
              Loại: {getTypeInfo(typeFilter).label}
              <button
                onClick={() => setTypeFilter("all")}
                className="hover:text-purple-900 dark:hover:text-purple-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {statusFilter !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
              Trạng thái: {getStatusInfo(statusFilter).label}
              <button
                onClick={() => setStatusFilter("all")}
                className="hover:text-yellow-900 dark:hover:text-yellow-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {warehouseFilter !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400">
              Kho: {warehouses.find(w => w.id === warehouseFilter)?.warehouseName || warehouseFilter}
              <button
                onClick={() => setWarehouseFilter("all")}
                className="hover:text-indigo-900 dark:hover:text-indigo-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {(fromDate || toDate) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
              📅 {fromDate && new Date(fromDate).toLocaleDateString("vi-VN")}
              {fromDate && toDate && " - "}
              {toDate && new Date(toDate).toLocaleDateString("vi-VN")}
              <button
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
                className="hover:text-green-900 dark:hover:text-green-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <RotateCcw className="h-3 w-3" />
            Xóa tất cả
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
        {/* Type Filter */}
        <div>
            <label
                htmlFor="typeFilter"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                Loại
            </label>
          <select
            id="typeFilter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">Tất cả loại</option>
            <option value="import">Nhập kho</option>
            <option value="export">Xuất kho</option>
            <option value="transfer">Chuyển kho</option>
            <option value="disposal">Xuất hủy</option>
            <option value="stocktake">Kiểm kê</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
            <label
                htmlFor="statusFilter"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                Trạng thái
            </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="draft">Nháp</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        {/* Warehouse Filter với Search */}
        <div>
            <label
                htmlFor="warehouseFilter"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                Kho
            </label>
          <SearchableSelect
            options={[
              { value: "all", label: "Tất cả kho" },
              ...warehouses.map((w) => ({
                value: w.id,
                label: `${w.warehouseCode} - ${w.warehouseName}`,
              })),
            ]}
            value={warehouseFilter}
            onChange={(value) => setWarehouseFilter(value as number | "all")}
            placeholder="Tìm kiếm kho..."
            isLoading={warehousesLoading}
          />
        </div>

        {/* From Date */}
        <div>
            <label
                htmlFor="fromDate"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                Từ ngày
            </label>
          <div className="relative">
            <input
              ref={fromDateRef}
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <button
              type="button"
              onClick={() => fromDateRef.current?.showPicker()}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              title="Chọn ngày"
            >
              <Calendar className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* To Date */}
        <div>
            <label
                htmlFor="toDate"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                Đến ngày
            </label>
          <div className="relative">
            <input
              ref={toDateRef}
              id="toDate"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <button
              type="button"
              onClick={() => toDateRef.current?.showPicker()}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              title="Chọn ngày"
            >
              <Calendar className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Items per page */}
        <div>
            <label
                htmlFor="limit"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                Hiển thị
            </label>
            <select
                id="limit"
                value={limit}
                onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1); // Reset to first page when changing limit
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
            <option value={50}>50 / trang</option>
            <option value={100}>100 / trang</option>
            </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <svg
              className="mb-4 h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm">Không có phiếu nào</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Mã phiếu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Người tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Kho
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Giá trị
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Thao tác
                </th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const typeInfo = getTypeInfo(transaction.transactionType);
                const statusInfo = getStatusInfo(transaction.status);

                return (
                  <TableRow key={transaction.id}>
                    <TableCell className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      <Link
                        href={`/inventory/transactions/${transaction.id}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {transaction.transactionCode}
                      </Link>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge color={typeInfo.color}>{typeInfo.label}</Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {transaction.creator?.fullName || "—"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {transaction.warehouse?.warehouseName || "—"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {transaction.totalValue
                        ? `${transaction.totalValue.toLocaleString("vi-VN")} đ`
                        : "—"}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(transaction.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right text-sm">
                      <div className="relative flex items-center justify-end gap-2">
                        {/* Quick View Link */}
                        <Link
                          href={`/inventory/transactions/${transaction.id}`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {/* Quick Print Button */}
                        <button
                          onClick={() => handlePrint(transaction.id)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                          title="In phiếu"
                        >
                          <Printer className="h-4 w-4" />
                        </button>

                        {/* Dropdown Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setOpenDropdownId(
                              openDropdownId === transaction.id ? null : transaction.id
                            )}
                            className="dropdown-toggle p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            title="Thêm thao tác"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          <Dropdown
                            isOpen={openDropdownId === transaction.id}
                            onClose={() => setOpenDropdownId(null)}
                            className="w-48"
                          >
                            {/* View Details */}
                            <DropdownItem
                              tag="a"
                              href={`/inventory/transactions/${transaction.id}`}
                              onItemClick={() => setOpenDropdownId(null)}
                              className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                              <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                <span>Xem chi tiết</span>
                              </div>
                            </DropdownItem>

                            {/* Approve - Only for pending status */}
                            {transaction.status === "pending" && (
                              <Can permission="approve_stock_transactions">
                                <DropdownItem
                                  onClick={() => handleApprove(transaction.id, transaction.transactionCode)}
                                  className="text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                                >
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Phê duyệt</span>
                                  </div>
                                </DropdownItem>
                              </Can>
                            )}

                            {/* Cancel - For pending/approved status */}
                            {(transaction.status === "pending" || transaction.status === "approved") && (
                              <Can permission="cancel_stock_transactions">
                                <DropdownItem
                                  onClick={() => handleCancel(transaction.id, transaction.transactionCode)}
                                  className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                  <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4" />
                                    <span>Hủy phiếu</span>
                                  </div>
                                </DropdownItem>
                              </Can>
                            )}

                            {/* Divider */}
                            <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>

                            {/* Print */}
                            <DropdownItem
                              onClick={() => handlePrint(transaction.id)}
                              className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                              <div className="flex items-center gap-2">
                                <Printer className="h-4 w-4" />
                                <span>In phiếu</span>
                              </div>
                            </DropdownItem>
                          </Dropdown>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
        {paginationMeta && paginationMeta.total > 0 && (
            <div className="mt-6 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="text-sm text-gray-700 dark:text-gray-300">
                Hiển thị{" "}
                <span className="font-medium">
                {(paginationMeta.page - 1) * paginationMeta.limit + 1}
                </span>{" "}
                đến{" "}
                <span className="font-medium">
                {Math.min(
                    paginationMeta.page * paginationMeta.limit,
                    paginationMeta.total
                )}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-medium">{paginationMeta.total}</span> phiếu
            </div>
            {paginationMeta.totalPages > 1 && (
                <Pagination
                currentPage={paginationMeta.page}
                totalPages={paginationMeta.totalPages}
                onPageChange={handlePageChange}
                />
            )}
            </div>
        )}
    </div>
  );
}
