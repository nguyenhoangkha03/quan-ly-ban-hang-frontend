"use client";

import React from "react";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import Link from "next/link";
import type { DebtReconciliation } from "@/types/debt-reconciliation.types";
import ReconciliationStatusBadge from "./ReconciliationStatus";
import { formatCurrency } from "@/lib/utils";

// 👇 Import bộ Table của bạn
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableCell 
} from "@/components/ui/table"; 

interface Props {
  data: DebtReconciliation[];
  isLoading: boolean;
}

export default function DebtReconciliationTable({ data, isLoading }: Props) {
  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
  }

  if (data.length === 0) {
    return <div className="p-8 text-center text-gray-500">Chưa có dữ liệu đối chiếu công nợ</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-gray-700">
          <TableRow>
            <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Mã phiếu</TableCell>
            <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Đối tượng</TableCell>
            <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Kỳ / Ngày</TableCell>
            <TableCell isHeader className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Nợ cuối kỳ</TableCell>
            <TableCell isHeader className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Trạng thái</TableCell>
            <TableCell isHeader className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Thao tác</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
              <TableCell className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                {item.reconciliationCode}
              </TableCell>
              <TableCell className="px-6 py-4">
                <div className="font-medium text-gray-900 dark:text-white">
                  {item.customer ? item.customer.customerName : item.supplier?.supplierName}
                </div>
                <div className="text-xs text-gray-500">
                  {item.customer ? "Khách hàng" : "Nhà cung cấp"}
                </div>
              </TableCell>
              <TableCell className="px-6 py-4">
                <div className="text-sm text-gray-900 dark:text-white">{item.period}</div>
                <div className="text-xs text-gray-400">
                  {item.reconciliationDate ? format(new Date(item.reconciliationDate), "dd/MM/yyyy") : "N/A"}
                </div>
              </TableCell>
              <TableCell className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                {formatCurrency(item.closingBalance)}
              </TableCell>
              <TableCell className="px-6 py-4 text-center">
                <ReconciliationStatusBadge status={item.status} size="sm" />
              </TableCell>
              <TableCell className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/finance/debt-reconciliation/${item.id}`}
                    className="rounded p-1.5 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                    title="Xem chi tiết"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}