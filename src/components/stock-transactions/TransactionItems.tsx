"use client";

import React from "react";
import { Product } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface TransactionItem {
  product: Product;
  quantity: number;
  unitPrice?: number;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

interface TransactionItemsProps {
  items: TransactionItem[];
  onUpdateItem: (index: number, updates: Partial<TransactionItem>) => void;
  onRemoveItem: (index: number) => void;
  showPrice?: boolean;
  showBatchNumber?: boolean;
  showExpiryDate?: boolean;
  readonly?: boolean;
}

/**
 * Transaction Items Component
 * Editable table for transaction items
 * Columns: Product, Quantity, Price, Total, Actions
 * Show running total
 */
export function TransactionItems({
  items,
  onUpdateItem,
  onRemoveItem,
  showPrice = true,
  showBatchNumber = false,
  showExpiryDate = false,
  readonly = false,
}: TransactionItemsProps) {
  // Calculate total value
  const totalValue = items.reduce((sum, item) => {
    const price = item.unitPrice || item.product.unit_price || 0;
    return sum + (item.quantity * price);
  }, 0);

  if (items.length === 0) {
    return (
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
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Chưa có sản phẩm nào. Vui lòng thêm sản phẩm vào danh sách.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <th className="w-12 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Sản phẩm
              </th>
              <th className="w-32 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Số lượng
              </th>
              {showPrice && (
                <>
                  <th className="w-32 px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Đơn giá
                  </th>
                  <th className="w-32 px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Thành tiền
                  </th>
                </>
              )}
              {showBatchNumber && (
                <th className="w-32 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Số lô
                </th>
              )}
              {showExpiryDate && (
                <th className="w-32 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Hạn sử dụng
                </th>
              )}
              {!readonly && (
                <th className="w-20 px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Thao tác
                </th>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => {
              const price = item.unitPrice || item.product.unit_price || 0;
              const total = item.quantity * price;

              return (
                <TableRow key={index}>
                  {/* Index */}
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {index + 1}
                  </TableCell>

                  {/* Product */}
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.product.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.product_name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.product.product_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.product.product_code}
                          {item.product.unit && ` • ${item.product.unit}`}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Quantity */}
                  <TableCell className="px-4 py-3">
                    {readonly ? (
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.quantity.toLocaleString()}
                      </span>
                    ) : (
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) =>
                          onUpdateItem(index, {
                            quantity: parseFloat(e.target.value) || 1,
                          })
                        }
                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    )}
                  </TableCell>

                  {/* Unit Price */}
                  {showPrice && (
                    <TableCell className="px-4 py-3 text-right">
                      {readonly ? (
                        <span className="text-sm text-gray-900 dark:text-white">
                          {price.toLocaleString("vi-VN")}
                        </span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={item.unitPrice || item.product.unit_price || 0}
                          onChange={(e) =>
                            onUpdateItem(index, {
                              unitPrice: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-right text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      )}
                    </TableCell>
                  )}

                  {/* Total */}
                  {showPrice && (
                    <TableCell className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                      {total.toLocaleString("vi-VN")}
                    </TableCell>
                  )}

                  {/* Batch Number */}
                  {showBatchNumber && (
                    <TableCell className="px-4 py-3">
                      {readonly ? (
                        <span className="text-sm text-gray-900 dark:text-white">
                          {item.batchNumber || "—"}
                        </span>
                      ) : (
                        <input
                          type="text"
                          value={item.batchNumber || ""}
                          onChange={(e) =>
                            onUpdateItem(index, {
                              batchNumber: e.target.value,
                            })
                          }
                          placeholder="Tùy chọn"
                          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                        />
                      )}
                    </TableCell>
                  )}

                  {/* Expiry Date */}
                  {showExpiryDate && (
                    <TableCell className="px-4 py-3">
                      {readonly ? (
                        <span className="text-sm text-gray-900 dark:text-white">
                          {item.expiryDate
                            ? new Date(item.expiryDate).toLocaleDateString("vi-VN")
                            : "—"}
                        </span>
                      ) : (
                        <input
                          type="date"
                          value={item.expiryDate || ""}
                          onChange={(e) =>
                            onUpdateItem(index, {
                              expiryDate: e.target.value,
                            })
                          }
                          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      )}
                    </TableCell>
                  )}

                  {/* Actions */}
                  {!readonly && (
                    <TableCell className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveItem(index)}
                        className="inline-flex items-center justify-center rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        title="Xóa"
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
                      </button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      {showPrice && (
        <div className="flex justify-end">
          <div className="w-80 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Tổng số lượng:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {items.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Tổng giá trị:
              </span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {totalValue.toLocaleString("vi-VN")} đ
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
