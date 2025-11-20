"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useWarehouses, useDeleteWarehouse } from "@/hooks/api";
import { Can } from "@/components/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { Warehouse, WarehouseType } from "@/types";

/**
 * Warehouses List Page
 * Quản lý danh sách kho
 */
export default function WarehousesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<WarehouseType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Fetch warehouses
  const { data: response, isLoading, error } = useWarehouses();
  const deleteWarehouse = useDeleteWarehouse();

  // Filter warehouses
  const warehouses = React.useMemo(() => {
    if (!response?.data) return [];

    return response.data.filter((warehouse) => {
      const matchesSearch =
        (warehouse.warehouseName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (warehouse.warehouseCode?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "all" || warehouse.warehouseType === typeFilter;
      const matchesStatus = statusFilter === "all" || warehouse.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [response?.data, searchTerm, typeFilter, statusFilter]);

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa kho "${name}"?`)) {
      try {
        await deleteWarehouse.mutateAsync(id);
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

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Search */}
        <div>
          <label htmlFor="search" className="sr-only">
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
          <label htmlFor="type" className="sr-only">
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
          <label htmlFor="status" className="sr-only">
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
                  <TableCell className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/warehouses/${warehouse.id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Xem
                      </Link>

                      <Can permission="update_warehouse">
                        <Link
                          href={`/warehouses/${warehouse.id}/edit`}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                        >
                          Sửa
                        </Link>
                      </Can>

                      <Can permission="delete_warehouse">
                        <button
                          onClick={() => handleDelete(warehouse.id, warehouse.warehouseName)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
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

      {/* Stats */}
      {warehouses.length > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Hiển thị {warehouses.length} kho
          {(typeFilter !== "all" || statusFilter !== "all" || searchTerm) &&
            ` (đã lọc từ ${response?.data?.length || 0} kho)`}
        </div>
      )}
    </div>
  );
}
