"use client";

/**
 * Debt Reconciliation Detail Page
 * Chi tiết đối chiếu công nợ
 */

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  useDebtReconciliation,
  useConfirmReconciliation,
  useDisputeReconciliation,
  useExportReconciliationPDF,
  useSendReconciliationEmail,
} from "@/hooks/api/useDebtReconciliation";
import ReconciliationStatus, {
  ReconciliationTypeBadge,
  EntityTypeBadge,
} from "@/components/finance/ReconciliationStatus";
import Button from "@/components/ui/button/Button";
import Modal from "@/components/ui/modal/Modal";
import { Can } from "@/components/auth/Can";
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  Download,
  Mail,
  CheckCircle,
  AlertTriangle,
  Building2,
  DollarSign,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import type { ConfirmReconciliationDto, DisputeReconciliationDto } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Validation Schemas
const confirmSchema = z.object({
  confirmedByName: z.string().min(1, "Vui lòng nhập tên người xác nhận"),
  confirmedByEmail: z.string().email("Email không hợp lệ"),
  notes: z.string().optional(),
});

const disputeSchema = z.object({
  discrepancyReason: z.string().min(1, "Vui lòng nhập lý do tranh chấp"),
  notes: z.string().optional(),
});

type ConfirmFormData = z.infer<typeof confirmSchema>;
type DisputeFormData = z.infer<typeof disputeSchema>;

