"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Download, Mail, CheckCircle, AlertTriangle, User, Calendar, DollarSign, Building2 } from "lucide-react";
import { format } from "date-fns";

import {
  useDebtReconciliation,
  useConfirmReconciliation,
  useDisputeReconciliation,
  useSendReconciliationEmail,
} from "@/hooks/api/useDebtReconciliation";

import { 
  confirmDebtSchema, ConfirmDebtForm 
} from "@/lib/validations/debt-reconciliation.schema";

import ReconciliationStatusBadge from "@/components/finance/ReconciliationStatus";
import Button from "@/components/ui/button/Button";
import { Can } from "@/components/auth/Can";
import { formatCurrency } from "@/lib/utils";

// Components UI
import { Modal } from "@/components/ui/modal";
import CancelModal from "@/components/ui/modal/CancelModal"; 
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";

// 👇 HÀM IN PDF Ở FRONTEND (Dựa trên code mẫu của bạn)
// 👇 Cập nhật lại hàm này
const handlePrintFrontend = (data: any) => {
    if (!data) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>In Biên Bản - ${data.reconciliationCode}</title>
        <style>
          /* 1. Reset lề trang in về 0 để ẩn Header/Footer của trình duyệt */
          @page { 
            size: auto; 
            margin: 0mm; 
          }

          /* 2. Thiết lập body để nội dung không bị sát mép giấy */
          body { 
            font-family: 'Times New Roman', Times, serif; 
            margin: 20mm; /* Cách lề 2cm mỗi bên cho đẹp */
            line-height: 1.6; 
            color: #000; 
          }

          /* Các style cũ giữ nguyên */
          h1 { text-align: center; margin-bottom: 5px; font-size: 24px; text-transform: uppercase; }
          .subtitle { text-align: center; margin-bottom: 30px; font-style: italic; }
          .section { margin-bottom: 20px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .label { font-weight: bold; min-width: 150px; display: inline-block; }
          
          /* Table Style */
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #000; padding: 10px; text-align: right; }
          th { background-color: #f0f0f0; text-align: center; font-weight: bold; }
          .total-row td { font-weight: bold; }
          
          /* Chữ ký */
          .signatures { display: flex; justify-content: space-between; margin-top: 50px; text-align: center; }
          .sign-box { width: 45%; }
          .sign-space { height: 100px; }
        </style>
      </head>
      <body>
        <h1>Biên Bản Đối Chiếu Công Nợ</h1>
        <div class="subtitle">
            Kỳ: ${data.period} | Ngày tạo: ${data.createdAt ? new Date(data.createdAt).toLocaleDateString('vi-VN') : '...'}
        </div>

        <div class="section">
            <p><span class="label">Mã phiếu:</span> ${data.reconciliationCode}</p>
            <p><span class="label">Bên A (Chủ nợ):</span> <strong>CÔNG TY CỔ PHẦN NAM VIỆT (Hệ thống)</strong></p>
            <p><span class="label">Bên B (Đối tác):</span> <strong>${data.customer?.customerName || data.supplier?.supplierName}</strong></p>
        </div>

        <div class="section">
            <p>Hai bên thống nhất số liệu công nợ tính đến ngày <strong>${data.reconciliationDate ? new Date(data.reconciliationDate).toLocaleDateString('vi-VN') : '...'}</strong> như sau:</p>
            
            <table>
                <thead>
                    <tr>
                        <th style="text-align: left">Diễn giải</th>
                        <th>Số tiền (VNĐ)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="text-align: left">1. Số dư nợ đầu kỳ</td>
                        <td>${formatCurrency(data.openingBalance)}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left">2. Tổng phát sinh tăng trong kỳ</td>
                        <td>${formatCurrency(data.transactionsAmount)}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left">3. Tổng thanh toán giảm trong kỳ</td>
                        <td>${formatCurrency(data.paymentAmount)}</td>
                    </tr>
                    <tr class="total-row">
                        <td style="text-align: left">4. Số dư nợ cuối kỳ phải trả</td>
                        <td>${formatCurrency(data.closingBalance)}</td>
                    </tr>
                </tbody>
            </table>
            
            ${data.discrepancyAmount !== 0 ? `
                <p style="color: red; font-style: italic;">
                    * Lưu ý: Có chênh lệch ${formatCurrency(data.discrepancyAmount)}. Lý do: ${data.discrepancyReason || "Chưa xác định"}
                </p>
            ` : ''}
        </div>

        <div class="signatures">
            <div class="sign-box">
                <p><strong>ĐẠI DIỆN BÊN A</strong></p>
                <p>(Ký, họ tên, đóng dấu)</p>
                <div class="sign-space"></div>
                <p>${data.creator?.fullName || "Quản trị viên"}</p>
            </div>
            <div class="sign-box">
                <p><strong>ĐẠI DIỆN BÊN B</strong></p>
                <p>(Ký, họ tên, đóng dấu)</p>
                <div class="sign-space"></div>
                <p>${data.confirmedByName || "..........................."}</p>
            </div>
        </div>
      </body>
      </html>
    `;

    // Logic tạo Iframe ẩn để in
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
        doc.open();
        doc.write(printContent);
        doc.close();

        if (iframe.contentWindow) {
            iframe.contentWindow.focus();
            setTimeout(() => {
                iframe.contentWindow?.print();
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            }, 500);
        }
    }
};

export default function ReconciliationDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  // ... (Giữ nguyên các State)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  // ... (Giữ nguyên các Hook)
  const { data: rawData, isLoading } = useDebtReconciliation(id);
  const reconciliation = ((rawData as any)?.data || rawData) as any;

  const confirmMutation = useConfirmReconciliation();
  const disputeMutation = useDisputeReconciliation();
  // const exportPDF = useExportReconciliationPDF(); <-- Bỏ hook này
  const sendEmail = useSendReconciliationEmail();

  const confirmForm = useForm<ConfirmDebtForm>({
    resolver: zodResolver(confirmDebtSchema),
  });

  // ... (Giữ nguyên các Handler Confirm, Dispute, SendEmail)
  const handleConfirm = async (data: ConfirmDebtForm) => {
    await confirmMutation.mutateAsync({ id, data }); 
    setShowConfirmModal(false);
    confirmForm.reset();
  };

  const handleDispute = async (reason: string) => {
    await disputeMutation.mutateAsync({ id, data: { reason } }); 
    setShowDisputeModal(false);
  };

  const handleSendEmail = async () => {
    await sendEmail.mutateAsync({ 
        id, 
        data: { 
            recipientName: reconciliation?.customer?.customerName || "Đối tác",
            recipientEmail: "partner@example.com" 
        } 
    });
    setShowEmailDialog(false);
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
  
  if (!reconciliation || !reconciliation.id) {
      return <div className="p-8 text-center text-gray-500">Không tìm thấy biên bản.</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* ... (Phần tiêu đề giữ nguyên) */}
        <div className="flex items-center gap-3">
          <Link href="/finance/debt-reconciliation" className="text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chi Tiết Đối Chiếu</h1>
            <p className="text-sm text-gray-500">{reconciliation.reconciliationCode}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {/* 👇 SỬA NÚT NÀY: Gọi hàm in Frontend thay vì gọi API */}
          <Button variant="outline" onClick={() => handlePrintFrontend(reconciliation)}>
            <Download className="mr-2 h-4 w-4" /> Xuất PDF
          </Button>
          
          {reconciliation.status === "pending" && (
            <Button variant="outline" onClick={() => setShowEmailDialog(true)}>
              <Mail className="mr-2 h-4 w-4" /> Gửi Email
            </Button>
          )}
        </div>
      </div>

      {/* ... (Phần nội dung còn lại giữ nguyên 100%) */}
      {/* Copy phần Main Content Layout, Action Buttons và Modals ở code cũ vào đây */}
      
      {/* Main Content Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700 space-y-5">
          <h3 className="font-semibold text-lg border-b pb-2 mb-4 dark:border-gray-700 text-gray-900 dark:text-white">Thông tin chung</h3>
          <div>
            <label className="text-sm font-medium text-gray-500">Đối tượng</label>
            <div className="flex items-center gap-2 mt-1">
              <Building2 className="h-5 w-5 text-gray-400" />
              <span className="font-semibold text-lg text-gray-900 dark:text-white">
                {reconciliation.customer?.customerName || reconciliation.supplier?.supplierName || "N/A"}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-sm font-medium text-gray-500">Kỳ đối chiếu</label>
                <div className="flex items-center gap-2 mt-1 font-medium text-gray-900 dark:text-white">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {reconciliation.period}
                </div>
            </div>
            <div>
                <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                <div className="mt-1">
                    <ReconciliationStatusBadge status={reconciliation.status} />
                </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Người tạo</label>
            <div className="flex items-center gap-2 mt-1 text-gray-900 dark:text-white">
                <User className="h-4 w-4 text-gray-400" />
                <span>{reconciliation.creator?.fullName || "Hệ thống"}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 border-b pb-2 dark:border-gray-700 text-gray-900 dark:text-white">
            <DollarSign className="h-5 w-5" /> Chi Tiết Số Dư
          </h2>
          
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Nợ đầu kỳ</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(reconciliation.openingBalance)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Phát sinh tăng (+)</span>
              <span className="font-semibold text-green-600">{formatCurrency(reconciliation.transactionsAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Thanh toán giảm (-)</span>
              <span className="font-semibold text-red-600">{formatCurrency(reconciliation.paymentAmount)}</span>
            </div>
            
            <div className="border-t pt-3 mt-3 flex justify-between items-center text-base">
              <span className="font-bold text-gray-900 dark:text-white">Số dư cuối kỳ</span>
              <span className="font-bold text-xl text-blue-600 dark:text-blue-400">{formatCurrency(reconciliation.closingBalance)}</span>
            </div>

            {reconciliation.discrepancyAmount !== 0 && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
                    <div className="flex items-center gap-2 font-semibold">
                        <AlertTriangle className="h-5 w-5" />
                        Chênh lệch: {formatCurrency(reconciliation.discrepancyAmount)}
                    </div>
                    {reconciliation.discrepancyReason && (
                        <p className="text-sm mt-1 ml-7">Lý do: {reconciliation.discrepancyReason}</p>
                    )}
                </div>
            )}
          </div>
        </div>
      </div>

      {reconciliation.status === "pending" && (
        <Can permission="finance.approve">
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t dark:border-gray-700">
                <Button className="flex-1 py-3 text-base" variant="primary" onClick={() => setShowConfirmModal(true)}>
                    <CheckCircle className="mr-2 h-5 w-5" /> Xác Nhận Khớp Số Liệu
                </Button>
                <Button className="flex-1 py-3 text-base" variant="danger" onClick={() => setShowDisputeModal(true)}>
                    <AlertTriangle className="mr-2 h-5 w-5" /> Báo Cáo Sai Lệch
                </Button>
            </div>
        </Can>
      )}

      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} className="max-w-lg p-6" showCloseButton={true}>
        <div className="mb-5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Xác Nhận Đối Chiếu</h3>
            <p className="text-sm text-gray-500">Vui lòng nhập thông tin người đại diện khách hàng đã xác nhận.</p>
        </div>
        
        <form onSubmit={confirmForm.handleSubmit(handleConfirm)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tên người xác nhận <span className="text-red-500">*</span></label>
                <input 
                    {...confirmForm.register("confirmedByName")}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    placeholder="VD: Nguyễn Văn A"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email (Tùy chọn)</label>
                <input 
                    {...confirmForm.register("confirmedByEmail")}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    placeholder="email@example.com"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Ghi chú</label>
                <textarea 
                    {...confirmForm.register("notes")} 
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white" 
                    rows={3} 
                    placeholder="Ghi chú thêm..."
                />
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowConfirmModal(false)}>Hủy</Button>
                <Button type="submit" isLoading={confirmMutation.isPending}>Lưu Xác Nhận</Button>
            </div>
        </form>
      </Modal>

      <CancelModal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        onConfirm={handleDispute}
        isLoading={disputeMutation.isPending}
        title="Báo Cáo Sai Lệch"
        message="Vui lòng nhập chi tiết lý do tại sao số liệu không khớp để Admin kiểm tra lại:"
        confirmText="Gửi Báo Cáo"
        cancelText="Đóng"
      />

      <ConfirmDialog 
        isOpen={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        onConfirm={handleSendEmail}
        title="Gửi Email Thông Báo"
        message="Bạn có chắc chắn muốn gửi email thông báo đối chiếu công nợ cho đối tác này không?"
        confirmText="Gửi Ngay"
        cancelText="Hủy"
        variant="info"
        isLoading={sendEmail.isPending}
      />
    </div>
  );
}