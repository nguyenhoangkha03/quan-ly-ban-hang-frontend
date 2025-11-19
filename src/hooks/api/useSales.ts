import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type {
  SalesOrder,
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
  AddPaymentDto,
  SalesOrderFilters,
  ApiResponse,
  PaginationParams,
} from "@/types";
import { toast } from "react-hot-toast";

/**
 * Query Keys
 */
export const salesKeys = {
  all: ["sales"] as const,
  orders: () => [...salesKeys.all, "orders"] as const,
  ordersList: (filters?: SalesOrderFilters & PaginationParams) =>
    [...salesKeys.orders(), filters] as const,
  orderDetail: (id: number) => [...salesKeys.orders(), id] as const,
};

/**
 * Get Sales Orders List
 */
export function useSalesOrders(params?: SalesOrderFilters & PaginationParams) {
  return useQuery({
    queryKey: salesKeys.ordersList(params),
    queryFn: async () => {
      const response = await api.get<ApiResponse<SalesOrder[]>>("/sales/orders", {
        params,
      });
      return response;
    },
  });
}

/**
 * Get Single Sales Order
 */
export function useSalesOrder(id: number, enabled = true) {
  return useQuery({
    queryKey: salesKeys.orderDetail(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<SalesOrder>>(`/sales/orders/${id}`);
      return response.data;
    },
    enabled: enabled && !!id,
  });
}

/**
 * Create Sales Order
 */
export function useCreateSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSalesOrderDto) => {
      const response = await api.post<ApiResponse<SalesOrder>>("/sales/orders", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.orders() });
      toast.success("Tạo đơn hàng thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Tạo đơn hàng thất bại!");
    },
  });
}

/**
 * Update Sales Order
 */
export function useUpdateSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateSalesOrderDto }) => {
      const response = await api.put<ApiResponse<SalesOrder>>(
        `/sales/orders/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.orders() });
      queryClient.invalidateQueries({ queryKey: salesKeys.orderDetail(variables.id) });
      toast.success("Cập nhật đơn hàng thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Cập nhật đơn hàng thất bại!");
    },
  });
}

/**
 * Approve Sales Order
 */
export function useApproveSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch<ApiResponse<SalesOrder>>(
        `/sales/orders/${id}/approve`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.orders() });
      toast.success("Phê duyệt đơn hàng thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Phê duyệt đơn hàng thất bại!");
    },
  });
}

/**
 * Cancel Sales Order
 */
export function useCancelSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason?: string }) => {
      const response = await api.patch<ApiResponse<SalesOrder>>(
        `/sales/orders/${id}/cancel`,
        { reason }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.orders() });
      toast.success("Hủy đơn hàng thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Hủy đơn hàng thất bại!");
    },
  });
}

/**
 * Add Payment to Sales Order
 */
export function useAddPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddPaymentDto) => {
      const response = await api.post<ApiResponse<SalesOrder>>(
        `/sales/orders/${data.order_id}/payments`,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.orders() });
      queryClient.invalidateQueries({
        queryKey: salesKeys.orderDetail(data.id),
      });
      toast.success("Thêm thanh toán thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Thêm thanh toán thất bại!");
    },
  });
}

/**
 * Validate Credit Limit before creating order
 */
export function useValidateCreditLimit() {
  return useMutation({
    mutationFn: async ({
      customer_id,
      order_amount,
    }: {
      customer_id: number;
      order_amount: number;
    }) => {
      const response = await api.post<ApiResponse<{ valid: boolean; message?: string }>>(
        "/sales/validate-credit-limit",
        { customer_id, order_amount }
      );
      return response.data;
    },
  });
}
