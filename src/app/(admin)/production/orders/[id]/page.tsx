"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useProductionOrder,
  useStartProduction,
  useCompleteProduction,
  useCancelProductionOrder,
  useWastageReport,
} from "@/hooks/api";
import Button from "@/components/ui/button/Button";
import {
  MaterialRequirements,
  WastageReport,
  ProductionTimeline,
} from "@/components/production";
import {
  completeProductionSchema,
  cancelProductionSchema,
  type CompleteProductionInput,
  type CancelProductionInput,
} from "@/lib/validations";
import { ApiResponse, ProductionOrder, WastageReport as WastageReportType } from "@/types";
import {
  ArrowLeft,
  Play,
  CheckCircle,
  XCircle,
  Package,
  Clock,
  DollarSign,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { PRODUCTION_STATUS_LABELS, PRODUCTION_STATUS_COLORS } from "@/lib/constants";

/**
 * Production Order Detail Page
 * Chi tiết lệnh sản xuất với actions: Start, Complete, Cancel
 */
export default function ProductionOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = parseInt(params.id as string);

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Fetch data
  const { data, isLoading, error } = useProductionOrder(orderId);
  const response = data as unknown as ApiResponse<ProductionOrder>;
  const order = response?.data;

  const { data: wastageData } = useWastageReport(
    orderId,
    order?.status === "completed"
  );
  const wastageResponse = wastageData as unknown as ApiResponse<WastageReportType>;
  const wastageReport = wastageResponse?.data;

  // Mutations
  const startProduction = useStartProduction();
  const completeProduction = useCompleteProduction();
  const cancelOrder = useCancelProductionOrder();

  // Complete form
  const {
    register: registerComplete,
    handleSubmit: handleSubmitComplete,
    formState: { errors: errorsComplete },
  } = useForm<CompleteProductionInput>({
    resolver: zodResolver(completeProductionSchema),
    defaultValues: {
      actualQuantity: order?.plannedQuantity || 0,
    },
  });

  // Cancel form
  const {
    register: registerCancel,
    handleSubmit: handleSubmitCancel,
    formState: { errors: errorsCancel },
  } = useForm<CancelProductionInput>({
    resolver: zodResolver(cancelProductionSchema),
  });

  // Handle Start Production
  const handleStart = async () => {
    if (!order) return;

    const confirmed = window.confirm(
      `Bắt đầu sản xuất lệnh "${order.orderCode}"?\n\n` +
        `Nguyên liệu sẽ được xuất kho tự động.`
    );

    if (!confirmed) return;

    try {
      await startProduction.mutateAsync({ id: orderId });
    } catch (error) {
      console.error("Failed to start production:", error);
    }
  };

  // Handle Complete Production
  const onCompleteSubmit = async (data: CompleteProductionInput) => {
    try {
      await completeProduction.mutateAsync({ id: orderId, data });
      setShowCompleteModal(false);
    } catch (error) {
      console.error("Failed to complete production:", error);
    }
  };

  // Handle Cancel Production
  const onCancelSubmit = async (data: CancelProductionInput) => {
    try {
      await cancelOrder.mutateAsync({ id: orderId, data });
      setShowCancelModal(false);
      router.push("/production/orders");
    } catch (error) {
      console.error("Failed to cancel production:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <h3 className="font-semibold text-red-900 dark:text-red-300">
          Lỗi khi tải thông tin lệnh sản xuất
        </h3>
        <p className="mt-1 text-sm text-red-800 dark:text-red-400">
          {(error as any)?.message || "Không tìm thấy lệnh sản xuất"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Link href="/production/orders">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {order.orderCode}
            </h1>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                PRODUCTION_STATUS_COLORS[order.status]
              }`}
            >
              {PRODUCTION_STATUS_LABELS[order.status]}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tạo ngày {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {order.status === "pending" && (
            <>
              <Button
                variant="primary"
                onClick={handleStart}
                disabled={startProduction.isPending}
                isLoading={startProduction.isPending}
              >
                <Play className="mr-2 h-5 w-5" />
                Bắt đầu sản xuất
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowCancelModal(true)}
              >
                <XCircle className="mr-2 h-5 w-5" />
                Hủy lệnh
              </Button>
            </>
          )}

          {order.status === "in_progress" && (
            <Button
              variant="success"
              onClick={() => setShowCompleteModal(true)}
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Hoàn thành
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Production Info */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin sản xuất
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Công thức BOM
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.bom?.bomCode} (v{order.bom?.version})
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sản phẩm
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.finishedProduct?.productName}
                </p>
                <p className="text-xs text-gray-500">
                  SKU: {order.finishedProduct?.sku}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  SL Kế hoạch
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(order.plannedQuantity)}{" "}
                  <span className="text-sm text-gray-500">
                    {order.finishedProduct?.unit}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  SL Thực tế
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(order.actualQuantity)}{" "}
                  <span className="text-sm text-gray-500">
                    {order.finishedProduct?.unit}
                  </span>
                </p>
              </div>
              {order.warehouseId && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Kho nhập
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.warehouse?.warehouseName || "—"}
                  </p>
                </div>
              )}
              {order.notes && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ghi chú
                  </p>
                  <p className="text-gray-900 dark:text-white">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Material Requirements */}
          {order.materials && order.materials.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Nguyên liệu sản xuất
              </h2>
              <MaterialRequirements
                materials={order.materials}
                showActual={order.status !== "pending"}
                showWastage={order.status === "completed"}
              />
            </div>
          )}

          {/* Wastage Report */}
          {order.status === "completed" && wastageReport && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Báo cáo hao hụt
              </h2>
              <WastageReport report={wastageReport} />
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <ProductionTimeline order={order} />
          </div>
        </div>

        {/* Right Column - Stats & Info */}
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Chi phí dự toán
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(order.productionCost || 0)}
                  </p>
                </div>
                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            {order.status === "completed" && wastageReport && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tỷ lệ hiệu suất
                    </p>
                    <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                      {(wastageReport.efficiencyRate * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                    <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complete Production Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Hoàn thành sản xuất
            </h3>
            <form onSubmit={handleSubmitComplete(onCompleteSubmit)} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Số lượng thực tế sản xuất <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...registerComplete("actualQuantity", { valueAsNumber: true })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                {errorsComplete.actualQuantity && (
                  <p className="mt-1 text-sm text-red-600">
                    {errorsComplete.actualQuantity.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ghi chú
                </label>
                <textarea
                  {...registerComplete("notes")}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="success"
                  className="flex-1"
                  isLoading={completeProduction.isPending}
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Hoàn thành
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCompleteModal(false)}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Production Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Hủy lệnh sản xuất
            </h3>
            <form onSubmit={handleSubmitCancel(onCancelSubmit)} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Lý do hủy <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...registerCancel("reason")}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Nhập lý do hủy lệnh sản xuất..."
                />
                {errorsCancel.reason && (
                  <p className="mt-1 text-sm text-red-600">
                    {errorsCancel.reason.message}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="danger"
                  className="flex-1"
                  isLoading={cancelOrder.isPending}
                >
                  <XCircle className="mr-2 h-5 w-5" />
                  Xác nhận hủy
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCancelModal(false)}
                >
                  Đóng
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
