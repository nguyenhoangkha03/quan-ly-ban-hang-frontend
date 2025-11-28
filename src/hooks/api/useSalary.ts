import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/common.types";
import type {
  Salary,
  SalaryFilters,
  CalculateSalaryDto,
  UpdateSalaryDto,
  ApproveSalaryDto,
  PaySalaryDto,
  SalarySummary,
  SalaryCalculationResult,
} from "@/types/salary.types";

//----------------------------------------------
// Query Keys
//----------------------------------------------

export const salaryKeys = {
  all: ["salary"] as const,
  lists: () => [...salaryKeys.all, "list"] as const,
  list: (filters?: SalaryFilters) => [...salaryKeys.lists(), filters] as const,
  details: () => [...salaryKeys.all, "detail"] as const,
  detail: (id: number) => [...salaryKeys.details(), id] as const,
  byUserMonth: (userId: number, month: string) =>
    [...salaryKeys.all, "user-month", userId, month] as const,
  summary: (fromMonth: string, toMonth: string) =>
    [...salaryKeys.all, "summary", fromMonth, toMonth] as const,
};

//----------------------------------------------
// Query Hooks
//----------------------------------------------

/**
 * Get all salary records with filters (Admin/Manager)
 */
export function useSalary(filters?: SalaryFilters) {
  return useQuery({
    queryKey: salaryKeys.list(filters),
    queryFn: async () => {
      const response = await api.get<ApiResponse<PaginatedResponse<Salary>>>(
        "/salary",
        { params: filters }
      );
      return response.data;
    },
  });
}

/**
 * Get salary by ID
 */
export function useSalaryDetail(id: number) {
  return useQuery({
    queryKey: salaryKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Salary>>(`/salary/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Get salary by user and month
 */
export function useSalaryByUserMonth(userId: number, month: string) {
  return useQuery({
    queryKey: salaryKeys.byUserMonth(userId, month),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Salary>>(
        `/salary/${userId}/${month}`
      );
      return response.data;
    },
    enabled: !!userId && !!month,
  });
}

/**
 * Get salary summary (aggregated data)
 */
export function useSalarySummary(fromMonth: string, toMonth: string) {
  return useQuery({
    queryKey: salaryKeys.summary(fromMonth, toMonth),
    queryFn: async () => {
      const response = await api.get<ApiResponse<SalarySummary>>(
        "/salary/summary",
        { params: { fromMonth, toMonth } }
      );
      return response.data;
    },
    enabled: !!fromMonth && !!toMonth,
  });
}

//----------------------------------------------
// Mutation Hooks
//----------------------------------------------

/**
 * Calculate salary for a user in a month
 * This will auto-calculate overtime pay from attendance and commission from sales
 */
export function useCalculateSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CalculateSalaryDto) => {
      const response = await api.post<ApiResponse<SalaryCalculationResult>>(
        "/salary/calculate",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.lists() });
      toast.success("Tính lương thành công!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || "Tính lương thất bại!");
    },
  });
}

/**
 * Recalculate existing salary
 * Re-fetch attendance and sales data to recalculate
 */
export function useRecalculateSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post<ApiResponse<Salary>>(
        `/salary/${id}/recalculate`
      );
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: salaryKeys.detail(id) });
      toast.success("Tính lại lương thành công!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message || "Tính lại lương thất bại!"
      );
    },
  });
}

/**
 * Update salary manually
 */
export function useUpdateSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateSalaryDto }) => {
      const response = await api.put<ApiResponse<Salary>>(`/salary/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: salaryKeys.detail(id) });
      toast.success("Cập nhật lương thành công!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message || "Cập nhật lương thất bại!"
      );
    },
  });
}

/**
 * Approve salary
 * Only manager/admin can approve
 */
export function useApproveSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data?: ApproveSalaryDto }) => {
      const response = await api.put<ApiResponse<Salary>>(
        `/salary/${id}/approve`,
        data
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: salaryKeys.detail(id) });
      toast.success("Phê duyệt lương thành công!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message || "Phê duyệt lương thất bại!"
      );
    },
  });
}

/**
 * Pay salary
 * This will create a payment voucher and mark salary as paid
 */
export function usePaySalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PaySalaryDto }) => {
      const response = await api.post<
        ApiResponse<{ salary: Salary; voucher: any }>
      >(`/salary/${id}/pay`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: salaryKeys.detail(id) });
      // Also invalidate payment vouchers if we have that hook
      queryClient.invalidateQueries({ queryKey: ["paymentVouchers"] });
      toast.success("Thanh toán lương thành công!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message || "Thanh toán lương thất bại!"
      );
    },
  });
}

/**
 * Delete salary
 * Only admin can delete
 */
export function useDeleteSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete<ApiResponse<{ id: number }>>(
        `/salary/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.lists() });
      toast.success("Xóa bảng lương thành công!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message || "Xóa bảng lương thất bại!"
      );
    },
  });
}
