import { BaseEntity } from "./common.types";
import { Product } from "./product.types";
import { User } from "./user.types";
import { Warehouse } from "./warehouse.types";

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