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
  creator: User;
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

export interface TransactionItem {
  productId?: number;
  product?: Product;
  warehouseId?: number;
  quantity: number;
  unitPrice?: number;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

export interface TransactionItemsProps {
  items: TransactionItem[];
  products?: Product[]; 
  type?: TransactionType;
  onUpdateItem: (index: number, updates: Partial<TransactionItem>) => void;
  onRemoveItem: (index: number) => void;
  showPrice?: boolean;
  showBatchNumber?: boolean;
  showExpiryDate?: boolean;
  showNotes?: boolean;
  readonly?: boolean;
}

// Stock Transaction Filters
export interface StockTransactionFilters {
  transactionType?: "import" | "export" | "transfer" | "disposal" | "stocktake";
  warehouseId?: number;
  productId?: number;
  status?: "draft" | "pending" | "approved" | "completed" | "cancelled";
  fromDate?: string;
  toDate?: string;
}