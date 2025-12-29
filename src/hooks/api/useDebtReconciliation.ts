import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios"; // Hoặc đường dẫn api instance của bạn
import type { ApiResponse, PaginationMeta } from "@/types/common.types";

// 👇 Quan trọng: Import từ file types mới tách riêng
import type {
  DebtReconciliation,
  DebtReconciliationParams,
  DebtReconciliationSummary,
  CreateDebtReconciliationDto,
  UpdateDebtReconciliationDto,
  ConfirmReconciliationDto,
  DisputeReconciliationDto,
  SendReconciliationEmailDto,
} from "@/types/debt-reconciliation.types";
import { toast } from "react-hot-toast"; // Hoặc "sonner" tùy dự án bạn

// =====================================================
// QUERY KEYS (Quản lý Cache tập trung)
// =====================================================
export const debtKeys = {
  all: ["debt-reconciliation"] as const,
  lists: () => [...debtKeys.all, "list"] as const,
  list: (filters: any) => [...debtKeys.lists(), filters] as const,
  details: () => [...debtKeys.all, "detail"] as const,
  detail: (id: number) => [...debtKeys.details(), id] as const,
  summary: () => [...debtKeys.all, "summary"] as const,
};

// =====================================================
// QUERY HOOKS (GET DATA)
// =====================================================

/**
 * Lấy danh sách đối chiếu (Có phân trang & bộ lọc)
 */
export function useDebtReconciliations(filters: DebtReconciliationParams) {
  return useQuery({
    queryKey: debtKeys.list(filters),
    queryFn: async () => {
      // API trả về { data: [...], meta: {...} } hoặc tùy cấu trúc response của bạn
      console.log("🚀 [FE-HOOK] Gọi API với filters:", filters);
      const response = await api.get<ApiResponse<{ data: DebtReconciliation[]; meta: PaginationMeta }>>(
        "/debt-reconciliation",
        { params: filters }
        
      );

      console.log("🚀 [FE-HOOK] Raw Response từ API:", response.data);
      return response.data; 
      
    },
    // Giữ dữ liệu cũ khi chuyển trang để tránh giật màn hình
    placeholderData: (previousData) => previousData, 
    refetchOnWindowFocus: false, 
    retry: 1, // Chỉ thử lại 1 lần nếu lỗi
  });
}

/**
 * Lấy chi tiết 1 biên bản theo ID
 */
export function useDebtReconciliation(id: number | null) {
  return useQuery({
    queryKey: debtKeys.detail(id!),
    queryFn: async () => {
      const response = await api.get<ApiResponse<DebtReconciliation>>(
        `/debt-reconciliation/${id}`
      );
      return response.data; // Hoặc response.data.data tùy wrapper
    },
    enabled: !!id, // Chỉ gọi khi có ID
  });
}

/**
 * Lấy thống kê tổng quan (Dashboard)
 */
export function useDebtReconciliationStatistics(filters?: { fromDate?: string; toDate?: string }) {
  return useQuery({
    queryKey: [...debtKeys.summary(), filters],
    queryFn: async () => {
      const response = await api.get<ApiResponse<DebtReconciliationSummary>>(
        "/debt-reconciliation/summary",
        { params: filters }
      );
      return response.data;
    },
  });
}

// =====================================================
// MUTATION HOOKS (ACTION)
// =====================================================

/**
 * Tạo mới đối chiếu (Dùng chung cho Tháng/Quý/Năm)
 * Logic: URL sẽ tự động thay đổi dựa vào loại (monthly/quarterly/yearly)
 */
export function useCreateDebtReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateDebtReconciliationDto) => {
      // ✅ Dynamic URL: Không cần viết 3 hàm riêng
      const endpoint = `/debt-reconciliation/${payload.reconciliationType}`;
      const response = await api.post<ApiResponse<DebtReconciliation>>(endpoint, payload);
      return response.data;
    },
    onSuccess: () => {
      // Làm mới danh sách và thống kê ngay lập tức
      queryClient.invalidateQueries({ queryKey: debtKeys.lists() });
      queryClient.invalidateQueries({ queryKey: debtKeys.summary() });
      toast.success("Tạo đối chiếu công nợ thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Tạo thất bại!");
    },
  });
}

/**
 * Cập nhật thông tin (ví dụ: Ghi chú)
 */
