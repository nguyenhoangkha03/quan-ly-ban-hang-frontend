import type { BaseEntity } from "./common.types";
import type { Bom } from "./bom.types";
import type { Product } from "./product.types";
import type { AuthUser } from "./user.types";
import { Warehouse } from "./warehouse.types";

// Production Status
export type ProductionStatus = "pending" | "in_progress" | "completed" | "cancelled";

// Material Type
export type MaterialType = "raw_material" | "packaging";

// Production Order Material
export interface ProductionOrderMaterial extends BaseEntity {
  productionOrderId: number;
  materialId: number;
  material?: Product;
  plannedQuantity: number;
  actualQuantity: number;
  wastage: number;
  unitPrice: number;
  materialType: MaterialType;
  stockTransactionId?: number;
  notes?: string;
}

// Production Order
export interface ProductionOrder extends BaseEntity {
  orderCode: string;
  bomId: number;
  bom?: Bom;
  finishedProductId: number;
  finishedProduct?: Product;
  warehouseId?: number;
  warehouse?: Warehouse;
  plannedQuantity: number;
  actualQuantity: number;
  productionCost: number;
  startDate: string;
  endDate?: string;
  status: ProductionStatus;
  notes?: string;
  createdBy: number;
  creator?: AuthUser;
  approvedBy?: number;
  approver?: AuthUser;
  cancelledBy?: number;
  canceller?: AuthUser;
  approvedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  materials?: ProductionOrderMaterial[];
  materialAvailability: {
    missingItems: {
      available: number;
      materialId: number;
      materialName: string;
      missing: number
      required: number
      unit: string
    }[]
    status: string
  }
}

// Production Order Filters
export interface ProductionOrderFilters {
  status?: ProductionStatus | ProductionStatus[];
  bomId?: number;
  sortBy?: "startDate" | "endDate" | "createdAt";
  limit?: number;
  finishedProductId?: number;
  warehouseId?: number;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  sortOrder?: "asc" | "desc";
}

// Material Shortage Alert
export interface MaterialShortage {
  materialId: number;
  materialName: string;
  materialType: MaterialType;
  required: number;
  available: number;
  shortage: number;
  unit: string;
}

// Wastage Report
export interface WastageReport {
  productionOrderId: number;
  orderCode: string;
  finishedProduct: string;
  plannedQuantity: number;
  actualQuantity: number;
  quantityDifference: number;
  materials: {
    materialId: number;
    materialName: string;
    materialType: MaterialType;
    plannedQuantity: number;
    actualQuantity: number;
    wastage: number;
    wastagePercentage: number;
    unit: string;
    unitPrice: number;
    wastageValue: number;
  }[];
  totalWastageValue: number;
  efficiencyRate: number;
}

// Production Timeline Event
export interface ProductionTimelineEvent {
  id: string;
  type: "created" | "started" | "completed" | "cancelled" | "updated";
  timestamp: string;
  user?: AuthUser;
  description: string;
  details?: any;
}
