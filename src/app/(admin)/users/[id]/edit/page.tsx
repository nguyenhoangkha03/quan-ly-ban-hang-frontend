"use client";

/**
 * Edit User Page
 * Update user information
 */

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser, useUpdateUser } from "@/hooks/api/useUsers";
import UserForm from "@/components/features/users/UserForm";
import type { UpdateUserDto } from "@/types";
import { ArrowLeft, UserCog } from "lucide-react";

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);

  const { data, isLoading } = useUser(id);
  const updateUser = useUpdateUser();

  const user = data?.data;

  const handleSubmit = async (formData: UpdateUserDto) => {
    try {
      await updateUser.mutateAsync({ id, data: formData });
      router.push(`/users/${id}`);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleCancel = () => {
    router.push(`/users/${id}`);
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
      <div className="flex items-center gap-3">
        <Link
          href={`/users/${id}`}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
            <UserCog className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Chỉnh sửa thông tin nhân viên
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {user.employee_code} - {user.full_name}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <UserForm
            mode="edit"
            initialData={user}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={updateUser.isPending}
          />
        </div>
      </div>

      {/* Warning */}
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-300">
            Lưu ý khi chỉnh sửa
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-yellow-800 dark:text-yellow-400">
            <li>• Không thể thay đổi mã nhân viên sau khi đã tạo</li>
            <li>• Thay đổi vai trò có thể ảnh hưởng đến quyền truy cập của nhân viên</li>
            <li>• Để thay đổi mật khẩu, vui lòng sử dụng chức năng "Đổi mật khẩu"</li>
            <li>• Để thay đổi trạng thái tài khoản, vui lòng sử dụng trang chi tiết nhân viên</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