export default function ReconciliationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);

  // State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  // Data Fetching
  const { data, isLoading } = useDebtReconciliation(id);
  const reconciliation = data?.data;

  // Mutations
  const confirmMutation = useConfirmReconciliation();
  const disputeMutation = useDisputeReconciliation();
  const exportPDF = useExportReconciliationPDF();
  const sendEmail = useSendReconciliationEmail();

  // Forms
  const confirmForm = useForm<ConfirmFormData>({
    resolver: zodResolver(confirmSchema),
  });

  const disputeForm = useForm<DisputeFormData>({
    resolver: zodResolver(disputeSchema),
  });

  // Handlers
  const handleConfirm = async (formData: ConfirmFormData) => {
    try {
      await confirmMutation.mutateAsync({
        id,
        data: formData,
      });
      setShowConfirmModal(false);
      confirmForm.reset();
    } catch (error) {
      console.error("Failed to confirm reconciliation:", error);
    }
  };

  const handleDispute = async (formData: DisputeFormData) => {
    try {
      await disputeMutation.mutateAsync({
        id,
        data: formData,
      });
      setShowDisputeModal(false);
      disputeForm.reset();
    } catch (error) {
      console.error("Failed to dispute reconciliation:", error);
    }
  };

  const handleExportPDF = async () => {
    await exportPDF.mutateAsync(id);
  };

  const handleSendEmail = async () => {
    if (!window.confirm("Gửi email đối chiếu cho khách hàng/nhà cung cấp?")) {
      return;
    }
    await sendEmail.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (!reconciliation) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-gray-500">Không tìm thấy đối chiếu</p>
        <Link href="/finance/debt-reconciliation" className="mt-4 text-blue-600">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/finance/debt-reconciliation"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Chi Tiết Đối Chiếu
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {reconciliation.reconciliationCode}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Xuất PDF
          </Button>
          {reconciliation.status === "pending" && (
            <Button variant="outline" onClick={handleSendEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Gửi Email
            </Button>
          )}
        </div>
      </div>

      {/* Main Info Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Loại đối chiếu
              </label>
              <div className="mt-1">
                <ReconciliationTypeBadge
                  reconciliationType={reconciliation.reconciliationType}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Kỳ đối chiếu
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {reconciliation.period}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Ngày đối chiếu
              </label>
              <div className="mt-1 text-gray-900 dark:text-white">
                {format(new Date(reconciliation.reconciliationDate), "dd/MM/yyyy")}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Trạng thái
              </label>
              <div className="mt-1">
                <ReconciliationStatus reconciliation={reconciliation} />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Đối tượng
              </label>
              <div className="mt-1">
                <EntityTypeBadge
                  hasCustomer={!!reconciliation.customerId}
                  hasSupplier={!!reconciliation.supplierId}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {reconciliation.customerId ? "Khách hàng" : "Nhà cung cấp"}
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {reconciliation.customer?.customer_name ||
                    reconciliation.supplier?.supplier_name ||
                    "N/A"}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Người tạo
              </label>
              <div className="mt-1 flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                  {reconciliation.creator?.full_name || "N/A"}
                </span>
              </div>
            </div>

            {reconciliation.notes && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Ghi chú
                </label>
                <div className="mt-1 text-gray-900 dark:text-white">
                  {reconciliation.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Balance Details */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <DollarSign className="h-5 w-5" />
          Chi Tiết Số Dư
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Số dư đầu kỳ</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(reconciliation.openingBalance)}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">
              Phát sinh trong kỳ
            </span>
            <span className="text-lg font-semibold text-green-600 dark:text-green-400">
              + {formatCurrency(reconciliation.transactionsAmount)}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">
              Thanh toán trong kỳ
            </span>
            <span className="text-lg font-semibold text-red-600 dark:text-red-400">
              - {formatCurrency(reconciliation.paymentAmount)}
            </span>
          </div>

          <div className="flex items-center justify-between border-t-2 border-gray-300 pt-3 dark:border-gray-600">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Số dư cuối kỳ
            </span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(reconciliation.closingBalance)}
            </span>
          </div>

          {reconciliation.discrepancyAmount !== 0 && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-red-900 dark:text-red-300">
                  Chênh lệch: {formatCurrency(reconciliation.discrepancyAmount)}
                </span>
              </div>
              {reconciliation.discrepancyReason && (
                <p className="mt-2 text-sm text-red-800 dark:text-red-400">
                  Lý do: {reconciliation.discrepancyReason}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Info */}
      {reconciliation.status === "confirmed" && reconciliation.confirmedAt && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-green-900 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            Thông Tin Xác Nhận
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-green-700 dark:text-green-400">
                Người xác nhận
              </label>
              <div className="mt-1 text-green-900 dark:text-green-300">
                {reconciliation.confirmedByName}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-green-700 dark:text-green-400">
                Email
              </label>
              <div className="mt-1 text-green-900 dark:text-green-300">
                {reconciliation.confirmedByEmail}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-green-700 dark:text-green-400">
                Ngày xác nhận
              </label>
              <div className="mt-1 text-green-900 dark:text-green-300">
                {format(new Date(reconciliation.confirmedAt), "dd/MM/yyyy HH:mm")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions for Pending */}
      {reconciliation.status === "pending" && (
        <Can permission="finance.approve">
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={() => setShowConfirmModal(true)}
              className="flex-1"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Xác Nhận
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowDisputeModal(true)}
              className="flex-1"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Tranh Chấp
            </Button>
          </div>
        </Can>
      )}

      {/* Confirm Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Xác Nhận Đối Chiếu"
      >
        <form onSubmit={confirmForm.handleSubmit(handleConfirm)} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tên người xác nhận <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...confirmForm.register("confirmedByName")}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="Nguyễn Văn A"
            />
            {confirmForm.formState.errors.confirmedByName && (
              <p className="mt-1 text-sm text-red-600">
                {confirmForm.formState.errors.confirmedByName.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...confirmForm.register("confirmedByEmail")}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="email@example.com"
            />
            {confirmForm.formState.errors.confirmedByEmail && (
              <p className="mt-1 text-sm text-red-600">
                {confirmForm.formState.errors.confirmedByEmail.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ghi chú
            </label>
            <textarea
              {...confirmForm.register("notes")}
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="Ghi chú thêm (tùy chọn)"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowConfirmModal(false)}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={confirmMutation.isPending}
              className="flex-1"
            >
              Xác Nhận
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dispute Modal */}
      <Modal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        title="Tranh Chấp Đối Chiếu"
      >
        <form onSubmit={disputeForm.handleSubmit(handleDispute)} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Lý do tranh chấp <span className="text-red-500">*</span>
            </label>
            <textarea
              {...disputeForm.register("discrepancyReason")}
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="Nhập lý do tranh chấp..."
            />
            {disputeForm.formState.errors.discrepancyReason && (
              <p className="mt-1 text-sm text-red-600">
                {disputeForm.formState.errors.discrepancyReason.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ghi chú
            </label>
            <textarea
              {...disputeForm.register("notes")}
              rows={2}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="Ghi chú thêm (tùy chọn)"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowDisputeModal(false)}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="danger"
              loading={disputeMutation.isPending}
              className="flex-1"
            >
              Gửi Tranh Chấp
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
