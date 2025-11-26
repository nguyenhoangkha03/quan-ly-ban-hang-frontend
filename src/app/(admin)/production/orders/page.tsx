"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useProductionOrders, useDeleteProductionOrder } from "@/hooks/api";
import { Can } from "@/components/auth";
import Button from "@/components/ui/button/Button";
import { ApiResponse, ProductionOrder, ProductionStatus } from "@/types";
import { Plus, Eye, Trash2, Play, CheckCircle, Package } from "lucide-react";
import { PRODUCTION_STATUS_LABELS, PRODUCTION_STATUS_COLORS } from "@/lib/constants";
import { format } from "date-fns";
import { formatNumber } from "@/lib/utils";

/**
 * Production Orders List Page
 * Quản lý danh sách lệnh sản xuất
 */
export default function ProductionOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductionStatus | "all">("all");

  // Fetch Production Orders
  const { data, isLoading, error } = useProductionOrders({
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const response = data as unknown as ApiResponse<ProductionOrder[]>;
  const deleteOrder = useDeleteProductionOrder();

  // Filter production orders
  const orders = useMemo(() => {
    if (!response?.data) return [];

    return response.data.filter((order) => {
      const matchesSearch =
        (order.orderCode?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (order.finishedProduct?.productName?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        );

      return matchesSearch;
    });
  }, [response?.data, searchTerm]);

  // Handle Delete
  const handleDelete = async (id: number, orderCode: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa lệnh sản xuất "${orderCode}"?`)) {
      return;
    }
    deleteOrder.mutate(id);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <h3 className="font-semibold text-red-900 dark:text-red-300">
          Lỗi khi tải danh sách lệnh sản xuất
        </h3>
        <p className="mt-1 text-sm text-red-800 dark:text-red-400">
          {(error as any)?.message || "Đã có lỗi xảy ra"}
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
            Lệnh Sản Xuất
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Quản lý lệnh sản xuất và theo dõi tiến độ
          </p>
        </div>

        <Can permission="create_production_order">
          <Link href="/production/orders/create">
            <Button variant="primary">
              <Plus className="mr-2 h-5 w-5" />
              Tạo lệnh sản xuất
            </Button>
          </Link>
        </Can>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="md:col-span-2">
            <label
              htmlFor="search"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Tìm kiếm
            </label>
            <input
              type="text"
              id="search"
              placeholder="Mã lệnh, sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Trạng thái
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProductionStatus | "all")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ thực hiện</option>
              <option value="in_progress">Đang sản xuất</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        {(searchTerm || statusFilter !== "all") && (
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </div>

      {/* Production Orders Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Mã lệnh
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Sản phẩm
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  BOM
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  SL Kế hoạch
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  SL Thực tế
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Ngày bắt đầu
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-brand-600" />
                      <span className="text-gray-600 dark:text-gray-400">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-12 w-12 text-gray-400" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Không tìm thấy lệnh sản xuất nào
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/production/orders/${order.id}`}
                        className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                      >
                        {order.orderCode}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.finishedProduct?.productName || "—"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {order.finishedProduct?.sku || ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {order.bom?.bomCode || "—"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        v{order.bom?.version || "1.0"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatNumber(order.plannedQuantity)}
                      </span>
                      <span className="ml-1 text-xs text-gray-500">
                        {order.finishedProduct?.unit || ""}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatNumber(order.actualQuantity)}
                      </span>
                      <span className="ml-1 text-xs text-gray-500">
                        {order.finishedProduct?.unit || ""}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {format(new Date(order.startDate), "dd/MM/yyyy")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          PRODUCTION_STATUS_COLORS[order.status]
                        }`}
                      >
                        {PRODUCTION_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/production/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>

                        {order.status === "pending" && (
                          <Can permission="delete_production_order">
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(order.id, order.orderCode)}
                              disabled={deleteOrder.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </Can>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {orders.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng lệnh</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {orders.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Chờ thực hiện</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {orders.filter((o) => o.status === "pending").length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Đang sản xuất</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {orders.filter((o) => o.status === "in_progress").length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hoàn thành</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {orders.filter((o) => o.status === "completed").length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
