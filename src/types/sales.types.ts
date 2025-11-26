/**
 * Sales Types - Dựa trên database schema
 */

import type { BaseEntity } from "./common.types";
import type { Customer } from "./customer.types";
import type { Product } from "./product.types";
import type { User } from "./user.types";
import type { Warehouse } from "./inventory.types";

// Payment Method
export type PaymentMethod = "cash" | "bank_transfer" | "credit" | "cod";

// Payment Status
export type PaymentStatus = "unpaid" | "partial" | "paid";

// Order Status
export type OrderStatus = "pending" | "approved" | "in_progress" | "completed" | "cancelled";

// Delivery Status
export type DeliveryStatus = "pending" | "in_transit" | "delivered" | "failed" | "returned";

// Settlement Status
export type SettlementStatus = "pending" | "settled";

// Sales Channel
export type SalesChannel = "retail" | "wholesale" | "online" | "distributor";

// Sales Order
export interface SalesOrder extends BaseEntity {
  orderCode: string;
  customerId: number;
  customer?: Customer;
  warehouseId?: number;
  warehouse?: Warehouse;
  orderDate: string;
  salesChannel: SalesChannel;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  shippingFee: number;
  paidAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryAddress?: string;
  notes?: string;
  createdBy: number;
  creator?: User;
  approvedBy?: number;
  approver?: User;
  cancelledBy?: number;
  canceller?: User;
  approvedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  details?: SalesOrderDetail[];
  deliveries?: Delivery[];
  paymentReceipts?: PaymentReceipt[];
}

// Sales Order Detail
export interface SalesOrderDetail extends BaseEntity {
  orderId: number;
  order?: SalesOrder;
  productId: number;
  product?: Product;
  warehouseId?: number;
  warehouse?: Warehouse;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxRate: number;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

// Delivery
export interface Delivery extends BaseEntity {
  deliveryCode: string;
  orderId: number;
  order?: SalesOrder;
  deliveryStaffId: number;
  deliveryStaff?: User;
  shippingPartner?: string;
  deliveryDate: string;
  deliveryStatus: DeliveryStatus;
  deliveryCost: number;
  codAmount: number;
  collectedAmount: number;
  receivedBy?: string;
  receivedPhone?: string;
  deliveryProof?: string;
  failureReason?: string;
  settlementStatus: SettlementStatus;
  settledBy?: number;
  settler?: User;
  notes?: string;
  settledAt?: string;
}

// Payment Receipt
export interface PaymentReceipt extends BaseEntity {
  receiptCode: string;
  orderId: number;
  order?: SalesOrder;
  customerId: number;
  customer?: Customer;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdBy: number;
  creator?: User;
}

// Create Sales Order DTO
export interface CreateSalesOrderDto {
  customerId: number;
  warehouseId?: number;
  orderDate?: string;
  salesChannel: SalesChannel;
  deliveryAddress?: string;
  shippingFee?: number;
  paymentMethod: PaymentMethod;
  paidAmount?: number;
  notes?: string;
  details: Array<{
    productId: number;
    warehouseId?: number;
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
    taxRate?: number;
    batchNumber?: string;
    expiryDate?: string;
    notes?: string;
  }>;
}

// Update Sales Order DTO
export interface UpdateSalesOrderDto {
  deliveryAddress?: string;
  shippingFee?: number;
  paymentMethod?: PaymentMethod;
  notes?: string;
  details?: Array<{
    id?: number;
    productId: number;
    warehouseId?: number;
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
    taxRate?: number;
    batchNumber?: string;
    expiryDate?: string;
    notes?: string;
  }>;
}

// Approve Order DTO
export interface ApproveOrderDto {
  notes?: string;
}

// Cancel Order DTO
export interface CancelOrderDto {
  reason: string;
}

// Process Payment DTO
export interface ProcessPaymentDto {
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate?: string;
  notes?: string;
}

// Sales Order Filters
export interface SalesOrderFilters {
  customerId?: number;
  orderStatus?: OrderStatus | OrderStatus[];
  paymentStatus?: PaymentStatus | PaymentStatus[];
  salesChannel?: SalesChannel;
  paymentMethod?: PaymentMethod;
  fromDate?: string;
  toDate?: string;
  warehouseId?: number;
  createdBy?: number;
  search?: string;
}

// Order Summary (cho cart/checkout)
export interface OrderSummary {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
}

// Cart Item (cho tạo order)
export interface CartItem {
  productId: number;
  product: Product;
  warehouseId?: number;
  warehouse?: Warehouse;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxRate: number;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

// Inventory Shortage Warning
export interface InventoryShortage {
  productId: number;
  productName: string;
  requested: number;
  available: number;
  shortage: number;
}

// Order Statistics
export interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  paidAmount: number;
  unpaidAmount: number;
  pendingOrders: number;
  approvedOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}
