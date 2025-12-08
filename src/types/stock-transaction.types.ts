import { BaseEntity } from "./common.types";
import { Product } from "./product.types";
import { User } from "./user.types";
import { Warehouse } from "./warehouse.types";

// Transaction Type
export type TransactionType = "import" | "export" | "transfer" | "disposal" | "stocktake";

// Transaction Status
export type TransactionStatus = "draft" | "pending" | "approved" | "completed" | "cancelled";

// Transfer Status
export type TransferStatus = "pending" | "in_transit" | "completed" | "cancelled";

// Stock Transaction
export interface StockTransaction extends BaseEntity {
  transactionCode: string;
  transactionType: TransactionType;
  warehouseId?: number;
  warehouse?: Warehouse;
  sourceWarehouseId?: number;
  sourceWarehouse?: Warehouse;
  destinationWarehouseId?: number;
  destinationWarehouse?: Warehouse;
  referenceType?: string;
  referenceId?: number;
  totalValue?: number;
  reason?: string;
  notes?: string;
  status: TransactionStatus;
  approvedBy?: number;
  approver?: User;
  cancelledBy?: number;
  canceller?: User;
  approvedAt?: string;
  cancelledAt?: string;
  details?: StockTransactionDetail[];
  createdBy?: number;
  updatedBy?: number;
}

// Stock Transaction Detail
export interface StockTransactionDetail extends BaseEntity {
  transactionId: number;
  transaction?: StockTransaction;
  productId: number;
  product?: Product;
  warehouseId?: number;
  warehouse?: Warehouse;
  batchNumber?: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  expiryDate?: string;
  notes?: string;
}

// Create Transaction DTO
export interface CreateTransactionDto {
  transactionType: TransactionType;
  warehouseId?: number;
  sourceWarehouseId?: number;
  destinationWarehouseId?: number;
  referenceType?: string;
  referenceId?: number;
  reason?: string;
  notes?: string;
  details: Array<{
    productId: number;
    quantity: number;
    unitPrice?: number;
    batchNumber?: string;
    expiryDate?: string;
    notes?: string;
  }>;
}