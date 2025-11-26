"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  useProduct,
  useDeleteProduct,
  useInventoryByProduct,
  useStockTransactions,
} from "@/hooks/api";
import { Can } from "@/components/auth";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { formatCurrency, formatDate } from "@/lib/utils";
import { InventoryByProductResponse, Product, ProductType, StockTransaction } from "@/types";

/**
 * Product Detail Page
 */
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);

  const { data: productWrapper, isLoading, error } = useProduct(productId);
  const product = productWrapper?.data as unknown as Product;
  const { data: inventoryWrapper, isLoading: inventoryLoading } = useInventoryByProduct(productId);
  const inventory = inventoryWrapper?.data as unknown as InventoryByProductResponse;
  const { data: transactionsWapper, isLoading: transactionsLoading } = useStockTransactions({
    productId: productId,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const transaction = transactionsWapper?.data as unknown as StockTransaction[]
  console.log('transactionsResponse', transaction);
  const deleteProduct = useDeleteProduct();

  const handleDelete = async () => {
    if (product && window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.productName}"?`)) {
      try {
        await deleteProduct.mutateAsync(productId);
        router.push("/products");
      } catch (error) {
        console.error("Delete product failed:", error);
      }
    }
  };

  const getTypeLabel = (type: ProductType) => {
    const labels: Record<ProductType, string> = {
      raw_material: "Nguyên liệu",
      packaging: "Bao bì",
      finished_product: "Thành phẩm",
      goods: "Hàng hóa",
    };
    return labels[type];
  };

  const getTypeBadgeColor = (type: ProductType): "blue" | "yellow" | "green" | "purple" => {
    const colors: Record<ProductType, "blue" | "yellow" | "green" | "purple"> = {
      raw_material: "blue",
      packaging: "yellow",
      finished_product: "green",
      goods: "purple",
    };
    return colors[type];
  };

  const getStatusBadgeColor = (status: string): "green" | "gray" | "red" => {
    const colors: Record<string, "green" | "gray" | "red"> = {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Đang tải...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/10">
        <p className="text-red-800 dark:text-red-200">
          Không tìm thấy sản phẩm này
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chi tiết sản phẩm</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {product.productName} ({product.sku})
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Back Button */}
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Quay lại
          </Link>

          {/* Edit Button */}
          <Can permission="update_product">
            <Link href={`/products/${productId}/edit`}>
              <button className="inline-flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Chỉnh sửa
              </button>
            </Link>
          </Can>

          {/* Delete Button */}
          <Can permission="delete_product">
            <button
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-900"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Xóa
            </button>
          </Can>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Information */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin cơ bản
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Loại sản phẩm
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {getTypeLabel(product.productType)}
                </dd>
              </div>

              {product.packagingType && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Loại bao bì
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {product.packagingType}
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Danh mục
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {product.category?.categoryName || "-"}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Nhà cung cấp
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {product.supplier?.supplierName || "-"}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Đơn vị tính
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {product.unit}
                </dd>
              </div>

              {product.barcode && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Mã vạch
                  </dt>
                  <dd className="mt-1 font-mono text-sm text-gray-900 dark:text-white">
                    {product.barcode}
                  </dd>
                </div>
              )}

              {product.weight && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Trọng lượng
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {product.weight} kg
                  </dd>
                </div>
              )}

              {product.dimensions && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Kích thước
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {product.dimensions}
                  </dd>
                </div>
              )}
            </dl>

            {product.description && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Mô tả
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {product.description}
                </dd>
              </div>
            )}
          </div>

          {/* Pricing Information */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin giá
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              {product.purchasePrice && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Giá nhập
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(product.purchasePrice)}
                  </dd>
                </div>
              )}

              {product.sellingPriceRetail && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Giá bán lẻ
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(product.sellingPriceRetail)}
                  </dd>
                </div>
              )}

              {product.sellingPriceWholesale && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Giá bán sỉ
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-blue-600 dark:text-blue-400">
                    {formatCurrency(product.sellingPriceWholesale)}
                  </dd>
                </div>
              )}

              {product.sellingPriceVip && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Giá VIP
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-purple-600 dark:text-purple-400">
                    {formatCurrency(product.sellingPriceVip)}
                  </dd>
                </div>
              )}

              {product.taxRate !== undefined && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Thuế suất
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {product.taxRate}%
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Right Column - Meta Info */}
        <div className="space-y-6">
          {/* Stock Information */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Tồn kho
            </h2>
            <div className="mb-4 flex gap-2">
              <Badge color={getTypeBadgeColor(product.productType)}>
                {getTypeLabel(product.productType)}
              </Badge>
              <Badge color={getStatusBadgeColor(product.status)}>
                {getStatusLabel(product.status)}
              </Badge>
            </div>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tồn kho tối thiểu
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {product.minStockLevel || 0}
                </dd>
              </div>

              {product.expiryDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Hạn sử dụng
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatDate(product.expiryDate, "long")}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Metadata */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin hệ thống
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Ngày tạo
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {formatDate(product.createdAt, "long")}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Cập nhật lần cuối
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {formatDate(product.updatedAt, "long")}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      {product.images && product.images.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Hình ảnh sản phẩm
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {product.images
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((image, index) => (
                <div key={image.id} className="group relative aspect-square">
                  <img
                    src={image.imageUrl}
                    alt={image.altText || `Product image ${index + 1}`}
                    className="h-full w-full rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700"
                  />
                  {image.isPrimary && (
                    <div className="absolute left-2 top-2 rounded bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
                      Chính
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
                    {index + 1}/{product.images?.length}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Inventory by Warehouse */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tồn kho theo kho
          </h2>
          <Link
            href={`/inventory?product=${productId}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Xem tất cả →
          </Link>
        </div>
        <InventoryTable
          inventory={inventory?.warehouses || []}
          isLoading={inventoryLoading}
          showWarehouse={true}
        />
      </div>

      {/* Transaction History */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Lịch sử giao dịch
          </h2>
          <Link
            href={`/stock-transactions?product=${productId}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Xem tất cả →
          </Link>
        </div>

        {transactionsLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : transaction && transaction.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Mã giao dịch
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Loại
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Kho
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Số lượng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Ngày tạo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {transaction.map((transaction) => {
                  // Find the detail for this product
                  const detail = transaction.details?.find(d => d.product_id === productId);
                  const quantity = detail?.quantity || 0;

                  const getTypeLabel = (type: string) => {
                    const labels: Record<string, string> = {
                      import: "Nhập kho",
                      export: "Xuất kho",
                      transfer: "Chuyển kho",
                      disposal: "Hủy hàng",
                      stocktake: "Kiểm kê",
                    };
                    return labels[type] || type;
                  };

                  const getStatusInfo = (status: string): { label: string; color: "gray" | "yellow" | "blue" | "green" | "red" } => {
                    const info: Record<string, { label: string; color: "gray" | "yellow" | "blue" | "green" | "red" }> = {
                      draft: { label: "Nháp", color: "gray" },
                      pending: { label: "Chờ duyệt", color: "yellow" },
                      approved: { label: "Đã duyệt", color: "blue" },
                      completed: { label: "Hoàn thành", color: "green" },
                      cancelled: { label: "Đã hủy", color: "red" },
                    };
                    return info[status] || { label: status, color: "gray" };
                  };

                  const statusInfo = getStatusInfo(transaction.status);

                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        <Link
                          href={`/stock-transactions/${transaction.id}`}
                          className="hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {transaction.transaction_code}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {getTypeLabel(transaction.transaction_type)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {transaction.warehouse?.warehouseName || transaction.source_warehouse?.warehouseName || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                        {quantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(transaction.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Chưa có giao dịch nào
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
