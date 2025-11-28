"use client";

/**
 * Promotions List Page
 * Danh sách chương trình khuyến mãi
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  usePromotions,
  usePromotionStatistics,
  useApprovePromotion,
  useCancelPromotion,
  useDeletePromotion,
} from "@/hooks/api/usePromotions";
import type { PromotionType, PromotionStatus as StatusType } from "@/types";
import PromotionStatus, {
  PromotionTypeBadge,
  DiscountValueDisplay,
  DateRangeDisplay,
  UsageProgressBar,
} from "@/components/features/promotions/PromotionStatus";
import Button from "@/components/ui/button/Button";
import { Can } from "@/components/auth/Can";
import {
  Plus,
  Search,
  Filter,
  CheckCircle,
  Ban,
  Trash2,
  Edit,
  Clock,
  XCircle,
  Gift,
} from "lucide-react";
import { format } from "date-fns";

export default function PromotionsPage() {
  const router = useRouter();

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<PromotionType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusType | "all">("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Data Fetching
  const { data, isLoading } = usePromotions({
    promotionType: typeFilter !== "all" ? typeFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    search: searchTerm || undefined,
  });

  const { data: statsData } = usePromotionStatistics({
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const promotions = data?.data?.promotions || [];
  const statistics = statsData?.data;

  // Mutations
  const approvePromotion = useApprovePromotion();
  const cancelPromotion = useCancelPromotion();
  const deletePromotion = useDeletePromotion();

  // Handlers
  const handleApprove = async (id: number, name: string) => {
    if (!window.confirm(`Phê duyệt chương trình "${name}"?`)) {
      return;
    }
    await approvePromotion.mutateAsync({ id });
  };

  const handleCancel = async (id: number, name: string) => {
    const reason = window.prompt(`Lý do hủy "${name}":`);
    if (!reason) return;

    await cancelPromotion.mutateAsync({ id, data: { reason } });
  };

  const handleDelete = async (id: number, name: string) => {
    if (
      !window.confirm(
        `Xóa chương trình "${name}"?\n\nThao tác này không thể hoàn tác.`
      )
    ) {
      return;
    }
    await deletePromotion.mutateAsync(id);
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
            Chương Trình Khuyến Mãi
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Quản lý các chương trình khuyến mãi và ưu đãi
          </p>
        </div>
        <Can permission="promotions.create">
          <Button
            variant="primary"
            onClick={() => router.push("/promotions/create")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tạo Khuyến Mãi
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
                  Tổng chương trình
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {statistics.totalPromotions}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                <Gift className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Active */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Đang hoạt động
                </p>
                <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                  {statistics.activePromotions}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Chờ duyệt
                </p>
                <p className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {statistics.pendingPromotions}
                </p>
              </div>
              <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900/30">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Expired */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Đã hết hạn
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {statistics.expiredPromotions}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Tổng sử dụng: {statistics.totalUsage}
                </p>
              </div>
              <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-900/30">
                <XCircle className="h-6 w-6 text-gray-600 dark:text-gray-400" />
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
              placeholder="Tìm mã, tên..."
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
            <option value="percent_discount">Giảm %</option>
            <option value="fixed_discount">Giảm cố định</option>
            <option value="buy_x_get_y">Mua X tặng Y</option>
            <option value="gift">Tặng quà</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="active">Đang hoạt động</option>
            <option value="expired">Đã hết hạn</option>
            <option value="cancelled">Đã hủy</option>
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
        ) : promotions.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <p className="text-gray-500">Không có chương trình khuyến mãi nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Mã & Tên
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Loại
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Giảm giá
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Thời gian
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Sử dụng
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
                {promotions.map((promotion: any) => (
                  <tr
                    key={promotion.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {promotion.promotionCode}
                      </div>
                      <div className="text-sm text-gray-500">
                        {promotion.promotionName}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <PromotionTypeBadge
                        promotionType={promotion.promotionType}
                        size="sm"
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <DiscountValueDisplay promotion={promotion} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <DateRangeDisplay
                        startDate={promotion.startDate}
                        endDate={promotion.endDate}
                        isRecurring={promotion.isRecurring}
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <UsageProgressBar
                        usageCount={promotion.usageCount}
                        quantityLimit={promotion.quantityLimit}
                        size="sm"
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <PromotionStatus promotion={promotion} size="sm" />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Edit */}
                        {promotion.status === "pending" && (
                          <Can permission="promotions.update">
                            <button
                              onClick={() =>
                                router.push(`/promotions/${promotion.id}/edit`)
                              }
                              className="rounded p-1 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
                              title="Sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </Can>
                        )}

                        {/* Approve */}
                        {promotion.status === "pending" && (
                          <Can permission="promotions.approve">
                            <button
                              onClick={() =>
                                handleApprove(
                                  promotion.id,
                                  promotion.promotionName
                                )
                              }
                              className="rounded p-1 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30"
                              title="Phê duyệt"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          </Can>
                        )}

                        {/* Cancel */}
                        {(promotion.status === "pending" ||
                          promotion.status === "active") && (
                          <Can permission="promotions.cancel">
                            <button
                              onClick={() =>
                                handleCancel(promotion.id, promotion.promotionName)
                              }
                              className="rounded p-1 text-orange-600 hover:bg-orange-100 dark:text-orange-400 dark:hover:bg-orange-900/30"
                              title="Hủy"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          </Can>
                        )}

                        {/* Delete */}
                        {promotion.status === "pending" && (
                          <Can permission="promotions.delete">
                            <button
                              onClick={() =>
                                handleDelete(promotion.id, promotion.promotionName)
                              }
                              className="rounded p-1 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
                              title="Xóa"
                              disabled={deletePromotion.isPending}
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
