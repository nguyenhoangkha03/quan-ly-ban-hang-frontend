"use client"
import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useApprovePaymentVoucher, usePaymentVoucher } from "@/hooks";
import { PaymentVoucher } from "@/types";
import Link from "next/link";
import { 
  ArrowLeft, CheckCircle, Printer, Calendar, 
  CreditCard, User, FileText, Info, Banknote, Edit3 
} from "lucide-react";
import { Can } from "@/components/auth";
import { format } from "date-fns";

export default function PaymentVouchersDetailPage() {
    const params = useParams();
    const paymentVoucherid = parseInt(params.id as string);
    const { data: voucherWrapper, isLoading } = usePaymentVoucher(paymentVoucherid);
    const voucher = voucherWrapper as unknown as PaymentVoucher;
    const approveVoucher = useApprovePaymentVoucher();
    const router = useRouter();

    console.log("Ngày chi", voucher.paymentDate, typeof(voucher.paymentDate))
    const handlePrint = async (id: number) => {
        router.push(`/finance/vouchers/${id}/print`);
    };

    const handleEdit = async (id: number) => {
        router.push(`/finance/vouchers/${id}/edit`);
    };


    const handleApprove = async (id: number, voucherCode: string) => {
        if (!window.confirm(`Phê duyệt phiếu chi "${voucherCode}"?`)) return;
        await approveVoucher.mutateAsync({ id });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            </div>
        );
    }

    if (!voucher) return <div className="p-6">Không tìm thấy dữ liệu...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {voucher.voucherCode}
                        </h1>
                        {voucher.isPosted ? (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                Đã ghi sổ
                            </span>
                        ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                Chưa ghi sổ
                            </span>
                        )}
                        {voucher.approvedAt ? (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                Đã phê duyệt
                            </span>
                        ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                Chưa phê duyệt
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500">Phiếu chi</p>
                    <p className="text-sm text-gray-500">Ngày tạo: {format(new Date(voucher.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href="/finance/vouchers"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300"
                    >
                        <ArrowLeft className="h-4 w-4" /> Quay lại
                    </Link>
                    
                    <button
                        onClick={() => handlePrint(voucher.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300"
                    >
                        <Printer className="h-4 w-4" /> In phiếu
                    </button>

                    {!voucher.approvedAt && (
                        <div className="flex gap-2">
                            <Can permission="update_payment_voucher">
                                <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                        onClick={() => handleEdit(voucher.id)}
                                >
                                    <Edit3 className="h-4 w-4" /> Chỉnh sửa
                                </button>
                            </Can>
                            <Can permission="approve_payment">
                                <button
                                    onClick={() => handleApprove(voucher.id, voucher.voucherCode)}
                                    disabled={approveVoucher.isPending}
                                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                    <CheckCircle className="h-4 w-4" /> Phê duyệt
                                </button>
                            </Can>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                            <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                                <FileText className="h-5 w-5 text-blue-500" /> Thông tin chi tiết
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                            <InfoItem label="Loại chứng từ" value={voucher.voucherType === 'other' ? 'Chi khác' : voucher.voucherType} />
                            <InfoItem label="Tài khoản chi phí" value={voucher.expenseAccount} />
                            <InfoItem 
                                label="Ngày thanh toán" 
                                value={format(new Date(voucher.paymentDate), 'dd/MM/yyyy')} 
                                icon={<Calendar className="h-4 w-4" />}
                            />
                            <InfoItem 
                                label="Phương thức" 
                                value={voucher.paymentMethod === 'transfer' ? 'Chuyển khoản' : 'Tiền mặt'} 
                                icon={<CreditCard className="h-4 w-4" />}
                            />
                            <div className="sm:col-span-2">
                                <InfoItem label="Nhà cung cấp" value={voucher.supplier?.fullName || "N/A"} />
                            </div>
                            <div className="sm:col-span-2">
                                <InfoItem label="Nội dung / Ghi chú" value={voucher.notes || "---"} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                            <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                                <Info className="h-5 w-5 text-orange-500" /> Thông tin hệ thống
                            </h2>
                        </div>
                        <div className="p-5">
                            <div className="relative border-l-2 border-gray-100 pl-4 dark:border-gray-700 space-y-6">
                                <div className="relative">
                                    <span className="absolute -left-[25px] flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 ring-4 ring-white dark:bg-blue-900 dark:ring-gray-800">
                                        <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                                    </span>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Người lập phiếu</p>
                                    <p className="text-xs text-gray-500">{voucher.creator?.fullName} ({voucher.creator?.employeeCode})</p>
                                    <p className="text-[10px] text-gray-400">{format(new Date(voucher.createdAt), 'dd/MM/yyyy HH:mm:ss')}</p>
                                </div>

                                {voucher.approvedAt && (
                                    <div className="relative">
                                        <span className="absolute -left-[25px] flex h-4 w-4 items-center justify-center rounded-full bg-green-100 ring-4 ring-white dark:bg-green-900 dark:ring-gray-800">
                                            <div className="h-2 w-2 rounded-full bg-green-600"></div>
                                        </span>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Người phê duyệt</p>
                                        <p className="text-xs text-gray-500">{voucher.approver?.fullName} ({voucher.approver?.employeeCode})</p>
                                        <p className="text-[10px] text-gray-400">{format(new Date(voucher.approvedAt), 'dd/MM/yyyy HH:mm:ss')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cột phải: Tổng tiền & Ngân hàng */}
                <div className="space-y-6">
                    <div className="rounded-xl bg-blue-600 p-6 text-white shadow-lg shadow-blue-200 dark:shadow-none">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-100">Tổng tiền chi</p>
                            <Banknote className="h-6 w-6 text-blue-200" />
                        </div>
                        <p className="mt-2 text-3xl font-bold">
                            {Number(voucher.amount).toLocaleString("vi-VN")} <span className="text-lg">₫</span>
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Tài khoản thanh toán</h3>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                                <CreditCard className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{voucher.bankName || "---"}</p>
                                <p className="text-xs text-gray-500">Ngân hàng thụ hưởng</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function InfoItem({ label, value, icon }: { label: string; value: any; icon?: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
            <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-200 font-medium">
                {icon && <span className="text-gray-400">{icon}</span>}
                {value}
            </div>
        </div>
    );
}