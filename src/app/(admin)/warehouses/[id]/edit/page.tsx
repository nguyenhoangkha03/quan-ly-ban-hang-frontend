"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useWarehouse, useUpdateWarehouse, useUsers } from "@/hooks/api";
import { warehouseSchema, type WarehouseFormData } from "@/lib/validations/warehouse.schema";
import { useDebounce } from "@/hooks";

/**
 * Edit Warehouse Page
 * Trang chỉnh sửa thông tin kho
 */
export default function EditWarehousePage() {
  const router = useRouter();
  const params = useParams();
  const warehouseId = Number(params.id);
  const [managerSearch, setManagerSearch] = useState("");
  const debouncedSearch = useDebounce(managerSearch, 300);

  const { data: response, isLoading, error } = useWarehouse(warehouseId);
  const updateWarehouse = useUpdateWarehouse();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
  });

  const selectedManagerId = watch("managerId");

  // Fetch users for manager selector (only active users with warehouse management roles)
  const { data: usersResponse, isLoading: isLoadingUsers } = useUsers({
    search: debouncedSearch,
    status: "active",
    limit: "20",
  });

  // Filter users by allowed roles (admin, warehouse_manager, warehouse_staff)
  const allowedRoleKeys = ["admin", "warehouse_manager", "warehouse_staff"];
  const filteredUsers = usersResponse?.data?.filter(
    (user) => user.role && allowedRoleKeys.includes(user.role.roleKey)
  ) || [];

  // Populate form when data is loaded
  useEffect(() => {
    if (response?.data) {
      const warehouse = response.data;
      reset({
        warehouseCode: warehouse.warehouseCode,
        warehouseName: warehouse.warehouseName,
        warehouseType: warehouse.warehouseType,
        status: warehouse.status,
        address: warehouse.address || "",
        city: warehouse.city || "",
        region: warehouse.region || "",
        capacity: warehouse.capacity || undefined,
        description: warehouse.description || "",
        managerId: warehouse.managerId || undefined,
      });
      // Set initial manager search text if manager exists
      if (warehouse.manager) {
        setManagerSearch(warehouse.manager.fullName);
      }
    }
  }, [response, reset]);

  const onSubmit = async (data: WarehouseFormData) => {
    try {
      await updateWarehouse.mutateAsync({ id: warehouseId, data });
      router.push("/warehouses");
    } catch (error) {
      // Error handled by mutation
      console.error("Update warehouse failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/10">
        <p className="text-red-800 dark:text-red-200">
          Lỗi khi tải thông tin kho: {(error as any)?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  if (!response?.data) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/10">
        <p className="text-yellow-800 dark:text-yellow-200">
          Không tìm thấy kho này
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
            Chỉnh sửa kho
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Cập nhật thông tin kho: {response.data.warehouseName}
          </p>
        </div>
        <Link
          href="/warehouses"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Quay lại
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Warehouse Code */}
            <div>
              <label
                htmlFor="warehouseCode"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Mã kho <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="warehouseCode"
                {...register("warehouseCode")}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                placeholder="VD: WH-001"
              />
              {errors.warehouseCode && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.warehouseCode.message}
                </p>
              )}
            </div>

            {/* Warehouse Name */}
            <div>
              <label
                htmlFor="warehouseName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Tên kho <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="warehouseName"
                {...register("warehouseName")}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                placeholder="VD: Kho nguyên liệu Hà Nội"
              />
              {errors.warehouseName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.warehouseName.message}
                </p>
              )}
            </div>

            {/* Warehouse Type */}
            <div>
              <label
                htmlFor="warehouseType"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Loại kho <span className="text-red-500">*</span>
              </label>
              <select
                id="warehouseType"
                {...register("warehouseType")}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">-- Chọn loại kho --</option>
                <option value="raw_material">Nguyên liệu</option>
                <option value="packaging">Bao bì</option>
                <option value="finished_product">Thành phẩm</option>
                <option value="goods">Hàng hóa</option>
              </select>
              {errors.warehouseType && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.warehouseType.message}
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
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Ngưng hoạt động</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.status.message}
                </p>
              )}
            </div>

            {/* Manager Selector */}
            <div className="sm:col-span-2">
              <label
                htmlFor="managerId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Quản lý kho
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm người quản lý..."
                  value={managerSearch}
                  onChange={(e) => setManagerSearch(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                />
                {isLoadingUsers && (
                  <div className="absolute right-3 top-2.5">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                  </div>
                )}
                {filteredUsers && filteredUsers.length > 0 && managerSearch && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
                    <ul className="max-h-60 overflow-auto py-1">
                      {filteredUsers.map((user) => (
                        <li
                          key={user.id}
                          onClick={() => {
                            setValue("managerId", user.id);
                            setManagerSearch(user.fullName);
                          }}
                          className="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <div className="font-medium text-gray-900 dark:text-white">
                            {user.fullName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {user.employeeCode} • {user.email}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {selectedManagerId && (
                <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-2 dark:border-blue-800 dark:bg-blue-900/20">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium text-blue-900 dark:text-blue-200">
                        Đã chọn: {managerSearch}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setValue("managerId", undefined);
                        setManagerSearch("");
                      }}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              {errors.managerId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.managerId.message}
                </p>
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
              <input
                type="text"
                id="address"
                {...register("address")}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                placeholder="VD: 123 Đường ABC, Quận XYZ"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Thành phố
              </label>
              <input
                type="text"
                id="city"
                {...register("city")}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                placeholder="VD: Hà Nội"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.city.message}
                </p>
              )}
            </div>

            {/* Region */}
            <div>
              <label
                htmlFor="region"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Khu vực
              </label>
              <input
                type="text"
                id="region"
                {...register("region")}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                placeholder="VD: Miền Bắc"
              />
              {errors.region && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.region.message}
                </p>
              )}
            </div>

            {/* Capacity */}
            <div>
              <label
                htmlFor="capacity"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Sức chứa (m³)
              </label>
              <input
                type="number"
                id="capacity"
                {...register("capacity", { valueAsNumber: true })}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                placeholder="VD: 1000"
              />
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.capacity.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Mô tả
              </label>
              <textarea
                id="description"
                rows={3}
                {...register("description")}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                placeholder="Mô tả chi tiết về kho..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/warehouses"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-900"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Đang cập nhật...
              </>
            ) : (
              <>
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Cập nhật kho
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
