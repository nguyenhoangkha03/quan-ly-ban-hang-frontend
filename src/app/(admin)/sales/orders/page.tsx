"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSalesOrders, useDeleteSalesOrder } from "@/hooks/api";
import { Can } from "@/components/auth";
import Button from "@/components/ui/button/Button";
import {
  ApiResponse,
  SalesOrder,
  OrderStatus,
  PaymentStatus,
} from "@/types";
import {
  Plus,
  Eye,
  Trash2,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
} from "@/lib/constants";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export default function SalesOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | "all">("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | "all">("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Fetch Sales Orders
  const { data, isLoading, error } = useSalesOrders({
    orderStatus: orderStatusFilter !== "all" ? orderStatusFilter : undefined,
    paymentStatus: paymentStatusFilter !== "all" ? paymentStatusFilter : undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });
  const response = data as unknown as ApiResponse<SalesOrder[]>;
  const deleteOrder = useDeleteSalesOrder();

  // Filter orders by search
  const orders = useMemo(() => {
    if (!response?.data) return [];

    return response.data.filter((order) => {
      const matchesSearch =
        (order.orderCode?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (order.customer?.customerName?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        );

      return matchesSearch;
    });
  }, [response?.data, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!orders.length)
      return {
        total: 0,
        pending: 0,
        approved: 0,
        completed: 0,
        totalRevenue: 0,
        unpaidAmount: 0,
      };

    return {
      total: orders.length,
      pending: orders.filter((o) => o.orderStatus === "pending").length,
      approved: orders.filter((o) => o.orderStatus === "approved").length,
      completed: orders.filter((o) => o.orderStatus === "completed").length,
      totalRevenue: orders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
      unpaidAmount: orders.reduce(
        (sum, o) => sum + (Number(o.totalAmount) - Number(o.paidAmount)),
        0
      ),
    };
  }, [orders]);

  // Handle Delete
  const handleDelete = async (id: number, orderCode: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng "${orderCode}"?`)) {
      return;
    }
    await deleteOrder.mutateAsync(id);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setOrderStatusFilter("all");
    setPaymentStatusFilter("all");
    setFromDate("");
    setToDate("");
  };

  const hasActiveFilters =
    searchTerm ||
    orderStatusFilter !== "all" ||
    paymentStatusFilter !== "all" ||
    fromDate ||
    toDate;

  // Get order status color
  const getOrderStatusColor = (status: OrderStatus) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      approved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[status] || colors.pending;
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <h3 className="font-semibold text-red-900 dark:text-red-300">
          Lỗi khi tải danh sách đơn hàng
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
            Đơn Hàng Bán
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Quản lý đơn hàng bán và theo dõi thanh toán
          </p>
        </div>

        <Can permission="create_sales_order">
          <Link href="/sales/orders/create">
            <Button variant="primary">
              <Plus className="mr-2 h-5 w-5" />
              Tạo đơn hàng
            </Button>
          </Link>
        </Can>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng đơn hàng</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
              <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hoàn thành</p>
              <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.completed}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng doanh thu</p>
              <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
              <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Công nợ</p>
              <p className="mt-1 text-xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(stats.unpaidAmount)}
              </p>
            </div>
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="grid gap-4 md:grid-cols-5">
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
              placeholder="Mã đơn, khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Order Status Filter */}
          <div>
            <label
              htmlFor="orderStatus"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Trạng thái đơn
            </label>
            <select
              id="orderStatus"
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value as OrderStatus | "all")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="in_progress">Đang xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label
              htmlFor="paymentStatus"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Thanh toán
            </label>
            <select
              id="paymentStatus"
              value={paymentStatusFilter}
              onChange={(e) =>
                setPaymentStatusFilter(e.target.value as PaymentStatus | "all")
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Tất cả</option>
              <option value="unpaid">Chưa thanh toán</option>
              <option value="partial">Thanh toán 1 phần</option>
              <option value="paid">Đã thanh toán</option>
            </select>
          </div>

          {/* From Date */}
          <div>
            <label
              htmlFor="fromDate"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Từ ngày
            </label>
            <input
              type="date"
              id="fromDate"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* To Date in second row */}
        <div className="mt-4 grid gap-4 md:grid-cols-5">
          <div>
            <label
              htmlFor="toDate"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Đến ngày
            </label>
            <input
              type="date"
              id="toDate"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Mã đơn
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Khách hàng
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Ngày đặt
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  Tổng tiền
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  Đã trả
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  TT Thanh toán
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  TT Đơn hàng
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
                      <ShoppingCart className="h-12 w-12 text-gray-400" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Không tìm thấy đơn hàng nào
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3">
                      <Link
                        href={`/sales/orders/${order.id}`}
                        className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                      >
                        {order.orderCode}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {order.customer?.customerName || "—"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {order.customer?.phone || ""}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {format(new Date(order.orderDate), "dd/MM/yyyy")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {formatCurrency(order.paidAmount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          PAYMENT_STATUS_COLORS[order.paymentStatus]
                        }`}
                      >
                        {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getOrderStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {ORDER_STATUS_LABELS[order.orderStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/sales/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>

                        {order.orderStatus === "pending" && (
                          <Can permission="delete_sales_order">
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
    </div>
  );
}
