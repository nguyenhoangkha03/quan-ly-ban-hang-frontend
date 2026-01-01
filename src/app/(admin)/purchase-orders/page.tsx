"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  usePurchaseOrders,
  useSuppliers,
  useWarehouses,
  useApprovePurchaseOrder,
  useCancelPurchaseOrder,
  useDeletePurchaseOrder,
} from "@/hooks/api";
import { Can } from "@/components/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import Card from "@/components/ui/card/Card";
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";
import type {
  PurchaseOrder,
  Supplier,
  Warehouse,
  ApiResponse,
  PurchaseOrderStatus,
} from "@/types";
import { useDebounce } from "@/hooks";
import Pagination from "@/components/tables/Pagination";
import {
  MoreVertical,
  Eye,
  Printer,
  CheckCircle,
  XCircle,
  Search,
  ShoppingCart,
  Clock,
  CheckCircle2,
  X,
  RotateCcw,
  Calendar,
  PackageCheck,
  Plus,
  Trash2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import CancelModal from "@/components/ui/modal/CancelModal";
import { getStatusInfo } from "@/lib/purchaseOrder";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";

export default function PurchaseOrdersPage() {
  const router = useRouter();

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | "all">("all");
  const [supplierFilter, setSupplierFilter] = useState<number | "all">("all");
  const [warehouseFilter, setWarehouseFilter] = useState<number | "all">("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Dropdown state
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Confirm dialog states
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPO, setSelectedPO] = useState<{ id: number; poCode: string } | null>(null);

  // Date input refs
  const fromDateRef = React.useRef<HTMLInputElement>(null);
  const toDateRef = React.useRef<HTMLInputElement>(null);

  // Mutations
  const approveMutation = useApprovePurchaseOrder();
  const cancelMutation = useCancelPurchaseOrder();
  const deleteMutation = useDeletePurchaseOrder();

  // Fetch suppliers for filter
  const { data: suppliersResponse, isLoading: suppliersLoading } = useSuppliers({
    limit: 1000,
  });
  const suppliers = (suppliersResponse?.data as unknown as Supplier[]) || [];

  // Fetch warehouses for filter
  const { data: warehousesResponse, isLoading: warehousesLoading } = useWarehouses({
    limit: 1000,
  });
  const warehouses = (warehousesResponse?.data as unknown as Warehouse[]) || [];

  // Fetch purchase orders
  const { data: responseWrapper, isLoading, error } = usePurchaseOrders({
    page,
    limit,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(supplierFilter !== "all" && { supplierId: supplierFilter }),
    ...(warehouseFilter !== "all" && { warehouseId: warehouseFilter }),
    ...(fromDate && { fromDate }),
    ...(toDate && { toDate }),
  });

  const response = responseWrapper as unknown as ApiResponse<PurchaseOrder[]>;
  const purchaseOrders = response?.data || [];
  const paginationMeta = response?.meta;
  

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, supplierFilter, warehouseFilter, fromDate, toDate]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  // Handlers
  const handleApprove = (id: number, poCode: string) => {
    setSelectedPO({ id, poCode });
    setShowApproveDialog(true);
    setOpenDropdownId(null);
  };

  const handleConfirmApprove = () => {
    if (selectedPO) {
      approveMutation.mutate({ id: selectedPO.id });
      setShowApproveDialog(false);
      setSelectedPO(null);
    }
  };

  const handleCancelClick = (id: number, poCode: string) => {
    setSelectedPO({ id, poCode });
    setShowCancelModal(true);
    setOpenDropdownId(null);
  };

  const handleCancel = (reason: string) => {
    if (selectedPO) {
      cancelMutation.mutate(
        { id: selectedPO.id, reason },
        {
          onSuccess: () => {
            setShowCancelModal(false);
            setSelectedPO(null);
          },
        }
      );
    }
  };

  const handlePrint = (id: number) => {
    window.open(`/purchase-orders/${id}/print`, "_blank");
    setOpenDropdownId(null);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSupplierFilter("all");
    setWarehouseFilter("all");
    setFromDate("");
    setToDate("");
  };

  const handleDelete = (id: number) => {
    setSelectedPO({ id, poCode: "" });
    setShowDeleteDialog(true);
    setOpenDropdownId(null);
  }

  const handleConfirmDelete = async () => {
    if (selectedPO) {
      await deleteMutation.mutateAsync(selectedPO.id);
      setShowDeleteDialog(false);
      setSelectedPO(null);
    }
  }

  // Calculate statistics
  const stats = {
    total: paginationMeta?.total || 0,
    pending: purchaseOrders.filter((po) => po.status === "pending").length,
    approved: purchaseOrders.filter((po) => po.status === "approved").length,
    received: purchaseOrders.filter((po) => po.status === "received").length,
    cancelled: purchaseOrders.filter((po) => po.status === "cancelled").length,
  };

  // Check if has active filters
  const hasActiveFilters =
    searchTerm !== "" ||
    statusFilter !== "all" ||
    supplierFilter !== "all" ||
    warehouseFilter !== "all" ||
    fromDate !== "" ||
    toDate !== "";

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/10">
        <p className="text-red-800 dark:text-red-200">
          Lỗi khi tải danh sách đơn đặt hàng: {(error as any)?.message || "Unknown error"}
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
            Quản Lý Đơn Đặt Hàng
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Quản lý đơn đặt hàng từ nhà cung cấp
          </p>
        </div>

        <Can permission="create_purchase_order">
          <Button
            onClick={() => router.push("/purchase-orders/create")}
            variant="primary"
            size="smm"
          >
            <Plus className="h-5 w-5" />
            Tạo đơn đặt hàng
          </Button>
        </Can>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tổng đơn
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total.toLocaleString()}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
              <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        {/* Pending */}
        <Card onClick={() => setStatusFilter("pending")} hoverable>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Chờ duyệt
              </p>
              <p className="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.pending.toLocaleString()}
              </p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900/20">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>

        {/* Approved */}
        <Card onClick={() => setStatusFilter("approved")} hoverable>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Đã duyệt
              </p>
              <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.approved.toLocaleString()}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
              <CheckCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        {/* Received */}
        <Card onClick={() => setStatusFilter("received")} hoverable>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Đã nhận hàng
              </p>
              <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.received.toLocaleString()}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <PackageCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo mã đơn, nhà cung cấp..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Bộ lọc:
          </span>

          {searchTerm && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
              🔍 "{searchTerm}"
              <button
                onClick={() => setSearchTerm("")}
                className="hover:text-blue-900 dark:hover:text-blue-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {statusFilter !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
              Trạng thái: {getStatusInfo(statusFilter).label}
              <button
                onClick={() => setStatusFilter("all")}
                className="hover:text-yellow-900 dark:hover:text-yellow-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {supplierFilter !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
              NCC: {suppliers.find((s) => s.id === supplierFilter)?.supplierName || supplierFilter}
              <button
                onClick={() => setSupplierFilter("all")}
                className="hover:text-purple-900 dark:hover:text-purple-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {warehouseFilter !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400">
              Kho: {warehouses.find((w) => w.id === warehouseFilter)?.warehouseName || warehouseFilter}
              <button
                onClick={() => setWarehouseFilter("all")}
                className="hover:text-indigo-900 dark:hover:text-indigo-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {(fromDate || toDate) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
              📅 {fromDate && new Date(fromDate).toLocaleDateString("vi-VN")}
              {fromDate && toDate && " - "}
              {toDate && new Date(toDate).toLocaleDateString("vi-VN")}
              <button
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
                className="hover:text-green-900 dark:hover:text-green-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <RotateCcw className="h-3 w-3" />
            Xóa tất cả
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
        {/* Status Filter */}
        <div>
          <label
            htmlFor="statusFilter"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Trạng thái
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="received">Đã nhận hàng</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        {/* Supplier Filter */}
        <div>
          <label
            htmlFor="supplierFilter"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Nhà cung cấp
          </label>
          <SearchableSelect
            options={[
              { value: "all", label: "Tất cả NCC" },
              ...suppliers.map((s) => ({
                value: s.id,
                label: s.supplierName,
              })),
            ]}
            value={supplierFilter}
            onChange={(value) => setSupplierFilter(value as number | "all")}
            placeholder="Tìm kiếm NCC..."
            isLoading={suppliersLoading}
          />
        </div>

        {/* Warehouse Filter */}
        <div>
          <label
            htmlFor="warehouseFilter"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Kho
          </label>
          <SearchableSelect
            options={[
              { value: "all", label: "Tất cả kho" },
              ...warehouses.map((w) => ({
                value: w.id,
                label: `${w.warehouseCode} - ${w.warehouseName}`,
              })),
            ]}
            value={warehouseFilter}
            onChange={(value) => setWarehouseFilter(value as number | "all")}
            placeholder="Tìm kiếm kho..."
            isLoading={warehousesLoading}
          />
        </div>

        {/* From Date */}
        <div>
          <label
            htmlFor="fromDate"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Từ ngày
          </label>
          <div className="relative">
            <input
              ref={fromDateRef}
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <button
              type="button"
              onClick={() => fromDateRef.current?.showPicker()}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              title="Chọn ngày"
            >
              <Calendar className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* To Date */}
        <div>
          <label
            htmlFor="toDate"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Đến ngày
          </label>
          <div className="relative">
            <input
              ref={toDateRef}
              id="toDate"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <button
              type="button"
              onClick={() => toDateRef.current?.showPicker()}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              title="Chọn ngày"
            >
              <Calendar className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Items per page */}
        <div>
          <label
            htmlFor="limit"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Hiển thị
          </label>
          <select
            id="limit"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
            <option value={50}>50 / trang</option>
            <option value={100}>100 / trang</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-visible min-h-80 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : purchaseOrders.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <svg
              className="mb-4 h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className="text-sm">Không có đơn đặt hàng nào</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Mã đơn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Nhà cung cấp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Kho
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Ngày đặt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Ngày giao dự kiến
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Thao tác
                </th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrders.map((po) => {
                const statusInfo = getStatusInfo(po.status);
                // console.log(po)

                return (
                  <TableRow key={po.id}>
                    <TableCell className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      <Link
                        href={`/purchase-orders/${po.id}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {po.poCode}
                      </Link>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {po.supplier?.supplierName || "—"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {po.warehouse?.warehouseName || "—"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(po.orderDate).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {po.expectedDeliveryDate
                        ? new Date(po.expectedDeliveryDate).toLocaleDateString("vi-VN")
                        : "—"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(Number(po.totalAmount))}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right text-sm">
                      <div className="relative flex items-center justify-end gap-2">
                        {/* Quick View Link */}
                        <Link
                          href={`/purchase-orders/${po.id}`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {/* Quick Print Button */}
                        <button
                          onClick={() => handlePrint(po.id)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                          title="In đơn"
                        >
                          <Printer className="h-4 w-4" />
                        </button>

                        {/* Dropdown Menu */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenDropdownId(
                                openDropdownId === po.id ? null : po.id
                              )
                            }
                            className="dropdown-toggle p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            title="Thêm thao tác"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          <Dropdown
                            isOpen={openDropdownId === po.id}
                            onClose={() => setOpenDropdownId(null)}
                            className="w-48"
                          >
                            {/* View Details */}
                            <DropdownItem
                              tag="a"
                              href={`/purchase-orders/${po.id}`}
                              onItemClick={() => setOpenDropdownId(null)}
                              className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                              <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                <span>Xem chi tiết</span>
                              </div>
                            </DropdownItem>

                            {/* Approve - Only for pending status */}
                            {po.status === "pending" && (
                              <>
                                <Can permission="update_purchase_order">
                                  <DropdownItem
                                    tag="a"
                                    href={`/purchase-orders/${po.id}/edit`}
                                    onItemClick={() => setOpenDropdownId(null)}
                                    className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                  >
                                    <div className="flex items-center gap-2">
                                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                      <span>Chỉnh sửa</span>
                                    </div>
                                  </DropdownItem>
                                </Can>
                                <Can permission="approve_purchase_order">
                                  <DropdownItem
                                    onClick={() => handleApprove(po.id, po.poCode)}
                                    className="text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                                  >
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4" />
                                      <span>Phê duyệt</span>
                                    </div>
                                  </DropdownItem>
                                </Can>
                              </>
                            )}

                            {/* Receive - Only for approved status */}
                            {po.status === "approved" && (
                              <Can permission="receive_purchase_order">
                                <DropdownItem
                                  tag="a"
                                  href={`/inventory/transactions/import?po_id=${po.id}`}
                                  onItemClick={() => setOpenDropdownId(null)}
                                  className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                >
                                  <div className="flex items-center gap-2">
                                    <PackageCheck className="h-4 w-4" />
                                    <span>Nhận hàng</span>
                                  </div>
                                </DropdownItem>
                              </Can>
                            )}

                            {/* Received - For received status */}
                            {po.status === "received" && (
                              <Can permission="receive_purchase_order">
                                <DropdownItem
                                  disabled
                                  className="text-gray-400 cursor-not-allowed dark:text-gray-600"
                                >
                                  <div className="flex items-center gap-2">
                                    <PackageCheck className="h-4 w-4" />
                                    <span>Đã nhận hàng</span>
                                  </div>
                                </DropdownItem>
                              </Can>
                            )}

                            {/* Cancel - For pending/approved status */}
                            {(po.status === "pending" || po.status === "approved") && (
                              <Can permission="cancel_purchase_order">
                                <DropdownItem
                                  onClick={() => handleCancelClick(po.id, po.poCode)}
                                  className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                  <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4" />
                                    <span>Hủy đơn</span>
                                  </div>
                                </DropdownItem>
                              </Can>
                            )}

                            {/* Delete - Only for pending status */}
                            {po.status === "pending" &&  (
                              <Can permission="delete_purchase_order">
                                <DropdownItem
                                  onClick={() => handleDelete(po.id)}
                                  className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                  <div className="flex items-center gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    <span>Xóa đơn</span>
                                  </div>
                                </DropdownItem>
                              </Can>
                            )}

                            {/* Divider */}
                            <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>

                            {/* Print */}
                            <DropdownItem
                              onClick={() => handlePrint(po.id)}
                              className="dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                              <div className="flex items-center gap-2">
                                <Printer className="h-4 w-4" />
                                <span>In đơn</span>
                              </div>
                            </DropdownItem>
                          </Dropdown>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {paginationMeta && paginationMeta.total > 0 && (
        <div className="mt-6 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Hiển thị{" "}
            <span className="font-medium">
              {(paginationMeta.page - 1) * paginationMeta.limit + 1}
            </span>{" "}
            đến{" "}
            <span className="font-medium">
              {Math.min(
                paginationMeta.page * paginationMeta.limit,
                paginationMeta.total
              )}
            </span>{" "}
            trong tổng số{" "}
            <span className="font-medium">{paginationMeta.total}</span> đơn
          </div>
          {paginationMeta.totalPages > 1 && (
            <Pagination
              currentPage={paginationMeta.page}
              totalPages={paginationMeta.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        onConfirm={handleConfirmApprove}
        title="Phê duyệt đơn đặt hàng"
        message={`Bạn có chắc chắn muốn phê duyệt đơn đặt hàng ${selectedPO?.poCode}?`}
        confirmText="Phê duyệt"
        variant="info"
        isLoading={approveMutation.isPending}
      />

      {/* Cancel Confirmation Dialog */}
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        title="Hủy đơn đặt hàng"
        message={`Bạn có chắc chắn muốn hủy đơn đặt hàng ${selectedPO?.poCode}?`}
        isLoading={cancelMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Xóa đơn đặt hàng"
        message={`Bạn có chắc chắn muốn xóa đơn đặt hàng ${selectedPO?.poCode}?`}
        confirmText="Xóa"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
