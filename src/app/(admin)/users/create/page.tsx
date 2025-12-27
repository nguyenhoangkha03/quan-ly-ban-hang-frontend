"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useCreateUser, useRoles, useWarehouses, useUploadAvatar } from "@/hooks/api";
import Button from "@/components/ui/button/Button";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { FormDatePicker } from "@/components/form/FormDatePicker";
import { createUserSchema } from "@/lib/validations/user.schema";
import type { CreateUserFormData } from "@/lib/validations/user.schema";
import { ApiResponse, Role, Warehouse } from "@/types";
import { ArrowLeft, Save, Eye, EyeOff, Upload, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";

export default function CreateUserPage() {
  const router = useRouter();
  const createUser = useCreateUser();
  const uploadAvatar = useUploadAvatar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<"idle" | "uploading" | "success" | "error">("idle");

  // Fetch roles and warehouses
  const { data: rolesData } = useRoles({ status: "active", limit: 1000 });
  const { data: warehousesData } = useWarehouses({ status: "active", limit: 1000 });

  const roles = ((rolesData as unknown as ApiResponse<Role[]>)?.data || []);
  const warehouses = ((warehousesData as unknown as ApiResponse<Warehouse[]>)?.data || []);

  // Form
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      employeeCode: "",
      fullName: "",
      email: "",
      phone: "",
      gender: "male",
      dateOfBirth: "",
      address: "",
      cccd: "",
      issuedAt: "",
      issuedBy: "",
      password: "",
      confirmPassword: "",
      roleId: 0,
      warehouseId: 0,
      status: "active",
    },
  });

  const selectedRoleId = watch("roleId");
  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const needsWarehouse = selectedRole?.roleKey?.includes("warehouse") || selectedRole?.roleName?.toLowerCase().includes("kho");

  const onSubmit = async (data: CreateUserFormData) => {
    setIsSubmitting(true);
    try {
      // Step 1: Tạo user
      const userResult = await createUser.mutateAsync(data);
      const userId = (userResult as any).data.id;

      // Step 2: Upload avatar nếu có chọn
      if (avatarFile) {
        try {
          setUploadProgress("uploading");
          await uploadAvatar.mutateAsync({
            id: userId,
            file: avatarFile,
          });
          setUploadProgress("success");
        } catch (uploadError) {
          setUploadProgress("error");
        }
      }

      router.push("/users");
    } catch (error) {} finally {
      setIsSubmitting(false);
    }
  };

  // Avatar upload handler
  const onAvatarDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ảnh phải nhỏ hơn 5MB");
        return;
      }
      
      setAvatarFile(file);
      
      // Create preview
      const preview = URL.createObjectURL(file);
      setAvatarPreview(preview);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onAvatarDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeAvatar = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const getAvatarProgressText = () => {
    switch (uploadProgress) {
      case "uploading":
        return "Đang tải lên ảnh...";
      case "success":
        return "Ảnh đã tải lên thành công ✓";
      case "error":
        return "Tải lên ảnh thất bại, nhưng nhân viên đã được tạo";
      default:
        return "Ảnh đại diện (Tùy chọn)";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Thêm nhân viên mới
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Tạo tài khoản nhân viên mới trong hệ thống
          </p>
        </div>
        <Link
          href="/users"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
          Quay lại
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="rounded-lg border bg-white p-6 shadow dark:bg-gray-800">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin cơ bản
            </h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Employee Code */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mã nhân viên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("employeeCode")}
                  placeholder="VD: NV001"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.employeeCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.employeeCode.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Chỉ cho phép chữ hoa, số và dấu gạch ngang
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("fullName")}
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="email@example.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  {...register("phone")}
                  placeholder="0901234567"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Giới tính
                </label>
                <select
                  {...register("gender")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ngày sinh
                </label>
                <FormDatePicker
                  name="dateOfBirth"
                  control={control}
                  label={undefined}
                  placeholder="Chọn ngày sinh"
                  className="w-full"
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Địa chỉ
                </label>
                <textarea
                  {...register("address")}
                  rows={3}
                  placeholder="Nhập địa chỉ"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              {/* CCCD */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  CCCD/ID
                </label>
                <input
                  type="text"
                  {...register("cccd")}
                  placeholder="VD: 123456789012"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.cccd && (
                  <p className="mt-1 text-sm text-red-600">{errors.cccd.message}</p>
                )}
              </div>

              {/* Issued At */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ngày cấp CCCD
                </label>
                <FormDatePicker
                  name="issuedAt"
                  control={control}
                  label={undefined}
                  placeholder="Chọn ngày cấp"
                  className="w-full"
                />
                {errors.issuedAt && (
                  <p className="mt-1 text-sm text-red-600">{errors.issuedAt.message}</p>
                )}
              </div>

              {/* Issued By */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nơi cấp CCCD
                </label>
                <input
                  type="text"
                  {...register("issuedBy")}
                  placeholder="VD: Công an TP HCM"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.issuedBy && (
                  <p className="mt-1 text-sm text-red-600">{errors.issuedBy.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Login Information */}
        <div className="rounded-lg border bg-white p-6 shadow dark:bg-gray-800">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin đăng nhập
            </h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Nhập mật khẩu"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và số
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
        </div>

        {/* Avatar Upload */}
        <div className="rounded-lg border bg-white p-6 shadow dark:bg-gray-800">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getAvatarProgressText()}
            </h3>

            <div>
              {avatarPreview ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative h-32 w-32">
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="h-full w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeAvatar}
                      disabled={isSubmitting}
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-lg hover:bg-red-600 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {avatarFile?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {avatarFile && `${(avatarFile.size / 1024 / 1024).toFixed(2)}MB`}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors ${
                    isDragActive
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                      : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
                  } ${isSubmitting ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <input {...getInputProps()} disabled={isSubmitting} />

                  <div className="flex flex-col items-center text-center">
                    <Upload className="h-12 w-12 text-gray-400" />
                    <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                      Nhấp hoặc kéo thả ảnh vào đây
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, WEBP tối đa 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {avatarFile && (
              <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  ✓ Ảnh sẽ được tải lên khi bạn bấm nút "Tạo nhân viên"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Permissions & Warehouse */}
        <div className="rounded-lg border bg-white p-6 shadow dark:bg-gray-800">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Phân quyền & Kho làm việc
            </h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Role */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Vai trò <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  options={[
                    { value: "", label: "Chọn vai trò" },
                    ...roles.map((r) => ({
                      value: String(r.id),
                      label: r.roleName,
                    })),
                  ]}
                  value={watch("roleId") === 0 ? "" : String(watch("roleId"))}
                  onChange={(value) => {
                    const val = value === "" ? 0 : Number(value);
                    setValue("roleId", val);
                  }}
                  placeholder="Tìm kiếm vai trò..."
                  isClearable={false}
                />
                {errors.roleId && (
                  <p className="mt-1 text-sm text-red-600">{errors.roleId.message}</p>
                )}
              </div>

              {/* Warehouse */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kho làm việc {needsWarehouse && <span className="text-red-500">*</span>}
                </label>
                <SearchableSelect
                  options={[
                    { value: "", label: "Chọn kho" },
                    ...warehouses.map((w: Warehouse) => ({
                      value: String(w.id),
                      label: `${w.warehouseName} (${w.warehouseCode})`,
                    })),
                  ]}
                  value={watch("warehouseId") === 0 ? "" : String(watch("warehouseId"))}
                  onChange={(value) => {
                    const val = value === "" ? 0 : Number(value);
                    setValue("warehouseId", val);
                  }}
                  placeholder="Tìm kiếm kho..."
                  isClearable={false}
                />
                {errors.warehouseId && (
                  <p className="mt-1 text-sm text-red-600">{errors.warehouseId.message}</p>
                )}
                {needsWarehouse && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Nhân viên kho cần được gán vào một kho cụ thể
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Trạng thái
                </label>
                <select
                  {...register("status")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/users">
            <Button variant="outline" size="md" disabled={isSubmitting}>
              Hủy
            </Button>
          </Link>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting || uploadProgress === "uploading"}
            isLoading={isSubmitting || uploadProgress === "uploading"}
          >
            {isSubmitting || uploadProgress === "uploading" ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                {uploadProgress === "uploading" ? "Đang tải ảnh..." : "Đang tạo..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Tạo nhân viên
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
