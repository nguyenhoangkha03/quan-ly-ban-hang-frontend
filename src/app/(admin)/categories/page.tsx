"use client";

import React, { useState, useEffect } from "react";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/api";
import { Can } from "@/components/auth";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Pagination from "@/components/tables/Pagination";
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";
import { ApiResponse, Category } from "@/types";
import { Plus, Pencil, Trash2, X, Eye } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { generateSlug } from "@/lib/utils/categoryHelpers";

export default function CategoriesPage() {
  // Pagination & Filter state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | undefined>(undefined);
  const [parentFilter, setParentFilter] = useState<number | "root" | undefined>(undefined);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    categoryCode: "",
    categoryName: "",
    slug: "",
    parentId: null as number | null,
    description: "",
    status: "active" as "active" | "inactive",
  });

  // Fetch categories với server-side pagination
  const { data: response, isLoading } = useCategories({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: statusFilter,
    parentId: parentFilter === "root" ? ("null" as any) : parentFilter,
  });
  const responseData = response as unknown as ApiResponse<Category[]>;

  // Fetch all root categories for filter dropdown
  const { data: rootCategoriesResponse } = useCategories({
    page: 1,
    limit: 100,
    parentId: "null" as any, // Only root categories (send as string 'null')
    status: "active",
  });
  const rootCategories = (rootCategoriesResponse as unknown as ApiResponse<Category[]>)?.data || [];

  // Fetch ALL categories for parent select dropdown in form (no pagination)
  const { data: allCategoriesResponse } = useCategories({
    page: 1,
    limit: 1000, // Get all categories
    status: "active",
  });
  const allCategories = (allCategoriesResponse as unknown as ApiResponse<Category[]>)?.data || [];

  // Reset page khi search thay đổi
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, parentFilter]);

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  // Data từ response
  const categories = responseData?.data || [];
  const meta = responseData?.meta;

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
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
    setFormData({
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
  };

  const openViewModal = (category: Category) => {
    setViewingCategory(category);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          data: formData,
        });
      } else {
        await createCategory.mutateAsync(formData);
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
          <Button variant="primary" onClick={openCreateModal}>
            <Plus className="mr-2 h-5 w-5" />
            Thêm danh mục
          </Button>
        </Can>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="grid gap-4 md:grid-cols-4">
          {/* Search */}
          <div className="md:col-span-2">
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
                if (value === "all") setParentFilter(undefined);
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
              onChange={(e) => setStatusFilter(e.target.value === "all" ? undefined : (e.target.value as "active" | "inactive"))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
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
                            <Pencil className="h-4 w-4" />
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

        {/* Stats & Pagination */}
        {meta && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 px-6 py-4 sm:flex-row dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Hiển thị {categories.length} / {meta.total} danh mục
              {meta.totalPages > 1 && ` • Trang ${meta.page} / ${meta.totalPages}`}
            </div>
            {meta.totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={meta.totalPages}
                onPageChange={setPage}
              />
            )}
          </div>
        )}
      </div>

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

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="space-y-4 p-6 overflow-y-auto flex-1">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mã danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.categoryCode}
                  onChange={(e) => setFormData({ ...formData, categoryCode: e.target.value.toUpperCase() })}
                  placeholder="VD: DM-001"
                  required
                  pattern="^[A-Z0-9-]+$"
                  title="Chỉ chấp nhận chữ in hoa, số và dấu gạch ngang"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm uppercase focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.categoryName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({
                      ...formData,
                      categoryName: name,
                      slug: generateSlug(name), // Luôn sinh slug từ tên
                    });
                  }}
                  placeholder="Nhập tên danh mục"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Slug tự động sinh từ tên, hiển thị để xem */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Slug (tự động)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  readOnly
                  className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Danh mục cha
                </label>
                <select
                  value={formData.parentId || ""}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value ? Number(e.target.value) : null })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  size={1}
                >
                  <option value="">-- Không có (Danh mục gốc) --</option>
                  {allCategories
                    ?.filter((cat) => cat.id !== editingCategory?.id) // Exclude self when editing
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.parent?.categoryName ? `${cat.parent.categoryName} → ` : ""}{cat.categoryName}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Nhập mô tả..."
                  rows={3}
                  maxLength={500}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>
              </div>

              <div className="flex justify-end gap-3 p-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={createCategory.isPending || updateCategory.isPending}
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
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900 my-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Chi tiết danh mục
              </h2>
              <button
                onClick={closeViewModal}
                className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Mã danh mục
                </label>
                <p className="text-gray-900 dark:text-white">{viewingCategory.categoryCode}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tên danh mục
                </label>
                <p className="text-gray-900 dark:text-white">{viewingCategory.categoryName}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Slug
                </label>
                <p className="text-gray-900 dark:text-white">{viewingCategory.slug}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Danh mục cha
                </label>
                <p className="text-gray-900 dark:text-white">
                  {viewingCategory.parent?.categoryName || "-"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Mô tả
                </label>
                <p className="text-gray-900 dark:text-white">{viewingCategory.description || "-"}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Trạng thái
                </label>
                <div className="mt-1">
                  <Badge color={viewingCategory.status === "active" ? "green" : "gray"}>
                    {viewingCategory.status === "active" ? "Hoạt động" : "Không hoạt động"}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={closeViewModal}>
                  Đóng
                </Button>
              </div>
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