export function useUpdateDebtReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateDebtReconciliationDto }) => {
      const response = await api.put<ApiResponse<DebtReconciliation>>(
        `/debt-reconciliation/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: debtKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: debtKeys.lists() });
      toast.success("Cập nhật thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Cập nhật thất bại!");
    },
  });
}

/**
 * Xác nhận đối chiếu (Confirm)
 */
export function useConfirmReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ConfirmReconciliationDto }) => {
      const response = await api.put<ApiResponse<DebtReconciliation>>(
        `/debt-reconciliation/${id}/confirm`,
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: debtKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: debtKeys.lists() });
      queryClient.invalidateQueries({ queryKey: debtKeys.summary() });
      toast.success("Xác nhận thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xác nhận thất bại!");
    },
  });
}

/**
 * Báo cáo sai lệch (Dispute)
 */
export function useDisputeReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: DisputeReconciliationDto }) => {
      const response = await api.put<ApiResponse<DebtReconciliation>>(
        `/debt-reconciliation/${id}/dispute`,
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: debtKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: debtKeys.lists() });
      toast.success("Đã ghi nhận tranh chấp!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Thao tác thất bại!");
    },
  });
}

/**
 * Xóa bản ghi
 */
export function useDeleteDebtReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/debt-reconciliation/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: debtKeys.lists() });
      queryClient.invalidateQueries({ queryKey: debtKeys.summary() });
      toast.success("Xóa thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Xóa thất bại!");
    },
  });
}

/**
 * Xuất PDF
 */
/**
 * Xuất PDF (Đã fix lỗi undefined file)
 */
export function useExportReconciliationPDF() {
  return useMutation({
    mutationFn: async (id: number) => {
      console.log("🖨️ [PDF START] Đang gọi API xuất PDF...");
      
      // 1. Gọi API với responseType là 'blob'
      // Dùng 'any' để bypass type check của axios interceptor tạm thời
      const response: any = await api.get(`/debt-reconciliation/${id}/pdf`, {
        responseType: "blob", 
      });

      console.log("🖨️ [PDF DEBUG] Raw Response nhận được:", response);

      // 2. Xác định đâu là dữ liệu File (Blob)
      let fileData: Blob;

      if (response instanceof Blob) {
        // Trường hợp 1: Axios Interceptor đã trả về Blob trực tiếp
        console.log("✅ Dữ liệu là Blob trực tiếp");
        fileData = response;
      } else if (response.data instanceof Blob) {
        // Trường hợp 2: Axios trả về object chuẩn, data nằm trong .data
        console.log("✅ Dữ liệu nằm trong .data");
        fileData = response.data;
      } else {
        // Trường hợp 3: Không phải Blob (có thể là JSON lỗi)
        console.error("❌ Dữ liệu không phải Blob:", response);
        throw new Error("Dữ liệu tải về không đúng định dạng PDF");
      }

      // 3. Kiểm tra xem có phải file JSON báo lỗi không (dù header là blob)
      if (fileData.type === "application/json") {
         const text = await fileData.text();
         const jsonError = JSON.parse(text);
         console.error("❌ Lỗi từ Backend (dạng JSON):", jsonError);
         throw new Error(jsonError.message || "Lỗi khi tạo PDF từ Server");
      }

      // 4. Tạo Link tải về
      const url = window.URL.createObjectURL(fileData);
      const link = document.createElement("a");
      link.href = url;
      // Đặt tên file
      link.setAttribute("download", `doi-chieu-cong-no-${id}.pdf`);
      document.body.appendChild(link);
      link.click();

      // 5. Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    },
    onSuccess: () => toast.success("Đã tải xuống file PDF!"),
    onError: (error: any) => {
      console.error("❌ Lỗi xuất PDF:", error);
      toast.error(error.message || "Xuất PDF thất bại!");
    },
  });
}

/**
 * Gửi Email
 */
export function useSendReconciliationEmail() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: SendReconciliationEmailDto }) => {
      const response = await api.post(
        `/debt-reconciliation/${id}/send-email`,
        data
      );
      return response.data;
    },
    onSuccess: () => toast.success("Đã gửi email!"),
    onError: (error: any) => toast.error(error?.response?.data?.message || "Gửi email thất bại!"),
  });
}