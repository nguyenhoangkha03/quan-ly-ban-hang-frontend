"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCategoryStats,
  type CategoryStats,
} from "@/hooks/api";
import { categorySchema, type CategoryFormData } from "@/lib/validations/category.schema";
import { Can } from "@/components/auth";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Pagination from "@/components/tables/Pagination";
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";
import { ApiResponse, Category, StatusCommon } from "@/types";
import { HomeIcon, Plus, Trash2, X, Eye, CheckCircle, XCircle, Layers, Edit } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { generateSlug } from "@/lib/utils";

export default function CategoriesPage() {
  // Pagination & Filter state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [statusFilter, setStatusFilter] = useState<StatusCommon | "all">("all");
  const [parentFilter, setParentFilter] = useState<number | "root" | "all">("all");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categoryCode: "",
      categoryName: "",
      slug: "",
      parentId: null,
      description: "",
      status: "active",
    },
  });

  const categoryName = watch("categoryName");

  // Tự động tạo ra slug
  useEffect(() => {
    if (categoryName) {
      setValue("slug", generateSlug(categoryName));
    }
  }, [categoryName, setValue]);

  // Fetch loại hàng với phân trang trên server
  const { data: response, isLoading } = useCategories({
    page,
    limit,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(parentFilter !== "all" && {
      parentId: parentFilter === "root" ? ("null" as any) : parentFilter,
    })
  });
  const responseData = response as unknown as ApiResponse<Category[]>;

  // Fetch tất cả danh mục gốc cho filter dropdown
  const { data: rootCategoriesResponse } = useCategories({
    page: 1,
    limit: 100,
    parentId: "null" as any, 
    status: "active",
  });
  const rootCategories = (rootCategoriesResponse as unknown as ApiResponse<Category[]>)?.data || [];

  // Fetch ALL danh mục trong form
  const { data: allCategoriesResponse } = useCategories({
    page: 1,
    limit: 1000, // Get all danh mục
    status: "active",
  });
  const allCategories = (allCategoriesResponse as unknown as ApiResponse<Category[]>)?.data || [];

  // Reset page khi search thay đổi
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, parentFilter]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  }

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const { data: statsResponse, isLoading: statsLoading } = useCategoryStats();

  // Data từ response
  const categories = responseData?.data || [];
  const paginationMeta = responseData?.meta;
  console.log(paginationMeta);
  const stats = statsResponse as unknown as CategoryStats | undefined;

  const openCreateModal = () => {
    setEditingCategory(null);
    reset({
      categoryCode: "",
      categoryName: "",
      slug: "",
      parentId: null,
      description: "",
      status: "active",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    reset({
      categoryCode: category.categoryCode || "",
      categoryName: category.categoryName,
      slug: category.slug || "",
      parentId: category.parentId || null,
      description: category.description || "",
      status: category.status as "active" | "inactive",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset();
  };

  const openViewModal = (category: Category) => {
    setViewingCategory(category);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingCategory(null);
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          data,
        });
      } else {
        await createCategory.mutateAsync(data);
      }
      closeModal();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const openDeleteDialog = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeletingCategory(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;

    try {
      await deleteCategory.mutateAsync(deletingCategory.id);
      closeDeleteDialog();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quản lý Danh mục
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Quản lý danh mục sản phẩm trong hệ thống
          </p>
        </div>

        <Can permission="create_product">
          <Button variant="primary" size="smm" onClick={openCreateModal}>
            <Plus className="mr-2 h-5 w-5" />
            Thêm danh mục
          </Button>
        </Can>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Categories Card */}
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-blue-50 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] dark:border-gray-800 dark:from-gray-900 dark:to-blue-950">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-0" />
            {statsLoading ? (
            <div className="h-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
            ) : (
            <>
                <div className="flex items-center justify-between relative z-10">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng danh mục</p>
                    <p className="mt-3 text-3xl font-bold text-blue-600 dark:text-blue-400 transition-all duration-300 group-hover:scale-110">{stats?.totalCategories || 0}</p>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative border-2 border-blue-500 rounded-xl p-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <HomeIcon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-900">
                <p className="text-xs text-gray-500 dark:text-gray-500">Tổng số danh mục</p>
                </div>
            </>
            )}
        </div>

        {/* Active Categories Card */}
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-green-50 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] dark:border-gray-800 dark:from-gray-900 dark:to-green-950">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -z-0" />
            {statsLoading ? (
            <div className="h-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
            ) : (
            <>
                <div className="flex items-center justify-between relative z-10">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Danh mục hoạt động</p>
                    <p className="mt-3 text-3xl font-bold text-green-600 dark:text-green-400 transition-all duration-300 group-hover:scale-110">{stats?.activeCategories || 0}</p>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-green-500 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative border-2 border-green-500 rounded-xl p-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
                    </div>
                </div>
                </div>
                <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-900">
                <p className="text-xs text-gray-500 dark:text-gray-500">Danh mục đang hoạt động</p>
                </div>
            </>
            )}
        </div>

        {/* Inactive Categories Card */}
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-red-50 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] dark:border-gray-800 dark:from-gray-900 dark:to-red-950">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -z-0" />
            {statsLoading ? (
            <div className="h-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
            ) : (
            <>
                <div className="flex items-center justify-between relative z-10">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Danh mục không hoạt động</p>
                    <p className="mt-3 text-3xl font-bold text-red-600 dark:text-red-400 transition-all duration-300 group-hover:scale-110">{stats?.inactiveCategories || 0}</p>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-red-500 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative border-2 border-red-500 rounded-xl p-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <XCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
                    </div>
                </div>
                </div>
                <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-900">
                <p className="text-xs text-gray-500 dark:text-gray-500">Danh mục tạm ngưng</p>
                </div>
            </>
            )}
        </div>

        {/* Root Categories Card */}
        <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-purple-50 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] dark:border-gray-800 dark:from-gray-900 dark:to-purple-950">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -z-0" />
            {statsLoading ? (
            <div className="h-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
            ) : (
            <>
                <div className="flex items-center justify-between relative z-10">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Danh mục gốc</p>
                    <p className="mt-3 text-3xl font-bold text-purple-600 dark:text-purple-400 transition-all duration-300 group-hover:scale-110">{stats?.rootCategories || 0}</p>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-purple-500 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative border-2 border-purple-500 rounded-xl p-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <Layers className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                    </div>
                </div>
                </div>
                <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-900">
                <p className="text-xs text-gray-500 dark:text-gray-500">Danh mục gốc trong hệ thống</p>
                </div>
            </>
            )}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tên hoặc mã danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Parent Category Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Danh mục cha
            </label>
            <select
              value={parentFilter === undefined ? "all" : parentFilter === "root" ? "root" : parentFilter}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "all") setParentFilter("all");
                else if (value === "root") setParentFilter("root");
                else setParentFilter(Number(value));
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Tất cả</option>
              <option value="root">Danh mục gốc</option>
              {rootCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Trạng thái
            </label>
            <select
              value={statusFilter || "all"}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>

          {/* Items per page */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Hiển thị
            </label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1); // Reset to first page when changing limit
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
              <option value={100}>100 / trang</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-gray-500">
            <p>Không có danh mục nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Mã
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Tên danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Danh mục cha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {category.categoryCode || "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {category.categoryName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {category.slug || "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {category.parent?.categoryName || "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <Badge color={category.status === "active" ? "green" : "gray"}>
                        {category.status === "active" ? "Hoạt động" : "Không hoạt động"}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openViewModal(category)}
                          className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                          title="Xem"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <Can permission="update_product">
                          <button
                            onClick={() => openEditModal(category)}
                            className="rounded p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </Can>
                        <Can permission="delete_product">
                          <button
                            onClick={() => openDeleteDialog(category)}
                            className="rounded p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </Can>
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
                <span className="font-medium">{paginationMeta.total}</span> danh mục
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md max-h-[90vh] rounded-lg bg-white shadow-xl dark:bg-gray-900 flex flex-col">
            <div className="p-6 pb-4 flex items-center justify-between flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
              </h2>
              <button
                onClick={closeModal}
                className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
              <div className="space-y-4 p-6 overflow-y-auto flex-1">
                {/* Category Code */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mã danh mục <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("categoryCode")}
                    placeholder="VD: DM-001"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  {errors.categoryCode && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.categoryCode.message}
                    </p>
                  )}
                </div>

                {/* Category Name */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tên danh mục <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("categoryName")}
                    placeholder="Nhập tên danh mục"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  {errors.categoryName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.categoryName.message}
                    </p>
                  )}
                </div>

                {/* Slug (Read-only) */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Slug (tự động)
                  </label>
                  <input
                    type="text"
                    {...register("slug")}
                    readOnly
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  />
                </div>

                {/* Parent Category */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Danh mục cha
                  </label>
                  <select
                    {...register("parentId", { valueAsNumber: true })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    size={1}
                  >
                    <option value="">-- Không có (Danh mục gốc) --</option>
                    {allCategories
                      ?.filter((cat) => cat.id !== editingCategory?.id)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.parent?.categoryName ? `${cat.parent.categoryName} → ` : ""}
                          {cat.categoryName}
                        </option>
                      ))}
                  </select>
                  {errors.parentId && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.parentId.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mô tả
                  </label>
                  <textarea
                    {...register("description")}
                    placeholder="Nhập mô tả..."
                    rows={3}
                    maxLength={500}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trạng thái
                  </label>
                  <select
                    {...register("status")}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.status.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting || createCategory.isPending || updateCategory.isPending}
                >
                  {editingCategory ? "Cập nhật" : "Tạo mới"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && viewingCategory && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl dark:bg-gray-900 my-8 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Chi tiết danh mục
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {viewingCategory.categoryName}
                </p>
              </div>
              <button
                onClick={closeViewModal}
                className="rounded-full p-2 hover:bg-white/50 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Mã danh mục */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Mã danh mục
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {viewingCategory.categoryCode || "-"}
                  </p>
                </div>

                {/* Trạng thái */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Trạng thái
                  </label>
                  <Badge color={viewingCategory.status === "active" ? "green" : "gray"}>
                    {viewingCategory.status === "active" ? "Hoạt động" : "Không hoạt động"}
                  </Badge>
                </div>

                {/* Tên danh mục */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 md:col-span-2">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Tên danh mục
                  </label>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {viewingCategory.categoryName}
                  </p>
                </div>

                {/* Slug */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 md:col-span-2">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Slug
                  </label>
                  <p className="break-all font-mono text-sm text-gray-700 dark:text-gray-300">
                    {viewingCategory.slug || "-"}
                  </p>
                </div>

                {/* Danh mục cha */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Danh mục cha
                  </label>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {viewingCategory.parent?.categoryName || <span className="text-gray-400">—</span>}
                  </p>
                </div>

                {/* Số sản phẩm */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Số sản phẩm
                  </label>
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {viewingCategory._count?.products || 0}
                  </p>
                </div>

                {/* Mô tả */}
                {viewingCategory.description && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 md:col-span-2">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                      Mô tả
                    </label>
                    <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                      {viewingCategory.description}
                    </p>
                  </div>
                )}

                {/* Ngày tạo & cập nhật */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Ngày tạo
                  </label>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {viewingCategory.createdAt
                      ? new Date(viewingCategory.createdAt).toLocaleDateString("vi-VN")
                      : "-"}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                    Cập nhật lần cuối
                  </label>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {viewingCategory.updatedAt
                      ? new Date(viewingCategory.updatedAt).toLocaleDateString("vi-VN")
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
              <Button variant="outline" onClick={closeViewModal}>
                Đóng
              </Button>
              <Can permission="update_product">
                <Button 
                  variant="primary" 
                  onClick={() => {
                    openEditModal(viewingCategory);
                    closeViewModal();
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </Button>
              </Can>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa danh mục"
        message={`Bạn có chắc chắn muốn xóa danh mục "${deletingCategory?.categoryName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        isLoading={deleteCategory.isPending}
      />
    </div>
  );
}
