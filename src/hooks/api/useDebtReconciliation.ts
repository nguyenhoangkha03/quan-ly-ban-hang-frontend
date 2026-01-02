import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios"; 
import type { ApiResponse, PaginationMeta } from "@/types/common.types";
import { toast } from "react-hot-toast"; 

// Import Type Mới
import type {
  DebtReconciliation,
  DebtReconciliationParams,
  // DebtReconciliationSummary, // (Tạm bỏ nếu Dashboard chưa cần)
  CreateDebtReconciliationDto,
  SendReconciliationEmailDto,
} from "@/types/debt-reconciliation.types";

const BASE_URL = "/smart-debt";

export const debtKeys = {
  all: ["smart-debt"] as const,
  lists: () => [...debtKeys.all, "list"] as const,
  list: (filters: DebtReconciliationParams) => [...debtKeys.lists(), filters] as const,
  details: () => [...debtKeys.all, "detail"] as const,
  detail: (id: number) => [...debtKeys.details(), id] as const,
  summary: () => [...debtKeys.all, "summary"] as const,
  integrity: () => [...debtKeys.all, "integrity"] as const, // Key mới cho check sai sót
};

// =====================================================
// 1. QUERY HOOKS (LẤY DỮ LIỆU)
// =====================================================

export function useDebtReconciliations(filters: DebtReconciliationParams) {
  return useQuery({
    queryKey: debtKeys.list(filters),
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ data: DebtReconciliation[]; meta: PaginationMeta }>>(
        BASE_URL,
        { params: filters }
      );
      return response.data;
    },
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  });
}

export function useDebtReconciliation(id: number | null) {
  return useQuery({
    queryKey: debtKeys.detail(id!),
    queryFn: async () => {
      const response = await api.get<ApiResponse<DebtReconciliation>>(
        `${BASE_URL}/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
}

// [MỚI] Hook kiểm tra sai sót dữ liệu
export function useCheckDataIntegrity(year?: number) {
    return useQuery({
        queryKey: [...debtKeys.integrity(), year],
        queryFn: async () => {
            const response = await api.get<ApiResponse<any>>(
                `${BASE_URL}/check-integrity`,
                { params: { year } }
            );
            return response.data;
        },
        enabled: false, // Chỉ chạy khi người dùng bấm nút "Kiểm tra"
    });
}

// =====================================================
// 2. MUTATION HOOKS (THAO TÁC)
// =====================================================

/**
 * [CORE] Tạo mới / Tính toán lại (Sync)
 * Logic: Gọi API calculate để backend tự xử lý
 */
export function useSyncDebtReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateDebtReconciliationDto) => {
      const response = await api.post<ApiResponse<DebtReconciliation>>(
        `${BASE_URL}/calculate`, 
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      // Refresh dữ liệu để hiển thị số mới nhất
      queryClient.invalidateQueries({ queryKey: debtKeys.lists() });
      queryClient.invalidateQueries({ queryKey: debtKeys.summary() });
      queryClient.invalidateQueries({ queryKey: debtKeys.details() });
      
      toast.success("Đã tính toán và cập nhật công nợ thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Tính toán thất bại!");
    },
  });
}

// Alias để tương thích code cũ (nếu có)
export const useCreateDebtReconciliation = useSyncDebtReconciliation;

/**
 * Gửi Email
 */
export function useSendReconciliationEmail() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: SendReconciliationEmailDto }) => {
      const response = await api.post(
        `${BASE_URL}/${id}/email`,
        data
      );
      return response.data;
    },
    onSuccess: () => toast.success("Đã gửi email thông báo!"),
    onError: (error: any) => toast.error(error?.response?.data?.message || "Gửi email thất bại!"),
  });
}

/**
 * Xuất PDF (Giữ nguyên logic in Blob)
 */
export function useExportReconciliationPDF() {
  return useMutation({
    mutationFn: async (id: number) => {
      console.log("🖨️ [PDF] Downloading...");
      const response: any = await api.get(`${BASE_URL}/${id}/pdf`, { responseType: "blob" });

      let fileData: Blob;
      if (response instanceof Blob) fileData = response;
      else if (response.data instanceof Blob) fileData = response.data;
      else return response.data || response; // Fallback JSON

      if (fileData.type === "application/pdf") {
          const url = window.URL.createObjectURL(fileData);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `cong-no-${id}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          return true;
      }
      return fileData;
    },
    onSuccess: (data) => {
        if (data === true) toast.success("Đã tải file PDF!");
    },
    onError: (error: any) => {
      console.error("PDF Error:", error);
      toast.error("Không thể xuất PDF.");
    },
  });
}