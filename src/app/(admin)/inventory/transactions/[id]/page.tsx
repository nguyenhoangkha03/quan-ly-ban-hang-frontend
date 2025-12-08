"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useStockTransaction, useApproveTransaction, useCancelTransaction } from "@/hooks/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Can } from "@/components/auth";

export default function TransactionDetailPage() {
  const params = useParams();
  const transactionId = parseInt(params.id as string);

  const { data: response, isLoading } = useStockTransaction(transactionId);
  const approve = useApproveTransaction();
  const cancel = useCancelTransaction();

  const transaction = response?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-600 dark:text-gray-400">Không tìm thấy giao dịch</p>
      </div>
    );
  }

  const getTransactionTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      import: "Nhập kho",
      export: "Xuất kho",
      transfer: "Chuyển kho",
      disposal: "Xuất hủy",
      stocktake: "Kiểm kê",
    };
    return map[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      draft: "Nháp",
      pending: "Chờ duyệt",
      approved: "Đã duyệt",
      completed: "Hoàn thành",
      cancelled: "Hủy",
    };
    return map[status] || status;
  };

  const handleApprove = () => {
    if (confirm("Phê duyệt giao dịch này?")) {
      approve.mutate({ id: transactionId });
    }
  };

  const handleCancel = () => {
    if (confirm("Hủy giao dịch này?")) {
      const reason = prompt("Lý do hủy:");
      if (reason) {
        cancel.mutate({ id: transactionId, reason });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/inventory/transactions">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {transaction.transaction_code}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {getTransactionTypeLabel(transaction.transaction_type)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={
              transaction.status === "completed"
                ? "success"
                : transaction.status === "approved"
                  ? "info"
                  : transaction.status === "pending"
                    ? "warning"
                    : transaction.status === "cancelled"
                      ? "danger"
                      : "default"
            }
          >
            {getStatusBadge(transaction.status)}
          </Badge>

          <Can permission="approve_stock_transactions">
            {transaction.status === "pending" && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleApprove}
                isLoading={approve.isPending}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Phê duyệt
              </Button>
            )}
          </Can>

          {transaction.status !== "completed" && transaction.status !== "cancelled" && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleCancel}
              isLoading={cancel.isPending}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Hủy
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transaction Info */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin giao dịch
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loại giao dịch</p>
                <p className="font-medium">{getTransactionTypeLabel(transaction.transaction_type)}</p>
              </div>

              {transaction.warehouse && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Kho đích</p>
                  <p className="font-medium">{transaction.warehouse.warehouseName}</p>
                </div>
              )}

              {transaction.source_warehouse && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Kho nguồn</p>
                  <p className="font-medium">{transaction.source_warehouse.warehouseName}</p>
                </div>
              )}

              {transaction.destination_warehouse && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Kho đích</p>
                  <p className="font-medium">{transaction.destination_warehouse.warehouseName}</p>
                </div>
              )}

              {transaction.reason && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Lý do</p>
                  <p className="font-medium">{transaction.reason}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ngày tạo</p>
                <p className="font-medium">{formatDate(transaction.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          {transaction.details && transaction.details.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Chi tiết sản phẩm
              </h2>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell>Sản phẩm</TableCell>
                      <TableCell>Số lượng</TableCell>
                      <TableCell>Đơn giá</TableCell>
                      <TableCell>Thành tiền</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transaction.details.map((detail, index) => {
                      const itemTotal = (detail.quantity || 0) * (detail.unit_price || 0);
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">
                                {detail.product?.productName}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {detail.product?.productCode}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{detail.quantity}</TableCell>
                          <TableCell>{formatCurrency(detail.unit_price || 0)}</TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(itemTotal)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        {/* Right: Summary */}
        <div>
          <div className="sticky top-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Tóm tắt
            </h3>

            <div className="space-y-3 border-b border-gray-200 pb-4 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Số lượng:</span>
                <span className="font-semibold">
                  {transaction.details?.reduce((sum, d) => sum + (d.quantity || 0), 0) || 0}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tổng giá trị:</span>
                <span className="font-semibold">
                  {formatCurrency(transaction.total_value || 0)}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Trạng thái:</span>
                <span className="font-semibold">{getStatusBadge(transaction.status)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
