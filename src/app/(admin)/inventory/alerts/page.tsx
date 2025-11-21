"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useInventoryAlerts, useWarehouses } from "@/hooks/api";
import { Can } from "@/components/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { StockLevelIndicator } from "@/components/inventory/StockLevelIndicator";

/**
 * Low Stock Alerts Page
 * Trang cảnh báo tồn kho thấp
 */
export default function LowStockAlertsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | "all">("all");

  // Fetch warehouses for filter
  const { data: warehousesResponse } = useWarehouses();
  const warehouses = warehousesResponse?.data || [];

  // Fetch low stock alerts
  const { data: alertsResponse, isLoading, error } = useInventoryAlerts(
    selectedWarehouse !== "all" ? selectedWarehouse : undefined
  );

  // Client-side filtering
  const alerts = useMemo(() => {
    if (!alertsResponse?.data) return [];

    return alertsResponse.data.filter((alert) => {
      const matchesSearch =
        (alert.product?.product_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (alert.product?.product_code?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (alert.warehouse?.warehouseName?.toLowerCase() || "").includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [alertsResponse?.data, searchTerm]);

  // Sort by severity (most critical first)
  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((a, b) => {
      const severityA = a.current_quantity === 0 ? 3 : (a.current_quantity / a.min_stock_level) * 100;
      const severityB = b.current_quantity === 0 ? 3 : (b.current_quantity / b.min_stock_level) * 100;
      return severityA - severityB;
    });
  }, [alerts]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!alerts.length) {
      return {
        total: 0,
        outOfStock: 0,
        criticalLow: 0,
        low: 0,
      };
    }

    return {
      total: alerts.length,
      outOfStock: alerts.filter((a) => a.current_quantity === 0).length,
      criticalLow: alerts.filter(
        (a) => a.current_quantity > 0 && (a.current_quantity / a.min_stock_level) * 100 < 25
      ).length,
      low: alerts.filter(
        (a) => (a.current_quantity / a.min_stock_level) * 100 >= 25 && (a.current_quantity / a.min_stock_level) * 100 < 50
      ).length,
    };
  }, [alerts]);

  // Get warehouse type info
  const getWarehouseTypeInfo = (type?: string) => {
    const types = {
      raw_material: { label: "Nguyên liệu", color: "blue" as const },
      packaging: { label: "Bao bì", color: "yellow" as const },
      finished_product: { label: "Thành phẩm", color: "green" as const },
      goods: { label: "Hàng hóa", color: "purple" as const },
    };
    return types[type as keyof typeof types] || { label: "N/A", color: "gray" as const };
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/10">
        <p className="text-red-800 dark:text-red-200">
          Lỗi khi tải cảnh báo: {(error as any)?.message || "Unknown error"}
        </p>
      </div>
    );
  }

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
              Cảnh báo Tồn kho Thấp
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Danh sách sản phẩm cần nhập kho
          </p>
        </div>

        <Can permission="manage_inventory">
          <Link
            href="/purchase-orders/create"
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
            Tạo đơn đặt hàng
          </Link>
        </Can>
      </div>

      {/* Alert Banner */}
      {stats.total > 0 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
          <div className="flex items-center">
            <svg
              className="h-6 w-6 text-orange-600 dark:text-orange-400"
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
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800 dark:text-orange-400">
                Có {stats.total} sản phẩm cần chú ý
              </h3>
              <div className="mt-1 text-sm text-orange-700 dark:text-orange-300">
                <span className="font-semibold">{stats.outOfStock}</span> hết hàng, {" "}
                <span className="font-semibold">{stats.criticalLow}</span> sắp hết, {" "}
                <span className="font-semibold">{stats.low}</span> tồn thấp
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tổng cảnh báo
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.total}
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

        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/10">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                Hết hàng
              </p>
              <p className="mt-2 text-3xl font-bold text-red-700 dark:text-red-400">
                {stats.outOfStock}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-orange-200 bg-orange-50 p-6 dark:border-orange-800 dark:bg-orange-900/10">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                Sắp hết (&lt;25%)
              </p>
              <p className="mt-2 text-3xl font-bold text-orange-700 dark:text-orange-400">
                {stats.criticalLow}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/10">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                Tồn thấp (25-50%)
              </p>
              <p className="mt-2 text-3xl font-bold text-yellow-700 dark:text-yellow-400">
                {stats.low}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Search */}
        <div>
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
              placeholder="Tìm sản phẩm hoặc kho..."
            />
          </div>
        </div>

        {/* Warehouse Filter */}
        <div>
          <select
            value={selectedWarehouse}
            onChange={(e) =>
              setSelectedWarehouse(e.target.value === "all" ? "all" : Number(e.target.value))
            }
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
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : sortedAlerts.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <svg
              className="mb-4 h-12 w-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium">Không có cảnh báo tồn kho</p>
            <p className="text-xs text-gray-400 mt-1">Tất cả sản phẩm đều đủ hàng</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Mức độ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Kho
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Tồn hiện tại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Mức tối thiểu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Thiếu hụt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Tiến độ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Thao tác
                </th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAlerts.map((alert) => {
                const percentage = (alert.current_quantity / alert.min_stock_level) * 100;
                const typeInfo = getWarehouseTypeInfo(alert.warehouse?.warehouseType);

                return (
                  <TableRow key={`${alert.warehouse_id}-${alert.product_id}`}>
                    {/* Severity */}
                    <TableCell className="px-6 py-4">
                      {alert.current_quantity === 0 ? (
                        <Badge color="red">Hết hàng</Badge>
                      ) : percentage < 25 ? (
                        <Badge color="orange">Sắp hết</Badge>
                      ) : (
                        <Badge color="yellow">Tồn thấp</Badge>
                      )}
                    </TableCell>

                    {/* Product */}
                    <TableCell className="px-6 py-4">
                      <Link
                        href={`/products/${alert.product_id}`}
                        className="font-medium text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                      >
                        {alert.product?.product_name || "N/A"}
                      </Link>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {alert.product?.product_code || "N/A"}
                      </div>
                    </TableCell>

                    {/* Warehouse */}
                    <TableCell className="px-6 py-4">
                      <Link
                        href={`/inventory/warehouse/${alert.warehouse_id}`}
                        className="text-sm text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                      >
                        {alert.warehouse?.warehouseName || "N/A"}
                      </Link>
                      <div className="mt-1">
                        <Badge color={typeInfo.color} size="sm">
                          {typeInfo.label}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Current Quantity */}
                    <TableCell className="px-6 py-4 text-sm font-semibold">
                      <span className={alert.current_quantity === 0 ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}>
                        {alert.current_quantity.toLocaleString()}
                      </span>
                    </TableCell>

                    {/* Min Stock Level */}
                    <TableCell className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {alert.min_stock_level.toLocaleString()}
                    </TableCell>

                    {/* Shortage */}
                    <TableCell className="px-6 py-4 text-sm font-semibold text-red-600 dark:text-red-400">
                      {alert.shortage.toLocaleString()}
                    </TableCell>

                    {/* Progress */}
                    <TableCell className="px-6 py-4">
                      <StockLevelIndicator
                        current={alert.current_quantity}
                        min={alert.min_stock_level}
                        size="sm"
                        showLabel={false}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-6 py-4 text-right">
                      <Can permission="manage_inventory">
                        <Link
                          href={`/stock-transactions/create?warehouseId=${alert.warehouse_id}&productId=${alert.product_id}&suggestedQty=${alert.shortage}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Nhập kho
                        </Link>
                      </Can>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Summary */}
      {sortedAlerts.length > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Hiển thị {sortedAlerts.length} cảnh báo
          {(searchTerm || selectedWarehouse !== "all") &&
            ` (đã lọc từ ${alertsResponse?.data?.length || 0} cảnh báo)`}
        </div>
      )}
    </div>
  );
}
