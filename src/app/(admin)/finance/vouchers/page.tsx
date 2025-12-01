"use client";

/**
 * Payment Vouchers List Page
 * Danh sách phiếu chi
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  usePaymentVouchers,
  usePaymentVoucherStatistics,
  useApprovePaymentVoucher,
  useDeletePaymentVoucher,
  usePrintVoucher,
  useExportVouchers,
} from "@/hooks/api";
import type { VoucherType, VoucherPaymentMethod } from "@/types";
import VoucherStatus, {
  VoucherTypeBadge,
  PaymentMethodBadge,
} from "@/components/finance/VoucherStatus";
import Button from "@/components/ui/button/Button";
import { Can } from "@/components/auth/Can";
import {
  Plus,
  Download,
  Search,
  Filter,
  Calendar,
  DollarSign,
  TrendingDown,
  CheckCircle,
  Clock,
  Printer,
  Trash2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

export default function PaymentVouchersPage() {
  const router = useRouter();

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [voucherTypeFilter, setVoucherTypeFilter] = useState<VoucherType | "all">("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<VoucherPaymentMethod | "all">("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Data Fetching
  const { data, isLoading } = usePaymentVouchers({
    voucherType: voucherTypeFilter !== "all" ? voucherTypeFilter : undefined,
    paymentMethod: paymentMethodFilter !== "all" ? paymentMethodFilter : undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    search: searchTerm || undefined,
  });

  const { data: statsData } = usePaymentVoucherStatistics({
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const vouchers = data?.data?.vouchers || [];
  const statistics = statsData?.data;

  // Mutations
  const approveVoucher = useApprovePaymentVoucher();
  const deleteVoucher = useDeletePaymentVoucher();
  const printVoucher = usePrintVoucher();
  const exportVouchers = useExportVouchers();

  // Handlers
  const handleApprove = async (id: number, voucherCode: string) => {
    if (
      !window.confirm(
        `Phê duyệt phiếu chi "${voucherCode}"?\n\nCông nợ nhà cung cấp sẽ được cập nhật tự động (nếu có).`
      )
    ) {
      return;
    }

    await approveVoucher.mutateAsync({ id });
  };

  const handleDelete = async (id: number, voucherCode: string) => {
    if (!window.confirm(`Xóa phiếu chi "${voucherCode}"?\n\nThao tác này không thể hoàn tác.`)) {
      return;
    }

    await deleteVoucher.mutateAsync(id);
  };

  const handlePrint = async (id: number) => {
    await printVoucher.mutateAsync(id);
  };

  const handleExport = async () => {
    await exportVouchers.mutateAsync({
      voucherType: voucherTypeFilter !== "all" ? voucherTypeFilter : undefined,
      paymentMethod: paymentMethodFilter !== "all" ? paymentMethodFilter : undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setVoucherTypeFilter("all");
    setPaymentMethodFilter("all");
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Phiếu Chi
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Quản lý phiếu chi tiền
          </p>
        </div>
        <div className="flex gap-2">
          <Can permission="finance.export">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exportVouchers.isPending}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </Can>
          <Can permission="finance.create">
            <Button
              variant="primary"
              onClick={() => router.push("/finance/vouchers/create")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tạo Phiếu Chi
            </Button>
          </Can>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Vouchers */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tổng chi
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(statistics.totalAmount)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {statistics.totalVouchers} phiếu
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
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
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
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
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                  {statistics.approvedVouchers}
                </p>
                <p className="mt-1 text-xs text-yellow-600">
                  Chờ duyệt: {statistics.pendingVouchers}
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm mã phiếu, NCC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Voucher Type */}
          <select
            value={voucherTypeFilter}
            onChange={(e) => setVoucherTypeFilter(e.target.value as any)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">Tất cả loại phiếu</option>
            <option value="operating_cost">Chi phí hoạt động</option>
            <option value="supplier_payment">Thanh toán NCC</option>
            <option value="salary">Chi lương</option>
            <option value="refund">Hoàn tiền</option>
            <option value="other">Khác</option>
          </select>

          {/* Payment Method */}
          <select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value as any)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">Tất cả phương thức</option>
            <option value="cash">Tiền mặt</option>
            <option value="transfer">Chuyển khoản</option>
          </select>

          {/* Reset Button */}
          <Button variant="outline" onClick={handleResetFilters}>
            <Filter className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>

        {/* Date Range */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Từ ngày
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Đến ngày
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-gray-500">Đang tải...</div>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <p className="text-gray-500">Không có phiếu chi nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Mã phiếu
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Loại phiếu
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Ngày chi
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Số tiền
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    PT thanh toán
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {vouchers.map((voucher: any) => (
                  <tr
                    key={voucher.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {voucher.voucherCode}
                      </div>
                      {voucher.supplier && (
                        <div className="text-sm text-gray-500">
                          NCC: {voucher.supplier.supplier_name}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <VoucherTypeBadge voucherType={voucher.voucherType} size="sm" />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                        {format(new Date(voucher.paymentDate), "dd/MM/yyyy")}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(voucher.amount)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <PaymentMethodBadge
                        paymentMethod={voucher.paymentMethod}
                        size="sm"
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <VoucherStatus voucher={voucher} size="sm" />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Print */}
                        <button
                          onClick={() => handlePrint(voucher.id)}
                          className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                          title="In phiếu chi"
                        >
                          <Printer className="h-4 w-4" />
                        </button>

                        {/* Approve (if pending) */}
                        {!voucher.approvedAt && (
                          <Can permission="finance.approve">
                            <button
                              onClick={() =>
                                handleApprove(voucher.id, voucher.voucherCode)
                              }
                              className="rounded p-1 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30"
                              title="Phê duyệt"
                              disabled={approveVoucher.isPending}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          </Can>
                        )}

                        {/* Delete (if pending) */}
                        {!voucher.approvedAt && (
                          <Can permission="finance.delete">
                            <button
                              onClick={() =>
                                handleDelete(voucher.id, voucher.voucherCode)
                              }
                              className="rounded p-1 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
                              title="Xóa"
                              disabled={deleteVoucher.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </Can>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
