/**
 * Production Orders API Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import type {
  ProductionOrder,
  CreateProductionOrderDto,
  UpdateProductionOrderDto,
  StartProductionDto,
  CompleteProductionDto,
  CancelProductionDto,
  ProductionOrderFilters,
  WastageReport,
  ApiResponse,
} from "@/types";

// Query Keys
export const PRODUCTION_ORDER_KEYS = {
  all: ["production-orders"] as const,
  lists: () => [...PRODUCTION_ORDER_KEYS.all, "list"] as const,
  list: (filters?: ProductionOrderFilters) =>
    [...PRODUCTION_ORDER_KEYS.lists(), filters] as const,
  details: () => [...PRODUCTION_ORDER_KEYS.all, "detail"] as const,
  detail: (id: number) => [...PRODUCTION_ORDER_KEYS.details(), id] as const,
  wastage: (id: number) => [...PRODUCTION_ORDER_KEYS.detail(id), "wastage"] as const,
};

/**
 * Get all production orders
 */
export function useProductionOrders(filters?: ProductionOrderFilters) {
  return useQuery({
    queryKey: PRODUCTION_ORDER_KEYS.list(filters),
    queryFn: async () => {
      const response = await api.get("/production-orders", { params: filters });
      return response as ApiResponse<ProductionOrder[]>;
    },
  });
}

/**
 * Get production order by ID
 */
export function useProductionOrder(id: number, enabled = true) {
  return useQuery({
    queryKey: PRODUCTION_ORDER_KEYS.detail(id),
    queryFn: async () => {
      const response = await api.get(`/production-orders/${id}`);
      return response as ApiResponse<ProductionOrder>;
    },
    enabled: enabled && !!id,
  });
}

/**
 * Get wastage report
 */
export function useWastageReport(id: number, enabled = true) {
  return useQuery({
    queryKey: PRODUCTION_ORDER_KEYS.wastage(id),
    queryFn: async () => {
      const response = await api.get(`/production-orders/${id}/wastage`);
      return response as ApiResponse<WastageReport>;
    },
    enabled: enabled && !!id,
  });
}

/**
 * Create production order
 */
export function useCreateProductionOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductionOrderDto) => {
      const response = await api.post("/production-orders", data);
      return response as ApiResponse<ProductionOrder>;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTION_ORDER_KEYS.lists() });

      // Check for material shortage warnings
      if (response.warnings?.materialShortages) {
        const shortages = response.warnings.materialShortages;
        toast.error(
          `Lệnh sản xuất đã tạo nhưng thiếu ${shortages.length} nguyên liệu. Vui lòng nhập kho trước khi bắt đầu!`,
          { duration: 5000 }
        );
      } else {
        toast.success("Tạo lệnh sản xuất thành công!");
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Không thể tạo lệnh sản xuất");
    },
  });
}

/**
 * Update production order
 */
export function useUpdateProductionOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateProductionOrderDto }) => {
      const response = await api.put(`/production-orders/${id}`, data);
      return response as ApiResponse<ProductionOrder>;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTION_ORDER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PRODUCTION_ORDER_KEYS.detail(variables.id) });
      toast.success("Cập nhật lệnh sản xuất thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Không thể cập nhật lệnh sản xuất");
    },
  });
}

/**
 * Start production
 */
export function useStartProduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data?: StartProductionDto }) => {
      const response = await api.put(`/production-orders/${id}/start`, data || {});
      return response as ApiResponse<ProductionOrder>;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTION_ORDER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PRODUCTION_ORDER_KEYS.detail(variables.id) });

      const transactionCode = response.meta?.stockTransaction?.code;
      toast.success(
        `Bắt đầu sản xuất thành công! Phiếu xuất kho: ${transactionCode}`,
        { duration: 4000 }
      );
    },
    onError: (error: any) => {
      toast.error(error?.message || "Không thể bắt đầu sản xuất");
    },
  });
}

/**
 * Complete production
 */
export function useCompleteProduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CompleteProductionDto }) => {
      const response = await api.put(`/production-orders/${id}/complete`, data);
      return response as ApiResponse<ProductionOrder>;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTION_ORDER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PRODUCTION_ORDER_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: PRODUCTION_ORDER_KEYS.wastage(variables.id) });

      const transactionCode = response.meta?.stockTransaction?.code;
      const totalWastage = response.meta?.totalWastage || 0;

      if (totalWastage > 0) {
        toast.success(
          `Hoàn thành sản xuất! Phiếu nhập kho: ${transactionCode}. Hao hụt: ${totalWastage.toLocaleString()} VNĐ`,
          { duration: 5000 }
        );
      } else {
        toast.success(
          `Hoàn thành sản xuất thành công! Phiếu nhập kho: ${transactionCode}`,
          { duration: 4000 }
        );
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Không thể hoàn thành sản xuất");
    },
  });
}

/**
 * Cancel production order
 */
export function useCancelProductionOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CancelProductionDto }) => {
      const response = await api.put(`/production-orders/${id}/cancel`, data);
      return response as ApiResponse<ProductionOrder>;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTION_ORDER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PRODUCTION_ORDER_KEYS.detail(variables.id) });
      toast.success("Đã hủy lệnh sản xuất");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Không thể hủy lệnh sản xuất");
    },
  });
}

/**
 * Delete production order
 */
export function useDeleteProductionOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/production-orders/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTION_ORDER_KEYS.lists() });
      toast.success("Xóa lệnh sản xuất thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Không thể xóa lệnh sản xuất");
    },
  });
}
