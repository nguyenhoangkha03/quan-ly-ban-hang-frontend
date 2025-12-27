"use client";

import React, { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  useUser,
  useUpdateUserStatus,
  useUploadAvatar,
  useDeleteAvatar,
  useDeleteUser,
  useChangeUserPassword,
  useActivityLogs,
  ActivityLogsResponse,
} from "@/hooks/api/useUsers";
import { Can } from "@/components/auth";
import UserStatusBadge, {
  GenderDisplay,
  LastLoginDisplay,
  UserAvatar,
} from "@/components/users/UserStatus";
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";
import ActivityTimeline from "@/components/users/ActivityTimeline";
import type { User, UserStatus } from "@/types";
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
  Key,
  Edit,
  EyeOff,
  Eye,
} from "lucide-react";
import Button from "@/components/ui/button/Button";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);

  const { data, isLoading } = useUser(id);
  const updateStatus = useUpdateUserStatus();
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();
  const deleteUser = useDeleteUser();
  const changePassword = useChangeUserPassword();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>("active");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"activity" | "attendance" | "salary" | "performance">("activity");
  const [showDeleteAvatarConfirm, setShowDeleteAvatarConfirm] = useState(false);
  const [showDeleteUserConfirm, setShowDeleteUserConfirm] = useState(false);
  const [avatarValidationError, setAvatarValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = data?.data as unknown as User;

  // Fetch activity logs
  const { data: activityLogsDataWrapper, isLoading: isLoadingLogs } = useActivityLogs(id);
  const activityLogsData = activityLogsDataWrapper as unknown as ActivityLogsResponse;

  const handleStatusChange = async () => {
    try {
      await updateStatus.mutateAsync({ id, data: { status: selectedStatus } });
      setShowStatusModal(false);
    } catch (error) {}
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setAvatarValidationError("Kích thước file không được vượt quá 5MB");
      return;
    }

    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type)) {
      setAvatarValidationError("Chỉ hỗ trợ file ảnh định dạng JPEG, PNG, JPG hoặc WEBP");
      return;
    }

    setAvatarValidationError(null);
    try {
      await uploadAvatar.mutateAsync({ id, file });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {}
  };

  const handleDeleteAvatar = async () => {
    setShowDeleteAvatarConfirm(true);
  };

  const confirmDeleteAvatar = async () => {
    try {
      await deleteAvatar.mutateAsync(id);
      setShowDeleteAvatarConfirm(false);
    } catch (error) {
      setShowDeleteAvatarConfirm(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteUserConfirm(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await deleteUser.mutateAsync(id);
      setShowDeleteUserConfirm(false);
      router.push("/users");
    } catch (error) {
      setShowDeleteUserConfirm(false);
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Thông tin nhân viên
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {user.employeeCode} - {user.fullName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="smm"
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
            Quay lại
          </Button>
          <Can permission="update_user">
            <Button
              size="smm"
              variant="gradient"
              onClick={() => setShowPasswordModal(true)}
            >
              <Key className="h-4 w-4" />
              Đổi mật khẩu
            </Button>
          </Can>

          <Can permission="update_user">
            <Button
              size="smm"
              variant="primary"
              onClick={() => router.push(`/users/${id}/edit`)}
            >
              <Edit className="h-4 w-4" />
              Chỉnh sửa
            </Button>
          </Can>

          <Can permission="delete_user">
            <Button
              size="smm"
              variant="danger"
              onClick={handleDelete}
              disabled={deleteUser.isPending}
            >
              <Trash2 className="h-4 w-4" />
              Xóa
            </Button>
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
                avatarUrl={user.avatarUrl}
                fullName={user.fullName}
                size="xl"
                showOnlineStatus={false}
              />

              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                {user.fullName}
              </h3>
              <div className="mt-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                {user.employeeCode}
              </div>

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

                  {user.avatarUrl && (
                    <button
                      onClick={handleDeleteAvatar}
                      disabled={deleteAvatar.isPending}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-600 dark:bg-red-800 dark:text-red-300 dark:hover:bg-red-700"
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
                      {user.dateOfBirth ? (
                        <span>
                          {new Date(user.dateOfBirth).toLocaleDateString("vi-VN")}
                          {" ("}
                          {Math.floor(
                            (new Date().getTime() - new Date(user.dateOfBirth).getTime()) /
                              (365.25 * 24 * 60 * 60 * 1000)
                          )}{" "}
                          tuổi)
                        </span>
                      ) : (
                        "—"
                      )}
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

                {/* CCCD Information */}
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">CCCD/ID</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.cccd || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ngày cấp CCCD</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.issuedAt
                        ? new Date(user.issuedAt).toLocaleDateString("vi-VN")
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:col-span-2">
                  <Briefcase className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nơi cấp CCCD</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.issuedBy || "—"}
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
                      {user.employeeCode}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Vai trò</p>
                    <p className="font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                      <Link href={`/roles/${user.role?.id}`}>
                        {user.role?.roleName || "—"}
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ngày tham gia</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:col-span-2">
                  <Warehouse className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Kho làm việc</p>
                    {user.warehouse ? (
                      <div>
                        <p className="font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                          <Link href={`/warehouses/${user.warehouse?.id}`}>
                            {user.warehouse.warehouseName|| "—"}
                          </Link>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.warehouse.warehouseCode}
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
                      <LastLoginDisplay lastLogin={user.lastLogin} />
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
                    {new Date(user.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Cập nhật lần cuối:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(user.updatedAt).toLocaleString("vi-VN")}
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

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Đổi mật khẩu nhân viên
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Nhập mật khẩu mới cho {user.fullName}
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
                    placeholder="Nhập mật khẩu mới"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
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
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
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
                onClick={async () => {
                  try {
                    await changePassword.mutateAsync({
                      id,
                      password: newPassword,
                    });
                    setShowPasswordModal(false);
                    setNewPassword("");
                    setConfirmPassword("");
                  } catch (error) {
                    console.error("Password change error:", error);
                  }
                }}
                disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword || changePassword.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {changePassword.isPending ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Related Data Tabs */}
      <div className="space-y-6">
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-8">
            <Can permission="view_attendance">
              <button
                onClick={() => setActiveTab("attendance")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "attendance"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Chấm công
              </button>
            </Can>

            <Can permission="view_salary">
              <button
                onClick={() => setActiveTab("salary")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "salary"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Lương & Thưởng
              </button>
            </Can>

            <button
              onClick={() => setActiveTab("activity")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "activity"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Nhật ký hoạt động
            </button>

            <button
              onClick={() => setActiveTab("performance")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "performance"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Hiệu suất
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          {/* Attendance Tab */}
          {activeTab === "attendance" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Chấm công
              </h3>
              <div className="rounded-lg bg-gray-50 p-6 text-center dark:bg-gray-800">
                <p className="text-gray-500 dark:text-gray-400">
                  Chức năng chấm công sẽ được triển khai
                </p>
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  (Cần fetch từ Attendance API với userId)
                </p>
              </div>
            </div>
          )}

          {/* Salary Tab */}
          {activeTab === "salary" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Lương & Thưởng
              </h3>
              <div className="rounded-lg bg-gray-50 p-6 text-center dark:bg-gray-800">
                <p className="text-gray-500 dark:text-gray-400">
                  Chức năng lương sẽ được triển khai
                </p>
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  (Cần fetch từ Salary API với userId - Nhạy cảm, chỉ Admin/HR/chính nhân viên xem)
                </p>
              </div>
            </div>
          )}

          {/* Activity Logs Tab */}
          {activeTab === "activity" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Nhật ký hoạt động
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activityLogsData?.meta?.total || 0} hành động
                </p>
              </div>
              <ActivityTimeline
                logs={activityLogsData?.data || []}
                isLoading={isLoadingLogs}
              />
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === "performance" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Hiệu suất
              </h3>
              <div className="rounded-lg bg-gray-50 p-6 text-center dark:bg-gray-800">
                <p className="text-gray-500 dark:text-gray-400">
                  Chức năng hiệu suất sẽ được triển khai
                </p>
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  (Tùy biến theo role: Sale → Đơn hàng, Thủ kho → Stock transactions, Giao hàng → Deliveries)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Avatar Validation Error Toast */}
      {avatarValidationError && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-red-100 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <div className="text-lg">⚠️</div>
            <div className="flex-1">
              <p className="font-medium">{avatarValidationError}</p>
            </div>
            <button
              onClick={() => setAvatarValidationError(null)}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Delete Avatar Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteAvatarConfirm}
        onClose={() => setShowDeleteAvatarConfirm(false)}
        onConfirm={confirmDeleteAvatar}
        title="Xóa ảnh đại diện"
        message="Bạn có chắc chắn muốn xóa ảnh đại diện của nhân viên này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        isLoading={deleteAvatar.isPending}
      />

      {/* Delete User Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteUserConfirm}
        onClose={() => setShowDeleteUserConfirm(false)}
        onConfirm={confirmDeleteUser}
        title="Xóa nhân viên"
        message={`Bạn có chắc chắn muốn xóa nhân viên "${user?.fullName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        isLoading={deleteUser.isPending}
      />
    </div>
  );
}