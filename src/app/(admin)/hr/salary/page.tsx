/**
 * Salary List Page
 * Display and manage employee salaries
 */

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Can } from "@/components/auth/Can";
import {
  useSalary,
  useApproveSalary,
  useDeleteSalary,
} from "@/hooks/api/useSalary";
import { useUsers } from "@/hooks/api/useUsers";
import SalaryStatusBadge, {
  MonthDisplay,
  CurrencyDisplay,
  PostedStatus,
} from "@/components/salary/SalaryStatus";
import { dateToMonth, formatCurrency } from "@/types/salary.types";
import type { SalaryStatus, SalaryFilters } from "@/types/salary.types";
import {
  PlusIcon,
  FunnelIcon,
  CheckCircleIcon,
  TrashIcon,
  EyeIcon,
  PencilIcon,
  CalculatorIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

export default function SalaryListPage() {
  const [filters, setFilters] = useState<SalaryFilters>({
    page: 1,
    limit: 20,
    month: dateToMonth(new Date()),
  });

  const [showFilters, setShowFilters] = useState(false);

  const { data: salaryData, isLoading } = useSalary(filters);
  const { data: usersData } = useUsers({ limit: 1000 });
  const approveMutation = useApproveSalary();
  const deleteMutation = useDeleteSalary();

  const salaries = useMemo(() => salaryData?.data || [], [salaryData]);
  const meta = salaryData?.meta;
  const users = useMemo(() => usersData?.data || [], [usersData]);

  // Statistics
  const stats = useMemo(() => {
    const pending = salaries.filter((s) => s.status === "pending").length;
    const approved = salaries.filter((s) => s.status === "approved").length;
    const paid = salaries.filter((s) => s.status === "paid").length;
    const totalAmount = salaries.reduce((sum, s) => sum + s.total_salary, 0);

    return { pending, approved, paid, totalAmount };
  }, [salaries]);

  const handleApprove = async (id: number) => {
    if (!confirm("Xác nhận phê duyệt bảng lương này?")) return;
    await approveMutation.mutateAsync({ id });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xác nhận xóa bảng lương này? Hành động này không thể hoàn tác!"))
      return;
    await deleteMutation.mutateAsync(id);
  };

  const handleFilterChange = (key: keyof SalaryFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      month: dateToMonth(new Date()),
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Quản lý lương
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Quản lý và theo dõi bảng lương nhân viên
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <FunnelIcon className="w-5 h-5" />
            Lọc
          </button>
          <Can permission="create_salary">
            <Link
              href="/hr/salary/calculate"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <CalculatorIcon className="w-5 h-5" />
              Tính lương
            </Link>
          </Can>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Chờ duyệt"
          value={stats.pending}
          icon={<CalculatorIcon className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          title="Đã duyệt"
          value={stats.approved}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Đã thanh toán"
          value={stats.paid}
          icon={<BanknotesIcon className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Tổng tiền"
          value={formatCurrency(stats.totalAmount)}
          icon={<BanknotesIcon className="w-6 h-6" />}
          color="purple"
          isAmount
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Bộ lọc
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tháng
              </label>
              <input
                type="month"
                value={
                  filters.month
                    ? `${filters.month.substring(0, 4)}-${filters.month.substring(4, 6)}`
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value.replace("-", "");
                  handleFilterChange("month", value);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              />
            </div>

            {/* User Filter */}
            <Can permission="view_salary">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nhân viên
                </label>
                <select
                  value={filters.userId || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "userId",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                >
                  <option value="">Tất cả</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </Can>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trạng thái
              </label>
              <select
                value={filters.status || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "status",
                    (e.target.value as SalaryStatus) || undefined
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value="">Tất cả</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="paid">Đã thanh toán</option>
              </select>
            </div>

            {/* Clear Button */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nhân viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tháng
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Lương cơ bản
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Phụ cấp + OT
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Khấu trừ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tổng lương
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Hạch toán
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : salaries.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                salaries.map((salary) => (
                  <tr
                    key={salary.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {salary.user?.full_name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {salary.user?.employee_code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <MonthDisplay month={salary.month} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {formatCurrency(salary.basic_salary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 dark:text-green-400">
                      {formatCurrency(
                        salary.allowance +
                          salary.overtime_pay +
                          salary.bonus +
                          salary.commission
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600 dark:text-red-400">
                      {formatCurrency(salary.deduction + salary.advance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(salary.total_salary)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <SalaryStatusBadge status={salary.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <PostedStatus isPosted={salary.is_posted} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Details */}
                        <Link
                          href={`/hr/salary/${salary.id}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Link>

                        {/* Approve (only pending) */}
                        {salary.status === "pending" && (
                          <Can permission="approve_salary">
                            <button
                              onClick={() => handleApprove(salary.id)}
                              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                              title="Phê duyệt"
                            >
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                          </Can>
                        )}

                        {/* Delete (only pending) */}
                        {salary.status === "pending" && (
                          <Can permission="delete_salary">
                            <button
                              onClick={() => handleDelete(salary.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                              title="Xóa"
                            >
                              <TrashIcon className="w-5 h-5" />
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

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Hiển thị {(meta.page - 1) * meta.limit + 1} -{" "}
              {Math.min(meta.page * meta.limit, meta.total)} / {meta.total} bản
              ghi
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: meta.page - 1 }))
                }
                disabled={meta.page === 1}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Trang {meta.page} / {meta.totalPages}
              </span>
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: meta.page + 1 }))
                }
                disabled={meta.page === meta.totalPages}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

//----------------------------------------------
// Stat Card Component
//----------------------------------------------

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: "yellow" | "blue" | "green" | "purple";
  isAmount?: boolean;
}

function StatCard({ title, value, icon, color, isAmount }: StatCardProps) {
  const colorClasses = {
    yellow:
      "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400",
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400",
    green:
      "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400",
    purple:
      "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400",
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </span>
        <div className={`p-2 rounded-lg border ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div
        className={`${
          isAmount ? "text-xl" : "text-2xl"
        } font-bold text-gray-900 dark:text-gray-100`}
      >
        {value}
      </div>
    </div>
  );
}
