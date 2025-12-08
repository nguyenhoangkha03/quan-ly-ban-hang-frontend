"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStockTransactions, useWarehouses } from "@/hooks/api";
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
import type { TransactionType, TransactionStatus, Warehouse, ApiResponse, StockTransaction } from "@/types";
import { useDebounce } from "@/hooks";

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
            Quản lý Phiếu Kho
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Nhập/Xuất/Chuyển/Kiểm kê kho
          </p>
        </div>

        <div className="flex gap-3">
          <Can permission="create_stock_transactions">
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

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        {/* Type Filter */}
        <div>
          <select
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
          <select
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
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="Từ ngày"
          />
        </div>

        {/* To Date */}
        <div>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="Đến ngày"
          />
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
                      <Link
                        href={`/inventory/transactions/${transaction.id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Xem
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Summary */}
      {transactions.length > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Hiển thị {transactions.length} phiếu
        </div>
      )}
    </div>
  );
}
