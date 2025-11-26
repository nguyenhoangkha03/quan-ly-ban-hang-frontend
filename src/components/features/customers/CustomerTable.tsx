"use client";

/**
 * Customer Table Component
 * Hiển thị danh sách khách hàng với đầy đủ thông tin
 */

import React, { useState } from "react";
import Link from "next/link";
import { Customer } from "@/types";
import { DebtStatusBadge } from "./DebtIndicator";
import {
  CUSTOMER_TYPE_LABELS,
  CUSTOMER_CLASSIFICATION_LABELS,
  CUSTOMER_STATUS_COLORS,
  CUSTOMER_STATUS_LABELS,
} from "@/lib/constants";
import { Eye, Edit, Trash2, User } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { Can } from "@/components/auth";
import { formatCurrency } from "@/lib/utils";

interface CustomerTableProps {
  customers: Customer[];
  isLoading?: boolean;
  onDelete?: (id: number, customerName: string) => void;
  selectedIds?: number[];
  onSelectChange?: (ids: number[]) => void;
  showBulkActions?: boolean;
}

export default function CustomerTable({
  customers,
  isLoading = false,
  onDelete,
  selectedIds = [],
  onSelectChange,
  showBulkActions = false,
}: CustomerTableProps) {
  // Handle Select All
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectChange) return;
    if (checked) {
      onSelectChange(customers.map((c) => c.id));
    } else {
      onSelectChange([]);
    }
  };

  // Handle Select One
  const handleSelectOne = (id: number, checked: boolean) => {
    if (!onSelectChange) return;
    if (checked) {
      onSelectChange([...selectedIds, id]);
    } else {
      onSelectChange(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  // Check if all selected
  const isAllSelected = customers.length > 0 && selectedIds.length === customers.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < customers.length;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-900">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            <tr>
              {showBulkActions && (
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = isSomeSelected;
                      }
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Mã KH
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Khách hàng
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Loại
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Phân loại
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Liên hệ
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Công nợ
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td
                  colSpan={showBulkActions ? 9 : 8}
                  className="px-4 py-8 text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-brand-600" />
                    <span className="text-gray-600 dark:text-gray-400">Đang tải...</span>
                  </div>
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td
                  colSpan={showBulkActions ? 9 : 8}
                  className="px-4 py-8 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <User className="h-12 w-12 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Không tìm thấy khách hàng nào
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {showBulkActions && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(customer.id)}
                        onChange={(e) => handleSelectOne(customer.id, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <Link
                      href={`/customers/${customer.id}`}
                      className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                    >
                      {customer.customerCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {customer.avatarUrl ? (
                        <img
                          src={customer.avatarUrl}
                          alt={customer.customerName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                          <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {customer.customerName}
                        </p>
                        {customer.contactPerson && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {customer.contactPerson}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {CUSTOMER_TYPE_LABELS[customer.customerType]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {CUSTOMER_CLASSIFICATION_LABELS[customer.classification]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {customer.phone}
                      </p>
                      {customer.email && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {customer.email}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="min-w-[200px]">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          {formatCurrency(customer.currentDebt)}
                        </span>
                        <DebtStatusBadge
                          currentDebt={customer.currentDebt}
                          creditLimit={customer.creditLimit}
                        />
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            customer.creditLimit > 0 &&
                            (customer.currentDebt / customer.creditLimit) * 100 >= 100
                              ? "bg-red-600 dark:bg-red-500"
                              : customer.creditLimit > 0 &&
                                (customer.currentDebt / customer.creditLimit) * 100 >= 80
                              ? "bg-yellow-500 dark:bg-yellow-400"
                              : "bg-green-500 dark:bg-green-400"
                          }`}
                          style={{
                            width: `${Math.min(
                              customer.creditLimit > 0
                                ? (customer.currentDebt / customer.creditLimit) * 100
                                : 0,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Hạn mức: {formatCurrency(customer.creditLimit)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        CUSTOMER_STATUS_COLORS[customer.status]
                      }`}
                    >
                      {CUSTOMER_STATUS_LABELS[customer.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/customers/${customer.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>

                      <Can permission="update_customer">
                        <Link href={`/customers/${customer.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </Can>

                      {onDelete && (
                        <Can permission="delete_customer">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDelete(customer.id, customer.customerName)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </Can>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
