import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Customer, ApiResponse, PaginationParams } from "@/types";
import { toast } from "react-hot-toast";

/**
 * Query Keys
 */
export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (params?: PaginationParams) => [...customerKeys.lists(), params] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: number) => [...customerKeys.details(), id] as const,
};

/**
 * Get Customers List
 */
export function useCustomers(params?: PaginationParams) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Customer[]>>("/customers", {
        params,
      });
      return response;
    },
  });
}

/**
 * Get Single Customer
 */
export function useCustomer(id: number, enabled = true) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
      return response.data;
    },
    enabled: enabled && !!id,
  });
}

/**
 * Create Customer
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Customer>) => {
      const response = await api.post<ApiResponse<Customer>>("/customers", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      toast.success("Tạo khách hàng thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Tạo khách hàng thất bại!");
    },
  });
}

/**
 * Update Customer
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Customer> }) => {
      const response = await api.put<ApiResponse<Customer>>(`/customers/${id}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) });
      toast.success("Cập nhật khách hàng thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Cập nhật khách hàng thất bại!");
    },
  });
}

/**
 * Delete Customer
 */
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete<ApiResponse<void>>(`/customers/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      toast.success("Xóa khách hàng thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Xóa khách hàng thất bại!");
    },
  });
}
