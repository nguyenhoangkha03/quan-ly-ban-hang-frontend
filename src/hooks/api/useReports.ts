/**
 * Reports API Hooks
 */
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { ApiResponse } from "@/types/common.types";
import type {
  RevenueReport,
  InventoryReport,
  SalesReport,
  ProductionReport,
  FinancialReport,
  DashboardMetrics,
  RevenueReportFilters,
  InventoryReportFilters,
  SalesReportFilters,
  ProductionReportFilters,
  FinancialReportFilters,
} from "@/types/report.types";

export const reportKeys = {
  all: ["reports"] as const,
  revenue: (filters?: RevenueReportFilters) => [...reportKeys.all, "revenue", filters] as const,
  inventory: (filters?: InventoryReportFilters) => [...reportKeys.all, "inventory", filters] as const,
  sales: (filters?: SalesReportFilters) => [...reportKeys.all, "sales", filters] as const,
  production: (filters?: ProductionReportFilters) => [...reportKeys.all, "production", filters] as const,
  financial: (filters?: FinancialReportFilters) => [...reportKeys.all, "financial", filters] as const,
  dashboard: () => [...reportKeys.all, "dashboard"] as const,
};

export function useRevenueReport(filters?: RevenueReportFilters) {
  return useQuery({
    queryKey: reportKeys.revenue(filters),
    queryFn: async () => {
      const response = await api.get<ApiResponse<RevenueReport>>("/reports/revenue", { params: filters });
      return response.data;
    },
  });
}

export function useInventoryReport(filters?: InventoryReportFilters) {
  return useQuery({
    queryKey: reportKeys.inventory(filters),
    queryFn: async () => {
      const response = await api.get<ApiResponse<InventoryReport>>("/reports/inventory", { params: filters });
      return response.data;
    },
  });
}

export function useSalesReport(filters?: SalesReportFilters) {
  return useQuery({
    queryKey: reportKeys.sales(filters),
    queryFn: async () => {
      const response = await api.get<ApiResponse<SalesReport>>("/reports/sales", { params: filters });
      return response.data;
    },
  });
}

export function useProductionReport(filters?: ProductionReportFilters) {
  return useQuery({
    queryKey: reportKeys.production(filters),
    queryFn: async () => {
      const response = await api.get<ApiResponse<ProductionReport>>("/reports/production", { params: filters });
      return response.data;
    },
  });
}

export function useFinancialReport(filters?: FinancialReportFilters) {
  return useQuery({
    queryKey: reportKeys.financial(filters),
    queryFn: async () => {
      const response = await api.get<ApiResponse<FinancialReport>>("/reports/financial", { params: filters });
      return response.data;
    },
  });
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: reportKeys.dashboard(),
    queryFn: async () => {
      const response = await api.get<ApiResponse<DashboardMetrics>>("/reports/dashboard/metrics");
      return response.data;
    },
    refetchInterval: 60000, // Refetch every minute
  });
}
