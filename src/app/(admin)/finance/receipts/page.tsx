"use client";

/**
 * Payment Receipts List Page
 * Danh sách phiếu thu với filters và statistics
 */

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  usePaymentReceipts,
  usePaymentReceiptStatistics,
  useApprovePaymentReceipt,
  useDeletePaymentReceipt,
  usePrintReceipt,
  useExportReceipts,
} from "@/hooks/api";
import { Can } from "@/components/auth";
import Button from "@/components/ui/button/Button";
import ReceiptStatus, {
  ReceiptTypeBadge,
  PaymentMethodBadge,
} from "@/components/finance/ReceiptStatus";
import {
  ApiResponse,
  PaymentReceipt,
  ReceiptType,
  ReceiptPaymentMethod,
} from "@/types";
import {
  Plus,
  Eye,
  CheckCircle,
  Trash2,
  Printer,
  Download,
  DollarSign,
  TrendingUp,
  CreditCard,
  FileText,
  Search,
  Filter,
  X,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export default function PaymentReceiptsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [receiptTypeFilter, setReceiptTypeFilter] = useState<ReceiptType | "all">(
    "all"
  );
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<
    ReceiptPaymentMethod | "all"
  >("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Fetch Data
  const { data, isLoading, error } = usePaymentReceipts({
    receiptType: receiptTypeFilter !== "all" ? receiptTypeFilter : undefined,
    paymentMethod: paymentMethodFilter !== "all" ? paymentMethodFilter : undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });
  const response = data as unknown as ApiResponse<PaymentReceipt[]>;

  const { data: statsData } = usePaymentReceiptStatistics({
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });
  const statistics = statsData?.data;

  // Mutations
  const approveReceipt = useApprovePaymentReceipt();
  const deleteReceipt = useDeletePaymentReceipt();
  const printReceipt = usePrintReceipt();
  const exportReceipts = useExportReceipts();

  // Filter receipts by search
  const receipts = useMemo(() => {
    if (!response?.data) return [];

    return response.data.filter((receipt) => {
      const matchesSearch =
        (receipt.receiptCode?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (receipt.customer?.customerName?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (receipt.order?.orderCode?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        );

      return matchesSearch;
    });
  }, [response?.data, searchTerm]);

  // Handle Approve
  const handleApprove = async (id: number, receiptCode: string) => {
    if (
      !window.confirm(
        `Phê duyệt phiếu thu "${receiptCode}"?\n\nCông nợ khách hàng sẽ được cập nhật tự động.`
      )
    ) {
      return;
    }

    await approveReceipt.mutateAsync({ id });
  };

  // Handle Delete
  const handleDelete = async (id: number, receiptCode: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phiếu thu "${receiptCode}"?`)) {
      return;
    }

    await deleteReceipt.mutateAsync(id);
  };

  // Handle Print
  const handlePrint = async (id: number) => {
    await printReceipt.mutateAsync(id);
  };

  // Handle Export
  const handleExport = async () => {
    await exportReceipts.mutateAsync({
      receiptType: receiptTypeFilter !== "all" ? receiptTypeFilter : undefined,
      paymentMethod:
        paymentMethodFilter !== "all" ? paymentMethodFilter : undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    });
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setReceiptTypeFilter("all");
    setPaymentMethodFilter("all");
    setFromDate("");
    setToDate("");
  };

  const hasActiveFilters =
    searchTerm ||
    receiptTypeFilter !== "all" ||
    paymentMethodFilter !== "all" ||
    fromDate ||
    toDate;

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <h3 className="font-semibold text-red-900 dark:text-red-300">
          Lỗi khi tải danh sách phiếu thu
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
            Phiếu Thu
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Quản lý thu tiền từ khách hàng
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Can permission="finance.export">
            <Button
              variant="outline"
              icon={Download}
              onClick={handleExport}
              loading={exportReceipts.isPending}
            >
              Export Excel
            </Button>
          </Can>

          <Can permission="finance.create">
            <Link href="/finance/receipts/create">
              <Button variant="primary" icon={Plus}>
                Tạo Phiếu Thu
              </Button>
            </Link>
          </Can>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Amount */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tổng thu
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(statistics.totalAmount)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {statistics.totalReceipts} phiếu
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Cash */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tiền mặt
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(statistics.cashAmount)}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Transfer */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Chuyển khoản
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(statistics.transferAmount)}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
                <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          {/* Approved */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Đã duyệt
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {statistics.approvedReceipts}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {statistics.pendingReceipts} chờ duyệt
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Bộ lọc</h3>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="ml-auto text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <X className="inline h-4 w-4 mr-1" />
              Xóa bộ lọc
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Mã phiếu, khách hàng..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Receipt Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Loại phiếu
            </label>
            <select
              value={receiptTypeFilter}
              onChange={(e) => setReceiptTypeFilter(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Tất cả</option>
              <option value="sales">Thu tiền hàng</option>
              <option value="debt_collection">Thu công nợ</option>
              <option value="refund">Hoàn tiền</option>
              <option value="other">Khác</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phương thức
            </label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Tất cả</option>
              <option value="cash">Tiền mặt</option>
              <option value="transfer">Chuyển khoản</option>
              <option value="card">Thẻ</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Từ ngày
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Đến ngày
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Mã phiếu
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Khách hàng
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Loại phiếu
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Ngày thu
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  Số tiền
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  PT thanh toán
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Đang tải...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Không có dữ liệu phiếu thu
                    </p>
                  </td>
                </tr>
              ) : (
                receipts.map((receipt) => (
                  <tr
                    key={receipt.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {/* Receipt Code */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-blue-600 dark:text-blue-400">
                        {receipt.receiptCode}
                      </p>
                      {receipt.orderId && receipt.order && (
                        <p className="text-xs text-gray-500">
                          {receipt.order.orderCode}
                        </p>
                      )}
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {receipt.customer?.customerName || "-"}
                      </p>
                    </td>

                    {/* Receipt Type */}
                    <td className="px-4 py-3">
                      <ReceiptTypeBadge receiptType={receipt.receiptType} size="sm" />
                    </td>

                    {/* Receipt Date */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(receipt.receiptDate), "dd/MM/yyyy")}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(receipt.amount)}
                      </p>
                    </td>

                    {/* Payment Method */}
                    <td className="px-4 py-3">
                      <PaymentMethodBadge
                        paymentMethod={receipt.paymentMethod}
                        size="sm"
                      />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <ReceiptStatus receipt={receipt} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Printer}
                          onClick={() => handlePrint(receipt.id)}
                          loading={printReceipt.isPending}
                          title="In phiếu"
                        />

                        {!receipt.approvedAt && (
                          <Can permission="finance.approve">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={CheckCircle}
                              onClick={() =>
                                handleApprove(receipt.id, receipt.receiptCode)
                              }
                              loading={approveReceipt.isPending}
                              title="Phê duyệt"
                            />
                          </Can>
                        )}

                        {!receipt.approvedAt && (
                          <Can permission="finance.delete">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Trash2}
                              onClick={() =>
                                handleDelete(receipt.id, receipt.receiptCode)
                              }
                              loading={deleteReceipt.isPending}
                              className="text-red-600 hover:text-red-700"
                              title="Xóa"
                            />
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
