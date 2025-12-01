"use client";

/**
 * Create User Page
 * Form to create new user account
 */

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCreateUser } from "@/hooks/api/useUsers";
import UserForm from "@/components/users/UserForm";
import type { CreateUserDto } from "@/types";
import { ArrowLeft, UserPlus } from "lucide-react";

export default function CreateUserPage() {
  const router = useRouter();
  const createUser = useCreateUser();

  const handleSubmit = async (formData: CreateUserDto) => {
    try {
      await createUser.mutateAsync(formData);
      router.push("/users");
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const handleCancel = () => {
    router.push("/users");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/users"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
            <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Thêm nhân viên mới
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Tạo tài khoản nhân viên mới trong hệ thống
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <UserForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={createUser.isPending}
          />
        </div>
      </div>

      {/* Guidelines */}
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300">
            Lưu ý khi tạo tài khoản
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-400">
            <li>• Mã nhân viên phải duy nhất và chỉ chứa chữ in hoa, số và dấu gạch ngang</li>
            <li>• Email sẽ được sử dụng để đăng nhập vào hệ thống</li>
            <li>• Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số</li>
            <li>• Nhân viên kho cần được gán vào một kho làm việc cụ thể</li>
            <li>• Sau khi tạo, hệ thống sẽ gửi email thông báo đến nhân viên (nếu có cấu hình)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
