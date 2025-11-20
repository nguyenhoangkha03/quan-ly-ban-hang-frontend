"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useWarehouse, useDeleteWarehouse } from "@/hooks/api";
import { Can } from "@/components/auth";
import Badge from "@/components/ui/badge/Badge";
import { WarehouseType } from "@/types";

/**
 * Warehouse Detail Page
 * Trang chi tiết kho
 */
export default function WarehouseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const warehouseId = Number(params.id);

  const { data: response, isLoading, error } = useWarehouse(warehouseId);
  const deleteWarehouse = useDeleteWarehouse();

  const handleDelete = async () => {
    if (!response?.data) return;

    if (window.confirm(`Bạn có chắc chắn muốn xóa kho "${response.data.warehouseName}"?`)) {
      try {
        await deleteWarehouse.mutateAsync(warehouseId);
        router.push("/warehouses");
      } catch (error) {
        console.error("Delete warehouse failed:", error);
      }
    }
  };

  // Warehouse type labels
  const getTypeLabel = (type: WarehouseType) => {
    const labels: Record<WarehouseType, string> = {
      raw_material: "Nguyên liệu",
      packaging: "Bao bì",
      finished_product: "Thành phẩm",
      goods: "Hàng hóa",
    };
    return labels[type];
  };

  // Warehouse type badge colors
  const getTypeBadgeColor = (type: WarehouseType) => {
    const colors: Record<WarehouseType, string> = {
      raw_material: "blue",
      packaging: "yellow",
      finished_product: "green",
      goods: "purple",
    };
    return colors[type];
  };

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

  if (!response?.data) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/10">
        <p className="text-yellow-800 dark:text-yellow-200">
          Không tìm thấy kho này
        </p>
      </div>
    );
  }

  const warehouse = response.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Chi tiết kho
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Thông tin chi tiết về kho: {warehouse.warehouseName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/warehouses"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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
            Quay lại
          </Link>

          <Can permission="update_warehouse">
            <Link
              href={`/warehouses/${warehouseId}/edit`}
              className="inline-flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Xóa
            </button>
          </Can>
        </div>
      </div>

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
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Mã kho
                </dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {warehouse.warehouseCode}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tên kho
                </dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {warehouse.warehouseName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Loại kho
                </dt>
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
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Sức chứa
                </dt>
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
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Địa chỉ
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {warehouse.address || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Thành phố
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {warehouse.city || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Khu vực
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {warehouse.region || "—"}
                </dd>
              </div>
            </div>
          </div>

          {/* Description */}
          {warehouse.description && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Mô tả
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {warehouse.description}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Stats & Metadata */}
        <div className="space-y-6">
          {/* Inventory Stats */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Thống kê tồn kho
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Tổng số mặt hàng
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  —
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Tổng số lượng
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  —
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Giá trị tồn kho
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  —
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Sẽ được cập nhật sau khi tích hợp với hệ thống tồn kho
            </p>
          </div>

          {/* Metadata */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin khác
            </h2>
            <div className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Ngày tạo
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {warehouse.created_at
                    ? new Date(warehouse.created_at).toLocaleString("vi-VN")
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Cập nhật lần cuối
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {warehouse.updated_at
                    ? new Date(warehouse.updated_at).toLocaleString("vi-VN")
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  ID
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {warehouse.id}
                </dd>
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
                href={`/inventory?warehouse=${warehouseId}`}
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
                href={`/inventory/stock-in?warehouse=${warehouseId}`}
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
                href={`/inventory/stock-out?warehouse=${warehouseId}`}
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
