"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useProducts, useDeleteProduct } from "@/hooks/api";
import { Can } from "@/components/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Product, ProductType } from "@/types";
import { formatCurrency } from "@/lib/utils";

/**
 * Products List Page
 * Quản lý danh sách sản phẩm
 */
export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProductType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "discontinued">("all");

  // Fetch products
  const { data: response, isLoading, error } = useProducts();
  const deleteProduct = useDeleteProduct();

  // Filter products
  const products = React.useMemo(() => {
    if (!response?.data) return [];

    return response.data.filter((product) => {
      const matchesSearch =
        (product.productName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (product.sku?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (product.barcode?.toLowerCase() || "").includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "all" || product.productType === typeFilter;
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [response?.data, searchTerm, typeFilter, statusFilter]);

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) {
      try {
        await deleteProduct.mutateAsync(id);
      } catch (error) {
        console.error("Delete product failed:", error);
      }
    }
  };

  // Product type labels
  const getTypeLabel = (type: ProductType) => {
    const labels: Record<ProductType, string> = {
      raw_material: "Nguyên liệu",
      packaging: "Bao bì",
      finished_product: "Thành phẩm",
      goods: "Hàng hóa",
    };
    return labels[type];
  };

  // Product type badge colors
  const getTypeBadgeColor = (type: ProductType) => {
    const colors: Record<ProductType, string> = {
      raw_material: "blue",
      packaging: "yellow",
      finished_product: "green",
      goods: "purple",
    };
    return colors[type];
  };

  // Status badge colors
  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "green",
      inactive: "gray",
      discontinued: "red",
    };
    return colors[status] || "gray";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "Hoạt động",
      inactive: "Tạm ngưng",
      discontinued: "Ngừng kinh doanh",
    };
    return labels[status] || status;
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/10">
        <p className="text-red-800 dark:text-red-200">
          Lỗi khi tải danh sách sản phẩm: {(error as any)?.message || "Unknown error"}
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

        <Can permission="create_products">
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

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="grid gap-4 md:grid-cols-3">
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
              onChange={(e) => setTypeFilter(e.target.value as ProductType | "all")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Tất cả</option>
              <option value="raw_material">Nguyên liệu</option>
              <option value="packaging">Bao bì</option>
              <option value="finished_product">Thành phẩm</option>
              <option value="goods">Hàng hóa</option>
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
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
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

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>Hình ảnh</TableCell>
                <TableCell header>SKU</TableCell>
                <TableCell header>Tên sản phẩm</TableCell>
                <TableCell header>Loại</TableCell>
                <TableCell header>Danh mục</TableCell>
                <TableCell header>Giá bán lẻ</TableCell>
                <TableCell header>Đơn vị</TableCell>
                <TableCell header>Trạng thái</TableCell>
                <TableCell header>Hành động</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
                      <span className="ml-3 text-gray-600 dark:text-gray-400">
                        Đang tải...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      Không tìm thấy sản phẩm nào
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    {/* Image */}
                    <TableCell>
                      <div className="h-12 w-12 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={product.images[0].imageUrl}
                            alt={product.productName}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                            <svg
                              className="h-6 w-6 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* SKU */}
                    <TableCell>
                      <span className="font-mono text-sm font-medium">
                        {product.sku}
                      </span>
                    </TableCell>

                    {/* Product Name */}
                    <TableCell>
                      <Link
                        href={`/products/${product.id}`}
                        className="font-medium text-gray-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                      >
                        {product.productName}
                      </Link>
                      {product.barcode && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Barcode: {product.barcode}
                        </p>
                      )}
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      <Badge color={getTypeBadgeColor(product.productType)}>
                        {getTypeLabel(product.productType)}
                      </Badge>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      {product.category ? (
                        <span className="text-sm">
                          {product.category.categoryName}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      {product.sellingPriceRetail ? (
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(product.sellingPriceRetail)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>

                    {/* Unit */}
                    <TableCell>
                      <span className="text-sm">{product.unit}</span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge color={getStatusBadgeColor(product.status)}>
                        {getStatusLabel(product.status)}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/products/${product.id}`}>
                          <Button variant="ghost" size="sm">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </Button>
                        </Link>

                        <Can permission="update_products">
                          <Link href={`/products/${product.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </Button>
                          </Link>
                        </Can>

                        <Can permission="delete_products">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id, product.productName)}
                            disabled={deleteProduct.isPending}
                          >
                            <svg
                              className="h-4 w-4 text-red-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </Button>
                        </Can>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Info */}
        {products.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-800">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Hiển thị <span className="font-medium">{products.length}</span> sản phẩm
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
