"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useStockTransaction } from "@/hooks/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StockTransaction } from "@/types";

export default function TransactionPrintPage() {
  const params = useParams();
  const transactionId = parseInt(params.id as string);

  const { data: response, isLoading } = useStockTransaction(transactionId);
  const transaction = response?.data as unknown as StockTransaction;

  useEffect(() => {
    // Auto print when loaded (optional - comment out if not needed)
    if (transaction && !isLoading) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [transaction, isLoading]);

  const getTransactionTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      import: "PHIẾU NHẬP KHO",
      export: "PHIẾU XUẤT KHO",
      transfer: "PHIẾU CHUYỂN KHO",
      disposal: "PHIẾU XUẤT HỦY",
      stocktake: "PHIẾU KIỂM KÊ",
    };
    return map[type] || "PHIẾU KHO";
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      draft: "Nháp",
      pending: "Chờ duyệt",
      approved: "Đã duyệt",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return map[status] || status;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Không tìm thấy phiếu kho</p>
      </div>
    );
  }

  return (
    <>
      {/* Print Button - Hidden when printing */}
      <div className="print:hidden fixed top-4 right-4 z-10">
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          🖨️ In phiếu
        </button>
        <button
          onClick={() => window.close()}
          className="ml-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
        >
          ✕ Đóng
        </button>
      </div>

      {/* Print Content */}
      <div className="mx-auto max-w-4xl bg-white p-8 print:p-0">
        {/* Header */}
        <div className="mb-8 border-b-2 border-gray-800 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="mb-1 text-sm font-semibold uppercase">
                Công Ty Cổ Phần Hoá Sinh Nam Việt
              </h1>
              <p className="text-xs">Địa chỉ: QL30/ấp Đông Mỹ, Mỹ Hội, Cao Lãnh, Đồng Tháp 81167</p>
              <p className="text-xs">Điện thoại: 0886 357 788</p>
              <p className="text-xs">Email: hoasinhnamviet@gmail.com</p>
            </div>
            <div className="text-right">
              <p className="text-xs">Mẫu số: 01-VT</p>
              <p className="text-xs">
                Ngày in: {formatDate(new Date().toISOString())}
              </p>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-xl font-bold uppercase">
            {getTransactionTypeLabel(transaction.transactionType)}
          </h2>
          <p className="text-sm">
            Số: <span className="font-semibold">{transaction.transactionCode}</span>
          </p>
          <p className="text-sm">
            Ngày: {formatDate(transaction.createdAt)}
          </p>
        </div>

        {/* Transaction Info */}
        <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
          {transaction.warehouse && (
            <div>
              <span className="font-semibold">Kho:</span>{" "}
              {transaction.warehouse.warehouseName}
            </div>
          )}
          {transaction.sourceWarehouse && (
            <div>
              <span className="font-semibold">Kho nguồn:</span>{" "}
              {transaction.sourceWarehouse.warehouseName}
            </div>
          )}
          {transaction.destinationWarehouse && (
            <div>
              <span className="font-semibold">Kho đích:</span>{" "}
              {transaction.destinationWarehouse.warehouseName}
            </div>
          )}
          <div>
            <span className="font-semibold">Trạng thái:</span>{" "}
            {getStatusLabel(transaction.status)}
          </div>
          {transaction.reason && (
            <div className="col-span-2">
              <span className="font-semibold">Lý do:</span> {transaction.reason}
            </div>
          )}
        </div>

        {/* Items Table */}
        {transaction.details && transaction.details.length > 0 && (
          <div className="mb-6">
            <table className="w-full border-collapse border border-gray-800 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-800 px-2 py-2 text-center">
                    STT
                  </th>
                  <th className="border border-gray-800 px-2 py-2 text-left">
                    Tên sản phẩm
                  </th>
                  <th className="border border-gray-800 px-2 py-2 text-center">
                    Mã SP
                  </th>
                  <th className="border border-gray-800 px-2 py-2 text-center">
                    Đơn vị
                  </th>
                  <th className="border border-gray-800 px-2 py-2 text-right">
                    Số lượng
                  </th>
                  <th className="border border-gray-800 px-2 py-2 text-right">
                    Đơn giá
                  </th>
                  <th className="border border-gray-800 px-2 py-2 text-right">
                    Thành tiền
                  </th>
                </tr>
              </thead>
              <tbody>
                {transaction.details.map((detail, index) => {
                  const itemTotal = (detail.quantity || 0) * (detail.unitPrice || 0);
                  return (
                    <tr key={index}>
                      <td className="border border-gray-800 px-2 py-2 text-center">
                        {index + 1}
                      </td>
                      <td className="border border-gray-800 px-2 py-2">
                        {detail.product?.productName || "—"}
                      </td>
                      <td className="border border-gray-800 px-2 py-2 text-center">
                        {detail.product?.sku || "—"}
                      </td>
                      <td className="border border-gray-800 px-2 py-2 text-center">
                        {detail.product?.unit || "cái"}
                      </td>
                      <td className="border border-gray-800 px-2 py-2 text-right">
                        {detail.quantity || 0}
                      </td>
                      <td className="border border-gray-800 px-2 py-2 text-right">
                        {formatCurrency(detail.unitPrice || 0)}
                      </td>
                      <td className="border border-gray-800 px-2 py-2 text-right font-semibold">
                        {formatCurrency(itemTotal)}
                      </td>
                    </tr>
                  );
                })}
                {/* Total Row */}
                <tr className="bg-gray-50 font-bold">
                  <td
                    colSpan={4}
                    className="border border-gray-800 px-2 py-2 text-right"
                  >
                    Tổng cộng:
                  </td>
                  <td className="border border-gray-800 px-2 py-2 text-right">
                    {transaction.details.reduce(
                      (sum, d) => sum + (d.quantity || 0),
                      0
                    )}
                  </td>
                  <td className="border border-gray-800 px-2 py-2"></td>
                  <td className="border border-gray-800 px-2 py-2 text-right">
                    {formatCurrency(transaction.totalValue || 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Notes */}
        {transaction.notes && (
          <div className="mb-6">
            <p className="text-sm">
              <span className="font-semibold">Ghi chú:</span> {transaction.notes}
            </p>
          </div>
        )}

        {/* Signatures */}
        <div className="mt-12 grid grid-cols-3 gap-8 text-center text-sm">
          <div>
            <p className="mb-16 font-semibold">Người lập phiếu</p>
            <p className="italic">(Ký, họ tên)</p>
          </div>
          <div>
            <p className="mb-16 font-semibold">Thủ kho</p>
            <p className="italic">(Ký, họ tên)</p>
          </div>
          <div>
            <p className="mb-16 font-semibold">Người phê duyệt</p>
            <p className="italic">(Ký, họ tên)</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 border-t pt-4 text-center text-xs text-gray-600">
          <p>Phiếu được in tự động từ hệ thống quản lý kho</p>
          <p>{formatDate(new Date().toISOString())}</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print\\:hidden {
            display: none !important;
          }

          .print\\:p-0 {
            padding: 0 !important;
          }
        }
      `}</style>
    </>
  );
}
