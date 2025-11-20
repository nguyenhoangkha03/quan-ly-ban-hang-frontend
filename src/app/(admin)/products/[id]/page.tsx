"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useProduct, useDeleteProduct } from "@/hooks/api";
import { Can } from "@/components/auth";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ProductType } from "@/types";

/**
 * Product Detail Page
 */
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);

  const { data: product, isLoading, error } = useProduct(productId);
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

  const getTypeBadgeColor = (type: ProductType) => {
    const colors: Record<ProductType, string> = {
      raw_material: "blue",
      packaging: "yellow",
      finished_product: "green",
      goods: "purple",
    };
    return colors[type];
  };

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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {product.productName}
            </h1>
            <Badge color={getTypeBadgeColor(product.productType)}>
              {getTypeLabel(product.productType)}
            </Badge>
            <Badge color={getStatusBadgeColor(product.status)}>
              {getStatusLabel(product.status)}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            SKU: <span className="font-mono font-semibold">{product.sku}</span>
          </p>
        </div>

        <div className="flex gap-3">
          <Can permission="update_products">
            <Link href={`/products/${productId}/edit`}>
              <Button variant="outline">
                <svg
                  className="mr-2 h-4 w-4"
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
              </Button>
            </Link>
          </Can>

          <Can permission="delete_products">
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
            >
              <svg
                className="mr-2 h-4 w-4"
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
            </Button>
          </Can>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Product Images */}
          {product.images && product.images.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Hình ảnh
              </h2>
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square overflow-hidden rounded-md border border-gray-200 dark:border-gray-700"
                  >
                    <Image
                      src={image.imageUrl}
                      alt={image.altText || product.productName}
                      fill
                      className="object-cover"
                    />
                    {image.isPrimary && (
                      <div className="absolute top-2 right-2">
                        <Badge color="green">Chính</Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
    </div>
  );
}
