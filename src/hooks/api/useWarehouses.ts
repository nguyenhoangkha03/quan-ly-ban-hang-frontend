import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Warehouse, ApiResponse, PaginationParams } from "@/types";
import { toast } from "react-hot-toast";

/**
 * Query Keys
 */
export const warehouseKeys = {
  all: ["warehouses"] as const,
  lists: () => [...warehouseKeys.all, "list"] as const,
  list: (params?: PaginationParams) => [...warehouseKeys.lists(), params] as const,
  details: () => [...warehouseKeys.all, "detail"] as const,
  detail: (id: number) => [...warehouseKeys.details(), id] as const,
};

/**
 * Get Warehouses List
 */
export function useWarehouses(params?: PaginationParams) {
  return useQuery({
    queryKey: warehouseKeys.list(params),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Warehouse[]>>("/warehouses", {
        params,
      });
      return response;
    },
  });
}

/**
 * Get Single Warehouse
 */
export function useWarehouse(id: number, enabled = true) {
  return useQuery({
    queryKey: warehouseKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Warehouse>>(`/warehouses/${id}`);
      return response;
    },
    enabled: enabled && !!id,
  });
}

/**
 * Create Warehouse
 */
export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Warehouse>) => {
      const response = await api.post<ApiResponse<Warehouse>>("/warehouses", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
      toast.success("Tạo kho thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Tạo kho thất bại!");
    },
  });
}

/**
 * Update Warehouse
 */
export function useUpdateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Warehouse> }) => {
      const response = await api.put<ApiResponse<Warehouse>>(`/warehouses/${id}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: warehouseKeys.detail(variables.id) });
      toast.success("Cập nhật kho thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Cập nhật kho thất bại!");
    },
  });
}

/**
 * Delete Warehouse
 */
export function useDeleteWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete<ApiResponse<void>>(`/warehouses/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
      toast.success("Xóa kho thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Xóa kho thất bại!");
    },
  });
}
