"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import {
  useProducts,
  useBulkDeleteProducts,
  useBulkUpdateProductStatus,
  useCategories,
  useSuppliers,
} from "@/hooks/api";
import { Can } from "@/components/auth";
import { ProductTable } from "@/components/products";
import Button from "@/components/ui/button/Button";
import { ApiResponse, Category, Product, ProductType, Supplier } from "@/types";
import { Download, Trash2, CheckCircle, XCircle } from "lucide-react";

/**
 * Products List Page
 * Quản lý danh sách sản phẩm với TanStack Table, Bulk Actions, và Export Excel
 */
export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProductType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "discontinued"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [supplierFilter, setSupplierFilter] = useState<number | "all">("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Fetch products
  const { data, isLoading, error } = useProducts();
  const response = data as unknown as ApiResponse<Product[]>;
  const { data: categoriesResponse } = useCategories({ status: "active" });
  const categoriesTemp = categoriesResponse as unknown as ApiResponse<Category[]>;
  const { data: suppliersResponse } = useSuppliers({ status: "active" });
  const suppliersTemp = suppliersResponse as unknown as ApiResponse<Supplier[]>;
  const bulkDelete = useBulkDeleteProducts();
  const bulkUpdateStatus = useBulkUpdateProductStatus();

  const categories = categoriesTemp?.data || [];
  const suppliers = suppliersTemp?.data || [];

  // Filter products
  const products = useMemo(() => {
    if (!response?.data) return [];

    return response.data.filter((product) => {
      const matchesSearch =
        (product.productName?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (product.sku?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (product.barcode?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        );

      const matchesType =
        typeFilter === "all" || product.productType === typeFilter;
      const matchesStatus =
        statusFilter === "all" || product.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || product.categoryId === categoryFilter;
      const matchesSupplier =
        supplierFilter === "all" || product.supplierId === supplierFilter;

      return matchesSearch && matchesType && matchesStatus && matchesCategory && matchesSupplier;
    });
  }, [response?.data, searchTerm, typeFilter, statusFilter, categoryFilter, supplierFilter]);

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm!");
      return;
    }

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn?`
      )
    ) {
      return;
    }

    try {
      await bulkDelete.mutateAsync(selectedIds);
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk delete failed:", error);
    }
  };

  // Handle bulk update status
  const handleBulkUpdateStatus = async (
    status: "active" | "inactive" | "discontinued"
  ) => {
    if (selectedIds.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm!");
      return;
    }

    const statusLabels = {
      active: "Hoạt động",
      inactive: "Tạm ngưng",
      discontinued: "Ngừng kinh doanh",
    };

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn cập nhật ${selectedIds.length} sản phẩm thành "${statusLabels[status]}"?`
      )
    ) {
      return;
    }

    try {
      await bulkUpdateStatus.mutateAsync({ ids: selectedIds, status });
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk update status failed:", error);
    }
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
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
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
                onClick={() => handleBulkUpdateStatus("active")}
                disabled={bulkUpdateStatus.isPending}
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                Hoạt động
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkUpdateStatus("inactive")}
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
                  onClick={handleBulkDelete}
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
      />
    </div>
  );
}
