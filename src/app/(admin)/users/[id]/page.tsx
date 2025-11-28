"use client";

/**
 * User Detail Page
 * View user details with actions to update status and avatar
 */

import React, { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  useUser,
  useUpdateUserStatus,
  useUploadAvatar,
  useDeleteAvatar,
  useDeleteUser,
} from "@/hooks/api/useUsers";
import { Can } from "@/components/auth";
import UserStatusBadge, {
  GenderDisplay,
  LastLoginDisplay,
  UserAvatar,
} from "@/components/features/users/UserStatus";
import type { UserStatus } from "@/types";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Upload,
  UserCheck,
  UserX,
  Lock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Warehouse,
  Shield,
  Clock,
} from "lucide-react";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);

  const { data, isLoading } = useUser(id);
  const updateStatus = useUpdateUserStatus();
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();
  const deleteUser = useDeleteUser();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>("active");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = data?.data;

  const handleStatusChange = async () => {
    try {
      await updateStatus.mutateAsync({ id, data: { status: selectedStatus } });
      setShowStatusModal(false);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước file không được vượt quá 5MB");
      return;
    }

    // Validate file type
    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type)) {
      alert("Chỉ hỗ trợ file ảnh định dạng JPEG, PNG, JPG hoặc WEBP");
      return;
    }

    try {
      await uploadAvatar.mutateAsync({ id, file });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ảnh đại diện?")) return;

    try {
      await deleteAvatar.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete avatar:", error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa nhân viên "${user?.full_name}"?`)) return;

    try {
      await deleteUser.mutateAsync(id);
      router.push("/users");
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Không tìm thấy nhân viên</p>
        <Link href="/users" className="mt-4 text-blue-600 hover:text-blue-700">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/users"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Thông tin nhân viên
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {user.employee_code} - {user.full_name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Can permission="update_user">
            <Link
              href={`/users/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Pencil className="h-4 w-4" />
              Chỉnh sửa
            </Link>
          </Can>

          <Can permission="delete_user">
            <button
              onClick={handleDelete}
              disabled={deleteUser.isPending}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:bg-gray-800 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
              Xóa
            </button>
          </Can>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Avatar & Quick Actions */}
        <div className="space-y-6">
          {/* Avatar Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex flex-col items-center">
              <UserAvatar
                avatarUrl={user.avatar_url}
                fullName={user.full_name}
                size="xl"
                showOnlineStatus={false}
              />

              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                {user.full_name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.employee_code}</p>

              <div className="mt-3">
                <UserStatusBadge status={user.status} showIcon />
              </div>

              <Can permission="update_user">
                <div className="mt-6 flex w-full flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadAvatar.isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <Upload className="h-4 w-4" />
                    {uploadAvatar.isPending ? "Đang tải..." : "Tải ảnh lên"}
                  </button>

                  {user.avatar_url && (
                    <button
                      onClick={handleDeleteAvatar}
                      disabled={deleteAvatar.isPending}
                      className="text-sm text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400"
                    >
                      {deleteAvatar.isPending ? "Đang xóa..." : "Xóa ảnh"}
                    </button>
                  )}
                </div>
              </Can>
            </div>
          </div>

          {/* Status Actions */}
          <Can permission="update_user">
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                Thay đổi trạng thái
              </h4>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setSelectedStatus("active");
                    setShowStatusModal(true);
                  }}
                  disabled={user.status === "active"}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-300 bg-white px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-800 dark:bg-gray-800 dark:hover:bg-green-900/20"
                >
                  <UserCheck className="h-4 w-4" />
                  Kích hoạt
                </button>

                <button
                  onClick={() => {
                    setSelectedStatus("inactive");
                    setShowStatusModal(true);
                  }}
                  disabled={user.status === "inactive"}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <UserX className="h-4 w-4" />
                  Vô hiệu hóa
                </button>

                <button
                  onClick={() => {
                    setSelectedStatus("locked");
                    setShowStatusModal(true);
                  }}
                  disabled={user.status === "locked"}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:bg-gray-800 dark:hover:bg-red-900/20"
                >
                  <Lock className="h-4 w-4" />
                  Khóa tài khoản
                </button>
              </div>
            </div>
          </Can>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Thông tin cá nhân
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Số điện thoại</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.phone || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ngày sinh</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.date_of_birth
                        ? new Date(user.date_of_birth).toLocaleDateString("vi-VN")
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-5 w-5 text-gray-400">⚧</div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Giới tính</p>
                    <div className="font-medium">
                      <GenderDisplay gender={user.gender} />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:col-span-2">
                  <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Địa chỉ</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.address || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Thông tin công việc
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Briefcase className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mã nhân viên</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.employee_code}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Vai trò</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.role?.role_name || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:col-span-2">
                  <Warehouse className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Kho làm việc</p>
                    {user.warehouse ? (
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.warehouse.warehouse_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.warehouse.warehouse_code}
                        </p>
                      </div>
                    ) : (
                      <p className="font-medium text-gray-900 dark:text-white">—</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Đăng nhập lần cuối
                    </p>
                    <div className="font-medium text-gray-900 dark:text-white">
                      <LastLoginDisplay lastLogin={user.last_login} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Thông tin hệ thống
              </h3>

              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Ngày tạo:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(user.created_at).toLocaleString("vi-VN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Cập nhật lần cuối:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(user.updated_at).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Confirmation Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Xác nhận thay đổi trạng thái
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Bạn có chắc chắn muốn thay đổi trạng thái tài khoản thành{" "}
              <strong>
                {
                  { active: "Hoạt động", inactive: "Ngưng hoạt động", locked: "Bị khóa" }[
                    selectedStatus
                  ]
                }
              </strong>
              ?
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                disabled={updateStatus.isPending}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={handleStatusChange}
                disabled={updateStatus.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updateStatus.isPending ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
