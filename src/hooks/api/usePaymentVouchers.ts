/**
 * Payment Vouchers API Hooks
 * React Query hooks for payment vouchers (phiếu chi)
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type {
  ApiResponse,
  PaginationParams,
  PaginationMeta,
} from "@/types/common.types";
import type {
  PaymentVoucher,
  CreatePaymentVoucherDto,
  UpdatePaymentVoucherDto,
  ApproveVoucherDto,
  PaymentVoucherFilters,
  PaymentVoucherStatistics,
} from "@/types/finance.types";
import { toast } from "react-hot-toast";

// =====================================================
// QUERY KEYS
// =====================================================

export const paymentVoucherKeys = {
  all: ["payment-vouchers"] as const,
  lists: () => [...paymentVoucherKeys.all, "list"] as const,
  list: (filters?: PaymentVoucherFilters & PaginationParams) =>
    [...paymentVoucherKeys.lists(), filters] as const,
  details: () => [...paymentVoucherKeys.all, "detail"] as const,
  detail: (id: number) => [...paymentVoucherKeys.details(), id] as const,
  statistics: (filters?: PaymentVoucherFilters) =>
    [...paymentVoucherKeys.all, "statistics", filters] as const,
};

// =====================================================
// QUERY HOOKS
// =====================================================

/**
 * Get payment vouchers list with filters
 */
export function usePaymentVouchers(
  filters?: PaymentVoucherFilters & PaginationParams
) {
  return useQuery({
    queryKey: paymentVoucherKeys.list(filters),
    queryFn: async () => {
      const response = await api.get<
        ApiResponse<{ vouchers: PaymentVoucher[]; meta: PaginationMeta }>
      >("/payment-vouchers", {
        params: filters,
      });
      return response.data;
    },
  });
}

/**
 * Get single payment voucher by ID
 */
export function usePaymentVoucher(id: number) {
  return useQuery({
    queryKey: paymentVoucherKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<PaymentVoucher>>(
        `/payment-vouchers/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Get supplier payment vouchers
 */
export function useSupplierPaymentVouchers(
  supplierId: number,
  filters?: PaginationParams
) {
  return useQuery({
    queryKey: paymentVoucherKeys.list({
      voucherType: "supplier_payment",
      supplierId,
      ...filters,
    }),
    queryFn: async () => {
      const response = await api.get<
        ApiResponse<{ vouchers: PaymentVoucher[]; meta: PaginationMeta }>
      >("/payment-vouchers", {
        params: {
          voucherType: "supplier_payment",
          supplierId,
          ...filters,
        },
      });
      return response.data;
    },
    enabled: !!supplierId,
  });
}

/**
 * Get payment voucher statistics
 */
export function usePaymentVoucherStatistics(filters?: PaymentVoucherFilters) {
  return useQuery({
    queryKey: paymentVoucherKeys.statistics(filters),
    queryFn: async () => {
      const response = await api.get<ApiResponse<PaymentVoucherStatistics>>(
        "/payment-vouchers/statistics",
        {
          params: filters,
        }
      );
      return response.data;
    },
  });
}

// =====================================================
// MUTATION HOOKS
// =====================================================

/**
 * Create new payment voucher
 */
export function useCreatePaymentVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePaymentVoucherDto) => {
      const response = await api.post<ApiResponse<PaymentVoucher>>(
        "/payment-vouchers",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentVoucherKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: paymentVoucherKeys.statistics(),
      });
      toast.success("Tạo phiếu chi thành công!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Tạo phiếu chi thất bại!"
      );
    },
  });
}

/**
 * Update payment voucher
 */
export function useUpdatePaymentVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdatePaymentVoucherDto;
    }) => {
      const response = await api.put<ApiResponse<PaymentVoucher>>(
        `/payment-vouchers/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentVoucherKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: paymentVoucherKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: paymentVoucherKeys.statistics(),
      });
      toast.success("Cập nhật phiếu chi thành công!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Cập nhật phiếu chi thất bại!"
      );
    },
  });
}

/**
 * Approve payment voucher
 * CRITICAL: This will update supplier debt and cash fund
 */
export function useApprovePaymentVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data?: ApproveVoucherDto;
    }) => {
      const response = await api.put<ApiResponse<PaymentVoucher>>(
        `/payment-vouchers/${id}/approve`,
        data || {}
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentVoucherKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: paymentVoucherKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: paymentVoucherKeys.statistics(),
      });

      // IMPORTANT: Invalidate supplier queries (debt updated)
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });

      toast.success("Phê duyệt phiếu chi thành công!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Phê duyệt phiếu chi thất bại!"
      );
    },
  });
}

/**
 * Delete payment voucher (only if not approved)
 */
export function useDeletePaymentVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete<ApiResponse<void>>(
        `/payment-vouchers/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentVoucherKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: paymentVoucherKeys.statistics(),
      });
      toast.success("Xóa phiếu chi thành công!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Xóa phiếu chi thất bại!"
      );
    },
  });
}

/**
 * Bulk delete payment vouchers
 */
export function useBulkDeletePaymentVouchers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await api.post<ApiResponse<void>>(
        "/payment-vouchers/bulk-delete",
        { ids }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentVoucherKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: paymentVoucherKeys.statistics(),
      });
      toast.success("Xóa phiếu chi thành công!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Xóa phiếu chi thất bại!"
      );
    },
  });
}

/**
 * Print voucher as PDF
 */
export function usePrintVoucher() {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.get(`/payment-vouchers/${id}/print`, {
        responseType: "blob",
      });

      // Create blob and download
      const blob = new Blob([response as any], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `phieu-chi-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

      return response;
    },
    onSuccess: () => {
      toast.success("Đang tải xuống phiếu chi...");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "In phiếu chi thất bại!");
    },
  });
}

/**
 * Export vouchers to Excel
 */
export function useExportVouchers() {
  return useMutation({
    mutationFn: async (filters?: PaymentVoucherFilters) => {
      const response = await api.get("/payment-vouchers/export", {
        params: filters,
        responseType: "blob",
      });

      // Create blob and download
      const blob = new Blob([response as any], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `danh-sach-phieu-chi-${new Date().getTime()}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      return response;
    },
    onSuccess: () => {
      toast.success("Đang tải xuống file Excel...");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Export Excel thất bại!"
      );
    },
  });
}
