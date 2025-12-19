"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWarehouses, useDeleteWarehouse, useWarehouseCards } from "@/hooks/api";
import { Can } from "@/components/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import Badge, { type BadgeColor } from "@/components/ui/badge/Badge";
import { WarehouseType, StatusCommon, ApiResponse, Warehouse, WarehouseCards } from "@/types";
import { Calendar, CheckCircle, Edit, Eye, Package, Pencil, Plus, Trash2, TrendingUp } from "lucide-react";
import { useDebounce } from "@/hooks";
import Pagination from "@/components/tables/Pagination";
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";
import Button from "@/components/ui/button/Button";
import { useRouter } from 'next/navigation';

export default function WarehousesPage() {
  const router = useRouter();

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [typeFilter, setTypeFilter] = useState<WarehouseType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | StatusCommon>("all");

  // Dialog delete
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingWarehouse, setDeletingWarehouse] = useState<Warehouse | null>(null);
  const deleteWarehouse = useDeleteWarehouse();

  // Fetch warehouses với server-side pagination
  const { data, isLoading, error } = useWarehouses({
    page,
    limit,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(typeFilter !== "all" && { warehouseType: typeFilter }),
    ...(statusFilter !== 'all' && { status: statusFilter }),
  });
  const response = data as unknown as ApiResponse<Warehouse[]>;

  const { data: warehouseCardsWrapper, isLoading: statsLoading } = useWarehouseCards();
  const warehouseCards = warehouseCardsWrapper as unknown as WarehouseCards;

  const warehouses = response?.data || [];
  const paginationMeta = response?.meta;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, typeFilter, statusFilter]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  }

  const handleDeleteClick = (warehouse: Warehouse) => {
    setDeletingWarehouse(warehouse);
    setIsDeleteDialogOpen(true);
  }

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeletingWarehouse(null);
  }

  const handleConfirmDelete = async () => {
    if(!deletingWarehouse) return;
    await deleteWarehouse.mutateAsync(deletingWarehouse.id);
    setIsDeleteDialogOpen(false);
    setDeletingWarehouse(null);
  }

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
  const getTypeBadgeColor = (type: WarehouseType): BadgeColor => {
    const colors: Record<WarehouseType, BadgeColor> = {
      raw_material: "blue",
      packaging: "yellow",
      finished_product: "green",
      goods: "purple",
    };
    return colors[type];
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/10">
        <p className="text-red-800 dark:text-red-200">
          Lỗi khi tải danh sách kho: {(error as any)?.message || "Unknown error"}
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
            Quản lý Kho
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Quản lý thông tin các kho hàng trong hệ thống
          </p>
        </div>

        <Can permission="create_warehouse">
            <Button variant="primary" size="sm" onClick={() => router.push('/warehouses/create')}>
                <Plus className="mr-2 h-5 w-5" />
                Thêm kho mới
            </Button>
        </Can>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Categories Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {statsLoading ? (
            <div className="h-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            ) : (
            <>
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Tổng số kho
                    </p>
                    <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {warehouseCards?.totalWarehouses || 0}
                    </p>
                </div>
                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                    <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                </div>
            </>
            )}
        </div>

        {/* Active Categories Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {statsLoading ? (
            <div className="h-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            ) : (
            <>
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Đang hoạt động
                    </p>
                    <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                    {warehouseCards?.activeWarehouses || 0}
                    </p>
                </div>
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                </div>
            </>
            )}
        </div>

        {/* Inactive Categories Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {statsLoading ? (
            <div className="h-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            ) : (
            <>
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Tháng này
                    </p>
                    <p className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {warehouseCards?.createdThisMonth || 0}
                    </p>
                </div>
                <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-800">
                    <Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                </div>
            </>
            )}
        </div>

        {/* Root Categories Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {statsLoading ? (
            <div className="h-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            ) : (
            <>
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tổng tồn kho
                    </p>
                    <p className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {warehouseCards?.totalInventoryValue || 0}
                    </p>
                </div>
                <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                </div>
            </>
            )}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {/* Search */}
            <div>
                <label
                    htmlFor="limit"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                    Tìm kiếm
                </label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    </div>
                    <input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                    placeholder="Tìm theo tên hoặc mã kho..."
                    />
                </div>
            </div>

            {/* Type Filter */}
            <div>
            <label
                htmlFor="limit"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                Loại kho
            </label>
            <select
                id="type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
                <option value="all">Tất cả loại kho</option>
                <option value="raw_material">Nguyên liệu</option>
                <option value="packaging">Bao bì</option>
                <option value="finished_product">Thành phẩm</option>
                <option value="goods">Hàng hóa</option>
            </select>
            </div>

            {/* Status Filter */}
            <div>
            <label
                htmlFor="limit"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                Trạng thái
            </label>
            <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Ngưng hoạt động</option>
            </select>
            </div>

            {/* Items per page */}
            <div>
                <label
                htmlFor="limit"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                Hiển thị
                </label>
                <select
                id="limit"
                value={limit}
                onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1); // Reset to first page when changing limit
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
                <option value={50}>50 / trang</option>
                <option value={100}>100 / trang</option>
                </select>
            </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : warehouses.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <svg
              className="mb-4 h-12 w-12"
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
            <p className="text-sm">Không tìm thấy kho nào</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Mã kho
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Tên kho
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Quản lý
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Địa chỉ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Thao tác
                </th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses.map((warehouse) => (
                <TableRow key={warehouse.id}>
                  <TableCell className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {warehouse.warehouseCode}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    <Link
                      href={`/warehouses/${warehouse.id}`}
                      className="font-medium hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {warehouse.warehouseName}
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-6 py-4 text-sm">
                    <Badge color={getTypeBadgeColor(warehouse.warehouseType)}>
                      {getTypeLabel(warehouse.warehouseType)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {warehouse.manager ? (
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {warehouse.manager.fullName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {warehouse.manager.employeeCode}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {warehouse.address ? (
                      <span>
                        {warehouse.address}
                        {warehouse.city && `, ${warehouse.city}`}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-6 py-4 text-sm">
                    <Badge color={warehouse.status === "active" ? "green" : "gray"}>
                      {warehouse.status === "active" ? "Hoạt động" : "Ngưng"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/warehouses/${warehouse.id}`}
                        className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        title="Xem"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      <Can permission="update_warehouse">
                        <Link
                          href={`/warehouses/${warehouse.id}/edit`}
                          className="rounded p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="Sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Can>

                      <Can permission="delete_warehouse">
                        <button
                          onClick={() => handleDeleteClick(warehouse)}
                          className="rounded p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Xóa"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
        {paginationMeta && paginationMeta.total > 0 && (
            <div className="mt-6 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="text-sm text-gray-700 dark:text-gray-300">
                Hiển thị{" "}
                <span className="font-medium">
                {(paginationMeta.page - 1) * paginationMeta.limit + 1}
                </span>{" "}
                đến{" "}
                <span className="font-medium">
                {Math.min(
                    paginationMeta.page * paginationMeta.limit,
                    paginationMeta.total
                )}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-medium">{paginationMeta.total}</span> kho
            </div>
            {paginationMeta.totalPages > 1 && (
                <Pagination
                currentPage={paginationMeta.page}
                totalPages={paginationMeta.totalPages}
                onPageChange={handlePageChange}
                />
            )}
            </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Xóa kho hàng"
        message={`Bạn có chắc chắn muốn xóa kho hàng "${deletingWarehouse?.warehouseName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        isLoading={deleteWarehouse.isPending}
        />
    </div>
  );
}
