/**
 * Inventory & Warehouse Types - Dựa trên database schema
 */

import type { BaseEntity, Status } from "./common.types";
import type { Product } from "./product.types";
import type { User } from "./user.types";

// Warehouse Type
export type WarehouseType = "raw_material" | "packaging" | "finished_product" | "goods";

// Transaction Type
export type TransactionType = "import" | "export" | "transfer" | "disposal" | "stocktake";

// Transaction Status
export type TransactionStatus = "draft" | "pending" | "approved" | "completed" | "cancelled";

// Transfer Status
export type TransferStatus = "pending" | "in_transit" | "completed" | "cancelled";

// Warehouse
export interface Warehouse extends BaseEntity {
  warehouseCode: string;
  warehouseName: string;
  warehouseType: WarehouseType;
  address?: string;
  city?: string;
  region?: string;
  description?: string;
  managerId?: number;
  manager?: User;
  capacity?: number;
  status: Status;
  created_by?: number;
  updated_by?: number;
}

// Inventory
export interface Inventory extends BaseEntity {
  warehouseId: number;
  warehouse?: Warehouse;
  productId: number;
  product?: Product;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  last_updated: string;
  updated_by?: number;
}

// Stock Transaction
export interface StockTransaction extends BaseEntity {
  transaction_code: string;
  transaction_type: TransactionType;
  warehouse_id?: number;
  warehouse?: Warehouse;
  source_warehouse_id?: number;
  source_warehouse?: Warehouse;
  destination_warehouse_id?: number;
  destination_warehouse?: Warehouse;
  reference_type?: string;
  reference_id?: number;
  total_value?: number;
  reason?: string;
  notes?: string;
  status: TransactionStatus;
  approved_by?: number;
  approver?: User;
  cancelled_by?: number;
  canceller?: User;
  approved_at?: string;
  cancelled_at?: string;
  details?: StockTransactionDetail[];
  created_by?: number;
  updated_by?: number;
}

// Stock Transaction Detail
export interface StockTransactionDetail extends BaseEntity {
  transaction_id: number;
  transaction?: StockTransaction;
  product_id: number;
  product?: Product;
  warehouse_id?: number;
  warehouse?: Warehouse;
  batch_number?: string;
  quantity: number;
  unit_price?: number;
  total_price?: number;
  expiry_date?: string;
  notes?: string;
}

// Stock Transfer
export interface StockTransfer extends BaseEntity {
  transfer_code: string;
  from_warehouse_id: number;
  from_warehouse?: Warehouse;
  to_warehouse_id: number;
  to_warehouse?: Warehouse;
  transfer_date: string;
  total_value?: number;
  reason?: string;
  status: TransferStatus;
  requested_by?: number;
  requester?: User;
  approved_by?: number;
  approver?: User;
  cancelled_by?: number;
  canceller?: User;
  approved_at?: string;
  cancelled_at?: string;
  details?: StockTransferDetail[];
  created_by?: number;
  updated_by?: number;
}

// Stock Transfer Detail
export interface StockTransferDetail extends BaseEntity {
  transfer_id: number;
  transfer?: StockTransfer;
  product_id: number;
  product?: Product;
  quantity: number;
  unit_price?: number;
  total_price?: number;
  notes?: string;
}

// Purchase Order
export interface PurchaseOrder extends BaseEntity {
  po_code: string;
  supplier_id: number;
  supplier?: any; // Supplier type
  warehouse_id: number;
  warehouse?: Warehouse;
  order_date: string;
  expected_delivery_date?: string;
  total_amount: number;
  status: "pending" | "approved" | "received" | "cancelled";
  notes?: string;
  approved_by?: number;
  approver?: User;
  details?: PurchaseOrderDetail[];
  created_by?: number;
  updated_by?: number;
}

// Purchase Order Detail
export interface PurchaseOrderDetail extends BaseEntity {
  po_id: number;
  po?: PurchaseOrder;
  product_id: number;
  product?: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

// Create Transaction DTO
export interface CreateTransactionDto {
  transaction_type: TransactionType;
  warehouse_id?: number;
  source_warehouse_id?: number;
  destination_warehouse_id?: number;
  reference_type?: string;
  reference_id?: number;
  reason?: string;
  notes?: string;
  details: Array<{
    product_id: number;
    quantity: number;
    unit_price?: number;
    batch_number?: string;
    expiry_date?: string;
    notes?: string;
  }>;
}

// Inventory Adjustment DTO
export interface InventoryAdjustmentDto {
  warehouse_id: number;
  product_id: number;
  quantity_change: number;
  reason: string;
  notes?: string;
}

// Inventory Filters
export interface InventoryFilters {
  warehouse_id?: number;
  warehouse_type?: WarehouseType;
  product_id?: number;
  product_type?: string;
  category_id?: number;
  low_stock?: boolean;
  out_of_stock?: boolean;
}

// Low Stock Alert
export interface LowStockAlert {
  product_id: number;
  product: Product;
  warehouse_id: number;
  warehouse: Warehouse;
  current_quantity: number;
  min_stock_level: number;
  shortage: number;
}

// Inventory By Product Response
export interface InventoryByProductResponse {
  product: {
    id: number;
    sku: string;
    productName: string;
    productType: string;
    unit: string;
    minStockLevel?: number;
  };
  warehouses: Array<Inventory & {
    availableQuantity: number;
  }>;
  summary: {
    totalQuantity: number;
    totalReserved: number;
    totalAvailable: number;
    warehouseCount: number;
  };
}

// Warehouse Statistics
export interface WarehouseStatistics {
  warehouseId: number;
  warehouseName: string;
  warehouseType: WarehouseType;
  inventory: {
    totalProducts: number;
    totalQuantity: number;
    reservedQuantity: number;
    availableQuantity: number;
  };
  transactions: {
    last30Days: Record<string, number>;
  };
  capacity: {
    total: number | null;
    used: number;
    available: number | null;
    utilizationPercent: number | null;
  };
}
