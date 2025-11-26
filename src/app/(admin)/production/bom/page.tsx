"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useBOMs, useDeleteBOM, useApproveBOM, useSetBOMInactive } from "@/hooks/api";
import { Can } from "@/components/auth";
import Button from "@/components/ui/button/Button";
import { ApiResponse, Bom, BomStatus } from "@/types";
import { Plus, Filter, X } from "lucide-react";
import { BOM_STATUS_LABELS } from "@/lib/constants";
import { format } from "date-fns";

/**
 * BOM List Page
 * Quản lý danh sách công thức sản xuất (Bill of Materials)
 */
export default function BOMListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BomStatus | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch BOMs
  const { data, isLoading, error } = useBOMs({
    search: searchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const response = data as unknown as ApiResponse<Bom[]>;
  const deleteBOM = useDeleteBOM();
  const approveBOM = useApproveBOM();
  const setInactive = useSetBOMInactive();

  // Filter BOMs
  const boms = useMemo(() => {
    if (!response?.data) return [];
    return response.data;
  }, [response?.data]);

  // Handle Delete
  const handleDelete = async (id: number, bomCode: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa BOM "${bomCode}"?`)) {
      return;
    }
    deleteBOM.mutate(id);
  };

  // Handle Approve
  const handleApprove = async (id: number, bomCode: string) => {
    if (!window.confirm(`Phê duyệt BOM "${bomCode}"?`)) {
      return;
    }
    approveBOM.mutate({ id });
  };

  // Handle Set Inactive
  const handleSetInactive = async (id: number, bomCode: string) => {
    const reason = window.prompt(`Lý do ngừng sử dụng BOM "${bomCode}":`);
    if (reason === null) return;

    setInactive.mutate({ id, reason });
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // Get status badge color
  const getStatusBadgeClass = (status: BomStatus) => {
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

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-900 dark:bg-red-900/20 dark:text-red-300">
        <h3 className="font-semibold">Lỗi khi tải danh sách BOM</h3>
        <p className="text-sm">{(error as any)?.message || "Đã có lỗi xảy ra"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Công Thức Sản Xuất (BOM)
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Quản lý công thức nguyên liệu cho sản phẩm
          </p>
        </div>

        <Can permission="create_bom">
          <Link href="/production/bom/create">
            <Button variant="primary" size="md">
              <Plus className="mr-2 h-4 w-4" />
              Tạo BOM Mới
            </Button>
          </Link>
        </Can>
      </div>

      {/* Filters */}
      <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo mã BOM, tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "primary" : "outline"}
              size="md"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Bộ lọc
            </Button>

            {(searchTerm || statusFilter !== "all") && (
              <Button variant="ghost" size="md" onClick={handleResetFilters}>
                <X className="mr-2 h-4 w-4" />
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 dark:border-gray-700 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BomStatus | "all")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="draft">Nháp</option>
                <option value="active">Đang sử dụng</option>
                <option value="inactive">Không sử dụng</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Tổng số BOM</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {boms.length}
          </p>
        </div>
        <div className="rounded-lg bg-green-50 p-4 shadow dark:bg-green-900/20">
          <p className="text-sm text-green-600 dark:text-green-400">Đang sử dụng</p>
          <p className="mt-1 text-2xl font-bold text-green-700 dark:text-green-300">
            {boms.filter((b) => b.status === "active").length}
          </p>
        </div>
        <div className="rounded-lg bg-yellow-50 p-4 shadow dark:bg-yellow-900/20">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">Nháp</p>
          <p className="mt-1 text-2xl font-bold text-yellow-700 dark:text-yellow-300">
            {boms.filter((b) => b.status === "draft").length}
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-4 shadow dark:bg-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Không sử dụng</p>
          <p className="mt-1 text-2xl font-bold text-gray-700 dark:text-gray-300">
            {boms.filter((b) => b.status === "inactive").length}
          </p>
        </div>
      </div>

      {/* BOM Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Mã BOM
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Phiên bản
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Sản lượng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Hiệu suất
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                      <span className="ml-3">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : boms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy BOM nào
                  </td>
                </tr>
              ) : (
                boms.map((bom) => (
                  <tr
                    key={bom.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <Link
                        href={`/production/bom/${bom.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      >
                        {bom.bomCode}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {bom.finishedProduct?.productName}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {bom.finishedProduct?.sku}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {bom.version}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {bom.outputQuantity} {bom.finishedProduct?.unit}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {bom.efficiencyRate}%
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                          bom.status
                        )}`}
                      >
                        {BOM_STATUS_LABELS[bom.status]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(bom.createdAt), "dd/MM/yyyy")}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/production/bom/${bom.id}`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                        >
                          Xem
                        </Link>

                        {bom.status === "draft" && (
                          <>
                            <Can permission="update_bom">
                              <Link
                                href={`/production/bom/${bom.id}/edit`}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                              >
                                Sửa
                              </Link>
                            </Can>

                            <Can permission="approve_bom">
                              <button
                                onClick={() => handleApprove(bom.id, bom.bomCode)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400"
                              >
                                Duyệt
                              </button>
                            </Can>

                            <Can permission="delete_bom">
                              <button
                                onClick={() => handleDelete(bom.id, bom.bomCode)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400"
                              >
                                Xóa
                              </button>
                            </Can>
                          </>
                        )}

                        {bom.status === "active" && (
                          <Can permission="update_bom">
                            <button
                              onClick={() => handleSetInactive(bom.id, bom.bomCode)}
                              className="text-orange-600 hover:text-orange-900 dark:text-orange-400"
                            >
                              Ngừng dùng
                            </button>
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
