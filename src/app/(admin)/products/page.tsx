"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import {
  useProducts,
  useBulkDeleteProducts,
  useBulkUpdateProductStatus,
  useDeleteProduct,
  useCategories,
  useSuppliers,
} from "@/hooks/api";
import { Can } from "@/components/auth";
import { ProductTable } from "@/components/products";
import Button from "@/components/ui/button/Button";
import Pagination from "@/components/tables/Pagination";
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";
import { ApiResponse, Category, Product, ProductType, Supplier } from "@/types";
import { Download, Trash2, CheckCircle, XCircle } from "lucide-react";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProductType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "discontinued"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [supplierFilter, setSupplierFilter] = useState<number | "all">("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isBulkUpdateDialogOpen, setIsBulkUpdateDialogOpen] = useState(false);
  const [bulkUpdateStatusValue, setBulkUpdateStatusValue] = useState<"active" | "inactive" | "discontinued">("active");

  // Fetch products with pagination
  const { data, isLoading, error } = useProducts({
    page,
    limit,
    ...(searchTerm && { search: searchTerm }),
    ...(typeFilter !== "all" && { productType: typeFilter }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(categoryFilter !== "all" && { categoryId: categoryFilter }),
    ...(supplierFilter !== "all" && { supplierId: supplierFilter }),
  });
  const response = data as unknown as ApiResponse<Product[]>;
  const { data: categoriesResponse } = useCategories({ status: "active" });
  const categoriesTemp = categoriesResponse as unknown as ApiResponse<Category[]>;
  const { data: suppliersResponse } = useSuppliers({ status: "active" });
  const suppliersTemp = suppliersResponse as unknown as ApiResponse<Supplier[]>;
  const bulkDelete = useBulkDeleteProducts();
  const bulkUpdateStatus = useBulkUpdateProductStatus();
  const deleteProduct = useDeleteProduct();

  const categories = categoriesTemp?.data || [];
  const suppliers = suppliersTemp?.data || [];

  // Products from API response (already filtered by backend)
  const products = response?.data || [];
  const paginationMeta = response?.meta;

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, typeFilter, statusFilter, categoryFilter, supplierFilter]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSelectedIds([]); // Clear selections when changing page
  };

  // Handle delete single product
  const handleDeleteClick = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    await deleteProduct.mutateAsync(deletingProduct.id);
    setIsDeleteDialogOpen(false);
    setDeletingProduct(null);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeletingProduct(null);
  };

  // Handle bulk delete
  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm!");
      return;
    }
    setIsBulkDeleteDialogOpen(true);
  };

  const handleConfirmBulkDelete = async () => {
    try {
      await bulkDelete.mutateAsync(selectedIds);
      setSelectedIds([]);
      setIsBulkDeleteDialogOpen(false);
    } catch (error) {
      console.error("Bulk delete failed:", error);
    }
  };

  const closeBulkDeleteDialog = () => {
    setIsBulkDeleteDialogOpen(false);
  };

  // Handle bulk update status
  const handleBulkUpdateStatusClick = (
    status: "active" | "inactive" | "discontinued"
  ) => {
    if (selectedIds.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm!");
      return;
    }
    setBulkUpdateStatusValue(status);
    setIsBulkUpdateDialogOpen(true);
  };

  const handleConfirmBulkUpdateStatus = async () => {
    try {
      await bulkUpdateStatus.mutateAsync({
        ids: selectedIds,
        status: bulkUpdateStatusValue
      });
      setSelectedIds([]);
      setIsBulkUpdateDialogOpen(false);
    } catch (error) {
      console.error("Bulk update status failed:", error);
    }
  };

  const closeBulkUpdateDialog = () => {
    setIsBulkUpdateDialogOpen(false);
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (products.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }

    // Prepare data for export
    const exportData = products.map((product) => ({
      SKU: product.sku,
      "Tên sản phẩm": product.productName,
      "Loại sản phẩm":
        product.productType === "raw_material"
          ? "Nguyên liệu"
          : product.productType === "packaging"
          ? "Bao bì"
          : product.productType === "finished_product"
          ? "Thành phẩm"
          : "Hàng hóa",
      "Danh mục": product.category?.categoryName || "",
      "Nhà cung cấp": product.supplier?.supplierName || "",
      "Đơn vị": product.unit,
      Barcode: product.barcode || "",
      "Giá nhập": product.purchasePrice || 0,
      "Giá bán lẻ": product.sellingPriceRetail || 0,
      "Giá bán sỉ": product.sellingPriceWholesale || 0,
      "Giá VIP": product.sellingPriceVip || 0,
      "Tồn tối thiểu": product.minStockLevel || 0,
      "Trạng thái":
        product.status === "active"
          ? "Hoạt động"
          : product.status === "inactive"
          ? "Tạm ngưng"
          : "Ngừng kinh doanh",
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const columnWidths = [
      { wch: 15 }, // SKU
      { wch: 30 }, // Tên sản phẩm
      { wch: 15 }, // Loại sản phẩm
      { wch: 20 }, // Danh mục
      { wch: 20 }, // Nhà cung cấp
      { wch: 10 }, // Đơn vị
      { wch: 15 }, // Barcode
      { wch: 12 }, // Giá nhập
      { wch: 12 }, // Giá bán lẻ
      { wch: 12 }, // Giá bán sỉ
      { wch: 12 }, // Giá VIP
      { wch: 12 }, // Tồn tối thiểu
      { wch: 15 }, // Trạng thái
    ];
    worksheet["!cols"] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sản phẩm");

    // Export file
    const fileName = `Danh_sach_san_pham_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/10">
        <p className="text-red-800 dark:text-red-200">
          Lỗi khi tải danh sách sản phẩm:{" "}
          {(error as any)?.message || "Unknown error"}
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
            Quản lý Sản phẩm
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Quản lý thông tin sản phẩm, nguyên liệu, bao bì và hàng hóa
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Export Excel */}
          <Button
            variant="outline"
            onClick={handleExportExcel}
            disabled={products.length === 0}
          >
            <Download className="mr-2 h-5 w-5" />
            Xuất Excel
          </Button>

          {/* Add Product */}
          <Can permission="create_product">
            <Link href="/products/create">
              <Button variant="primary">
                <svg
                  className="mr-2 h-5 w-5"
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
                Thêm sản phẩm
              </Button>
            </Link>
          </Can>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {/* Search */}
          <div>
            <label
              htmlFor="search"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Tìm kiếm
            </label>
            <input
              type="text"
              id="search"
              placeholder="Tên, SKU, Barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label
              htmlFor="type"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Loại sản phẩm
            </label>
            <select
              id="type"
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as ProductType | "all")
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Tất cả</option>
              <option value="raw_material">Nguyên liệu</option>
              <option value="packaging">Bao bì</option>
              <option value="finished_product">Thành phẩm</option>
              <option value="goods">Hàng hóa</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Danh mục
            </label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Tất cả</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier Filter */}
          <div>
            <label
              htmlFor="supplier"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nhà cung cấp
            </label>
            <select
              id="supplier"
              value={supplierFilter}
              onChange={(e) =>
                setSupplierFilter(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Tất cả</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.supplierName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Trạng thái
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "all" | "active" | "inactive" | "discontinued"
                )
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Tạm ngưng</option>
              <option value="discontinued">Ngừng kinh doanh</option>
            </select>
          </div>

          {/* Items per page */}
          <div>
            <label
              htmlFor="limit"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Hiển thị
            </label>
            <select
              id="limit"
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

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Đã chọn {selectedIds.length} sản phẩm
            </span>
            <div className="flex items-center gap-2">
              {/* Bulk Update Status */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkUpdateStatusClick("active")}
                disabled={bulkUpdateStatus.isPending}
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                Hoạt động
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkUpdateStatusClick("inactive")}
                disabled={bulkUpdateStatus.isPending}
              >
                <XCircle className="mr-1 h-4 w-4" />
                Tạm ngưng
              </Button>

              {/* Bulk Delete */}
              <Can permission="delete_product">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleBulkDeleteClick}
                  disabled={bulkDelete.isPending}
                  isLoading={bulkDelete.isPending}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Xóa
                </Button>
              </Can>
            </div>
          </div>
        </div>
      )}

      {/* Product Table */}
      <ProductTable
        data={products}
        isLoading={isLoading}
        onSelectionChange={setSelectedIds}
        enableSelection={true}
        onDelete={handleDeleteClick}
      />

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
            <span className="font-medium">{paginationMeta.total}</span> sản phẩm
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Xóa sản phẩm"
        message={`Bạn có chắc chắn muốn xóa sản phẩm "${deletingProduct?.productName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        isLoading={deleteProduct.isPending}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isBulkDeleteDialogOpen}
        onClose={closeBulkDeleteDialog}
        onConfirm={handleConfirmBulkDelete}
        title="Xóa nhiều sản phẩm"
        message={`Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn? Hành động này không thể hoàn tác.`}
        confirmText="Xóa tất cả"
        cancelText="Hủy"
        variant="danger"
        isLoading={bulkDelete.isPending}
      />

      {/* Bulk Update Status Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isBulkUpdateDialogOpen}
        onClose={closeBulkUpdateDialog}
        onConfirm={handleConfirmBulkUpdateStatus}
        title="Cập nhật trạng thái"
        message={`Bạn có chắc chắn muốn cập nhật ${selectedIds.length} sản phẩm thành "${
          bulkUpdateStatusValue === "active"
            ? "Hoạt động"
            : bulkUpdateStatusValue === "inactive"
            ? "Tạm ngưng"
            : "Ngừng kinh doanh"
        }"?`}
        confirmText="Cập nhật"
        cancelText="Hủy"
        variant="warning"
        isLoading={bulkUpdateStatus.isPending}
      />
    </div>
  );
}
