"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { 
  ArrowLeft, Download, Mail, User, Phone, MapPin, 
  ShoppingCart, RotateCcw, Package, Receipt, Calendar, Edit 
} from "lucide-react";

// Hooks & Types
import { useDebtReconciliation, useSendReconciliationEmail } from "@/hooks/api/useDebtReconciliation";
import { formatCurrency } from "@/lib/utils";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { SendEmailForm } from "@/components/finance/ActionForms";
import ReconciliationStatusBadge from "@/components/finance/ReconciliationStatus";

// Tabs Component (Nếu bạn chưa có, tôi sẽ viết inline đơn giản ở dưới)
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; 
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";

// Helper in ấn
const handlePrintFrontend = (data: any) => {
    // ... (Giữ nguyên hàm in PDF cũ của bạn hoặc cập nhật CSS nếu cần)
    console.log("Printing...", data);
};

export default function ReconciliationDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Gọi API lấy dữ liệu chi tiết
  const { data: rawData, isLoading } = useDebtReconciliation(id);
  const data = (rawData as any)?.data || rawData; // Safe access

  const sendEmailMutation = useSendReconciliationEmail();

  if (isLoading) return <div className="flex h-96 items-center justify-center text-gray-500">Đang tải dữ liệu...</div>;
  if (!data) return <div className="flex h-96 items-center justify-center text-gray-500">Không tìm thấy dữ liệu.</div>;

  // Lấy thông tin đối tượng (Khách/NCC)
  const target = data.customer || data.supplier || {};
  const isCustomer = !!data.customer;

  return (
    <div className="space-y-6 p-6 bg-gray-50/50 min-h-screen">
      {/* 1. HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/finance/debt-reconciliation" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Chi tiết công nợ
              <ReconciliationStatusBadge status={data.status} size="sm" />
            </h1>
            <p className="text-sm text-gray-500">Mã phiếu: {data.reconciliationCode}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handlePrintFrontend(data)} className="bg-white">
            <Download className="mr-2 h-4 w-4" /> Xuất PDF
          </Button>
          <Button variant="outline" onClick={() => setShowEmailModal(true)} className="bg-white">
            <Mail className="mr-2 h-4 w-4" /> Gửi Email
          </Button>
        </div>
      </div>

      {/* 2. STATS GRID (Tổng quan số liệu) */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        <StatCard label="Nợ đầu kỳ" value={data.openingBalance} />
        <StatCard label="Tổng mua (+)" value={data.transactionsAmount} />
        <StatCard label="Trả hàng (-)" value={data.returnAmount} />
        <StatCard label="Tổng thu/chi (-)" value={data.paymentAmount} />
        <StatCard label="Điều chỉnh (-)" value={data.adjustmentAmount} />
        <StatCard label="Dư nợ hiện tại (=)" value={data.closingBalance} isHighlight />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3. INFO CARD (Thông tin khách hàng) */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 border-b pb-3 mb-4 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" /> 
                    Thông tin {isCustomer ? 'Khách hàng' : 'Nhà cung cấp'}
                </h3>
                
                <div className="space-y-4 text-sm">
                    <InfoRow label="Tên" value={target.customerName || target.supplierName} bold />
                    <InfoRow label="Mã" value={target.customerCode || target.supplierCode} />
                    <InfoRow label="Điện thoại" value={target.phone || "---"} icon={<Phone className="h-3 w-3" />} />
                    <InfoRow label="Địa chỉ" value={target.address || "---"} icon={<MapPin className="h-3 w-3" />} />
                    <InfoRow label="Email" value={target.email || "---"} />
                    <InfoRow label="Phụ trách bởi" value={data.assignedUser?.fullName || "---"} />
                    
                    <div className="pt-3 border-t mt-2">
                        <span className="text-gray-500 block mb-1">Ghi chú:</span>
                        <p className="italic text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                            {data.notes || "Không có ghi chú"}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* 4. TABS SECTION (Lịch sử chi tiết) */}
        <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm min-h-[500px]">
                <Tabs defaultValue="history" className="w-full">
                    <div className="border-b px-4 pt-2">
                        <TabsList className="bg-transparent gap-4">
                            <TabsTrigger value="history" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-2 pb-2">
                                <RotateCcw className="h-4 w-4 mr-2" /> Lịch sử mua hàng
                            </TabsTrigger>
                            <TabsTrigger value="returns" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-2 pb-2">
                                <RotateCcw className="h-4 w-4 mr-2" /> Lịch sử trả hàng
                            </TabsTrigger>
                            <TabsTrigger value="products" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-2 pb-2">
                                <Package className="h-4 w-4 mr-2" /> Sản phẩm đã mua
                            </TabsTrigger>
                            <TabsTrigger value="payments" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-2 pb-2">
                                <Receipt className="h-4 w-4 mr-2" /> Lịch sử thanh toán
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* CONTENT TAB 1: Lịch sử mua hàng */}
                    <TabsContent value="history" className="p-0">
                        <TransactionTable 
                            data={data.transactions?.filter((t:any) => t.type === 'INVOICE') || []} 
                            type="INVOICE"
                        />
                    </TabsContent>

                    {/* CONTENT TAB 2: Lịch sử trả hàng (TODO: Map API thật sau này) */}
                    <TabsContent value="returns" className="p-6 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center h-40">
                            <Package className="h-10 w-10 text-gray-300 mb-2" />
                            <p>Chưa có dữ liệu trả hàng (Tính năng đang phát triển)</p>
                        </div>
                    </TabsContent>

                    {/* CONTENT TAB 3: Sản phẩm đã mua (TODO: Cần API chi tiết sản phẩm) */}
                    <TabsContent value="products" className="p-6 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center h-40">
                            <ShoppingCart className="h-10 w-10 text-gray-300 mb-2" />
                            <p>Vui lòng cập nhật API để lấy danh sách sản phẩm chi tiết.</p>
                        </div>
                    </TabsContent>

                    {/* CONTENT TAB 4: Lịch sử thanh toán */}
                    <TabsContent value="payments" className="p-0">
                        <TransactionTable 
                            data={data.transactions?.filter((t:any) => t.type === 'PAYMENT') || []} 
                            type="PAYMENT"
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
      </div>

      {/* MODAL EMAIL */}
      <Modal 
        isOpen={showEmailModal} 
        onClose={() => setShowEmailModal(false)} 
        className="max-w-lg p-6" // Thêm padding vào class
        showCloseButton={true}
      >
        {/* Tự dựng Header bên trong vì Modal không có prop title */}
        <div className="mb-5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gửi Email Thông Báo</h3>
            <p className="text-sm text-gray-500">Gửi email kèm biên bản đối chiếu cho đối tác.</p>
        </div>

        {showEmailModal && (
            <SendEmailForm
                isLoading={sendEmailMutation.isPending}
                onCancel={() => setShowEmailModal(false)}
                onSubmit={async (formData) => {
                    await sendEmailMutation.mutateAsync({ id, data: formData });
                    setShowEmailModal(false);
                }}
                defaultEmail={target.email || ""}
                defaultName={target.customerName || target.supplierName || ""}
            />
        )}
      </Modal>
    </div>
  );
}

