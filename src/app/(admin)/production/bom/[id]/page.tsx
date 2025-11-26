"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useBOM, useApproveBOM, useDeleteBOM, useSetBOMInactive } from "@/hooks/api";
import { Can } from "@/components/auth";
import BOMCalculator from "@/components/features/production/BOMCalculator";
import Button from "@/components/ui/button/Button";
import { ApiResponse, Bom } from "@/types";
import {
  ArrowLeft,
  Edit,
  CheckCircle,
  XCircle,
  Trash2,
  Package,
  Clock,
  Activity,
  Calculator,
} from "lucide-react";
import { BOM_STATUS_LABELS, BOM_MATERIAL_TYPE_LABELS } from "@/lib/constants";
import { format } from "date-fns";

/**
 * BOM Detail Page
 * Xem chi tiết công thức sản xuất
 */
export default function BOMDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bomId = parseInt(params.id as string);
  const [showCalculator, setShowCalculator] = useState(false);

  const { data, isLoading, error } = useBOM(bomId);
  const approveBOM = useApproveBOM();
  const deleteBOM = useDeleteBOM();
  const setInactive = useSetBOMInactive();

  const response = data as unknown as ApiResponse<Bom>;
  const bom = response?.data;

  // Handle Approve
  const handleApprove = async () => {
    if (!bom) return;
    if (!window.confirm(`Phê duyệt BOM "${bom.bomCode}"?`)) return;

    await approveBOM.mutateAsync({ id: bomId });
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!bom) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa BOM "${bom.bomCode}"?`)) return;

    await deleteBOM.mutateAsync(bomId);
    router.push("/production/bom");
  };

  // Handle Set Inactive
  const handleSetInactive = async () => {
    if (!bom) return;
    const reason = window.prompt(`Lý do ngừng sử dụng BOM "${bom.bomCode}":`);
    if (reason === null) return;

    await setInactive.mutateAsync({ id: bomId, reason });
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !bom) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-900 dark:bg-red-900/20 dark:text-red-300">
        <h3 className="font-semibold">Lỗi khi tải BOM</h3>
        <p className="text-sm">{(error as any)?.message || "Không tìm thấy BOM"}</p>
      </div>
    );
  }

  // Separate materials by type
  const rawMaterials = bom.materials?.filter((m) => m.materialType === "raw_material") || [];
  const packagingMaterials = bom.materials?.filter((m) => m.materialType === "packaging") || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/production/bom">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {bom.bomCode}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Chi tiết công thức sản xuất
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadgeClass(
              bom.status
            )}`}
          >
            {BOM_STATUS_LABELS[bom.status]}
          </span>

          {/* Calculator Button */}
          {bom.status === "active" && (
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowCalculator(!showCalculator)}
            >
              <Calculator className="mr-2 h-4 w-4" />
              {showCalculator ? "Ẩn" : "Máy tính"}
            </Button>
          )}

          {bom.status === "draft" && (
            <>
              <Can permission="update_bom">
                <Link href={`/production/bom/${bomId}/edit`}>
                  <Button variant="outline" size="md">
                    <Edit className="mr-2 h-4 w-4" />
                    Sửa
                  </Button>
                </Link>
              </Can>

              <Can permission="approve_bom">
                <Button variant="primary" size="md" onClick={handleApprove}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Phê duyệt
                </Button>
              </Can>

              <Can permission="delete_bom">
                <Button variant="danger" size="md" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </Button>
              </Can>
            </>
          )}

          {bom.status === "active" && (
            <Can permission="update_bom">
              <Button variant="outline" size="md" onClick={handleSetInactive}>
                <XCircle className="mr-2 h-4 w-4" />
                Ngừng sử dụng
              </Button>
            </Can>
          )}
        </div>
      </div>

      {/* BOM Calculator */}
      {showCalculator && bom.status === "active" && (
        <BOMCalculator
          bomId={bomId}
          bomCode={bom.bomCode}
          outputQuantityPerBatch={Number(bom.outputQuantity)}
          finishedProductUnit={bom.finishedProduct?.unit || ""}
        />
      )}

      {/* BOM Information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin cơ bản
            </h3>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Mã BOM
                </dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {bom.bomCode}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Phiên bản
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {bom.version}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Sản phẩm thành phẩm
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  <div className="font-medium">{bom.finishedProduct?.productName}</div>
                  <div className="text-gray-500 dark:text-gray-400">
                    {bom.finishedProduct?.sku}
                  </div>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Sản lượng/mẻ
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {bom.outputQuantity} {bom.finishedProduct?.unit}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tỷ lệ hiệu suất
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {bom.efficiencyRate}%
                </dd>
              </div>

              {bom.productionTime && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Thời gian sản xuất
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {bom.productionTime} phút
                  </dd>
                </div>
              )}

              {bom.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Ghi chú
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {bom.notes}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Raw Materials */}
          {rawMaterials.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Nguyên liệu thô ({rawMaterials.length})
              </h3>

              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                        Nguyên liệu
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                        Số lượng
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                        Đơn vị
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                        Ghi chú
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                    {rawMaterials.map((material) => (
                      <tr key={material.id}>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {material.material?.productName}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">
                              {material.material?.sku}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {material.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {material.unit}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {material.notes || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Packaging Materials */}
          {packagingMaterials.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Bao bì ({packagingMaterials.length})
              </h3>

              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                        Bao bì
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                        Số lượng
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                        Đơn vị
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                        Ghi chú
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                    {packagingMaterials.map((material) => (
                      <tr key={material.id}>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {material.material?.productName}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">
                              {material.material?.sku}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {material.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {material.unit}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {material.notes || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Thống kê
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tổng NL</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {bom.materials?.length || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                  <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Hiệu suất</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {bom.efficiencyRate}%
                  </p>
                </div>
              </div>

              {bom.productionTime && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                    <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">T.gian SX</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {bom.productionTime} phút
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin khác
            </h3>

            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Người tạo
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {bom.creator?.fullName || "N/A"}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Ngày tạo
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {format(new Date(bom.createdAt), "dd/MM/yyyy HH:mm")}
                </dd>
              </div>

              {bom.approver && (
                <>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Người duyệt
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {bom.approver.fullName}
                    </dd>
                  </div>

                  {bom.approvedAt && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Ngày duyệt
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {format(new Date(bom.approvedAt), "dd/MM/yyyy HH:mm")}
                      </dd>
                    </div>
                  )}
                </>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
