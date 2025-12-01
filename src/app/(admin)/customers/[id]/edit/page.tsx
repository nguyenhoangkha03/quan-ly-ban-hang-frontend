"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useCustomer, useUpdateCustomer } from "@/hooks/api";
import CustomerForm from "@/components/customers/CustomerForm";
import Button from "@/components/ui/button/Button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { UpdateCustomerInput } from "@/lib/validations";
import { ApiResponse, Customer } from "@/types";

/**
 * Edit Customer Page
 * Chỉnh sửa thông tin khách hàng
 */
export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = Number(params.id);

  const { data, isLoading, error } = useCustomer(customerId);
  const response = data as unknown as ApiResponse<Customer>;
  const customer = response?.data;

  const updateCustomer = useUpdateCustomer();

  const handleSubmit = async (data: UpdateCustomerInput) => {
    try {
      await updateCustomer.mutateAsync({ id: customerId, data });
      router.push(`/customers/${customerId}`);
    } catch (error) {
      console.error("Failed to update customer:", error);
    }
  };

  const handleCancel = () => {
    router.push(`/customers/${customerId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-brand-600" />
          <span className="text-gray-600 dark:text-gray-400">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <h3 className="font-semibold text-red-900 dark:text-red-300">
          Không thể tải thông tin khách hàng
        </h3>
        <p className="mt-1 text-sm text-red-800 dark:text-red-400">
          {(error as any)?.message || "Khách hàng không tồn tại"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Link href={`/customers/${customerId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Chỉnh Sửa Khách Hàng
          </h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Cập nhật thông tin khách hàng: {customer.customerName}
        </p>
      </div>

      {/* Form */}
      <CustomerForm
        customer={customer}
        isEdit
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={updateCustomer.isPending}
      />
    </div>
  );
}
