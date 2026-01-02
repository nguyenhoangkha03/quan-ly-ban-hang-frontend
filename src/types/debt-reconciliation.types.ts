import type { BaseEntity } from "./common.types";
import type { Customer } from "./customer.types";
import type { User } from "./user.types"; 

// --- ENUMS (Logic Mới) ---
// Trạng thái giờ được tính động dựa trên số dư (closingBalance)
// <= 0: paid, > 0: unpaid
export type ReconciliationStatus = "paid" | "unpaid";

// --- SUB-TYPES (Chi tiết giao dịch) ---
export interface DebtTransactionDetail {
  id: number;
  date: string; // ISO Date
  code: string; // Mã phiếu
  type: "INVOICE" | "PAYMENT"; // Hóa đơn hoặc Thanh toán
  typeLabel: string; 
  amount: number;
  isIncrease: boolean; // TRUE = Tăng nợ, FALSE = Giảm nợ
}

// --- ENTITY (Output từ Server - Khớp với mapToDTO mới) ---
export interface DebtReconciliation extends BaseEntity {
  id: number;
  reconciliationCode: string;
  period: string; // VD: "2025" (Theo năm)
  
  // 1. Đối tượng
  customerId?: number;
  customer?: Customer;
  supplierId?: number;
  supplier?: any; 
  
  assignedUser?: User; // ✅ MỚI: Người phụ trách (Sales/Accountant)

  // 2. Số liệu (Backend tính toán Real-time)
  openingBalance: number;     // Nợ đầu kỳ (Lũy kế các năm trước)
  
  transactionsAmount: number; // (+) Tổng mua trong năm
  
  // Các khoản giảm trừ
  paymentAmount: number;      // (-) Thanh toán
  returnAmount: number;       // (-) Trả hàng (MỚI)
  adjustmentAmount: number;   // (-) Điều chỉnh (MỚI)

  closingBalance: number;     // (=) Nợ cần thu cuối kỳ
  
  // 3. Trạng thái & Meta
  status: ReconciliationStatus; // 'paid' | 'unpaid'
  notes?: string | null;
  updatedAt: string;            // Dùng để hiện "Cập nhật lần cuối..."

  // 4. Chi tiết (Chỉ có khi gọi getById)
  transactions?: DebtTransactionDetail[];
}

// --- FILTERS (Input cho getAll) ---
export interface DebtReconciliationParams {
  page?: number;
  limit?: number;
  search?: string;
  
  // Lọc theo trạng thái mới
  status?: ReconciliationStatus;
  
  // Lọc theo thời gian cập nhật
  fromDate?: string;
  toDate?: string;
  
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// --- DTOs (Input cho API) ---

// 1. Tạo / Tính toán (Sync)
// Logic mới đơn giản hơn: Chỉ cần biết tính cho Ai và Năm nào
export interface CreateDebtReconciliationDto {
  customerId?: number;
  supplierId?: number;
  
  period?: string; // "2025" (Nếu không gửi, Backend tự lấy năm nay)
  notes?: string;
  
  assignedUserId?: number;
}


// 2. Gửi Email (Nếu dùng)
export interface SendReconciliationEmailDto {
  recipientName: string;
  recipientEmail: string;
  message?: string;
}

// 3. Stats (Nếu cần hiển thị Dashboard)
export interface DebtReconciliationSummary {
  totalReconciliations: number;
  byStatus: {
    paid: number;
    unpaid: number;
  };
  totalDiscrepancy: number;
}