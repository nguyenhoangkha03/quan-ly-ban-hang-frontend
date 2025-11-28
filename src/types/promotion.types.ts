/**
 * Promotion Types
 * Types for promotions management
 */

import type { BaseEntity } from "./common.types";
import type { User } from "./user.types";
import type { Product } from "./product.types";

// =====================================================
// ENUMS
// =====================================================

export type PromotionType = "percent_discount" | "fixed_discount" | "buy_x_get_y" | "gift";

export type PromotionStatus = "pending" | "active" | "expired" | "cancelled";

export type ApplicableTo = "all" | "category" | "product_group" | "specific_product" | "customer_group";

// =====================================================
// MAIN TYPES
// =====================================================

/**
 * Promotion Conditions
 * Stored as JSON in database
 */
export interface PromotionConditions {
  // Time-based conditions
  daysOfWeek?: number[]; // [0-6] Sunday-Saturday
  timeSlots?: {
    start: string; // HH:mm format
    end: string;
  }[];

  // Customer conditions
  customerTypes?: string[]; // Customer classifications
  excludedCustomers?: number[]; // Customer IDs to exclude

  // Product conditions
  categoryIds?: number[];
  productGroupIds?: number[];
  excludedProductIds?: number[];

  // Quantity conditions
  minQuantityPerProduct?: number;
  maxQuantityPerProduct?: number;

  // Buy X Get Y specific
  buyQuantity?: number; // X
  getQuantity?: number; // Y

  // Additional conditions
  requiresCouponCode?: boolean;
  couponCode?: string;
  stackable?: boolean; // Can combine with other promotions

  // Custom conditions (flexible)
  [key: string]: any;
}

/**
 * Promotion Entity
 */
export interface Promotion extends BaseEntity {
  promotionCode: string;
  promotionName: string;
  promotionType: PromotionType;
  discountValue: number; // Percentage or fixed amount
  maxDiscountValue?: number; // Max discount for percentage type
  startDate: string;
  endDate: string;
  isRecurring: boolean;
  applicableTo: ApplicableTo;
  minOrderValue: number;
  minQuantity: number;
  conditions?: PromotionConditions | null;
  quantityLimit?: number;
  usageCount: number;
  status: PromotionStatus;

  // Relationships
  createdBy: number;
  creator?: User;
  approvedBy?: number;
  approver?: User;
  approvedAt?: string;
  cancelledBy?: number;
  canceller?: User;
  cancelledAt?: string;

  // Related products
  products?: PromotionProduct[];
}

/**
 * Promotion Product
 * Products applicable to promotion
 */
export interface PromotionProduct {
  id: number;
  promotionId: number;
  productId: number;
  product?: Product;
  discountValueOverride?: number; // Override default discount for this product
  minQuantity: number; // Min quantity for this product
  giftProductId?: number; // Gift product ID (for buy_x_get_y or gift)
  giftProduct?: Product;
  giftQuantity: number;
  note?: string;
}

// =====================================================
// DTOs
// =====================================================

/**
 * Create Promotion DTO
 */
export interface CreatePromotionDto {
  promotionCode: string;
  promotionName: string;
  promotionType: PromotionType;
  discountValue: number;
  maxDiscountValue?: number;
  startDate: string;
  endDate: string;
  isRecurring?: boolean;
  applicableTo: ApplicableTo;
  minOrderValue?: number;
  minQuantity?: number;
  conditions?: PromotionConditions;
  quantityLimit?: number;

  // Products
  products?: CreatePromotionProductDto[];
}

/**
 * Create Promotion Product DTO
 */
export interface CreatePromotionProductDto {
  productId: number;
  discountValueOverride?: number;
  minQuantity?: number;
  giftProductId?: number;
  giftQuantity?: number;
  note?: string;
}

/**
 * Update Promotion DTO
 */
export interface UpdatePromotionDto {
  promotionName?: string;
  discountValue?: number;
  maxDiscountValue?: number;
  startDate?: string;
  endDate?: string;
  isRecurring?: boolean;
  applicableTo?: ApplicableTo;
  minOrderValue?: number;
  minQuantity?: number;
  conditions?: PromotionConditions;
  quantityLimit?: number;

  // Products
  products?: CreatePromotionProductDto[];
}

/**
 * Approve Promotion DTO
 */
export interface ApprovePromotionDto {
  notes?: string;
}

/**
 * Cancel Promotion DTO
 */
export interface CancelPromotionDto {
  reason: string;
}

/**
 * Apply Promotion DTO
 * For testing if promotion applies to an order
 */
export interface ApplyPromotionDto {
  orderId?: number;
  customerId?: number;
  orderValue: number;
  products: {
    productId: number;
    quantity: number;
    price: number;
  }[];
}

/**
 * Apply Promotion Result
 */
export interface ApplyPromotionResult {
  applicable: boolean;
  reason?: string;
  discountAmount: number;
  finalAmount: number;
  giftProducts?: {
    productId: number;
    quantity: number;
  }[];
}

// =====================================================
// FILTERS
// =====================================================

/**
 * Promotion Filters
 */
export interface PromotionFilters {
  promotionType?: PromotionType | PromotionType[];
  status?: PromotionStatus | PromotionStatus[];
  applicableTo?: ApplicableTo | ApplicableTo[];
  fromDate?: string;
  toDate?: string;
  search?: string; // Search by code or name
  isRecurring?: boolean;
  hasProducts?: boolean;
}

// =====================================================
// STATISTICS
// =====================================================

/**
 * Promotion Statistics
 */
export interface PromotionStatistics {
  totalPromotions: number;
  activePromotions: number;
  pendingPromotions: number;
  expiredPromotions: number;
  totalUsage: number;
  totalDiscountAmount: number; // Total discount given (if tracked)
  averageDiscountPerOrder?: number;
}

// =====================================================
// HELPERS
// =====================================================

/**
 * Promotion Type Labels
 */
export const PROMOTION_TYPE_LABELS: Record<PromotionType, string> = {
  percent_discount: "Giảm theo %",
  fixed_discount: "Giảm cố định",
  buy_x_get_y: "Mua X tặng Y",
  gift: "Tặng quà",
};

/**
 * Promotion Status Labels
 */
export const PROMOTION_STATUS_LABELS: Record<PromotionStatus, string> = {
  pending: "Chờ duyệt",
  active: "Đang hoạt động",
  expired: "Đã hết hạn",
  cancelled: "Đã hủy",
};

/**
 * Applicable To Labels
 */
export const APPLICABLE_TO_LABELS: Record<ApplicableTo, string> = {
  all: "Tất cả sản phẩm",
  category: "Theo danh mục",
  product_group: "Theo nhóm sản phẩm",
  specific_product: "Sản phẩm cụ thể",
  customer_group: "Theo nhóm khách hàng",
};

/**
 * Days of Week Labels
 */
export const DAYS_OF_WEEK: Record<number, string> = {
  0: "Chủ nhật",
  1: "Thứ 2",
  2: "Thứ 3",
  3: "Thứ 4",
  4: "Thứ 5",
  5: "Thứ 6",
  6: "Thứ 7",
};
