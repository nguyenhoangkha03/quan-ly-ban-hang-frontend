"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useUsers, useDeleteUser } from "@/hooks/api";
import { Can } from "@/components/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { User, UserStatus } from "@/types";
import { Eye, Pencil, Trash2, Users, UserCheck, UserX, Lock } from "lucide-react";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [genderFilter, setGenderFilter] = useState<"male" | "female" | "other" | "all">("all");

  // Fetch users
  const { data: response, isLoading, error } = useUsers();
  const deleteUser = useDeleteUser();

  // Filter users
  const users = React.useMemo(() => {
    if (!response?.data) return [];

    return response.data.filter((user) => {
      const matchesSearch =
        (user.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.employeeCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "all" || user.roleId === roleFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      const matchesGender = genderFilter === "all" || user.gender === genderFilter;

      return matchesSearch && matchesRole && matchesStatus && matchesGender;
    });
  }, [response?.data, searchTerm, roleFilter, statusFilter, genderFilter]);

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

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân viên "${name}"?`)) {
      try {
        await deleteUser.mutateAsync(id);
      } catch (error) {
        console.error("Delete user failed:", error);
      }
    }
  };

  // Status badge colors
  const getStatusBadgeColor = (status: UserStatus) => {
    const colors: Record<UserStatus, string> = {
      active: "green",
      inactive: "gray",
      locked: "red",
    };
    return colors[status];
  };

  // Status labels
  const getStatusLabel = (status: UserStatus) => {
    const labels: Record<UserStatus, string> = {
      active: "Hoạt động",
      inactive: "Ngưng hoạt động",
      locked: "Bị khóa",
    };
    return labels[status];
  };

  // Gender labels
  const getGenderLabel = (gender?: "male" | "female" | "other") => {
    if (!gender) return "—";
    const labels = {
      male: "Nam",
      female: "Nữ",
      other: "Khác",
    };
    return labels[gender];
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
    <div className="space-y-6">
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

        <Can permission="create_user">
          <Link
            href="/users/create"
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
            Thêm nhân viên
          </Link>
        </Can>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Tổng nhân viên
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Đang hoạt động
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.active}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-900/20">
                <UserX className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Ngưng hoạt động
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.inactive}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Bị khóa
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.locked}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              placeholder="Tìm theo tên, mã NV, email..."
            />
          </div>
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
            <option value="locked">Bị khóa</option>
          </select>
        </div>

        {/* Gender Filter */}
        <div>
          <label htmlFor="gender" className="sr-only">
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

        {/* Role Filter - You need to implement useRoles hook */}
        <div>
          <label htmlFor="role" className="sr-only">
            Vai trò
          </label>
          <select
            id="role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">Tất cả vai trò</option>
            {/* Add roles options here */}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
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
          <Table>
            <TableHeader>
              <TableRow>
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
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Thao tác
                </th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="px-6 py-4">
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
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {user.employeeCode}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {user.email}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {user.phone || <span className="text-gray-400">—</span>}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm">
                    {user.role ? (
                      <Badge color="purple">{user.role.roleName}</Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
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
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-6 py-4 text-sm">
                    <Badge color={getStatusBadgeColor(user.status)}>
                      {getStatusLabel(user.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/users/${user.id}`}
                        className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        title="Xem"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      <Can permission="update_user">
                        <Link
                          href={`/users/${user.id}/edit`}
                          className="rounded p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="Sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Can>

                      <Can permission="delete_user">
                        <button
                          onClick={() => handleDelete(user.id, user.fullName)}
                          className="rounded p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
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
      {users.length > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Hiển thị {users.length} nhân viên
          {(roleFilter !== "all" || statusFilter !== "all" || genderFilter !== "all" || searchTerm) &&
            ` (đã lọc từ ${response?.data?.length || 0} nhân viên)`}
        </div>
      )}
    </div>
  );
}