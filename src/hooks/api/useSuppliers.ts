import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Supplier, ApiResponse, PaginationParams } from "@/types";
import { toast } from "react-hot-toast";

/**
 * Query Keys
 */
export const supplierKeys = {
  all: ["suppliers"] as const,
  lists: () => [...supplierKeys.all, "list"] as const,
  list: (params?: PaginationParams) => [...supplierKeys.lists(), params] as const,
  details: () => [...supplierKeys.all, "detail"] as const,
  detail: (id: number) => [...supplierKeys.details(), id] as const,
  statistics: (id: number) => [...supplierKeys.all, "statistics", id] as const,
};

/**
 * Supplier Filters
 */
export interface SupplierFilters {
  status?: "active" | "inactive";
  supplierType?: "local" | "foreign";
  search?: string;
}

/**
 * Get Suppliers List
 */
export function useSuppliers(params?: SupplierFilters & PaginationParams) {
  return useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Supplier[]>>("/suppliers", {
        params,
      });
      return response;
    },
  });
}

/**
 * Get Single Supplier by ID
 */
export function useSupplier(id: number, enabled = true) {
  return useQuery({
    queryKey: supplierKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Supplier>>(`/suppliers/${id}`);
      return response.data;
    },
    enabled: enabled && !!id,
  });
}

/**
 * Get Supplier Statistics
 */
export function useSupplierStatistics(id: number, enabled = true) {
  return useQuery({
    queryKey: supplierKeys.statistics(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<any>>(`/suppliers/${id}/statistics`);
      return response;
    },
    enabled: enabled && !!id,
  });
}

/**
 * Create Supplier DTO
 */
export interface CreateSupplierDto {
  supplierCode?: string;
  supplierName: string;
  supplierType?: "local" | "foreign";
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  paymentTerms?: string;
  notes?: string;
  status?: "active" | "inactive";
}

/**
 * Create Supplier Mutation
 */
export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSupplierDto) => {
      const response = await api.post<ApiResponse<Supplier>>("/suppliers", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      toast.success("Tạo nhà cung cấp thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Tạo nhà cung cấp thất bại!");
    },
  });
}

/**
 * Update Supplier Mutation
 */
export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateSupplierDto> }) => {
      const response = await api.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      queryClient.invalidateQueries({ queryKey: supplierKeys.detail(variables.id) });
      toast.success("Cập nhật nhà cung cấp thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Cập nhật nhà cung cấp thất bại!");
    },
  });
}

/**
 * Delete Supplier Mutation
 */
export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete<ApiResponse<void>>(`/suppliers/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      toast.success("Xóa nhà cung cấp thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Xóa nhà cung cấp thất bại!");
    },
  });
}
