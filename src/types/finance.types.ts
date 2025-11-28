/**
 * Finance Types - Payment Receipts & Vouchers
 * Phiếu thu và phiếu chi
 */

import type { BaseEntity } from "./common.types";
import type { Customer } from "./customer.types";
import type { SalesOrder } from "./sales.types";
import type { User } from "./user.types";

// =====================================================
// PAYMENT RECEIPTS (Phiếu thu)
// =====================================================

// Receipt Type
export type ReceiptType = "sales" | "debt_collection" | "refund" | "other";

// Payment Method (for receipts)
export type ReceiptPaymentMethod = "cash" | "transfer" | "card";

// Payment Receipt
export interface PaymentReceipt extends BaseEntity {
  receiptCode: string;
  receiptType: ReceiptType;
  customerId: number;
  customer?: Customer;
  orderId?: number;
  order?: SalesOrder;
  amount: number;
  paymentMethod: ReceiptPaymentMethod;
  bankName?: string;
  transactionReference?: string;
  receiptDate: string;
  approvedBy?: number;
  approver?: User;
  approvedAt?: string;
  isPosted: boolean;
  notes?: string;
  createdBy: number;
  creator?: User;
}

// Create Payment Receipt DTO
export interface CreatePaymentReceiptDto {
  receiptType: ReceiptType;
  customerId: number;
  orderId?: number;
  amount: number;
  paymentMethod: ReceiptPaymentMethod;
  bankName?: string;
  transactionReference?: string;
  receiptDate: string;
  notes?: string;
}

// Update Payment Receipt DTO
export interface UpdatePaymentReceiptDto {
  receiptType?: ReceiptType;
  customerId?: number;
  orderId?: number;
  amount?: number;
  paymentMethod?: ReceiptPaymentMethod;
  bankName?: string;
  transactionReference?: string;
  receiptDate?: string;
  notes?: string;
}

// Approve Receipt DTO
export interface ApproveReceiptDto {
  notes?: string;
}

// Payment Receipt Filters
export interface PaymentReceiptFilters {
  receiptType?: ReceiptType | ReceiptType[];
  customerId?: number;
  orderId?: number;
  paymentMethod?: ReceiptPaymentMethod | ReceiptPaymentMethod[];
  isPosted?: boolean;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

// Payment Receipt Statistics
export interface PaymentReceiptStatistics {
  totalReceipts: number;
  totalAmount: number;
  cashAmount: number;
  transferAmount: number;
  cardAmount: number;
  approvedReceipts: number;
  pendingReceipts: number;
}

// =====================================================
// PAYMENT VOUCHERS (Phiếu chi)
// =====================================================

// Voucher Type
export type VoucherType = "salary" | "operating_cost" | "supplier_payment" | "refund" | "other";

// Payment Method (for vouchers) - only cash and transfer
export type VoucherPaymentMethod = "cash" | "transfer";

// Payment Voucher
export interface PaymentVoucher extends BaseEntity {
  voucherCode: string;
  voucherType: VoucherType;
  supplierId?: number;
  supplier?: any; // Supplier type
  expenseAccount?: string; // Mã tài khoản chi phí kế toán
  amount: number;
  paymentMethod: VoucherPaymentMethod;
  bankName?: string;
  paymentDate: string;
  approvedBy?: number;
  approver?: User;
  approvedAt?: string;
  isPosted: boolean;
  notes?: string;
  createdBy: number;
  creator?: User;
}

// Create Payment Voucher DTO
export interface CreatePaymentVoucherDto {
  voucherType: VoucherType;
  supplierId?: number;
  expenseAccount?: string;
  amount: number;
  paymentMethod: VoucherPaymentMethod;
  bankName?: string;
  paymentDate: string;
  notes?: string;
}

// Update Payment Voucher DTO
export interface UpdatePaymentVoucherDto {
  voucherType?: VoucherType;
  supplierId?: number;
  expenseAccount?: string;
  amount?: number;
  paymentMethod?: VoucherPaymentMethod;
  bankName?: string;
  paymentDate?: string;
  notes?: string;
}

// Approve Voucher DTO
export interface ApproveVoucherDto {
  notes?: string;
}

// Payment Voucher Filters
export interface PaymentVoucherFilters {
  voucherType?: VoucherType | VoucherType[];
  supplierId?: number;
  paymentMethod?: VoucherPaymentMethod | VoucherPaymentMethod[];
  isPosted?: boolean;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

// Payment Voucher Statistics
export interface PaymentVoucherStatistics {
  totalVouchers: number;
  totalAmount: number;
  cashAmount: number;
  transferAmount: number;
  cardAmount: number;
  approvedVouchers: number;
  pendingVouchers: number;
}

// =====================================================
// CASH FUND (Quỹ tiền mặt)
// =====================================================

export interface CashFund extends BaseEntity {
  fundDate: string;
  openingBalance: number;
  totalReceipts: number;
  totalPayments: number;
  closingBalance: number;
  actualBalance?: number;
  discrepancy?: number;
  isLocked: boolean;
  lockedBy?: number;
  locker?: User;
  lockedAt?: string;
  notes?: string;
}

// =====================================================
// DEBT RECONCILIATION (Đối chiếu công nợ)
// =====================================================

export type ReconciliationType = "monthly" | "quarterly" | "yearly";
export type ReconciliationStatus = "pending" | "confirmed" | "disputed";

export interface DebtReconciliation extends BaseEntity {
  reconciliationCode: string;
  reconciliationType: ReconciliationType;
  period: string; // YYYYMM, YYYYQX, YYYY
  customerId?: number;
  customer?: Customer;
  supplierId?: number;
  supplier?: any; // Supplier type
  openingBalance: number;
  transactionsAmount: number;
  paymentAmount: number;
  closingBalance: number;
  discrepancyAmount: number;
  discrepancyReason?: string;
  status: ReconciliationStatus;
  reconciliationDate: string;
  confirmedByName?: string;
  confirmedByEmail?: string;
  confirmedAt?: string;
  attachmentUrl?: string;
  notes?: string;
  approvedBy?: number;
  approver?: User;
  approvedAt?: string;
  createdBy: number;
  creator?: User;
}

// Create Debt Reconciliation DTO
export interface CreateDebtReconciliationDto {
  reconciliationType: ReconciliationType;
  period: string;
  customerId?: number;
  supplierId?: number;
  reconciliationDate: string;
  notes?: string;
}

// Update Debt Reconciliation DTO
export interface UpdateDebtReconciliationDto {
  discrepancyReason?: string;
  notes?: string;
}

// Confirm Reconciliation DTO
export interface ConfirmReconciliationDto {
  confirmedByName: string;
  confirmedByEmail: string;
  notes?: string;
}

// Dispute Reconciliation DTO
export interface DisputeReconciliationDto {
  discrepancyReason: string;
  notes?: string;
}

// Debt Reconciliation Filters
export interface DebtReconciliationFilters {
  reconciliationType?: ReconciliationType | ReconciliationType[];
  customerId?: number;
  supplierId?: number;
  status?: ReconciliationStatus | ReconciliationStatus[];
  period?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

// Debt Reconciliation Statistics
export interface DebtReconciliationStatistics {
  totalReconciliations: number;
  pendingReconciliations: number;
  confirmedReconciliations: number;
  disputedReconciliations: number;
  totalDiscrepancy: number;
}