// ==========================================
// SUB-COMPONENTS (Tách nhỏ để code gọn)
// ==========================================

function StatCard({ label, value, isHighlight = false }: { label: string, value: number, isHighlight?: boolean }) {
    return (
        <div className={`bg-white p-4 flex flex-col items-center justify-center text-center h-24 ${isHighlight ? 'bg-blue-50' : ''}`}>
            <span className="text-xs text-gray-500 font-medium uppercase mb-1">{label}</span>
            <span className={`text-lg font-bold ${isHighlight ? 'text-blue-600' : 'text-gray-900'}`}>
                {formatCurrency(value)}
            </span>
        </div>
    );
}

function InfoRow({ label, value, icon, bold = false }: { label: string, value: string, icon?: React.ReactNode, bold?: boolean }) {
    return (
        <div className="flex justify-between items-start">
            <span className="text-gray-500 flex items-center gap-1.5 min-w-[100px]">
                {icon} {label}
            </span>
            <span className={`text-right ${bold ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                {value}
            </span>
        </div>
    );
}

function TransactionTable({ data, type }: { data: any[], type: 'INVOICE' | 'PAYMENT' }) {
    if (data.length === 0) return <div className="p-8 text-center text-gray-500">Không có dữ liệu.</div>;

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-gray-50">
                    <TableRow>
                        <TableCell isHeader className="w-[120px]">Mã phiếu</TableCell>
                        <TableCell isHeader>Ngày tạo</TableCell>
                        <TableCell isHeader>Diễn giải</TableCell>
                        <TableCell isHeader className="text-right">Số tiền</TableCell>
                        <TableCell isHeader className="text-center">Thao tác</TableCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium text-blue-600">{item.code}</TableCell>
                            <TableCell>{format(new Date(item.date), "dd/MM/yyyy HH:mm")}</TableCell>
                            <TableCell>{item.typeLabel}</TableCell>
                            <TableCell className={`text-right font-semibold ${type === 'INVOICE' ? 'text-gray-900' : 'text-green-600'}`}>
                                {formatCurrency(item.amount)}
                            </TableCell>
                            <TableCell className="text-center">
                                {/* Nút xem chi tiết đơn hàng (Link sang module Bán hàng) */}
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Edit className="h-3 w-3 text-gray-400 hover:text-blue-500" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}