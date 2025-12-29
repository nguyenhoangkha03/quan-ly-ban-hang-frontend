import type { BaseEntity } from "./common.types";
import type { Customer } from "./customer.types";
import type { User } from "./user.types"; // User ở đây là Nhân viên (Admin)

// --- ENUMS ---
export type ReconciliationType = "monthly" | "quarterly" | "yearly";
export type ReconciliationStatus = "pending" | "confirmed" | "disputed";

// --- ENTITY (Dữ liệu hiển thị - Output từ Server) ---
export interface DebtReconciliation extends BaseEntity {
  reconciliationCode: string;
  reconciliationType: ReconciliationType;
  period: string; // Ví dụ: "202412"
  
  // 1. Đối tượng (Khách hàng/NCC)
  customerId?: number;
  customer?: Customer; // Để hiện tên khách hàng: customer.customerName
  
  supplierId?: number;
  supplier?: any; // Supplier Type
  
  // 2. Số liệu (Backend trả về, FE chỉ hiển thị)
  openingBalance: number;
  transactionsAmount: number;
  paymentAmount: number;
  closingBalance: number;
  
  // 3. Trạng thái & Sai lệch
  status: ReconciliationStatus;
  discrepancyAmount: number;
  discrepancyReason?: string | null;
  reconciliationDate: string; // ISO String
  
  // 4. Thông tin xác nhận (Phía khách hàng xác nhận)
  confirmedByName?: string | null;
  confirmedByEmail?: string | null;
  confirmedAt?: string | null;
  
  notes?: string | null;
  
  // 5. Audit (Nhân viên thao tác)
  createdBy: number;
  creator?: User; // Để hiện: "Tạo bởi: Nguyễn Văn A"
  
  approvedBy?: number;
  approver?: User; // Để hiện: "Duyệt bởi: Trần Thị B"
  approvedAt?: string | null;
}

// --- STATS (Thống kê cho Dashboard Admin) ---
export interface DebtReconciliationSummary {
  totalReconciliations: number;
  byStatus: {
    pending: number;
    confirmed: number;
    disputed: number;
  };
  totalDiscrepancy: number;
}

// --- FILTERS (Bộ lọc Admin) ---
export interface DebtReconciliationParams {
  page?: number;
  limit?: number;
  search?: string; // Tìm theo mã phiếu, tên khách, tên nhân viên tạo
  
  customerId?: number; // Lọc theo khách cụ thể
  supplierId?: number;
  
  reconciliationType?: ReconciliationType;
  status?: ReconciliationStatus;
  period?: string;
  
  fromDate?: string;
  toDate?: string;
  
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// --- DTOs (Dữ liệu gửi lên Server - Input) ---
// 👇 Đây là phần bạn đang thiếu để hooks hoạt động

// 1. Tạo mới
export interface CreateDebtReconciliationDto {
  reconciliationType: ReconciliationType;
  period: string;
  customerId?: number;
  supplierId?: number;
  reconciliationDate: string | Date; // Hook có thể gửi Date hoặc ISO string
  notes?: string;
}

// 2. Cập nhật (Sửa ghi chú)
export interface UpdateDebtReconciliationDto {
  notes?: string | null;
  // Các trường khác nếu backend cho phép sửa
}

// 3. Xác nhận
export interface ConfirmReconciliationDto {
  confirmedByName: string;
  confirmedByEmail: string;
  notes?: string | null;
  discrepancyReason?: string | null;
}

// 4. Báo cáo sai lệch
export interface DisputeReconciliationDto {
  reason: string; // Backend chờ body: { reason: "..." }
  notes?: string;
}

// 5. Gửi Email
export interface SendReconciliationEmailDto {
  recipientName: string;
  recipientEmail: string;
  message?: string;
}