import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductFilters,
  ApiResponse,
  PaginationParams,
} from "@/types";
import { toast } from "react-hot-toast";

/**
 * Query Keys
 */
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters?: ProductFilters & PaginationParams) =>
    [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
};

/**
 * Get Products List với filters & pagination
 */
export function useProducts(params?: ProductFilters & PaginationParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Product[]>>("/products", {
        params,
      });
      return response;
    },
  });
}

/**
 * Get Single Product by ID
 */
export function useProduct(id: number, enabled = true) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
      return response.data;
    },
    enabled: enabled && !!id,
  });
}

/**
 * Create Product Mutation
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductDto) => {
      const response = await api.post<ApiResponse<Product>>("/products", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Tạo sản phẩm thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Tạo sản phẩm thất bại!");
    },
  });
}

/**
 * Update Product Mutation
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateProductDto }) => {
      const response = await api.put<ApiResponse<Product>>(`/products/${id}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      toast.success("Cập nhật sản phẩm thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Cập nhật sản phẩm thất bại!");
    },
  });
}

/**
 * Delete Product Mutation
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete<ApiResponse<void>>(`/products/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Xóa sản phẩm thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Xóa sản phẩm thất bại!");
    },
  });
}

/**
 * Toggle Product Status
 */
export function useToggleProductStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch<ApiResponse<Product>>(
        `/products/${id}/toggle-status`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Cập nhật trạng thái thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Cập nhật trạng thái thất bại!");
    },
  });
}
