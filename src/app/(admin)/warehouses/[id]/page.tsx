"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  useWarehouse,
  useDeleteWarehouse,
  useWarehouseStatistics,
  useInventoryByWarehouse,
  useStockTransactions,
} from "@/hooks/api";
import { Can } from "@/components/auth";
import Badge from "@/components/ui/badge/Badge";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { Inventory, StockTransaction, Warehouse, WarehouseStatistics, WarehouseType } from "@/types";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function WarehouseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const warehouseId = Number(params.id);

  const { data: responseWrapper, isLoading, error } = useWarehouse(warehouseId);
  const response = responseWrapper?.data as unknown as Warehouse;
  const { data: statsResponseWrapper, isLoading: statsLoading } = useWarehouseStatistics(warehouseId);
  const statsResponse = statsResponseWrapper?.data as unknown as WarehouseStatistics;
  const { data: inventoryResponseWrapper, isLoading: inventoryLoading } = useInventoryByWarehouse(warehouseId);
  const inventoryResponse = inventoryResponseWrapper?.data as unknown as Inventory[];
  const { data: transactionsResponseWrapper, isLoading: transactionsLoading } = useStockTransactions({
    warehouseId: warehouseId,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const transactionsResponse = transactionsResponseWrapper?.data as unknown as StockTransaction[];
  const deleteWarehouse = useDeleteWarehouse();

  const handleDelete = async () => {
    if (!response) return;

    if (window.confirm(`Bạn có chắc chắn muốn xóa kho "${response.warehouseName}"?`)) {
      try {
        await deleteWarehouse.mutateAsync(warehouseId);
        router.push("/warehouses");
      } catch (error) {
        console.error("Xóa kho không thành công:", error);
      }
    }
  };

  const getTypeLabel = (type: WarehouseType) => {
    const labels: Record<WarehouseType, string> = {
      raw_material: "Nguyên liệu",
      packaging: "Bao bì",
      finished_product: "Thành phẩm",
      goods: "Hàng hóa",
    };
    return labels[type];
  };

  const getTypeBadgeColor = (type: WarehouseType): "blue" | "yellow" | "green" | "purple" => {
    const colors: Record<WarehouseType, "blue" | "yellow" | "green" | "purple"> = {
      raw_material: "blue",
      packaging: "yellow",
      finished_product: "green",
      goods: "purple",
    };
    return colors[type];
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      import: "Nhập kho",
      export: "Xuất kho",
      transfer: "Chuyển kho",
      disposal: "Hủy hàng",
      stocktake: "Kiểm kê",
    };
    return labels[type] || type;
  };

  const getTransactionStatusInfo = (status: string): { label: string; color: "gray" | "yellow" | "blue" | "green" | "red" } => {
    const info: Record<string, { label: string; color: "gray" | "yellow" | "blue" | "green" | "red" }> = {
      draft: { label: "Nháp", color: "gray" },
      pending: { label: "Chờ duyệt", color: "yellow" },
      approved: { label: "Đã duyệt", color: "blue" },
      completed: { label: "Hoàn thành", color: "green" },
      cancelled: { label: "Đã hủy", color: "red" },
    };
    return info[status] || { label: status, color: "gray" };
  };

  const transactionChartData: ApexOptions = React.useMemo(() => {
    if (!statsResponse) {
      return {
        series: [],
        chart: { type: "donut", height: 300 },
      };
    }

    const stats = statsResponse;
    const transactionTypes = Object.entries(stats.transactions.last30Days);

    if (transactionTypes.length === 0) {
      return {
        series: [],
        chart: { type: "donut", height: 300 },
      };
    }

    const typeLabels: Record<string, string> = {
      import: "Nhập kho",
      export: "Xuất kho",
      transfer: "Chuyển kho",
      disposal: "Hủy hàng",
      stocktake: "Kiểm kê",
    };

    const typeColors: Record<string, string> = {
      import: "#10b981",
      export: "#ef4444",
      transfer: "#3b82f6",
      disposal: "#f59e0b",
      stocktake: "#8b5cf6",
    };

    return {
      series: transactionTypes.map(([_, count]) => count),
      chart: {
        type: "donut",
        height: 300,
      },
      labels: transactionTypes.map(([type, _]) => typeLabels[type] || type),
      colors: transactionTypes.map(([type, _]) => typeColors[type] || "#6b7280"),
      legend: {
        position: "bottom",
        fontSize: "12px",
      },
      plotOptions: {
        pie: {
          donut: {
            size: "70%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Tổng",
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151",
                formatter: () => {
                  const total = transactionTypes.reduce((sum, [_, count]) => sum + count, 0);
                  return total.toString();
                },
              },
            },
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(0)}%`,
      },
      tooltip: {
        y: {
          formatter: (value) => `${value} giao dịch`,
        },
      },
    };
  }, [statsResponse]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/10">
        <p className="text-red-800 dark:text-red-200">
          Lỗi khi tải thông tin kho: {(error as any)?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/10">
        <p className="text-yellow-800 dark:text-yellow-200">Không tìm thấy kho này</p>
      </div>
    );
  }

  const warehouse = response;
  const stats = statsResponse;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chi tiết kho</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Thông tin chi tiết về kho: {warehouse.warehouseName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/warehouses"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Quay lại
          </Link>

          <Can permission="update_warehouse">
            <Link
              href={`/warehouses/${warehouseId}/edit`}
              className="inline-flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Chỉnh sửa
            </Link>
          </Can>

          <Can permission="delete_warehouse">
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Xóa
            </button>
          </Can>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Products */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tổng số mặt hàng
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.inventory.totalProducts.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
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

          {/* Total Quantity */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tổng số lượng
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.inventory.totalQuantity.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Khả dụng: {stats.inventory.availableQuantity.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Capacity Utilization */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tỷ lệ sử dụng
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.capacity.utilizationPercent !== null
                    ? `${stats.capacity.utilizationPercent.toFixed(1)}%`
                    : "—"}
                </p>
                {stats.capacity.total && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {stats.capacity.used.toLocaleString()} / {stats.capacity.total.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
                <svg
                  className="h-8 w-8 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Transactions (30 days) */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Giao dịch (30 ngày)
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {Object.values(stats.transactions.last30Days).reduce(
                    (sum, count) => sum + count,
                    0
                  )}
                </p>
              </div>
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
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
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin cơ bản
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Mã kho</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {warehouse.warehouseCode}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tên kho</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {warehouse.warehouseName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Loại kho</dt>
                <dd className="mt-1">
                  <Badge color={getTypeBadgeColor(warehouse.warehouseType)}>
                    {getTypeLabel(warehouse.warehouseType)}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Trạng thái
                </dt>
                <dd className="mt-1">
                  <Badge color={warehouse.status === "active" ? "green" : "gray"}>
                    {warehouse.status === "active" ? "Hoạt động" : "Ngưng hoạt động"}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sức chứa</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {warehouse.capacity ? `${warehouse.capacity.toLocaleString()} m³` : "—"}
                </dd>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin vị trí
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Địa chỉ</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {warehouse.address || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Thành phố</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {warehouse.city || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Khu vực</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {warehouse.region || "—"}
                </dd>
              </div>
            </div>
          </div>

          {/* Manager Information */}
          {warehouse.manager && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Quản lý kho
              </h2>
              <div className="flex items-start gap-4">
                {warehouse.manager.avatarUrl ? (
                  <img
                    src={warehouse.manager.avatarUrl}
                    alt={warehouse.manager.fullName}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <span className="text-xl font-semibold text-blue-600 dark:text-blue-300">
                      {warehouse.manager.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {warehouse.manager.fullName}
                  </div>
                  <div className="mt-1 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                    <div>Mã NV: {warehouse.manager.employeeCode}</div>
                    {warehouse.manager.email && (
                      <div className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {warehouse.manager.email}
                      </div>
                    )}
                    {warehouse.manager.phone && (
                      <div className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {warehouse.manager.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {warehouse.description && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Mô tả</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">{warehouse.description}</p>
            </div>
          )}

          {/* Current Inventory */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tồn kho hiện tại
              </h2>
              <Link
                href={`/inventory/warehouse/${warehouseId}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Xem tất cả →
              </Link>
            </div>
            <InventoryTable
              inventory={inventoryResponse || []}
              isLoading={inventoryLoading}
              showWarehouse={false}
            />
          </div>

          {/* Recent Transactions */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Giao dịch gần đây
              </h2>
              <Link
                href={`/stock-transactions?warehouse=${warehouseId}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Xem tất cả →
              </Link>
            </div>

            {transactionsLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
              </div>
            ) : transactionsResponse && transactionsResponse.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Mã giao dịch
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Loại
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Ngày tạo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {transactionsResponse.map((transaction) => {
                      const statusInfo = getTransactionStatusInfo(transaction.status);
                      return (
                        <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            <Link
                              href={`/stock-transactions/${transaction.id}`}
                              className="hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              {transaction.transaction_code}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            {getTransactionTypeLabel(transaction.transaction_type)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            {new Date(transaction.createdAt).toLocaleDateString("vi-VN")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
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
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Chưa có giao dịch nào
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Charts & Quick Actions */}
        <div className="space-y-6">
          {/* Transaction Breakdown Chart */}
          {stats && Object.keys(stats.transactions.last30Days).length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Phân loại giao dịch (30 ngày)
              </h2>
              {statsLoading ? (
                <div className="flex h-[300px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                </div>
              ) : (
                <ReactApexChart
                  options={transactionChartData}
                  series={transactionChartData.series}
                  type="donut"
                  height={300}
                />
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin khác
            </h2>
            <div className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày tạo</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {warehouse.createdAt
                    ? new Date(warehouse.createdAt).toLocaleString("vi-VN")
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Cập nhật lần cuối
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {warehouse.updatedAt
                    ? new Date(warehouse.updatedAt).toLocaleString("vi-VN")
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">ID</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{warehouse.id}</dd>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Thao tác nhanh
            </h2>
            <div className="space-y-2">
              <Link
                href={`/inventory/warehouse/${warehouseId}`}
                className="flex w-full items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                Xem tồn kho
              </Link>
              <Link
                href={`/stock-transactions/create/import?warehouse=${warehouseId}`}
                className="flex w-full items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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
                Nhập kho
              </Link>
              <Link
                href={`/stock-transactions/create/export?warehouse=${warehouseId}`}
                className="flex w-full items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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
                    d="M20 12H4"
                  />
                </svg>
                Xuất kho
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
