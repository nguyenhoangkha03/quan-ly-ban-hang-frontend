"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCustomer,
  useCustomerDebt,
  useCustomerOrders,
  useUpdateCreditLimit,
  useUpdateCustomerStatus,
  useDeleteCustomer,
} from "@/hooks/api";
import Button from "@/components/ui/button/Button";
import { DebtIndicator } from "@/components/customers/DebtIndicator";
import {
  updateCreditLimitSchema,
  updateCustomerStatusSchema,
  type UpdateCreditLimitInput,
  type UpdateCustomerStatusInput,
} from "@/lib/validations";
import {
  ApiResponse,
  Customer,
  CustomerDebtInfo,
  CustomerOrderHistory,
} from "@/types";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building2,
  User,
  DollarSign,
  CreditCard,
  Calendar,
  FileText,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import {
  CUSTOMER_TYPE_LABELS,
  CUSTOMER_CLASSIFICATION_LABELS,
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_STATUS_COLORS,
  CUSTOMER_STATUSES,
  GENDER_LABELS,
} from "@/lib/constants";
import { Can } from "@/components/auth";

/**
 * Customer Detail Page
 * Chi tiết khách hàng với thông tin công nợ và lịch sử mua hàng
 */
export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = parseInt(params.id as string);

  const [showCreditLimitModal, setShowCreditLimitModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Fetch data
  const { data, isLoading, error } = useCustomer(customerId);
  const response = data as unknown as ApiResponse<Customer>;
  const customer = response?.data;

  const { data: debtData } = useCustomerDebt(customerId, !!customer);
  const debtResponse = debtData as unknown as ApiResponse<CustomerDebtInfo>;
  const debtInfo = debtResponse?.data;

  const { data: ordersData } = useCustomerOrders(customerId, 1, 10, !!customer);
  const ordersResponse = ordersData as unknown as ApiResponse<CustomerOrderHistory>;
  const orderHistory = ordersResponse?.data;

  // Mutations
  const updateCreditLimit = useUpdateCreditLimit();
  const updateStatus = useUpdateCustomerStatus();
  const deleteCustomer = useDeleteCustomer();

  // Credit Limit form
  const {
    register: registerCreditLimit,
    handleSubmit: handleSubmitCreditLimit,
    formState: { errors: errorsCreditLimit },
    reset: resetCreditLimit,
  } = useForm<UpdateCreditLimitInput>({
    resolver: zodResolver(updateCreditLimitSchema),
    defaultValues: {
      creditLimit: customer?.creditLimit || 0,
    },
  });

  // Status form
  const {
    register: registerStatus,
    handleSubmit: handleSubmitStatus,
    formState: { errors: errorsStatus },
  } = useForm<UpdateCustomerStatusInput>({
    resolver: zodResolver(updateCustomerStatusSchema),
    defaultValues: {
      status: customer?.status || "active",
    },
  });

  // Handle Update Credit Limit
  const onCreditLimitSubmit = async (data: UpdateCreditLimitInput) => {
    try {
      await updateCreditLimit.mutateAsync({ id: customerId, data });
      setShowCreditLimitModal(false);
      resetCreditLimit();
    } catch (error) {
      console.error("Failed to update credit limit:", error);
    }
  };

  // Handle Update Status
  const onStatusSubmit = async (data: UpdateCustomerStatusInput) => {
    try {
      await updateStatus.mutateAsync({ id: customerId, data });
      setShowStatusModal(false);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!customer) return;

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa khách hàng "${customer.customerName}"?\n\nHành động này không thể hoàn tác.`
      )
    ) {
      return;
    }

    try {
      await deleteCustomer.mutateAsync(customerId);
      router.push("/customers");
    } catch (error) {
      console.error("Failed to delete customer:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <h3 className="font-semibold text-red-900 dark:text-red-300">
          Lỗi khi tải thông tin khách hàng
        </h3>
        <p className="mt-1 text-sm text-red-800 dark:text-red-400">
          {(error as any)?.message || "Không tìm thấy khách hàng"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <Link href="/customers">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>

            {customer.avatarUrl ? (
              <img
                src={customer.avatarUrl}
                alt={customer.customerName}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {customer.customerName}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Mã KH: {customer.customerCode}
              </p>
            </div>

            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                CUSTOMER_STATUS_COLORS[customer.status]
              }`}
            >
              {CUSTOMER_STATUS_LABELS[customer.status]}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Can permission="update_customer">
            <Link href={`/customers/${customerId}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-5 w-5" />
                Chỉnh sửa
              </Button>
            </Link>
          </Can>

          <Can permission="delete_customer">
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleteCustomer.isPending}
            >
              <Trash2 className="mr-2 h-5 w-5" />
              Xóa
            </Button>
          </Can>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Customer Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin cơ bản
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loại khách hàng</p>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {CUSTOMER_TYPE_LABELS[customer.customerType]}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Phân loại</p>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {CUSTOMER_CLASSIFICATION_LABELS[customer.classification]}
                </p>
              </div>

              {customer.gender && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Giới tính</p>
                  <p className="mt-1 font-medium text-gray-900 dark:text-white">
                    {GENDER_LABELS[customer.gender]}
                  </p>
                </div>
              )}

              {customer.contactPerson && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Người liên hệ</p>
                  <p className="mt-1 font-medium text-gray-900 dark:text-white">
                    {customer.contactPerson}
                  </p>
                </div>
              )}

              {customer.taxCode && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mã số thuế</p>
                  <p className="mt-1 font-medium text-gray-900 dark:text-white">
                    {customer.taxCode}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin liên hệ
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Số điện thoại</p>
                  <p className="font-medium text-gray-900 dark:text-white">{customer.phone}</p>
                </div>
              </div>

              {customer.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{customer.email}</p>
                  </div>
                </div>
              )}

              {(customer.address || customer.province) && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Địa chỉ</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {customer.address && `${customer.address}, `}
                      {customer.district && `${customer.district}, `}
                      {customer.province}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Debt Information */}
          {debtInfo && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Thông tin công nợ
                </h2>
                <Can permission="update_customer">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      resetCreditLimit({ creditLimit: customer.creditLimit });
                      setShowCreditLimitModal(true);
                    }}
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Cập nhật hạn mức
                  </Button>
                </Can>
              </div>

              <DebtIndicator
                currentDebt={debtInfo.currentDebt}
                creditLimit={debtInfo.creditLimit}
                showLabel
                showWarning
                size="lg"
              />

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tổng đơn hàng</p>
                  <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                    {debtInfo.totalOrders}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tổng doanh thu</p>
                  <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(debtInfo.totalRevenue)}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Đã thanh toán</p>
                  <p className="mt-1 text-xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(debtInfo.totalPaid)}
                  </p>
                </div>

                {debtInfo.lastOrderDate && (
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Đơn hàng gần nhất</p>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                      {format(new Date(debtInfo.lastOrderDate), "dd/MM/yyyy")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order History */}
          {orderHistory && orderHistory.orders.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Lịch sử mua hàng
                </h2>
                <Link href={`/sales/orders?customerId=${customerId}`}>
                  <Button variant="outline" size="sm">
                    Xem tất cả
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {orderHistory.orders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.orderCode || `#${order.id}`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(order.totalAmount || 0)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {order.paymentStatus || "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {customer.notes && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Ghi chú
              </h2>
              <p className="text-gray-700 dark:text-gray-300">{customer.notes}</p>
            </div>
          )}
        </div>

        {/* Right Column - Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Thao tác nhanh
            </h2>

            <div className="space-y-2">
              <Can permission="update_customer">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowStatusModal(true)}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Cập nhật trạng thái
                </Button>
              </Can>

              <Can permission="create_sales_order">
                <Link href={`/sales/orders/create?customerId=${customerId}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Tạo đơn hàng mới
                  </Button>
                </Link>
              </Can>
            </div>
          </div>

          {/* Metadata */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin hệ thống
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Ngày tạo</p>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {format(new Date(customer.createdAt), "dd/MM/yyyy HH:mm")}
                </p>
              </div>

              {customer.updatedAt && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Cập nhật gần nhất</p>
                  <p className="mt-1 font-medium text-gray-900 dark:text-white">
                    {format(new Date(customer.updatedAt), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
              )}

              {customer.debtUpdatedAt && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Cập nhật công nợ</p>
                  <p className="mt-1 font-medium text-gray-900 dark:text-white">
                    {format(new Date(customer.debtUpdatedAt), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
              )}

              {customer.creator && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Người tạo</p>
                  <p className="mt-1 font-medium text-gray-900 dark:text-white">
                    {customer.creator.fullName}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Update Credit Limit Modal */}
      {showCreditLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Cập nhật hạn mức công nợ
            </h3>

            <form onSubmit={handleSubmitCreditLimit(onCreditLimitSubmit)} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hạn mức mới (VND) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...registerCreditLimit("creditLimit", { valueAsNumber: true })}
                  min="0"
                  step="1000"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                />
                {errorsCreditLimit.creditLimit && (
                  <p className="mt-1 text-sm text-red-600">
                    {errorsCreditLimit.creditLimit.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Lý do thay đổi
                </label>
                <textarea
                  {...registerCreditLimit("reason")}
                  rows={3}
                  placeholder="VD: Khách hàng thanh toán đúng hạn, tăng hạn mức..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreditLimitModal(false);
                    resetCreditLimit();
                  }}
                >
                  Hủy
                </Button>
                <Button type="submit" variant="primary" disabled={updateCreditLimit.isPending}>
                  {updateCreditLimit.isPending ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Cập nhật trạng thái khách hàng
            </h3>

            <form onSubmit={handleSubmitStatus(onStatusSubmit)} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Trạng thái <span className="text-red-500">*</span>
                </label>
                <select
                  {...registerStatus("status")}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                >
                  {Object.values(CUSTOMER_STATUSES).map((status) => (
                    <option key={status} value={status}>
                      {CUSTOMER_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
                {errorsStatus.status && (
                  <p className="mt-1 text-sm text-red-600">{errorsStatus.status.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Lý do thay đổi
                </label>
                <textarea
                  {...registerStatus("reason")}
                  rows={3}
                  placeholder="VD: Khách hàng vi phạm điều khoản thanh toán..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowStatusModal(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" variant="primary" disabled={updateStatus.isPending}>
                  {updateStatus.isPending ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
