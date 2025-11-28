"use client";

/**
 * Debt Reconciliation List Page
 * Danh sách đối chiếu công nợ
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useDebtReconciliations,
  useDebtReconciliationStatistics,
  useDeleteDebtReconciliation,
  useExportReconciliationPDF,
  useSendReconciliationEmail,
  useConfirmReconciliation,
  useDisputeReconciliation,
} from "@/hooks/api/useDebtReconciliation";
import type { ReconciliationType, ReconciliationStatus } from "@/types";
import ReconciliationStatus, {
  ReconciliationTypeBadge,
  EntityTypeBadge,
} from "@/components/features/finance/ReconciliationStatus";
import Button from "@/components/ui/button/Button";
import { Can } from "@/components/auth/Can";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Download,
  Mail,
  Trash2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

export default function DebtReconciliationPage() {
  const router = useRouter();

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<ReconciliationType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ReconciliationStatus | "all">("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Data Fetching
  const { data, isLoading } = useDebtReconciliations({
    reconciliationType: typeFilter !== "all" ? typeFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    search: searchTerm || undefined,
  });

  const { data: statsData } = useDebtReconciliationStatistics({
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const reconciliations = data?.data?.reconciliations || [];
  const statistics = statsData?.data;

  // Mutations
  const deleteReconciliation = useDeleteDebtReconciliation();
  const exportPDF = useExportReconciliationPDF();
  const sendEmail = useSendReconciliationEmail();
  const confirmReconciliation = useConfirmReconciliation();
  const disputeReconciliation = useDisputeReconciliation();

  // Handlers
  const handleDelete = async (id: number, code: string) => {
    if (
      !window.confirm(
        `Xóa đối chiếu "${code}"?\n\nThao tác này không thể hoàn tác.`
      )
    ) {
      return;
    }

    await deleteReconciliation.mutateAsync(id);
  };

  const handleExportPDF = async (id: number) => {
    await exportPDF.mutateAsync(id);
  };

  const handleSendEmail = async (id: number, code: string) => {
    if (
      !window.confirm(
        `Gửi email đối chiếu "${code}" cho khách hàng/nhà cung cấp?`
      )
    ) {
      return;
    }

    await sendEmail.mutateAsync(id);
  };

  const handleConfirm = async (id: number) => {
    const name = window.prompt("Nhập tên người xác nhận:");
    if (!name) return;

    const email = window.prompt("Nhập email người xác nhận:");
    if (!email) return;

    await confirmReconciliation.mutateAsync({
      id,
      data: { confirmedByName: name, confirmedByEmail: email },
    });
  };

  const handleDispute = async (id: number) => {
    const reason = window.prompt("Nhập lý do tranh chấp:");
    if (!reason) return;

    await disputeReconciliation.mutateAsync({
      id,
      data: { discrepancyReason: reason },
    });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Đối Chiếu Công Nợ
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Quản lý đối chiếu công nợ với khách hàng và nhà cung cấp
          </p>
        </div>
        <Can permission="finance.create">
          <Button
            variant="primary"
            onClick={() => router.push("/finance/debt-reconciliation/create")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tạo Đối Chiếu
          </Button>
        </Can>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tổng đối chiếu
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {statistics.totalReconciliations}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Chờ xác nhận
                </p>
                <p className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {statistics.pendingReconciliations}
                </p>
              </div>
              <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900/30">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Confirmed */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Đã xác nhận
                </p>
                <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                  {statistics.confirmedReconciliations}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Disputed */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tranh chấp
                </p>
                <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
                  {statistics.disputedReconciliations}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Chênh lệch: {formatCurrency(statistics.totalDiscrepancy)}
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
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
              placeholder="Tìm mã đối chiếu, đối tác..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">Tất cả loại</option>
            <option value="monthly">Theo tháng</option>
            <option value="quarterly">Theo quý</option>
            <option value="yearly">Theo năm</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="disputed">Tranh chấp</option>
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
        ) : reconciliations.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <p className="text-gray-500">Không có đối chiếu nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Mã đối chiếu
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Loại
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Đối tượng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Kỳ
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Số dư cuối
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
                {reconciliations.map((reconciliation: any) => (
                  <tr
                    key={reconciliation.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {reconciliation.reconciliationCode}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(
                          new Date(reconciliation.reconciliationDate),
                          "dd/MM/yyyy"
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <ReconciliationTypeBadge
                        reconciliationType={reconciliation.reconciliationType}
                        size="sm"
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="mb-1">
                        <EntityTypeBadge
                          hasCustomer={!!reconciliation.customerId}
                          hasSupplier={!!reconciliation.supplierId}
                          size="sm"
                        />
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {reconciliation.customer?.customer_name ||
                          reconciliation.supplier?.supplier_name ||
                          "N/A"}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {reconciliation.period}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(reconciliation.closingBalance)}
                      </div>
                      {reconciliation.discrepancyAmount !== 0 && (
                        <div className="text-xs text-red-600">
                          Chênh lệch:{" "}
                          {formatCurrency(reconciliation.discrepancyAmount)}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <ReconciliationStatus
                        reconciliation={reconciliation}
                        size="sm"
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Export PDF */}
                        <button
                          onClick={() => handleExportPDF(reconciliation.id)}
                          className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                          title="Xuất PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>

                        {/* Send Email */}
                        {reconciliation.status === "pending" && (
                          <button
                            onClick={() =>
                              handleSendEmail(
                                reconciliation.id,
                                reconciliation.reconciliationCode
                              )
                            }
                            className="rounded p-1 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
                            title="Gửi email"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                        )}

                        {/* Confirm */}
                        {reconciliation.status === "pending" && (
                          <Can permission="finance.approve">
                            <button
                              onClick={() => handleConfirm(reconciliation.id)}
                              className="rounded p-1 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30"
                              title="Xác nhận"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          </Can>
                        )}

                        {/* Dispute */}
                        {reconciliation.status === "pending" && (
                          <Can permission="finance.approve">
                            <button
                              onClick={() => handleDispute(reconciliation.id)}
                              className="rounded p-1 text-orange-600 hover:bg-orange-100 dark:text-orange-400 dark:hover:bg-orange-900/30"
                              title="Tranh chấp"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </button>
                          </Can>
                        )}

                        {/* Delete */}
                        {reconciliation.status === "pending" && (
                          <Can permission="finance.delete">
                            <button
                              onClick={() =>
                                handleDelete(
                                  reconciliation.id,
                                  reconciliation.reconciliationCode
                                )
                              }
                              className="rounded p-1 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
                              title="Xóa"
                              disabled={deleteReconciliation.isPending}
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
