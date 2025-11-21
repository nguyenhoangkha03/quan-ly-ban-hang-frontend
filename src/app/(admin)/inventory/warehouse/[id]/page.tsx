"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useInventoryByWarehouse, useWarehouse } from "@/hooks/api";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { Can } from "@/components/auth";
import Badge from "@/components/ui/badge/Badge";

/**
 * Inventory by Warehouse Page
 * Trang xem tồn kho theo từng kho cụ thể
 */
export default function InventoryByWarehousePage() {
  const params = useParams();
  const warehouseId = Number(params.id);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [filterOutOfStock, setFilterOutOfStock] = useState(false);

  // Fetch warehouse info
  const { data: warehouseResponse, isLoading: isLoadingWarehouse } = useWarehouse(warehouseId);
  const warehouse = warehouseResponse?.data;

  // Fetch inventory for this warehouse
  const { data: inventoryResponse, isLoading: isLoadingInventory, error } = useInventoryByWarehouse(warehouseId);

  // Client-side filtering
  const inventory = useMemo(() => {
    if (!inventoryResponse?.data) return [];

    return inventoryResponse.data.filter((item) => {
      // Search filter
      const matchesSearch =
        (item.product?.product_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (item.product?.product_code?.toLowerCase() || "").includes(searchTerm.toLowerCase());

      // Low stock filter
      const matchesLowStock =
        !filterLowStock ||
        item.quantity - item.reserved_quantity < (item.product?.min_stock_level || 0);

      // Out of stock filter
      const matchesOutOfStock = !filterOutOfStock || item.quantity === 0;

      return matchesSearch && matchesLowStock && matchesOutOfStock;
    });
  }, [inventoryResponse?.data, searchTerm, filterLowStock, filterOutOfStock]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!inventory.length) {
      return {
        totalItems: 0,
        totalQuantity: 0,
        totalReserved: 0,
        totalAvailable: 0,
        totalValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
      };
    }

    return {
      totalItems: inventory.length,
      totalQuantity: inventory.reduce((sum, item) => sum + item.quantity, 0),
      totalReserved: inventory.reduce((sum, item) => sum + item.reserved_quantity, 0),
      totalAvailable: inventory.reduce(
        (sum, item) => sum + (item.quantity - item.reserved_quantity),
        0
      ),
      totalValue: inventory.reduce((sum, item) => {
        const value = item.quantity * (item.product?.unit_price || 0);
        return sum + value;
      }, 0),
      lowStockItems: inventory.filter(
        (item) =>
          item.quantity - item.reserved_quantity < (item.product?.min_stock_level || 0)
      ).length,
      outOfStockItems: inventory.filter((item) => item.quantity === 0).length,
    };
  }, [inventory]);

  // Get warehouse type label and color
  const getWarehouseTypeInfo = (type?: string) => {
    const types = {
      raw_material: { label: "Nguyên liệu", color: "blue" as const },
      packaging: { label: "Bao bì", color: "yellow" as const },
      finished_product: { label: "Thành phẩm", color: "green" as const },
      goods: { label: "Hàng hóa", color: "purple" as const },
    };
    return types[type as keyof typeof types] || { label: "N/A", color: "gray" as const };
  };

  const isLoading = isLoadingWarehouse || isLoadingInventory;

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/10">
        <p className="text-red-800 dark:text-red-200">
          Lỗi khi tải dữ liệu tồn kho: {(error as any)?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/10">
        <p className="text-yellow-800 dark:text-yellow-200">
          Không tìm thấy kho này
        </p>
      </div>
    );
  }

  const typeInfo = getWarehouseTypeInfo(warehouse.warehouseType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/inventory"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tồn kho: {warehouse.warehouseName}
            </h1>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Badge color={typeInfo.color}>{typeInfo.label}</Badge>
            <Badge color={warehouse.status === "active" ? "green" : "gray"}>
              {warehouse.status === "active" ? "Hoạt động" : "Ngưng"}
            </Badge>
            {warehouse.address && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                <svg
                  className="inline h-4 w-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {warehouse.address}
                {warehouse.city && `, ${warehouse.city}`}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Can permission="manage_inventory">
            <Link
              href={`/stock-transactions/create?warehouseId=${warehouseId}`}
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
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Tổng sản phẩm
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalItems}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Tổng số lượng
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalQuantity.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Đặt giữ: {stats.totalReserved.toLocaleString()} | Khả dụng: {stats.totalAvailable.toLocaleString()}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Giá trị tồn kho
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {(stats.totalValue / 1000000).toFixed(1)}M
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            VNĐ
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Cảnh báo
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.lowStockItems}
            </span>
            <span className="text-sm text-gray-500">tồn thấp</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.outOfStockItems}
            </span>
            <span className="text-sm text-gray-500">hết hàng</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {/* Search */}
        <div className="sm:col-span-2">
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              placeholder="Tìm theo tên hoặc mã sản phẩm..."
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-4 sm:col-span-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filterLowStock}
              onChange={(e) => setFilterLowStock(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Chỉ tồn thấp
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filterOutOfStock}
              onChange={(e) => setFilterOutOfStock(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Chỉ hết hàng
            </span>
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <InventoryTable
          inventory={inventory}
          isLoading={isLoadingInventory}
          showWarehouse={false}
        />
      </div>

      {/* Summary */}
      {inventory.length > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Hiển thị {inventory.length} sản phẩm
          {(searchTerm || filterLowStock || filterOutOfStock) &&
            ` (đã lọc từ ${inventoryResponse?.data?.length || 0} sản phẩm)`}
        </div>
      )}
    </div>
  );
}
