/**
 * User Form Component
 * Form for creating and updating user accounts
 */

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRoles } from "@/hooks/api/useRoles";
import { useWarehouses } from "@/hooks/api/useWarehouses";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormData,
  type UpdateUserFormData,
} from "@/lib/validations/user.schema";
import type { User } from "@/types";
import { Eye, EyeOff } from "lucide-react";

interface UserFormProps {
  initialData?: Partial<User>;
  onSubmit: (data: any) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  mode?: "create" | "edit";
}

export default function UserForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  mode = "create",
}: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRoleNeedsWarehouse, setSelectedRoleNeedsWarehouse] = useState(false);

  // Fetch roles and warehouses
  const { data: rolesData } = useRoles({ status: "active" });
  const { data: warehousesData } = useWarehouses({ status: "active" });

  const roles = rolesData?.data || [];
  const warehouses = warehousesData?.data || [];

  // Form validation schema based on mode
  const schema = mode === "create" ? createUserSchema : updateUserSchema;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          ...initialData,
          email: initialData.email,
          fullName: initialData.full_name,
          phone: initialData.phone || "",
          address: initialData.address || "",
          gender: initialData.gender,
          dateOfBirth: initialData.date_of_birth
            ? new Date(initialData.date_of_birth).toISOString().split("T")[0]
            : undefined,
          roleId: initialData.role_id,
          warehouseId: initialData.warehouse_id,
          status: initialData.status,
        }
      : {
          status: "active",
        },
  });

  const selectedRoleId = watch("roleId");

  // Check if selected role needs warehouse assignment
  useEffect(() => {
    if (selectedRoleId) {
      const selectedRole = roles.find((r) => r.id === selectedRoleId);
      // Typically warehouse staff roles need warehouse assignment
      const needsWarehouse =
        selectedRole?.role_key?.includes("warehouse") ||
        selectedRole?.role_name?.toLowerCase().includes("kho");
      setSelectedRoleNeedsWarehouse(needsWarehouse);

      // Clear warehouse if not needed
      if (!needsWarehouse) {
        setValue("warehouseId", undefined);
      }
    }
  }, [selectedRoleId, roles, setValue]);

  const handleFormSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    // Transform data to match API DTO
    const submitData: any = {
      ...data,
      full_name: data.fullName,
      date_of_birth: data.dateOfBirth || undefined,
      role_id: data.roleId,
      warehouse_id: data.warehouseId,
    };

    // Remove frontend-only fields
    delete submitData.fullName;
    delete submitData.dateOfBirth;
    delete submitData.roleId;
    delete submitData.warehouseId;

    // For create mode, remove confirmPassword
    if (mode === "create") {
      delete submitData.confirmPassword;
    }

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Thông tin cơ bản
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Employee Code */}
          {mode === "create" && (
            <div>
              <label
                htmlFor="employeeCode"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Mã nhân viên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="employeeCode"
                {...register("employeeCode")}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="VD: NV001"
              />
              {errors.employeeCode && (
                <p className="mt-1 text-sm text-red-600">{errors.employeeCode.message}</p>
              )}
            </div>
          )}

          {/* Full Name */}
          <div className={mode === "create" ? "" : "sm:col-span-2"}>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              {...register("fullName")}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="VD: Nguyễn Văn A"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              {...register("email")}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Số điện thoại
            </label>
            <input
              type="tel"
              id="phone"
              {...register("phone")}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="0901234567"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Giới tính
            </label>
            <select
              id="gender"
              {...register("gender")}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label
              htmlFor="dateOfBirth"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Ngày sinh
            </label>
            <input
              type="date"
              id="dateOfBirth"
              {...register("dateOfBirth")}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
            )}
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Địa chỉ
            </label>
            <textarea
              id="address"
              {...register("address")}
              rows={2}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="Nhập địa chỉ"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Password (Create mode only) */}
      {mode === "create" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Thông tin đăng nhập
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  {...register("password")}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và số
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  {...register("confirmPassword")}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Nhập lại mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Role & Warehouse */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Phân quyền & Kho làm việc
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Role */}
          <div>
            <label
              htmlFor="roleId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Vai trò <span className="text-red-500">*</span>
            </label>
            <select
              id="roleId"
              {...register("roleId", { valueAsNumber: true })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Chọn vai trò</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.role_name}
                </option>
              ))}
            </select>
            {errors.roleId && (
              <p className="mt-1 text-sm text-red-600">{errors.roleId.message}</p>
            )}
          </div>

          {/* Warehouse */}
          <div>
            <label
              htmlFor="warehouseId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Kho làm việc {selectedRoleNeedsWarehouse && <span className="text-red-500">*</span>}
            </label>
            <select
              id="warehouseId"
              {...register("warehouseId", { valueAsNumber: true })}
              disabled={!selectedRoleNeedsWarehouse}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-900"
            >
              <option value="">
                {selectedRoleNeedsWarehouse ? "Chọn kho" : "Không áp dụng"}
              </option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.warehouse_name} ({warehouse.warehouse_code})
                </option>
              ))}
            </select>
            {errors.warehouseId && (
              <p className="mt-1 text-sm text-red-600">{errors.warehouseId.message}</p>
            )}
            {selectedRoleNeedsWarehouse && (
              <p className="mt-1 text-xs text-gray-500">
                Nhân viên kho cần được gán vào một kho cụ thể
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Trạng thái
            </label>
            <select
              id="status"
              {...register("status")}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Ngưng hoạt động</option>
              <option value="locked">Bị khóa</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && (
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {mode === "create" ? "Tạo nhân viên" : "Cập nhật"}
        </button>
      </div>
    </form>
  );
}
