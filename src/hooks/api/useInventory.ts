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
 * Get Inventory by Warehouse & Product
 */
export function useInventoryByWarehouseProduct(
  warehouseId: number,
  productId: number,
  enabled = true
) {
  return useQuery({
    queryKey: [...inventoryKeys.all, "warehouse", warehouseId, "product", productId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Inventory>>(
        `/inventory/warehouse/${warehouseId}/product/${productId}`
      );
      return response.data;
    },
    enabled: enabled && !!warehouseId && !!productId,
  });
}

/**
 * Get Stock Transactions
 */
export function useStockTransactions(params?: PaginationParams) {
  return useQuery({
    queryKey: inventoryKeys.transactions(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<StockTransaction[]>>(
        "/inventory/transactions",
        { params }
      );
      return response;
    },
  });
}

/**
 * Get Stock Transaction by ID
 */
export function useStockTransaction(id: number, enabled = true) {
  return useQuery({
    queryKey: inventoryKeys.transaction(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<StockTransaction>>(
        `/inventory/transactions/${id}`
      );
      return response.data;
    },
    enabled: enabled && !!id,
  });
}

/**
 * Get Low Stock Alerts
 */
export function useLowStockAlerts() {
  return useQuery({
    queryKey: inventoryKeys.lowStock(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<LowStockAlert[]>>(
        "/inventory/low-stock-alerts"
      );
      return response.data;
    },
    refetchInterval: 60000, // Refetch mỗi 1 phút
  });
}

/**
 * Create Stock Transaction (Import/Export/Transfer)
 */
export function useCreateStockTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTransactionDto) => {
      const response = await api.post<ApiResponse<StockTransaction>>(
        "/inventory/transactions",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions() });
      toast.success("Tạo giao dịch kho thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Tạo giao dịch kho thất bại!");
    },
  });
}

/**
 * Approve Stock Transaction
 */
export function useApproveStockTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch<ApiResponse<StockTransaction>>(
        `/inventory/transactions/${id}/approve`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions() });
      toast.success("Phê duyệt giao dịch thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Phê duyệt giao dịch thất bại!");
    },
  });
}

/**
 * Cancel Stock Transaction
 */
export function useCancelStockTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason?: string }) => {
      const response = await api.patch<ApiResponse<StockTransaction>>(
        `/inventory/transactions/${id}/cancel`,
        { reason }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions() });
      toast.success("Hủy giao dịch thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.error?.message || "Hủy giao dịch thất bại!");
    },
  });
}
