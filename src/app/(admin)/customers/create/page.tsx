"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCreateCustomer } from "@/hooks/api";
import CustomerForm from "@/components/features/customers/CustomerForm";
import Button from "@/components/ui/button/Button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { CreateCustomerInput } from "@/lib/validations";

/**
 * Create Customer Page
 * Tạo khách hàng mới
 */
export default function CreateCustomerPage() {
  const router = useRouter();
  const createCustomer = useCreateCustomer();

  const handleSubmit = async (data: CreateCustomerInput) => {
    try {
      const response = await createCustomer.mutateAsync(data);
      router.push(`/customers/${response.data.id}`);
    } catch (error) {
      console.error("Failed to create customer:", error);
    }
  };

  const handleCancel = () => {
    router.push("/customers");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Link href="/customers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Thêm Khách Hàng Mới
          </h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tạo khách hàng mới trong hệ thống
        </p>
      </div>

      {/* Form */}
      <CustomerForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createCustomer.isPending}
      />
    </div>
  );
}
