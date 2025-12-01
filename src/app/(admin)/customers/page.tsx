"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useCustomers, useDeleteCustomer, useBulkDeleteCustomers } from "@/hooks/api";
import { Can } from "@/components/auth";
import Button from "@/components/ui/button/Button";
import CustomerTable from "@/components/customers/CustomerTable";
import { ApiResponse, Customer, CustomerStatus, CustomerType, CustomerClassification } from "@/types";
import { Plus, Trash2, Users, AlertCircle, TrendingUp, DollarSign } from "lucide-react";
import { VIETNAM_PROVINCES } from "@/types";
import { formatCurrency } from "@/lib/utils";

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [customerTypeFilter, setCustomerTypeFilter] = useState<CustomerType | "all">("all");
  const [classificationFilter, setClassificationFilter] = useState<CustomerClassification | "all">("all");
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | "all">("all");
  const [provinceFilter, setProvinceFilter] = useState<string>("all");
  const [hasDebtFilter, setHasDebtFilter] = useState<boolean | "all">("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Fetch Customers
  const { data, isLoading, error } = useCustomers({
    customerType: customerTypeFilter !== "all" ? customerTypeFilter : undefined,
    classification: classificationFilter !== "all" ? classificationFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    province: provinceFilter !== "all" ? provinceFilter : undefined,
    hasDebt: hasDebtFilter !== "all" ? hasDebtFilter : undefined,
  });
  const response = data as unknown as ApiResponse<Customer[]>;
  const deleteCustomer = useDeleteCustomer();
  const bulkDeleteCustomers = useBulkDeleteCustomers();

  // Filter customers by search
  const customers = useMemo(() => {
    if (!response?.data) return [];

    return response.data.filter((customer) => {
      const matchesSearch =
        (customer.customerCode?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (customer.customerName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (customer.phone?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (customer.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [response?.data, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!customers.length) return { total: 0, active: 0, withDebt: 0, overLimit: 0 };

    return {
      total: customers.length,
      active: customers.filter((c) => c.status === "active").length,
      withDebt: customers.filter((c) => c.currentDebt > 0).length,
      overLimit: customers.filter((c) => c.creditLimit > 0 && c.currentDebt >= c.creditLimit).length,
    };
  }, [customers]);

  // Handle Delete
  const handleDelete = async (id: number, customerName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${customerName}"?`)) {
      return;
    }
    await deleteCustomer.mutateAsync(id);
    setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
  };

  // Handle Bulk Delete
  const handleBulkDelete = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} khách hàng đã chọn?`)) {
      return;
    }
    await bulkDeleteCustomers.mutateAsync(selectedIds);
    setSelectedIds([]);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setCustomerTypeFilter("all");
    setClassificationFilter("all");
    setStatusFilter("all");
    setProvinceFilter("all");
    setHasDebtFilter("all");
  };

  const hasActiveFilters =
    searchTerm ||
    customerTypeFilter !== "all" ||
    classificationFilter !== "all" ||
    statusFilter !== "all" ||
    provinceFilter !== "all" ||
    hasDebtFilter !== "all";

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <h3 className="font-semibold text-red-900 dark:text-red-300">
          Lỗi khi tải danh sách khách hàng
        </h3>
        <p className="mt-1 text-sm text-red-800 dark:text-red-400">
          {(error as any)?.message || "Đã có lỗi xảy ra"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quản Lý Khách Hàng
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Quản lý thông tin khách hàng và theo dõi công nợ
          </p>
        </div>

        <Can permission="create_customer">
          <Link href="/customers/create">
            <Button variant="primary">
              <Plus className="mr-2 h-5 w-5" />
              Thêm khách hàng
            </Button>
          </Link>
        </Can>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng khách hàng</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Đang hoạt động</p>
              <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.active}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Có công nợ</p>
              <p className="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.withDebt}
              </p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900/30">
              <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Vượt hạn mức</p>
              <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.overLimit}
              </p>
            </div>
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {/* Search */}
          <div className="md:col-span-2">
            <label
              htmlFor="search"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Tìm kiếm
            </label>
            <input
              type="text"
              id="search"
              placeholder="Mã, tên, SĐT, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Customer Type Filter */}
          <div>
            <label
              htmlFor="customerType"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Loại KH
            </label>
            <select
              id="customerType"
              value={customerTypeFilter}
              onChange={(e) => setCustomerTypeFilter(e.target.value as CustomerType | "all")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Tất cả</option>
              <option value="individual">Cá nhân</option>
              <option value="company">Công ty</option>
            </select>
          </div>

          {/* Classification Filter */}
          <div>
            <label
              htmlFor="classification"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Phân loại
            </label>
            <select
              id="classification"
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value as CustomerClassification | "all")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Tất cả</option>
              <option value="retail">Bán lẻ</option>
              <option value="wholesale">Bán sỉ</option>
              <option value="vip">VIP</option>
              <option value="distributor">Đại lý</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Trạng thái
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CustomerStatus | "all")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Tạm ngưng</option>
              <option value="blacklisted">Danh sách đen</option>
            </select>
          </div>

          {/* Province Filter */}
          <div>
            <label
              htmlFor="province"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Tỉnh/TP
            </label>
            <select
              id="province"
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">Tất cả</option>
              {VIETNAM_PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Has Debt Filter */}
        <div className="mt-4 flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={hasDebtFilter === true}
              onChange={(e) => setHasDebtFilter(e.target.checked ? true : "all")}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Chỉ hiển thị KH có công nợ</span>
          </label>
        </div>

        {hasActiveFilters && (
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
              Đã chọn {selectedIds.length} khách hàng
            </p>
            <Can permission="delete_customer">
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkDeleteCustomers.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa đã chọn
              </Button>
            </Can>
          </div>
        </div>
      )}

      {/* Customers Table */}
      <CustomerTable
        customers={customers}
        isLoading={isLoading}
        onDelete={handleDelete}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        showBulkActions
      />
    </div>
  );
}
