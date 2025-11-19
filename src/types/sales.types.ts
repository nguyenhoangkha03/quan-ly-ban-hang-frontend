/**
 * Sales Types - Dựa trên database schema
 */

import type { BaseEntity, EntityWithUser } from "./common.types";
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

// Sales Channel
export type SalesChannel = "store" | "online" | "phone" | "social_media" | "distributor";

// Sales Order
export interface SalesOrder extends EntityWithUser {
  order_code: string;
  customer_id: number;
  customer?: Customer;
  warehouse_id?: number;
  warehouse?: Warehouse;
  order_date: string;
  sales_channel: SalesChannel;
  delivery_address?: string;
  delivery_city?: string;
  delivery_region?: string;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  shipping_fee: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  paid_amount: number;
  debt_amount: number;
  status: OrderStatus;
  notes?: string;
  approved_by?: number;
  approver?: User;
  cancelled_by?: number;
  canceller?: User;
  approved_at?: string;
  cancelled_at?: string;
  details?: SalesOrderDetail[];
  delivery?: Delivery;
}

// Sales Order Detail
export interface SalesOrderDetail extends BaseEntity {
  order_id: number;
  order?: SalesOrder;
  product_id: number;
  product?: Product;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
}

// Delivery
export interface Delivery extends EntityWithUser {
  order_id: number;
  order?: SalesOrder;
  delivery_staff_id?: number;
  delivery_staff?: User;
  delivery_date?: string;
  delivery_address: string;
  delivery_city?: string;
  delivery_region?: string;
  recipient_name?: string;
  recipient_phone?: string;
  status: DeliveryStatus;
  proof_image_url?: string;
  delivered_at?: string;
  failed_reason?: string;
  notes?: string;
}

// Create Sales Order DTO
export interface CreateSalesOrderDto {
  customer_id: number;
  warehouse_id?: number;
  sales_channel: SalesChannel;
  delivery_address?: string;
  delivery_city?: string;
  delivery_region?: string;
  shipping_fee?: number;
  payment_method: PaymentMethod;
  paid_amount?: number;
  notes?: string;
  details: Array<{
    product_id: number;
    quantity: number;
    unit_price: number;
    discount_percent?: number;
    discount_amount?: number;
    tax_rate?: number;
  }>;
}

// Update Sales Order DTO
export interface UpdateSalesOrderDto {
  delivery_address?: string;
  delivery_city?: string;
  delivery_region?: string;
  shipping_fee?: number;
  payment_method?: PaymentMethod;
  notes?: string;
}

// Add Payment DTO
export interface AddPaymentDto {
  order_id: number;
  amount: number;
  payment_method: PaymentMethod;
  notes?: string;
}

// Sales Order Filters
export interface SalesOrderFilters {
  customer_id?: number;
  status?: OrderStatus | OrderStatus[];
  payment_status?: PaymentStatus | PaymentStatus[];
  sales_channel?: SalesChannel;
  payment_method?: PaymentMethod;
  from_date?: string;
  to_date?: string;
  warehouse_id?: number;
  sales_staff_id?: number;
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
  product_id: number;
  product: Product;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
}
