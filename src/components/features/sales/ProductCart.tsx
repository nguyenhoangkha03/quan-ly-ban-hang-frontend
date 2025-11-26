"use client";

/**
 * Product Cart Component
 * Shopping cart style component để thêm/sửa sản phẩm trong đơn hàng
 * Với stock validation và inline editing
 */

import React, { useState, useMemo } from "react";
import { useProducts } from "@/hooks/api";
import { Product, CartItem, ApiResponse, ProductType } from "@/types";
import { Search, Plus, Trash2, Package, AlertCircle } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface ProductCartProps {
  items: CartItem[];
  onAddItem: (product: Product, quantity?: number) => void;
  onRemoveItem: (productId: number) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onUpdatePrice: (productId: number, unitPrice: number) => void;
  onUpdateDiscount: (productId: number, discountPercent: number) => void;
  onUpdateTax: (productId: number, taxRate: number) => void;
  warehouseId?: number;
  disabled?: boolean;
}

export default function ProductCart({
  items,
  onAddItem,
  onRemoveItem,
  onUpdateQuantity,
  onUpdatePrice,
  onUpdateDiscount,
  onUpdateTax,
  warehouseId,
  disabled = false,
}: ProductCartProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);

  // Fetch products (finished_product và goods)
  const { data: finishedProductsData } = useProducts({
    productType: ProductType.finished_product,
    status: "active",
  });
  const finishedProducts = (finishedProductsData as unknown as ApiResponse<Product[]>)?.data || [];

  const { data: goodsData } = useProducts({
    productType: ProductType.goods,
    status: "active",
  });
  const goods = (goodsData as unknown as ApiResponse<Product[]>)?.data || [];

  // Combine products
  const allProducts = useMemo(() => {
    return [...finishedProducts, ...goods];
  }, [finishedProducts, goods]);

  // Filter products by search
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return allProducts;

    const search = searchTerm.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.productName.toLowerCase().includes(search) ||
        p.sku.toLowerCase().includes(search)
    );
  }, [allProducts, searchTerm]);

  // Filter out already added products
  const availableProducts = useMemo(() => {
    const addedIds = new Set(items.map((item) => item.productId));
    return filteredProducts.filter((p) => !addedIds.has(p.id));
  }, [filteredProducts, items]);

  const handleAddProduct = (product: Product) => {
    onAddItem(product, 1);
    setSearchTerm("");
    setShowProductSearch(false);
  };

  // Calculate line totals
  const calculateLineTotal = (item: CartItem) => {
    const subtotal = item.unitPrice * item.quantity;
    const discount = (subtotal * item.discountPercent) / 100;
    const taxableAmount = subtotal - discount;
    const tax = (taxableAmount * item.taxRate) / 100;
    return taxableAmount + tax;
  };

  return (
    <div className="space-y-4">
      {/* Add Product Section */}
      {!disabled && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Thêm sản phẩm
            </h3>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm theo tên, SKU..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowProductSearch(true);
              }}
              onFocus={() => setShowProductSearch(true)}
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />

            {/* Product Search Dropdown */}
            {showProductSearch && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowProductSearch(false)}
                />
                <div className="absolute z-20 mt-1 max-h-80 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  {availableProducts.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      {searchTerm
                        ? "Không tìm thấy sản phẩm"
                        : "Tất cả sản phẩm đã được thêm"}
                    </div>
                  ) : (
                    availableProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleAddProduct(product)}
                        className="w-full border-b border-gray-200 p-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.productName}
                              className="h-12 w-12 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-200 dark:bg-gray-700">
                              <Package className="h-6 w-6 text-gray-500" />
                            </div>
                          )}

                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {product.productName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              SKU: {product.sku} • Đơn vị: {product.unit}
                            </p>
                            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                              {formatCurrency(product.salePrice)}
                            </p>
                          </div>

                          <Plus className="h-5 w-5 text-gray-400" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cart Items */}
      {items.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Chưa có sản phẩm nào. Tìm kiếm và thêm sản phẩm vào đơn hàng.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">
                    Sản phẩm
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 dark:text-white">
                    Đơn giá
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 dark:text-white">
                    Số lượng
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 dark:text-white">
                    Giảm giá (%)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 dark:text-white">
                    Thuế (%)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 dark:text-white">
                    Thành tiền
                  </th>
                  {!disabled && (
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 dark:text-white">
                      Thao tác
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {items.map((item) => (
                  <tr key={item.productId}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.productName}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-200 dark:bg-gray-700">
                            <Package className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.product.productName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.product.sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {disabled ? (
                        <span className="text-sm text-gray-900 dark:text-white">
                          {formatCurrency(item.unitPrice)}
                        </span>
                      ) : (
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            onUpdatePrice(item.productId, parseFloat(e.target.value) || 0)
                          }
                          min="0"
                          step="1000"
                          className="w-28 rounded border border-gray-300 px-2 py-1 text-right text-sm focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {disabled ? (
                        <span className="text-sm text-gray-900 dark:text-white">
                          {formatNumber(item.quantity)} {item.product.unit}
                        </span>
                      ) : (
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            onUpdateQuantity(item.productId, parseFloat(e.target.value) || 0)
                          }
                          min="0.01"
                          step="1"
                          className="w-24 rounded border border-gray-300 px-2 py-1 text-right text-sm focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {disabled ? (
                        <span className="text-sm text-gray-900 dark:text-white">
                          {item.discountPercent}%
                        </span>
                      ) : (
                        <input
                          type="number"
                          value={item.discountPercent}
                          onChange={(e) =>
                            onUpdateDiscount(item.productId, parseFloat(e.target.value) || 0)
                          }
                          min="0"
                          max="100"
                          step="1"
                          className="w-20 rounded border border-gray-300 px-2 py-1 text-right text-sm focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {disabled ? (
                        <span className="text-sm text-gray-900 dark:text-white">
                          {item.taxRate}%
                        </span>
                      ) : (
                        <input
                          type="number"
                          value={item.taxRate}
                          onChange={(e) =>
                            onUpdateTax(item.productId, parseFloat(e.target.value) || 0)
                          }
                          min="0"
                          max="100"
                          step="1"
                          className="w-20 rounded border border-gray-300 px-2 py-1 text-right text-sm focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(calculateLineTotal(item))}
                      </span>
                    </td>
                    {!disabled && (
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.productId)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Warning if no items */}
      {items.length === 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            Đơn hàng phải có ít nhất 1 sản phẩm
          </p>
        </div>
      )}
    </div>
  );
}
