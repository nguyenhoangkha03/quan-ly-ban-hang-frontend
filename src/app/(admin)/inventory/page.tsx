"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useInventory, useWarehouses, useInventoryStats } from "@/hooks/api";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { Can } from "@/components/auth";
import { ApiResponse, CardStat, Inventory, Warehouse, WarehouseType } from "@/types";
import { useDebounce } from "@/hooks";
import Pagination from "@/components/tables/Pagination";

export default function InventoryPage() {
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [warehouseFilter, setWarehouseFilter] = useState<number | "all">("all");
  const [warehouseTypeFilter, setWarehouseTypeFilter] = useState<WarehouseType | "all">("all");
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [outOfStockFilter, setOutOfStockFilter] = useState(false);

  // Fetch dữ liệu cho bộ lọc
  const { data: warehousesResponse } = useWarehouses();
  const warehouses = warehousesResponse?.data as unknown as Warehouse[] || [];

  // Fetch tồn kho
  const { data, isLoading, error } = useInventory({
    page,
    limit,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(warehouseFilter !== 'all' && { warehouseId: warehouseFilter }),
    ...(warehouseTypeFilter !== 'all' && { warehouseType: warehouseTypeFilter }),
    ...(lowStockFilter && { lowStock: true }),
    ...(outOfStockFilter && { outOfStock: true }),
  });
  const responseWrapper = data as unknown as ApiResponse<Inventory[]>;

  const response = responseWrapper?.data || [];
  const paginationMeta = responseWrapper?.meta;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, warehouseFilter, warehouseTypeFilter, lowStockFilter, outOfStockFilter]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  }

  // Fetch thống kê từ endpoint khác (không ảnh hướng bởi pagination/filters)
  const { data: statsResponseWrapper } = useInventoryStats(
    warehouseTypeFilter !== 'all' ? warehouseTypeFilter : undefined
  );
  const statsResponse = statsResponseWrapper as unknown as ApiResponse<CardStat>;

  // Sử dụng stats từ API (không ảnh hướng bởi pagination)
  const stats = useMemo(() => {
    if (!statsResponse?.data) {
      return {
        totalItems: 0,
        totalValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
      };
    }

    return statsResponse.data;
  }, [statsResponse]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/10">
        <p className="text-red-800 dark:text-red-200">
          Lỗi khi tải dữ liệu tồn kho: {(error as any)?.message || "Unknown error"}
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
            Quản lý Tồn kho
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Theo dõi tồn kho theo thời gian thực
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/inventory/alerts"
            className="inline-flex items-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-700 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30"
          >
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Cảnh báo tồn thấp
            {stats.lowStockItems > 0 && (
              <span className="ml-1 rounded-full bg-orange-600 px-2 py-0.5 text-xs font-bold text-white">
                {stats.lowStockItems}
              </span>
            )}
          </Link>

          <Can permission="manage_inventory">
            <Link
              href="/stock-transactions/create"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
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
              Nhập/Xuất kho
            </Link>
          </Can>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tổng sản phẩm
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalItems}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
              <svg
                className="h-8 w-8 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Giá trị tồn kho
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalValue.toLocaleString("vi-VN")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">VNĐ</p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <svg
                className="h-8 w-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tồn kho thấp
              </p>
              <p className="mt-2 text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.lowStockItems}
              </p>
            </div>
            <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/20">
              <svg
                className="h-8 w-8 text-orange-600 dark:text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Hết hàng
              </p>
              <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.outOfStockItems}
              </p>
            </div>
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
              <svg
                className="h-8 w-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        {/* Search */}
        <div>
          <label
                htmlFor="limit"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                Tìm kiếm
            </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              placeholder="Tìm theo tên hoặc mã..."
            />
          </div>
        </div>

        {/* Warehouse Filter */}
        <div>
            <label
                htmlFor="limit"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                Kho
            </label>
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">Tất cả kho</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.warehouseName}
              </option>
            ))}
          </select>
        </div>

        {/* Warehouse Type Filter */}
        <div>
            <label
                htmlFor="limit"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                Loại kho
            </label>
          <select
            value={warehouseTypeFilter}
            onChange={(e) => setWarehouseTypeFilter(e.target.value as any)}
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">Tất cả loại kho</option>
            <option value="raw_material">Nguyên liệu</option>
            <option value="packaging">Bao bì</option>
            <option value="finished_product">Thành phẩm</option>
            <option value="goods">Hàng hóa</option>
          </select>
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

        {/* Quick Filters */}
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={lowStockFilter}
              onChange={(e) => {
                setLowStockFilter(e.target.checked)
                if(outOfStockFilter) {
                    setOutOfStockFilter(!outOfStockFilter)
                }
              }}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Tồn thấp
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={outOfStockFilter}
              onChange={(e) => {
                setOutOfStockFilter(e.target.checked)
                if(lowStockFilter) {
                    setLowStockFilter(!lowStockFilter)
                }
              }}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Hết hàng
            </span>
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <InventoryTable inventory={response} isLoading={isLoading} />
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
                <span className="font-medium">{paginationMeta.total}</span> sản phẩm
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
