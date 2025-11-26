/**
 * Sales Orders API Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import type {
  SalesOrder,
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
  ApproveOrderDto,
  CancelOrderDto,
  ProcessPaymentDto,
  SalesOrderFilters,
  ApiResponse,
} from "@/types";

// Query Keys
export const SALES_ORDER_KEYS = {
  all: ["sales-orders"] as const,
  lists: () => [...SALES_ORDER_KEYS.all, "list"] as const,
  list: (filters?: SalesOrderFilters) => [...SALES_ORDER_KEYS.lists(), filters] as const,
  details: () => [...SALES_ORDER_KEYS.all, "detail"] as const,
  detail: (id: number) => [...SALES_ORDER_KEYS.details(), id] as const,
  statistics: () => [...SALES_ORDER_KEYS.all, "statistics"] as const,
};

/**
 * Get all sales orders
 */
export function useSalesOrders(filters?: SalesOrderFilters) {
  return useQuery({
    queryKey: SALES_ORDER_KEYS.list(filters),
    queryFn: async () => {
      const response = await api.get("/sales-orders", { params: filters });
      return response as ApiResponse<SalesOrder[]>;
    },
  });
}

/**
 * Get sales order by ID
 */
export function useSalesOrder(id: number, enabled = true) {
  return useQuery({
    queryKey: SALES_ORDER_KEYS.detail(id),
    queryFn: async () => {
      const response = await api.get(`/sales-orders/${id}`);
      return response as ApiResponse<SalesOrder>;
    },
    enabled: enabled && !!id,
  });
}

/**
 * Create sales order
 */
export function useCreateSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSalesOrderDto) => {
      const response = await api.post("/sales-orders", data);
      return response as ApiResponse<SalesOrder>;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: SALES_ORDER_KEYS.lists() });

      if (response.warnings?.inventoryShortages) {
        toast.success("Tạo đơn hàng thành công! (Có cảnh báo thiếu hàng)", {
          duration: 5000,
        });
      } else {
        toast.success("Tạo đơn hàng thành công!");
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Không thể tạo đơn hàng");
    },
  });
}

/**
 * Update sales order
 */
export function useUpdateSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateSalesOrderDto }) => {
      const response = await api.put(`/sales-orders/${id}`, data);
      return response as ApiResponse<SalesOrder>;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: SALES_ORDER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SALES_ORDER_KEYS.detail(variables.id) });
      toast.success("Cập nhật đơn hàng thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Không thể cập nhật đơn hàng");
    },
  });
}

/**
 * Approve sales order
 */
export function useApproveSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data?: ApproveOrderDto }) => {
      const response = await api.put(`/sales-orders/${id}/approve`, data);
      return response as ApiResponse<SalesOrder>;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: SALES_ORDER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SALES_ORDER_KEYS.detail(variables.id) });
      toast.success("Duyệt đơn hàng thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Không thể duyệt đơn hàng");
    },
  });
}

/**
 * Complete sales order
 */
export function useCompleteSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.put(`/sales-orders/${id}/complete`);
      return response as ApiResponse<SalesOrder>;
    },
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: SALES_ORDER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SALES_ORDER_KEYS.detail(id) });
      toast.success("Hoàn thành đơn hàng thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Không thể hoàn thành đơn hàng");
    },
  });
}

/**
 * Cancel sales order
 */
export function useCancelSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CancelOrderDto }) => {
      const response = await api.put(`/sales-orders/${id}/cancel`, data);
      return response as ApiResponse<SalesOrder>;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: SALES_ORDER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SALES_ORDER_KEYS.detail(variables.id) });
      toast.success("Hủy đơn hàng thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Không thể hủy đơn hàng");
    },
  });
}

/**
 * Process payment
 */
export function useProcessPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProcessPaymentDto }) => {
      const response = await api.post(`/sales-orders/${id}/payment`, data);
      return response as ApiResponse<SalesOrder>;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: SALES_ORDER_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SALES_ORDER_KEYS.detail(variables.id) });
      toast.success("Thanh toán thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Không thể xử lý thanh toán");
    },
  });
}

/**
 * Delete sales order
 */
export function useDeleteSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/sales-orders/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_ORDER_KEYS.lists() });
      toast.success("Xóa đơn hàng thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Không thể xóa đơn hàng");
    },
  });
}
