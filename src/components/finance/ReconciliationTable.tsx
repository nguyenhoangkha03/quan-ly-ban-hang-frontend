"use client";

import React from "react";
import { format } from "date-fns";
import { Eye, Mail, User } from "lucide-react";
import Link from "next/link";
import { useDebtReconciliationStore } from "@/stores/debtReconciliationStore"; // Import Store
import type { DebtReconciliation } from "@/types/debt-reconciliation.types";
import { formatCurrency } from "@/lib/utils";
import ReconciliationStatusBadge from "./ReconciliationStatus"; // Import Badge Status mới

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
  // Lấy hàm mở modal email từ store
  const { openEmailModal } = useDebtReconciliationStore();

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
        <div className="animate-pulse text-gray-500">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        Chưa có dữ liệu công nợ nào.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-100 dark:bg-gray-700/80">
            <TableRow>
              <TableCell isHeader className="w-[200px] px-4 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-300">
                Khách hàng / Mã
              </TableCell>
              
              {/* Cột Người Phụ Trách Mới */}
              <TableCell isHeader className="w-[150px] px-4 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-300">
                Phụ trách
              </TableCell>
              
              {/* Nhóm Số Liệu */}
              <TableCell isHeader className="px-4 py-3 text-right text-xs font-bold uppercase text-gray-600 dark:text-gray-300 bg-blue-50/50 dark:bg-blue-900/10">
                Nợ đầu kỳ
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-right text-xs font-bold uppercase text-gray-600 dark:text-gray-300">
                Tổng mua (+)
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-right text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                Trả hàng (-)
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-right text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                Điều chỉnh (-)
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-right text-xs font-bold uppercase text-green-600 dark:text-green-400">
                Thanh toán (-)
              </TableCell>
              <TableCell isHeader className="px-4 py-3 text-right text-xs font-bold uppercase text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/10">
                Nợ cần thu (=)
              </TableCell>
              
              <TableCell isHeader className="px-4 py-3 text-center text-xs font-bold uppercase text-gray-600 dark:text-gray-300">
                Trạng thái
              </TableCell>
              
              <TableCell isHeader className="px-4 py-3 text-center text-xs font-bold uppercase text-gray-600 dark:text-gray-300">
                Cập nhật
              </TableCell>
              
              <TableCell isHeader className="px-4 py-3 text-center text-xs font-bold uppercase text-gray-600 dark:text-gray-300">
                Thao tác
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => {
              const target = item.customer || item.supplier || {};
              const name = target.customerName || target.supplierName || "N/A";
              const code = target.customerCode || target.supplierCode || "N/A";

              return (
                <TableRow key={item.id} className="group border-t border-gray-100 hover:bg-gray-50/80 dark:border-gray-700/50 dark:hover:bg-gray-800/50 transition-colors">
                  
                  {/* 1. Khách hàng */}
                  <TableCell className="px-4 py-3 align-top">
                    <div className="font-semibold text-sm text-blue-600 dark:text-blue-400 truncate max-w-[180px]" title={name}>
                      {name}
                    </div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">{code}</div>
                    {/* Hiển thị note nhỏ nếu có */}
                    {item.notes && <div className="text-[10px] text-gray-400 italic mt-1 truncate max-w-[150px]">{item.notes}</div>}
                  </TableCell>

                  {/* 2. Người phụ trách */}
                  <TableCell className="px-4 py-3 align-top">
                    <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                        <User className="h-3 w-3 text-gray-400" />
                        <span className="truncate max-w-[120px]">
                            {item.assignedUser?.fullName || "---"}
                        </span>
                    </div>
                  </TableCell>

                  {/* 3. Nợ đầu kỳ */}
                  <TableCell className="px-4 py-3 text-right align-top bg-blue-50/30 dark:bg-blue-900/5 font-medium text-gray-700 dark:text-gray-200">
                      {formatCurrency(item.openingBalance)}
                  </TableCell>

                  {/* 4. Tổng mua */}
                  <TableCell className="px-4 py-3 text-right align-top text-gray-900 dark:text-white">
                      {formatCurrency(item.transactionsAmount)}
                  </TableCell>

                  {/* 5. Trả hàng */}
                  <TableCell className="px-4 py-3 text-right align-top text-gray-500">
                      {formatCurrency(item.returnAmount)}
                  </TableCell>

                  {/* 6. Điều chỉnh */}
                  <TableCell className="px-4 py-3 text-right align-top text-gray-500">
                      {formatCurrency(item.adjustmentAmount)}
                  </TableCell>

                  {/* 7. Thanh toán */}
                  <TableCell className="px-4 py-3 text-right align-top font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(item.paymentAmount)}
                  </TableCell>

                  {/* 8. Nợ cần thu */}
                  <TableCell className="px-4 py-3 text-right align-top bg-red-50/30 dark:bg-red-900/5 font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(item.closingBalance)}
                  </TableCell>

                  {/* 9. Trạng thái */}
                  <TableCell className="px-4 py-3 text-center align-top">
                    <ReconciliationStatusBadge status={item.status} size="sm" />
                  </TableCell>

                  {/* 10. Ngày cập nhật */}
                  <TableCell className="px-4 py-3 text-center align-top">
                    <div className="text-xs text-gray-500">
                      {item.updatedAt ? format(new Date(item.updatedAt), "dd/MM/yyyy") : "---"}
                    </div>
                  </TableCell>

                  {/* 11. Thao tác */}
                  <TableCell className="px-4 py-3 text-center align-top">
                    <div className="flex justify-center items-center gap-2">
                        {/* Nút Gửi Email */}
                        <button 
                            onClick={() => openEmailModal(item.id)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Gửi Email thông báo"
                        >
                            <Mail className="h-4 w-4" />
                        </button>

                        {/* Nút Xem Chi Tiết */}
                        <Link
                        href={`/finance/debt-reconciliation/${item.id}`}
                        className="inline-flex items-center gap-1 rounded bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700 transition-colors shadow-sm"
                        title="Xem chi tiết"
                        >
                        <Eye className="h-3 w-3" /> Xem
                        </Link>
                    </div>
                  </TableCell>

                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}