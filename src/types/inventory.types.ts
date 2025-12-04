import type { BaseEntity } from "./common.types";
import type { Product } from "./product.types";
import type { User } from "./user.types";
import { Warehouse, WarehouseType } from "./warehouse.types";

// Transaction Type
export type TransactionType = "import" | "export" | "transfer" | "disposal" | "stocktake";

// Transaction Status
export type TransactionStatus = "draft" | "pending" | "approved" | "completed" | "cancelled";

// Transfer Status
export type TransferStatus = "pending" | "in_transit" | "completed" | "cancelled";

// Inventory Interface
export interface Inventory extends BaseEntity {
  warehouseId: number;
  warehouse?: Warehouse;
  productId: number;
  product?: Product;
  quantity: number;
  reservedQuantity: number;
  lastUpdated: string;
  updatedBy?: number;
}

// Stock Transaction
export interface StockTransaction extends BaseEntity {
  transactioncode: string;
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

// Stock Transfer
export interface StockTransfer extends BaseEntity {
  transferCode: string;
  fromWarehouseId: number;
  fromWarehouse?: Warehouse;
  toWarehouseId: number;
  toWarehouse?: Warehouse;
  transferDate: string;
  totalValue?: number;
  reason?: string;
  status: TransferStatus;
  requestedBy?: number;
  requester?: User;
  approvedBy?: number;
  approver?: User;
  cancelledBy?: number;
  canceller?: User;
  approvedAt?: string;
  cancelledAt?: string;
  details?: StockTransferDetail[];
  createdBy?: number;
  updatedBy?: number;
}

// Stock Transfer Detail
export interface StockTransferDetail extends BaseEntity {
  transferId: number;
  transfer?: StockTransfer;
  productId: number;
  product?: Product;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  notes?: string;
}

// Purchase Order
export interface PurchaseOrder extends BaseEntity {
  poCode: string;
  supplierId: number;
  supplier?: any; 
  warehouseId: number;
  warehouse?: Warehouse;
  orderDate: string;
  expectedDeliveryDate?: string;
  totalAmount: number;
  status: "pending" | "approved" | "received" | "cancelled";
  notes?: string;
  approvedBy?: number;
  approver?: User;
  details?: PurchaseOrderDetail[];
  createdBy?: number;
  updatedBy?: number;
}

// Purchase Order Detail
export interface PurchaseOrderDetail extends BaseEntity {
  poId: number;
  po?: PurchaseOrder;
  productId: number;
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
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

// Inventory Adjustment DTO
export interface InventoryAdjustmentDto {
  warehouseId: number;
  productId: number;
  quantityChange: number;
  reason: string;
  notes?: string;
}

// Inventory Filters
export interface InventoryFilters {
  warehouseId?: number;
  warehouseType?: WarehouseType;
  productId?: number;
  productType?: string;
  categoryId?: number;
  lowStock?: boolean;
  outOfStock?: boolean;
}

// Inventory Alert (Low Stock) - Matches backend response exactly
export interface InventoryAlert {
  id: number;
  warehouseId: number;
  productId: number;
  quantity: number;
  reservedQuantity: number;
  warehouse: {
    id: number;
    warehouseName: string;
    warehouseCode: string;
    warehouseType: WarehouseType;
  };
  product: {
    id: number;
    sku: string;
    productName: string;
    productType: string;
    unit: string;
    minStockLevel: number;
    category?: {
      id: number;
      categoryName: string;
    };
  };
  availableQuantity: number;  // Calculated: quantity - reservedQuantity
  shortfall: number;          // Calculated: minStockLevel - availableQuantity
  percentageOfMin: number;    // Calculated: (availableQuantity / minStockLevel) * 100
}

export interface AlertFilters {
  warehouseId?: number;
}

// Alerts API Response
export interface AlertsApiResponse {
  alerts: InventoryAlert[];
  summary: {
    totalAlerts: number;
    outOfStock: number; // availableQuantity === 0
    critical: number;   // 0 < availableQuantity < 25%
    warning: number;    // 25% <= percentage < 50%
    low: number;        // 50% <= percentage < 100%
  };
}

// Legacy type - kept for backward compatibility
export interface LowStockAlert {
  productId: number;
  product: Product;
  warehouseId: number;
  warehouse: Warehouse;
  currentQuantity: number;
  minStockLevel: number;
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

export interface CardStat {
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
}