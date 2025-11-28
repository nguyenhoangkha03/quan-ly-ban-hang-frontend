/**
 * Debt Reconciliation API Hooks
 * React Query hooks for debt reconciliation (đối chiếu công nợ)
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type {
  ApiResponse,
  PaginationParams,
  PaginationMeta,
} from "@/types/common.types";
import type {
  DebtReconciliation,
  CreateDebtReconciliationDto,
  UpdateDebtReconciliationDto,
  ConfirmReconciliationDto,
  DisputeReconciliationDto,
  DebtReconciliationFilters,
  DebtReconciliationStatistics,
} from "@/types/finance.types";
import { toast } from "react-hot-toast";

// =====================================================
// QUERY KEYS
// =====================================================

export const debtReconciliationKeys = {
  all: ["debt-reconciliation"] as const,
  lists: () => [...debtReconciliationKeys.all, "list"] as const,
  list: (filters?: DebtReconciliationFilters & PaginationParams) =>
    [...debtReconciliationKeys.lists(), filters] as const,
  details: () => [...debtReconciliationKeys.all, "detail"] as const,
  detail: (id: number) => [...debtReconciliationKeys.details(), id] as const,
  statistics: (filters?: DebtReconciliationFilters) =>
    [...debtReconciliationKeys.all, "statistics", filters] as const,
};

// =====================================================
// QUERY HOOKS
// =====================================================

/**
 * Get debt reconciliation list with filters
 */
export function useDebtReconciliations(
  filters?: DebtReconciliationFilters & PaginationParams
) {
  return useQuery({
    queryKey: debtReconciliationKeys.list(filters),
    queryFn: async () => {
      const response = await api.get<
        ApiResponse<{ reconciliations: DebtReconciliation[]; meta: PaginationMeta }>
      >("/debt-reconciliation", {
        params: filters,
      });
      return response.data;
    },
  });
}

/**
 * Get single debt reconciliation by ID
 */
export function useDebtReconciliation(id: number) {
  return useQuery({
    queryKey: debtReconciliationKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<DebtReconciliation>>(
        `/debt-reconciliation/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Get debt reconciliation statistics
 */
export function useDebtReconciliationStatistics(
  filters?: DebtReconciliationFilters
) {
  return useQuery({
    queryKey: debtReconciliationKeys.statistics(filters),
    queryFn: async () => {
      const response = await api.get<ApiResponse<DebtReconciliationStatistics>>(
        "/debt-reconciliation/statistics",
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
 * Create new debt reconciliation (monthly)
 * Backend will auto-calculate balances
 */
export function useCreateMonthlyReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDebtReconciliationDto) => {
      const response = await api.post<ApiResponse<DebtReconciliation>>(
        "/debt-reconciliation/monthly",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: debtReconciliationKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: debtReconciliationKeys.statistics(),
      });
      toast.success("Tạo đối chiếu công nợ thành công!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Tạo đối chiếu công nợ thất bại!"
      );
    },
  });
}

/**
 * Create quarterly reconciliation
 */
export function useCreateQuarterlyReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDebtReconciliationDto) => {
      const response = await api.post<ApiResponse<DebtReconciliation>>(
        "/debt-reconciliation/quarterly",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: debtReconciliationKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: debtReconciliationKeys.statistics(),
      });
      toast.success("Tạo đối chiếu công nợ quý thành công!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Tạo đối chiếu công nợ thất bại!"
      );
    },
  });
}

/**
 * Create yearly reconciliation
 */
export function useCreateYearlyReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDebtReconciliationDto) => {
      const response = await api.post<ApiResponse<DebtReconciliation>>(
        "/debt-reconciliation/yearly",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: debtReconciliationKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: debtReconciliationKeys.statistics(),
      });
      toast.success("Tạo đối chiếu công nợ năm thành công!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Tạo đối chiếu công nợ thất bại!"
      );
    },
  });
}

/**
 * Update debt reconciliation
 */
export function useUpdateDebtReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateDebtReconciliationDto;
    }) => {
      const response = await api.put<ApiResponse<DebtReconciliation>>(
        `/debt-reconciliation/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: debtReconciliationKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: debtReconciliationKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: debtReconciliationKeys.statistics(),
      });
      toast.success("Cập nhật đối chiếu thành công!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Cập nhật đối chiếu thất bại!"
      );
    },
  });
}

/**
 * Confirm reconciliation (by customer/supplier)
 */
export function useConfirmReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: ConfirmReconciliationDto;
    }) => {
      const response = await api.put<ApiResponse<DebtReconciliation>>(
        `/debt-reconciliation/${id}/confirm`,
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: debtReconciliationKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: debtReconciliationKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: debtReconciliationKeys.statistics(),
      });
      toast.success("Xác nhận đối chiếu thành công!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Xác nhận đối chiếu thất bại!"
      );
    },
  });
}

/**
 * Dispute reconciliation
 */
export function useDisputeReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: DisputeReconciliationDto;
    }) => {
      const response = await api.put<ApiResponse<DebtReconciliation>>(
        `/debt-reconciliation/${id}/dispute`,
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: debtReconciliationKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: debtReconciliationKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: debtReconciliationKeys.statistics(),
      });
      toast.success("Đã ghi nhận tranh chấp!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Ghi nhận tranh chấp thất bại!");
    },
  });
}

/**
 * Delete debt reconciliation
 */
export function useDeleteDebtReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete<ApiResponse<void>>(
        `/debt-reconciliation/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: debtReconciliationKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: debtReconciliationKeys.statistics(),
      });
      toast.success("Xóa đối chiếu công nợ thành công!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Xóa đối chiếu công nợ thất bại!"
      );
    },
  });
}

/**
 * Export reconciliation to PDF
 */
export function useExportReconciliationPDF() {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.get(`/debt-reconciliation/${id}/pdf`, {
        responseType: "blob",
      });

      // Create blob and download
      const blob = new Blob([response as any], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `doi-chieu-cong-no-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

      return response;
    },
    onSuccess: () => {
      toast.success("Đang tải xuống PDF...");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xuất PDF thất bại!");
    },
  });
}

/**
 * Send reconciliation email
 */
export function useSendReconciliationEmail() {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post<ApiResponse<void>>(
        `/debt-reconciliation/${id}/send-email`
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Đã gửi email đối chiếu!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gửi email thất bại!");
    },
  });
}
