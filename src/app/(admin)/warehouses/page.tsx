"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWarehouses, useDeleteWarehouse, WarehouseCards, useWarehouseCards } from "@/hooks/api";
import { Can } from "@/components/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import Badge, { type BadgeColor } from "@/components/ui/badge/Badge";
import WarehouseStats from "@/components/warehouses/WarehouseStats";
import { WarehouseType, StatusCommon, ApiResponse, Warehouse } from "@/types";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useDebounce } from "@/hooks";
import Pagination from "@/components/tables/Pagination";
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";

export default function WarehousesPage() {
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
          <Link
            href="/warehouses/create"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
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
            Tạo kho mới
          </Link>
        </Can>
      </div>

      {/* Statistics Cards */}
      <WarehouseStats data={warehouseCards} isLoading={statsLoading} />

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
                    <div className="flex flex-col items-end gap-1.5">
                      <Link
                        href={`/warehouses/${warehouse.id}`}
                        className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Xem
                      </Link>

                      <Can permission="update_warehouse">
                        <Link
                          href={`/warehouses/${warehouse.id}/edit`}
                          className="inline-flex items-center gap-1.5 rounded-md bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Sửa
                        </Link>
                      </Can>

                      <Can permission="delete_warehouse">
                        <button
                          onClick={() => handleDeleteClick(warehouse)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Xóa
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
