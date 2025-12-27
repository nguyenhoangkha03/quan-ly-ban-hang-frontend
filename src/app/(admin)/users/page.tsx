"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useUsers, useDeleteUser, useWarehouses, useRoles, useChangeUserPassword, useUpdateUserStatus } from "@/hooks/api";
import { Can } from "@/components/auth";
import Badge, { BadgeColor } from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { ApiResponse, User, UserStatus, Warehouse } from "@/types";
import { Eye, Trash2, Users, UserCheck, UserX, Lock, Key, MoreVertical, Star, Download, Plus, X, RotateCcw, Search, Edit, EyeOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { useDebounce } from "@/hooks";
import Pagination from "@/components/tables/Pagination";
import { handleExportExcelUsers } from "@/lib/excel";
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";

export default function UsersPage() {
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [roleFilter, setRoleFilter] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [genderFilter, setGenderFilter] = useState<"male" | "female" | "other" | "all">("all");
  const [warehouseFilter, setWarehouseFilter] = useState<number>(0);

  const [resetPasswordUserId, setResetPasswordUserId] = useState<number | null>(null);
  const [resetPasswordUserName, setResetPasswordUserName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPasswordValidationError, setShowPasswordValidationError] = useState(false);
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [lockUserId, setLockUserId] = useState<number | null>(null);
  const [lockStatus, setLockStatus] = useState<"active" | "inactive" | "locked">("active");
  const [lockAction, setLockAction] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [deleteUserName, setDeleteUserName] = useState("");
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const { data: warehousesResponseWrapper } = useWarehouses();
  const warehouses = warehousesResponseWrapper?.data as unknown as Warehouse[] || [];
  const { data: rolesResponseWrapper } = useRoles();
  const roles = rolesResponseWrapper?.data as unknown as any[] || [];
  const deleteUser = useDeleteUser();
  const changePassword = useChangeUserPassword();
  const updateStatus = useUpdateUserStatus();

  // Fetch users & warehouses
  const { data: responseWrapper, isLoading, error } = useUsers({
    page,
    limit,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(genderFilter !== "all" && { gender: genderFilter }),
    ...(roleFilter && typeof roleFilter === "number" && { roleId: roleFilter }),
    ...(warehouseFilter && typeof warehouseFilter === "number" && { warehouseId: warehouseFilter }),
  });
  const response = responseWrapper as unknown as ApiResponse<User[]>;
  const users = response?.data || [];
  const paginationMeta = response?.meta;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, roleFilter, genderFilter, warehouseFilter]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const allUsers = response?.data || [];
    return {
      total: allUsers.length,
      active: allUsers.filter(u => u.status === "active").length,
      inactive: allUsers.filter(u => u.status === "inactive").length,
      locked: allUsers.filter(u => u.status === "locked").length,
    };
  }, [response?.data]);

  

  const handleResetPassword = (userId: number, userName: string) => {
    setResetPasswordUserId(userId);
    setResetPasswordUserName(userName);
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordModal(true);
  };

  const handleConfirmResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim() || resetPasswordUserId === null) {
      setShowPasswordValidationError(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setShowPasswordValidationError(true);
      return;
    }

    try {
      await changePassword.mutateAsync({
        id: resetPasswordUserId,
        password: newPassword,
      });
      setShowPasswordModal(false);
      setShowPasswordValidationError(false);
      setNewPassword("");
      setConfirmPassword("");
      setResetPasswordUserId(null);
    } catch (error) {
      console.error("Password change error:", error);
    }
  };

  const confirmToggleLock = async () => {
    if (lockUserId === null) return;
    try {
      await updateStatus.mutateAsync({
        id: lockUserId,
        data: { status: lockStatus },
      });
      setShowLockConfirm(false);
    } catch (error) {
      console.error("Status change error:", error);
      setShowLockConfirm(false);
    }
  };

  const getStatusBadgeColor = (status: UserStatus): BadgeColor => {
    const colors: Record<UserStatus, BadgeColor> = {
      active: "green",
      inactive: "gray",
      locked: "red",
    };
    return colors[status];
  };

  const getGenderLabel = (gender?: "male" | "female" | "other") => {
    if (!gender) return "—";
    const labels = {
      male: "Nam",
      female: "Nữ",
      other: "Khác",
    };
    return labels[gender];
  };

  const getStatusLabel = (status: UserStatus) => {
    const labels: Record<UserStatus, string> = {
      active: "Hoạt động",
      inactive: "Ngưng hoạt động",
      locked: "Bị khóa",
    };
    return labels[status];
  };

  const getGenderFilterLabel = (gender: "male" | "female" | "other" | "all") => {
    if (gender === "all") return null;
    const labels = {
      male: "Nam",
      female: "Nữ",
      other: "Khác",
    };
    return labels[gender];
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setRoleFilter(0);
    setStatusFilter("all");
    setGenderFilter("all");
    setWarehouseFilter(0);
  };

  // Kiểm tra nếu filter active - chỉ count khi roleFilter > 0 (có vai trò được chọn)
  const hasActiveFilters = searchTerm || statusFilter !== "all" || roleFilter > 0 || genderFilter !== "all" || warehouseFilter > 0;

  // Role badge color based on roleId - matching seed.ts roles
  const getRoleBadgeColor = (roleId: number): BadgeColor => {
    const colors: Record<number, BadgeColor> = {
      1: "red",           // Admin - Nổi bật với đỏ
      2: "purple",        // Kế toán - Tím
      3: "green",         // Quản lý kho - Xanh
      4: "yellow",        // Nhân viên kho - Vàng
      5: "orange",        // Quản lý sản xuất - Cam
      6: "blue",          // Nhân viên bán hàng - Xanh dương
      7: "gray",          // Nhân viên giao hàng - Xám
    };
    return colors[roleId] || "gray";
  };

  // Check if user is admin
  const isAdmin = (user: User) => user.role?.roleKey === 'admin';

  // Format last login
  const getLastLoginLabel = (lastLogin?: string | Date) => {
    if (!lastLogin) return "Chưa login";
    const date = typeof lastLogin === 'string' ? new Date(lastLogin) : lastLogin;
    return formatDistanceToNow(date, { addSuffix: true, locale: vi });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleDelete = (userId: number, userName: string) => {
    setDeleteUserId(userId);
    setDeleteUserName(userName);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUserAction = async () => {
    if (deleteUserId === null) return;
    try {
      await deleteUser.mutateAsync(deleteUserId);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Delete user error:", error);
      setShowDeleteConfirm(false);
    }
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/10">
        <p className="text-red-800 dark:text-red-200">
          Lỗi khi tải danh sách nhân viên: {(error as any)?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quản lý Nhân viên
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Quản lý thông tin nhân viên và tài khoản trong hệ thống
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="smm"
            onClick={() => handleExportExcelUsers(users)}
            disabled={users.length === 0}
          >
            <Download className="mr-2 h-5 w-5" />
            Xuất Excel
          </Button>

          <Can permission="create_user">
            <Link href="/users/create">
              <Button variant="primary" size="smm">
                <Plus className="mr-2 h-5 w-5" />
                Thêm nhân viên
              </Button>
            </Link>
          </Can>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Tổng nhân viên */}
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-blue-50 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer dark:border-gray-800 dark:from-gray-900 dark:to-blue-950">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-0" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tổng Nhân Viên
              </p>
              <p className="mt-3 text-3xl font-bold text-blue-600 dark:text-blue-400 transition-all duration-300 group-hover:scale-110">
                {stats.total}
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative border-2 border-blue-500 rounded-xl p-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                <Users className="h-7 w-7 text-blue-600 dark:text-blue-400" strokeWidth={2} />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-900">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Tất cả nhân viên
            </p>
          </div>
        </div>

        {/* Card 2: Đang hoạt động */}
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-green-50 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer dark:border-gray-800 dark:from-gray-900 dark:to-green-950">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -z-0" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Đang Hoạt Động
              </p>
              <p className="mt-3 text-3xl font-bold text-green-600 dark:text-green-400 transition-all duration-300 group-hover:scale-110">
                {stats.active}
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative border-2 border-green-500 rounded-xl p-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                <UserCheck className="h-7 w-7 text-green-600 dark:text-green-400" strokeWidth={2} />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-900">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Hoạt động bình thường
            </p>
          </div>
        </div>

        {/* Card 3: Ngưng hoạt động */}
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-amber-50 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer dark:border-gray-800 dark:from-gray-900 dark:to-amber-950">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -z-0" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Ngưng Hoạt Động
              </p>
              <p className="mt-3 text-3xl font-bold text-amber-600 dark:text-amber-400 transition-all duration-300 group-hover:scale-110">
                {stats.inactive}
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative border-2 border-amber-500 rounded-xl p-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                <UserX className="h-7 w-7 text-amber-600 dark:text-amber-400" strokeWidth={2} />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-900">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Tạm dừng làm việc
            </p>
          </div>
        </div>

        {/* Card 4: Bị khóa */}
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-red-50 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer dark:border-gray-800 dark:from-gray-900 dark:to-red-950">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -z-0" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Bị Khóa
              </p>
              <p className="mt-3 text-3xl font-bold text-red-600 dark:text-red-400 transition-all duration-300 group-hover:scale-110">
                {stats.locked}
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative border-2 border-red-500 rounded-xl p-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                <Lock className="h-7 w-7 text-red-600 dark:text-red-400" strokeWidth={2} />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-900">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Tài khoản bị khóa
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {/* Search */}
        <div>
          <label
            htmlFor="status"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Tìm kiếm
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              value={searchTerm}
              autoComplete="off"
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus={false}
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              placeholder="Tìm theo tên, mã NV, email..."
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label
            htmlFor="status"
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
            <option value="locked">Bị khóa</option>
          </select>
        </div>

        {/* Gender Filter */}
        <div>
          <label
            htmlFor="gender"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Giới tính
          </label>
          <select
            id="gender"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as any)}
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">Tất cả giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>

        {/* Role Filter */}
        <div>
          <label
            htmlFor="role"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Vai trò
          </label>
          <SearchableSelect
            options={[
              { value: "", label: "Tất cả vai trò" },
              ...roles.map((r) => ({
                value: String(r.id),
                label: r.roleName,
              })),
            ]}
            value={roleFilter === 0 ? "" : String(roleFilter)}
            onChange={(value) => {
              if (value === "") {
                setRoleFilter(0);
              } else {
                setRoleFilter(Number(value));
              }
            }}
            placeholder="Tìm kiếm vai trò..."
            isClearable={false}
          />
        </div>

        {/* Warehouse Filter */}
        <div>
          <label
            htmlFor="warehouse"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Kho
          </label>
          <SearchableSelect
            options={[
              { value: "", label: "Tất cả kho" },
              ...warehouses.map((w: any) => ({
                value: String(w.id),
                label: `${w.warehouseName} (${w.warehouseCode})`,
              })),
            ]}
            value={warehouseFilter === 0 ? "" : String(warehouseFilter)}
            onChange={(value) => {
              if (value === "") {
                setWarehouseFilter(0);
              } else {
                setWarehouseFilter(Number(value));
              }
            }}
            placeholder="Tìm kiếm kho..."
            isClearable={false}
          />
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
                setPage(1);
              }}
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
              <option value={100}>100 / trang</option>
            </select>
          </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Bộ lọc:
            </span>

            {searchTerm && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                🔍 "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="hover:text-blue-900 dark:hover:text-blue-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {statusFilter !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                Trạng thái: {getStatusLabel(statusFilter)}
                <button
                  onClick={() => setStatusFilter("all")}
                  className="hover:text-amber-900 dark:hover:text-amber-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {genderFilter !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-3 py-1 text-sm text-pink-700 dark:bg-pink-900/20 dark:text-pink-400">
                Giới tính: {getGenderFilterLabel(genderFilter)}
                <button
                  onClick={() => setGenderFilter("all")}
                  className="hover:text-pink-900 dark:hover:text-pink-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {roleFilter > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                Vai trò: {roles.find((r) => r.id === roleFilter)?.roleName || `Vai trò ${roleFilter}`}
                <button
                  onClick={() => setRoleFilter(0)}
                  className="hover:text-purple-900 dark:hover:text-purple-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {warehouseFilter > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                Kho: {warehouses.find((w: any) => w.id === warehouseFilter)?.warehouseName || `Kho ${warehouseFilter}`}
                <button
                  onClick={() => setWarehouseFilter(0)}
                  className="hover:text-green-900 dark:hover:text-green-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <RotateCcw className="h-3 w-3" />
              Xóa tất cả
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <Users className="mb-4 h-12 w-12" />
            <p className="text-sm">Không tìm thấy nhân viên nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Nhân viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Mã NV
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Điện thoại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Kho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Đăng nhập cuối
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {user.avatarUrl ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.avatarUrl}
                            alt={user.fullName}
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <span className="text-sm font-medium">
                              {user.fullName?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <Link
                          href={`/users/${user.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                        >
                          {user.fullName}
                        </Link>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {getGenderLabel(user.gender)}
                          {user.dateOfBirth && ` • ${new Date(user.dateOfBirth).toLocaleDateString('vi-VN')}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {user.employeeCode}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {user.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {user.phone || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {user.role ? (
                      <div className="flex items-center gap-2">
                        <Badge color={getRoleBadgeColor(user.roleId)}>{user.role.roleName}</Badge>
                        {isAdmin(user) && (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400"/>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {user.warehouse ? (
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.warehouse.warehouseName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user.warehouse.warehouseCode}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <Badge color={getStatusBadgeColor(user.status)}>
                      {getStatusLabel(user.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    <div>
                      <p className="text-sm">{getLastLoginLabel(user.lastLogin)}</p>
                      {user.lastLogin && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(user.lastLogin).toLocaleDateString('vi-VN')}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/users/${user.id}`}
                        className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        title="Xem"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      {/* Dropdown Menu */}
                      <div className="relative z-50">
                        <button
                          className="dropdown-toggle rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                          title="Thêm hành động"
                        >
                          <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </button>

                        <Dropdown
                          isOpen={openDropdown === user.id}
                          onClose={() => setOpenDropdown(null)}
                          className="w-48"
                        >
                          {/* Edit */}
                          <Can permission="update_user">
                            <DropdownItem
                              tag="a"
                              href={`/users/${user.id}/edit`}
                              onItemClick={() => setOpenDropdown(null)}
                              className="dark:hover:bg-gray-700 dark:text-gray-300"
                            >
                              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                <Edit className="h-4 w-4" />
                                <span>Chỉnh sửa</span>
                              </div>
                            </DropdownItem>
                          </Can>

                          {/* Reset Password */}
                          <Can permission="update_user">
                            <DropdownItem
                              onItemClick={() => {
                                handleResetPassword(user.id, user.fullName);
                                setOpenDropdown(null);
                              }}
                              className="dark:hover:bg-gray-700 dark:text-gray-300"
                            >
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <Key className="h-4 w-4" />
                                <span>Đổi mật khẩu</span>
                              </div>
                            </DropdownItem>
                          </Can>

                          {/* Status Actions */}
                          <Can permission="update_user">
                            <DropdownItem
                              onItemClick={() => {
                                setLockUserId(user.id);
                                setLockStatus("active");
                                setLockAction("Kích hoạt");
                                setShowLockConfirm(true);
                                setOpenDropdown(null);
                              }}
                              className={`dark:hover:bg-gray-700 dark:text-gray-300 ${user.status === "active" ? "opacity-50 cursor-not-allowed" : ""}`}
                              disabled={user.status === "active"}
                            >
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <UserCheck className="h-4 w-4" />
                                <span>Kích hoạt</span>
                              </div>
                            </DropdownItem>

                            <DropdownItem
                              onItemClick={() => {
                                setLockUserId(user.id);
                                setLockStatus("inactive");
                                setLockAction("Vô hiệu hóa");
                                setShowLockConfirm(true);
                                setOpenDropdown(null);
                              }}
                              className={`dark:hover:bg-gray-700 dark:text-gray-300 ${user.status === "inactive" ? "opacity-50 cursor-not-allowed" : ""}`}
                              disabled={user.status === "inactive"}
                            >
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <UserX className="h-4 w-4" />
                                <span>Vô hiệu hóa</span>
                              </div>
                            </DropdownItem>

                            <DropdownItem
                              onItemClick={() => {
                                setLockUserId(user.id);
                                setLockStatus("locked");
                                setLockAction("Khóa tài khoản");
                                setShowLockConfirm(true);
                                setOpenDropdown(null);
                              }}
                              className={`dark:hover:bg-gray-700 dark:text-gray-300 ${user.status === "locked" ? "opacity-50 cursor-not-allowed" : ""}`}
                              disabled={user.status === "locked"}
                            >
                              <div className="flex items-center gap-2 text-orange-500 dark:text-orange-300">
                                <Lock className="h-4 w-4" />
                                <span>Khóa tài khoản</span>
                              </div>
                            </DropdownItem>
                          </Can>

                          {/* Delete */}
                          <Can permission="delete_user">
                            <div className="border-t border-gray-200 dark:border-gray-700">
                              <DropdownItem
                                onClick={() => {
                                  handleDelete(user.id, user.fullName);
                                  setOpenDropdown(null);
                                }}
                                className="dark:hover:bg-gray-700 dark:text-gray-300"
                              >
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                  <Trash2 className="h-4 w-4" />
                                  <span>Xóa</span>
                                </div>
                              </DropdownItem>
                            </div>
                          </Can>
                        </Dropdown>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
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
            <span className="font-medium">{paginationMeta.total}</span> nhân viên
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

      {/* Password Validation Error */}
      {showPasswordValidationError && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-red-100 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center gap-3">
          <div>⚠️</div>
          <div>Vui lòng nhập mật khẩu mới</div>
          <button
            onClick={() => setShowPasswordValidationError(false)}
            className="ml-auto text-red-600 hover:text-red-700 dark:text-red-400"
          >
            ✕
          </button>
        </div>
      )}

      {/* Password Validation Error */}
      {showPasswordValidationError && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-red-100 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center gap-3">
          <div>⚠️</div>
          <div>
            {newPassword !== confirmPassword && newPassword && confirmPassword
              ? "Mật khẩu xác nhận không khớp"
              : "Vui lòng nhập đầy đủ mật khẩu mới và xác nhận"}
          </div>
          <button
            onClick={() => setShowPasswordValidationError(false)}
            className="ml-auto text-red-600 hover:text-red-700 dark:text-red-400"
          >
            ✕
          </button>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Đổi mật khẩu nhân viên
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Nhập mật khẩu mới cho {resetPasswordUserName}
            </p>

            <div className="mt-6 space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mật khẩu mới
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoFocus={showPasswordModal}
                    placeholder="Nhập mật khẩu mới"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Xác nhận mật khẩu
                </label>
                <div className="relative mt-1">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Xác nhận mật khẩu"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {newPassword !== confirmPassword && newPassword && confirmPassword && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Mật khẩu xác nhận không khớp
                </p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmResetPassword}
                disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword || changePassword.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {changePassword.isPending ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lock User Confirmation */}
      <ConfirmDialog
        isOpen={showLockConfirm}
        onClose={() => setShowLockConfirm(false)}
        onConfirm={confirmToggleLock}
        title={lockAction}
        message={`Bạn có chắc chắn muốn ${lockAction.toLowerCase()} tài khoản này? Trạng thái sẽ thay đổi thành "${
          lockStatus === "active" ? "Hoạt động" : lockStatus === "inactive" ? "Ngưng hoạt động" : "Bị khóa"
        }".`}
        confirmText={lockAction}
        cancelText="Hủy"
        variant={lockStatus === "locked" ? "danger" : lockStatus === "active" ? "info" : "warning"}
      />

      {/* Delete User Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteUserAction}
        title="Xóa nhân viên"
        message={`Bạn có chắc chắn muốn xóa nhân viên "${deleteUserName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        isLoading={deleteUser.isPending}
      />
    </div>
  );
}
