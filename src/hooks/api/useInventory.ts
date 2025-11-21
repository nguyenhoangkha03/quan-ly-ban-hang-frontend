import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type {
  Inventory,
  StockTransaction,
  CreateTransactionDto,
  InventoryFilters,
  LowStockAlert,
  ApiResponse,
  PaginationParams,
} from "@/types";
import { toast } from "react-hot-toast";

/**
 * Query Keys
 */
export const inventoryKeys = {
  all: ["inventory"] as const,
  lists: () => [...inventoryKeys.all, "list"] as const,
  list: (filters?: InventoryFilters & PaginationParams) =>
    [...inventoryKeys.lists(), filters] as const,
  transactions: () => [...inventoryKeys.all, "transactions"] as const,
  transaction: (id: number) => [...inventoryKeys.transactions(), id] as const,
  lowStock: () => [...inventoryKeys.all, "low-stock"] as const,
};

/**
 * Get Inventory List
 */
export function useInventory(params?: InventoryFilters & PaginationParams) {
  return useQuery({
    queryKey: inventoryKeys.list(params),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Inventory[]>>("/inventory", {
        params,
      });
      return response;
    },
  });
}

/**
 * Get Inventory by Warehouse
 */
export function useInventoryByWarehouse(warehouseId: number, enabled = true) {
  return useQuery({
    queryKey: [...inventoryKeys.all, "warehouse", warehouseId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Inventory[]>>(
        `/inventory/warehouse/${warehouseId}`
      );
      return response;
    },
    enabled: enabled && !!warehouseId,
  });
}

/**
 * Get Inventory by Product (across all warehouses)
 */
export function useInventoryByProduct(productId: number, enabled = true) {
  return useQuery({
    queryKey: [...inventoryKeys.all, "product", productId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Inventory[]>>(
        `/inventory/product/${productId}`
      );
      return response;
    },
    enabled: enabled && !!productId,
  });
}

/**
 * Get Inventory Alerts (low stock)
 */
export function useInventoryAlerts(warehouseId?: number) {
  return useQuery({
    queryKey: [...inventoryKeys.all, "alerts", warehouseId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<LowStockAlert[]>>(
        "/inventory/alerts",
        { params: { warehouseId } }
      );
      return response;
    },
    refetchInterval: 60000, // Refetch every 1 minute
  });
}

/**
 * Get Inventory Value Report
 */
export function useInventoryValueReport(warehouseId?: number) {
  return useQuery({
    queryKey: [...inventoryKeys.all, "value-report", warehouseId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<any>>(
        "/inventory/value-report",
        { params: { warehouseId } }
      );
      return response;
    },
  });
}

/**
 * Check Inventory Availability
 */
export function useCheckInventoryAvailability() {
  return useMutation({
    mutationFn: async (items: Array<{ warehouseId: number; productId: number; quantity: number }>) => {
      const response = await api.post<ApiResponse<any>>(
        "/inventory/check",
        { items }
      );
      return response.data;
    },
  });
}

/**
 * Update Inventory (Manual update - Admin only)
 */
export function useUpdateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { warehouseId: number; productId: number; quantity: number; reservedQuantity?: number }) => {
      const response = await api.put<ApiResponse<Inventory>>(
        "/inventory/update",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      toast.success("Cập nhật tồn kho thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Cập nhật tồn kho thất bại!");
    },
  });
}

/**
 * Adjust Inventory (Increase/Decrease)
 */
export function useAdjustInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { warehouseId: number; productId: number; quantityChange: number; reason: string; notes?: string }) => {
      const response = await api.post<ApiResponse<Inventory>>(
        "/inventory/adjust",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      toast.success("Điều chỉnh tồn kho thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Điều chỉnh tồn kho thất bại!");
    },
  });
}

/**
 * Reserve Inventory (for orders)
 */
export function useReserveInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { items: Array<{ warehouseId: number; productId: number; quantity: number }>; referenceType: string; referenceId: number }) => {
      const response = await api.post<ApiResponse<any>>(
        "/inventory/reserve",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      toast.success("Đặt giữ hàng thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Đặt giữ hàng thất bại!");
    },
  });
}

/**
 * Release Reserved Inventory
 */
export function useReleaseReservedInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { items: Array<{ warehouseId: number; productId: number; quantity: number }>; referenceType: string; referenceId: number }) => {
      const response = await api.post<ApiResponse<any>>(
        "/inventory/release-reserved",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      toast.success("Hủy đặt giữ hàng thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Hủy đặt giữ hàng thất bại!");
    },
  });
}
